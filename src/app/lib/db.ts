import { supabase } from './supabase';

export interface Wallet {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  avg_buy_price: number;
  updated_at: string;
}

export interface Transaction {
  id: string;
  type: 'deposit'|'withdraw'|'buy'|'sell'|'swap'|'send'|'receive';
  symbol: string;
  amount: number;
  price_usd: number;
  total_usd: number;
  fee_usd: number;
  status: 'pending'|'completed'|'failed'|'cancelled';
  note: string;
  created_at: string;
}

export interface Card {
  id: string;
  name: string;
  last4: string;
  expiry: string;
  balance: number;
  spending_limit: number;
  status: 'active' | 'frozen' | 'cancelled' | 'pending';
  issuance_fee: number;
  issuance_paid: boolean;
  requested_at: string;
  activated_at?: string;
  card_type: string;
  created_at: string;
}

export interface CardTransaction {
  id: string;
  card_id: string;
  merchant: string;
  category: string;
  amount: number;
  status: string;
  created_at: string;
}

// ── Wallets ───────────────────────────────────────────────────────

export async function getWallets(userId: string): Promise<Wallet[]> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .order('symbol');
  if (error) throw error;
  return data ?? [];
}

export async function upsertWallet(
  userId: string,
  symbol: string,
  name: string,
  balance: number,
  avg_buy_price: number
) {
  const { error } = await supabase
    .from('wallets')
    .upsert(
      { user_id: userId, symbol, name, balance, avg_buy_price,
        updated_at: new Date().toISOString() },
      { onConflict: 'user_id,symbol' }
    );
  if (error) throw error;
}

// Get single wallet by symbol
export async function getWallet(
  userId: string,
  symbol: string
): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('symbol', symbol)
    .single();
  if (error) return null;
  return data;
}

// Deposit — adds USD as USDT to wallet
export async function depositFunds(
  userId: string,
  amountUsd: number
): Promise<void> {
  const existing = await getWallet(userId, 'USDT');
  const newBalance = (existing?.balance ?? 0) + amountUsd;
  await upsertWallet(userId, 'USDT', 'Tether', newBalance, 1);
  await addTransaction(userId, {
    type: 'deposit',
    symbol: 'USDT',
    amount: amountUsd,
    price_usd: 1,
    total_usd: amountUsd,
    fee_usd: 0,
    status: 'completed',
    note: 'Wallet deposit',
  });
}

// Withdraw — deducts USDT from wallet
export async function withdrawFunds(
  userId: string,
  amountUsd: number,
  address: string
): Promise<void> {
  const existing = await getWallet(userId, 'USDT');
  const currentBalance = existing?.balance ?? 0;
  const fee = parseFloat((amountUsd * 0.001).toFixed(2)); // 0.1% fee
  const total = amountUsd + fee;
  if (currentBalance < total) {
    throw new Error(`Insufficient balance. Need $${total.toFixed(2)}, have $${currentBalance.toFixed(2)}`);
  }
  await upsertWallet(userId, 'USDT', 'Tether', currentBalance - total, 1);
  await addTransaction(userId, {
    type: 'withdraw',
    symbol: 'USDT',
    amount: amountUsd,
    price_usd: 1,
    total_usd: amountUsd,
    fee_usd: fee,
    status: 'completed',
    note: `Withdrawal to ${address.slice(0, 8)}...${address.slice(-4)}`,
  });
}

// Send crypto to another wallet address
export async function sendCrypto(
  userId: string,
  symbol: string,
  amount: number,
  toAddress: string,
  currentPrice: number
): Promise<void> {
  const wallet = await getWallet(userId, symbol);
  const fee = parseFloat((amount * 0.001).toFixed(6));
  const total = amount + fee;

  if (!wallet || wallet.balance < total) {
    throw new Error(
      `Insufficient balance. Need ${total.toFixed(6)} ${symbol},` +
      ` have ${(wallet?.balance ?? 0).toFixed(6)}`
    );
  }

  await upsertWallet(
    userId, symbol, wallet.name,
    wallet.balance - total,
    wallet.avg_buy_price
  );

  await addTransaction(userId, {
    type: 'send',
    symbol,
    amount,
    price_usd: currentPrice,
    total_usd: amount * currentPrice,
    fee_usd: fee * currentPrice,
    status: 'completed',
    note: `Sent to ${toAddress.slice(0, 8)}...${toAddress.slice(-4)}`,
  });
}

