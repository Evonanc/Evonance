"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight,
  Eye, EyeOff, TrendingUp, TrendingDown,
  Copy, Check, QrCode, Plus, Search, RefreshCw
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/auth-context";
import { getPortfolioSummary, getRecentTransactions } from "@/services/portfolio";
import { getBybitPrices } from "@/services/market";
import type { PortfolioSummary, Transaction, PortfolioAsset } from "@/types/database";
import { DepositModal } from "@/components/dashboard/deposit-modal";
import { WithdrawalModal } from "@/components/dashboard/withdrawal-modal";

const AllocationChart = dynamic(() => import("@/components/dashboard/allocation-chart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[140px] rounded-full border-4 border-secondary animate-pulse flex items-center justify-center">
       <div className="w-12 h-12 rounded-full bg-secondary/40" />
    </div>
  )
});

const TX_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  receive: { bg: "bg-green-500/10", text: "text-green-500", icon: ArrowDownLeft },
  send:    { bg: "bg-red-400/10",   text: "text-red-400",   icon: ArrowUpRight  },
  swap:    { bg: "bg-primary/10",   text: "text-primary",   icon: ArrowLeftRight},
  trade:   { bg: "bg-accent/10",    text: "text-accent",    icon: TrendingUp    },
};

const COIN_COLORS: Record<string, string> = {
  BTC: "#F7931A", ETH: "#627EEA", SOL: "#9945FF", USDT: "#26A17B", USDC: "#2775CA", BNB: "#F3BA2F"
};


