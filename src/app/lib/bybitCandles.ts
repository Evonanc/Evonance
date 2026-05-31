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

// CORS proxy options for Bybit (fallback only)
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

// Map Bybit interval values ('1', '5', '15', '60', '240', 'D', 'W') to Binance intervals
const BYBIT_TO_BINANCE_INTERVALS: Record<string, string> = {
  '1':   '1m',
  '5':   '5m',
  '15':  '15m',
  '60':  '1h',
  '240': '4h',
  'D':   '1d',
  'W':   '1w',
};

export async function fetchCandles(
  symbol: string,      // e.g. "BTCUSDT"
  interval: string,    // e.g. "60" (Bybit format)
  limit = 200
): Promise<Candle[]> {
  const cleanSymbol = symbol.toUpperCase();

  // ── 1. Try Binance First (Native CORS support, no proxies needed, extremely reliable) ──
  try {
    const binanceInterval = BYBIT_TO_BINANCE_INTERVALS[interval] || '1h';
    const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${binanceInterval}&limit=${limit}`;
    const res = await fetch(binanceUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json)) {
        const candles: Candle[] = json.map((c: any) => ({
          time: Math.floor(c[0] / 1000), // ms → seconds
          open:   parseFloat(c[1]),
          high:   parseFloat(c[2]),
          low:    parseFloat(c[3]),
          close:  parseFloat(c[4]),
          volume: parseFloat(c[5]),
        }));
        if (candles.length > 0) {
          return candles;
        }
      }
    }
  } catch (err) {
    console.warn('[Bybit Candles] Binance fetch failed or timed out, falling back to Bybit...', err);
  }

  // ── 2. Fallback to Bybit via CORS Proxies ──
  const bybitUrl = `https://api.bybit.com/v5/market/kline` +
    `?category=spot&symbol=${cleanSymbol}&interval=${interval}&limit=${limit}`;

  for (const proxy of ['', ...CORS_PROXIES]) {
    try {
      const res = await fetch(
        proxy ? proxy + encodeURIComponent(bybitUrl) : bybitUrl,
        { signal: AbortSignal.timeout(6000) }
      );
      if (!res.ok) continue;
      const json = await res.json();
      if (json.retCode !== 0) continue;

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

      if (candles.length > 0) {
        return candles;
      }
    } catch {
      continue;
    }
  }

  // All attempts failed — return empty array (chart shows warning notice)
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
