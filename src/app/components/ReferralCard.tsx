import { Link } from 'react-router';
import { Gift, Users, Copy, Check, ChevronRight } from 'lucide-react';
import { useReferral } from '../hooks/useReferral';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ReferralCard() {
  const { settings, statusCounts, referralLink, loading } = useReferral();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral link copied!');
  };

  if (loading) return null;

  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5
      border border-primary/20 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Refer & Earn</h3>
        </div>
        <Link to="/referral"
          className="text-xs text-primary hover:underline font-medium
            flex items-center gap-0.5">
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Earn <span className="font-semibold text-foreground">$10 USDT</span>
        {' '}for every friend who joins and trades
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Referred', value: statusCounts.total },
          { label: 'Qualified', value: statusCounts.qualified + statusCounts.rewarded },
          { label: 'Earned', value: `$${(settings?.total_earned ?? 0).toFixed(0)}` },
        ].map(({ label, value }) => (
          <div key={label}
            className="bg-background/50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Copy link button */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2
          bg-primary text-primary-foreground rounded-xl py-2.5
          text-sm font-semibold hover:opacity-90 transition-opacity">
        {copied
          ? <><Check className="w-4 h-4" /> Link Copied!</>
          : <><Copy className="w-4 h-4" /> Copy Referral Link</>
        }
      </button>
    </div>
  );
}
