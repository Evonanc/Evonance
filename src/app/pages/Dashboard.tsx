import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Navigation from '../components/Navigation';
import { 
  ArrowUpRight, ArrowDownRight, 
  TrendingUp, Wallet, ArrowLeftRight, CreditCard, 
  ArrowUp, ArrowDown, BookOpen, Eye, EyeOff, CheckCircle2, ChevronRight,
  ArrowDownLeft, Clock
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { fadeUp, scaleIn, slideInRight, staggerContainer, staggerFast } from '../lib/animations';
import { useCountUp } from '../hooks/useCountUp';
import { useCryptoData } from '../hooks/useCryptoData';
import { formatPrice, CoinData } from '../lib/crypto';
import { usePortfolio } from '../hooks/usePortfolio';
import { useAuth } from '../hooks/useAuth';
import { getWatchlist, getUserWithdrawals, cancelWithdrawal, WithdrawalRequest, getUserDeposits, DepositRequest } from '../lib/db';
import { toast } from 'sonner';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import SendModal from '../components/SendModal';
import ReceiveModal from '../components/ReceiveModal';
import PortfolioChart from '../components/PortfolioChart';
import KYCBanner from '../components/KYCBanner';
import KYCBadge from '../components/KYCBadge';
import { useKYC } from '../hooks/useKYC';
import PWAInstallBanner from '../components/PWAInstallBanner';
import ReferralCard from '../components/ReferralCard';

function CountUpText({ target, prefix = '', suffix = '', decimals = 0 }: { target: number, prefix?: string, suffix?: string, decimals?: number }) {
  const { ref, value } = useCountUp(target, 1500, prefix, suffix, decimals);
  return <span ref={ref}>{value}</span>;
}

export default function Dashboard() {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [hideBalance, setHideBalance] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showAllAssets, setShowAllAssets] = useState(false);
  const [hideHoldings, setHideHoldings] = useState(false);

  const { user } = useAuth();
  const { level, status } = useKYC();

  // Live Crypto Data Hook (WebSocket enabled)
  const { coins, loading: cryptoLoading } = useCryptoData();

  // Real Supabase Portfolio Hook
  const {
    assets,
    transactions: dbTransactions,
    totalValue,
    totalPnl,
    totalPnlPercent,
    loading: portfolioLoading,
    refresh
  } = usePortfolio(coins);

  const loading = cryptoLoading || portfolioLoading;

  // Watchlist — load symbols then match to live prices
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);

  const loadWithdrawals = () => {
    if (!user) return;
    getUserWithdrawals(user.id).then(setWithdrawals).catch(console.error);
  };

  const loadDeposits = () => {
    if (!user) return;
    getUserDeposits(user.id)
      .then(d => setDeposits(d.filter(x => x.status === 'pending')))
      .catch(console.error);
  };

  useEffect(() => {
    if (!user) return;
    getWatchlist(user.id).then(setWatchlistSymbols).catch(console.error);
    loadWithdrawals();
    loadDeposits();
  }, [user]);

  useEffect(() => {
    const pending = localStorage.getItem('evonance_pending_withdrawal');
    if (pending && status === 'verified') {
      try {
        const data = JSON.parse(pending);
        toast.success(
          `Your KYC is approved! You can now submit your $${data.amount} USDT withdrawal.`,
          {
            duration: 8000,
            action: {
              label: 'Withdraw Now',
              onClick: () => setWithdrawOpen(true),
            },
          }
        );
        localStorage.removeItem('evonance_pending_withdrawal');
      } catch (e) {
        console.error(e);
      }
    }
  }, [status]);

  const watchlistCoins = useMemo(() => {
    return watchlistSymbols
      .map(sym => coins.find(c => c.symbol === sym))
      .filter((c): c is CoinData => !!c);
  }, [watchlistSymbols, coins]);

  const [realtimeNews, setRealtimeNews] = useState<{ title: string; source: string; time: string; url: string }[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchNews() {
      try {
        const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
        if (!res.ok) throw new Error('News fetch failed');
        const json = await res.json();
        if (json && json.Data && Array.isArray(json.Data) && active) {
          const items = json.Data.slice(0, 4).map((item: any) => {
            const secsAgo = Math.floor(Date.now() / 1000) - item.published_on;
            let timeStr = 'Just now';
            if (secsAgo >= 86400) {
              timeStr = Math.floor(secsAgo / 86400) + 'd ago';
            } else if (secsAgo >= 3600) {
              timeStr = Math.floor(secsAgo / 3600) + 'h ago';
            } else if (secsAgo >= 60) {
              timeStr = Math.max(1, Math.floor(secsAgo / 60)) + 'm ago';
            }

            return {
              title: item.title,
              source: item.source_info?.name || item.source || 'Crypto News',
              time: timeStr,
              url: item.url
            };
          });
          setRealtimeNews(items);
        }
      } catch (err) {
        console.warn('Could not fetch real-time crypto news:', err);
      } finally {
        if (active) {
          setNewsLoading(false);
        }
      }
    }
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const newsList = realtimeNews.length > 0 ? realtimeNews : [
    { title: 'Bitcoin surges past key resistance level', source: 'Bloomberg', time: '1 hour ago', url: 'https://bloomberg.com' },
    { title: 'DeFi TVL surges by $12B in active multi-chain deposits', source: 'CoinDesk', time: '4 hours ago', url: 'https://coindesk.com' },
    { title: 'USDT supply hits new high as demand increases', source: 'The Block', time: '7 hours ago', url: 'https://theblock.co' },
  ];

  const quickActions = [
    { label: 'Send', icon: ArrowUp, onClick: () => setSendOpen(true), color: 'text-primary bg-primary/10' },
    { label: 'Receive', icon: ArrowDown, onClick: () => setReceiveOpen(true), color: 'text-success bg-success/10' },
    { label: 'Deposit', icon: Wallet, onClick: () => setDepositOpen(true), color: 'text-warning bg-warning/10' },
    { label: 'Withdraw', icon: CreditCard, onClick: () => setWithdrawOpen(true), color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Swap', icon: ArrowLeftRight, href: '/swap', color: 'text-pink-500 bg-pink-500/10' },
    { label: 'Trade', icon: TrendingUp, onClick: () => navigate('/trade'), color: 'text-cyan-500 bg-cyan-500/10' },
  ];


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation isPublic={false} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        <PWAInstallBanner />
        <KYCBanner />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
              <KYCBadge level={level} status={status} />
            </div>
            <p className="text-muted-foreground mt-1">Welcome back! Manage your portfolio and cards.</p>
          </div>
        </div>
        
        {/* Style block for chart gradient pulse animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes gradientPulse {
            0% { fill-opacity: 0.25; }
            50% { fill-opacity: 0.45; }
            100% { fill-opacity: 0.25; }
          }
          .chart-pulse-fill {
            animation: gradientPulse 4s infinite ease-in-out;
          }
        `}} />

        {/* 2x3 responsive structure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Portfolio Card */}
          <motion.div 
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <PortfolioChart
              transactions={dbTransactions}
              coins={coins}
              totalValue={totalValue}
              totalPnl={totalPnl}
              totalPnlPercent={totalPnlPercent}
              loading={loading}
            />
          </motion.div>

          {/* Quick Actions Panel */}
          <motion.div 
            initial={shouldReduceMotion ? {} : 'hidden'}
            animate={shouldReduceMotion ? {} : 'visible'}
            variants={slideInRight}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-lg text-foreground mb-6">Quick Actions</h3>
              <motion.div 
                variants={staggerFast}
                className="grid grid-cols-2 gap-4"
              >
                {quickActions.map((action) => {
                  const Component = action.onClick ? motion.button : motion.a;
                  const extraProps = action.onClick 
                    ? { onClick: action.onClick, type: 'button' as const } 
                    : { href: action.href };
                  
                  return (
                    <Component
                      key={action.label}
                      {...extraProps}
                      variants={shouldReduceMotion ? {} : scaleIn}
                      whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                      className="p-4 rounded-xl border border-border bg-background hover:border-primary/40 hover:shadow-sm transition-all flex flex-col items-center gap-3 text-center cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{action.label}</span>
                    </Component>
                  );
                })}
              </motion.div>
            </div>

            {/* Visa Card short view */}
            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-8 rounded-md bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-[6px] text-white/50 font-bold tracking-widest font-mono">VISA</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-semibold block uppercase tracking-wider">USD Visa Balance</span>
                  <span className="text-base font-bold text-foreground font-mono">$1,250.45</span>
                </div>
                <CreditCard className="w-5 h-5 text-primary ml-auto" />
              </div>
            </div>
          </motion.div>

          {/* COL 1: Holdings Assets */}
          <motion.div 
            initial={shouldReduceMotion ? {} : 'hidden'}
            animate={shouldReduceMotion ? {} : 'visible'}
            variants={fadeUp}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-4 shadow-sm h-fit"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <span>Holdings</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setHideHoldings(!hideHoldings);
                    }}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    title={hideHoldings ? 'Show holdings' : 'Hide holdings'}
                  >
                    {hideHoldings ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </h3>
              </div>
              
              <AnimatePresence mode="wait">
                {hideHoldings ? (
                  <motion.div
                    key="hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="py-8 flex flex-col items-center justify-center text-center space-y-2"
                  >
                    <EyeOff className="w-6 h-6 text-muted-foreground/40 animate-pulse" />
                    <div>
                      <p className="text-[11px] font-bold text-foreground">Holdings Hidden</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 max-w-[180px]">Click the eye to reveal assets.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="visible"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    variants={staggerFast}
                    className="divide-y divide-border max-h-[340px] overflow-y-auto pr-1 scrollbar-thin"
                  >
                    {loading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="py-2">
                          <div className="skeleton h-10 rounded-lg w-full" />
                        </div>
                      ))
                    ) : (
                      (showAllAssets ? assets : assets.slice(0, 7)).map((asset) => {
                        const isUp = asset.pnlPercent >= 0;
                        const formattedChange = `${isUp ? '+' : ''}${asset.pnlPercent.toFixed(2)}%`;
                        const allocation = totalValue > 0 ? ((asset.currentValue / totalValue) * 100).toFixed(1) + '%' : '0.0%';
                        return (
                          <motion.div
                            key={asset.symbol}
                            variants={shouldReduceMotion ? {} : fadeUp}
                            whileHover={shouldReduceMotion ? {} : { x: 4, backgroundColor: 'var(--secondary)' }}
                            transition={{ duration: 0.15 }}
                            onClick={() => navigate('/trade')}
                            className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between rounded-lg px-1 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0"
                                style={{ backgroundColor: `${asset.color}15`, color: asset.color }}
                              >
                                {asset.symbol.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-foreground leading-tight truncate">{asset.name}</p>
                                <p className="text-[9px] text-muted-foreground uppercase font-semibold leading-none mt-0.5 truncate">
                                  {hideBalance ? '••••' : `${asset.balance.toFixed(4)} ${asset.symbol}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className="font-bold text-xs text-foreground font-mono leading-tight">
                                {hideBalance ? '••••' : `$${asset.currentValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                              </p>
                              <div className="flex items-center justify-end gap-1 mt-0.5">
                                <span className={`text-[8px] font-bold ${isUp ? 'text-success' : 'text-destructive'}`}>
                                  {formattedChange}
                                </span>
                                <span className="text-[8px] bg-secondary text-primary font-bold px-1.5 py-0.5 rounded-full">{allocation}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!hideHoldings && assets.length > 7 && (
              <button 
                onClick={() => setShowAllAssets(!showAllAssets)}
                className="w-full mt-3 py-1.5 border border-border hover:bg-secondary text-foreground text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{showAllAssets ? 'Show Less' : `Show More (${assets.length - 7} more)`}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showAllAssets ? '-rotate-90' : 'rotate-90'}`} />
              </button>
            )}
            
            <a href="/trade" className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1 mt-6">
              <span>View detailed wallet balances</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          {/* COL 2: Recent Transactions */}
          <div className="space-y-6 h-fit">
            {deposits.length > 0 && (
              <div className="bg-card border border-primary/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowDownLeft className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-foreground text-sm">
                    Pending Deposits
                  </h3>
                  <span className="text-xs bg-primary/10 text-primary px-2
                    py-0.5 rounded-full font-medium font-semibold">
                    {deposits.length}
                  </span>
                </div>
                {deposits.map(d => (
                  <div key={d.id} className="flex items-center justify-between
                    p-3 bg-secondary rounded-xl mb-2 last:mb-0">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        ${d.amount.toFixed(2)} USDT — {d.network}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(d.created_at).toLocaleDateString()} · {d.tx_hash ? 'Hash provided' : 'No hash provided'}
                      </p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary
                      px-2 py-0.5 rounded-full font-medium font-semibold">
                      Awaiting confirmation
                    </span>
                  </div>
                ))}
              </div>
            )}

            {withdrawals.filter(w => w.status === 'pending').length > 0 && (
              <div className="bg-card border border-warning/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-warning" />
                  <h3 className="font-bold text-foreground text-sm">
                    Pending Withdrawals
                  </h3>
                  <span className="text-xs bg-warning/10 text-warning px-2
                    py-0.5 rounded-full font-medium font-semibold">
                    {withdrawals.filter(w => w.status === 'pending').length}
                  </span>
                </div>
                {withdrawals.filter(w => w.status === 'pending').map(wr => (
                  <div key={wr.id} className="flex items-center justify-between
                    p-3 bg-secondary rounded-xl mb-2 last:mb-0">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        ${wr.amount.toFixed(2)} USDT — {wr.network}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {wr.address.slice(0,10)}... · {new Date(wr.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-warning/10 text-warning
                        px-2 py-0.5 rounded-full font-medium font-semibold">
                        Pending review
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            if (!user) return;
                            await cancelWithdrawal(user.id, wr.id);
                            setWithdrawals(prev =>
                              prev.map(w => w.id === wr.id
                                ? { ...w, status: 'cancelled' }
                                : w
                              )
                            );
                            toast.success('Withdrawal cancelled — funds refunded');
                          } catch (err: any) {
                            toast.error(err.message);
                          }
                        }}
                        className="text-xs text-destructive hover:underline font-semibold cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <motion.div 
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate={shouldReduceMotion ? {} : 'visible'}
              variants={fadeUp}
              transition={{ delay: 0.35 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <h3 className="font-bold text-lg text-foreground mb-6">Recent Activity</h3>
              <motion.div 
                variants={staggerFast}
                className="space-y-4"
              >
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="skeleton h-12 rounded-lg w-full" />
                  ))
                ) : dbTransactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No recent transactions.</p>
                ) : (
                  (showAllTransactions ? dbTransactions : dbTransactions.slice(0, 7)).map((tx, i) => {
                    const isAdd = ['buy', 'deposit', 'receive'].includes(tx.type);
                    const formattedAmount = `${isAdd ? '+' : '-'}${tx.amount.toFixed(4)} ${tx.symbol}`;
                    const formattedValue = `${isAdd ? '+' : '-'}$${tx.total_usd.toFixed(2)}`;
                    const desc = tx.note || `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} ${tx.symbol}`;
                    
                    const diff = Date.now() - new Date(tx.created_at).getTime();
                    let timeStr = 'Just now';
                    if (diff >= 86400000) {
                      timeStr = Math.floor(diff / 86400000) + 'd ago';
                    } else if (diff >= 3600000) {
                      timeStr = Math.floor(diff / 3600000) + 'h ago';
                    } else if (diff >= 60000) {
                      timeStr = Math.max(1, Math.floor(diff / 60000)) + 'm ago';
                    }

                    return (
                      <motion.div 
                        key={tx.id || i}
                        variants={shouldReduceMotion ? {} : fadeUp}
                        className="flex items-center justify-between"
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isAdd 
                              ? 'bg-success/10 text-success' 
                              : tx.type === 'swap' 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-destructive/10 text-destructive'
                          }`}>
                            {tx.type === 'swap' ? (
                              <ArrowLeftRight className="w-4 h-4 text-primary" />
                            ) : isAdd ? (
                              <ArrowDownLeft className="w-4 h-4 text-success" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-foreground leading-none mb-1">{desc}</p>
                            <p className="text-[10px] text-muted-foreground">{timeStr}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xs text-foreground font-mono">{formattedAmount}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{formattedValue}</p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>

              {!loading && dbTransactions.length > 7 && (
                <button 
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  className="w-full mt-5 py-2 border border-border hover:bg-secondary text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{showAllTransactions ? 'Show Less' : `Show More (${dbTransactions.length - 7} more)`}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllTransactions ? '-rotate-90' : 'rotate-90'}`} />
                </button>
              )}
            </motion.div>
          </div>

          {/* COL 3: Watchlist & News */}
          <div className="space-y-6 h-fit">
            <ReferralCard />
            
            {/* Watchlist */}
            <motion.div 
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate={shouldReduceMotion ? {} : 'visible'}
              variants={fadeUp}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <h3 className="font-bold text-lg text-foreground mb-6">Market Watchlist</h3>
              <motion.div 
                variants={staggerFast}
                className="space-y-3"
              >
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="skeleton h-12 rounded-lg w-full" />
                  ))
                ) : (
                  watchlistCoins.map((coin) => {
                    const isUp = coin.change24h >= 0;
                    const formattedChange = `${isUp ? '+' : ''}${coin.change24h.toFixed(2)}%`;
                    return (
                      <motion.div
                        key={coin.symbol}
                        variants={shouldReduceMotion ? {} : fadeUp}
                        className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-background"
                      >
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0"
                            style={{ backgroundColor: `${coin.color}15`, color: coin.color }}
                          >
                            {coin.symbol}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-foreground">{coin.symbol}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-semibold">{coin.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xs text-foreground font-mono">
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span
                                key={coin.price}
                                initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="inline-block"
                              >
                                ${formatPrice(coin.price)}
                              </motion.span>
                            </AnimatePresence>
                          </p>
                          <span className={`text-[9px] font-bold flex items-center justify-end gap-0.5 ${isUp ? 'text-success' : 'text-destructive'}`}>
                            {isUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                            <span>{formattedChange}</span>
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            </motion.div>

            {/* News */}
            <motion.div 
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate={shouldReduceMotion ? {} : 'visible'}
              variants={fadeUp}
              transition={{ delay: 0.45 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <h3 className="font-bold text-lg text-foreground mb-6 flex items-center justify-between">
                <span>Real-time News</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </h3>
              <div className="space-y-4">
                {newsLoading && realtimeNews.length === 0 ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="space-y-2 py-1">
                      <div className="skeleton h-3 w-28 rounded-md" />
                      <div className="skeleton h-4 w-full rounded-md" />
                    </div>
                  ))
                ) : (
                  newsList.map((news, i) => (
                    <div key={i} className="border-l-2 border-primary/45 pl-3 py-1 hover:border-primary transition-colors">
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase font-semibold tracking-wider">
                        {news.source} • {news.time}
                      </p>
                      <a 
                        href={news.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-bold text-xs text-foreground hover:text-primary transition-colors line-clamp-2 leading-relaxed block"
                      >
                        {news.title}
                      </a>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSuccess={() => {
          refresh();
          loadDeposits();
        }}
      />
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={() => {
          refresh();
          loadWithdrawals();
        }}
      />
      <SendModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        onSuccess={refresh}
      />
      <ReceiveModal
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
      />
    </div>
  );
}
