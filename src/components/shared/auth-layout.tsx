"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Wallet, Shield, Zap, Globe, TrendingUp, Lock } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const TRUST_POINTS = [
  {
    icon: Shield,
    title: 'Institutional-Grade Security',
    body: 'Advanced encryption, multi-sig cold storage, and 24/7 monitoring.',
  },
  {
    icon: Zap,
    title: 'Real-Time Execution',
    body: 'Trade thousands of assets with sub-millisecond latency and deep liquidity.',
  },
  {
    icon: Globe,
    title: 'Global Connectivity',
    body: 'Spend your crypto anywhere in the world with your EVONANCE virtual card.',
  },
];

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
      {/* ── Left: Form Panel ── */}
      <div className="flex flex-col justify-center bg-background relative overflow-hidden p-6 sm:p-10 lg:p-16 xl:p-20">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Logo */}
        <div className="absolute top-8 left-8 sm:top-10 sm:left-10">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="EVONANCE home">
            <div className="w-9 h-9 rounded-xl premium-gradient flex items-center justify-center shadow-premium-sm group-hover:scale-110 transition-transform duration-300">
              <Wallet className="text-white w-5 h-5" aria-hidden />
            </div>
            <span className="text-xl font-heading font-black tracking-tight">EVONANCE</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative z-10 max-w-sm w-full mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-black mb-3 tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-[15px] leading-relaxed">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>

      {/* ── Right: Visual Panel ── */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 xl:p-20 relative overflow-hidden bg-navy-900">
        {/* Layered backgrounds */}
        <div className="absolute inset-0 premium-gradient opacity-8" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        {/* Grid pattern */}
        <div className="absolute inset-0 terminal-grid opacity-40" />

        {/* Glow orbs */}
        <div className="absolute top-[10%] right-[10%] w-80 h-80 bg-primary/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] left-[10%] w-60 h-60 bg-accent/10 blur-[80px] rounded-full" />

        <div className="relative z-10 max-w-md w-full">
          {/* Stats card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-12 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <div className="grid grid-cols-3 gap-4 divide-x divide-white/10">
              <div className="text-center">
                <p className="text-2xl font-black text-white mb-1">$4.2B</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Volume</p>
              </div>
              <div className="text-center pl-4">
                <p className="text-2xl font-black text-white mb-1">220K+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Users</p>
              </div>
              <div className="text-center pl-4">
                <p className="text-2xl font-black text-white mb-1">150+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Assets</p>
              </div>
            </div>
          </motion.div>

          {/* Trust points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-8"
          >
            {TRUST_POINTS.map((pt, i) => {
              const Icon = pt.icon;
              return (
                <motion.div
                  key={pt.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  className="flex gap-5 items-start"
                >
                  <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="text-primary w-5 h-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-white mb-1">{pt.title}</h3>
                    <p className="text-[13px] text-white/50 leading-relaxed">{pt.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Security badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 w-fit"
          >
            <Lock className="w-4 h-4 text-green-400 shrink-0" aria-hidden />
            <span className="text-[12px] font-bold text-white/60 uppercase tracking-wider">256-bit SSL Encrypted</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
