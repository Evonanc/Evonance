export interface CoinData {
  id: string;       // Bybit-style: "BTCUSDT"
  symbol: string;   // e.g. "BTC"
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

export const COIN_COLORS: Record<string, string> = {
  BTC:'#f7931a', ETH:'#627eea', BNB:'#f3ba2f', SOL:'#00d4aa',
  XRP:'#00aae4', ADA:'#0033ad', AVAX:'#e84142', MATIC:'#8247e5',
  LINK:'#2a5ada', DOT:'#e6007a', LTC:'#bfbbbb', NEAR:'#00c08b',
  APT:'#00c2cb', ARB:'#28a0f0', OP:'#ff0420', UNI:'#ff007a',
  ATOM:'#2e3148', INJ:'#00b2ff', FET:'#1d2d5e', SUI:'#4da2ff',
};

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

// ── Fallback data — current approximate prices (May 2026) ─────────
// Used ONLY if both WebSocket AND CoinGecko are completely unreachable
export const FALLBACK_DATA: CoinData[] = [
  { id:'BTCUSDT',  symbol:'BTC',  name:'Bitcoin',   price:77278,  change24h:1.01,  volume24h:38e9,   marketCap:1.53e12, high24h:78500,  low24h:75100,  bid:77275,  ask:77282,  icon:'B', color:'#f7931a' },
  { id:'ETHUSDT',  symbol:'ETH',  name:'Ethereum',  price:1812,   change24h:2.83,  volume24h:18e9,   marketCap:218e9,   high24h:1850,   low24h:1770,   bid:1811,   ask:1813,   icon:'E', color:'#627eea' },
  { id:'BNBUSDT',  symbol:'BNB',  name:'BNB',       price:598,    change24h:2.01,  volume24h:2.1e9,  marketCap:84e9,    high24h:610,    low24h:585,    bid:597,    ask:599,    icon:'B', color:'#f3ba2f' },
  { id:'SOLUSDT',  symbol:'SOL',  name:'Solana',    price:150,    change24h:2.53,  volume24h:4.8e9,  marketCap:73e9,    high24h:155,    low24h:146,    bid:149,    ask:151,    icon:'S', color:'#00d4aa' },
  { id:'XRPUSDT',  symbol:'XRP',  name:'XRP',       price:2.18,   change24h:3.94,  volume24h:6.2e9,  marketCap:125e9,   high24h:2.25,   low24h:2.10,   bid:2.179,  ask:2.181,  icon:'X', color:'#00aae4' },
  { id:'ADAUSDT',  symbol:'ADA',  name:'Cardano',   price:0.72,   change24h:3.08,  volume24h:890e6,  marketCap:25e9,    high24h:0.74,   low24h:0.70,   bid:0.719,  ask:0.721,  icon:'A', color:'#0033ad' },
  { id:'AVAXUSDT', symbol:'AVAX', name:'Avalanche', price:19.8,   change24h:2.98,  volume24h:620e6,  marketCap:8.2e9,   high24h:20.5,   low24h:19.2,   bid:19.79,  ask:19.81,  icon:'A', color:'#e84142' },
  { id:'MATICUSDT',symbol:'MATIC',name:'Polygon',   price:0.22,   change24h:-0.50, volume24h:380e6,  marketCap:2.2e9,   high24h:0.23,   low24h:0.215,  bid:0.2199, ask:0.2201, icon:'M', color:'#8247e5' },
  { id:'LINKUSDT', symbol:'LINK', name:'Chainlink', price:12.4,   change24h:4.66,  volume24h:720e6,  marketCap:8.1e9,   high24h:12.9,   low24h:11.9,   bid:12.39,  ask:12.41,  icon:'L', color:'#2a5ada' },
  { id:'DOTUSDT',  symbol:'DOT',  name:'Polkadot',  price:3.85,   change24h:3.87,  volume24h:410e6,  marketCap:5.7e9,   high24h:3.95,   low24h:3.72,   bid:3.849,  ask:3.851,  icon:'D', color:'#e6007a' },
  { id:'LTCUSDT',  symbol:'LTC',  name:'Litecoin',  price:88,     change24h:2.56,  volume24h:510e6,  marketCap:6.6e9,   high24h:90,     low24h:86,     bid:87.9,   ask:88.1,   icon:'L', color:'#bfbbbb' },
  { id:'NEARUSDT', symbol:'NEAR', name:'NEAR',      price:2.35,   change24h:0.86,  volume24h:290e6,  marketCap:2.8e9,   high24h:2.42,   low24h:2.28,   bid:2.349,  ask:2.351,  icon:'N', color:'#00c08b' },
  { id:'APTUSDT',  symbol:'APT',  name:'Aptos',     price:5.12,   change24h:1.20,  volume24h:310e6,  marketCap:2.5e9,   high24h:5.28,   low24h:4.98,   bid:5.119,  ask:5.121,  icon:'A', color:'#00c2cb' },
  { id:'ARBUSDT',  symbol:'ARB',  name:'Arbitrum',  price:0.31,   change24h:1.50,  volume24h:245e6,  marketCap:1.2e9,   high24h:0.32,   low24h:0.305,  bid:0.3099, ask:0.3101, icon:'A', color:'#28a0f0' },
  { id:'OPUSDT',   symbol:'OP',   name:'Optimism',  price:0.68,   change24h:2.10,  volume24h:198e6,  marketCap:980e6,   high24h:0.70,   low24h:0.66,   bid:0.679,  ask:0.681,  icon:'O', color:'#ff0420' },
  { id:'UNIUSDT',  symbol:'UNI',  name:'Uniswap',   price:5.82,   change24h:3.79,  volume24h:320e6,  marketCap:4.4e9,   high24h:6.00,   low24h:5.62,   bid:5.819,  ask:5.821,  icon:'U', color:'#ff007a' },
  { id:'ATOMUSDT', symbol:'ATOM', name:'Cosmos',    price:3.95,   change24h:-0.47, volume24h:275e6,  marketCap:1.5e9,   high24h:4.05,   low24h:3.85,   bid:3.949,  ask:3.951,  icon:'A', color:'#2e3148' },
  { id:'INJUSDT',  symbol:'INJ',  name:'Injective', price:9.85,   change24h:3.20,  volume24h:430e6,  marketCap:830e6,   high24h:10.20,  low24h:9.50,   bid:9.849,  ask:9.851,  icon:'I', color:'#00b2ff' },
  { id:'FETUSDT',  symbol:'FET',  name:'Fetch.ai',  price:0.68,   change24h:2.40,  volume24h:185e6,  marketCap:580e6,   high24h:0.70,   low24h:0.66,   bid:0.679,  ask:0.681,  icon:'F', color:'#1d2d5e' },
  { id:'SUIUSDT',  symbol:'SUI',  name:'Sui',       price:2.98,   change24h:4.10,  volume24h:920e6,  marketCap:9.2e9,   high24h:3.10,   low24h:2.88,   bid:2.979,  ask:2.981,  icon:'S', color:'#4da2ff' },
];
