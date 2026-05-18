"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, TrendingUp, TrendingDown,
  BarChart3, Shield, Zap, Globe,
  CreditCard, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Sparkline ─────────────────────────────────────────────────────
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const w = 72, h = 28;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  const color = positive ? "#22C55E" : "#EF4444";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

// ── Static data ───────────────────────────────────────────────────
const MARKET_CARDS = [
  { symbol: "BTC", name: "Bitcoin",  price: 94231.50, change:  2.45, cap: "$1.84T", color: "#F7931A", spark: [42,46,44,50,53,49,58,55,62] },
  { symbol: "ETH", name: "Ethereum", price:  3421.20, change: -1.20, cap: "$411B",  color: "#627EEA", spark: [60,58,55,57,52,54,50,47,45] },
  { symbol: "SOL", name: "Solana",   price:   215.45, change:  5.67, cap: "$98.4B", color: "#9945FF", spark: [32,35,33,38,42,46,52,58,66] },
  { symbol: "BNB", name: "BNB",      price:   612.30, change:  0.85, cap: "$88.5B", color: "#F3BA2F", spark: [50,52,51,53,52,55,54,57,56] },
];

const FEATURES = [
  { icon: Shield,    title: "Bank-Grade Security", desc: "Multi-layer encryption with 95%+ cold storage and HSMs." },
  { icon: Zap,       title: "Instant Execution",   desc: "Sub-millisecond routing across deep liquidity pools." },
  { icon: Globe,     title: "Global Access",        desc: "Available in 195+ countries with 24/7 settlements." },
  { icon: BarChart3, title: "Pro Analytics",        desc: "Institutional-grade charting and real-time order books." },
];

const STATS = [
  { value: "$4.2B+", label: "Trading Volume" },
  { value: "220K+",  label: "Active Users"   },
  { value: "195+",   label: "Countries"      },
  { value: "0.1%",   label: "Trading Fee"    },
];

