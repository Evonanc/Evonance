// Bybit kline intervals map
export const INTERVALS: Record<string, string> = {
  '1m':  '1',
  '5m':  '5',
  '15m': '15',
  '1H':  '60',
  '4H':  '240',
  '1D':  'D',
  '1W':  'W',
};

export interface Candle {
  time: number;   // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// CORS proxy options — try each in order until one works
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

export async function fetchCandles(
  symbol: string,      // e.g. "BTCUSDT"
  interval: string,    // e.g. "60" (Bybit format)
  limit = 200
): Promise<Candle[]> {
  const url = `https://api.bybit.com/v5/market/kline` +
    `?category=spot&symbol=${symbol}&interval=${interval}&limit=${limit}`;

  // Try direct first (works in some environments)
  for (const proxy of ['', ...CORS_PROXIES]) {
    try {
      const res = await fetch(
        proxy ? proxy + encodeURIComponent(url) : url,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) continue;
      const json = await res.json();
      if (json.retCode !== 0) continue;

      // Bybit returns: [startTime, open, high, low, close, volume, turnover]
      // Most recent candle is first — reverse for chronological order
      const candles: Candle[] = json.result.list
        .map((c: string[]) => ({
          time: Math.floor(parseInt(c[0]) / 1000), // ms → seconds
          open:   parseFloat(c[1]),
          high:   parseFloat(c[2]),
          low:    parseFloat(c[3]),
          close:  parseFloat(c[4]),
          volume: parseFloat(c[5]),
        }))
        .reverse();

      return candles;
    } catch {
      continue;
    }
  }

  // All proxies failed — return empty array (chart shows no data message)
  console.warn('[Bybit Candles] All fetch attempts failed for', symbol);
  return [];
}

// Generate realistic mock candles as last resort
export function generateMockCandles(
  basePrice: number,
  count = 200
): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice * 0.95;
  const now = Math.floor(Date.now() / 1000);
  const interval = 3600; // 1 hour

  for (let i = count; i >= 0; i--) {
    const change = (Math.random() - 0.48) * price * 0.012;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low  = Math.min(open, close) * (1 - Math.random() * 0.008);
    candles.push({
      time: now - i * interval,
      open:   parseFloat(open.toFixed(2)),
      high:   parseFloat(high.toFixed(2)),
      low:    parseFloat(low.toFixed(2)),
      close:  parseFloat(close.toFixed(2)),
      volume: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
    });
    price = close;
  }
  return candles;
}
