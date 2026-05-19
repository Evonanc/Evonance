export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  bid: number;
  ask: number;
  icon: string;
  color: string;
}

const COIN_IDS = [
  'bitcoin','ethereum','binancecoin','solana','ripple',
  'cardano','avalanche-2','matic-network','chainlink',
  'polkadot','litecoin','near','aptos','arbitrum',
  'optimism','uniswap','cosmos','injective-protocol',
  'fetch-ai','sui',
];

const SYMBOL_MAP: Record<string, string> = {
  bitcoin:'BTC', ethereum:'ETH', binancecoin:'BNB', solana:'SOL',
  ripple:'XRP', cardano:'ADA', 'avalanche-2':'AVAX',
  'matic-network':'MATIC', chainlink:'LINK', polkadot:'DOT',
  litecoin:'LTC', near:'NEAR', aptos:'APT', arbitrum:'ARB',
  optimism:'OP', uniswap:'UNI', cosmos:'ATOM',
  'injective-protocol':'INJ', 'fetch-ai':'FET', sui:'SUI',
};

export const COIN_COLORS: Record<string, string> = {
  BTC:'#f7931a', ETH:'#627eea', BNB:'#f3ba2f', SOL:'#00d4aa',
  XRP:'#00aae4', ADA:'#0033ad', AVAX:'#e84142', MATIC:'#8247e5',
  LINK:'#2a5ada', DOT:'#e6007a', LTC:'#bfbbbb', NEAR:'#00c08b',
  APT:'#00c2cb', ARB:'#28a0f0', OP:'#ff0420', UNI:'#ff007a',
  ATOM:'#2e3148', INJ:'#00b2ff', FET:'#1d2d5e', SUI:'#4da2ff',
};

// ── In-memory cache ───────────────────────────────────────────────
let cache: { data: CoinData[]; ts: number } | null = null;
const CACHE_TTL = 55_000;

// ── CoinGecko REST (CORS-safe) ────────────────────────────────────
export async function fetchMarketData(): Promise<CoinData[]> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache.data;

  try {
    const url =
      'https://api.coingecko.com/api/v3/coins/markets' +
      '?vs_currency=usd' +
      `&ids=${COIN_IDS.join(',')}` +
      '&order=market_cap_desc&per_page=20&page=1' +
      '&sparkline=false&price_change_percentage=24h';

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const raw: any[] = await res.json();

    const data: CoinData[] = raw.map(coin => {
      const sym = SYMBOL_MAP[coin.id] ?? coin.symbol.toUpperCase();
      const price = coin.current_price ?? 0;
      const spread = price * 0.0002;
      return {
        id: coin.id,
        symbol: sym,
        name: coin.name,
        price,
        change24h: coin.price_change_percentage_24h ?? 0,
        volume24h: coin.total_volume ?? 0,
        marketCap: coin.market_cap ?? 0,
        high24h: coin.high_24h ?? price,
        low24h: coin.low_24h ?? price,
        bid: price - spread,
        ask: price + spread,
        icon: sym[0],
        color: COIN_COLORS[sym] ?? '#6366f1',
      };
    });

    cache = { data, ts: Date.now() };
    return data;

  } catch (err) {
    console.warn('CoinGecko fetch failed:', err);
    if (cache) return cache.data;
    return FALLBACK_DATA;
  }
}

// Update a single coin's price in cache (called by WebSocket)
export function patchCoinPrice(
  symbol: string,
  patch: Partial<Pick<CoinData, 'price' | 'change24h' | 'bid' | 'ask' | 'high24h' | 'low24h'>>
) {
  if (!cache) return;
  cache.data = cache.data.map(c =>
    c.symbol === symbol ? { ...c, ...patch } : c
  );
}

