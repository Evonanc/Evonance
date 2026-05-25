import { onCLS, onINP, onLCP, onTTFB, onFCP, Metric } from 'web-vitals';

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function sendToAnalytics(metric: Metric, options: { params: Record<string, string>; path: string }) {
  const body = {
    dsn: import.meta.env.VITE_ANALYTICS_ID || 'evonance-vitals-dsn',
    id: metric.id,
    name: metric.name,
    value: metric.value.toString(),
    speed: 'connection' in navigator && (navigator as any).connection ? (navigator as any).connection.effectiveType : 'unknown',
    page: options.path,
    href: window.location.href,
  };

  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric);
    // Dispatch custom event for PerformanceBadge component
    const event = new CustomEvent('web-vital-metric', { detail: metric });
    window.dispatchEvent(event);
    return;
  }

  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: 'application/x-www-form-urlencoded',
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else {
    fetch(vitalsUrl, {
      body: JSON.stringify(body),
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
    });
  }
}

export function measureWebVitals() {
  try {
    onINP((metric: Metric) => sendToAnalytics(metric, { params: {}, path: window.location.pathname }));
    onTTFB((metric: Metric) => sendToAnalytics(metric, { params: {}, path: window.location.pathname }));
    onLCP((metric: Metric) => sendToAnalytics(metric, { params: {}, path: window.location.pathname }));
    onCLS((metric: Metric) => sendToAnalytics(metric, { params: {}, path: window.location.pathname }));
    onFCP((metric: Metric) => sendToAnalytics(metric, { params: {}, path: window.location.pathname }));
  } catch (err) {
    console.error('[Web Vitals] Failed to initialize:', err);
  }
}
