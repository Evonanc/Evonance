import { supabase } from './supabase';

export interface AdminRole {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'support' | 'compliance' | 'finance';
  granted_at: string;
  last_active: string;
}

export interface PlatformStats {
  total_users: number;
  verified_users: number;
  pending_kyc: number;
  total_transactions: number;
  total_volume_usd: number;
  total_wallets: number;
  total_cards: number;
  active_referrals: number;
  total_referral_rewards: number;
  new_users_today: number;
  new_users_week: number;
  volume_today: number;
  volume_week: number;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  full_name?: string;
  kyc_status?: string;
  kyc_level?: number;
  wallet_count?: number;
  transaction_count?: number;
  total_volume?: number;
  last_sign_in?: string;
}

export interface AdminTransaction {
  id: string;
  user_id: string;
  user_email?: string;
  type: string;
  symbol: string;
  amount: number;
  total_usd: number;
  fee_usd: number;
  status: string;
  note: string;
  created_at: string;
}

export interface KYCReview {
  id: string;
  user_id: string;
  user_email?: string;
  full_name?: string;
  status: string;
  level: number;
  document_type?: string;
  submitted_at?: string;
  nationality?: string;
  date_of_birth?: string;
}

// ── Auth check ────────────────────────────────────────────────────

export async function getAdminRole(): Promise<AdminRole | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('admin_roles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return null;
  return data;
}

export async function isAdmin(): Promise<boolean> {
  const role = await getAdminRole();
  return !!role;
}

// ── Stats ─────────────────────────────────────────────────────────

export async function getPlatformStats(): Promise<PlatformStats | null> {
  const { data, error } = await supabase.rpc('get_platform_stats');
  if (error) {
    console.error('Stats error:', error);
    return null;
  }
  return data as PlatformStats;
}

// ── Users ─────────────────────────────────────────────────────────

export async function getAdminUsers(
  page = 0,
  limit = 20,
  search = ''
): Promise<{ users: AdminUser[]; count: number }> {
  // Get profiles with KYC data
  let query = supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      created_at,
      kyc_status,
      kyc_level
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (search) {
    query = query.or(
      `email.ilike.%${search}%,full_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    users: (data ?? []) as AdminUser[],
    count: count ?? 0,
  };
}

export async function getUserDetail(userId: string) {
  const [profile, kyc, wallets, transactions] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('kyc').select('*').eq('user_id', userId).single(),
    supabase.from('wallets').select('*').eq('user_id', userId),
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return {
    profile: profile.data,
    kyc: kyc.data,
    wallets: wallets.data ?? [],
    transactions: transactions.data ?? [],
  };
}

// ── Transactions ──────────────────────────────────────────────────

export async function getAdminTransactions(
  page = 0,
  limit = 20,
  filters: {
    type?: string;
    status?: string;
    search?: string;
  } = {}
): Promise<{ transactions: AdminTransaction[]; count: number }> {
  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type);
  }
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    transactions: (data ?? []) as AdminTransaction[],
    count: count ?? 0,
  };
}

// ── KYC ───────────────────────────────────────────────────────────

export async function getKYCReviews(
  status?: string
): Promise<KYCReview[]> {
  let query = supabase
    .from('kyc')
    .select(`
      id, user_id, status, level,
      full_name, document_type, submitted_at,
      nationality, date_of_birth
    `)
    .order('submitted_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as KYCReview[];
}

export async function updateKYCStatus(
  userId: string,
  status: 'verified' | 'rejected',
  level?: number,
  rejectionReason?: string
): Promise<void> {
  const updates: Record<string, any> = {
    status,
    reviewed_at: new Date().toISOString(),
  };
  if (status === 'verified' && level) updates.level = level;
  if (rejectionReason) updates.rejection_reason = rejectionReason;

  await supabase.from('kyc')
    .update(updates)
    .eq('user_id', userId);

  // Also update profile
  await supabase.from('profiles')
    .update({ kyc_status: status, kyc_level: level ?? 0 })
    .eq('id', userId);

  // Notify user
  const { createNotification } = await import('./db');
  await createNotification(
    userId,
    'security',
    status === 'verified'
      ? 'Identity verification approved'
      : 'Identity verification rejected',
    status === 'verified'
      ? 'Your KYC verification has been approved. Your account limits have been upgraded.'
      : `Your KYC verification was rejected: ${rejectionReason ?? 'Please resubmit with clearer documents.'}`
  );

  // Send KYC transactional email
  (async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();
      if (profile?.email) {
        const { sendKYCStatus } = await import('./email');
        await sendKYCStatus(profile.email, {
          firstName: profile.full_name?.split(' ')[0] ?? 'Trader',
          status: status === 'verified' ? 'approved' : 'rejected',
          level,
          rejectionReason,
          dailyLimit: level === 1 ? 5000 : level === 2 ? 25000 : 50000,
        });
      }
    } catch (err) {
      console.warn('[KYC Email] Failed to send email:', err);
    }
  })();
}

// ── Audit log ─────────────────────────────────────────────────────

export async function logAdminAction(
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('admin_audit_log').insert({
    admin_id: user.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
  });
}

export async function getAuditLog(limit = 50) {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
