import type { DataSource } from '../hooks/useCryptoData';

interface Props {
  loading?: boolean;
  wsConnected?: boolean;
  source?: DataSource;
}

export default function LiveIndicator({ loading, wsConnected, source }: Props) {
  if (loading) return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
      <span className="text-xs font-medium text-warning">Loading...</span>
    </div>
  );

  if (source === 'fallback') return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="h-2 w-2 rounded-full bg-destructive" />
      <span className="text-xs font-medium text-destructive">Offline</span>
    </div>
  );

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
      </span>
      <span className="text-xs font-medium text-success">
        {wsConnected ? 'Bybit Live' : 'Live'}
      </span>
    </div>
  );
}
