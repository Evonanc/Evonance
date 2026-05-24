import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminGuard from '../../components/AdminGuard';
import { getAuditLog } from '../../lib/admin';
import { RefreshCw } from 'lucide-react';

export default function AdminAudit() {
  const [logs, setLogs]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await getAuditLog(100);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ACTION_STYLE: Record<string, string> = {
    view_user:    'bg-primary/10 text-primary',
    kyc_approved: 'bg-success/10 text-success',
    kyc_rejected: 'bg-destructive/10 text-destructive',
    view_kyc:     'bg-warning/10 text-warning',
  };

  return (
    <AdminGuard requiredRole={['super_admin', 'admin']}>
      <AdminLayout
        title="Audit Log"
        subtitle="All admin actions are logged here">

        <div className="flex justify-end mb-4">
          <button
            onClick={() => { setRefreshing(true); load(); }}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-muted-foreground
              hover:text-foreground border border-border rounded-xl px-4
              py-2 bg-background hover:bg-secondary transition-colors">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl
          overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  {['Action', 'Resource', 'Resource ID', 'Admin', 'Time'].map(h => (
                    <th key={h}
                      className="text-left px-4 py-3 text-xs font-semibold
                        text-muted-foreground uppercase tracking-wider
                        whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 8 }, (_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }, (_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="skeleton h-4 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5}
                      className="px-4 py-10 text-center
                        text-muted-foreground text-sm">
                      No audit log entries yet
                    </td>
                  </tr>
                ) : logs.map(log => (
                  <tr key={log.id}
                    className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5
                        rounded-full ${ACTION_STYLE[log.action] ??
                          'bg-secondary text-muted-foreground'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground
                      capitalize text-xs">
                      {log.resource_type || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground
                      font-mono text-xs">
                      {log.resource_id
                        ? log.resource_id.slice(0, 8) + '...'
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground
                      font-mono text-xs">
                      {log.admin_id
                        ? log.admin_id.slice(0, 8) + '...'
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground
                      text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </AdminLayout>
    </AdminGuard>
  );
}
