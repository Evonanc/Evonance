"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Check } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm text-center"
      >
        <Link href="/signup" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign Up
        </Link>

        <div className="w-16 h-16 rounded-full amber-gradient flex items-center justify-center mx-auto mb-5 shadow-amber">
          <Mail className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-black mb-2">Verify your email</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs mx-auto">
          We&apos;ve sent a verification link to your email address. Click the link to activate your account.
        </p>

        <div className="ev-card p-5 mb-6 text-left space-y-3">
          {[
            "Check your inbox (and spam folder)",
            "Click the verification link",
            "Return here to sign in",
          ].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full amber-gradient flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black text-white">{i + 1}</span>
              </div>
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </div>

        <Link href="/login" className="btn-amber h-11 px-6 text-sm shadow-amber">
          <Check className="w-4 h-4" /> I&apos;ve verified — Sign In
        </Link>

        <p className="text-xs text-muted-foreground mt-5">
          Didn&apos;t receive it?{" "}
          <button className="font-semibold hover:underline" style={{ color: "#F5A623" }}>
            Resend email
          </button>
        </p>
      </motion.div>
    </div>
  );
}
