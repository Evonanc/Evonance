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
  status: 'active'|'frozen'|'cancelled';
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
  status: 'active' | 'frozen'
) {
  const { error } = await supabase
    .from('cards')
    .update({ status })
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
