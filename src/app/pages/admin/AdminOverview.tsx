import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import AdminLayout from '../../components/AdminLayout';
import AdminGuard from '../../components/AdminGuard';
import {
  getPlatformStats, getAdminTransactions,
  PlatformStats,
} from '../../lib/admin';
import {
  Users, ArrowLeftRight, DollarSign,
  ShieldCheck, CreditCard,
  Gift, AlertTriangle, RefreshCw,
  ArrowUpRight, UserPlus, Activity,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { useTheme } from 'next-themes';

function StatCard({
  icon: Icon, label, value, sub, color, href,
}: {
  icon: any; label: string; value: string | number;
  sub?: string; color: string; href?: string;
}) {
  const content = (
    <div className={`bg-card border border-border rounded-2xl p-5
      hover:border-primary/30 transition-all
      ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center
          justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {href && <ArrowUpRight className="w-4 h-4 text-muted-foreground" />}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sub && (
        <p className="text-xs text-success mt-1 font-medium">{sub}</p>
      )}
    </div>
  );

  if (href) return <Link to={href}>{content}</Link>;
  return content;
}

export default function AdminOverview() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [stats, setStats]   = useState<PlatformStats | null>(null);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [s, { transactions }] = await Promise.all([
        getPlatformStats(),
        getAdminTransactions(0, 5),
      ]);
      setStats(s);
      setRecentTxs(transactions);
    } catch (err) {
      console.error('Admin overview error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  // Mock chart data — in production compute from transactions
  const volumeData = [
    { day: 'Mon', volume: 12400, users: 8 },
    { day: 'Tue', volume: 18200, users: 12 },
    { day: 'Wed', volume: 9800,  users: 6 },
    { day: 'Thu', volume: 24600, users: 15 },
    { day: 'Fri', volume: 31200, users: 19 },
    { day: 'Sat', volume: 15700, users: 9 },
    { day: 'Sun', volume: 22100, users: 14 },
  ];

  const TX_TYPE_COLORS: Record<string, string> = {
    buy:      'text-success bg-success/10',
    sell:     'text-destructive bg-destructive/10',
    deposit:  'text-primary bg-primary/10',
    withdraw: 'text-warning bg-warning/10',
    swap:     'text-purple-500 bg-purple-500/10',
    send:     'text-destructive bg-destructive/10',
    receive:  'text-success bg-success/10',
  };

  if (loading) return (
    <AdminGuard>
      <AdminLayout title="Overview">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      </AdminLayout>
    </AdminGuard>
  );

  return (
    <AdminGuard>
      <AdminLayout
        title="Platform Overview"
        subtitle={`Last updated: ${new Date().toLocaleTimeString()}`}>

        {/* Refresh button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-muted-foreground
              hover:text-foreground transition-colors border border-border
              rounded-xl px-4 py-2 bg-background hover:bg-secondary">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="Total Users"
            value={(stats?.total_users ?? 0).toLocaleString()}
            sub={`+${stats?.new_users_today ?? 0} today`}
            color="text-primary bg-primary/10"
            href="/admin/users"
          />
          <StatCard
            icon={DollarSign}
            label="Total Volume"
            value={`$${((stats?.total_volume_usd ?? 0) / 1000).toFixed(1)}k`}
            sub={`$${((stats?.volume_today ?? 0)).toFixed(0)} today`}
            color="text-success bg-success/10"
            href="/admin/transactions"
          />
          <StatCard
            icon={ShieldCheck}
            label="Verified Users"
            value={stats?.verified_users ?? 0}
            sub={`${stats?.pending_kyc ?? 0} pending review`}
            color="text-warning bg-warning/10"
            href="/admin/kyc"
          />
          <StatCard
            icon={ArrowLeftRight}
            label="Total Transactions"
            value={(stats?.total_transactions ?? 0).toLocaleString()}
            color="text-purple-500 bg-purple-500/10"
            href="/admin/transactions"
          />
          <StatCard
            icon={CreditCard}
            label="Virtual Cards"
            value={stats?.total_cards ?? 0}
            color="text-cyan-500 bg-cyan-500/10"
          />
          <StatCard
            icon={Gift}
            label="Active Referrals"
            value={stats?.active_referrals ?? 0}
            color="text-orange-500 bg-orange-500/10"
            href="/admin/referrals"
          />
          <StatCard
            icon={UserPlus}
            label="New This Week"
            value={stats?.new_users_week ?? 0}
            color="text-pink-500 bg-pink-500/10"
          />
          <StatCard
            icon={Activity}
            label="Weekly Volume"
            value={`$${((stats?.volume_week ?? 0) / 1000).toFixed(1)}k`}
            color="text-indigo-500 bg-indigo-500/10"
          />
        </div>

        {/* KYC alert */}
        {(stats?.pending_kyc ?? 0) > 0 && (
          <Link to="/admin/kyc"
            className="flex items-center gap-3 p-4 bg-warning/5
              border border-warning/20 rounded-2xl mb-6
              hover:bg-warning/10 transition-colors">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {stats?.pending_kyc} KYC applications pending review
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click to review and approve or reject
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-warning" />
          </Link>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Volume chart */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4">
              7-Day Volume (USD)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="adminVolGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0066ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0066ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3"
                  stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
                  vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false}
                  tick={{ fontSize: 11,
                    fill: isDark ? '#64748b' : '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false}
                  tick={{ fontSize: 11,
                    fill: isDark ? '#64748b' : '#94a3b8' }}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
                  width={50} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                    borderRadius: '12px', fontSize: 12,
                  }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Volume']}
                />
                <Area type="monotone" dataKey="volume"
                  stroke="#0066ff" strokeWidth={2}
                  fill="url(#adminVolGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* New users chart */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-4">
              7-Day New Users
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeData}
                barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3"
                  stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
                  vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false}
                  tick={{ fontSize: 11,
                    fill: isDark ? '#64748b' : '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false}
                  tick={{ fontSize: 11,
                    fill: isDark ? '#64748b' : '#94a3b8' }}
                  width={30} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                    borderRadius: '12px', fontSize: 12,
                  }}
                  formatter={(v: number) => [v, 'New users']}
                />
                <Bar dataKey="users" fill="#22c55e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">
              Recent Transactions
            </h3>
            <Link to="/admin/transactions"
              className="text-xs text-primary hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentTxs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No transactions yet
              </p>
            ) : recentTxs.map(tx => (
              <div key={tx.id}
                className="flex items-center gap-3 py-2
                  border-b border-border last:border-0">
                <span className={`text-xs font-semibold px-2.5 py-1
                  rounded-full ${TX_TYPE_COLORS[tx.type] ??
                    'bg-secondary text-muted-foreground'}`}>
                  {tx.type.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {tx.note || `${tx.type} ${tx.symbol}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground">
                    ${tx.total_usd.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.symbol}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </AdminLayout>
    </AdminGuard>
  );
}
