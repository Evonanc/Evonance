import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminGuard from '../../components/AdminGuard';
import {
  getKYCReviews, updateKYCStatus,
  logAdminAction, KYCReview,
} from '../../lib/admin';
import { toast } from 'sonner';
import {
  Filter, Eye, CheckCircle, XCircle,
  User, FileText, Globe, Calendar,
} from 'lucide-react';

const STATUS_TABS = ['all', 'pending', 'verified', 'rejected', 'unverified'];

const STATUS_STYLE: Record<string, string> = {
  pending:    'bg-warning/10 text-warning border-warning/20',
  verified:   'bg-success/10 text-success border-success/20',
  rejected:   'bg-destructive/10 text-destructive border-destructive/20',
  unverified: 'bg-secondary text-muted-foreground border-border',
};

export default function AdminKYC() {
  const [reviews, setReviews]   = useState<KYCReview[]>([]);
  const [filter, setFilter]     = useState('pending');
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<KYCReview | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getKYCReviews(
        filter === 'all' ? undefined : filter
      );
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleApprove = async (review: KYCReview) => {
    setProcessing(true);
    try {
      await updateKYCStatus(review.user_id, 'verified', 2);
      await logAdminAction(
        'kyc_approved', 'kyc', review.id,
        { user_id: review.user_id, full_name: review.full_name }
      );
      toast.success(`KYC approved for ${review.full_name}`);
      setSelected(null);
      load();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to approve KYC');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (review: KYCReview) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setProcessing(true);
    try {
      await updateKYCStatus(
        review.user_id, 'rejected', 0, rejectionReason
      );
      await logAdminAction(
        'kyc_rejected', 'kyc', review.id,
        { user_id: review.user_id, reason: rejectionReason }
      );
      toast.success('KYC rejected — user has been notified');
      setSelected(null);
      setRejectionReason('');
      load();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to reject KYC');
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  return (
    <AdminGuard requiredRole={['super_admin', 'admin', 'compliance']}>
      <AdminLayout
        title="KYC Review"
        subtitle={filter === 'pending'
          ? `${pendingCount} applications awaiting review`
          : `Showing ${filter} applications`
        }>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium
                whitespace-nowrap transition-all flex-shrink-0
                capitalize ${filter === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* KYC list */}
        <div className="bg-card border border-border rounded-2xl
          overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  {['Name', 'Document', 'Nationality', 'Submitted', 'Status', 'Actions'].map(h => (
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
                  Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }, (_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="skeleton h-4 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={6}
                      className="px-4 py-10 text-center text-muted-foreground">
                      No {filter !== 'all' ? filter : ''} applications
                    </td>
                  </tr>
                ) : reviews.map(review => (
                  <tr key={review.id}
                    className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10
                          flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground
                          max-w-[140px] truncate">
                          {review.full_name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground
                      capitalize">
                      {review.document_type?.replace('_', ' ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {review.nationality || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground
                      text-xs whitespace-nowrap">
                      {review.submitted_at
                        ? new Date(review.submitted_at).toLocaleDateString()
                        : '—'
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full
                        font-medium border ${STATUS_STYLE[review.status]}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(review)}
                          className="flex items-center gap-1 text-xs
                            text-primary hover:underline font-medium">
                          <Eye className="w-3.5 h-3.5" />
                          Review
                        </button>
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(review)}
                              disabled={processing}
                              className="flex items-center gap-1 text-xs
                                text-success hover:underline font-medium
                                disabled:opacity-50">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review panel */}
        {selected && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="flex-1 bg-black/50"
              onClick={() => { setSelected(null); setRejectionReason(''); }}
            />
            <div className="w-full max-w-lg bg-card border-l border-border
              overflow-y-auto">
              <div className="sticky top-0 bg-card border-b border-border
                px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-foreground">KYC Review</h3>
                <button
                  onClick={() => { setSelected(null); setRejectionReason(''); }}
                  className="text-muted-foreground hover:text-foreground">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Status badge */}
                <span className={`inline-flex text-sm px-3 py-1.5
                  rounded-full font-medium border ${STATUS_STYLE[selected.status]}`}>
                  {selected.status.toUpperCase()}
                </span>

                {/* Applicant details */}
                <div className="bg-secondary rounded-xl p-4 space-y-3">
                  {[
                    { icon: User,     label: 'Full Name',    value: selected.full_name || '—' },
                    { icon: Calendar, label: 'Date of Birth', value: selected.date_of_birth || '—' },
                    { icon: Globe,    label: 'Nationality',  value: selected.nationality || '—' },
                    { icon: FileText, label: 'Document Type', value: selected.document_type?.replace('_',' ') || '—' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className="text-sm font-medium text-foreground capitalize">
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submission date */}
                {selected.submitted_at && (
                  <p className="text-xs text-muted-foreground">
                    Submitted{' '}
                    {new Date(selected.submitted_at).toLocaleString()}
                  </p>
                )}

                {/* Note: document images would show here in production */}
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <FileText className="w-8 h-8 text-muted-foreground
                    mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Document images are stored in private Supabase storage.
                    In production, add a signed URL viewer here.
                  </p>
                </div>

                {/* Actions */}
                {selected.status === 'pending' && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div>
                      <label className="text-sm font-medium text-foreground
                        block mb-1.5">
                        Rejection reason
                        <span className="text-muted-foreground font-normal ml-1">
                          (required to reject)
                        </span>
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="e.g. Document photo is blurry and text is not readable"
                        rows={3}
                        className="w-full bg-input-background border border-input
                          rounded-xl px-4 py-2.5 text-foreground text-sm
                          placeholder:text-muted-foreground focus:outline-none
                          focus:border-primary focus:ring-2 focus:ring-primary/20
                          transition-all resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleReject(selected)}
                        disabled={processing || !rejectionReason.trim()}
                        className="flex items-center justify-center gap-2
                          bg-destructive text-destructive-foreground
                          rounded-xl py-3 font-semibold hover:opacity-90
                          transition-opacity disabled:opacity-50
                          disabled:cursor-not-allowed">
                        <XCircle className="w-4 h-4" />
                        {processing ? 'Rejecting...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleApprove(selected)}
                        disabled={processing}
                        className="flex items-center justify-center gap-2
                          bg-success text-success-foreground rounded-xl
                          py-3 font-semibold hover:opacity-90 transition-opacity
                          disabled:opacity-50 disabled:cursor-not-allowed">
                        <CheckCircle className="w-4 h-4" />
                        {processing ? 'Approving...' : 'Approve'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </AdminLayout>
    </AdminGuard>
  );
}
