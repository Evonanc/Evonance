import React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-lg bg-secondary/40", className)} />;
}

export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="w-9 h-9" />
          <Skeleton className="w-9 h-9" />
        </div>
      </div>

      {/* Portfolio Value Skeleton */}
      <div className="relative rounded-3xl p-8 h-48 bg-secondary/40 overflow-hidden">
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>

        {/* Activity Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
