import { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';
import { X, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function PWAInstallBanner() {
  const { canInstall, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(
      'pwa-install-dismissed'
    );
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const accepted = await promptInstall();
      if (accepted) {
        toast.success('EVONANCE installed successfully!');
        setDismissed(true);
      }
    } catch {
      toast.error('Installation failed. Try again from your browser menu.');
    } finally {
      setInstalling(false);
    }
  };

  if (!canInstall || dismissed) return null;

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 mb-4">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5
        border border-primary/20 rounded-2xl p-4 flex items-center
        justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center
            justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Install EVONANCE App
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add to your home screen for instant access
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            disabled={installing}
            className="flex items-center gap-1.5 bg-primary cursor-pointer
              text-primary-foreground rounded-lg px-4 py-2 text-sm
              font-semibold hover:opacity-90 transition-opacity
              disabled:opacity-70">
            {installing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30
                  border-t-white rounded-full animate-spin" />
                Installing...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Install
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-lg hover:bg-secondary cursor-pointer border-none bg-transparent
              text-muted-foreground hover:text-foreground
              transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
