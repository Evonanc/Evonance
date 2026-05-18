"use client";

import React from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { motion } from "framer-motion";
import { Shield, Users, Globe, TrendingUp, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const STATS = [
  { value: "$4.2B+", label: "Trading Volume",   icon: TrendingUp },
  { value: "220K+",  label: "Active Users",      icon: Users      },
  { value: "195+",   label: "Countries Served",  icon: Globe      },
  { value: "99.9%",  label: "Uptime SLA",        icon: Shield     },
];

const VALUES = [
  { title: "Security First",     desc: "Multi-layer encryption, cold storage, and real-time threat monitoring protect every asset." },
  { title: "Radical Transparency", desc: "Proof-of-Reserves, clear fee schedules, and open audit reports — always." },
  { title: "Accessibility",      desc: "Institutional tools made accessible to everyone, from $1 virtual cards to algorithmic trading." },
  { title: "Performance",        desc: "Sub-millisecond order execution and 99.9% uptime, engineered for serious traders." },
];

const TIMELINE = [
  { year: "2021", event: "Founded by fintech veterans in Singapore" },
  { year: "2022", event: "Launched crypto trading and wallet platform" },
  { year: "2023", event: "Reached 100,000 users · $1B cumulative volume" },
  { year: "2024", event: "Launched $1 Virtual Card system · Series A raised" },
  { year: "2025", event: "Expanded to 195 countries · 200K+ active traders" },
  { year: "2026", event: "Institutional API, advanced derivatives, and DeFi gateway" },
];

const TEAM = [
  { name: "Alex Morgan",  role: "CEO & Co-Founder",      init: "AM" },
  { name: "Sarah Kim",    role: "CTO & Co-Founder",      init: "SK" },
  { name: "James Liu",    role: "Chief Risk Officer",    init: "JL" },
  { name: "Priya Nair",   role: "Head of Product",       init: "PN" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" aria-hidden="true" />

      {/* ── Hero ── */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-50 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(0,82,255,0.08) 0%, transparent 65%)" }} />
        <div className="page-container relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-label mb-4">About EVONANCE</p>
            <h1 className="text-h1 md:text-6xl mb-6">
              Evolving the Future of
              <br /><span className="ev-gradient-text">Global Finance</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Evolution Finance Limited — a Singapore-headquartered crypto-fintech platform built to democratise institutional-grade financial tools for everyone, everywhere.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="pb-20">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="ev-card p-6 text-center"
              >
                <div className="w-10 h-10 rounded-2xl ev-gradient flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-black font-display ev-gradient-text">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="section-y bg-secondary/20">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-label mb-3">Our Mission</p>
              <h2 className="text-h1 mb-6">Institutional Finance, <span className="ev-gradient-text">for Everyone</span></h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We believe the most powerful financial tools should not be reserved for hedge funds and banks. EVONANCE was built to give every individual access to the same technology — real-time market data, advanced order routing, and frictionless global payments — starting from just $1.
              </p>
              <div className="space-y-3">
                {["Zero minimum deposits", "No hidden fees — ever", "Regulated & fully compliant", "Open API for builders"].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full ev-gradient flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            {/* Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="ev-card p-5"
                >
                  <h3 className="text-sm font-bold mb-2">{v.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="section-y bg-background relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
        <div className="page-container relative z-10">
          <div className="text-center mb-12">
            <p className="text-label mb-3">Our Journey</p>
            <h2 className="text-h2">Building the Future, Step by Step</h2>
          </div>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-[30px] top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-6 pl-16 relative"
                >
                  <div className="absolute left-0 w-[60px] flex justify-center">
                    <div className="w-8 h-8 rounded-full ev-gradient flex items-center justify-center shadow-glow-primary z-10">
                      <span className="text-[9px] font-black text-white">{item.year.slice(2)}</span>
                    </div>
                  </div>
                  <div className="ev-card p-4 flex-1">
                    <p className="text-xs font-bold text-primary mb-0.5">{item.year}</p>
                    <p className="text-sm font-medium">{item.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="section-y bg-secondary/20">
        <div className="page-container">
          <div className="text-center mb-10">
            <p className="text-label mb-3">Leadership</p>
            <h2 className="text-h2">The People Behind EVONANCE</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-3xl mx-auto">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="ev-card p-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl ev-gradient flex items-center justify-center text-lg font-black text-white mx-auto mb-4 shadow-glow-primary">
                  {member.init}
                </div>
                <p className="text-sm font-bold">{member.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-y bg-background">
        <div className="page-container">
          <div className="ev-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 ev-gradient opacity-[0.06] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-h2 mb-4">Ready to Join Us?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">Start trading, swapping, and spending with EVONANCE. Create your account in under 2 minutes.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/signup" className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl ev-gradient text-white font-semibold text-sm shadow-glow-primary">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/markets" className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-all">
                  Explore Markets
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
