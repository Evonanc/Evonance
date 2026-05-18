"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ChevronDown, RefreshCw } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────
type Side = "buy" | "sell";
type OrderType = "limit" | "market" | "stop";
type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
type TabBottom = "open" | "history" | "trades";

const PAIRS = [
  { symbol: "BTC/USDT", price: 94231.50, change: 2.45, high: 95800, low: 91200, vol: "4.2B" },
  { symbol: "ETH/USDT", price: 3421.20,  change: -1.20, high: 3540, low: 3380, vol: "1.8B" },
  { symbol: "SOL/USDT", price: 215.45,   change: 5.67, high: 222, low: 205, vol: "892M" },
  { symbol: "BNB/USDT", price: 612.30,   change: 0.85, high: 625, low: 605, vol: "540M" },
  { symbol: "XRP/USDT", price: 2.18,     change: -0.42, high: 2.24, low: 2.11, vol: "310M" },
];

// ── Candlestick Chart (SVG) ──────────────────────────────────────────
function CandleChart({ pair }: { pair: typeof PAIRS[0] }) {
  const candles = React.useMemo(() => {
    const base = pair.price;
    return Array.from({ length: 60 }, (_, i) => {
      const t = (i / 59) * 8 * Math.PI;
      const trend = Math.sin(t * 0.3) * 0.05 + Math.cos(t * 0.7) * 0.03;
      const o = base * (1 + trend + (Math.random() - 0.5) * 0.015);
      const c = o * (1 + (Math.random() - 0.5) * 0.012);
      const h = Math.max(o, c) * (1 + Math.random() * 0.008);
      const lo = Math.min(o, c) * (1 - Math.random() * 0.008);
      return { o, c, h, l: lo, bull: c >= o };
    });
  }, [pair.symbol]);

  const allH = candles.map(c => c.h);
  const allL = candles.map(c => c.l);
  const maxP = Math.max(...allH);
  const minP = Math.min(...allL);
  const range = maxP - minP || 1;
  const W = 700, H = 260, PAD = 10;
  const cw = (W - PAD * 2) / candles.length;

  const py = (v: number) => PAD + ((maxP - v) / range) * (H - PAD * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <line key={t} x1={0} y1={PAD + t * (H - PAD * 2)} x2={W} y2={PAD + t * (H - PAD * 2)}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {/* Candles */}
      {candles.map((c, i) => {
        const x = PAD + i * cw + cw * 0.15;
        const bw = cw * 0.7;
        const oy = py(c.o), cy2 = py(c.c);
        const top = Math.min(oy, cy2), ht = Math.abs(oy - cy2) || 1;
        const color = c.bull ? "#22C55E" : "#EF4444";
        return (
          <g key={i}>
            <line x1={x + bw / 2} y1={py(c.h)} x2={x + bw / 2} y2={py(c.l)} stroke={color} strokeWidth="1" />
            <rect x={x} y={top} width={bw} height={ht} fill={color} opacity={0.85} rx={1} />
          </g>
        );
      })}
    </svg>
  );
}

