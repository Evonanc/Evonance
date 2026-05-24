import { usePWA } from '../hooks/usePWA';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-500 text-slate-950
      px-4 py-2.5 flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <p className="text-sm font-medium">
        You're offline — showing cached data. Some features may be unavailable.
      </p>
    </div>
  );
}
