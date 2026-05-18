"use client";

import { useEffect } from "react";
import { RefreshCcw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Segment Error Boundary:", error);

    // If it's a ChunkLoadError, it's often due to a new deployment or dev server sync issue
    const errorMessage = error.message?.toLowerCase() || "";
    const isChunkError = 
      error.name === "ChunkLoadError" || 
      errorMessage.includes("loading chunk") ||
      errorMessage.includes("failed to fetch") ||
      errorMessage.includes("dynamically imported module") ||
      errorMessage.includes("loading css chunk");

    if (isChunkError) {
      console.warn("ChunkLoadError detected in segment, forcing reload...");
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-black mb-2">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        We encountered an unexpected error. This might be due to a recent update or a temporary connection issue.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-xl bg-secondary font-bold hover:bg-secondary/80 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
