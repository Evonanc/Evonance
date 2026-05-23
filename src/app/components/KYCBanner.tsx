import { useNavigate } from 'react-router';
import { Shield, X, ChevronRight } from 'lucide-react';
import { useKYC } from '../hooks/useKYC';
import { useState } from 'react';

export default function KYCBanner() {
  const navigate = useNavigate();
  const { status, level, limits } = useKYC();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if verified, pending, or dismissed
  if (dismissed || status === 'verified' || status === 'pending') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5
      border border-primary/20 rounded-2xl p-4 flex items-center
      justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center
          justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {status === 'rejected'
              ? 'KYC rejected — please resubmit'
              : 'Verify your identity to unlock full access'
            }
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            Current limit: ${limits.daily.toLocaleString()}/day
            {' · '}Verified limit: $10,000/day
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigate('/kyc')}
          className="flex items-center gap-1.5 bg-primary
            text-primary-foreground rounded-lg px-4 py-2 text-sm
            font-semibold hover:opacity-90 transition-opacity">
          {status === 'rejected' ? 'Resubmit' : 'Verify Now'}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground
            hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
