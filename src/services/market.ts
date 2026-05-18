// Market data service — Bybit V5 real-time + CoinGecko metadata fallback
import type { MarketAsset } from "@/types/database";

// Use Next.js rewrite proxy on client to avoid CORS; server-side hits Bybit directly
const BYBIT_BASE =
  typeof window !== "undefined" ? "/api/bybit" : "https://api.bybit.com";
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

// All major crypto IDs for CoinGecko
const SUPPORTED_IDS =
  "bitcoin,ethereum,solana,binancecoin,ripple,cardano,avalanche-2,polkadot,chainlink," +
  "matic-network,dogecoin,shiba-inu,pepe,fetch-ai,render-token,near,optimism,arbitrum," +
  "sui,aptos,kaspa,the-graph,bittensor,fantom,monero,stellar,cosmos,tron,litecoin," +
  "bitcoin-cash,uniswap,leo-token,dai,tether,usd-coin,lido-dao,ethena," +
  "jupiter-exchange-solana,ondo-finance,pyth-network,pendle,ethena-usde,wormhole";

// ── High-fidelity mock data (realistic ~May 2025 prices) ────────────────────
export const MOCK_MARKETS: MarketAsset[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "",
    current_price: 93_412.50,
    market_cap: 1.84e12,
    price_change_percentage_24h: 1.84,
    total_volume: 32.4e9,
    sparkline_in_7d: { price: [86000, 88500, 89200, 91000, 90500, 92000, 93412] },
    category: "Layer 1",
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "",
    current_price: 3_452.80,
    market_cap: 4.15e11,
    price_change_percentage_24h: -0.82,
    total_volume: 18.2e9,
    sparkline_in_7d: { price: [3600, 3550, 3500, 3480, 3420, 3440, 3452] },
    category: "Layer 1",
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: "",
    current_price: 178.32,
    market_cap: 8.4e10,
    price_change_percentage_24h: 3.21,
    total_volume: 5.1e9,
    sparkline_in_7d: { price: [155, 162, 168, 172, 175, 176, 178] },
    category: "Layer 1",
  },
  {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image: "",
    current_price: 608.40,
    market_cap: 8.9e10,
    price_change_percentage_24h: 0.55,
    total_volume: 2.1e9,
    sparkline_in_7d: { price: [590, 595, 600, 605, 602, 606, 608] },
    category: "Layer 1",
  },
  {
    id: "ripple",
    symbol: "xrp",
    name: "XRP",
    image: "",
    current_price: 2.18,
    market_cap: 1.26e11,
    price_change_percentage_24h: -1.15,
    total_volume: 4.8e9,
    sparkline_in_7d: { price: [2.30, 2.25, 2.20, 2.15, 2.18, 2.20, 2.18] },
    category: "Layer 1",
  },
  {
    id: "tether",
    symbol: "usdt",
    name: "Tether",
    image: "",
    current_price: 1.0,
    market_cap: 1.14e11,
    price_change_percentage_24h: 0.01,
    total_volume: 75.2e9,
    sparkline_in_7d: { price: [1, 1, 1, 1, 1, 1, 1] },
    category: "Stablecoins",
  },
  {
    id: "usd-coin",
    symbol: "usdc",
    name: "USD Coin",
    image: "",
    current_price: 1.0,
    market_cap: 4.2e10,
    price_change_percentage_24h: 0.02,
    total_volume: 8.1e9,
    sparkline_in_7d: { price: [1, 1, 1, 1, 1, 1, 1] },
    category: "Stablecoins",
  },
  {
    id: "dogecoin",
    symbol: "doge",
    name: "Dogecoin",
    image: "",
    current_price: 0.185,
    market_cap: 2.72e10,
    price_change_percentage_24h: 2.45,
    total_volume: 1.4e9,
    sparkline_in_7d: { price: [0.16, 0.165, 0.17, 0.178, 0.181, 0.183, 0.185] },
    category: "Altcoins",
  },
  {
    id: "fetch-ai",
    symbol: "fet",
    name: "Fetch.ai",
    image: "",
    current_price: 1.42,
    market_cap: 3.6e9,
    price_change_percentage_24h: 6.23,
    total_volume: 420e6,
    sparkline_in_7d: { price: [1.1, 1.15, 1.22, 1.30, 1.35, 1.38, 1.42] },
    category: "AI & Data",
  },
  {
    id: "render-token",
    symbol: "rndr",
    name: "Render",
    image: "",
    current_price: 6.84,
    market_cap: 2.6e9,
    price_change_percentage_24h: -1.92,
    total_volume: 195e6,
    sparkline_in_7d: { price: [7.4, 7.2, 7.1, 6.9, 6.8, 6.86, 6.84] },
    category: "AI & Data",
  },
  {
    id: "cardano",
    symbol: "ada",
    name: "Cardano",
    image: "",
    current_price: 0.452,
    market_cap: 1.6e10,
    price_change_percentage_24h: -0.75,
    total_volume: 580e6,
    sparkline_in_7d: { price: [0.47, 0.465, 0.460, 0.455, 0.450, 0.452, 0.452] },
    category: "Layer 1",
  },
  {
    id: "chainlink",
    symbol: "link",
    name: "Chainlink",
    image: "",
    current_price: 14.82,
    market_cap: 9.2e9,
    price_change_percentage_24h: 1.35,
    total_volume: 480e6,
    sparkline_in_7d: { price: [13.5, 13.8, 14.0, 14.3, 14.5, 14.6, 14.82] },
    category: "Infrastructure",
  },
];

