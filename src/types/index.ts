/**
 * EVONANCE Core Type Definitions
 */

export type AssetType = 'crypto' | 'fiat';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  icon?: string;
  type: AssetType;
  currentPrice: number;
  priceChange24h: number;
  balance: number;
  valueUsd: number;
}

export interface Wallet {
  id: string;
  name: string;
  address: string;
  assets: Asset[];
  totalValueUsd: number;
}

export interface VirtualCard {
  id: string;
  cardNumber: string; // Masked except last 4
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  status: 'active' | 'frozen' | 'cancelled';
  balanceUsd: number;
  type: 'virtual_visa' | 'virtual_mastercard';
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'swap' | 'trade' | 'card_funding' | 'card_spending';
  status: 'completed' | 'pending' | 'failed';
  amount: number;
  asset: string;
  amountUsd: number;
  timestamp: string;
  description: string;
  txHash?: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  kycStatus: 'unverified' | 'pending' | 'verified';
  preferredCurrency: string;
  createdAt: string;
}
