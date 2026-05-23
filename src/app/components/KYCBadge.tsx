import { Shield, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { KYC_LIMITS } from '../lib/db';

interface Props {
  level: number;
  status: string;
  size?: 'sm' | 'md';
}

export default function KYCBadge({
  level, status, size = 'sm'
}: Props) {
  const limits = KYC_LIMITS[level] ?? KYC_LIMITS[0];

  const icon = status === 'verified'
    ? ShieldCheck
    : status === 'pending'
      ? Clock
      : status === 'rejected'
        ? ShieldAlert
        : Shield;

  const Icon = icon;

  const config = {
    verified: 'bg-success/10 text-success border-success/20',
    pending:  'bg-warning/10 text-warning border-warning/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    unverified: 'bg-secondary text-muted-foreground border-border',
  }[status] ?? 'bg-secondary text-muted-foreground border-border';

  const label = status === 'pending'
    ? 'Under Review'
    : status === 'rejected'
      ? 'Rejected'
      : limits.label;

  return (
    <div className={`inline-flex items-center gap-1.5 border rounded-full
      ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
      font-medium ${config}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {label}
    </div>
  );
}
