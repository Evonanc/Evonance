"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, ArrowRight, AlertCircle,
  TrendingUp, Shield, Zap, Globe
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

// ── Animated live stats for left panel ──────────────────────────────
const LIVE_STATS = [
  { label: "24h Volume",     value: "$4.2B+",  icon: TrendingUp, color: "#22C55E" },
  { label: "Active Traders", value: "220K+",   icon: Globe,      color: "#3B82F6" },
  { label: "Security Score", value: "AAA",     icon: Shield,     color: "#F5A623" },
  { label: "Uptime SLA",     value: "99.9%",   icon: Zap,        color: "#A855F7" },
];

// ── Left brand panel ────────────────────────────────────────────────
function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#080B14]">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px]" style={{ background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 60%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px]" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)" }} />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-bg opacity-40" />
      </div>

      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <div className="w-9 h-9 rounded-xl amber-gradient flex items-center justify-center shadow-amber">
            <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeLinecap="round"/>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" strokeLinecap="round"/>
              <path d="M18 9h2v4h-2a2 2 0 0 1 0-4Z"/>
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-white">EVONANCE</span>
        </Link>

        {/* Main copy */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-4xl font-black leading-snug text-white mb-4"
          >
            The Future of<br />
            <span className="amber-gradient-text">Crypto Finance</span>
          </motion.h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-xs">
            Trade, swap, and manage your digital assets with institutional-grade tools. Virtual cards from just $1.
          </p>

          {/* Live stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {LIVE_STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="rounded-2xl border p-4"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{s.label}</p>
                </div>
                <p className="text-xl font-black text-white">{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-2xl p-5 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-white/60 text-sm leading-relaxed mb-3">&ldquo;EVONANCE gave me the tools to trade like an institution, not just a retail investor.&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <defs>
                    <linearGradient id="av-login" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F5A623"/>
                      <stop offset="100%" stopColor="#E8853A"/>
                    </linearGradient>
                  </defs>
                  <circle cx="16" cy="16" r="16" fill="url(#av-login)"/>
                  <polygon points="16,5 22,12 20,23 12,23 10,12" fill="rgba(255,255,255,0.15)"/>
                  <text x="16" y="20" textAnchor="middle" fontSize="10" fontWeight="700" fill="white" fontFamily="Inter,sans-serif">JD</text>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">James D.</p>
                <p className="text-[11px] text-white/40">Pro Trader, London</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Login Page ───────────────────────────────────────────────────────
export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <BrandPanel />

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg amber-gradient flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-bold">EVONANCE</span>
          </Link>

          <h1 className="text-2xl font-black mb-1.5">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-foreground/80 block mb-1.5">Email address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required className="ev-input"
                id="login-email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-foreground/80">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: "#F5A623" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required className="ev-input pr-10" id="login-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading} id="login-submit"
              className="btn-amber w-full h-11 text-sm shadow-amber disabled:opacity-60"
            >
              {loading
                ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <>Sign In <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          {/* OAuth divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground font-medium">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button className="btn-secondary h-10 text-xs gap-2 rounded-xl" id="login-google">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            {/* Apple */}
            <button className="btn-secondary h-10 text-xs gap-2 rounded-xl" id="login-apple">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
              </svg>
              Apple
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold hover:underline" style={{ color: "#F5A623" }}>Sign up free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