// Record a received crypto (manual entry)
export async function receiveCrypto(
  userId: string,
  symbol: string,
  name: string,
  amount: number,
  currentPrice: number
): Promise<void> {
  const wallet = await getWallet(userId, symbol);
  const newBalance = (wallet?.balance ?? 0) + amount;

  // Recalculate average buy price
  const oldValue = (wallet?.balance ?? 0) * (wallet?.avg_buy_price ?? currentPrice);
  const newValue = amount * currentPrice;
  const newAvg = newBalance > 0
    ? (oldValue + newValue) / newBalance
    : currentPrice;

  await upsertWallet(userId, symbol, name, newBalance, newAvg);

  await addTransaction(userId, {
    type: 'receive',
    symbol,
    amount,
    price_usd: currentPrice,
    total_usd: amount * currentPrice,
    fee_usd: 0,
    status: 'completed',
    note: `Received ${symbol}`,
  });
}

// Buy crypto using USDT balance
export async function buyCrypto(
  userId: string,
  symbol: string,
  name: string,
  amount: number,       // amount of crypto to buy
  price: number,        // current price per unit
): Promise<void> {
  const totalCost = amount * price;
  const fee = parseFloat((totalCost * 0.001).toFixed(2)); // 0.1% fee
  const totalDeducted = totalCost + fee;

  // Check USDT balance
  const usdtWallet = await getWallet(userId, 'USDT');
  const usdtBalance = usdtWallet?.balance ?? 0;
  if (usdtBalance < totalDeducted) {
    throw new Error(
      `Insufficient USDT. Need $${totalDeducted.toFixed(2)},` +
      ` have $${usdtBalance.toFixed(2)}`
    );
  }

  // Deduct USDT
  await upsertWallet(
    userId, 'USDT', 'Tether',
    usdtBalance - totalDeducted, 1
  );

  // Add crypto to wallet
  const cryptoWallet = await getWallet(userId, symbol);
  const existingBalance = cryptoWallet?.balance ?? 0;
  const existingAvg = cryptoWallet?.avg_buy_price ?? price;

  // Calculate new average buy price
  const totalExistingValue = existingBalance * existingAvg;
  const newTotalValue = totalExistingValue + totalCost;
  const newTotalBalance = existingBalance + amount;
  const newAvgPrice = newTotalBalance > 0
    ? newTotalValue / newTotalBalance
    : price;

  await upsertWallet(userId, symbol, name, newTotalBalance, newAvgPrice);

  // Record transaction
  await addTransaction(userId, {
    type: 'buy',
    symbol,
    amount,
    price_usd: price,
    total_usd: totalCost,
    fee_usd: fee,
    status: 'completed',
    note: `Bought ${amount.toFixed(6)} ${symbol} at $${price.toLocaleString()}`,
  });
}

