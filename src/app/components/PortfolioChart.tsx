import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from 'next-themes';
import { TrendingUp, TrendingDown, RefreshCw, Activity, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import {
  buildPortfolioHistory,
  PortfolioPoint,
  PeriodKey,
} from '../lib/portfolioHistory';
import { Transaction } from '../lib/db';
import { CoinData } from '../lib/crypto';

interface Props {
  transactions: Transaction[];
  coins: CoinData[];
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  loading: boolean;
}

const PERIODS: PeriodKey[] = ['24H', '7D', '1M', '3M', '1Y', 'ALL'];

// Premium custom tooltip component with glassmorphism
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="bg-background/80 backdrop-blur-md border border-border/85 rounded-xl px-4 py-3
      shadow-2xl text-xs flex flex-col gap-1.5 transition-all">
      <p className="text-muted-foreground font-medium tracking-wide">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <p className="font-bold text-foreground text-sm font-sans tracking-tight">
          ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}

export default function PortfolioChart({
  transactions, coins, totalValue,
  totalPnl, totalPnlPercent, loading
}: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [period, setPeriod]       = useState<PeriodKey>('24H');
  const [chartData, setChartData] = useState<PortfolioPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [periodPnl, setPeriodPnl] = useState(0);
  const [periodPnlPct, setPeriodPnlPct] = useState(0);

  // Keep live coins in a ref to avoid resetting the entire historical chart builder on every tick
  const coinsRef = useRef(coins);
  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  const buildChart = useCallback(async () => {
    if (transactions.length === 0 || coinsRef.current.length === 0) {
      setChartLoading(false);
      return;
    }
    setChartLoading(true);
    try {
      const points = await buildPortfolioHistory(
        transactions, coinsRef.current, period
      );
      setChartData(points);

      // Calculate P&L for this period
      if (points.length >= 2) {
        const first = points[0].value;
        const last  = points[points.length - 1].value;
        const pnl   = last - first;
        const pct   = first > 0 ? (pnl / first) * 100 : 0;
        setPeriodPnl(pnl);
        setPeriodPnlPct(pct);
      }
    } catch (err) {
      console.error('Portfolio chart error:', err);
    } finally {
      setChartLoading(false);
    }
  }, [transactions, period]);

  useEffect(() => { buildChart(); }, [buildChart]);

  // Format timestamp to readable label
  const formatTime = useCallback((timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    switch (period) {
      case '24H':
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit'
        });
      case '7D':
        return date.toLocaleDateString('en-US', {
          weekday: 'short'
        });
      case '1M':
        return date.toLocaleDateString('en-US', {
          month: 'short', day: 'numeric'
        });
      case '3M':
      case '1Y':
      case 'ALL':
        return date.toLocaleDateString('en-US', {
          month: 'short', day: 'numeric'
        });
      default:
        return date.toLocaleDateString();
    }
  }, [period]);

  // Format chart data and dynamically bind the real-time totalValue to the very last point
  const formattedData = useMemo(() => {
    if (chartData.length === 0) return [];
    return chartData.map((p, idx) => {
      const isLastPoint = idx === chartData.length - 1;
      let val = p.value;

      if (isLastPoint && totalValue > 0) {
        val = totalValue;
      }

      return {
        time: formatTime(p.time),
        value: parseFloat(val.toFixed(2)),
        timestamp: p.time,
      };
    });
  }, [chartData, totalValue, formatTime]);

  // Chart colors & styling based on performance
  const isPositive = periodPnl >= 0;
  const lineColor  = isPositive ? '#10b981' : '#f43f5e'; // Vibrant Emerald or Rose
  const gradientId = `portfolioGradient_${period}`;

  // Y-axis domain with padding
  const values = formattedData.map(d => d.value);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  const padding = (maxVal - minVal) * 0.08 || maxVal * 0.03;
  const yMin = Math.max(0, minVal - padding);
  const yMax = maxVal + padding;

  const isUp = totalPnl >= 0;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-card to-card/95 border border-border/80 rounded-3xl p-6 shadow-xl shadow-black/5 hover:border-border transition-all duration-300">
      
      {/* Background radial highlight glow */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-[0.03] transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${lineColor} 0%, transparent 80%)`
        }}
      />

      {/* Header — portfolio value */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Total Portfolio Value
            </p>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-500 font-bold tracking-wide animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              LIVE
            </div>
          </div>
          
          {loading ? (
            <div className="h-10 w-44 rounded-xl bg-muted/60 animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-extrabold text-foreground font-sans tracking-tight leading-none">
                ${totalValue.toLocaleString('en-US',
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
          )}
          
          {!loading && (
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold tracking-tight
                ${isUp 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' 
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
                }`}>
                {isUp
                  ? <ArrowUpRight className="w-3.5 h-3.5" />
                  : <ArrowDownRight className="w-3.5 h-3.5" />
                }
                <span>
                  {isUp ? '+' : ''}${Math.abs(totalPnl).toLocaleString(
                    'en-US', { maximumFractionDigits: 2 }
                  )}{' '}
                  ({isUp ? '+' : ''}{totalPnlPercent.toFixed(2)}%)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
                all time
              </span>
            </div>
          )}
        </div>

        {/* Period selector - Pill style */}
        <div className="flex items-center bg-muted/40 border border-border/60 rounded-2xl p-1 self-start sm:self-center">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer
                transition-all duration-200 ${period === p
                  ? 'bg-background text-foreground shadow-md border border-border/50 scale-[1.03]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Period P&L indicator */}
      {!chartLoading && chartData.length > 1 && (
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold">
          <span className="text-muted-foreground uppercase tracking-wider">Period Performance:</span>
          <span className={`inline-flex items-center gap-0.5 font-bold ${periodPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {periodPnl >= 0 ? '+' : ''}
            ${Math.abs(periodPnl).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            {' '}({periodPnlPct >= 0 ? '+' : ''}{periodPnlPct.toFixed(2)}%)
          </span>
          <span className="text-muted-foreground font-medium bg-muted/65 px-2 py-0.5 rounded-md">
            this {period}
          </span>
        </div>
      )}

      {/* Chart wrapper */}
      <div className="h-56 relative w-full mt-2">
        {chartLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/10 rounded-2xl">
            <div className="w-8 h-8 border-3 border-border/80 border-t-primary rounded-full animate-spin" />
            <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase animate-pulse">
              Reconstructing Ledger...
            </p>
          </div>
        ) : formattedData.length < 2 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-dashed border-border/70 rounded-2xl bg-muted/10 p-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">
              Awaiting First Transaction
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-xs font-medium leading-relaxed">
              Place a swap order, complete a crypto deposit, or activate a virtual card to populate your live equity curve.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 8, right: 4, bottom: 0, left: -10 }}>

              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={lineColor}
                    stopOpacity={0.22}
                  />
                  <stop
                    offset="100%"
                    stopColor={lineColor}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="6 6"
                stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
                vertical={false}
              />

              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 10,
                  fontWeight: 650,
                  fill: isDark ? '#64748b' : '#94a3b8',
                }}
                dy={6}
                interval="preserveStartEnd"
              />

              <YAxis
                domain={[yMin, yMax]}
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 10,
                  fontWeight: 650,
                  fill: isDark ? '#64748b' : '#94a3b8',
                }}
                tickFormatter={v =>
                  v >= 1000
                    ? '$' + (v / 1000).toFixed(1) + 'k'
                    : '$' + v.toFixed(0)
                }
                width={65}
              />

              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  stroke: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                  strokeWidth: 1.5,
                  strokeDasharray: '5 5',
                }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: lineColor,
                  stroke: isDark ? '#020617' : '#ffffff',
                  strokeWidth: 2.5,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Extra Stat Badges for Premium aesthetics */}
      {!chartLoading && formattedData.length >= 2 && (
        <div className="grid grid-cols-3 gap-3 border-t border-border/50 pt-4 mt-4">
          <div className="flex flex-col bg-muted/20 border border-border/30 rounded-2xl p-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Period High</span>
            <span className="text-sm font-extrabold text-foreground mt-0.5">
              ${maxVal.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col bg-muted/20 border border-border/30 rounded-2xl p-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Period Low</span>
            <span className="text-sm font-extrabold text-foreground mt-0.5">
              ${minVal.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col bg-muted/20 border border-border/30 rounded-2xl p-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Volatility</span>
            <span className="text-sm font-extrabold text-primary mt-0.5">
              {((maxVal - minVal) / (minVal || 1) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Refresh bar footer */}
      <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-4 text-[10px] text-muted-foreground font-semibold">
        <div className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>WebSocket Feed Connected</span>
        </div>
        <button
          onClick={buildChart}
          disabled={chartLoading}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 font-bold uppercase tracking-wider cursor-pointer">
          <RefreshCw className={`w-3 h-3 ${chartLoading ? 'animate-spin' : ''}`} />
          Recalculate
        </button>
      </div>
    </div>
  );
}
