// ─── EVONANCE Database Types ──────────────────────────────────────────────────
// Mirrors the Supabase PostgreSQL schema exactly.
// Run the SQL in /supabase/schema.sql to create these tables.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "created_at" | "updated_at">;
        Update: Partial<Omit<UserProfile, "id" | "created_at">>;
      };
      wallets: {
        Row: Wallet;
        Insert: Omit<Wallet, "created_at">;
        Update: Partial<Omit<Wallet, "id" | "user_id" | "created_at">>;
      };
      wallet_balances: {
        Row: WalletBalance;
        Insert: Omit<WalletBalance, "updated_at">;
        Update: Partial<WalletBalance>;
      };
      supported_assets: {
        Row: SupportedAsset;
        Insert: Omit<SupportedAsset, "created_at">;
        Update: Partial<SupportedAsset>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at">;
        Update: Partial<Pick<Transaction, "status" | "tx_hash">>;
      };
      swaps: {
        Row: Swap;
        Insert: Omit<Swap, "id" | "created_at">;
        Update: Partial<Pick<Swap, "status">>;
      };
      trades: {
        Row: Trade;
        Insert: Omit<Trade, "id" | "created_at">;
        Update: Partial<Pick<Trade, "status">>;
      };
      virtual_cards: {
        Row: VirtualCard;
        Insert: Omit<VirtualCard, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<VirtualCard, "id" | "user_id" | "created_at">>;
      };
      card_transactions: {
        Row: CardTransaction;
        Insert: Omit<CardTransaction, "id" | "created_at">;
        Update: Partial<Pick<CardTransaction, "status">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Pick<Notification, "read">>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: UserSettings;
        Update: Partial<UserSettings>;
      };
    };
  };
}

// ─── Row Types ────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;                    // auth.users.id
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  kyc_status: "none" | "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface WalletBalance {
  wallet_id: string;
  asset_id: string;
  balance: number;
  updated_at: string;
}

export interface SupportedAsset {
  id: string;             // e.g. "bitcoin"
  symbol: string;         // e.g. "BTC"
  name: string;           // e.g. "Bitcoin"
  coingecko_id: string;
  decimals: number;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: "deposit" | "withdrawal" | "swap" | "trade" | "card_fund" | "card_spend" | "fee";
  status: "pending" | "completed" | "failed" | "cancelled";
  asset_id: string;
  amount: number;
  fee: number;
  usd_value: number;
  description: string;
  tx_hash: string | null;
  reference_id: string | null;   // swap_id, trade_id, card_transaction_id
  created_at: string;
}

export interface Swap {
  id: string;
  user_id: string;
  from_asset_id: string;
  to_asset_id: string;
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  fee_usd: number;
  slippage_pct: number;
  status: "pending" | "completed" | "failed";
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  pair: string;              // e.g. "BTC/USDT"
  side: "buy" | "sell";
  order_type: "market" | "limit";
  amount: number;
  price: number;
  total_usd: number;
  fee_usd: number;
  status: "pending" | "filled" | "cancelled" | "failed";
  created_at: string;
}

export interface VirtualCard {
  id: string;
  user_id: string;
  card_number_last4: string;
  expiry_month: number;
  expiry_year: number;
  balance_usd: number;
  status: "active" | "frozen" | "cancelled";
  funded_from_asset: string;
  cashback_pct: number;
  monthly_limit_usd: number;
  created_at: string;
  updated_at: string;
}

export interface CardTransaction {
  id: string;
  card_id: string;
  user_id: string;
  type: "fund" | "spend" | "refund";
  amount_usd: number;
  merchant: string | null;
  description: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "account" | "swap" | "trade" | "card" | "security" | "system";
  title: string;
  body: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  theme: "light" | "dark" | "system";
  currency: string;            // "USD"
  language: string;            // "en"
  notif_swaps: boolean;
  notif_trades: boolean;
  notif_cards: boolean;
  notif_security: boolean;
  notif_marketing: boolean;
  two_fa_enabled: boolean;
}

// ─── Convenience Types ────────────────────────────────────────────────────────

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
  category?: string;
}

export interface PortfolioAsset {
  asset: SupportedAsset;
  balance: number;
  price_usd: number;
  value_usd: number;
  change_24h_pct: number;
}

export interface PortfolioSummary {
  total_usd: number;
  change_24h_usd: number;
  change_24h_pct: number;
  assets: PortfolioAsset[];
}
