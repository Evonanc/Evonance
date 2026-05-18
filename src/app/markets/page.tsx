"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Navbar } from "@/components/shared/navbar";
import { MarketTicker } from "@/components/shared/market-ticker";
import { Footer } from "@/components/shared/footer";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search, TrendingUp, TrendingDown, Star, Filter,
  ArrowUpRight, Zap, BarChart3, ChevronRight, RefreshCw, Activity, Globe
} from "lucide-react";
import Link from "next/link";
import { getMarketAssets, getBatchPrices, getBybitPrices, getGlobalStats, isBybitLive } from "@/services/market";
import type { MarketAsset } from "@/types/database";

const CATEGORIES = ["All", "Layer 1", "DeFi", "AI & Data", "Infrastructure", "Stablecoins", "Altcoins"];

const COIN_COLOR: Record<string, string> = {
  BTC: "#F7931A", ETH: "#627EEA", SOL: "#9945FF", BNB: "#F3BA2F",
  XRP: "#346AA9", ADA: "#3468D1", AVAX: "#E84142", LINK: "#2A5ADA",
  UNI: "#FF007A", FET: "#1B1B1B", RNDR: "#F53624", DOGE: "#C2A633", USDT: "#26A17B", USDC: "#2775CA"
};

function Spark({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return <div className="w-20 h-7 bg-secondary/50 rounded animate-pulse" />;
  const min = Math.min(...data), max = Math.max(...data);
  const r = max - min || 1;
  const w = 80, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / r) * h}`).join(" ");
  const color = positive ? "#22C55E" : "#EF4444";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

export default function MarketsPage() {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [global, setGlobal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [starred, setStarred] = useState<Set<string>>(new Set(["BTC", "ETH"]));
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [feedLive, setFeedLive] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [marketAssets, stats] = await Promise.all([
        getMarketAssets(50),
        getGlobalStats()
      ]);
      setAssets(marketAssets);
      setGlobal(stats);
      
      const symbols = marketAssets.map(a => a.symbol);
      const livePrices = await getBatchPrices(symbols);
      setPrices(livePrices);
      setFeedLive(isBybitLive());
    } catch (err) {
      console.error("Market data fetch failed:", err);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(async () => {
      const bybit = await getBybitPrices();
      
      // Update prices for instant rendering
      setPrices(prev => {
        const next = { ...prev };
        Object.entries(bybit).forEach(([sym, d]) => {
          next[sym] = d.price;
        });
        return next;
      });

      // Update assets to sync 24h changes and volume
      setAssets(prev => prev.map(asset => {
        const live = bybit[asset.symbol.toUpperCase()];
        if (live) {
          return {
            ...asset,
            current_price: live.price,
            price_change_percentage_24h: live.change24h,
            total_volume: live.volume24h || asset.total_volume
          };
        }
        return asset;
      }));

      setFeedLive(isBybitLive());
      setLastUpdate(new Date());
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleStar = (sym: string) => {
    const s = new Set(starred);
    s.has(sym) ? s.delete(sym) : s.add(sym);
    setStarred(s);
  };

  const filtered = assets.filter(a =>
    (category === "All" || a.category === category) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) ||
     a.symbol.toLowerCase().includes(search.toLowerCase()))
  );

  const gainers = [...assets]
    .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
    .slice(0, 3);

  const topVol = [...assets]
    .sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0))
    .slice(0, 3);

  const formatNum = (num: number) => {
    const absNum = Math.abs(num);
    const sign = num < 0 ? "-" : "";
    if (absNum >= 1e12) return `${sign}$${(absNum / 1e12).toFixed(2)}T`;
    if (absNum >= 1e9) return `${sign}$${(absNum / 1e9).toFixed(2)}B`;
    if (absNum >= 1e6) return `${sign}$${(absNum / 1e6).toFixed(2)}M`;
    return `${sign}$${absNum.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" aria-hidden="true" />
      <MarketTicker />

      <section className="relative pt-12 pb-14 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]"
          style={{ background: "radial-gradient(ellipse, rgba(0,82,255,0.07) 0%, transparent 70%)" }} />
        <div className="page-container relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-label">Live Markets</span>
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full border",
                  feedLive
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-amber-500/10 border-amber-500/20"
                )}>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    feedLive ? "bg-green-500" : "bg-amber-400"
                  )} />
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    feedLive ? "text-green-500" : "text-amber-400"
                  )}>
                    {feedLive ? "Bybit Live" : "Data Cached"}
                  </span>
                </div>
              </div>
              <h1 className="text-h1 mb-4">
                Institutional <span className="ev-gradient-text">Real-Time Data</span>
              </h1>
              <p className="text-muted-foreground text-base">
                Track assets with sub-second accuracy powered by Bybit V5 connectivity.
              </p>
            </div>
            
            <div className="ev-card px-4 py-2 border-primary/20 bg-primary/5 flex items-center gap-3 shrink-0">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Last Update</p>
                <p className="text-xs font-mono font-bold">{lastUpdate.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Global Market Cap", value: global ? formatNum(global.total_market_cap) : "..." },
              { label: "24h Volume",        value: global ? formatNum(global.total_volume) : "..." },
              { label: "BTC Dominance",     value: global ? `${global.market_cap_percentage.btc.toFixed(1)}%` : "..."  },
              { label: "Active Assets",     value: global ? global.active_cryptocurrencies.toLocaleString() : "..."   },
            ].map(s => (
              <div key={s.label} className="ev-card p-4">
                <p className="text-label mb-1.5">{s.label}</p>
                <p className="text-lg font-black font-display ev-gradient-text">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-6">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="ev-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <p className="text-sm font-bold">Top Gainers</p>
                </div>
              </div>
              <div className="space-y-3">
                {gainers.map(a => (
                  <div key={a.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg text-[9px] font-black text-white flex items-center justify-center shadow-sm"
                        style={{ background: COIN_COLOR[a.symbol.toUpperCase()] || "#6b7280" }}>
                        {a.symbol.slice(0,2).toUpperCase()}
                      </div>
                      <p className="text-xs font-bold">{a.symbol.toUpperCase()}</p>
                    </div>
                    <span className="badge-up text-[10px] font-bold">
                      <TrendingUp className="w-3 h-3" />+{(a.price_change_percentage_24h || 0).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ev-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm font-bold">Top Volume (24h)</p>
              </div>
              <div className="space-y-3">
                {topVol.map(a => (
                  <div key={a.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg text-[9px] font-black text-white flex items-center justify-center shadow-sm"
                        style={{ background: COIN_COLOR[a.symbol.toUpperCase()] || "#6b7280" }}>
                        {a.symbol.slice(0,2).toUpperCase()}
                      </div>
                      <p className="text-xs font-bold">{a.symbol.toUpperCase()}</p>
                    </div>
                    <p className="text-[11px] font-mono font-bold text-muted-foreground">
                      {formatNum(a.total_volume || 0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                    category === cat
                      ? "ev-gradient text-white shadow-glow-primary"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-secondary border border-border rounded-xl outline-none focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="ev-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-border">
                    {["#", "Asset", "Price", "24h %", "Market Cap", "Volume", "7D Chart", ""].map((h, i) => (
                      <th
                        key={i}
                        className={cn(
                          "py-4 px-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground whitespace-nowrap",
                          i === 0 || i === 7 ? "w-10" : "",
                          i >= 2 ? "text-right" : "text-left",
                          i === 6 ? "text-center" : ""
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Initializing real-time feed...</p>
                      </td>
                    </tr>
                  ) : filtered.map((asset, idx) => {
                    const price = prices[asset.symbol.toUpperCase()] || asset.current_price || 0;
                    const change = asset.price_change_percentage_24h || 0;
                    const isUp = change >= 0;
                    return (
                      <motion.tr
                        key={asset.symbol}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.01 }}
                        className="group hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleStar(asset.symbol)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Star className={cn("w-3 h-3", starred.has(asset.symbol) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                            </button>
                            <span className="text-xs text-muted-foreground font-medium">{idx + 1}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm"
                              style={{ background: COIN_COLOR[asset.symbol.toUpperCase()] ?? "#6b7280" }}
                            >
                              {asset.symbol.slice(0,3).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{asset.name}</p>
                              <p className="text-[11px] text-muted-foreground uppercase">{asset.symbol}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex flex-col items-end">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                              <p className="text-sm font-bold font-mono">
                                ${price.toLocaleString("en-US", { minimumFractionDigits: price < 1 ? 4 : 2, maximumFractionDigits: price < 1 ? 4 : 2 })}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold",
                            isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"
                          )}>
                            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isUp ? "+" : ""}{change.toFixed(2)}%
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <p className="text-sm text-foreground/70 font-medium">{formatNum(asset.market_cap || 0)}</p>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <p className="text-sm text-foreground/70 font-medium">{formatNum(asset.total_volume || 0)}</p>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <Spark data={asset.sparkline_in_7d?.price || []} positive={isUp} />
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/trade?symbol=${asset.symbol.toUpperCase()}`}
                            className="inline-flex items-center gap-1 h-7 px-3 rounded-lg border border-border text-xs font-medium hover:border-primary hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                          >
                            Trade <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-sm text-muted-foreground">No assets found for &quot;{search}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
