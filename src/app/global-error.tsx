"use client";

import { useEffect } from "react";
import { RefreshCcw, AlertTriangle } from "lucide-react";
import { Inter, Outfit } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Application Error:", error);

    // Handle ChunkLoadError specifically
    const isChunkError = 
      error.name === "ChunkLoadError" || 
      error.message.toLowerCase().includes("loading chunk") ||
      error.message.toLowerCase().includes("failed to fetch") ||
      error.message.toLowerCase().includes("dynamically imported module");

    if (isChunkError) {
      console.warn("Global ChunkLoadError detected, forcing reload...");
      window.location.reload();
    }
  }, [error]);

  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable, outfit.variable)}>
        <div className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center bg-background">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-8">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight">System Interruption</h1>
          <p className="text-muted-foreground max-w-md mb-10 text-lg">
            We've encountered a critical error. This usually happens after a system update. 
            Refreshing the page should resolve this.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
            <button
              onClick={() => reset()}
              className="px-8 py-3.5 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <RefreshCcw className="w-5 h-5" />
              Attempt Recovery
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3.5 rounded-2xl bg-secondary font-bold hover:bg-secondary/80 transition-all flex items-center justify-center"
            >
              Hard Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
