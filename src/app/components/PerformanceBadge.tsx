import { useState, useEffect } from 'react';
import { onLCP, onFCP, onCLS, onTTFB, onINP } from 'web-vitals';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const RATING_COLORS = {
  good:               'text-emerald-500',
  'needs-improvement':'text-amber-500',
  poor:               'text-rose-500',
};

export default function PerformanceBadge() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [visible, setVisible] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) return null;

  useEffect(() => {
    const addMetric = (metric: any) => {
      const thresholds: Record<string, [number, number]> = {
        LCP:  [2500, 4000],
        FCP:  [1800, 3000],
        CLS:  [0.1, 0.25],
        TTFB: [800, 1800],
        INP:  [200, 500],
      };
      const [good, poor] = thresholds[metric.name] ?? [0, 0];
      const rating: 'good' | 'needs-improvement' | 'poor' = metric.value <= good ? 'good'
        : metric.value <= poor ? 'needs-improvement'
        : 'poor';

      setMetrics(prev => {
        const existing = prev.findIndex(m => m.name === metric.name);
        const updated: Metric = { name: metric.name, value: metric.value, rating };
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = updated;
          return next;
        }
        return [...prev, updated];
      });
    };

    onLCP(addMetric);
    onFCP(addMetric);
    onCLS(addMetric);
    onTTFB(addMetric);
    onINP(addMetric);
  }, []);

  if (metrics.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      <button
        onClick={() => setVisible(v => !v)}
        className="bg-card border border-border rounded-full px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground shadow-lg">
        ⚡ Vitals
      </button>
      {visible && (
        <div className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-2xl p-3 min-w-[160px]">
          <p className="text-xs font-semibold text-foreground mb-2 animate-pulse">
            Web Vitals (dev)
          </p>
          {metrics.map(m => (
            <div key={m.name} className="flex items-center justify-between gap-4 py-1">
              <span className="text-xs text-muted-foreground font-mono">
                {m.name}
              </span>
              <span className={`text-xs font-mono font-bold ${RATING_COLORS[m.rating]}`}>
                {m.name === 'CLS'
                  ? m.value.toFixed(3)
                  : `${Math.round(m.value)}ms`
                }
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
