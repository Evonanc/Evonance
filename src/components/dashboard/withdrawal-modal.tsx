"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, AlertCircle, RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: {
    id: string;
    symbol: string;
    name: string;
    balance: number;
  };
}

export function WithdrawalModal({ isOpen, onClose, asset = { id: "btc", symbol: "BTC", name: "Bitcoin", balance: 0.245 } }: WithdrawalModalProps) {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 2000));
    setStatus("success");
    setLoading(false);
    setTimeout(() => {
       onClose();
       setStatus("idle");
       setAddress("");
       setAmount("");
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md ev-card shadow-ev-4 p-0 overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display">Withdraw {asset.symbol}</h2>
                <p className="text-xs text-muted-foreground">Internal or External Transfer</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {status === "success" ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold">Transfer Initiated</h3>
                <p className="text-xs text-muted-foreground mt-1 px-8">Your withdrawal request is being processed. You can track its status in the transaction history.</p>
              </motion.div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Recipient Address</label>
                  <input
                    required
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Enter wallet address"
                    className="ev-input"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between ml-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount</label>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Balance: {asset.balance} {asset.symbol}</span>
                  </div>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      step="any"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="ev-input pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setAmount(asset.balance.toString())}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary hover:text-primary/80 transition-colors uppercase"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div className="ev-card bg-secondary/30 p-4 space-y-2 border-border/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span className="font-mono font-medium text-foreground/80">0.0001 {asset.symbol}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold pt-1 border-t border-border/50">
                    <span className="text-foreground/70">Total Amount</span>
                    <span className="text-foreground">{(parseFloat(amount) || 0) > 0 ? (parseFloat(amount) + 0.0001).toFixed(6) : "0.0000"} {asset.symbol}</span>
                  </div>
                </div>

                <button
                  disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > asset.balance}
                  className="w-full h-11 rounded-2xl bg-red-400 text-white font-bold text-xs shadow-lg shadow-red-400/20 hover:bg-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Withdraw " + asset.symbol}
                </button>

                <div className="flex items-start gap-2 text-[10px] text-muted-foreground/60 leading-relaxed px-1">
                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                  Please verify the address carefully. Assets sent to the wrong address cannot be recovered. Withdrawal processing may take up to 30 minutes.
                </div>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
