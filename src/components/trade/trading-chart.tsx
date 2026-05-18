"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartData {
  t: string;
  v: number;
}

interface TradingChartProps {
  data: ChartData[];
  priceChange: number;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-ev-3">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-bold text-foreground">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

export default function TradingChart({ data, priceChange }: TradingChartProps) {
  const isPositive = priceChange >= 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="tradeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? "#22C55E" : "#EF4444"} stopOpacity={0.15} />
            <stop offset="100%" stopColor={isPositive ? "#22C55E" : "#EF4444"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 9, fill: "#6b7280" }}
          axisLine={false} tickLine={false} width={58}
          domain={["auto", "auto"]}
          tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(1)}`}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone" dataKey="v"
          stroke={isPositive ? "#22C55E" : "#EF4444"}
          strokeWidth={1.5}
          fill="url(#tradeGrad)"
          dot={false}
          isAnimationActive={false} // Faster rendering
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
