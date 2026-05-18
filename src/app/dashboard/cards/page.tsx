"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CreditCard, Plus, Eye, EyeOff, Lock, Unlock,
  Settings, Copy, ArrowDownLeft, ArrowUpRight,
  ShoppingBag, Coffee, Monitor, Zap, Wifi, Globe,
  MoreHorizontal, Check, Shield, TrendingUp, AlertCircle, RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getUserCards, createVirtualCard, fundCard, toggleCardFreeze, getCardTransactions } from "@/services/cards";
import type { VirtualCard as CardType, CardTransaction } from "@/types/database";

const FEATURES = [
  { icon: Globe,  title: "Global Acceptance",  desc: "50M+ merchants, 195 countries" },
  { icon: Shield, title: "Bank-Grade Security", desc: "3D Secure, biometric & PIN" },
  { icon: Zap,    title: "Instant Top-up",      desc: "Fund from $1 in seconds" },
  { icon: Wifi,   title: "Contactless Pay",     desc: "Apple Pay & Google Pay" },
];

const CARD_COLORS = [
  ["#0052FF", "#7C3AED"],
  ["#7C3AED", "#EC4899"],
  ["#10B981", "#3B82F6"],
  ["#F59E0B", "#EF4444"],
];

// ── Card Visual Component ─────────────────────────────────────────
function CardVisual({
  card,
  active,
  showBalance,
  onClick,
}: {
  card: CardType;
  active: boolean;
  showBalance: boolean;
  onClick: () => void;
}) {
  const color = CARD_COLORS[card.card_number_last4.charCodeAt(0) % CARD_COLORS.length];
  const frozen = card.status === "frozen";

  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateY: 2 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        "relative w-full rounded-2xl cursor-pointer overflow-hidden select-none aspect-[1.586/1]",
        active && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      style={{ background: `linear-gradient(135deg, ${color[0]}, ${color[1]})` }}
    >
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "120px" }} />
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
      
      {frozen && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
          <div className="text-center text-white">
            <Lock className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-bold">Card Frozen</p>
          </div>
        </div>
      )}

      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start text-white">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-white/50">EVONANCE</p>
            <p className="text-[11px] text-white/70 font-medium mt-0.5">Virtual Premium</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full">
            <div className={cn("w-1.5 h-1.5 rounded-full", frozen ? "bg-red-400" : "bg-green-400")} />
            <p className="text-[9px] font-bold uppercase tracking-tight">{card.status}</p>
          </div>
        </div>

        <div className="w-10 h-7 rounded-md bg-yellow-400/25 border border-yellow-400/30 grid grid-rows-3 gap-px p-1">
          {[0,1,2].map(i => <div key={i} className="bg-yellow-300/30 rounded-[1px]" />)}
        </div>

        <div className="text-white">
          <p className="font-mono text-base tracking-[0.2em] mb-4">•••• •••• •••• {card.card_number_last4}</p>
          <div className="flex justify-between items-end">
            <div className="flex gap-5">
              <div>
                <p className="text-[8px] text-white/30 uppercase tracking-widest">Expires</p>
                <p className="text-sm font-mono tracking-widest">{card.expiry_month.toString().padStart(2, '0')}/{card.expiry_year.toString().slice(-2)}</p>
              </div>
              <div>
                <p className="text-[8px] text-white/30 uppercase tracking-widest">Balance</p>
                <p className="text-sm font-bold">
                  {showBalance ? `$${card.balance_usd.toLocaleString()}` : "••••••"}
                </p>
              </div>
            </div>
            <div className="flex -space-x-3 opacity-60">
              <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white/20" />
              <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-white/20" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function CardsPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [txns, setTxns] = useState<CardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [funding, setFunding] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async (uid: string) => {
    const data = await getUserCards(uid);
    setCards(data as CardType[]);
    if (data.length > 0 && !activeCardId) setActiveCardId(data[0].id);
  }, [activeCardId]);

  const fetchTxns = useCallback(async (uid: string, cid: string) => {
    const data = await getCardTransactions(cid, uid, 5);
    setTxns(data as CardTransaction[]);
  }, []);

  useEffect(() => {
    if (user) {
      fetchCards(user.id).finally(() => setLoading(false));
    }
  }, [user, fetchCards]);

  useEffect(() => {
    if (user && activeCardId) {
      fetchTxns(user.id, activeCardId);
    }
  }, [user, activeCardId, fetchTxns]);

  const activeCard = cards.find(c => c.id === activeCardId);

  const handleIssue = async () => {
    if (!user) return;
    setError(null);
    setIssuing(true);
    const res = await createVirtualCard(user.id);
    if (res.success) {
      await fetchCards(user.id);
    } else {
      setError(res.error || "Failed to create virtual card");
    }
    setIssuing(false);
  };

  const handleToggleFreeze = async () => {
    if (!user || !activeCardId || !activeCard) return;
    const res = await toggleCardFreeze(user.id, activeCardId, activeCard.status === "active");
    if (res.success) {
      await fetchCards(user.id);
    }
  };

  const handleFund = async () => {
    if (!user || !activeCardId || !fundAmount) return;
    setError(null);
    setFunding(true);
    const res = await fundCard(user.id, activeCardId, parseFloat(fundAmount));
    if (res.success) {
      setFundAmount("");
      await Promise.all([fetchCards(user.id), fetchTxns(user.id, activeCardId)]);
    } else {
      setError(res.error || "Failed to fund virtual card");
    }
    setFunding(false);
  };

  const copyNumber = () => {
    if (activeCard) {
      navigator.clipboard.writeText(`•••• •••• •••• ${activeCard.card_number_last4}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <DashboardLayout title="Virtual Cards">
      <div className="h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Virtual Cards">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display">Virtual Cards</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your institutional-grade USD virtual cards</p>
          </div>
          <button 
            onClick={handleIssue} disabled={issuing}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl ev-gradient text-white text-xs font-semibold shadow-glow-primary transition-all disabled:opacity-50"
          >
            {issuing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Issue New Card ($1)
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {cards.map((c) => (
                <CardVisual
                  key={c.id} card={c}
                  active={activeCardId === c.id}
                  showBalance={showBalance}
                  onClick={() => setActiveCardId(c.id)}
                />
              ))}
              {cards.length === 0 && (
                <div className="sm:col-span-2 ev-card aspect-[21/9] flex flex-col items-center justify-center p-8 text-center bg-secondary/20">
                  <CreditCard className="w-10 h-10 text-muted-foreground/30 mb-4" />
                  <h3 className="font-bold text-sm">No cards yet</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Issue your first virtual card to start spending globally.</p>
                </div>
              )}
            </div>

            {activeCard && (
              <div className="ev-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Card Number</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono font-semibold">•••• •••• •••• {activeCard.card_number_last4}</p>
                      <button onClick={copyNumber} className="text-muted-foreground hover:text-primary transition-colors">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowBalance(!showBalance)} className="flex items-center gap-2 h-8 px-3.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary">
                      {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showBalance ? "Hide" : "Show"}
                    </button>
                    <button onClick={handleToggleFreeze} className={cn("flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-medium border transition-all", activeCard.status === 'frozen' ? "bg-red-500/10 text-red-400 border-red-500/20" : "border-border hover:bg-secondary")}>
                      {activeCard.status === 'frozen' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {activeCard.status === 'frozen' ? "Unfreeze" : "Freeze"}
                    </button>
                    <div className="flex gap-1 items-center bg-secondary/50 rounded-lg p-0.5">
                      <input 
                        type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                        placeholder="Top up $" className="w-20 bg-transparent text-xs px-2 outline-none"
                      />
                      <button onClick={handleFund} disabled={funding} className="h-7 px-3 rounded-md ev-gradient text-white text-[10px] font-bold disabled:opacity-50">
                        {funding ? "..." : "Fund"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="ev-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold">Card Activity</h2>
                <button className="text-xs text-primary hover:underline">View all</button>
              </div>
              <div className="space-y-1">
                {txns.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{tx.description || tx.type}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className={cn("text-sm font-bold", tx.amount_usd < 0 ? "text-foreground" : "text-green-500")}>
                      {tx.amount_usd > 0 ? "+" : ""}${Math.abs(tx.amount_usd).toFixed(2)}
                    </p>
                  </div>
                ))}
                {txns.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No transactions for this card yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {activeCard && (
              <div className="ev-card p-5">
                <p className="text-label mb-3">Card Balance</p>
                <p className="text-3xl font-black font-display mb-1">
                  ${activeCard.balance_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <span className="badge-up text-[10px] mt-2">
                  <TrendingUp className="w-2.5 h-2.5" />
                  {activeCard.cashback_pct * 100}% Cashback active
                </span>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-6">
                  <div className="h-full ev-gradient rounded-full" style={{ width: `${(activeCard.balance_usd / activeCard.monthly_limit_usd) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] mt-2 text-muted-foreground">
                  <span>Usage</span>
                  <span>Limit: ${activeCard.monthly_limit_usd.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="ev-card p-5">
              <h3 className="text-sm font-bold mb-4">Card Benefits</h3>
              <div className="space-y-3">
                {FEATURES.map((f) => (
                  <div key={f.title} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <f.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{f.title}</p>
                      <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ev-card p-5 bg-primary/5 border-primary/15">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold">Privacy Guard</p>
                  <p className="text-[11px] text-muted-foreground">Verified by EVONANCE</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Your card details are protected by AES-256 encryption and institutional security protocols.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
