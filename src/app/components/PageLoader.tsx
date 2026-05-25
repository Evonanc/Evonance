import { Loader2 } from 'lucide-react';

// Full page loader — for route transitions
export function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
            E
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Inline content loader — for components inside a page
export function ContentLoader({
  height = '200px'
}: { height?: string }) {
  return (
    <div
      className="flex items-center justify-center bg-secondary/50 rounded-2xl"
      style={{ height }}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Admin page loader — slightly different style
export function AdminPageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Error boundary fallback — shown if a chunk fails to load
export function ChunkErrorFallback({
  onRetry
}: { onRetry?: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Failed to load page
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          This could be due to a network issue or a new version of the app being deployed. Try refreshing.
        </p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
              Retry
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="border border-border bg-background text-foreground rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors">
            Refresh page
          </button>
        </div>
      </div>
    </div>
  );
}
