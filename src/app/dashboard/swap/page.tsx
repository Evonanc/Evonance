"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown, ChevronDown, Settings, Info,
  Clock, Check, TrendingUp, Zap, AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { getMarketAssets, getBatchPrices, getBybitPrices } from "@/services/market";
import { getSwapQuote, executeSwap, type SwapQuote } from "@/services/swap";
import type { SupportedAsset, MarketAsset } from "@/types/database";

// ── Token Selector ────────────────────────────────────────────────
function TokenButton({ asset, onClick }: { asset: SupportedAsset | null; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary hover:bg-muted transition-all duration-200 shrink-0"
    >
      <div className="w-6 h-6 rounded-full ev-gradient flex items-center justify-center text-[8px] font-black text-white shrink-0">
        {asset?.symbol.slice(0, 3) || "?"}
      </div>
      <span className="text-sm font-bold">{asset?.symbol || "Select"}</span>
      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
    </button>
  );
}

// ── Token Dropdown ────────────────────────────────────────────────
function TokenDropdown({
  open,
  onClose,
  onSelect,
  assets,
  excludeId,
  prices
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (a: SupportedAsset) => void;
  assets: SupportedAsset[];
  excludeId?: string;
  prices: Record<string, number>;
}) {
  if (!open) return null;
  return (
    <div className="absolute z-50 top-full mt-2 left-0 right-0 ev-card shadow-ev-4 p-2 max-h-64 overflow-y-auto">
      {assets.filter(a => a.id !== excludeId).map(asset => (
        <button
          key={asset.id}
          onClick={() => { onSelect(asset); onClose(); }}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-xl ev-gradient flex items-center justify-center text-[10px] font-black text-white shrink-0">
            {asset.symbol.slice(0, 3)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{asset.symbol}</p>
            <p className="text-xs text-muted-foreground">{asset.name}</p>
          </div>
          <p className="text-xs font-mono text-muted-foreground">
            ${(prices[asset.id] || 0).toLocaleString()}
          </p>
        </button>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function SwapPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<SupportedAsset[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [marketAssets, setMarketAssets] = useState<MarketAsset[]>([]);
  
  const [fromAsset, setFromAsset] = useState<SupportedAsset | null>(null);
  const [toAsset,   setToAsset]   = useState<SupportedAsset | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen,   setToOpen]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Ref so interval always sees fresh assets without re-mounting
  const assetsRef = React.useRef<SupportedAsset[]>([]);
  React.useEffect(() => { assetsRef.current = assets; }, [assets]);

  const fetchBalances = useCallback(async (userId: string) => {
    const supabase = createClient();
    const { data: wallets } = await supabase.from("wallets").select("id").eq("user_id", userId).single();
    if (wallets) {
      const { data: bal } = await supabase.from("wallet_balances").select("asset_id, balance").eq("wallet_id", wallets.id);
      if (bal) {
        const bMap: Record<string, number> = {};
        bal.forEach((b: any) => bMap[b.asset_id] = Number(b.balance));
        setBalances(bMap);
      }
    }
  }, []);

  // ── One-time data initialisation ──────────────────────────────
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: supportedData } = await supabase
        .from("supported_assets")
        .select("*")
        .eq("is_active", true);
      const supported = supportedData as SupportedAsset[] | null;
      const mkts = await getMarketAssets(4);

      if (supported && supported.length > 0) {
        setAssets(supported);
        assetsRef.current = supported;
        const pData = await getBatchPrices(supported.map((a) => a.id));
        setPrices(pData);
        setFromAsset(supported.find((a) => a.symbol === "BTC") ?? supported[0]);
        setToAsset(supported.find((a) => a.symbol === "USDT") ?? supported[1]);
      }

      setMarketAssets(mkts);
      if (user) await fetchBalances(user.id);
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchBalances]);

  // ── Real-time price update interval (separate — uses ref) ──────
  useEffect(() => {
    const interval = setInterval(async () => {
      const bybit = await getBybitPrices();

      // Use assetsRef so we always have the latest list without re-mounting
      setPrices((prev) => {
        const next = { ...prev };
        Object.entries(bybit).forEach(([sym, d]) => {
          const asset = assetsRef.current.find(
            (a) => a.symbol.toUpperCase() === sym
          );
          if (asset) next[asset.id] = d.price;
        });
        return next;
      });

      setMarketAssets((prev) =>
        prev.map((m) => {
          const live = bybit[m.symbol.toUpperCase()];
          return live
            ? { ...m, current_price: live.price, price_change_percentage_24h: live.change24h }
            : m;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []); // intentionally empty — only mount/unmount

  useEffect(() => {
    async function updateQuote() {
      const amt = parseFloat(fromAmount);
      if (!amt || !fromAsset || !toAsset) {
        setQuote(null);
        return;
      }
      const q = await getSwapQuote(fromAsset.id, toAsset.id, amt);
      setQuote(q);
    }
    const timer = setTimeout(updateQuote, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, fromAsset, toAsset]);

  const swap = () => {
    const tmp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(tmp);
    setFromAmount(quote?.toAmount.toFixed(6) || "");
  };

  const handleConfirm = async () => {
    if (!user || !quote) return;
    setError(null);
    setConfirming(true);
    
    const res = await executeSwap(user.id, quote);
    if (res.success) {
      setSuccess(true);
      setFromAmount("");
      await fetchBalances(user.id);
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setError(res.error || "Swap failed");
    }
    setConfirming(false);
  };

  const fromBal = fromAsset ? balances[fromAsset.id] || 0 : 0;
  const toBal   = toAsset   ? balances[toAsset.id]   || 0 : 0;

  return (
    <DashboardLayout title="Swap">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold font-display">Instant Swap</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Exchange crypto assets at the best rates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ─ Swap Card ─ */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="ev-card p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Swap Tokens</p>
                <button className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-500 text-xs font-medium">
                  <Check className="w-3.5 h-3.5" /> Swap successful!
                </div>
              )}

              {/* FROM panel */}
              <div className="relative bg-secondary/50 rounded-2xl p-4 border border-border focus-within:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground font-medium">You Pay</p>
                  <p className="text-xs text-muted-foreground">Balance: {fromBal.toFixed(4)} {fromAsset?.symbol}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={fromAmount}
                      onChange={e => setFromAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full text-2xl font-bold bg-transparent outline-none placeholder:text-foreground/20"
                    />
                    {fromAmount && fromAsset && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ≈ ${(parseFloat(fromAmount) * (prices[fromAsset.id] || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                    <TokenButton asset={fromAsset} onClick={() => { setFromOpen(!fromOpen); setToOpen(false); }} />
                    <TokenDropdown 
                      open={fromOpen} onClose={() => setFromOpen(false)} 
                      onSelect={setFromAsset} assets={assets} 
                      excludeId={toAsset?.id} prices={prices} 
                    />
                  </div>
                </div>
                <div className="flex gap-1.5 mt-3">
                  {["25%", "50%", "75%", "Max"].map(p => (
                    <button 
                      key={p} 
                      onClick={() => {
                        const pct = p === "Max" ? 1 : parseInt(p) / 100;
                        setFromAmount((fromBal * pct).toFixed(6));
                      }}
                      className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Swap arrow */}
              <div className="flex justify-center">
                <button
                  onClick={swap}
                  className="w-9 h-9 rounded-xl border-4 border-background ev-gradient flex items-center justify-center shadow-glow-primary hover:scale-110 transition-all duration-200"
                >
                  <ArrowUpDown className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* TO panel */}
              <div className="relative bg-secondary/50 rounded-2xl p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground font-medium">You Receive</p>
                  <p className="text-xs text-muted-foreground">Balance: {toBal.toFixed(4)} {toAsset?.symbol}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className={cn(
                      "text-2xl font-bold",
                      !quote ? "text-foreground/20" : "text-green-500"
                    )}>
                      {quote ? quote.toAmount.toFixed(6) : "0.00"}
                    </p>
                    {quote && toAsset && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ≈ ${(quote.toAmount * (prices[toAsset.id] || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                    <TokenButton asset={toAsset} onClick={() => { setToOpen(!toOpen); setFromOpen(false); }} />
                    <TokenDropdown 
                      open={toOpen} onClose={() => setToOpen(false)} 
                      onSelect={setToAsset} assets={assets} 
                      excludeId={fromAsset?.id} prices={prices} 
                    />
                  </div>
                </div>
              </div>

              {/* Rate row */}
              {quote && fromAsset && toAsset && (
                <div className="px-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Zap className="w-3 h-3 text-primary" />
                    Best Rate
                  </div>
                  <span className="font-mono font-medium">
                    1 {fromAsset.symbol} = {quote.exchangeRate.toFixed(6)} {toAsset.symbol}
                  </span>
                </div>
              )}

              {/* Details */}
              <div className="ev-card bg-secondary/30 p-4 space-y-3 border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Info className="w-3 h-3" />
                    Slippage Tolerance
                  </div>
                  <div className="flex items-center gap-1">
                    {["0.1%", "0.5%", "1.0%"].map(s => (
                      <button
                        key={s}
                        className={cn(
                          "px-2.5 h-6 rounded-lg text-[10px] font-semibold transition-all",
                          s === "0.5%" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {quote && (
                  <div className="space-y-2">
                    {[
                      ["Price Impact", `${quote.priceImpact * 100}%`, "text-green-500"],
                      ["Network Fee", `$${quote.feeUsd.toFixed(2)}`, "text-foreground/80"],
                      ["Route", `${fromAsset?.symbol} → ${toAsset?.symbol}`, "text-foreground/80"],
                    ].map(([label, value, cls]) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <span className={cn("font-medium", cls)}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                disabled={!quote || confirming || fromBal < parseFloat(fromAmount)}
                onClick={handleConfirm}
                className="w-full h-12 rounded-2xl ev-gradient text-white font-semibold text-sm shadow-glow-primary transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <AnimatePresence mode="wait">
                  {confirming ? (
                    <motion.div key="confirming" className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Confirming…
                    </motion.div>
                  ) : !parseFloat(fromAmount) ? (
                    <motion.span key="enter">Enter an amount</motion.span>
                  ) : fromBal < parseFloat(fromAmount) ? (
                    <motion.span key="bal">Insufficient Balance</motion.span>
                  ) : (
                    <motion.span key="swap">
                      Swap {fromAsset?.symbol} → {toAsset?.symbol}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          </div>

          {/* ─ Right Panel ─ */}
          <div className="lg:col-span-2 space-y-5">
            {/* Market rate info */}
            <div className="ev-card p-5">
              <p className="text-label mb-4">Market Snapshot</p>
              <div className="space-y-3">
                {marketAssets.map(m => (
                  <div key={m.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full ev-gradient flex items-center justify-center text-[8px] font-black text-white shrink-0">
                        {m.symbol.toUpperCase()}
                      </div>
                      <p className="text-xs font-semibold">{m.symbol.toUpperCase()}</p>
                    </div>
                    <p className="text-xs font-mono font-medium">${m.current_price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Balance Summary */}
            <div className="ev-card p-5">
              <p className="text-label mb-4">My Assets</p>
              <div className="space-y-2">
                {assets.filter(a => balances[a.id] > 0).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded-xl bg-secondary/30">
                    <span className="text-xs font-bold">{a.symbol}</span>
                    <span className="text-xs font-mono">{balances[a.id].toFixed(4)}</span>
                  </div>
                ))}
                {Object.values(balances).every(b => b === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-4">No balances found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