// ── Hero ─────────────────────────────────────────────────────────
export function HeroSection() {
  return (
    <section className="relative pt-16 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 grid-overlay pointer-events-none" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center top, rgba(0,82,255,0.10) 0%, transparent 60%)" }}
      />

      <div className="page-container relative z-10">
        {/* Headline block */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-7">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live Markets · 24/7 Trading
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-display leading-snug tracking-tight mb-6">
              The Future of{" "}
              <span className="ev-gradient-text">Crypto Finance</span>
              <br />
              is Here
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
              Trade, swap, and manage your digital assets with institutional-grade tools.
              Create a USD Virtual Card from as low as{" "}
              <span className="text-foreground font-semibold">$1</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <Link
                href="/signup"
                className="btn-amber h-12 px-8 text-sm w-full sm:w-auto shadow-amber"
              >
                Start for Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/markets"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-all w-full sm:w-auto"
              >
                <BarChart3 className="w-4 h-4 text-primary" />
                Explore Markets
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-lg mx-auto">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-black font-display ev-gradient-text">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="ev-card p-5 shadow-ev-4">
            {/* Preview header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg ev-gradient flex items-center justify-center">
                  <BarChart3 className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-bold font-display">Portfolio Overview</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-medium">Live</span>
              </div>
            </div>

            {/* Balance row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="sm:col-span-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Value</p>
                <p className="text-2xl font-black font-display">$54,280.42</p>
                <span className="badge-up text-[10px] mt-1">
                  <TrendingUp className="w-2.5 h-2.5" /> +$1,842 today
                </span>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">24h P&L</p>
                <p className="text-lg font-bold text-green-500">+$1,842.38</p>
                <p className="text-[11px] text-muted-foreground">+3.51%</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Card Balance</p>
                <p className="text-lg font-bold">$1,240.00</p>
                <p className="text-[11px] text-muted-foreground">Visa · ••8841</p>
              </div>
            </div>

            {/* Asset tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MARKET_CARDS.map((coin) => (
                <div key={coin.symbol} className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/50">
                  <div
                    className="w-7 h-7 rounded-lg text-[9px] font-black text-white flex items-center justify-center shrink-0"
                    style={{ background: coin.color }}
                  >
                    {coin.symbol.slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold truncate">{coin.symbol}</p>
                    <p className={cn("text-[10px] font-semibold", coin.change >= 0 ? "text-green-500" : "text-red-400")}>
                      {coin.change >= 0 ? "+" : ""}{coin.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Markets Preview ──────────────────────────────────────────────
export function MarketsPreview() {
  return (
    <section className="py-20 md:py-32 bg-secondary/20">
      <div className="page-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-label mb-2">Live Markets</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-snug">Trending Assets</h2>
          </div>
          <Link href="/markets" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MARKET_CARDS.map((coin, i) => {
            const isUp = coin.change >= 0;
            return (
              <motion.div
                key={coin.symbol}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ y: -2 }}
                className="ev-card p-5 hover:border-primary/20 hover:shadow-ev-3 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black text-white"
                      style={{ background: coin.color }}
                    >
                      {coin.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none">{coin.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{coin.symbol}/USDT</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-lg",
                    isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"
                  )}>
                    {isUp ? "+" : ""}{coin.change}%
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg font-bold font-mono leading-none">
                      ${coin.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">MCap {coin.cap}</p>
                  </div>
                  <Sparkline data={coin.spark} positive={isUp} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Virtual Card Section ──────────────────────────────────────────
export function CardFeatureSection() {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-label mb-3">Virtual Cards</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-5 leading-snug tracking-tight">
              Fund a Card from{" "}
              <span className="ev-gradient-text">just $1</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-6 max-w-md">
              Create a USD Virtual Card, top up from any crypto asset, and spend globally at 50M+ merchants.
              Powered by EVONANCE's instant conversion engine.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Accepted at 50M+ merchants worldwide",
                "Instant crypto-to-USD conversion",
                "Apple Pay & Google Pay ready",
                "Real-time spend notifications",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="w-5 h-5 rounded-full ev-gradient flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  {feat}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="btn-amber h-12 px-6 text-sm shadow-amber"
            >
              Get Your Card <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Card visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-sm">
              <div
                className="relative rounded-3xl p-7 text-white overflow-hidden shadow-2xl"
                style={{ background: "linear-gradient(135deg, #0052FF 0%, #7C3AED 100%)" }}
              >
                <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -right-4 top-20 w-28 h-28 rounded-full bg-white/6 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">EVONANCE</p>
                      <p className="text-[11px] text-white/70 font-medium mt-0.5">Virtual Card</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <p className="text-[10px] text-green-300 font-medium">Active</p>
                    </div>
                  </div>

                  <div className="w-10 h-7 rounded-md bg-yellow-400/25 border border-yellow-400/30 grid grid-rows-3 gap-px p-1 mb-5">
                    {[0, 1, 2].map((i) => <div key={i} className="bg-yellow-300/30 rounded-[1px]" />)}
                  </div>

                  <p className="font-mono text-base tracking-[0.2em] text-white mb-6">
                    4532 •••• •••• 8841
                  </p>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] text-white/30 uppercase tracking-widest">Expires</p>
                      <p className="text-sm font-mono text-white tracking-widest">08/28</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-white/30 uppercase tracking-widest">Balance</p>
                      <p className="text-sm font-bold text-white">$1,240.00</p>
                    </div>
                    <div className="flex -space-x-2.5 opacity-60">
                      <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white/20" />
                      <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-white/20" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
                {[
                  { label: "Funded from", value: "BTC · Instant" },
                  { label: "Cashback",    value: "1% on all" },
                  { label: "Limit",       value: "$5,000/mo" },
                ].map((s) => (
                  <div key={s.label} className="ev-card p-3 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
                    <p className="text-xs font-bold mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Features Grid ─────────────────────────────────────────────────
export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-secondary/20">
      <div className="page-container">
        <div className="text-center mb-12">
          <p className="text-label mb-3">Platform Features</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-snug mb-4">Built for Serious Traders</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Everything you need in one institutional-grade platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="ev-card p-6 ev-card-hover"
            >
              <div className="w-11 h-11 rounded-2xl ev-gradient flex items-center justify-center mb-4 shadow-glow-primary">
                <feat.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold mb-2">{feat.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Social Proof ──────────────────────────────────────────────────
export function SocialProofSection() {
  const reviews = [
    { init: "JD", name: "James D.",  role: "Pro Trader, London",       text: "EVONANCE gave me institutional tools at a fraction of the cost. The execution speed is world-class." },
    { init: "AM", name: "Aisha M.",  role: "DeFi Investor, Singapore", text: "The $1 virtual card feature is genius. I top it up with USDT and spend anywhere Visa is accepted instantly." },
    { init: "RO", name: "Rafael O.", role: "Crypto Fund Manager, NYC",  text: "Clean UI, deep liquidity, zero hidden fees. EVONANCE is the Bloomberg terminal of crypto for retail." },
  ];

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="page-container">
        <div className="text-center mb-10">
          <p className="text-label mb-3">Trusted by Traders</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-snug">What Our Users Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="ev-card p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                {/* Geometric avatar circle */}
                <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <defs>
                      <linearGradient id={`ag-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={["#F5A623","#3B82F6","#22C55E"][i % 3]} />
                        <stop offset="100%" stopColor={["#E8853A","#7C3AED","#0052FF"][i % 3]} />
                      </linearGradient>
                    </defs>
                    <circle cx="18" cy="18" r="18" fill={`url(#ag-${i})`} />
                    <polygon points="18,6 26,14 22,26 14,26 10,14" fill="rgba(255,255,255,0.15)" />
                    <text x="18" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="Inter,sans-serif">{r.init}</text>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Section ───────────────────────────────────────────────────
export function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-secondary/20">
      <div className="page-container">
        <div
          className="relative rounded-3xl p-10 md:p-16 text-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D1220 0%, #1a2035 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(245,166,35,0.15), transparent 70%)" }} />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)" }} />
            <div className="absolute inset-0 dot-bg opacity-30" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
              Get Started Today
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-5 leading-snug tracking-tight">
              Start Your Crypto Journey
              <br /> in Under 2 Minutes
            </h2>
            <p className="text-white/60 text-base mb-8">
              Join 220,000+ traders building wealth with EVONANCE.
              No minimum deposit. Zero hidden fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="btn-amber h-12 px-8 text-sm shadow-amber"
              >
                Create Free Account
              </Link>
              <Link
                href="/markets"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl border border-white/20 text-white font-semibold text-sm transition-all hover:bg-white/10"
              >
                View Live Markets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────
export function HowItWorksSection() {
  const STEPS = [
    {
      step: "01",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: "Create Account",
      desc: "Sign up in under 2 minutes. No minimums, no paperwork. Just your email and a strong password.",
    },
    {
      step: "02",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: "Fund Your Wallet",
      desc: "Deposit crypto or fiat via bank wire, card, or direct transfer. Funds available instantly.",
    },
    {
      step: "03",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: "Trade or Spend",
      desc: "Execute trades with institutional-grade tools or spend your crypto with a USD Virtual Card.",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="page-container">
        <div className="text-center mb-14">
          <p className="text-label mb-3">Simple Onboarding</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-snug">
            Up and Running in{" "}
            <span className="amber-gradient-text">3 Steps</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px border-t border-dashed border-border" />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.45 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-3xl ev-card flex items-center justify-center shadow-ev-2">
                  <div className="w-14 h-14 rounded-2xl amber-gradient flex items-center justify-center text-white">
                    {step.icon}
                  </div>
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full amber-gradient text-white text-[10px] font-black flex items-center justify-center">
                  {step.step}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/signup" className="btn-amber h-12 px-8 text-sm shadow-amber">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Trust / Partners Bar ──────────────────────────────────────────
export function TrustBar() {
  const PARTNERS = ["Visa", "Fireblocks", "AWS", "Chainalysis", "Supabase"];
  return (
    <section className="py-14 border-y border-border bg-secondary/20">
      <div className="page-container">
        <p className="text-center text-label mb-8">Trusted Infrastructure</p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {PARTNERS.map((p) => (
            <span
              key={p}
              className="text-lg font-black tracking-tight text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200 select-none"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
