"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const PW_RULES = [
  { label: "At least 8 characters",       test: (p: string) => p.length >= 8 },
  { label: "Contains a number",           test: (p: string) => /\d/.test(p) },
  { label: "Contains a special character",test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function SignupPage() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const allRulesMet = PW_RULES.every((r) => r.test(form.password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesMet) { setError("Please meet all password requirements."); return; }
    setError(null);
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.firstName, form.lastName);
    setLoading(false);
    if (error) { setError(error); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full ev-gradient flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black font-display mb-3">Check your email</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            We sent a confirmation link to <strong className="text-foreground">{form.email}</strong>. Click it to activate your account and start trading.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 h-11 px-6 rounded-xl ev-gradient text-white text-sm font-semibold">
            Go to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 ev-gradient opacity-90" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08), transparent 50%)" }} />
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
            <h2 className="text-3xl font-black font-display leading-snug mb-4">Start your<br />financial evolution</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs">Join 220,000+ traders building wealth. No minimum deposit. Zero hidden fees.</p>
            <div className="space-y-3">
              {["Access to 500+ crypto assets","USD Virtual Card from just $1","Institutional-grade trading tools","24/7 customer support"].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-white" /></div>
                  <p className="text-sm text-white/80">{f}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {["JD","AM","SK","RO"].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-[9px] font-bold text-white">{i}</div>
                ))}
              </div>
              <p className="text-xs text-white/70">+220K joined this year</p>
            </div>
            <div className="flex gap-1 items-center">
              {[1,2,3,4,5].map((i) => (
                <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
              <p className="text-xs text-white/70 ml-1">4.9/5 from 12K reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg ev-gradient flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeLinecap="round"/></svg>
            </div>
            <span className="text-sm font-bold font-display">EVONANCE</span>
          </Link>

          <h1 className="text-2xl font-black font-display mb-1.5">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-7">Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground/80 block mb-1.5">First Name</label>
                <input type="text" value={form.firstName} onChange={set("firstName")} placeholder="John" required className="ev-input" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/80 block mb-1.5">Last Name</label>
                <input type="text" value={form.lastName} onChange={set("lastName")} placeholder="Doe" required className="ev-input" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 block mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required className="ev-input" />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Create a strong password" required className="ev-input pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2.5 space-y-1.5">
                  {PW_RULES.map((rule) => {
                    const met = rule.test(form.password);
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        <div className={cn("w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all", met ? "bg-green-500/20 text-green-500" : "bg-secondary")}>
                          <Check className="w-2 h-2" />
                        </div>
                        <p className={cn("text-[11px] transition-colors", met ? "text-green-500" : "text-muted-foreground")}>{rule.label}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input id="terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary rounded border-border" />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                I agree to the{" "}<Link href="#" className="text-primary hover:underline">Terms of Service</Link>{" "}and{" "}<Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit" disabled={loading || !agreed}
              className="w-full h-11 rounded-xl ev-gradient text-white text-sm font-semibold shadow-glow-primary transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