const MOCK_PRICES: Record<string, number> = Object.fromEntries(
  MOCK_MARKETS.map((m) => [m.id, m.current_price])
);

const ID_TO_SYM: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
  binancecoin: "BNB",
  ripple: "XRP",
  cardano: "ADA",
  "avalanche-2": "AVAX",
  polkadot: "DOT",
  chainlink: "LINK",
  "matic-network": "POL",
  dogecoin: "DOGE",
  "shiba-inu": "SHIB",
  pepe: "PEPE",
  "fetch-ai": "FET",
  "render-token": "RNDR",
  near: "NEAR",
  optimism: "OP",
  arbitrum: "ARB",
  sui: "SUI",
  aptos: "APT",
  kaspa: "KAS",
  tether: "USDT",
  "usd-coin": "USDC",
  dai: "DAI",
};

// ── In-memory cache ──────────────────────────────────────────────────────────
const cache = new Map<string, { data: unknown; at: number }>();
const PRICE_TTL = 3 * 1000;       // 3s for prices
const MARKET_TTL = 120 * 1000;    // 2min for full market data (avoids CoinGecko rate limits)
const GLOBAL_TTL = 90 * 1000;     // 90s for global stats

// Whether Bybit is reachable (exported for UI indicator)
let _bybitLive = false;
export function isBybitLive() { return _bybitLive; }

function cached<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return Promise.resolve(hit.data as T);
  return fetcher().then((data) => {
    cache.set(key, { data, at: Date.now() });
    return data;
  });
}

// ── Live data type ────────────────────────────────────────────────────────────
export interface LiveData {
  price: number;
  change24h: number;
  volume24h: number;
}

// ── Global Market Stats (CoinGecko) ──────────────────────────────────────────
export async function getGlobalStats() {
  return cached("global-stats", GLOBAL_TTL, async () => {
    try {
      const res = await fetch(`${COINGECKO_BASE}/global`);
      if (!res.ok) throw new Error(`CoinGecko global ${res.status}`);
      const json = await res.json();
      const d = json.data;
      return {
        total_market_cap: d.total_market_cap.usd as number,
        total_volume: d.total_volume.usd as number,
        market_cap_percentage: d.market_cap_percentage as Record<string, number>,
        active_cryptocurrencies: d.active_cryptocurrencies as number,
      };
    } catch {
      return {
        total_market_cap: 2.95e12,
        total_volume: 118.4e9,
        market_cap_percentage: { btc: 53.1 },
        active_cryptocurrencies: 15_234,
      };
    }
  });
}

