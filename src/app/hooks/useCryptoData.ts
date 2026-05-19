import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchMarketData, patchCoinPrice, bybitSymbolToBase, CoinData
} from '../lib/crypto';

const BYBIT_WS = 'wss://stream.bybit.com/v5/public/spot';
const TRACKED = [
  'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT',
  'ADAUSDT','AVAXUSDT','MATICUSDT','LINKUSDT','DOTUSDT',
  'LTCUSDT','NEARUSDT','APTUSDT','ARBUSDT','OPUSDT',
  'UNIUSDT','ATOMUSDT','INJUSDT','FETUSDT','SUIUSDT',
];

export function useCryptoData(pollInterval = 60_000) {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval>>();
  const retryRef = useRef<ReturnType<typeof setTimeout>>();
  const retryCount = useRef(0);

  // ── REST poll ─────────────────────────────────────────────────
  const poll = useCallback(async () => {
    const data = await fetchMarketData();
    setCoins([...data]);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  // ── Bybit WebSocket (real-time ticks ON TOP of CoinGecko data) ─
  const connectWS = useCallback(() => {
    // Don't stack connections
    if (wsRef.current?.readyState === WebSocket.CONNECTING ||
        wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(BYBIT_WS);
      wsRef.current = ws;

      ws.onopen = () => {
        retryCount.current = 0;
        setWsConnected(true);
        ws.send(JSON.stringify({
          op: 'subscribe',
          args: TRACKED.map(s => `tickers.${s}`),
        }));
        // Bybit requires ping every 20s
        pingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN)
            ws.send(JSON.stringify({ op: 'ping' }));
        }, 20_000);
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data as string);
          if (!msg.topic || !msg.data) return;

          const base = bybitSymbolToBase(
            msg.topic.replace('tickers.', '')
          );
          const d = msg.data;

          const price = d.lastPrice ? parseFloat(d.lastPrice) : 0;
          if (!price) return;

          const spread = price * 0.0002;
          patchCoinPrice(base, {
            price,
            change24h: d.price24hPcnt
              ? parseFloat(d.price24hPcnt) * 100
              : undefined,
            high24h:   d.highPrice24h ? parseFloat(d.highPrice24h) : undefined,
            low24h:    d.lowPrice24h  ? parseFloat(d.lowPrice24h)  : undefined,
            bid:       d.bid1Price    ? parseFloat(d.bid1Price)    : price - spread,
            ask:       d.ask1Price    ? parseFloat(d.ask1Price)    : price + spread,
          });

          // Push updated coins to state (spread the cache array for new ref)
          setCoins(prev =>
            prev.map(c => c.symbol === base
              ? {
                  ...c,
                  price,
                  change24h: d.price24hPcnt
                    ? parseFloat(d.price24hPcnt) * 100
                    : c.change24h,
                  high24h: d.highPrice24h
                    ? parseFloat(d.highPrice24h)
                    : c.high24h,
                  low24h: d.lowPrice24h
                    ? parseFloat(d.lowPrice24h)
                    : c.low24h,
                  bid: d.bid1Price
                    ? parseFloat(d.bid1Price)
                    : price - price * 0.0002,
                  ask: d.ask1Price
                    ? parseFloat(d.ask1Price)
                    : price + price * 0.0002,
                }
              : c
            )
          );
          setLastUpdated(new Date());
        } catch { /* ignore */ }
      };

      ws.onerror = () => setWsConnected(false);

      ws.onclose = () => {
        setWsConnected(false);
        clearInterval(pingRef.current);
        // Exponential backoff: 2s, 4s, 8s, max 30s
        const delay = Math.min(2000 * 2 ** retryCount.current, 30_000);
        retryCount.current++;
        retryRef.current = setTimeout(connectWS, delay);
      };
    } catch {
      // WebSocket not available (SSR or blocked) — REST polling is enough
    }
  }, []);

  useEffect(() => {
    // Load prices immediately from CoinGecko
    poll();
    // Poll every 60s as a reliable baseline
    const pollTimer = setInterval(poll, pollInterval);
    // Also try Bybit WebSocket for real-time ticks
    connectWS();

    return () => {
      clearInterval(pollTimer);
      clearInterval(pingRef.current);
      clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [poll, connectWS, pollInterval]);

  return { coins, loading, wsConnected, lastUpdated };
}

export function useTopCoins() {
  const { coins, loading, wsConnected } = useCryptoData();
  return { coins: coins.slice(0, 6), loading, wsConnected };
}