// Sell crypto and receive USDT
export async function sellCrypto(
  userId: string,
  symbol: string,
  name: string,
  amount: number,       // amount of crypto to sell
  price: number,        // current price per unit
): Promise<void> {
  const cryptoWallet = await getWallet(userId, symbol);
  const cryptoBalance = cryptoWallet?.balance ?? 0;

  if (cryptoBalance < amount) {
    throw new Error(
      `Insufficient ${symbol}. Need ${amount.toFixed(6)},` +
      ` have ${cryptoBalance.toFixed(6)}`
    );
  }

  const grossUsd = amount * price;
  const fee = parseFloat((grossUsd * 0.001).toFixed(2)); // 0.1% fee
  const netUsd = grossUsd - fee;

  // Deduct crypto
  const newCryptoBalance = cryptoBalance - amount;
  await upsertWallet(
    userId, symbol, name,
    newCryptoBalance,
    cryptoWallet?.avg_buy_price ?? price
  );

  // Add USDT
  const usdtWallet = await getWallet(userId, 'USDT');
  const usdtBalance = usdtWallet?.balance ?? 0;
  await upsertWallet(
    userId, 'USDT', 'Tether',
    usdtBalance + netUsd, 1
  );

  // Record transaction
  await addTransaction(userId, {
    type: 'sell',
    symbol,
    amount,
    price_usd: price,
    total_usd: grossUsd,
    fee_usd: fee,
    status: 'completed',
    note: `Sold ${amount.toFixed(6)} ${symbol} at $${price.toLocaleString()}`,
  });
}



// ── Transactions ──────────────────────────────────────────────────

