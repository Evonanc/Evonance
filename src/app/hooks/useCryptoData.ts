import { useState, useEffect, useRef, useCallback } from 'react';
import { CoinData, COIN_COLORS, FALLBACK_DATA } from '../lib/crypto';

// ─── Constants ────────────────────────────────────────────────────
const BYBIT_WS = 'wss://stream.bybit.com/v5/public/spot';

const TRACKED_PAIRS = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT',
  'ADAUSDT','AVAXUSDT','MATICUSDT','LINKUSDT','DOTUSDT',
  'LTCUSDT','NEARUSDT','APTUSDT','ARBUSDT','OPUSDT',
  'UNIUSDT','ATOMUSDT','INJUSDT','FETUSDT','SUIUSDT',
];

const SYMBOL_NAMES: Record<string, string> = {
  BTC:'Bitcoin', ETH:'Ethereum', BNB:'BNB', SOL:'Solana', XRP:'XRP',
  ADA:'Cardano', AVAX:'Avalanche', MATIC:'Polygon', LINK:'Chainlink',
  DOT:'Polkadot', LTC:'Litecoin', NEAR:'NEAR', APT:'Aptos',
  ARB:'Arbitrum', OP:'Optimism', UNI:'Uniswap', ATOM:'Cosmos',
  INJ:'Injective', FET:'Fetch.ai', SUI:'Sui',
};

// ─── CoinGecko REST bootstrap ─────────────────────────────────────
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

async function fetchCoinGeckoBootstrap(): Promise<CoinData[]> {
  try {
    const url =
      'https://api.coingecko.com/api/v3/coins/markets' +
      '?vs_currency=usd' +
      `&ids=${COIN_IDS.join(',')}` +
      '&order=market_cap_desc&per_page=20&page=1' +
      '&sparkline=false&price_change_percentage=24h';

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
    const raw: any[] = await res.json();

    return raw.map(coin => {
      const sym = SYMBOL_MAP[coin.id] ?? coin.symbol.toUpperCase();
      const price = coin.current_price ?? 0;
      const spread = price * 0.0002;
      return {
        id: sym + 'USDT',   // use Bybit-style ID as map key
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
      } as CoinData;
    });
  } catch (err) {
    console.warn('[CoinGecko] Bootstrap failed:', err);
    return [];
  }
}

// ─── Bybit helpers ────────────────────────────────────────────────
function makeCoinFromBybitSnapshot(pairId: string, d: any): CoinData {
  const sym = pairId.replace('USDT', '');
  const price = d.lastPrice ? parseFloat(d.lastPrice) : 0;
  const spread = price * 0.0002;
  return {
    id: pairId,
    symbol: sym,
    name: SYMBOL_NAMES[sym] ?? sym,
    price,
    change24h: d.price24hPcnt ? parseFloat(d.price24hPcnt) * 100 : 0,
    volume24h: d.turnover24h ? parseFloat(d.turnover24h) : 0,
    marketCap: 0,
    high24h: d.highPrice24h ? parseFloat(d.highPrice24h) : price,
    low24h: d.lowPrice24h ? parseFloat(d.lowPrice24h) : price,
    bid: d.bid1Price ? parseFloat(d.bid1Price) : price - spread,
    ask: d.ask1Price ? parseFloat(d.ask1Price) : price + spread,
    icon: sym[0],
    color: COIN_COLORS[sym] ?? '#6366f1',
  };
}

