// Portfolio service — calculates live portfolio value from wallet balances + market prices
import { createClient } from "@/lib/supabase/client";
import { getBatchPrices, getBybitPrices, getMarketAssets } from "./market";
import type { PortfolioSummary, PortfolioAsset, WalletBalance, SupportedAsset } from "@/types/database";

export async function getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
  const supabase = createClient();

  // Fetch wallets
  const { data: wallets } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", userId);

  if (!wallets?.length) {
    return { total_usd: 0, change_24h_usd: 0, change_24h_pct: 0, assets: [] };
  }

  const walletIds = wallets.map((w) => w.id);

  // Fetch balances + assets
  const { data: balances } = await supabase
    .from("wallet_balances")
    .select("wallet_id, asset_id, balance")
    .in("wallet_id", walletIds);

  if (!balances?.length) {
    // If we're in demo/mock mode, return a sample portfolio instead of empty
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("your-project")) {
      const mockPort: PortfolioSummary = {
        total_usd: 52_811.63,
        change_24h_usd: 1_348.22,
        change_24h_pct: 2.62,
        assets: [
          {
            asset: { id: "bitcoin",  symbol: "btc", name: "Bitcoin",  is_active: true, created_at: "" },
            balance: 0.45, price_usd: 93_412.50, value_usd: 42_035.63, change_24h_pct: 1.84
          },
          {
            asset: { id: "ethereum", symbol: "eth", name: "Ethereum", is_active: true, created_at: "" },
            balance: 2.5,  price_usd: 3_452.80,   value_usd: 8_632.00,  change_24h_pct: -0.82
          },
          {
            asset: { id: "solana",   symbol: "sol", name: "Solana",   is_active: true, created_at: "" },
            balance: 10.0, price_usd: 178.32,      value_usd: 1_783.20,  change_24h_pct: 3.21
          },
          {
            asset: { id: "tether",   symbol: "usdt",name: "Tether",   is_active: true, created_at: "" },
            balance: 361.0, price_usd: 1.00,       value_usd: 361.00,    change_24h_pct: 0.01
          },
        ]
      };
      return mockPort;
    }
    return { total_usd: 0, change_24h_usd: 0, change_24h_pct: 0, assets: [] };
  }

  const { data: assetsData } = await supabase
    .from("supported_assets")
    .select("*")
    .in("id", balances.map((b) => b.asset_id));

  const assetMap = new Map<string, SupportedAsset>((assetsData ?? []).map((a) => [a.id, a]));

  // Get live data from Bybit (Real-time) and MarketAssets (Fallback/Metadata)
  const [bybit, marketList] = await Promise.all([
    getBybitPrices(),
    getMarketAssets()
  ]);

  const portfolioAssets: PortfolioAsset[] = [];
  let total = 0;
  let totalYesterday = 0;

  // Aggregate balances per asset
  const aggregated = new Map<string, number>();
  for (const b of balances as WalletBalance[]) {
    aggregated.set(b.asset_id, (aggregated.get(b.asset_id) ?? 0) + Number(b.balance));
  }

  for (const [assetId, balance] of aggregated.entries()) {
    if (balance === 0) continue;
    const asset = assetMap.get(assetId);
    if (!asset) continue;

    const live = bybit[asset.symbol.toUpperCase()];
    const mkt = marketList.find(m => m.id === assetId);
    
    const price = live?.price || mkt?.current_price || 0;
    const change24h = live?.change24h || mkt?.price_change_percentage_24h || 0;
    
    const value = balance * price;
    const yesterdayValue = (change24h <= -100) ? value : value / (1 + change24h / 100);

    total += value;
    totalYesterday += yesterdayValue;

    portfolioAssets.push({
      asset,
      balance,
      price_usd: price,
      value_usd: value,
      change_24h_pct: change24h,
    });
  }

  portfolioAssets.sort((a, b) => b.value_usd - a.value_usd);

  const change24hUsd = total - totalYesterday;
  const change24hPct = totalYesterday > 0 ? (change24hUsd / totalYesterday) * 100 : 0;

  return {
    total_usd: total,
    change_24h_usd: change24hUsd,
    change_24h_pct: change24hPct,
    assets: portfolioAssets,
  };
}

export async function getRecentTransactions(userId: string, limit = 10) {
  const supabase = createClient();
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!data || data.length === 0) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("your-project")) {
      return [
        { id: "1", type: "receive", amount: 0.1, usd_value: 9423, status: "completed", description: "Received Bitcoin from External Wallet", created_at: new Date().toISOString() },
        { id: "2", type: "swap",    amount: -500, usd_value: 500,  status: "completed", description: "Swapped USDT to Solana", created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: "3", type: "trade",   amount: 0.05, usd_value: 4711, status: "completed", description: "Bought BTC/USDT", created_at: new Date(Date.now() - 172800000).toISOString() },
      ];
    }
  }
  return data ?? [];
}