// ── Bybit Real-time Prices ────────────────────────────────────────────────────
export async function getBybitPrices(): Promise<Record<string, LiveData>> {
  return cached("bybit-prices-v3", PRICE_TTL, async () => {
    try {
      const res = await fetch(
        `${BYBIT_BASE}/v5/market/tickers?category=spot`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (!res.ok) throw new Error(`Bybit ${res.status}`);
      const json = await res.json();
      if (json.retCode !== 0) throw new Error(`Bybit retCode ${json.retCode}`);

      const data: Record<string, LiveData> = {};
      (json.result?.list ?? []).forEach((t: any) => {
        if (t.symbol.endsWith("USDT")) {
          const sym = t.symbol.replace("USDT", "");
          data[sym] = {
            price: parseFloat(t.lastPrice),
            change24h: parseFloat(t.price24hPcnt) * 100,
            volume24h: parseFloat(t.volume24h),
          };
        }
      });

      _bybitLive = Object.keys(data).length > 0;
      return data;
    } catch {
      _bybitLive = false;
      // Simulate tiny live price drift on fallback
      const data: Record<string, LiveData> = {};
      MOCK_MARKETS.forEach((m) => {
        const drift = (Math.random() - 0.5) * 0.0008;
        data[m.symbol.toUpperCase()] = {
          price: m.current_price * (1 + drift),
          change24h: m.price_change_percentage_24h,
          volume24h: m.total_volume,
        };
      });
      return data;
    }
  });
}

// ── Fetch top market assets ───────────────────────────────────────────────────
export async function getMarketAssets(limit = 20): Promise<MarketAsset[]> {
  return cached(`markets-v3-${limit}`, MARKET_TTL, async () => {
    try {
      const url =
        `${COINGECKO_BASE}/coins/markets` +
        `?vs_currency=usd&ids=${SUPPORTED_IDS}&order=market_cap_desc` +
        `&per_page=${Math.min(limit, 100)}&page=1&sparkline=true` +
        `&price_change_percentage=24h`;

      // Standard fetch — no Next.js-only options (this runs client-side)
      const res = await fetch(url, {
        headers: process.env.COINGECKO_API_KEY
          ? { "x-cg-pro-api-key": process.env.COINGECKO_API_KEY }
          : {},
      });

      if (res.status === 429) {
        console.warn("CoinGecko rate limited — using high-fidelity mock data");
        throw new Error("rate-limited");
      }
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

      const raw = (await res.json()) as any[];
      const bybit = await getBybitPrices();

      return raw.map((a) => {
        const live = bybit[a.symbol.toUpperCase()];
        return {
          id: a.id,
          symbol: a.symbol,
          name: a.name,
          image: a.image,
          current_price: live?.price ?? a.current_price,
          market_cap: a.market_cap,
          price_change_percentage_24h:
            live?.change24h ?? a.price_change_percentage_24h,
          total_volume: live?.volume24h ?? a.total_volume,
          sparkline_in_7d: a.sparkline_in_7d,
          category: getAssetCategory(a.id),
        };
      });
    } catch {
      // Return mock data enriched with any live Bybit prices
      try {
        const bybit = await getBybitPrices();
        return MOCK_MARKETS.slice(0, limit).map((m) => {
          const live = bybit[m.symbol.toUpperCase()];
          return live
            ? {
                ...m,
                current_price: live.price,
                price_change_percentage_24h: live.change24h,
                total_volume: live.volume24h || m.total_volume,
              }
            : m;
        });
      } catch {
        return MOCK_MARKETS.slice(0, limit);
      }
    }
  });
}

function getAssetCategory(id: string): string {
  const l1 = [
    "bitcoin", "ethereum", "solana", "binancecoin", "avalanche-2", "polkadot",
    "near", "sui", "aptos", "kaspa", "fantom", "monero", "stellar", "cosmos",
    "tron", "litecoin", "bitcoin-cash", "cardano", "ripple",
  ];
  const stable = ["tether", "usd-coin", "dai", "ethena-usde"];
  const infra = ["chainlink", "matic-network", "the-graph", "wormhole", "pyth-network"];
  const ai = ["fetch-ai", "render-token", "bittensor"];
  const defi = ["uniswap", "lido-dao", "jupiter-exchange-solana", "ondo-finance", "pendle", "ethena"];

  if (l1.includes(id)) return "Layer 1";
  if (stable.includes(id)) return "Stablecoins";
  if (infra.includes(id)) return "Infrastructure";
  if (ai.includes(id)) return "AI & Data";
  if (defi.includes(id)) return "DeFi";
  return "Altcoins";
}

// ── Single asset price ────────────────────────────────────────────────────────
export async function getAssetPrice(symbolOrId: string): Promise<number> {
  const bybit = await getBybitPrices();
  const sym = symbolOrId.toUpperCase();
  if (bybit[sym]) return bybit[sym].price;

  const mapped = ID_TO_SYM[symbolOrId.toLowerCase()];
  if (mapped && bybit[mapped]) return bybit[mapped].price;

  return cached(`price-${symbolOrId}`, PRICE_TTL, async () => {
    try {
      const res = await fetch(
        `${COINGECKO_BASE}/simple/price?ids=${symbolOrId}&vs_currencies=usd`
      );
      if (!res.ok) throw new Error("cg price fail");
      const json = (await res.json()) as Record<string, { usd: number }>;
      return json[symbolOrId]?.usd ?? MOCK_PRICES[symbolOrId] ?? 0;
    } catch {
      return MOCK_PRICES[symbolOrId] ?? 0;
    }
  });
}

// ── Batch prices ──────────────────────────────────────────────────────────────
export async function getBatchPrices(
  symbolsOrIds: string[]
): Promise<Record<string, number>> {
  const bybit = await getBybitPrices();
  const results: Record<string, number> = {};
  const missing: string[] = [];

  symbolsOrIds.forEach((s) => {
    const sym = s.toUpperCase();
    if (bybit[sym]) { results[s] = bybit[sym].price; return; }

    const mapped = ID_TO_SYM[s.toLowerCase()];
    if (mapped && bybit[mapped]) { results[s] = bybit[mapped].price; return; }

    const fuzzy = Object.keys(bybit).find((k) => {
      const kl = k.toLowerCase(), sl = s.toLowerCase();
      return kl === sl || kl.includes(sl) || sl.includes(kl);
    });
    if (fuzzy) { results[s] = bybit[fuzzy].price; return; }

    missing.push(s);
  });

  if (missing.length === 0) return results;

  try {
    const cgResults = await cached(
      `batch-cg-v4-${missing.sort().join(",")}`,
      MARKET_TTL,
      async () => {
        const res = await fetch(
          `${COINGECKO_BASE}/simple/price?ids=${missing.join(",")}&vs_currencies=usd`
        );
        if (!res.ok) throw new Error("cg batch fail");
        const json = await res.json();
        return Object.fromEntries(
          Object.entries(json).map(([id, v]: any) => [id, v.usd])
        ) as Record<string, number>;
      }
    );
    // Fill any still-missing from mock
    missing.forEach((s) => {
      if (!cgResults[s]) cgResults[s] = MOCK_PRICES[s] ?? 0;
    });
    return { ...results, ...cgResults };
  } catch {
    missing.forEach((s) => { results[s] = MOCK_PRICES[s] ?? 0; });
    return results;
  }
}
