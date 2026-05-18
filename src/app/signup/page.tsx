"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Check, AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const PW_RULES = [
  { label: "At least 8 characters",        test: (p: string) => p.length >= 8 },
  { label: "Contains a number",            test: (p: string) => /\d/.test(p) },
  { label: "Contains a special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const COUNTRIES = [
  "United States","United Kingdom","Canada","Australia","Singapore","Nigeria",
  "Germany","France","Japan","India","Brazil","South Africa","UAE","Netherlands",
  "Switzerland","South Korea","Mexico","Indonesia","Spain","Italy",
];

function StrengthBar({ password }: { password: string }) {
  const score = PW_RULES.filter(r => r.test(password)).length;
  const labels = ["", "Weak", "Fair", "Strong"];
  const colors = ["", "#EF4444", "#F5A623", "#22C55E"];
  return (
    <div className="mt-2.5">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : "hsl(var(--border))" }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          {PW_RULES.map(rule => {
            const met = rule.test(password);
            return (
              <div key={rule.label} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-full flex items-center justify-center transition-all", met ? "bg-green-500/20" : "bg-secondary")}>
                  <Check className={cn("w-1.5 h-1.5", met ? "text-green-500" : "text-muted-foreground/30")} />
                </div>
                <p className={cn("text-[10px] transition-colors", met ? "text-green-500" : "text-muted-foreground")}>{rule.label}</p>
              </div>
            );
          })}
        </div>
        {score > 0 && (
          <span className="text-[11px] font-bold" style={{ color: colors[score] }}>{labels[score]}</span>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  const steps = ["Create Account", "Verify Email", "Done"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                done ? "amber-gradient text-white" :
                active ? "border-2 border-[#F5A623] text-[#F5A623]" :
                "border-2 border-border text-muted-foreground"
              )}>
                {done ? <Check className="w-3.5 h-3.5" /> : n}
              </div>
              <span className={cn("text-xs font-medium hidden sm:block", active ? "text-foreground" : "text-muted-foreground")}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-px transition-all duration-300", done ? "bg-[#F5A623]/40" : "bg-border")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function SignupPage() {
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", country: "" });
  const [showPw, setShowPw]   = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const allRulesMet = PW_RULES.every(r => r.test(form.password));

  // Resend countdown
  useEffect(() => {
    if (step !== 2 || resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendTimer]);

  // OTP input handling
  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesMet) { setError("Please meet all password requirements."); return; }
    if (!form.country)  { setError("Please select your country."); return; }
    setError(null);
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.firstName, form.lastName);
    setLoading(false);
    if (error) { setError(error); return; }
    setStep(2);
    setResendTimer(60);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // In mock/demo mode, just advance
    setStep(3);
  };

  // ── Step 3: Success ──────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full amber-gradient flex items-center justify-center mx-auto mb-6 shadow-amber">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black mb-3">You&apos;re all set!</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Welcome to EVONANCE. Your account is verified and ready. Start trading, swapping, or get your virtual card.
          </p>
          <Link href="/dashboard" className="btn-amber h-12 px-8 text-sm shadow-amber">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            <Link href="/markets" className="hover:underline" style={{ color: "#F5A623" }}>Explore markets first →</Link>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-[#080B14]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px]" style={{ background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 60%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px]" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)" }} />
          <div className="absolute inset-0 dot-bg opacity-40" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-9 h-9 rounded-xl amber-gradient flex items-center justify-center shadow-amber">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeLinecap="round"/>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" strokeLinecap="round"/>
                <path d="M18 9h2v4h-2a2 2 0 0 1 0-4Z"/>
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight">EVONANCE</span>
          </Link>
          <div>
            <h2 className="text-4xl font-black leading-snug mb-4">Start Your<br /><span className="amber-gradient-text">Financial Evolution</span></h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-xs">Join 220,000+ traders building wealth. No minimum deposit. Zero hidden fees.</p>
            <div className="space-y-3 mb-8">
              {["Access to 500+ crypto assets","USD Virtual Card from just $1","Institutional-grade trading tools","24/7 customer support"].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full amber-gradient flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-sm text-white/70">{f}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-4 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2 mb-2">
                {["JD","AM","SK","RO"].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[9px] font-bold">{i}</div>
                ))}
                <p className="text-xs text-white/40 ml-1">+220K joined</p>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className="w-3.5 h-3.5 fill-current" style={{ color: "#F5A623" }} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
                <span className="text-xs text-white/40 ml-1">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg amber-gradient flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-bold">EVONANCE</span>
          </Link>

          <StepIndicator step={step} />

          <AnimatePresence mode="wait">
            {/* ── Step 1: Create Account ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <h1 className="text-2xl font-black mb-1.5">Create your account</h1>
                <p className="text-sm text-muted-foreground mb-6">Free forever. No credit card required.</p>

                <form onSubmit={handleStep1} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />{error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-foreground/80 block mb-1.5">First Name</label>
                      <input id="signup-first" type="text" value={form.firstName} onChange={set("firstName")} placeholder="John" required className="ev-input" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground/80 block mb-1.5">Last Name</label>
                      <input id="signup-last" type="text" value={form.lastName} onChange={set("lastName")} placeholder="Doe" required className="ev-input" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground/80 block mb-1.5">Email address</label>
                    <input id="signup-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required className="ev-input" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground/80 block mb-1.5">Country</label>
                    <div className="relative">
                      <select id="signup-country" value={form.country} onChange={set("country")} required className="ev-input appearance-none pr-8 cursor-pointer">
                        <option value="">Select your country…</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground/80 block mb-1.5">Password</label>
                    <div className="relative">
                      <input id="signup-password" type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Create a strong password" required className="ev-input pr-10" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password && <StrengthBar password={form.password} />}
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <input id="signup-terms" type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-border cursor-pointer" style={{ accentColor: "#F5A623" }} />
                    <label htmlFor="signup-terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                      I agree to the{" "}<Link href="/terms" className="hover:underline" style={{ color: "#F5A623" }}>Terms of Service</Link>{" "}and{" "}
                      <Link href="/privacy" className="hover:underline" style={{ color: "#F5A623" }}>Privacy Policy</Link>
                    </label>
                  </div>

                  <button type="submit" disabled={loading || !agreed} id="signup-submit"
                    className="btn-amber w-full h-11 text-sm shadow-amber disabled:opacity-50">
                    {loading
                      ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      : <>Create Account <ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-5">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold hover:underline" style={{ color: "#F5A623" }}>Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* ── Step 2: Verify Email / OTP ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <h1 className="text-2xl font-black mb-1.5">Verify your email</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter the 6-digit code sent to <strong className="text-foreground">{form.email}</strong>
                </p>

                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => { otpRefs.current[idx] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKey(idx, e)}
                        id={`otp-${idx}`}
                        className={cn(
                          "w-11 h-12 text-center text-lg font-bold rounded-xl border bg-background outline-none transition-all duration-200",
                          digit ? "border-[#F5A623] text-foreground" : "border-border text-foreground",
                          "focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
                        )}
                      />
                    ))}
                  </div>

                  <button type="submit" id="otp-verify"
                    className="btn-amber w-full h-11 text-sm shadow-amber">
                    Verify & Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="text-center mt-5">
                  {resendTimer > 0 ? (
                    <p className="text-xs text-muted-foreground">Resend code in <strong className="text-foreground">{resendTimer}s</strong></p>
                  ) : (
                    <button onClick={() => setResendTimer(60)} className="text-xs font-semibold hover:underline" style={{ color: "#F5A623" }}>
                      Resend verification code
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
