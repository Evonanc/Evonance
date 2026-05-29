import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminGuard from '../../components/AdminGuard';
import { getDepositRequests, approveDeposit, rejectDeposit } from '../../lib/admin';
import { useAuth } from '../../hooks/useAuth';
import { Filter, CheckCircle2, ShieldAlert, Search, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['all', 'pending', 'confirmed', 'rejected'];

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const KYC_STATUS_STYLE: Record<string, string> = {
  verified: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  rejected: 'bg-destructive/10 text-destructive',
  unverified: 'bg-secondary text-muted-foreground',
};

export default function AdminDeposits() {
  const { user: currentAdmin } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals / Action States
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDepositRequests(statusFilter);
      setRequests(data);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to load deposit requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Tx Hash copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApprove = async () => {
    if (!actioningId || !currentAdmin) return;
    setSubmitting(true);
    try {
      await approveDeposit(actioningId, currentAdmin.id);
      toast.success('Deposit approved and credited successfully');
      setActioningId(null);
      setActionType(null);
      load();
    } catch (err: any) {
      toast.error(err.message ?? 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!actioningId || !currentAdmin) return;
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    setSubmitting(true);
    try {
      await rejectDeposit(actioningId, currentAdmin.id, rejectReason);
      toast.success('Deposit rejected successfully');
      setActioningId(null);
      setActionType(null);
      setRejectReason('');
      load();
    } catch (err: any) {
      toast.error(err.message ?? 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (!search.trim()) return true;
    const email = r.profiles?.email?.toLowerCase() ?? '';
    const name = r.profiles?.full_name?.toLowerCase() ?? '';
    const txHash = r.tx_hash?.toLowerCase() ?? '';
    const query = search.toLowerCase();
    return email.includes(query) || name.includes(query) || txHash.includes(query);
  });

  return (
    <AdminGuard requiredRole={['super_admin', 'admin', 'finance', 'compliance']}>
      <AdminLayout
        title="Deposit Requests"
        subtitle="Review and credit client cryptocurrency deposits"
      >
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-1">Status:</span>
            <div className="flex gap-1 flex-wrap">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold
                    capitalize transition-all border cursor-pointer ${
                      statusFilter === s
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                        : 'bg-card border-border text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search email, name or tx hash..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-input-background border border-input rounded-xl
                pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none
                focus:border-primary transition-all font-semibold"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  {['User Info', 'KYC Status', 'USDT Amount', 'Network', 'Platform Address', 'Tx Hash', 'Date', 'Status', 'Actions'].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 py-4 text-xs font-bold
                        text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }, (_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="skeleton h-5 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-12 text-center text-muted-foreground text-sm font-medium"
                    >
                      No deposit requests found matching your query
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(r => {
                    const isPending = r.status === 'pending';
                    const txExplorerUrl = r.tx_hash
                      ? r.network.includes('TRON')
                        ? `https://tronscan.org/#/transaction/${r.tx_hash}`
                        : r.network.includes('BSC')
                        ? `https://bscscan.com/tx/${r.tx_hash}`
                        : `https://etherscan.io/tx/${r.tx_hash}`
                      : null;

                    return (
                      <tr key={r.id} className="hover:bg-secondary/25 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-foreground">
                              {r.profiles?.full_name ?? 'Anonymous User'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {r.profiles?.email ?? 'No email'}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            KYC_STATUS_STYLE[r.profiles?.kyc_status ?? 'unverified']
                          }`}>
                            {r.profiles?.kyc_status ?? 'unverified'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-success font-mono text-sm">
                          +${parseFloat(String(r.amount)).toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-foreground">
                          {r.network}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono text-muted-foreground" title={r.address}>
                            {r.address.slice(0, 6)}...{r.address.slice(-6)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {r.tx_hash ? (
                            <div className="flex items-center gap-1.5 max-w-[150px]">
                              <span className="text-xs font-mono text-muted-foreground truncate" title={r.tx_hash}>
                                {r.tx_hash.slice(0, 6)}...{r.tx_hash.slice(-6)}
                              </span>
                              <button
                                onClick={() => handleCopy(r.tx_hash!, r.id)}
                                className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary transition-colors cursor-pointer"
                              >
                                {copiedId === r.id ? (
                                  <Check className="w-3.5 h-3.5 text-success" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              {txExplorerUrl && (
                                <a
                                  href={txExplorerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary-foreground p-1 rounded hover:bg-secondary transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic font-medium">None provided</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(r.created_at).toLocaleDateString()} {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                            STATUS_STYLE[r.status] ?? 'bg-secondary text-muted-foreground border-border'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {isPending ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setActioningId(r.id);
                                  setActionType('approve');
                                }}
                                className="px-2.5 py-1 text-xs font-bold bg-success hover:bg-success/90
                                  text-success-foreground rounded-lg transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setActioningId(r.id);
                                  setActionType('reject');
                                }}
                                className="px-2.5 py-1 text-xs font-bold bg-destructive hover:bg-destructive/90
                                  text-destructive-foreground rounded-lg transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground font-semibold">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Modals */}
        {actioningId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                {actionType === 'approve' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    Approve & Credit Deposit
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-destructive" />
                    Reject Deposit
                  </>
                )}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {actionType === 'approve'
                  ? 'Confirming this deposit credits the client wallet balance and registers it as a completed transaction.'
                  : 'Rejecting this deposit flags the request. You must specify a reason to inform the client.'}
              </p>

              {actionType === 'approve' ? (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setActioningId(null);
                      setActionType(null);
                    }}
                    className="flex-1 bg-secondary text-foreground hover:bg-secondary/90 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={submitting}
                    className="flex-1 bg-success text-success-foreground hover:bg-success/90 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Crediting...' : 'Confirm & Credit'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                      Rejection Reason (Required)
                    </label>
                    <textarea
                      placeholder="e.g. Invalid tx hash / funds not received..."
                      rows={3}
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="w-full bg-input-background border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold resize-none"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setActioningId(null);
                        setActionType(null);
                      }}
                      className="flex-1 bg-secondary text-foreground hover:bg-secondary/90 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={submitting || !rejectReason.trim()}
                      className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
