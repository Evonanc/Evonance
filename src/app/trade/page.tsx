"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ChevronDown, Search, Star, Bell, Settings,
  ArrowUpRight, ArrowDownLeft, Activity, X,
  Check, AlertCircle, RefreshCw
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { getMarketAssets, getBatchPrices, getAssetPrice, getBybitPrices } from "@/services/market";
import { submitTrade, getTradeHistory } from "@/services/trade";
import type { SupportedAsset, MarketAsset, Trade } from "@/types/database";

const TradingChart = dynamic(() => import("@/components/trade/trading-chart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-secondary/20 animate-pulse rounded-xl flex items-center justify-center">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Loading Analytics...</p>
    </div>
  )
});

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"];
const ORDER_TYPES = ["Limit", "Market", "Stop-Limit"];
const PERCENT_STEPS = [25, 50, 75, 100];


export default function TradePage() {
  const { user } = useAuth();
  const [marketAssets, setMarketAssets] = useState<MarketAsset[]>([]);
  const [activeAsset, setActiveAsset] = useState<MarketAsset | null>(null);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<Trade[]>([]);
  
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState("Market");
  const [timeframe, setTimeframe] = useState("15m");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchTradeHistory = useCallback(async (uid: string) => {
    const data = await getTradeHistory(uid, 20);
    setHistory(data as Trade[]);
  }, []);

  const fetchBalances = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data: wallets } = await supabase.from("wallets").select("id").eq("user_id", uid).single();
    if (wallets) {
      const { data: bal } = await supabase.from("wallet_balances").select("asset_id, balance").eq("wallet_id", wallets.id);
      if (bal) {
        const bMap: Record<string, number> = {};
        bal.forEach(b => bMap[b.asset_id] = Number(b.balance));
        setBalances(bMap);
      }
    }
  }, []);

  useEffect(() => {
    async function init() {
      const mkts = await getMarketAssets(12);
      setMarketAssets(mkts);
      if (!activeAsset) setActiveAsset(mkts[0]);
      if (user) {
        await Promise.all([fetchBalances(user.id), fetchTradeHistory(user.id)]);
      }
      setLoading(false);
    }
    init();

    // High-frequency real-time updates (2s)
    const interval = setInterval(async () => {
      const bybit = await getBybitPrices();
      
      setMarketAssets(prev => prev.map(m => {
        const p = bybit[m.symbol.toUpperCase()];
        return p ? { ...m, current_price: p.price } : m;
      }));

      setActiveAsset(prev => {
        if (!prev) return prev;
        const p = bybit[prev.symbol.toUpperCase()];
        return p ? { ...prev, current_price: p.price } : prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [user, activeAsset?.id, fetchBalances, fetchTradeHistory]);

  const handleSubmit = async () => {
    if (!user || !activeAsset || !amount) return;
    setStatus(null);
    setSubmitting(true);
    
    const res = await submitTrade(user.id, {
      pair: `${activeAsset.symbol.toUpperCase()}/USDT`,
      baseAsset: activeAsset.id,
      quoteAsset: "tether",
      side,
      amount: parseFloat(amount),
      price: activeAsset.current_price
    });
    
    if (res.success) {
      setStatus({ type: "success", msg: "Order filled successfully!" });
      setAmount("");
      await Promise.all([fetchBalances(user.id), fetchTradeHistory(user.id)]);
    } else {
      setStatus({ type: "error", msg: res.error || "Order failed" });
    }
    setSubmitting(false);
    setTimeout(() => setStatus(null), 5000);
  };

  const filteredPairs = marketAssets.filter(p =>
    p.symbol.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const availableUsdt = balances["tether"] || 0;
  const availableBase = activeAsset ? balances[activeAsset.id] || 0 : 0;
  const currentPrice  = activeAsset?.current_price || 0;
  const totalUsdt    = amount ? parseFloat(amount) * currentPrice : 0;

  const chartData = useMemo(() => {
    if (!activeAsset?.sparkline_in_7d?.price) return [];
    const baseData = activeAsset.sparkline_in_7d.price.slice(-24).map((v, i) => ({
      t: `${i}:00`,
      v: v
    }));
    
    // Add current live price as the most recent point
    if (currentPrice > 0) {
      baseData.push({
        t: "Now",
        v: currentPrice
      });
    }
    return baseData;
  }, [activeAsset, currentPrice]);

  if (loading) return (
    <div className="h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Exchange...</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden font-sans">
      {/* ── Top Bar ── */}
      <header className="h-12 border-b border-border flex items-center px-4 gap-4 shrink-0 bg-card/60 backdrop-blur-xl overflow-x-auto hide-scrollbar">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-lg ev-gradient flex items-center justify-center">
            <Activity className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold font-display hidden sm:inline">EVONANCE</span>
        </Link>
        <div className="h-4 w-px bg-border shrink-0" />
        
        {activeAsset && (
          <>
            <button className="flex items-center gap-2 shrink-0 group">
              <span className="text-sm font-bold uppercase">{activeAsset.symbol}/USDT</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
            </button>
            <div className="flex items-center gap-5 text-xs overflow-x-auto hide-scrollbar">
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Price</p>
                <p className={cn("font-bold font-mono", activeAsset.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-400")}>
                  ${activeAsset.current_price.toLocaleString()}
                </p>
              </div>
              <div className="hidden md:block">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-none mb-0.5">24h Change</p>
                <p className={cn("font-bold", activeAsset.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-400")}>
                  {activeAsset.price_change_percentage_24h >= 0 ? "+" : ""}{activeAsset.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
              <div className="hidden lg:block">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-none mb-0.5">24h Volume</p>
                <p className="font-bold text-foreground/80">${(activeAsset.total_volume / 1e6).toFixed(1)}M</p>
              </div>
            </div>
          </>
        )}
        
        <div className="ml-auto flex items-center gap-2">
          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
            <Bell className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2">
            Dashboard
          </Link>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─ Pair List ─ */}
        <div className="w-[200px] border-r border-border shrink-0 flex flex-col hidden xl:flex">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search pairs..."
                className="w-full h-7 pl-6 pr-2 text-xs bg-secondary rounded-lg outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredPairs.map(p => (
              <button
                key={p.id} onClick={() => setActiveAsset(p)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-secondary transition-colors",
                  activeAsset?.id === p.id && "bg-primary/8"
                )}
              >
                <div>
                  <p className={cn("text-xs font-semibold leading-none uppercase", activeAsset?.id === p.id && "text-primary")}>
                    {p.symbol}/USDT
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">${(p.total_volume / 1e6).toFixed(1)}M</p>
                </div>
                <p className={cn("text-[11px] font-bold", p.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-400")}>
                  {p.price_change_percentage_24h >= 0 ? "+" : ""}{p.price_change_percentage_24h.toFixed(1)}%
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ─ Center: Chart ─ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-9 border-b border-border flex items-center px-3 gap-1 shrink-0">
            {TIMEFRAMES.map(tf => (
              <button key={tf} onClick={() => setTimeframe(tf)} className={cn("px-2.5 h-6 rounded-md text-[11px] font-medium transition-all", timeframe === tf ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
                {tf}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 min-h-0">
            <TradingChart data={chartData} priceChange={activeAsset?.price_change_percentage_24h || 0} />
          </div>

          <div className="flex-1 border-t border-border flex flex-col overflow-hidden">
            <div className="h-8 border-b border-border flex items-center px-3 gap-4 shrink-0">
              <button className="text-[11px] font-medium border-b border-primary text-foreground pb-0.5">Order History</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-[10px] text-left border-collapse">
                <thead className="sticky top-0 bg-background text-muted-foreground/60 uppercase tracking-widest font-semibold border-b border-border">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Pair</th>
                    <th className="px-3 py-2">Side</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {history.map(t => (
                    <tr key={t.id} className="hover:bg-secondary/30">
                      <td className="px-3 py-2 text-muted-foreground">{new Date(t.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td className="px-3 py-2 font-bold">{t.pair}</td>
                      <td className={cn("px-3 py-2 font-bold", t.side === 'buy' ? 'text-green-500' : 'text-red-400')}>{t.side.toUpperCase()}</td>
                      <td className="px-3 py-2 font-mono">${t.price.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono">{t.amount}</td>
                      <td className="px-3 py-2 font-mono">${t.total_usd.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-green-500 font-semibold">{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center text-muted-foreground/30 uppercase tracking-[0.2em] text-[10px]">
                  No trade history
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─ Right Column: Order Form ─ */}
        <div className="w-[280px] border-l border-border shrink-0 flex flex-col overflow-hidden hidden lg:flex">
          <div className="flex-1 overflow-hidden flex flex-col border-b border-border">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Order Book (Simulated)</p>
            </div>
            <div className="grid grid-cols-3 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              <span>Price</span><span className="text-right">Qty</span><span className="text-right">Total</span>
            </div>
            <div className="flex-1 overflow-hidden space-y-[2px]">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="relative grid grid-cols-3 px-3 py-[2px] text-red-400/80 font-mono text-[10px]">
                   <span>{(currentPrice * (1 + i * 0.0001)).toFixed(2)}</span>
                   <span className="text-right">{(Math.random() * 2).toFixed(3)}</span>
                   <span className="text-right text-muted-foreground">{(Math.random() * 10).toFixed(1)}k</span>
                </div>
              ))}
              <div className="px-3 py-2 bg-secondary/30 border-y border-border flex items-center justify-between">
                 <span className="text-sm font-black text-foreground">${currentPrice.toLocaleString()}</span>
              </div>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="relative grid grid-cols-3 px-3 py-[2px] text-green-500/80 font-mono text-[10px]">
                   <span>{(currentPrice * (1 - i * 0.0001)).toFixed(2)}</span>
                   <span className="text-right">{(Math.random() * 2).toFixed(3)}</span>
                   <span className="text-right text-muted-foreground">{(Math.random() * 10).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 space-y-3 shrink-0">
            <div className="grid grid-cols-2 gap-1 p-1 bg-secondary rounded-xl">
              <button onClick={() => setSide("buy")} className={cn("h-8 rounded-lg text-xs font-bold transition-all", side === "buy" ? "bg-green-500 text-white shadow-glow-green" : "text-muted-foreground hover:text-foreground")}>Buy</button>
              <button onClick={() => setSide("sell")} className={cn("h-8 rounded-lg text-xs font-bold transition-all", side === "sell" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground")}>Sell</button>
            </div>

            {status && (
              <div className={cn("p-2.5 rounded-lg text-[10px] font-bold flex items-center gap-2", status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400')}>
                {status.type === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {status.msg}
              </div>
            )}

            <div className="flex gap-1">
              {ORDER_TYPES.map(ot => (
                <button key={ot} onClick={() => setOrderType(ot)} className={cn("px-2.5 h-6 rounded-lg text-[10px] font-medium flex-1 transition-all", orderType === ot ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>{ot}</button>
              ))}
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Amount ({activeAsset?.symbol.toUpperCase()})</label>
              <input
                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00000"
                className="w-full h-9 px-3 text-xs font-mono bg-secondary border border-border rounded-xl outline-none focus:border-primary/50"
              />
            </div>

            <div className="grid grid-cols-4 gap-1">
              {PERCENT_STEPS.map(p => (
                <button 
                  key={p} 
                  onClick={() => {
                    const bal = side === "buy" ? availableUsdt : availableBase;
                    const val = side === "buy" ? (bal * (p/100)) / currentPrice : bal * (p/100);
                    setAmount(val.toFixed(6));
                  }}
                  className="h-6 rounded-lg text-[10px] font-semibold bg-secondary text-muted-foreground hover:text-foreground transition-all"
                >
                  {p}%
                </button>
              ))}
            </div>

            {totalUsdt > 0 && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-bold font-mono">${totalUsdt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <button
              disabled={submitting || !amount || parseFloat(amount) <= 0}
              onClick={handleSubmit}
              className={cn(
                "w-full h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                side === "buy" ? "bg-green-500 text-white hover:bg-green-600 shadow-glow-green" : "bg-red-500 text-white hover:bg-red-600",
                submitting && "opacity-60 cursor-not-allowed"
              )}
            >
              {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : side.toUpperCase() + " " + activeAsset?.symbol.toUpperCase()}
            </button>

            <p className="text-[9px] text-muted-foreground/60 text-center">
              Available: {side === "buy" ? `$${availableUsdt.toLocaleString()}` : `${availableBase.toFixed(6)} ${activeAsset?.symbol.toUpperCase()}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
