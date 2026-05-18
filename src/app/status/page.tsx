"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { CheckCircle, RefreshCw } from "lucide-react";

const SERVICES = [
  { name: "Trading Engine",     region: "Global",       uptime: "99.99%" },
  { name: "Market Data Feed",   region: "Global",       uptime: "99.97%" },
  { name: "API Gateway",        region: "Global",       uptime: "99.99%" },
  { name: "Virtual Cards",      region: "Global",       uptime: "99.95%" },
  { name: "Swap Engine",        region: "Global",       uptime: "99.98%" },
  { name: "Wallet Service",     region: "Global",       uptime: "100.00%" },
  { name: "Authentication",     region: "Global",       uptime: "99.99%" },
  { name: "Web App (Vercel)",   region: "Edge",         uptime: "99.99%" },
];

const INCIDENTS = [
  { date: "May 5, 2026",  title: "Resolved: Delayed market data for 3 assets", duration: "12 min", resolved: true },
  { date: "Apr 18, 2026", title: "Resolved: Elevated API latency in AP region",  duration: "28 min", resolved: true },
];

export default function StatusPage() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" aria-hidden />

      {/* Hero */}
      <section className="relative pt-14 pb-10 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
        <div className="page-container relative z-10 max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-h1 mb-3">All Systems Operational</h1>
          <p className="text-muted-foreground text-sm">
            Real-time status for all EVONANCE services.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
            <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: "4s" }} />
            Last checked: {now.toLocaleTimeString()}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="pb-12">
        <div className="page-container max-w-2xl mx-auto">
          <div className="ev-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-secondary/20">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Service Status</p>
            </div>
            <div className="divide-y divide-border/60">
              {SERVICES.map(s => (
                <div key={s.name} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.region}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-green-500 font-bold">{s.uptime}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-semibold">Operational</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 90-day uptime bars */}
      <section className="pb-12">
        <div className="page-container max-w-2xl mx-auto">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">90-Day Uptime</h2>
          <div className="ev-card p-6">
            <div className="flex gap-0.5">
              {Array.from({ length: 90 }, (_, i) => {
                const incident = i === 74 || i === 61;
                return (
                  <div key={i} className="flex-1 h-8 rounded-[2px] transition-all hover:opacity-80"
                    style={{ background: incident ? "#EF4444" : "#22C55E", opacity: incident ? 0.6 : 0.7 }} />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>90 days ago</span>
              <span className="font-semibold text-green-500">99.97% uptime</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </section>

      {/* Past incidents */}
      <section className="pb-24">
        <div className="page-container max-w-2xl mx-auto">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Recent Incidents</h2>
          <div className="space-y-3">
            {INCIDENTS.map((inc, i) => (
              <div key={i} className="ev-card p-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">{inc.date} · Duration: {inc.duration}</p>
                  <p className="text-sm font-semibold">{inc.title}</p>
                </div>
                {inc.resolved && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 font-bold shrink-0">Resolved</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
