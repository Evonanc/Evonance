import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getWallets, getTransactions, Wallet, Transaction } from '../lib/db';
import { CoinData } from '../lib/crypto';

export interface PortfolioAsset extends Wallet {
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  color: string;
}

export function usePortfolio(coins: CoinData[]) {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [w, t] = await Promise.all([
        getWallets(user.id),
        getTransactions(user.id),
      ]);
      setWallets(w);
      setTransactions(t);
    } catch (err) {
      console.error('Portfolio load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Live portfolio values — recomputes on every Bybit WS price tick
  const assets: PortfolioAsset[] = wallets.map(wallet => {
    const coin = coins.find(c => c.symbol === wallet.symbol);
    const currentPrice = coin?.price ?? wallet.avg_buy_price;
    const currentValue = wallet.balance * currentPrice;
    const costBasis = wallet.balance * wallet.avg_buy_price;
    const pnl = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return {
      ...wallet,
      currentPrice,
      currentValue,
      pnl,
      pnlPercent,
      color: coin?.color ?? '#6366f1',
    };
  });

  const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalCost  = assets.reduce((s, a) => s + a.balance * a.avg_buy_price, 0);
  const totalPnl   = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return {
    assets, transactions, totalValue,
    totalPnl, totalPnlPercent, loading,
    refresh: load,
  };
}
