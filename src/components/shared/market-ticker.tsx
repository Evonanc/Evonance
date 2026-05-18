"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMarketAssets, getBybitPrices } from "@/services/market";
import type { MarketAsset } from "@/types/database";

interface TickerItemProps {
  symbol: string;
  price: number;
  change: number;
}

function TickerItem({ symbol, price, change }: TickerItemProps) {
  const isUp = change >= 0;
  return (
    <div className="flex items-center gap-3 px-5 shrink-0">
      <span className="text-xs font-bold text-foreground uppercase">{symbol}</span>
      <span className="text-xs font-semibold font-mono text-foreground/80">
        ${price.toLocaleString("en-US", { minimumFractionDigits: price < 1 ? 4 : 2, maximumFractionDigits: price < 1 ? 4 : 2 })}
      </span>
      <span className={cn(
        "flex items-center gap-0.5 text-[11px] font-semibold",
        isUp ? "text-green-500" : "text-red-500"
      )}>
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isUp ? "+" : ""}{change.toFixed(2)}%
      </span>
      <span className="w-px h-3 bg-border/60" />
    </div>
  );
}

export function MarketTicker() {
  const [items, setItems] = useState<MarketAsset[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const assets = await getMarketAssets(15);
      setItems(assets);
    };
    fetchData();
    const interval = setInterval(async () => {
      const bybit = await getBybitPrices();
      setItems(prev => prev.map(item => {
        const live = bybit[item.symbol.toUpperCase()];
        return live ? { ...item, current_price: live.price, price_change_percentage_24h: live.change24h } : item;
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const tickerList = [...items, ...items];

  if (items.length === 0) return (
    <div className="h-10 bg-secondary/40 border-y border-border animate-pulse" />
  );

  return (
    <div className="relative bg-secondary/40 border-y border-border overflow-hidden">
      <div className="absolute left-0 inset-y-0 w-16 bg-gradient-to-r from-secondary/40 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-16 bg-gradient-to-l from-secondary/40 to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex items-center py-2.5"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
      >
        {tickerList.map((t, i) => (
          <TickerItem 
            key={`${t.symbol}-${i}`} 
            symbol={t.symbol} 
            price={t.current_price} 
            change={t.price_change_percentage_24h || 0} 
          />
        ))}
      </motion.div>
    </div>
  );
}
