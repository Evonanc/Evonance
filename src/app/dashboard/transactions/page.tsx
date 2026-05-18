"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Search, Filter, Download, ArrowDownLeft, ArrowUpRight, 
  ArrowLeftRight, TrendingUp, RefreshCw, Calendar, ChevronRight,
  Plus
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getRecentTransactions } from "@/services/portfolio";
import type { Transaction } from "@/types/database";

const TX_CONFIG: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  receive: { bg: "bg-green-500/10", text: "text-green-500", icon: ArrowDownLeft },
  send:    { bg: "bg-red-400/10",   text: "text-red-400",   icon: ArrowUpRight  },
  swap:    { bg: "bg-primary/10",   text: "text-primary",   icon: ArrowLeftRight},
  trade:   { bg: "bg-accent/10",    text: "text-accent",    icon: TrendingUp    },
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    async function load() {
      if (!user) return;
      const data = await getRecentTransactions(user.id, 50);
      setTransactions(data as Transaction[]);
      setLoading(false);
    }
    load();
  }, [user]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesTab = activeTab === "all" || t.type === activeTab;
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
                          t.reference_id?.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [transactions, activeTab, search]);

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <DashboardLayout title="Transactions">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold font-display">Transaction History</h1>
            <p className="text-sm text-muted-foreground mt-0.5">A complete record of your account activity</p>
          </div>
          <button className="h-9 px-4 rounded-xl border border-border text-xs font-medium hover:bg-secondary flex items-center gap-2 transition-all">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl w-full md:w-fit overflow-x-auto hide-scrollbar">
            {["all", "receive", "send", "swap", "trade"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 h-8 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap",
                  activeTab === tab ? "bg-white dark:bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-fit">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description or ID..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-secondary border border-border rounded-xl outline-none focus:border-primary/40 transition-all"
              />
            </div>
            <button className="h-9 w-9 shrink-0 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="ev-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="py-4 px-5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Type</th>
                  <th className="py-4 px-5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Description</th>
                  <th className="py-4 px-5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Reference ID</th>
                  <th className="py-4 px-5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Date</th>
                  <th className="py-4 px-5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Amount</th>
                  <th className="py-4 px-5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">Loading history...</p>
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((tx, idx) => {
                    const config = TX_CONFIG[tx.type] || { bg: "bg-secondary", text: "text-muted-foreground", icon: Plus };
                    const Icon = config.icon;
                    return (
                      <motion.tr 
                        key={tx.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.01 }}
                        className="group hover:bg-secondary/20 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-5">
                          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", config.bg)}>
                            <Icon className={cn("w-4 h-4", config.text)} />
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div>
                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{tx.description}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{tx.type}</p>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <p className="text-xs font-mono text-muted-foreground">{tx.reference_id || "—"}</p>
                        </td>
                        <td className="py-4 px-5">
                          <div>
                            <p className="text-xs font-medium">{new Date(tx.created_at).toLocaleDateString()}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleTimeString()}</p>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <p className={cn("text-sm font-bold", tx.amount >= 0 ? "text-green-500" : "text-foreground")}>
                            {tx.amount >= 0 ? "+" : ""}${fmt(Math.abs(tx.usd_value))}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {tx.amount.toFixed(4)} {tx.description.split(' ').pop()}
                          </p>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            Completed
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                      <h3 className="font-bold text-sm">No transactions found</h3>
                      <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search terms.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