// ── Order Book Row ───────────────────────────────────────────────────
function BookRow({ price, size, total, maxTotal, side }: {
  price: number; size: number; total: number; maxTotal: number; side: "bid" | "ask";
}) {
  const pct = (total / maxTotal) * 100;
  const isBid = side === "bid";
  return (
    <div className="relative flex items-center justify-between px-3 py-[3px] text-[11px] font-mono group hover:bg-secondary/40 transition-colors cursor-pointer">
      <div className="absolute inset-y-0 right-0 transition-all duration-300"
        style={{ width: `${pct}%`, background: isBid ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)" }} />
      <span className={cn("relative z-10 font-semibold tabular-nums", isBid ? "text-green-500" : "text-red-400")}>
        {price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className="relative z-10 text-muted-foreground tabular-nums">{size.toFixed(4)}</span>
      <span className="relative z-10 text-muted-foreground tabular-nums">{total.toFixed(2)}</span>
    </div>
  );
}

function OrderBook({ pair }: { pair: typeof PAIRS[0] }) {
  const asks = React.useMemo(() => Array.from({ length: 10 }, (_, i) => {
    const p = pair.price + (10 - i) * (pair.price * 0.0003 + Math.random() * pair.price * 0.0002);
    const s = 0.01 + Math.random() * 0.5;
    return { price: p, size: s, total: p * s };
  }).reverse(), [pair.price]);

  const bids = React.useMemo(() => Array.from({ length: 10 }, (_, i) => {
    const p = pair.price - (i + 1) * (pair.price * 0.0003 + Math.random() * pair.price * 0.0002);
    const s = 0.01 + Math.random() * 0.5;
    return { price: p, size: s, total: p * s };
  }), [pair.price]);

  const maxAsk = Math.max(...asks.map(a => a.total));
  const maxBid = Math.max(...bids.map(b => b.total));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order Book</p>
      </div>
      <div className="flex justify-between px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 border-b border-border/50">
        <span>Price</span><span>Size</span><span>Total</span>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col-reverse">
          {asks.map((a, i) => (
            <BookRow key={i} price={a.price} size={a.size} total={a.total} maxTotal={maxAsk} side="ask" />
          ))}
        </div>
        <div className="py-2 px-3 border-y border-border/60 bg-secondary/30">
          <span className={cn("text-base font-black tabular-nums", pair.change >= 0 ? "text-green-500" : "text-red-400")}>
            {pair.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-muted-foreground ml-2">≈ ${pair.price.toLocaleString()}</span>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {bids.map((b, i) => (
            <BookRow key={i} price={b.price} size={b.size} total={b.total} maxTotal={maxBid} side="bid" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Place Order Panel ────────────────────────────────────────────────
function OrderPanel({ pair }: { pair: typeof PAIRS[0] }) {
  const [side, setSide] = useState<Side>("buy");
  const [type, setType] = useState<OrderType>("limit");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState(pair.price.toString());
  const [pct, setPct] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const isBuy = side === "buy";
  const total = parseFloat(amount || "0") * parseFloat(price || "0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    setAmount("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Buy/Sell tabs */}
      <div className="grid grid-cols-2 border-b border-border">
        {(["buy", "sell"] as Side[]).map(s => (
          <button key={s} onClick={() => setSide(s)}
            className={cn("py-3 text-sm font-bold transition-all duration-200 capitalize",
              side === s
                ? s === "buy" ? "bg-green-500/10 text-green-500 border-b-2 border-green-500"
                              : "bg-red-500/10 text-red-400 border-b-2 border-red-500"
                : "text-muted-foreground hover:text-foreground"
            )}>
            {s}
          </button>
        ))}
      </div>

      {/* Order type */}
      <div className="flex gap-1 px-3 py-2 border-b border-border/50">
        {(["limit", "market", "stop"] as OrderType[]).map(t => (
          <button key={t} onClick={() => setType(t)}
            className={cn("px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all",
              type === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}>
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-3 gap-3">
        {/* Available */}
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Available</span>
          <span className="font-mono font-semibold">$12,480.00 USDT</span>
        </div>

        {/* Price (hidden for market) */}
        {type !== "market" && (
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Price</label>
            <div className="relative">
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                className="ev-input text-sm pr-14 font-mono" step="0.01" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-semibold">USDT</span>
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Amount</label>
          <div className="relative">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.0000" className="ev-input text-sm pr-12 font-mono" step="0.0001" min="0" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-semibold">
              {pair.symbol.split("/")[0]}
            </span>
          </div>
        </div>

        {/* % slider */}
        <div>
          <div className="flex justify-between mb-2">
            {[0, 25, 50, 75, 100].map(p => (
              <button key={p} type="button" onClick={() => setPct(p)}
                className={cn("px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                  pct === p ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                {p === 0 ? "0%" : `${p}%`}
              </button>
            ))}
          </div>
          <div className="relative h-1.5 bg-secondary rounded-full cursor-pointer"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const p = Math.round(((e.clientX - rect.left) / rect.width) * 100);
              setPct(Math.min(100, Math.max(0, p)));
            }}>
            <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-150"
              style={{ width: `${pct}%`, background: isBuy ? "#22C55E" : "#EF4444" }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow transition-all duration-150"
              style={{ left: `calc(${pct}% - 6px)`, background: isBuy ? "#22C55E" : "#EF4444" }} />
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Total</span>
          <span className="font-mono font-semibold">{total > 0 ? `$${total.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "—"}</span>
        </div>

        {/* Submit */}
        <button type="submit"
          className={cn("w-full h-10 rounded-xl text-sm font-bold text-white transition-all duration-200 mt-auto",
            submitted ? "bg-green-500" :
            isBuy ? "bg-green-500 hover:bg-green-600 active:scale-[0.98]"
                  : "bg-red-500 hover:bg-red-600 active:scale-[0.98]"
          )}>
          {submitted ? "✓ Order Placed" : `${isBuy ? "Buy" : "Sell"} ${pair.symbol.split("/")[0]}`}
        </button>
      </form>
    </div>
  );
}

// ── Bottom Tabs ──────────────────────────────────────────────────────
function BottomPanel() {
  const [tab, setTab] = useState<TabBottom>("open");

  return (
    <div className="border-t border-border">
      <div className="flex gap-1 px-4 border-b border-border">
        {(["open", "history", "trades"] as TabBottom[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2.5 text-xs font-semibold capitalize transition-all border-b-2",
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {t === "open" ? "Open Orders" : t === "history" ? "Order History" : "Recent Trades"}
          </button>
        ))}
      </div>
      <div className="h-32 flex items-center justify-center">
        {tab === "open" && <p className="text-xs text-muted-foreground">No open orders</p>}
        {tab === "history" && (
          <div className="w-full px-4 space-y-2 overflow-y-auto">
            {[
              { side: "buy", pair: "BTC/USDT", amt: 0.05, price: 93100, status: "Filled" },
              { side: "sell", pair: "ETH/USDT", amt: 1.2, price: 3380, status: "Filled" },
            ].map((o, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className={cn("font-bold capitalize", o.side === "buy" ? "text-green-500" : "text-red-400")}>{o.side}</span>
                <span className="text-muted-foreground">{o.pair}</span>
                <span className="font-mono">{o.amt}</span>
                <span className="font-mono">${o.price.toLocaleString()}</span>
                <span className="text-green-500 font-semibold">{o.status}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "trades" && (
          <div className="w-full px-4 space-y-1.5 overflow-y-auto">
            {Array.from({ length: 5 }, (_, i) => ({
              time: new Date(Date.now() - i * 12000).toLocaleTimeString(),
              price: (94231 - i * 12 + Math.random() * 20).toFixed(2),
              size: (0.001 + Math.random() * 0.1).toFixed(4),
              bull: Math.random() > 0.5,
            })).map((t, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                <span className={cn("font-semibold", t.bull ? "text-green-500" : "text-red-400")}>${t.price}</span>
                <span className="text-muted-foreground">{t.size}</span>
                <span className="text-muted-foreground/60">{t.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function TradePage() {
  const [activePair, setActivePair] = useState(PAIRS[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>("1h");
  const [pairOpen, setPairOpen] = useState(false);
  const isUp = activePair.change >= 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="h-16" aria-hidden />

      {/* ── Pair selector + stats bar ── */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-30">
        <div className="flex items-center gap-6 px-4 py-2.5 overflow-x-auto hide-scrollbar">
          {/* Pair picker */}
          <div className="relative shrink-0">
            <button onClick={() => setPairOpen(!pairOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
              <span className="text-sm font-black">{activePair.symbol}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", pairOpen && "rotate-180")} />
            </button>
            {pairOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 ev-card shadow-lg z-50 overflow-hidden">
                {PAIRS.map(p => (
                  <button key={p.symbol} onClick={() => { setActivePair(p); setPairOpen(false); }}
                    className={cn("w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-secondary transition-colors",
                      p.symbol === activePair.symbol && "bg-secondary text-foreground"
                    )}>
                    <span className="font-bold">{p.symbol}</span>
                    <span className={cn("text-xs font-semibold", p.change >= 0 ? "text-green-500" : "text-red-400")}>
                      {p.change >= 0 ? "+" : ""}{p.change}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price + change */}
          <div className="flex items-baseline gap-2 shrink-0">
            <span className={cn("text-2xl font-black tabular-nums", isUp ? "text-green-500" : "text-red-400")}>
              ${activePair.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className={cn("text-xs font-bold flex items-center gap-0.5", isUp ? "text-green-500" : "text-red-400")}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isUp ? "+" : ""}{activePair.change}%
            </span>
          </div>

          {/* 24h stats */}
          {[
            { label: "24h High", value: `$${activePair.high.toLocaleString()}` },
            { label: "24h Low",  value: `$${activePair.low.toLocaleString()}` },
            { label: "Volume",   value: activePair.vol },
          ].map(s => (
            <div key={s.label} className="shrink-0">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className="text-xs font-bold font-mono">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main trading grid ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Order book — left */}
        <div className="hidden lg:flex w-52 xl:w-60 border-r border-border flex-col shrink-0 bg-card/30">
          <OrderBook pair={activePair} />
        </div>

        {/* Chart — centre */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border">
          {/* Timeframe tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
            {(["1m","5m","15m","1h","4h","1d"] as Timeframe[]).map(tf => (
              <button key={tf} onClick={() => setTimeframe(tf)}
                className={cn("px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all",
                  timeframe === tf ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                {tf}
              </button>
            ))}
            <div className="ml-auto">
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin" style={{ animationDuration: "3s" }} />
            </div>
          </div>

          {/* Candlestick chart */}
          <div className="flex-1 p-2 min-h-[260px] max-h-[400px]">
            <CandleChart pair={activePair} />
          </div>

          {/* Bottom orders panel */}
          <BottomPanel />
        </div>

        {/* Buy/Sell panel — right */}
        <div className="w-full lg:w-64 xl:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-card/30">
          <OrderPanel pair={activePair} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
