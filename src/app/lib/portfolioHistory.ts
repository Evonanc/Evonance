import { Transaction } from './db';
import { CoinData } from './crypto';

export interface PortfolioPoint {
  time: number;    // Unix timestamp in seconds
  value: number;   // Total portfolio value in USD
}

// CoinGecko IDs for our supported assets
const CG_IDS: Record<string, string> = {
  BTC:  'bitcoin',
  ETH:  'ethereum',
  SOL:  'solana',
  BNB:  'binancecoin',
  XRP:  'ripple',
  ADA:  'cardano',
  USDT: 'tether',
  USDC: 'usd-coin',
};

// Cache historical prices to avoid hitting rate limits
const priceCache: Record<string, Record<number, number>> = {};

// Fetch daily historical prices from CoinGecko
// Returns a map of { dayTimestamp: priceUSD }
async function fetchHistoricalPrices(
  symbol: string,
  days: number
): Promise<Record<number, number>> {
  const cgId = CG_IDS[symbol];
  if (!cgId) return {};

  // Return from cache if available
  const cacheKey = `${symbol}_${days}`;
  if (priceCache[cacheKey]) return priceCache[cacheKey];

  // USDT/USDC are always $1
  if (symbol === 'USDT' || symbol === 'USDC') {
    const map: Record<number, number> = {};
    const now = Date.now();
    for (let i = 0; i <= days; i++) {
      const day = Math.floor((now - i * 86400000) / 86400000) * 86400;
      map[day] = 1;
    }
    priceCache[cacheKey] = map;
    return map;
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${cgId}/market_chart` +
      `?vs_currency=usd&days=${days}&interval=daily`,
      { signal: AbortSignal.timeout(10_000) }
    );
    if (!res.ok) throw new Error('CoinGecko failed');
    const data = await res.json();

    // data.prices = [[timestamp_ms, price], ...]
    const map: Record<number, number> = {};
    data.prices.forEach(([ts, price]: [number, number]) => {
      // Round to nearest day
      const day = Math.floor(ts / 86400000) * 86400;
      map[day] = price;
    });

    priceCache[cacheKey] = map;
    return map;
  } catch {
    return {};
  }
}

// Get price for a symbol at a specific timestamp
function getPriceAtTime(
  priceHistory: Record<string, Record<number, number>>,
  symbol: string,
  timestamp: number
): number {
  const prices = priceHistory[symbol];
  if (!prices) return 0;

  // Find nearest day
  const day = Math.floor(timestamp / 86400) * 86400;

  // Check exact day, then nearby days
  for (let offset = 0; offset <= 3; offset++) {
    if (prices[day - offset * 86400]) return prices[day - offset * 86400];
    if (prices[day + offset * 86400]) return prices[day + offset * 86400];
  }

  // Fall back to first available price
  const keys = Object.keys(prices).map(Number).sort();
  return keys.length > 0 ? prices[keys[0]] : 0;
}

export type PeriodKey = '24H' | '7D' | '1M' | '3M' | '1Y' | 'ALL';

const PERIOD_DAYS: Record<PeriodKey, number> = {
  '24H': 1,
  '7D':  7,
  '1M':  30,
  '3M':  90,
  '1Y':  365,
  'ALL': 365,
};

const PERIOD_POINTS: Record<PeriodKey, number> = {
  '24H': 24,
  '7D':  7,
  '1M':  30,
  '3M':  90,
  '1Y':  52,
  'ALL': 52,
};

export async function buildPortfolioHistory(
  transactions: Transaction[],
  currentCoins: CoinData[],
  period: PeriodKey
): Promise<PortfolioPoint[]> {
  if (transactions.length === 0) return [];

  const days = PERIOD_DAYS[period];
  const points = PERIOD_POINTS[period];
  const now = Math.floor(Date.now() / 1000);
  const periodStart = now - days * 86400;

  // Get all unique symbols from transactions
  const symbols = [...new Set(transactions.map(t => t.symbol))];

  // Fetch historical prices for all symbols in parallel
  const priceHistory: Record<string, Record<number, number>> = {};
  await Promise.all(
    symbols.map(async sym => {
      priceHistory[sym] = await fetchHistoricalPrices(sym, days + 10);
    })
  );

  // Build time points to evaluate
  const interval = (now - periodStart) / points;
  const timePoints: number[] = [];
  for (let i = 0; i <= points; i++) {
    timePoints.push(Math.floor(periodStart + i * interval));
  }
  // Always include current time as last point
  timePoints[timePoints.length - 1] = now;

  // Replay transactions to get holdings at each point
  const sortedTxs = [...transactions].sort(
    (a, b) => new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
  );

  const portfolioPoints: PortfolioPoint[] = [];

  for (const time of timePoints) {
    // Calculate holdings at this point in time
    const holdings: Record<string, number> = {};

    for (const tx of sortedTxs) {
      const txTime = Math.floor(
        new Date(tx.created_at).getTime() / 1000
      );
      if (txTime > time) break; // Transaction is in the future

      const sym = tx.symbol;
      if (!holdings[sym]) holdings[sym] = 0;

      switch (tx.type) {
        case 'deposit':
        case 'receive':
        case 'buy':
          holdings[sym] += tx.amount;
          break;
        case 'withdraw':
        case 'send':
        case 'sell':
          holdings[sym] -= tx.amount;
          break;
        case 'swap':
          // Deduct from source — target is recorded separately
          holdings[sym] -= tx.amount;
          break;
      }

      // Prevent negative due to floating point
      if (holdings[sym] < 0) holdings[sym] = 0;
    }

    // For the last point use live prices from Bybit WS
    const isLastPoint = time === now;

    // Calculate total USD value at this time
    let totalValue = 0;
    for (const [sym, amount] of Object.entries(holdings)) {
      if (amount <= 0) continue;

      let price = 0;
      if (isLastPoint) {
        // Use live price
        price = currentCoins.find(c => c.symbol === sym)?.price
          ?? getPriceAtTime(priceHistory, sym, time);
      } else {
        price = getPriceAtTime(priceHistory, sym, time);
        // If no historical price, use live price as approximation
        if (!price) {
          price = currentCoins.find(c => c.symbol === sym)?.price ?? 0;
        }
      }

      totalValue += amount * price;
    }

    if (totalValue > 0) {
      portfolioPoints.push({ time, value: totalValue });
    }
  }

  return portfolioPoints;
}
