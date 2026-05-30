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

  if (error) {
    console.error('[AdminGuard] admin_roles query error:', error.code, error.message, '| user_id:', user.id);
    return null;
  }
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

// ── Admin Withdrawal Requests ─────────────────────────────────────

export async function getWithdrawalRequests(
  status?: string
): Promise<any[]> {
  let query = supabase
    .from('withdrawal_requests')
    .select(`
      *,
      profiles!withdrawal_requests_user_id_fkey(
        email, full_name, kyc_status, kyc_level
      )
    `)
    .order('created_at', { ascending: false });
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function approveWithdrawal(
  withdrawalId: string,
  adminId: string,
  txHash?: string
): Promise<void> {
  const { data: wr } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('id', withdrawalId)
    .single();
  if (!wr) throw new Error('Withdrawal not found');

  await supabase
    .from('withdrawal_requests')
    .update({
      status: 'completed',
      admin_id: adminId,
      reviewed_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      tx_hash: txHash ?? null,
    })
    .eq('id', withdrawalId);

  // Update transaction status
  await supabase
    .from('transactions')
    .update({ status: 'completed' })
    .eq('user_id', wr.user_id)
    .eq('type', 'withdraw')
    .eq('status', 'pending')
    .gte('created_at', wr.created_at);

  // Notify user
  const { createNotification } = await import('./db');
  await createNotification(
    wr.user_id, 'withdrawal',
    'Withdrawal completed',
    `Your withdrawal of $${wr.amount.toFixed(2)} USDT has been processed successfully.`,
    '/dashboard'
  );

  await logAdminAction(
    'withdrawal_approved', 'withdrawal', withdrawalId,
    { amount: wr.amount, address: wr.address }
  );
}

export async function rejectWithdrawal(
  withdrawalId: string,
  adminId: string,
  reason: string
): Promise<void> {
  const { data: wr } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('id', withdrawalId)
    .single();
  if (!wr) throw new Error('Withdrawal not found');

  // Refund the user
  const { getWallet, upsertWallet, createNotification } =
    await import('./db');
  const wallet = await getWallet(wr.user_id, 'USDT');
  await upsertWallet(
    wr.user_id, 'USDT', 'Tether',
    (wallet?.balance ?? 0) + wr.amount + wr.fee, 1
  );

  await supabase
    .from('withdrawal_requests')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      admin_id: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', withdrawalId);

  await supabase
    .from('transactions')
    .update({ status: 'failed' })
    .eq('user_id', wr.user_id)
    .eq('type', 'withdraw')
    .eq('status', 'pending')
    .gte('created_at', wr.created_at);

  await createNotification(
    wr.user_id, 'withdrawal',
    'Withdrawal rejected — funds refunded',
    `Your withdrawal of $${wr.amount.toFixed(2)} USDT was rejected: ${reason}. Funds have been returned to your wallet.`,
    '/dashboard'
  );

  await logAdminAction(
    'withdrawal_rejected', 'withdrawal', withdrawalId,
    { amount: wr.amount, reason }
  );
}

// ── Admin Deposit Requests ────────────────────────────────────────

export async function getDepositRequests(
  status?: string
): Promise<any[]> {
  let query = supabase
    .from('deposit_requests')
    .select(`
      *,
      profiles!deposit_requests_user_id_fkey(
        email, full_name, kyc_status
      )
    `)
    .order('created_at', { ascending: false });
  if (status && status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function approveDeposit(
  depositId: string,
  adminId: string
): Promise<void> {
  const { data: dr } = await supabase
    .from('deposit_requests')
    .select('*')
    .eq('id', depositId)
    .single();
  if (!dr) throw new Error('Deposit not found');

  // Credit the wallet
  const { getWallet, upsertWallet,
    addTransaction, createNotification } = await import('./db');
  const wallet = await getWallet(dr.user_id, 'USDT');
  await upsertWallet(
    dr.user_id, 'USDT', 'Tether',
    (wallet?.balance ?? 0) + dr.amount, 1
  );

  // Record transaction
  await addTransaction(dr.user_id, {
    type: 'deposit',
    symbol: 'USDT',
    amount: dr.amount,
    price_usd: 1,
    total_usd: dr.amount,
    fee_usd: 0,
    status: 'completed',
    note: `Deposit confirmed — ${dr.network}`,
  });

  // Update request status
  await supabase
    .from('deposit_requests')
    .update({
      status: 'confirmed',
      admin_id: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', depositId);

  // Notify user
  await createNotification(
    dr.user_id, 'deposit',
    'Deposit confirmed!',
    `Your deposit of $${dr.amount.toFixed(2)} USDT has been confirmed and credited to your wallet.`,
    '/dashboard'
  );

  await logAdminAction(
    'deposit_approved', 'deposit', depositId,
    { amount: dr.amount, network: dr.network }
  );
}

export async function rejectDeposit(
  depositId: string,
  adminId: string,
  reason: string
): Promise<void> {
  const { data: dr } = await supabase
    .from('deposit_requests')
    .select('*')
    .eq('id', depositId)
    .single();
  if (!dr) throw new Error('Deposit not found');

  await supabase
    .from('deposit_requests')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      admin_id: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', depositId);

  const { createNotification } = await import('./db');
  await createNotification(
    dr.user_id, 'deposit',
    'Deposit could not be confirmed',
    `Your deposit of $${dr.amount.toFixed(2)} USDT was not confirmed: ${reason}. Please contact support if you believe this is an error.`,
    '/dashboard'
  );

  await logAdminAction(
    'deposit_rejected', 'deposit', depositId,
    { amount: dr.amount, reason }
  );
}

// ── Virtual Cards Admin Management ────────────────────────────────

export async function getPendingCards(): Promise<any[]> {
  const { data, error } = await supabase
    .from('cards')
    .select(`
      *,
      profiles:user_id (email, full_name, kyc_status)
    `)
    .eq('status', 'pending')
    .order('requested_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function activateCard(
  cardId: string,
  adminId: string
): Promise<void> {
  const { data: card } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single();
  if (!card) throw new Error('Card not found');

  await supabase
    .from('cards')
    .update({
      status: 'active',
      activated_at: new Date().toISOString(),
      activated_by: adminId,
    })
    .eq('id', cardId);

  const { createNotification } = await import('./db');
  await createNotification(
    card.user_id, 'card',
    `Your ${card.name} is ready!`,
    `Your virtual card ending in ${card.last4} has been activated. Fund it from your wallet to start spending.`,
    '/cards'
  );

  await logAdminAction(
    'card_activated', 'card', cardId,
    { user_id: card.user_id, name: card.name }
  );
}

export async function rejectCardRequest(
  cardId: string,
  adminId: string,
  reason: string
): Promise<void> {
  const { data: card } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single();
  if (!card) throw new Error('Card not found');

  // Refund the $1 fee
  const { getWallet, upsertWallet, createNotification } = await import('./db');
  const wallet = await getWallet(card.user_id, 'USDT');
  await upsertWallet(
    card.user_id, 'USDT', 'Tether',
    (wallet?.balance ?? 0) + card.issuance_fee, 1
  );

  await supabase
    .from('cards')
    .update({ status: 'cancelled' })
    .eq('id', cardId);

  await createNotification(
    card.user_id, 'card',
    'Card request rejected — fee refunded',
    `Your card request was rejected: ${reason}. The $${card.issuance_fee} fee has been refunded to your wallet.`,
    '/cards'
  );

  await logAdminAction(
    'card_rejected', 'card', cardId,
    { reason }
  );
}



