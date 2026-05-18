"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

// ── Shared auth layout (identical visual to original) ─────────────────────────
function AuthLayout({ children, heading, subheading }: {
  children: React.ReactNode;
  heading: string;
  subheading: string;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 ev-gradient opacity-90" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.08), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06), transparent 50%)" }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeLinecap="round"/>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" strokeLinecap="round"/>
                <path d="M18 9h2v4h-2a2 2 0 0 1 0-4Z"/>
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight font-display">EVONANCE</span>
          </Link>
          <div>
            <h2 className="text-3xl font-black font-display leading-snug mb-4">The Future of<br />Crypto Finance</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs">Trade, swap, and manage your digital assets with institutional-grade tools. Virtual cards from just $1.</p>
            <div className="flex flex-wrap gap-2">
              {["220K+ Traders", "$4.2B+ Volume", "195+ Countries", "0.1% Fees"].map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium text-white/90 border border-white/15">{tag}</span>
              ))}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15">
            <p className="text-white/80 text-sm leading-relaxed mb-3">&ldquo;EVONANCE gave me the tools to trade like an institution, not just a retail investor.&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">JD</div>
              <div>
                <p className="text-xs font-semibold text-white">James D.</p>
                <p className="text-[11px] text-white/50">Pro Trader, London</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg ev-gradient flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-bold font-display">EVONANCE</span>
          </Link>
          <h1 className="text-2xl font-black font-display mb-1.5">{heading}</h1>
          <p className="text-sm text-muted-foreground mb-8">{subheading}</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
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
    <AuthLayout heading="Welcome back" subheading="Enter your credentials to access your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-foreground/80 block mb-1.5">Email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required className="ev-input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-foreground/80">Password</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required className="ev-input pr-10"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full h-11 rounded-xl ev-gradient text-white text-sm font-semibold shadow-glow-primary transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">Sign up free</Link>
      </p>
    </AuthLayout>
  );
}