export function formatPrice(price: number): string {
  if (price >= 10_000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (price >= 1000)   return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (price >= 1)      return price.toFixed(4);
  return price.toFixed(6);
}

export function formatVolume(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

// Bybit symbol → our symbol  e.g. "BTCUSDT" → "BTC"
export function bybitSymbolToBase(s: string): string {
  return s.replace('USDT', '');
}

export const FALLBACK_DATA: CoinData[] = [
  { id:'bitcoin',  symbol:'BTC',  name:'Bitcoin',   price:67234,  change24h:2.34,  volume24h:28e9,  marketCap:1.3e12, high24h:68100, low24h:66200, bid:67220, ask:67248, icon:'B', color:'#f7931a' },
  { id:'ethereum', symbol:'ETH',  name:'Ethereum',  price:3456,   change24h:-1.23, volume24h:14e9,  marketCap:415e9,  high24h:3520,  low24h:3380,  bid:3454,  ask:3458,  icon:'E', color:'#627eea' },
  { id:'binancecoin',symbol:'BNB',name:'BNB',       price:589,    change24h:3.45,  volume24h:1.8e9, marketCap:86e9,   high24h:595,   low24h:578,   bid:588,   ask:590,   icon:'B', color:'#f3ba2f' },
  { id:'solana',   symbol:'SOL',  name:'Solana',    price:142.34, change24h:5.67,  volume24h:3.2e9, marketCap:62e9,   high24h:148,   low24h:138,   bid:141,   ask:143,   icon:'S', color:'#00d4aa' },
  { id:'ripple',   symbol:'XRP',  name:'XRP',       price:0.5212, change24h:-0.89, volume24h:1.2e9, marketCap:28e9,   high24h:0.54,  low24h:0.51,  bid:0.519, ask:0.521, icon:'X', color:'#00aae4' },
  { id:'cardano',  symbol:'ADA',  name:'Cardano',   price:0.4567, change24h:1.23,  volume24h:450e6, marketCap:16e9,   high24h:0.47,  low24h:0.44,  bid:0.449, ask:0.451, icon:'A', color:'#0033ad' },
  { id:'avalanche-2', symbol:'AVAX', name:'Avalanche', price:36.54, change24h:4.56,  volume24h:380e6, marketCap:14e9,   high24h:37.2,  low24h:34.9,  bid:36.4,  ask:36.6,  icon:'A', color:'#e84142' },
  { id:'matic-network',symbol:'MATIC',name:'Polygon',  price:0.6890, change24h:-2.45, volume24h:290e6, marketCap:6.8e9,  high24h:0.72,  low24h:0.67,  bid:0.687, ask:0.691, icon:'M', color:'#8247e5' },
  { id:'chainlink', symbol:'LINK', name:'Chainlink', price:15.34,  change24h:0.89,  volume24h:310e6, marketCap:9.2e9,  high24h:15.8,  low24h:14.9,  bid:15.2,  ask:15.4,  icon:'L', color:'#2a5ada' },
  { id:'polkadot',  symbol:'DOT',  name:'Polkadot',  price:6.45,   change24h:1.88,  volume24h:180e6, marketCap:9.0e9,  high24h:6.6,   low24h:6.2,   bid:6.4,   ask:6.5,   icon:'D', color:'#e6007a' },
  { id:'litecoin',  symbol:'LTC',  name:'Litecoin',  price:82.45,  change24h:-0.55, volume24h:410e6, marketCap:6.1e9,  high24h:84.1,  low24h:81.3,  bid:82.3,  ask:82.6,  icon:'L', color:'#bfbbbb' },
  { id:'near',      symbol:'NEAR', name:'NEAR',      price:5.89,   change24h:6.12,  volume24h:340e6, marketCap:6.3e9,  high24h:6.1,   low24h:5.4,   bid:5.8,   ask:5.9,   icon:'N', color:'#00c08b' },
  { id:'aptos',     symbol:'APT',  name:'Aptos',     price:8.12,   change24h:-3.21, volume24h:190e6, marketCap:3.4e9,  high24h:8.5,   low24h:7.9,   bid:8.0,   ask:8.2,   icon:'A', color:'#00c2cb' },
  { id:'arbitrum',  symbol:'ARB',  name:'Arbitrum',  price:0.9820, change24h:-1.45, volume24h:220e6, marketCap:2.8e9,  high24h:1.02,  low24h:0.95,  bid:0.978, ask:0.985, icon:'A', color:'#28a0f0' },
  { id:'optimism',  symbol:'OP',   name:'Optimism',  price:2.45,   change24h:3.12,  volume24h:150e6, marketCap:2.5e9,  high24h:2.55,  low24h:2.31,  bid:2.43,  ask:2.47,  icon:'O', color:'#ff0420' },
  { id:'uniswap',   symbol:'UNI',  name:'Uniswap',   price:7.34,   change24h:2.67,  volume24h:280e6, marketCap:4.4e9,  high24h:7.5,   low24h:7.1,   bid:7.3,   ask:7.4,   icon:'U', color:'#ff007a' },
  { id:'cosmos',    symbol:'ATOM', name:'Cosmos',    price:8.45,   change24h:-0.98, volume24h:120e6, marketCap:3.2e9,  high24h:8.7,   low24h:8.3,   bid:8.4,   ask:8.5,   icon:'A', color:'#2e3148' },
  { id:'injective-protocol', symbol:'INJ', name:'Injective', price:24.56, change24h:8.90, volume24h:210e6, marketCap:2.4e9, high24h:25.2, low24h:22.1, bid:24.4, ask:24.7, icon:'I', color:'#00b2ff' },
  { id:'fetch-ai',  symbol:'FET',  name:'Fetch.ai',  price:2.12,   change24h:12.45, volume24h:490e6, marketCap:1.8e9,  high24h:2.25,  low24h:1.85,  bid:2.10,  ask:2.14,  icon:'F', color:'#1d2d5e' },
  { id:'sui',       symbol:'SUI',  name:'Sui',       price:1.04,   change24h:-4.12, volume24h:260e6, marketCap:2.4e9,  high24h:1.12,  low24h:0.99,  bid:1.03,  ask:1.05,  icon:'S', color:'#4da2ff' },
];
