import { useState, useMemo, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip 
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, 
  TrendingUp, Wallet, ArrowLeftRight, CreditCard, 
  ArrowUp, ArrowDown, BookOpen, Eye, EyeOff, CheckCircle2, ChevronRight,
  ArrowDownLeft
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { fadeUp, scaleIn, slideInRight, staggerContainer, staggerFast } from '../lib/animations';
import { useCountUp } from '../hooks/useCountUp';
import { useCryptoData } from '../hooks/useCryptoData';
import { formatPrice, CoinData } from '../lib/crypto';
import { usePortfolio } from '../hooks/usePortfolio';
import { useAuth } from '../hooks/useAuth';
import { getWatchlist } from '../lib/db';

function CountUpText({ target, prefix = '', suffix = '', decimals = 0 }: { target: number, prefix?: string, suffix?: string, decimals?: number }) {
  const { ref, value } = useCountUp(target, 1500, prefix, suffix, decimals);
  return <span ref={ref}>{value}</span>;
}

export default function Dashboard() {
  const shouldReduceMotion = useReducedMotion();
  const [hideBalance, setHideBalance] = useState(false);

  const { user } = useAuth();

  // Live Crypto Data Hook (WebSocket enabled)
  const { coins, loading: cryptoLoading } = useCryptoData();

  // Real Supabase Portfolio Hook
  const {
    assets,
    transactions: dbTransactions,
    totalValue,
    totalPnl,
    totalPnlPercent,
    loading: portfolioLoading
  } = usePortfolio(coins);

  const loading = cryptoLoading || portfolioLoading;

  // Watchlist — load symbols then match to live prices
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  useEffect(() => {
    if (!user) return;
    getWatchlist(user.id).then(setWatchlistSymbols).catch(console.error);
  }, [user]);

  const watchlistCoins = useMemo(() => {
    return watchlistSymbols
      .map(sym => coins.find(c => c.symbol === sym))
      .filter((c): c is CoinData => !!c);
  }, [watchlistSymbols, coins]);

  const chartData = useMemo(() => [
    { name: 'Jan', value: totalValue * 0.7 },
    { name: 'Feb', value: totalValue * 0.8 },
    { name: 'Mar', value: totalValue * 0.75 },
    { name: 'Apr', value: totalValue * 0.9 },
    { name: 'May', value: totalValue * 0.85 },
    { name: 'Jun', value: totalValue },
  ], [totalValue]);

  const newsList = [
    { title: 'Bitcoin surges past key resistance level', source: 'Bloomberg', time: '1 hour ago' },
    { title: 'DeFi TVL surges by $12B in active multi-chain deposits', source: 'CoinDesk', time: '4 hours ago' },
    { title: 'USDT supply hits new high as demand increases', source: 'The Block', time: '7 hours ago' },
  ];

  const quickActions = [
    { label: 'Send', icon: ArrowUp, href: '/trade', color: 'text-primary bg-primary/10' },
    { label: 'Receive', icon: ArrowDown, href: '/trade', color: 'text-success bg-success/10' },
    { label: 'Deposit', icon: Wallet, href: '/trade', color: 'text-warning bg-warning/10' },
    { label: 'Withdraw', icon: CreditCard, href: '/trade', color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Swap', icon: ArrowLeftRight, href: '/swap', color: 'text-pink-500 bg-pink-500/10' },
    { label: 'Trade', icon: TrendingUp, href: '/trade', color: 'text-cyan-500 bg-cyan-500/10' },
  ];


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation isPublic={false} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        
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
            className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Portfolio Balance</span>
                <button 
                  onClick={() => setHideBalance(!hideBalance)}
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {hideBalance ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Show Balance</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Hide Balance</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl lg:text-5xl font-black text-foreground font-mono tracking-tight">
                  {hideBalance ? (
                    '••••••••'
                  ) : (
                    <CountUpText target={totalValue} decimals={2} prefix="$" />
                  )}
                </span>
                <span className={`text-sm font-bold px-2.5 py-1 rounded-lg flex items-center gap-0.5 ${totalPnl >= 0 ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'}`}>
                  {totalPnl >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>
                    <CountUpText target={Math.abs(totalPnlPercent)} decimals={2} suffix="%" />
                  </span>
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground flex gap-1 font-mono">
                <span>Daily P&L:</span>
                <span className={`${totalPnl >= 0 ? 'text-success' : 'text-destructive'} font-semibold`}>
                  {hideBalance ? '••••' : `${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toLocaleString('en-US', { maximumFractionDigits: 2 })} (${totalPnlPercent.toFixed(2)}%)`}
                </span>
              </div>

            </div>

            {/* Premium pulsating Recharts AreaChart */}
            <div className="h-[200px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066ff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0066ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--muted-foreground)" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    fontSize={11}
                    domain={['dataMin - 10000', 'dataMax + 10000']}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderColor: 'var(--border)',
                      borderRadius: '0.75rem',
                      color: 'var(--foreground)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0066ff" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorPortfolio)" 
                    className="chart-pulse-fill"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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
                {quickActions.map((action) => (
                  <motion.a
                    key={action.label}
                    href={action.href}
                    variants={shouldReduceMotion ? {} : scaleIn}
                    whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    className="p-4 rounded-xl border border-border bg-background hover:border-primary/40 hover:shadow-sm transition-all flex flex-col items-center gap-3 text-center cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{action.label}</span>
                  </motion.a>
                ))}
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
            className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-lg text-foreground mb-6">Holdings</h3>
              <motion.div 
                variants={staggerFast}
                className="divide-y divide-border"
              >
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="py-2.5">
                      <div className="skeleton h-12 rounded-lg w-full" />
                    </div>
                  ))
                ) : (
                  assets.map((asset) => {
                    const isUp = asset.pnlPercent >= 0;
                    const formattedChange = `${isUp ? '+' : ''}${asset.pnlPercent.toFixed(2)}%`;
                    const allocation = totalValue > 0 ? ((asset.currentValue / totalValue) * 100).toFixed(1) + '%' : '0.0%';
                    return (
                      <motion.div
                        key={asset.symbol}
                        variants={shouldReduceMotion ? {} : fadeUp}
                        whileHover={shouldReduceMotion ? {} : { x: 4, backgroundColor: 'var(--secondary)' }}
                        transition={{ duration: 0.15 }}
                        className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between rounded-lg px-1 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                            style={{ backgroundColor: `${asset.color}15`, color: asset.color }}
                          >
                            {asset.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">{asset.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                              {hideBalance ? '••••' : `${asset.balance.toFixed(4)} ${asset.symbol}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-foreground font-mono">
                            {hideBalance ? '••••' : `$${asset.currentValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                          </p>
                          <div className="flex items-center justify-end gap-1.5 mt-0.5">
                            <span className={`text-[9px] font-bold ${isUp ? 'text-success' : 'text-destructive'}`}>
                              {formattedChange}
                            </span>
                            <span className="text-[10px] bg-secondary text-primary font-bold px-2 py-0.5 rounded-full">{allocation}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            </div>
            
            <a href="/trade" className="text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1 mt-6">
              <span>View detailed wallet balances</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          {/* COL 2: Recent Transactions */}
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
              ) : (
                dbTransactions.map((tx, i) => {
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
          </motion.div>

          {/* COL 3: Watchlist & News */}
          <div className="space-y-6">
            
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
              <h3 className="font-bold text-lg text-foreground mb-6">Bloomberg Crypto</h3>
              <div className="space-y-4">
                {newsList.map((news, i) => (
                  <div key={i} className="border-l-2 border-primary/45 pl-3 py-1">
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold tracking-wider">{news.source} • {news.time}</p>
                    <a href="#" className="font-bold text-xs text-foreground hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                      {news.title}
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}
