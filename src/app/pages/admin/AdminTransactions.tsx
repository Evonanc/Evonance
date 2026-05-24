import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminGuard from '../../components/AdminGuard';
import { getAdminTransactions, AdminTransaction } from '../../lib/admin';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const TX_TYPES = ['all','buy','sell','deposit','withdraw','swap','send','receive'];
const TX_STATUSES = ['all','completed','pending','failed','cancelled'];

const TYPE_STYLE: Record<string, string> = {
  buy:      'bg-success/10 text-success',
  sell:     'bg-destructive/10 text-destructive',
  deposit:  'bg-primary/10 text-primary',
  withdraw: 'bg-warning/10 text-warning',
  swap:     'bg-purple-500/10 text-purple-500',
  send:     'bg-destructive/10 text-destructive',
  receive:  'bg-success/10 text-success',
};

const STATUS_STYLE: Record<string, string> = {
  completed:  'bg-success/10 text-success',
  pending:    'bg-warning/10 text-warning',
  failed:     'bg-destructive/10 text-destructive',
  cancelled:  'bg-secondary text-muted-foreground',
};

export default function AdminTransactions() {
  const [txs, setTxs]         = useState<AdminTransaction[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(0);
  const [typeFilter, setTypeFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { transactions, count } = await getAdminTransactions(
        page, LIMIT,
        { type: typeFilter, status: statusFilter }
      );
      setTxs(transactions);
      setTotal(count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminGuard requiredRole={['super_admin', 'admin', 'finance']}>
      <AdminLayout
        title="Transactions"
        subtitle={`${total.toLocaleString()} total transactions`}>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Type:</span>
            <div className="flex gap-1 flex-wrap">
              {TX_TYPES.map(t => (
                <button key={t}
                  onClick={() => { setTypeFilter(t); setPage(0); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium
                    capitalize transition-all ${typeFilter === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex gap-1 flex-wrap">
              {TX_STATUSES.map(s => (
                <button key={s}
                  onClick={() => { setStatusFilter(s); setPage(0); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium
                    capitalize transition-all ${statusFilter === s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl
          overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  {['Type', 'Asset', 'Amount', 'USD Value', 'Fee', 'Status', 'Note', 'Date'].map(h => (
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
                      {Array.from({ length: 8 }, (_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="skeleton h-4 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : txs.length === 0 ? (
                  <tr>
                    <td colSpan={8}
                      className="px-4 py-10 text-center
                        text-muted-foreground text-sm">
                      No transactions found
                    </td>
                  </tr>
                ) : txs.map(tx => (
                  <tr key={tx.id}
                    className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5
                        rounded-full ${TYPE_STYLE[tx.type] ??
                          'bg-secondary text-muted-foreground'}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {tx.symbol}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground
                      font-mono text-xs">
                      {parseFloat(String(tx.amount)).toFixed(6)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      ${parseFloat(String(tx.total_usd)).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      ${parseFloat(String(tx.fee_usd)).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full
                        font-medium ${STATUS_STYLE[tx.status] ??
                          'bg-secondary text-muted-foreground'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs
                      max-w-[160px] truncate">
                      {tx.note || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs
                      whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {page * LIMIT + 1}–
              {Math.min((page + 1) * LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-border
                  hover:bg-secondary disabled:opacity-40
                  disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-foreground font-medium px-2">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p =>
                  Math.min(totalPages - 1, p + 1)
                )}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-border
                  hover:bg-secondary disabled:opacity-40
                  disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </AdminLayout>
    </AdminGuard>
  );
}
