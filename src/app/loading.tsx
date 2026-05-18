import React from "react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative w-16 h-16">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        
        {/* Inner Pulse */}
        <div className="absolute inset-4 rounded-full bg-primary/20 animate-pulse" />
      </div>
      <div className="mt-6 flex flex-col items-center gap-1">
        <h2 className="text-sm font-black tracking-[0.2em] text-foreground uppercase">EVONANCE</h2>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
