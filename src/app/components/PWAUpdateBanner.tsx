import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function PWAUpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [reg, setReg] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(registration => {
      setReg(registration);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            setShowUpdate(true);
          }
        });
      });
    });

    // Also check for waiting worker on load
    navigator.serviceWorker.ready.then(registration => {
      if (registration.waiting) {
        setShowUpdate(true);
      }
    });
  }, []);

  const handleUpdate = () => {
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto
      sm:right-4 sm:w-80 z-50">
      <div className="bg-card border border-border rounded-2xl
        shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex
            items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Update available
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              A new version of EVONANCE is ready.
              Refresh to get the latest features.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-primary text-primary-foreground cursor-pointer
                  rounded-lg py-2 text-xs font-semibold hover:opacity-90
                  transition-opacity border-none">
                Update now
              </button>
              <button
                onClick={() => setShowUpdate(false)}
                className="px-3 py-2 border border-border bg-background cursor-pointer
                  text-foreground rounded-lg text-xs font-semibold
                  hover:bg-secondary transition-colors">
                Later
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowUpdate(false)}
            className="text-muted-foreground hover:text-foreground p-1 cursor-pointer bg-transparent border-none">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
