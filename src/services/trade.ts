import { createClient } from "@/lib/supabase/client";
import { getAssetPrice } from "./market";

const TRADE_FEE_PCT = 0.001;

export interface TradeOrder {
  pair: string;
  baseAsset: string;
  quoteAsset: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
}

export async function submitTrade(userId: string, order: TradeOrder) {
  const supabase = createClient();
  const livePrice = await getAssetPrice(order.baseAsset);
  const price = livePrice || order.price;
  const totalUsd = order.amount * price;
  const feeUsd = totalUsd * TRADE_FEE_PCT;

  const { data: wallet } = await supabase.from("wallets").select("id").eq("user_id", userId).single();
  if (!wallet) return { success: false, error: "Wallet not found" };

  if (order.side === "buy") {
    const { data: quoteBal } = await supabase.from("wallet_balances").select("balance").eq("wallet_id", wallet.id).eq("asset_id", order.quoteAsset).single();
    const qBal = Number(quoteBal?.balance ?? 0);
    if (qBal < totalUsd + feeUsd) return { success: false, error: "Insufficient USDT balance" };
    await supabase.from("wallet_balances").upsert({ wallet_id: wallet.id, asset_id: order.quoteAsset, balance: qBal - totalUsd - feeUsd, updated_at: new Date().toISOString() }, { onConflict: "wallet_id,asset_id" });
    const { data: baseBal } = await supabase.from("wallet_balances").select("balance").eq("wallet_id", wallet.id).eq("asset_id", order.baseAsset).single();
    await supabase.from("wallet_balances").upsert({ wallet_id: wallet.id, asset_id: order.baseAsset, balance: Number(baseBal?.balance ?? 0) + order.amount, updated_at: new Date().toISOString() }, { onConflict: "wallet_id,asset_id" });
  } else {
    const { data: baseBal } = await supabase.from("wallet_balances").select("balance").eq("wallet_id", wallet.id).eq("asset_id", order.baseAsset).single();
    const bBal = Number(baseBal?.balance ?? 0);
    if (bBal < order.amount) return { success: false, error: "Insufficient balance" };
    await supabase.from("wallet_balances").upsert({ wallet_id: wallet.id, asset_id: order.baseAsset, balance: bBal - order.amount, updated_at: new Date().toISOString() }, { onConflict: "wallet_id,asset_id" });
    const { data: quoteBal } = await supabase.from("wallet_balances").select("balance").eq("wallet_id", wallet.id).eq("asset_id", order.quoteAsset).single();
    await supabase.from("wallet_balances").upsert({ wallet_id: wallet.id, asset_id: order.quoteAsset, balance: Number(quoteBal?.balance ?? 0) + totalUsd - feeUsd, updated_at: new Date().toISOString() }, { onConflict: "wallet_id,asset_id" });
  }

  const { data: trade } = await supabase.from("trades").insert({ user_id: userId, pair: order.pair, side: order.side, order_type: "market", amount: order.amount, price, total_usd: totalUsd, fee_usd: feeUsd, status: "filled" }).select().single();

  await supabase.from("transactions").insert({ user_id: userId, type: "trade", status: "completed", asset_id: order.baseAsset, amount: order.side === "buy" ? order.amount : -order.amount, fee: 0, usd_value: totalUsd, description: `${order.side.toUpperCase()} ${order.amount} ${order.pair} @ $${price.toLocaleString()}`, reference_id: trade?.id ?? null });

  await supabase.from("notifications").insert({ user_id: userId, type: "trade", read: false, title: "Trade Filled ✅", body: `${order.side.toUpperCase()} ${order.amount} ${order.pair} at $${price.toLocaleString()}`, action_url: "/trade" });

  return { success: true };
}

export async function getTradeHistory(userId: string, limit = 20) {
  const supabase = createClient();
  const { data } = await supabase.from("trades").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}