export default function WalletPage() {
  const { user } = useAuth();
  const [showBal, setShowBal] = useState(true);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<PortfolioAsset | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [port, txns] = await Promise.all([
      getPortfolioSummary(user.id),
      getRecentTransactions(user.id, 10)
    ]);
    setPortfolio(port);
    setTransactions(txns as Transaction[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    const interval = setInterval(async () => {
      if (user) {
        const port = await getPortfolioSummary(user.id);
        setPortfolio(port);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [load, user]);

  const filteredAssets = useMemo(() => {
    if (!portfolio) return [];
    return portfolio.assets.filter(a =>
      a.asset.name.toLowerCase().includes(search.toLowerCase()) ||
      a.asset.symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [portfolio, search]);

  const txFiltered = useMemo(() => {
    if (activeTab === "all") return transactions;
    return transactions.filter(t => t.type === activeTab);
  }, [transactions, activeTab]);

  const copyAddress = () => {
    navigator.clipboard.writeText("0x742d35Cc6634C0532925a3b8D4C9e5C8aB4");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = useMemo(() => {
    if (!portfolio || portfolio.assets.length === 0) return [];
    
    const topAssets = portfolio.assets.slice(0, 5).map(a => ({
      name: a.asset.symbol.toUpperCase(),
      value: a.value_usd,
      color: COIN_COLORS[a.asset.symbol.toUpperCase()] || "#6b7280"
    }));

    if (portfolio.assets.length > 5) {
      const othersValue = portfolio.assets.slice(5).reduce((acc, a) => acc + a.value_usd, 0);
      topAssets.push({
        name: "Others",
        value: othersValue,
        color: "#94a3b8"
      });
    }
    
    return topAssets;
  }, [portfolio]);

  const handleDeposit = (asset?: PortfolioAsset) => {
    setSelectedAsset(asset || null);
    setShowDeposit(true);
  };

  const handleWithdraw = (asset?: PortfolioAsset) => {
    setSelectedAsset(asset || null);
    setShowWithdraw(true);
  };

  if (loading) return (
    <DashboardLayout title="Wallet">
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Wallet">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display">My Wallet</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your digital assets and history</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleDeposit()} className="h-9 px-4 rounded-xl border border-border text-xs font-medium hover:bg-secondary flex items-center gap-2 transition-all">
              <QrCode className="w-3.5 h-3.5" /> Receive
            </button>
            <button onClick={() => handleDeposit()} className="h-9 px-4 rounded-xl ev-gradient text-white text-xs font-semibold shadow-glow-primary flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Deposit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 ev-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,82,255,0.06), transparent 70%)" }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <p className="text-label">Total Portfolio</p>
                <button onClick={() => setShowBal(!showBal)} className="text-muted-foreground hover:text-foreground">
                  {showBal ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-4xl font-black font-display tracking-tight mb-2">
                {showBal ? `$${(portfolio?.total_usd || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••••"}
              </p>
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center gap-1 text-xs font-bold", (portfolio?.change_24h_usd || 0) >= 0 ? "text-green-500" : "text-red-400")}>
                  {(portfolio?.change_24h_usd || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {(portfolio?.change_24h_usd || 0) >= 0 ? "+" : ""}${(portfolio?.change_24h_usd || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({(portfolio?.change_24h_pct || 0).toFixed(2)}%) today
                </span>
              </div>

              <div className="flex items-center gap-2 mt-6 p-3 bg-secondary/60 rounded-xl">
                <p className="text-xs font-mono text-muted-foreground flex-1 truncate">0x742d35Cc6634C0532925a3b8D4C9e5C8aB4</p>
                <button onClick={copyAddress} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex gap-3 mt-4">
                {[
                  { label: "Deposit",  icon: ArrowDownLeft,  cls: "ev-gradient text-white shadow-glow-primary", onClick: () => handleDeposit() },
                  { label: "Withdraw", icon: ArrowUpRight,    cls: "border border-border hover:bg-secondary", onClick: () => handleWithdraw() },
                  { label: "Swap",     icon: ArrowLeftRight,  cls: "border border-border hover:bg-secondary", onClick: () => {} },
                ].map(a => (
                  <button key={a.label} onClick={a.onClick} className={cn("flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold transition-all", a.cls)}>
                    <a.icon className="w-3.5 h-3.5" /> {a.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="ev-card p-6 flex flex-col">
            <p className="text-label mb-4">Allocation</p>
            <AllocationChart data={chartData} totalAssets={portfolio?.assets.length || 0} />
            <div className="space-y-1.5 mt-2">
              {chartData.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                    <span className="font-medium">{a.name}</span>
                  </div>
                  <span className="text-muted-foreground">{((a.value / (portfolio?.total_usd || 1)) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="ev-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold">Assets</h2>
            <div className="relative w-52">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets…" className="w-full h-8 pl-9 pr-3 text-xs bg-secondary rounded-xl outline-none focus:ring-1 focus:ring-primary/30" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  {["Asset", "Balance", "Price", "24h %", "Value", ""].map((h, i) => (
                    <th key={i} className={cn("pb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", i === 0 ? "text-left" : "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredAssets.map(a => (
                  <tr key={a.asset.id} className="group hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl ev-gradient flex items-center justify-center text-[9px] font-black text-white">
                          {a.asset.symbol.slice(0,3).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{a.asset.name}</p>
                          <p className="text-[11px] text-muted-foreground uppercase">{a.asset.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-right"><p className="text-sm font-mono font-medium">{a.balance.toFixed(4)}</p></td>
                    <td className="py-3.5 text-right"><p className="text-sm font-mono">${a.price_usd.toLocaleString("en-US", { minimumFractionDigits: a.price_usd < 1 ? 4 : 2 })}</p></td>
                    <td className="py-3.5 text-right">
                      <span className={cn("text-xs font-semibold", a.change_24h_pct >= 0 ? "text-green-500" : "text-red-400")}>
                        {a.change_24h_pct >= 0 ? "+" : ""}{a.change_24h_pct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 text-right"><p className="text-sm font-bold">${a.value_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p></td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/trade?symbol=${a.asset.symbol.toUpperCase()}`} className="h-6 px-2.5 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold flex items-center">Trade</Link>
                        <button onClick={() => handleDeposit(a)} className="h-6 px-2.5 rounded-lg bg-secondary text-muted-foreground text-[10px] font-semibold hover:text-foreground">Deposit</button>
                        <button onClick={() => handleWithdraw(a)} className="h-6 px-2.5 rounded-lg bg-secondary text-muted-foreground text-[10px] font-semibold hover:text-foreground">Send</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="ev-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold">Transaction History</h2>
            <div className="flex gap-1 overflow-x-auto hide-scrollbar">
              {["all","receive","send","swap","trade"].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} className={cn("px-3 h-7 rounded-lg text-xs font-medium capitalize transition-all", activeTab === t ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>{t}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            {txFiltered.map(tx => {
              const config = TX_COLORS[tx.type] || { bg: "bg-secondary", text: "text-muted-foreground", icon: Plus };
              const { bg, text, icon: Icon } = config;
              return (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group cursor-pointer">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", bg)}><Icon className={cn("w-4 h-4", text)} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate pr-4">{tx.description}</p>
                      <p className={cn("text-sm font-bold", tx.amount >= 0 ? "text-green-500" : "text-foreground")}>
                        {tx.amount >= 0 ? "+" : ""}${tx.usd_value.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[11px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()} · {new Date(tx.created_at).toLocaleTimeString()}</p>
                      <p className="text-[10px] font-mono text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-[100px]">{tx.reference_id || "direct"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <DepositModal 
        isOpen={showDeposit} 
        onClose={() => setShowDeposit(false)} 
        asset={selectedAsset ? { symbol: selectedAsset.asset.symbol, name: selectedAsset.asset.name } : undefined} 
      />
      <WithdrawalModal 
        isOpen={showWithdraw} 
        onClose={() => setShowWithdraw(false)} 
        asset={selectedAsset ? { id: selectedAsset.asset.id, symbol: selectedAsset.asset.symbol, name: selectedAsset.asset.name, balance: selectedAsset.balance } : undefined} 
      />
    </DashboardLayout>
  );
}
