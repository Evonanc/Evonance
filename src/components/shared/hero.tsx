"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Globe, Zap, CreditCard, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Shield,
    title: 'Institutional Security',
    description: 'Military-grade encryption with multi-sig cold storage and real-time threat monitoring.',
    badge: null,
  },
  {
    icon: CreditCard,
    title: 'USD Virtual Cards',
    description: 'Fund your global Visa card from as little as $1. Spend your crypto anywhere, instantly.',
    badge: 'Most Popular',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Send assets across borders in seconds with near-zero fees and real-time settlement.',
    badge: null,
  },
];

const STATS = [
  { value: '$4.2B+', label: 'Total Volume Traded' },
  { value: '220K+', label: 'Active Users Globally' },
  { value: '99.97%', label: 'Platform Uptime' },
  { value: '$1',     label: 'Card Minimum Funding' },
];

export const Hero = () => {
  return (
    <section className="relative pt-28 pb-20 md:pt-44 md:pb-32 lg:pt-52 lg:pb-40 overflow-hidden" aria-labelledby="hero-headline">
      {/* ── Background Auras ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[55%] h-[55%] bg-primary/15 blur-[130px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[0%] right-[-10%] w-[45%] h-[45%] bg-accent/8 blur-[120px] rounded-full animate-pulse-slow [animation-delay:1s]" />
        <div className="absolute top-[30%] right-[5%] w-[25%] h-[30%] bg-primary/8 blur-[90px] rounded-full" />
      </div>

      <div className="container-max text-center">
        {/* ── Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-[13px] font-bold mb-8 md:mb-10">
            <Zap className="w-3.5 h-3.5 fill-primary shrink-0" aria-hidden />
            <span className="uppercase tracking-[0.12em]">Next-Generation Crypto Banking</span>
          </div>

          {/* ── Headline ── */}
          <h1
            id="hero-headline"
            className="text-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[96px] mb-8 md:mb-10"
          >
            Finance{' '}
            <span className="text-gradient">Evolved</span>
            <br className="hidden md:block" />
            {' '}for the Modern World
          </h1>

          {/* ── Subheading ── */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 md:mb-14 leading-[1.65] font-medium">
            Trade crypto, manage your portfolio, and spend globally with your EVONANCE USD virtual card — 
            funded from as little as <strong className="text-foreground font-black">$1</strong>.
          </p>

          {/* ── CTAs ── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-20 md:mb-28">
            <Link href="/signup">
              <Button
                size="lg"
                variant="premium"
                className="w-full sm:w-auto h-14 px-10 text-[15px] font-bold rounded-2xl shadow-glow hover:shadow-premium transition-all duration-300 group"
              >
                Start Trading Free
                <ArrowRight className="ml-2.5 w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" aria-hidden />
              </Button>
            </Link>
            <Link href="/markets">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-10 text-[15px] font-bold rounded-2xl border-2 hover:bg-secondary transition-all duration-300"
              >
                Explore Markets
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-3xl overflow-hidden mb-20 md:mb-28 border"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-card px-6 py-6 md:py-8 text-center">
              <p className="text-2xl md:text-3xl font-black font-heading text-foreground mb-1">{stat.value}</p>
              <p className="text-label text-[10px] md:text-[11px]">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Feature Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto"
        >
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            const isFeatured = !!feat.badge;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={[
                  "relative p-8 rounded-3xl text-left border card-hover overflow-hidden group",
                  isFeatured
                    ? "bg-card border-primary/25 shadow-premium"
                    : "bg-card border-border"
                ].join(' ')}
              >
                {isFeatured && (
                  <div className="absolute top-5 right-5">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-primary text-white shadow-glow">
                      {feat.badge}
                    </span>
                  </div>
                )}

                {/* Glow on featured */}
                {isFeatured && (
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/6 blur-[60px] rounded-full pointer-events-none" />
                )}

                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-500">
                  <Icon className="text-primary w-6 h-6" aria-hidden />
                </div>
                <h3 className="text-lg font-black mb-3 text-foreground">{feat.title}</h3>
                <p className="text-[15px] text-muted-foreground leading-relaxed">{feat.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
