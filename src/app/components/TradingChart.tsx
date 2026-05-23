import React, {
  useEffect, useRef, useState, useCallback
} from 'react';
import { useTheme } from 'next-themes';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  CrosshairMode,
  LineStyle,
  ColorType,
} from 'lightweight-charts';
import {
  fetchCandles, generateMockCandles,
  Candle, INTERVALS
} from '../lib/bybitCandles';

interface Props {
  symbol: string;       // e.g. "BTCUSDT"
  currentPrice: number; // live price from Bybit WS
  change24h: number;
}

const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

// Theme color configs
const CHART_THEMES = {
  dark: {
    background:     '#111827',
    textColor:      '#94a3b8',
    gridColor:      'rgba(255,255,255,0.04)',
    borderColor:    'rgba(255,255,255,0.08)',
    crosshairColor: 'rgba(255,255,255,0.3)',
    upColor:        '#22c55e',
    downColor:      '#ef4444',
    upWick:         '#22c55e',
    downWick:       '#ef4444',
    volumeUp:       'rgba(34,197,94,0.3)',
    volumeDown:     'rgba(239,68,68,0.3)',
  },
  light: {
    background:     '#ffffff',
    textColor:      '#64748b',
    gridColor:      'rgba(0,0,0,0.04)',
    borderColor:    'rgba(0,0,0,0.08)',
    crosshairColor: 'rgba(0,0,0,0.3)',
    upColor:        '#16a34a',
    downColor:      '#dc2626',
    upWick:         '#16a34a',
    downWick:       '#dc2626',
    volumeUp:       'rgba(22,163,74,0.25)',
    volumeDown:     'rgba(220,38,38,0.25)',
  },
};