function updateCoinFromBybitDelta(existing: CoinData, d: any): CoinData {
  const price = d.lastPrice ? parseFloat(d.lastPrice) : existing.price;
  const spread = price * 0.0002;
  return {
    ...existing,
    price,
    change24h: d.price24hPcnt ? parseFloat(d.price24hPcnt) * 100 : existing.change24h,
    high24h: d.highPrice24h ? parseFloat(d.highPrice24h) : existing.high24h,
    low24h: d.lowPrice24h ? parseFloat(d.lowPrice24h) : existing.low24h,
    bid: d.bid1Price ? parseFloat(d.bid1Price) : price - spread,
    ask: d.ask1Price ? parseFloat(d.ask1Price) : price + spread,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────
export type DataSource = 'bybit' | 'coingecko' | 'fallback';

export function useCryptoData() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [source, setSource] = useState<DataSource>('fallback');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Map: pairId ("BTCUSDT") → CoinData
  const coinsRef = useRef<Map<string, CoinData>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval>>();
  const retryRef = useRef<ReturnType<typeof setTimeout>>();
  const retryDelay = useRef(1000);
  const mountedRef = useRef(true);

  // Push map → sorted array → React state
  const updateCoins = useCallback(() => {
    if (!mountedRef.current) return;
    const ordered = TRACKED_PAIRS
      .map(id => coinsRef.current.get(id))
      .filter(Boolean) as CoinData[];
    
    if (mountedRef.current) {
      setCoins([...ordered]);
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, []);

  // ── Bybit WebSocket ────────────────────────────────────────────
  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.CONNECTING ||
        wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      console.log('[Bybit WS] Connecting to', BYBIT_WS, '...');
      const ws = new WebSocket(BYBIT_WS);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Bybit WS] Connected ✓');
        retryDelay.current = 1000;
        if (mountedRef.current) {
          setWsConnected(true);
        }

        // Bybit limit: 10 topics per subscribe message — batch them
        const args = TRACKED_PAIRS.map(s => `tickers.${s}`);
        const batchSize = 10;
        for (let i = 0; i < args.length; i += batchSize) {
          ws.send(JSON.stringify({
            op: 'subscribe',
            args: args.slice(i, i + batchSize),
          }));
        }

        // Bybit requires a ping every 20s or the connection drops
        pingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 'ping' }));
          }
        }, 20_000);
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data as string);

          // Pong response — ignore
          if (msg.op === 'pong' || msg.ret_msg === 'pong') return;

          // Subscription confirmation
          if (msg.op === 'subscribe') {
            console.log('[Bybit WS] Subscribed:', msg.success ? '✓' : '✗', msg.ret_msg);
            return;
          }

          // Ticker data
          if (!msg.topic || !msg.data) return;
          if (!msg.topic.startsWith('tickers.')) return;

          const pairId = msg.topic.replace('tickers.', '');
          const d = msg.data;
          const existing = coinsRef.current.get(pairId);

          if (msg.type === 'snapshot' || !existing) {
            const coin = makeCoinFromBybitSnapshot(pairId, d);
            if (coin.price > 0) {
              coinsRef.current.set(pairId, coin);
              if (mountedRef.current) {
                setSource('bybit');
                updateCoins();
              }
            }
          } else {
            const updated = updateCoinFromBybitDelta(existing, d);
            coinsRef.current.set(pairId, updated);
            if (mountedRef.current) {
              if (updated.price > 0) setSource('bybit');
              updateCoins();
            }
          }
        } catch (err) {
          console.error('[Bybit WS] Parse error:', err, evt.data);
        }
      };

      ws.onerror = (err) => {
        console.error('[Bybit WS] Error:', err);
        if (mountedRef.current) {
          setWsConnected(false);
        }
      };

      ws.onclose = (evt) => {
        console.warn('[Bybit WS] Closed. Code:', evt.code, 'Reason:', evt.reason || '(none)');
        if (mountedRef.current) {
          setWsConnected(false);
        }
        clearInterval(pingRef.current);

        if (!mountedRef.current) return;
        // Exponential backoff capped at 30s
        retryDelay.current = Math.min(retryDelay.current * 2, 30_000);
        console.log(`[Bybit WS] Reconnecting in ${retryDelay.current / 1000}s...`);
        retryRef.current = setTimeout(connectWS, retryDelay.current);
      };

    } catch (err) {
      console.warn('[Bybit WS] Could not create WebSocket:', err);
    }
  }, [updateCoins]);

  // ── Mount effect ───────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    // 1. Seed fallback immediately so UI is never empty
    if (coinsRef.current.size === 0) {
      FALLBACK_DATA.forEach(c => coinsRef.current.set(c.id, c));
      updateCoins();
    }

    // 2. Start WebSocket immediately
    connectWS();

    // 3. Load CoinGecko in parallel — overwrites fallback, WS overwrites CoinGecko
    fetchCoinGeckoBootstrap().then(cgData => {
      if (!mountedRef.current) return;
      if (cgData.length > 0) {
        cgData.forEach(coin => {
          // Only set if Bybit WS hasn't already given us this coin's live price
          const existing = coinsRef.current.get(coin.id);
          if (!existing || existing.price === 0 || source === 'fallback') {
            coinsRef.current.set(coin.id, coin);
          }
        });
        if (mountedRef.current) {
          setSource(prev => prev === 'bybit' ? 'bybit' : 'coingecko');
          updateCoins();
        }
        console.log('[CoinGecko] Bootstrap loaded:', cgData.length, 'coins');
      }
    });

    // 4. Poll CoinGecko every 60s as reliable backup
    const pollTimer = setInterval(() => {
      if (!mountedRef.current) return;
      fetchCoinGeckoBootstrap().then(cgData => {
        if (!mountedRef.current) return;
        if (cgData.length > 0 && source !== 'bybit') {
          cgData.forEach(coin => coinsRef.current.set(coin.id, coin));
          if (mountedRef.current) {
            setSource('coingecko');
            updateCoins();
          }
          console.log('[CoinGecko] Polled:', cgData.length, 'coins');
        }
      });
    }, 60_000);

    return () => {
      mountedRef.current = false;
      clearInterval(pollTimer);
      clearInterval(pingRef.current);
      clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connectWS, updateCoins]); // eslint-disable-line react-hooks/exhaustive-deps

  return { coins, loading, wsConnected, source, lastUpdated };
}

export function useTopCoins() {
  const { coins, loading, wsConnected, source } = useCryptoData();
  return { coins: coins.slice(0, 6), loading, wsConnected, source };
}
