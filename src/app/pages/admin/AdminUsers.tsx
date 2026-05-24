import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminGuard from '../../components/AdminGuard';
import {
  getAdminUsers, getUserDetail,
  logAdminAction, AdminUser,
} from '../../lib/admin';
import {
  Search, X, ChevronLeft, ChevronRight,
  ShieldCheck, Eye, Wallet, ArrowLeftRight, Mail,
} from 'lucide-react';

const KYC_STATUS_STYLE: Record<string, string> = {
  verified:   'bg-success/10 text-success',
  pending:    'bg-warning/10 text-warning',
  rejected:   'bg-destructive/10 text-destructive',
  unverified: 'bg-secondary text-muted-foreground',
};

export default function AdminUsers() {
  const [users, setUsers]         = useState<AdminUser[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { users: u, count } = await getAdminUsers(
        page, LIMIT, search
      );
      setUsers(u);
      setTotal(count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleViewUser = async (user: AdminUser) => {
    setDetailLoading(true);
    try {
      const detail = await getUserDetail(user.id);
      setSelected({ ...user, ...detail });
      await logAdminAction(
        'view_user', 'user', user.id,
        { email: user.email }
      );
    } catch (err) {
      console.error('Error fetching user detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminGuard>
      <AdminLayout
        title="User Management"
        subtitle={`${total.toLocaleString()} total users`}>

        {/* Search bar */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2
              w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by email or name..."
              className="w-full bg-input-background border border-input
                rounded-xl pl-10 pr-4 py-2.5 text-foreground text-sm
                placeholder:text-muted-foreground focus:outline-none
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2
                  text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={load}
            className="border border-border bg-background rounded-xl
              px-4 py-2.5 text-sm font-medium text-foreground
              hover:bg-secondary transition-colors">
            Refresh
          </button>
        </div>

        {/* Users table */}
        <div className="bg-card border border-border rounded-2xl
          overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  {['User', 'Email', 'KYC', 'Joined', 'Actions'].map(h => (
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
                          <div className="skeleton h-4 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5}
                      className="px-4 py-10 text-center text-muted-foreground
                        text-sm">
                      No users found
                    </td>
                  </tr>
                ) : users.map(user => (
                  <tr key={user.id}
                    className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary
                          flex items-center justify-center text-white
                          text-xs font-bold flex-shrink-0">
                          {(user.full_name?.[0] ??
                            user.email?.[0] ?? 'U').toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground
                          truncate max-w-[120px]">
                          {user.full_name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground
                      font-mono text-xs truncate max-w-[180px]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full
                        font-medium ${KYC_STATUS_STYLE[
                          user.kyc_status ?? 'unverified'
                        ]}`}>
                        {user.kyc_status ?? 'unverified'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground
                      text-xs whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewUser(user)}
                        disabled={detailLoading}
                        className="flex items-center gap-1.5 text-xs
                          text-primary hover:underline font-medium disabled:opacity-50">
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
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
              <span className="text-sm text-foreground font-medium
                px-2">
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

        {/* User detail drawer */}
        {selected && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="flex-1 bg-black/50"
              onClick={() => setSelected(null)}
            />
            <div className="w-full max-w-md bg-card border-l
              border-border overflow-y-auto">
              <div className="sticky top-0 bg-card border-b border-border
                px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-foreground">User Detail</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Profile */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary
                      flex items-center justify-center text-white
                      text-2xl font-bold">
                      {(selected.full_name?.[0] ??
                        selected.email?.[0] ?? 'U').toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-lg">
                        {selected.full_name || 'Unknown'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selected.email}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full
                        font-medium mt-1 inline-block
                        ${KYC_STATUS_STYLE[selected.kyc_status ?? 'unverified']}`}>
                        {selected.kyc_status ?? 'unverified'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'User ID', value: selected.id.slice(0,8) + '...' },
                      { label: 'Joined', value: new Date(selected.created_at).toLocaleDateString() },
                      { label: 'KYC Level', value: `Level ${selected.kyc?.level ?? 0}` },
                      { label: 'Phone', value: selected.profile?.phone || '—' },
                    ].map(({ label, value }) => (
                      <div key={label}
                        className="bg-secondary rounded-xl p-3">
                        <p className="text-xs text-muted-foreground">
                          {label}
                        </p>
                        <p className="text-sm font-medium text-foreground
                          mt-0.5 break-all">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wallets */}
                {selected.wallets?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-foreground
                      mb-3 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      Wallets
                    </h5>
                    <div className="space-y-2">
                      {selected.wallets.map((w: any) => (
                        <div key={w.id}
                          className="flex items-center justify-between
                            bg-secondary rounded-xl px-4 py-2.5">
                          <span className="text-sm font-medium
                            text-foreground">
                            {w.symbol}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {parseFloat(w.balance).toFixed(6)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent transactions */}
                {selected.transactions?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-foreground
                      mb-3 flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4
                        text-muted-foreground" />
                      Recent Transactions
                    </h5>
                    <div className="space-y-2">
                      {selected.transactions.slice(0,5).map((tx: any) => (
                        <div key={tx.id}
                          className="flex items-center justify-between
                            bg-secondary rounded-xl px-4 py-2.5">
                          <div>
                            <p className="text-xs font-semibold text-foreground
                              uppercase">
                              {tx.type} {tx.symbol}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            ${parseFloat(tx.total_usd).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* KYC info */}
                {selected.kyc && (
                  <div>
                    <h5 className="text-sm font-semibold text-foreground
                      mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4
                        text-muted-foreground" />
                      KYC Information
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {[
                        { label: 'Full Name', value: selected.kyc.full_name || '—' },
                        { label: 'Nationality', value: selected.kyc.nationality || '—' },
                        { label: 'DOB', value: selected.kyc.date_of_birth || '—' },
                        { label: 'Document', value: selected.kyc.document_type || '—' },
                        { label: 'Doc Number', value: selected.kyc.document_number || '—' },
                        { label: 'Submitted', value: selected.kyc.submitted_at
                          ? new Date(selected.kyc.submitted_at).toLocaleDateString()
                          : '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-secondary rounded-lg p-2.5">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex-1 flex items-center justify-center gap-2
                      border border-border bg-background text-foreground
                      rounded-xl py-2.5 text-sm font-medium hover:bg-secondary
                      transition-colors">
                    <Mail className="w-4 h-4" />
                    Email User
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </AdminLayout>
    </AdminGuard>
  );
}