export default function TradingChart({
  symbol, currentPrice, change24h
}: Props) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const candleRef    = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeRef    = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [timeframe, setTimeframe] = useState('1H');
  const [loading, setLoading]     = useState(true);
  const [candles, setCandles]     = useState<Candle[]>([]);
  const [hovered, setHovered]     = useState<Candle | null>(null);
  const [noData, setNoData]       = useState(false);

  const theme = CHART_THEMES[
    resolvedTheme === 'dark' ? 'dark' : 'light'
  ];

  // ── Initialize chart ────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: theme.background },
        textColor: theme.textColor,
        fontFamily: 'Inter, -apple-system, sans-serif',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: theme.gridColor },
        horzLines: { color: theme.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: theme.crosshairColor,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#0066ff',
        },
        horzLine: {
          color: theme.crosshairColor,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#0066ff',
        },
      },
      rightPriceScale: {
        borderColor: theme.borderColor,
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: theme.borderColor,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 8,
        fixLeftEdge: false,
        lockVisibleTimeRangeOnResize: true,
      },
      handleScroll: true,
      handleScale: true,
    });

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:          theme.upColor,
      downColor:        theme.downColor,
      borderUpColor:    theme.upColor,
      borderDownColor:  theme.downColor,
      wickUpColor:      theme.upWick,
      wickDownColor:    theme.downWick,
    });

    // Volume histogram (separate price scale)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // Crosshair hover — update tooltip
    chart.subscribeCrosshairMove(param => {
      if (!param.time || !param.seriesData) {
        setHovered(null);
        return;
      }
      const candleData = param.seriesData.get(candleSeries) as any;
      const volumeData = param.seriesData.get(volumeSeries) as any;
      if (candleData) {
        setHovered({
          time: param.time as any,
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: volumeData ? volumeData.value : 0,
        });
      }
    });

    chartRef.current  = chart;
    candleRef.current = candleSeries;
    volumeRef.current = volumeSeries;

    // Handle resize
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width:  containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current  = null;
      candleRef.current = null;
      volumeRef.current = null;
    };
  }, []);

  // ── Update theme when it changes ────────────────────────────────
  useEffect(() => {
    if (!chartRef.current || !candleRef.current) return;
    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: theme.background },
        textColor: theme.textColor,
      },
      grid: {
        vertLines: { color: theme.gridColor },
        horzLines: { color: theme.gridColor },
      },
      rightPriceScale: { borderColor: theme.borderColor },
      timeScale:       { borderColor: theme.borderColor },
    });
    candleRef.current.applyOptions({
      upColor:         theme.upColor,
      downColor:       theme.downColor,
      borderUpColor:   theme.upColor,
      borderDownColor: theme.downColor,
      wickUpColor:     theme.upWick,
      wickDownColor:   theme.downWick,
    });
  }, [resolvedTheme]);

  // ── Load candle data when symbol or timeframe changes ───────────
  const loadCandles = useCallback(async () => {
    setLoading(true);
    setNoData(false);
    const interval = INTERVALS[timeframe];
    let data = await fetchCandles(symbol, interval, 200);

    if (data.length === 0) {
      // Use mock data seeded from live price
      data = generateMockCandles(currentPrice || 50000, 200);
      setNoData(true);
    }

    setCandles(data);

    if (candleRef.current && volumeRef.current) {
      candleRef.current.setData(data as any);
      volumeRef.current.setData(
        data.map(c => ({
          time:  c.time as any,
          value: c.volume,
          color: c.close >= c.open
            ? theme.volumeUp
            : theme.volumeDown,
        }))
      );
      chartRef.current?.timeScale().fitContent();
    }
    setLoading(false);
  }, [symbol, timeframe, currentPrice]);

  useEffect(() => { loadCandles(); }, [loadCandles]);

  // ── Update last candle with live price from Bybit WS ───────────
  useEffect(() => {
    if (!candleRef.current || !currentPrice || candles.length === 0) return;

    const last = candles[candles.length - 1];

    // Update the last candle's close with live price
    const updated: Candle = {
      ...last,
      close: currentPrice,
      high:  Math.max(last.high, currentPrice),
      low:   Math.min(last.low, currentPrice),
    };

    try {
      candleRef.current.update(updated as any);
    } catch { /* ignore if chart disposed */ }
  }, [currentPrice]);

  // ── Tooltip display values ──────────────────────────────────────
  const display = hovered ?? candles[candles.length - 1];
  const isUp = display
    ? display.close >= display.open
    : change24h >= 0;

  return (
    <div className="flex flex-col h-full bg-card">

      {/* Chart header */}
      <div className="flex items-center justify-between px-4 py-3
        border-b border-border flex-shrink-0">

        {/* OHLCV tooltip */}
        <div className="flex items-center gap-4 text-xs flex-wrap">
          {display ? (
            <>
              <span className={`font-semibold text-sm ${
                isUp ? 'text-success' : 'text-destructive'
              }`}>
                {currentPrice
                  ? '$' + currentPrice.toLocaleString('en-US',
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : '—'
                }
              </span>
              {[
                { label: 'O', value: display.open },
                { label: 'H', value: display.high },
                { label: 'L', value: display.low },
                { label: 'C', value: display.close },
              ].map(({ label, value }) => (
                <span key={label} className="text-muted-foreground font-medium">
                  <span className="text-foreground">{label}</span>{' '}
                  {value?.toLocaleString('en-US',
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                </span>
              ))}
              <span className="text-muted-foreground font-medium">
                <span className="text-foreground">V</span>{' '}
                {display.volume?.toLocaleString('en-US',
                  { maximumFractionDigits: 2 }) ?? '—'}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground text-xs">
              Loading chart data...
            </span>
          )}
        </div>

        {/* Timeframe tabs */}
        <div className="flex items-center gap-0.5 bg-secondary
          rounded-lg p-0.5 flex-shrink-0">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md cursor-pointer
                transition-all ${timeframe === tf
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}>
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="relative flex-1 min-h-0">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center
            justify-center bg-card/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-border
                border-t-primary rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">
                Loading {symbol} chart...
              </p>
            </div>
          </div>
        )}

        {/* Mock data notice */}
        {noData && !loading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10
            bg-warning/10 border border-warning/20 rounded-lg px-3 py-1.5">
            <p className="text-xs text-warning">
              Live chart data unavailable — showing simulated data
            </p>
          </div>
        )}

        {/* The actual chart renders here */}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
