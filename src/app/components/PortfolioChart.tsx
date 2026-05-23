import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from 'next-themes';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
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

// Custom tooltip component
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2
      shadow-lg text-xs">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-bold text-foreground text-sm">
        ${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function PortfolioChart({
  transactions, coins, totalValue,
  totalPnl, totalPnlPercent, loading
}: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [period, setPeriod]       = useState<PeriodKey>('1M');
  const [chartData, setChartData] = useState<PortfolioPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [periodPnl, setPeriodPnl] = useState(0);
  const [periodPnlPct, setPeriodPnlPct] = useState(0);

  const buildChart = useCallback(async () => {
    if (transactions.length === 0 || coins.length === 0) {
      setChartLoading(false);
      return;
    }
    setChartLoading(true);
    try {
      const points = await buildPortfolioHistory(
        transactions, coins, period
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
  }, [transactions, coins, period]);

  useEffect(() => { buildChart(); }, [buildChart]);

  // Format timestamp to readable label
  const formatTime = (timestamp: number): string => {
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
  };

  // Format chart data for recharts
  const formattedData = chartData.map(p => ({
    time: formatTime(p.time),
    value: parseFloat(p.value.toFixed(2)),
    timestamp: p.time,
  }));

  // Chart colors
  const isPositive = periodPnl >= 0;
  const lineColor  = isPositive ? '#22c55e' : '#ef4444';
  const gradientId = `portfolioGradient_${period}`;

  // Y-axis domain with padding
  const values = formattedData.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.1 || maxVal * 0.05;
  const yMin = Math.max(0, minVal - padding);
  const yMax = maxVal + padding;

  const isUp = totalPnl >= 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">

      {/* Header — portfolio value */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1 font-semibold">
            Total Portfolio Value
          </p>
          {loading ? (
            <div className="h-9 w-40 rounded-lg bg-secondary animate-pulse" />
          ) : (
            <h2 className="text-3xl font-bold text-foreground font-sans">
              ${totalValue.toLocaleString('en-US',
                { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          )}
          {!loading && (
            <div className={`flex items-center gap-1.5 mt-1 text-sm
              font-semibold ${isUp ? 'text-success' : 'text-destructive'}`}>
              {isUp
                ? <TrendingUp className="w-4 h-4" />
                : <TrendingDown className="w-4 h-4" />
              }
              <span>
                {isUp ? '+' : ''}${Math.abs(totalPnl).toLocaleString(
                  'en-US', { maximumFractionDigits: 2 }
                )}{' '}
                ({isUp ? '+' : ''}{totalPnlPercent.toFixed(2)}%)
              </span>
              <span className="text-muted-foreground font-semibold">
                all time
              </span>
            </div>
          )}
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 bg-secondary
          rounded-xl p-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer
                transition-all ${period === p
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Period P&L indicator */}
      {!chartLoading && chartData.length > 1 && (
        <div className={`flex items-center gap-2 mb-4 text-sm
          font-semibold ${periodPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
          {periodPnl >= 0
            ? <TrendingUp className="w-4 h-4" />
            : <TrendingDown className="w-4 h-4" />
          }
          <span>
            {periodPnl >= 0 ? '+' : ''}
            ${Math.abs(periodPnl).toLocaleString('en-US',
              { maximumFractionDigits: 2 })}
            {' '}({periodPnlPct >= 0 ? '+' : ''}
            {periodPnlPct.toFixed(2)}%)
          </span>
          <span className="text-muted-foreground font-semibold">
            this {period}
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="h-48 relative">
        {chartLoading ? (
          <div className="absolute inset-0 flex flex-col items-center
            justify-center gap-2">
            <div className="w-6 h-6 border-2 border-border border-t-primary
              rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">
              Building portfolio history...
            </p>
          </div>
        ) : formattedData.length < 2 ? (
          <div className="absolute inset-0 flex flex-col items-center
            justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex
              items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Not enough data yet
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-xs font-semibold">
              Make some trades or deposits to see your
              portfolio chart history
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>

              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={lineColor}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={lineColor}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(0,0,0,0.04)'
                }
                vertical={false}
              />

              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 11,
                  fill: isDark ? '#64748b' : '#94a3b8',
                }}
                interval="preserveStartEnd"
              />

              <YAxis
                domain={[yMin, yMax]}
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 11,
                  fill: isDark ? '#64748b' : '#94a3b8',
                }}
                tickFormatter={v =>
                  v >= 1000
                    ? '$' + (v / 1000).toFixed(1) + 'k'
                    : '$' + v.toFixed(0)
                }
                width={60}
              />

              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  stroke: isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.1)',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: lineColor,
                  stroke: isDark ? '#111827' : '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Refresh button */}
      <div className="flex justify-end mt-3">
        <button
          onClick={buildChart}
          disabled={chartLoading}
          className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer
            hover:text-foreground transition-colors disabled:opacity-50 font-semibold">
          <RefreshCw className={`w-3 h-3 ${
            chartLoading ? 'animate-spin' : ''
          }`} />
          Refresh chart
        </button>
      </div>
    </div>
  );
}
