import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminGuard from '../../components/AdminGuard';
import { getPendingCards, activateCard, rejectCardRequest } from '../../lib/admin';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Filter, Clock, CheckCircle2, XCircle, Search, ShieldAlert, CreditCard, Shield } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['all', 'pending', 'active', 'frozen', 'cancelled'];

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  active: 'bg-success/10 text-success border-success/20',
  frozen: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  cancelled: 'bg-secondary text-muted-foreground border-border',
};

const KYC_STATUS_STYLE: Record<string, string> = {
  verified: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  rejected: 'bg-destructive/10 text-destructive',
  unverified: 'bg-secondary text-muted-foreground',
};

export default function AdminCards() {
  const { user: currentAdmin } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');

  // Modals / Action States
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('cards')
        .select(`
          *,
          profiles:user_id (email, full_name, kyc_status)
        `);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      query = query.order('requested_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setCards(data ?? []);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (cardId: string) => {
    if (!currentAdmin) return;
    setSubmitting(true);
    try {
      await activateCard(cardId, currentAdmin.id);
      toast.success('Card activated successfully!');
      load();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to activate card');
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
      await rejectCardRequest(actioningId, currentAdmin.id, rejectReason);
      toast.success('Card request rejected and $1 fee refunded successfully!');
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

  const filteredCards = cards.filter(c => {
    if (!search.trim()) return true;
    const email = c.profiles?.email?.toLowerCase() ?? '';
    const name = c.profiles?.full_name?.toLowerCase() ?? '';
    const cardName = c.name?.toLowerCase() ?? '';
    const query = search.toLowerCase();
    return email.includes(query) || name.includes(query) || cardName.includes(query);
  });

  return (
    <AdminGuard requiredRole={['super_admin', 'admin', 'finance', 'compliance']}>
      <AdminLayout
        title="Virtual Cards Queue"
        subtitle="Approve or decline client virtual debit card requests"
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
              placeholder="Search user, name or label..."
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
                  {['User Info', 'KYC Status', 'Card Details', 'Issuance Fee', 'Date Requested', 'Status', 'Actions'].map(h => (
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
                      {Array.from({ length: 7 }, (_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="skeleton h-5 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredCards.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-muted-foreground text-sm font-medium"
                    >
                      No card requests found in this queue
                    </td>
                  </tr>
                ) : (
                  filteredCards.map(c => {
                    const isPending = c.status === 'pending';
                    return (
                      <tr key={c.id} className="hover:bg-secondary/25 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-foreground">
                              {c.profiles?.full_name ?? 'Anonymous User'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {c.profiles?.email ?? 'No email'}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            KYC_STATUS_STYLE[c.profiles?.kyc_status ?? 'unverified']
                          }`}>
                            {c.profiles?.kyc_status ?? 'unverified'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-primary" />
                              {c.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                              •••• {c.last4}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-foreground font-mono text-sm">
                          ${parseFloat(String(c.issuance_fee ?? 1)).toFixed(2)} USDT
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {c.requested_at ? (
                            <>{new Date(c.requested_at).toLocaleDateString()} {new Date(c.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border uppercase ${
                            STATUS_STYLE[c.status] ?? 'bg-secondary text-muted-foreground border-border'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {isPending ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove(c.id)}
                                disabled={submitting}
                                className="px-2.5 py-1 text-xs font-bold bg-success hover:bg-success/90
                                  text-success-foreground rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setActioningId(c.id);
                                  setActionType('reject');
                                }}
                                disabled={submitting}
                                className="px-2.5 py-1 text-xs font-bold bg-destructive hover:bg-destructive/90
                                  text-destructive-foreground rounded-lg transition-colors cursor-pointer disabled:opacity-50"
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

        {/* Rejection Modal */}
        {actioningId && actionType === 'reject' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                Reject Card Request
              </h3>
              <p className="text-sm text-muted-foreground mb-4 font-semibold">
                Rejecting this request will mark the card as cancelled and automatically refund the $1.00 USDT issuance fee back into the user wallet.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                    Rejection Reason (Required)
                  </label>
                  <textarea
                    placeholder="Please state the reason for rejecting this card..."
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
                      setRejectReason('');
                    }}
                    className="flex-1 bg-secondary text-foreground hover:bg-secondary/90 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={submitting || !rejectReason.trim()}
                    className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-sm"
                  >
                    {submitting ? 'Rejecting...' : 'Confirm Reject & Refund'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
