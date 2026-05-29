import { useNavigate } from 'react-router';
import { Shield, Clock, ShieldOff, ChevronRight } from 'lucide-react';

interface Props {
  status: string;
  onClose: () => void;
}

export default function KYCGate({ status, onClose }: Props) {
  const navigate = useNavigate();

  const handleVerify = () => {
    onClose();
    navigate('/kyc');
  };

  if (status === 'verified') return null;

  const config = {
    unverified: {
      icon: Shield,
      iconClass: 'text-warning',
      bgClass: 'bg-warning/10',
      borderClass: 'border-warning/20',
      title: 'Identity verification required',
      message: 'You need to complete KYC verification before you can withdraw funds. This protects your account and complies with financial regulations.',
      cta: 'Verify My Identity',
      ctaStyle: 'bg-primary text-primary-foreground',
      sub: 'Verification takes less than 5 minutes',
      action: handleVerify,
    },
    pending: {
      icon: Clock,
      iconClass: 'text-warning',
      bgClass: 'bg-warning/10',
      borderClass: 'border-warning/20',
      title: 'Verification under review',
      message: 'Your identity documents are being reviewed by our compliance team. Withdrawals will be enabled as soon as verification is complete — usually within 24 hours.',
      cta: 'View KYC Status',
      ctaStyle: 'bg-warning text-warning-foreground',
      sub: 'Review typically takes 24–48 hours',
      action: handleVerify,
    },
    rejected: {
      icon: ShieldOff,
      iconClass: 'text-destructive',
      bgClass: 'bg-destructive/10',
      borderClass: 'border-destructive/20',
      title: 'Verification rejected',
      message: 'Your identity verification was not approved. Please resubmit with clearer documents to enable withdrawals.',
      cta: 'Resubmit Verification',
      ctaStyle: 'bg-destructive text-destructive-foreground',
      sub: 'Check the rejection reason on the KYC page',
      action: handleVerify,
    },
  }[status] ?? {
    icon: Shield,
    iconClass: 'text-warning',
    bgClass: 'bg-warning/10',
    borderClass: 'border-warning/20',
    title: 'Verification required',
    message: 'Complete identity verification to enable withdrawals.',
    cta: 'Verify Now',
    ctaStyle: 'bg-primary text-primary-foreground',
    sub: '',
    action: handleVerify,
  };

  const Icon = config.icon;

  return (
    <div className={`border rounded-2xl p-6 ${config.bgClass} ${config.borderClass}`}>
      <div className="flex flex-col items-center text-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center
          justify-center ${config.bgClass}`}>
          <Icon className={`w-8 h-8 ${config.iconClass}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-2">
            {config.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {config.message}
          </p>
        </div>
        <button
          onClick={config.action}
          className={`w-full rounded-xl py-3 font-semibold
            hover:opacity-90 transition-opacity flex items-center
            justify-center gap-2 ${config.ctaStyle}`}>
          {config.cta}
          <ChevronRight className="w-4 h-4" />
        </button>
        {config.sub && (
          <p className="text-xs text-muted-foreground">{config.sub}</p>
        )}
      </div>
    </div>
  );
}
