"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, QrCode, ArrowDownLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: {
    symbol: string;
    name: string;
  };
}

export function DepositModal({ isOpen, onClose, asset = { symbol: "BTC", name: "Bitcoin" } }: DepositModalProps) {
  const [copied, setCopied] = useState(false);
  const address = "0x742d35Cc6634C0532925a3b8D4C9e5C8aB4";

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display">Deposit {asset.symbol}</h2>
                <p className="text-xs text-muted-foreground">{asset.name} Network</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 bg-white p-4 rounded-3xl shadow-sm mb-4">
                 {/* QR Code Placeholder */}
                 <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
                    <QrCode className="w-12 h-12 text-slate-300" />
                 </div>
              </div>
              <p className="text-[11px] text-center text-muted-foreground max-w-[240px]">
                Only send <span className="font-bold text-foreground">{asset.symbol}</span> to this address. Sending any other asset may result in permanent loss.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Wallet Address</label>
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-2xl border border-border group">
                <p className="text-xs font-mono font-medium flex-1 truncate">{address}</p>
                <button onClick={copyAddress} className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border hover:border-primary/40 transition-all">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                 <p className="text-[11px] font-bold text-primary">Expected Arrival</p>
                 <p className="text-[10px] text-primary/70 leading-relaxed">
                   Deposits typically reflect after 3 network confirmations (~10-20 minutes). 
                   You will receive a notification once confirmed.
                 </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-secondary/30 flex justify-center">
             <button onClick={onClose} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Done</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
