import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminGuard from '../../components/AdminGuard';
import { supabase } from '../../lib/supabase';
import { Gift, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats]         = useState<any>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: r }, { data: s }] = await Promise.all([
          supabase
            .from('referrals')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50),
          supabase
            .from('referral_settings')
            .select('total_referrals, qualified_referrals, total_earned'),
        ]);

        setReferrals(r ?? []);

        // Aggregate stats
        if (s) {
          const agg = s.reduce((acc: any, row: any) => ({
            total: acc.total + (row.total_referrals ?? 0),
            qualified: acc.qualified + (row.qualified_referrals ?? 0),
            earned: acc.earned + parseFloat(row.total_earned ?? 0),
          }), { total: 0, qualified: 0, earned: 0 });
          setStats(agg);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const STATUS_STYLE: Record<string, string> = {
    pending:   'bg-secondary text-muted-foreground',
    signed_up: 'bg-warning/10 text-warning',
    qualified: 'bg-primary/10 text-primary',
    rewarded:  'bg-success/10 text-success',
  };

  return (
    <AdminGuard requiredRole={['super_admin', 'admin', 'finance']}>
      <AdminLayout
        title="Referral Program"
        subtitle="Overview of the referral system">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users,      label: 'Total Referrals',    value: stats?.total ?? 0,           color: 'text-primary bg-primary/10' },
            { icon: TrendingUp, label: 'Qualified',          value: stats?.qualified ?? 0,       color: 'text-success bg-success/10' },
            { icon: DollarSign, label: 'Total Rewards Paid', value: `$${(stats?.earned ?? 0).toFixed(2)}`, color: 'text-warning bg-warning/10' },
            { icon: Gift,       label: 'Conversion Rate',    value: stats?.total > 0 ? `${((stats.qualified / stats.total) * 100).toFixed(0)}%` : '0%', color: 'text-purple-500 bg-purple-500/10' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label}
              className="bg-card border border-border rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center
                justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Referrals table */}
        <div className="bg-card border border-border rounded-2xl
          overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  {['Code', 'Referred Email', 'Status', 'Reward', 'Credited', 'Date'].map(h => (
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
                  Array.from({ length: 6 }, (_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }, (_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="skeleton h-4 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : referrals.length === 0 ? (
                  <tr>
                    <td colSpan={6}
                      className="px-4 py-10 text-center text-muted-foreground">
                      No referrals yet
                    </td>
                  </tr>
                ) : referrals.map(ref => (
                  <tr key={ref.id}
                    className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold
                      text-foreground">
                      {ref.code}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {ref.referred_email
                        ? ref.referred_email.replace(
                            /(.{2})(.*)(@.*)/, '$1***$3'
                          )
                        : '—'
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full
                        font-medium ${STATUS_STYLE[ref.status] ??
                          'bg-secondary text-muted-foreground'}`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      ${parseFloat(ref.reward_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${
                        ref.reward_credited
                          ? 'text-success'
                          : 'text-muted-foreground'
                      }`}>
                        {ref.reward_credited ? '✓ Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs
                      whitespace-nowrap">
                      {new Date(ref.created_at).toLocaleDateString()}
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