export async function getTransactions(
  userId: string,
  limit = 20
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function addTransaction(
  userId: string,
  tx: Omit<Transaction, 'id' | 'created_at'>
) {
  const { error } = await supabase
    .from('transactions')
    .insert({ user_id: userId, ...tx });
  if (error) throw error;
}

// ── Cards ─────────────────────────────────────────────────────────

export async function getCards(userId: string): Promise<Card[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function updateCardStatus(
  cardId: string,
  status: 'active' | 'frozen' | 'cancelled'
) {
  const { error } = await supabase
    .from('cards')
    .update({ status })
    .eq('id', cardId);
  if (error) throw error;
}

export async function updateCardLimit(
  cardId: string,
  limit: number
) {
  const { error } = await supabase
    .from('cards')
    .update({ spending_limit: limit })
    .eq('id', cardId);
  if (error) throw error;
}

export async function updateCardName(
  cardId: string,
  name: string
) {
  const { error } = await supabase
    .from('cards')
    .update({ name })
    .eq('id', cardId);
  if (error) throw error;
}

export async function topUpCard(
  cardId: string,
  userId: string,
  amount: number
) {
  const { data: card } = await supabase
    .from('cards')
    .select('balance')
    .eq('id', cardId)
    .single();

  const { error } = await supabase
    .from('cards')
    .update({ balance: (card?.balance ?? 0) + amount })
    .eq('id', cardId);
  if (error) throw error;

  await supabase.from('card_transactions').insert({
    card_id: cardId,
    user_id: userId,
    merchant: 'Wallet Top-up',
    category: 'deposit',
    amount,
    status: 'completed',
  });
}

export async function getCardTransactions(
  userId: string,
  cardId?: string
): Promise<CardTransaction[]> {
  let query = supabase
    .from('card_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (cardId) query = query.eq('card_id', cardId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ── Watchlist ─────────────────────────────────────────────────────

export async function getWatchlist(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('watchlist')
    .select('symbol')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map(w => w.symbol);
}

export async function toggleWatchlist(userId: string, symbol: string) {
  const { data } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', userId)
    .eq('symbol', symbol)
    .single();

  if (data) {
    await supabase.from('watchlist').delete().eq('id', data.id);
  } else {
    await supabase.from('watchlist').insert({ user_id: userId, symbol });
  }
}

export interface Profile {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `avatars/${userId}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);
  return data.publicUrl;
}

export interface Notification {
  id: string;
  type: 'trade'|'deposit'|'withdrawal'|'send'|'receive'|
        'swap'|'price_alert'|'security'|'system'|'card';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export async function getNotifications(
  userId: string,
  limit = 30
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) return 0;
  return count ?? 0;
}

export async function markAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);
}

export async function markAllAsRead(userId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
}

export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);
}

export async function clearAllNotifications(
  userId: string
): Promise<void> {
  await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);
}

// Create a notification programmatically
// Call this after every trade, deposit, withdrawal etc.
export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  actionUrl?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    action_url: actionUrl,
    metadata,
  });
}

// ── KYC ───────────────────────────────────────────────────────────

export interface KYC {
  id: string;
  user_id: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  level: 0 | 1 | 2 | 3;
  full_name?: string;
  date_of_birth?: string;
  nationality?: string;
  phone?: string;
  phone_verified?: boolean;
  address_line1?: string;
  address_city?: string;
  address_country?: string;
  address_postcode?: string;
  document_type?: 'passport' | 'national_id' | 'drivers_license';
  document_number?: string;
  document_front_url?: string;
  document_back_url?: string;
  selfie_url?: string;
  submitted_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export const KYC_LIMITS: Record<number, {
  daily: number;
  label: string;
  badge: string;
}> = {
  0: { daily: 500,   label: 'Unverified', badge: 'bg-secondary text-muted-foreground' },
  1: { daily: 2000,  label: 'Basic',      badge: 'bg-warning/10 text-warning' },
  2: { daily: 10000, label: 'Verified',   badge: 'bg-success/10 text-success' },
  3: { daily: 50000, label: 'Full KYC',   badge: 'bg-primary/10 text-primary' },
};

export async function getKYC(userId: string): Promise<KYC | null> {
  const { data, error } = await supabase
    .from('kyc')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function updateKYC(
  userId: string,
  updates: Partial<Omit<KYC, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('kyc')
    .update(updates)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function submitKYC(userId: string): Promise<void> {
  await supabase
    .from('kyc')
    .update({
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

export async function uploadKYCDocument(
  userId: string,
  file: File,
  docType: 'front' | 'back' | 'selfie'
): Promise<string> {
  const ext  = file.name.split('.').pop();
  const path = `${userId}/${docType}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('kyc-documents')
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

// ── Referral System ────────────────────────────────────────────────

export interface ReferralSettings {
  id: string;
  user_id: string;
  code: string;
  total_referrals: number;
  qualified_referrals: number;
  total_earned: number;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id?: string;
  code: string;
  status: 'pending' | 'signed_up' | 'qualified' | 'rewarded';
  reward_amount: number;
  reward_credited: boolean;
  clicks: number;
  referred_email?: string;
  completed_at?: string;
  rewarded_at?: string;
  created_at: string;
}

export const REFERRAL_REWARDS = {
  perQualifiedReferral: 10,   // $10 USDT per referral
  minTradeToQualify:    50,    // referred user must trade $50+
  maxReferrals:         100,   // max rewarded referrals per user
};

export async function getReferralSettings(
  userId: string
): Promise<ReferralSettings | null> {
  const { data, error } = await supabase
    .from('referral_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    // Generate a secure, unique referral code (e.g. EVO-H3K9R)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // High legibility alphabet (no O/0, I/1 confusion)
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `EVO-${randomPart}`;

    try {
      const { data: insertedData, error: insertError } = await supabase
        .from('referral_settings')
        .insert({
          user_id: userId,
          code: code,
          total_referrals: 0,
          qualified_referrals: 0,
          total_earned: 0
        })
        .select('*')
        .single();
      
      if (!insertError && insertedData) {
        return insertedData;
      }
    } catch (e) {
      console.warn('Auto-creating referral settings failed, retrying search:', e);
    }

    // Attempt to re-query to handle concurrent operations
    const { data: secondQuery } = await supabase
      .from('referral_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    return secondQuery || null;
  }

  return data;
}

export async function getReferrals(
  userId: string
): Promise<Referral[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function trackReferralClick(
  code: string
): Promise<void> {
  // Increment click counter
  try {
    const { error } = await supabase.rpc('increment_referral_clicks', { p_code: code });
    if (error) throw error;
  } catch (err) {
    // Fallback if RPC doesn't exist
    const { data } = await supabase
      .from('referrals')
      .select('id, clicks')
      .eq('code', code)
      .eq('status', 'pending')
      .single();
    if (data) {
      await supabase
        .from('referrals')
        .update({ clicks: (data.clicks ?? 0) + 1 })
        .eq('id', data.id);
    }
  }
}

export async function applyReferralCode(
  referrerId: string,
  code: string,
  referredEmail: string
): Promise<void> {
  // Create a new referral record
  await supabase.from('referrals').insert({
    referrer_id: referrerId,
    code,
    status: 'signed_up',
    reward_amount: REFERRAL_REWARDS.perQualifiedReferral,
    referred_email: referredEmail,
  });

  // Update referrer stats
  await supabase
    .from('referral_settings')
    .update({
      total_referrals: supabase.rpc('increment', {
        row_id: referrerId, column: 'total_referrals'
      })
    })
    .eq('user_id', referrerId);
}

export async function creditReferralReward(
  userId: string,
  referralId: string,
  amount: number
): Promise<void> {
  // Add USDT reward to referrer wallet
  const wallet = await getWallet(userId, 'USDT');
  await upsertWallet(
    userId, 'USDT', 'Tether',
    (wallet?.balance ?? 0) + amount, 1
  );

  // Record as transaction
  await addTransaction(userId, {
    type: 'receive',
    symbol: 'USDT',
    amount,
    price_usd: 1,
    total_usd: amount,
    fee_usd: 0,
    status: 'completed',
    note: `Referral reward — $${amount} USDT`,
  });

  // Mark referral as rewarded
  await supabase
    .from('referrals')
    .update({
      status: 'rewarded',
      reward_credited: true,
      rewarded_at: new Date().toISOString(),
    })
    .eq('id', referralId);

  // Update total earned
  const settings = await getReferralSettings(userId);
  await supabase
    .from('referral_settings')
    .update({
      total_earned: (settings?.total_earned ?? 0) + amount,
      qualified_referrals: (settings?.qualified_referrals ?? 0) + 1,
    })
    .eq('user_id', userId);

  // Create notification
  await createNotification(
    userId, 'receive',
    'Referral reward credited!',
    `You earned $${amount} USDT for referring a new user. ` +
    `Keep sharing to earn more.`,
    '/referral'
  );

  // Send referral reward email
  (async () => {
    try {
      const { data: referrer } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();
      if (referrer?.email) {
        const { data: refData } = await supabase
          .from('referrals')
          .select('referred_email, referred_user_id')
          .eq('id', referralId)
          .single();
        const friendEmail = refData?.referred_email ?? 'your friend';
        const { sendReferralReward } = await import('./email');
        await sendReferralReward(referrer.email, {
          firstName: referrer.full_name?.split(' ')[0] ?? 'Trader',
          rewardAmount: amount,
          referredEmail: friendEmail,
          totalEarned: (settings?.total_earned ?? 0) + amount,
        });
      }
    } catch (err) {
      console.warn('[Referral Email] Failed to send email:', err);
    }
  })();
}

// ── Withdrawal Requests ───────────────────────────────────────────

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  symbol: string;
  amount: number;
  fee: number;
  net_amount: number;
  network: string;
  address: string;
  status: 'pending'|'processing'|'completed'|'rejected'|'cancelled';
  rejection_reason?: string;
  tx_hash?: string;
  created_at: string;
  updated_at: string;
}

export async function submitWithdrawalRequest(
  userId: string,
  amount: number,
  fee: number,
  network: string,
  address: string
): Promise<string> {
  // Lock funds immediately — deduct from wallet
  const wallet = await getWallet(userId, 'USDT');
  const total = amount + fee;
  if (!wallet || wallet.balance < total) {
    throw new Error(
      `Insufficient balance. Need $${total.toFixed(2)}, have $${(wallet?.balance ?? 0).toFixed(2)}`
    );
  }

  // Deduct from wallet immediately (funds locked)
  await upsertWallet(
    userId, 'USDT', 'Tether',
    wallet.balance - total, 1
  );

  // Create withdrawal request
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .insert({
      user_id:    userId,
      symbol:     'USDT',
      amount,
      fee,
      net_amount: amount - fee,
      network,
      address,
      status: 'pending',
    })
    .select('id')
    .single();
  if (error) throw error;

  // Record as pending transaction
  await addTransaction(userId, {
    type: 'withdraw',
    symbol: 'USDT',
    amount,
    price_usd: 1,
    total_usd: amount,
    fee_usd: fee,
    status: 'pending',
    note: `Withdrawal to ${address.slice(0,8)}...${address.slice(-4)} — pending admin review`,
  });

  return data.id;
}

export async function getUserWithdrawals(
  userId: string
): Promise<WithdrawalRequest[]> {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function cancelWithdrawal(
  userId: string,
  withdrawalId: string
): Promise<void> {
  // Get withdrawal
  const { data: wr, error } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('id', withdrawalId)
    .eq('user_id', userId)
    .single();
  if (error || !wr) throw new Error('Withdrawal not found');
  if (wr.status !== 'pending') {
    throw new Error('Only pending withdrawals can be cancelled');
  }

  // Refund locked funds
  const wallet = await getWallet(userId, 'USDT');
  await upsertWallet(
    userId, 'USDT', 'Tether',
    (wallet?.balance ?? 0) + wr.amount + wr.fee, 1
  );

  // Update status
  await supabase
    .from('withdrawal_requests')
    .update({ status: 'cancelled' })
    .eq('id', withdrawalId);
}

// ── Deposit Requests ──────────────────────────────────────────────

export interface DepositRequest {
  id: string;
  user_id: string;
  symbol: string;
  amount: number;
  network: string;
  address: string;
  tx_hash?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}

export interface PlatformAddress {
  network: string;
  symbol: string;
  address: string;
  label: string;
}

export async function getPlatformAddresses(): Promise<PlatformAddress[]> {
  const { data, error } = await supabase
    .from('platform_addresses')
    .select('*')
    .eq('active', true)
    .order('network');
  if (error) throw error;
  return data ?? [];
}

export async function submitDepositRequest(
  userId: string,
  amount: number,
  network: string,
  address: string,
  txHash?: string
): Promise<string> {
  const { data, error } = await supabase
    .from('deposit_requests')
    .insert({
      user_id: userId,
      symbol: 'USDT',
      amount,
      network,
      address,
      tx_hash: txHash ?? null,
      status: 'pending',
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function getUserDeposits(
  userId: string
): Promise<DepositRequest[]> {
  const { data, error } = await supabase
    .from('deposit_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Internal Transfers (Peer-to-Peer) ─────────────────────────────

export interface InternalTransfer {
  id: string;
  sender_id: string;
  receiver_id: string;
  symbol: string;
  amount: number;
  note?: string;
  status: 'completed' | 'reversed';
  created_at: string;
}

export interface TransferRecipient {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url?: string;
}

export async function findTransferRecipient(
  query: string
): Promise<TransferRecipient | null> {
  const isEmail = query.includes('@') && query.includes('.');
  const searchField = isEmail ? 'email' : 'username';
  const searchValue = isEmail
    ? query.trim().toLowerCase()
    : query.replace('@', '').trim().toLowerCase();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, username, avatar_url')
    .eq(searchField, searchValue)
    .single();

  if (error || !data) return null;
  return data as TransferRecipient;
}

export async function sendInternalTransfer(
  senderId: string,
  receiverId: string,
  symbol: string,
  name: string,
  amount: number,
  currentPrice: number,
  note?: string
): Promise<void> {
  if (senderId === receiverId) {
    throw new Error('You cannot send funds to yourself');
  }

  // Check sender balance
  const senderWallet = await getWallet(senderId, symbol);
  if (!senderWallet || senderWallet.balance < amount) {
    throw new Error(
      `Insufficient ${symbol} balance. Have ${
        (senderWallet?.balance ?? 0).toFixed(6)
      }, need ${amount.toFixed(6)}`
    );
  }

  // Deduct from sender
  await upsertWallet(
    senderId, symbol, name,
    senderWallet.balance - amount,
    senderWallet.avg_buy_price
  );

  // Credit receiver
  const receiverWallet = await getWallet(receiverId, symbol);
  const receiverBalance = receiverWallet?.balance ?? 0;
  const receiverAvg = receiverWallet?.avg_buy_price ?? currentPrice;
  // Recalculate avg buy price for receiver
  const totalValue = receiverBalance * receiverAvg + amount * currentPrice;
  const newBalance = receiverBalance + amount;
  const newAvg = newBalance > 0 ? totalValue / newBalance : currentPrice;

  await upsertWallet(receiverId, symbol, name, newBalance, newAvg);

  // Record transfer
  const { error: txError } = await supabase
    .from('internal_transfers')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      symbol,
      amount,
      note,
      status: 'completed',
    });
  if (txError) throw txError;

  const usdValue = amount * currentPrice;

  // Record transactions for both parties
  await addTransaction(senderId, {
    type: 'send',
    symbol,
    amount,
    price_usd: currentPrice,
    total_usd: usdValue,
    fee_usd: 0,
    status: 'completed',
    note: `Sent to @${receiverId.slice(0,6)} on EVONANCE`,
  });

  await addTransaction(receiverId, {
    type: 'receive',
    symbol,
    amount,
    price_usd: currentPrice,
    total_usd: usdValue,
    fee_usd: 0,
    status: 'completed',
    note: `Received from EVONANCE user`,
  });
}

export async function getInternalTransfers(
  userId: string,
  limit = 20
): Promise<InternalTransfer[]> {
  const { data, error } = await supabase
    .from('internal_transfers')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ── Card Issuance Fee & Requests ──────────────────────────────────

export const CARD_ISSUANCE_FEE = 1.00; // $1 USDT

export async function requestCard(
  userId: string,
  cardName: string = 'My Card'
): Promise<string> {
  // Check USDT balance
  const wallet = await getWallet(userId, 'USDT');
  const balance = wallet?.balance ?? 0;
  if (balance < CARD_ISSUANCE_FEE) {
    throw new Error(
      `Insufficient balance. Need $${CARD_ISSUANCE_FEE} USDT ` +
      `to issue a card. Current balance: $${balance.toFixed(2)}`
    );
  }

  // Check card limit (max 5 cards per user)
  const { count } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'cancelled');
  if ((count ?? 0) >= 5) {
    throw new Error('Maximum 5 cards per account');
  }

  // Deduct $1 issuance fee
  await upsertWallet(
    userId, 'USDT', 'Tether',
    balance - CARD_ISSUANCE_FEE, 1
  );

  // Generate card details
  const last4 = Math.floor(1000 + Math.random() * 9000).toString();
  const now = new Date();
  const expYear = (now.getFullYear() + 4).toString().slice(-2);
  const expMonth = String(now.getMonth() + 1).padStart(2, '0');
  const expiry = `${expMonth}/${expYear}`;

  // Create card as pending
  const { data: card, error } = await supabase
    .from('cards')
    .insert({
      user_id: userId,
      name: cardName,
      last4,
      expiry,
      balance: 0,
      spending_limit: 5000,
      status: 'pending',         // pending until admin activates
      issuance_fee: CARD_ISSUANCE_FEE,
      issuance_paid: true,
      requested_at: new Date().toISOString(),
      card_type: 'virtual',
    })
    .select('id')
    .single();
  if (error) throw error;

  // Record fee transaction
  await supabase.from('card_issuance_fees').insert({
    user_id: userId,
    card_id: card.id,
    amount: CARD_ISSUANCE_FEE,
    status: 'paid',
  });

  // Record in transactions
  await addTransaction(userId, {
    type: 'withdraw',
    symbol: 'USDT',
    amount: CARD_ISSUANCE_FEE,
    price_usd: 1,
    total_usd: CARD_ISSUANCE_FEE,
    fee_usd: 0,
    status: 'completed',
    note: `Card issuance fee — ${cardName}`,
  });

  return card.id;
}






