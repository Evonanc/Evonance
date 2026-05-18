"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, ArrowRight, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000)); // simulate
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full amber-gradient flex items-center justify-center mx-auto mb-5 shadow-amber">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black mb-2">Check your inbox</h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              We sent a password reset link to <strong className="text-foreground">{email}</strong>.
              Check your spam folder if you don&apos;t see it.
            </p>
            <Link href="/login" className="btn-amber h-11 px-6 text-sm shadow-amber">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl amber-gradient flex items-center justify-center mb-6 shadow-amber">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black mb-1.5">Forgot password?</h1>
            <p className="text-sm text-muted-foreground mb-7">
              No worries — enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground/80 block mb-1.5">Email address</label>
                <input
                  id="forgot-email"
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required className="ev-input"
                />
              </div>
              <button type="submit" disabled={loading} id="forgot-submit"
                className="btn-amber w-full h-11 text-sm shadow-amber disabled:opacity-60">
                {loading
                  ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-5">
              Remember your password?{" "}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: "#F5A623" }}>Sign in</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
