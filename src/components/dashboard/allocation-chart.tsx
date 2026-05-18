"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AllocationData {
  name: string;
  value: number;
  color: string;
}

interface AllocationChartProps {
  data: AllocationData[];
  totalAssets: number;
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ev-card px-3 py-2 text-xs shadow-ev-3 bg-background/90 backdrop-blur border border-border/40 rounded-xl">
      <p className="font-bold">{payload[0].name}</p>
      <p className="text-muted-foreground">${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
    </div>
  );
}

export default function AllocationChart({ data, totalAssets }: AllocationChartProps) {
  return (
    <div className="relative w-full h-[140px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={62}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((a, i) => (
              <Cell key={i} fill={a.color} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Assets</p>
        <p className="text-lg font-black">{totalAssets}</p>
      </div>
    </div>
  );
}
