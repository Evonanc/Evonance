"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getPortfolioSummary, getRecentTransactions } from "@/services/portfolio";
import { getMarketAssets, getBybitPrices } from "@/services/market";
import { getUnreadCount } from "@/services/notifications";
import { getMarketNews, type NewsItem } from "@/services/news";
import type { PortfolioSummary, Transaction, MarketAsset } from "@/types/database";
import { TrendingUp, TrendingDown, ArrowRight, BarChart3, Bell, RefreshCw, Clock, Wallet, CreditCard } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function fmt(n: number | undefined | null) { 
  return (n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
}
function fmtPct(n: number | undefined | null) { 
  const val = n ?? 0;
  return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`; 
}

// ── Sparkline SVG ──────────────────────────────────────────────────────────────
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return <div className="w-[72px] h-[28px] bg-secondary/30 rounded" />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const w = 72, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible shrink-0">
      <polyline fill="none" stroke={positive ? "#22C55E" : "#EF4444"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-lg", className)} />;
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [portfolio, setPortfolio]       = useState<PortfolioSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [markets, setMarkets]           = useState<MarketAsset[]>([]);
  const [news, setNews]                 = useState<NewsItem[]>([]);
  const [unread, setUnread]             = useState(0);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [port, txns, mkts, notifCount, newsData] = await Promise.all([
        getPortfolioSummary(user.id),
        getRecentTransactions(user.id, 5),
        getMarketAssets(4),
        getUnreadCount(user.id),
        getMarketNews(),
      ]);
      setPortfolio(port);
      setTransactions(txns as Transaction[]);
      setMarkets(mkts);
      setUnread(notifCount);
      setNews(newsData);
    } catch (err) {
      console.error("Dashboard data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
    // High-frequency real-time updates (2s) for Bybit feed
    const interval = setInterval(async () => {
      if (!user) return;
      
      const [port, bybit] = await Promise.all([
        getPortfolioSummary(user.id),
        getBybitPrices()
      ]);
      
      setPortfolio(port);
      setMarkets(prev => prev.map(m => {
        const live = bybit[m.symbol.toUpperCase()];
        return live ? { ...m, current_price: live.price, price_change_percentage_24h: live.change24h } : m;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [load, user]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const firstName = profile?.first_name ?? user?.user_metadata?.first_name ?? "Trader";

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Good {getTimeOfDay()}, <span className="text-foreground font-semibold">{firstName}</span></p>
          <h1 className="text-2xl font-black font-display mt-0.5">Portfolio Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} className={cn("w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors", refreshing && "animate-spin")}>
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/dashboard/notifications" className="relative w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <Bell className="w-4 h-4" />
            {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center">{unread}</span>}
          </Link>
        </div>
      </div>

      {/* Portfolio Value Card */}
      <div className="relative rounded-3xl p-8 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #0052FF 0%, #7C3AED 100%)" }}>
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/8 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/6 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">Total Portfolio Value</p>
          {loading ? (
            <div className="h-10 w-48 rounded-lg bg-white/20 animate-pulse mb-3" />
          ) : (
            <p className="text-4xl md:text-5xl font-black font-display mb-3">${fmt(portfolio?.total_usd ?? 0)}</p>
          )}
          {loading ? (
            <div className="h-5 w-32 rounded-lg bg-white/20 animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              {(portfolio?.change_24h_usd ?? 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-semibold">
                {(portfolio?.change_24h_usd ?? 0) >= 0 ? "+" : ""}${fmt(Math.abs(portfolio?.change_24h_usd ?? 0))} ({fmtPct(portfolio?.change_24h_pct ?? 0)}) today
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Trade",   href: "/trade",           icon: BarChart3,    color: "text-primary" },
          { label: "Swap",    href: "/dashboard/swap",  icon: ArrowRight,   color: "text-accent" },
          { label: "Wallet",  href: "/dashboard/wallet",icon: Wallet,      color: "text-green-500" },
          { label: "Cards",   href: "/dashboard/cards", icon: CreditCard,   color: "text-yellow-500" },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link key={label} href={href} className="ev-card p-4 flex flex-col items-center gap-2 hover:border-primary/20 hover:shadow-ev-2 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Icon className={cn("w-5 h-5", color)} />
            </div>
            <span className="text-xs font-semibold">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings */}
        <div className="lg:col-span-2 ev-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base">My Holdings</h2>
            <Link href="/dashboard/wallet" className="text-xs text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : portfolio?.assets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">No holdings yet</p>
              <Link href="/dashboard/wallet" className="text-xs text-primary hover:underline">Fund your wallet →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {portfolio?.assets.map((a) => (
                <div key={a.asset.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl ev-gradient flex items-center justify-center text-[10px] font-black text-white shrink-0">
                    {a.asset.symbol.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{a.asset.name}</p>
                    <p className="text-[11px] text-muted-foreground">{a.balance.toFixed(4)} {a.asset.symbol}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">${fmt(a.value_usd)}</p>
                    <p className={cn("text-[11px] font-semibold", a.change_24h_pct >= 0 ? "text-green-500" : "text-red-400")}>
                      {fmtPct(a.change_24h_pct)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="ev-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base">Recent Activity</h2>
            <Link href="/dashboard/transactions" className="text-xs text-primary hover:underline">All</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : transactions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-bold",
                    t.type === "swap" ? "bg-primary/10 text-primary" :
                    t.type === "trade" ? "bg-accent/10 text-accent" :
                    t.type.includes("card") ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-green-500/10 text-green-500"
                  )}>
                    {t.type.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{t.description}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className={cn("text-xs font-bold shrink-0", t.amount >= 0 ? "text-green-500" : "text-foreground")}>
                    {t.amount >= 0 ? "+" : ""}${fmt(Math.abs(t.usd_value))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Market Snapshot */}
        <div className="ev-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base">Live Markets</h2>
            <Link href="/markets" className="text-xs text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {markets.map((m) => {
                const isUp = m.price_change_percentage_24h >= 0;
                const spark = m.sparkline_in_7d?.price ?? [];
                return (
                  <motion.div key={m.id} whileHover={{ y: -2 }} className="p-4 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold">{m.symbol.toUpperCase()}</p>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400")}>
                        {fmtPct(m.price_change_percentage_24h)}
                      </span>
                    </div>
                    <p className="text-sm font-black font-mono">${m.current_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
                    {spark.length > 0 && <div className="mt-2"><Sparkline data={spark.slice(-7)} positive={isUp} /></div>}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Market Insights (News) */}
        <div className="ev-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base">Market Insights</h2>
            <Link href="#" className="text-xs text-primary hover:underline flex items-center gap-1">Analysis <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {loading ? (
            <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0", 
                      item.category === "market" ? "bg-primary" :
                      item.category === "regulation" ? "bg-red-500" :
                      item.category === "tech" ? "bg-purple-500" : "bg-green-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {item.time}</span>
                        <span>{item.source}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
