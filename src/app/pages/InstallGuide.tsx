import { useState } from 'react';
import { Link } from 'react-router';
import Navigation from '../components/Navigation';
import { usePWA } from '../hooks/usePWA';
import { Download, Smartphone, ArrowLeft, CheckCircle, Chrome } from 'lucide-react';
import { toast } from 'sonner';

export default function InstallGuide() {
  const { canInstall, isInstalled, promptInstall } = usePWA();
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const accepted = await promptInstall();
      if (accepted) toast.success('EVONANCE installed!');
    } catch {
      toast.error('Installation failed. Try from your browser menu instead.');
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back link */}
        <Link
          to="/settings"
          className="flex items-center gap-2 text-sm text-muted-foreground
            hover:text-foreground transition-colors mb-6 decoration-none">
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex
            items-center justify-center mb-4">
            <Download className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Install EVONANCE
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Add EVONANCE to your home screen for instant access
            and a full native-app experience — no App Store required.
          </p>
        </div>

        {/* Already installed */}
        {isInstalled && (
          <div className="bg-green-500/5 border border-green-500/20
            rounded-2xl p-5 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-foreground">
              EVONANCE is already installed on this device.
            </p>
          </div>
        )}

        {/* Direct install button (Chrome/Edge/Android) */}
        {canInstall && (
          <div className="bg-primary/5 border border-primary/20
            rounded-2xl p-6 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Chrome className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Your browser supports one-click installation
              </p>
            </div>
            <button
              onClick={handleInstall}
              disabled={installing}
              className="mt-3 bg-primary text-primary-foreground rounded-xl
                px-8 py-3 font-semibold hover:opacity-90 transition-opacity
                flex items-center gap-2 mx-auto cursor-pointer border-none
                disabled:opacity-60">
              {installing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30
                    border-t-white rounded-full animate-spin" />
                  Installing…
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Install EVONANCE
                </>
              )}
            </button>
          </div>
        )}

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: '⚡', title: 'Instant launch', desc: 'Opens in under a second' },
            { icon: '📴', title: 'Works offline', desc: 'View cached data anytime' },
            { icon: '🔔', title: 'Push alerts', desc: 'Price & trade notifications' },
            { icon: '🔒', title: 'Secure', desc: 'Same security as the web' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-card border border-border
              rounded-xl p-4">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* iOS guide */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-secondary flex
              items-center justify-center text-lg">
              🍎
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                iPhone / iPad (iOS 16.4+)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Use Safari — Chrome on iOS does not support PWA install
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Open evonance.vercel.app in Safari' },
              { step: '2', text: 'Tap the Share button ⎙ at the bottom of the screen' },
              { step: '3', text: 'Scroll down and tap "Add to Home Screen"' },
              { step: '4', text: 'Tap "Add" in the top-right corner' },
              { step: '5', text: 'EVONANCE now appears on your home screen as an app icon' },
            ].map(({ step, text }) => (
              <div key={step} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary
                  text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Android guide */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-secondary flex
              items-center justify-center">
              <Smartphone className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Android
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Use Chrome, Edge, or Samsung Internet
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Open evonance.vercel.app in Chrome' },
              { step: '2', text: 'Tap the three-dot menu ⋮ in the top-right corner' },
              { step: '3', text: 'Tap "Add to Home screen" or "Install app"' },
              { step: '4', text: 'Tap "Install" to confirm' },
              { step: '5', text: 'EVONANCE installs as a standalone app — no browser chrome' },
            ].map(({ step, text }) => (
              <div key={step} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary
                  text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
