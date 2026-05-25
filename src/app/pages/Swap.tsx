import { useState, useMemo, useEffect, useCallback } from 'react';
import Navigation from '../components/Navigation';
import { 
  Settings, ArrowDownUp, Zap, Info, ChevronDown, Check 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { fadeUp, fadeIn, slideInLeft, slideInRight, staggerContainer } from '../lib/animations';
import { useCryptoData } from '../hooks/useCryptoData';
import { useAuth } from '../hooks/useAuth';
import { getWallets, upsertWallet, addTransaction, Wallet, createNotification } from '../lib/db';

interface Token {
  symbol: string;
  name: string;
  icon: string;
  color: string;
  balance: number;
  price: number;
}

export default function Swap() {
  const shouldReduceMotion = useReducedMotion();
  const { coins } = useCryptoData();
  const { user } = useAuth();
  
  const [dbWallets, setDbWallets] = useState<Wallet[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWallets = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const fetchedWallets = await getWallets(user.id);
      setDbWallets(fetchedWallets);
      setWallets(fetchedWallets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  useEffect(() => {
    if (!user) return;
    getWallets(user.id).then(setWallets);
  }, [user]);

  const getBalance = useCallback((symbol: string) =>
    wallets.find(w => w.symbol === symbol)?.balance ?? 0,
  [wallets]);

  const tokens: Token[] = useMemo(() => {
    const staticTokens = [
      { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: '#f7931a', balance: 0, defaultPrice: 67234.56 },
      { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: '#627eea', balance: 0, defaultPrice: 3456.78 },
      { symbol: 'SOL', name: 'Solana', icon: 'S', color: '#00d4aa', balance: 0, defaultPrice: 142.34 },
      { symbol: 'BNB', name: 'BNB', icon: 'B', color: '#f3ba2f', balance: 0, defaultPrice: 589.12 },
      { symbol: 'USDT', name: 'Tether', icon: '₮', color: '#26a17b', balance: 0, defaultPrice: 1.00 },
      { symbol: 'USDC', name: 'USD Coin', icon: '$', color: '#2775ca', balance: 0, defaultPrice: 1.00 },
    ];

    return staticTokens.map(t => {
      const coin = coins.find(c => c.symbol === t.symbol);
      const dbWallet = dbWallets.find(w => w.symbol === t.symbol);
      const balance = dbWallet ? dbWallet.balance : 0;
      return {
        symbol: t.symbol,
        name: t.name,
        icon: t.icon,
        color: t.color,
        balance,
        price: t.symbol === 'USDT' || t.symbol === 'USDC' ? 1.00 : (coin ? coin.price : t.defaultPrice)
      };
    });
  }, [coins, dbWallets]);

  const [fromTokenSymbol, setFromTokenSymbol] = useState('ETH');
  const [toTokenSymbol, setToTokenSymbol] = useState('BTC');
  const [fromAmount, setFromAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5%');
  const [slippageOpen, setSlippageOpen] = useState(false);
  
  // Swap button rotation key trigger
  const [swapRotateTrigger, setSwapRotateTrigger] = useState(false);

  // Modal selectors
  const [selectorOpen, setSelectorOpen] = useState<'from' | 'to' | null>(null);

  const fromToken = useMemo(() => tokens.find(t => t.symbol === fromTokenSymbol) || tokens[1], [fromTokenSymbol, tokens]);
  const toToken = useMemo(() => tokens.find(t => t.symbol === toTokenSymbol) || tokens[0], [toTokenSymbol, tokens]);

  // Swap directional exchange
  const handleSwapTokens = useCallback(() => {
    if (!shouldReduceMotion) {
      setSwapRotateTrigger(prev => !prev);
    }
    const temp = fromTokenSymbol;
    setFromTokenSymbol(toTokenSymbol);
    setToTokenSymbol(temp);
    setFromAmount('');
  }, [shouldReduceMotion, fromTokenSymbol, toTokenSymbol]);

  const calculatedToAmount = useMemo(() => {
    const amt = parseFloat(fromAmount);
    if (isNaN(amt) || amt <= 0) return '0.00';
    const rate = fromToken.price / toToken.price;
    const output = amt * rate;
    return output.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }, [fromAmount, fromToken.price, toToken.price]);

  const fromUSDValue = useMemo(() => {
    const amt = parseFloat(fromAmount);
    if (isNaN(amt) || amt <= 0) return null;
    return `~$${(amt * fromToken.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [fromAmount, fromToken.price]);

  const rate = useMemo(() => {
    const ratio = fromToken.price / toToken.price;
    return `1 ${fromToken.symbol} = ${ratio.toFixed(6)} ${toToken.symbol}`;
  }, [fromToken, toToken]);

  const handleSwapNow = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to swap tokens');
      return;
    }
    const amt = parseFloat(fromAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (parseFloat(fromAmount) > getBalance(fromToken.symbol)) {
      toast.error(`Insufficient ${fromToken.symbol} balance`);
      return;
    }
    
    try {
      setLoading(true);
      const outAmt = parseFloat(calculatedToAmount.replace(/,/g, ''));
      
      const sourceWallet = dbWallets.find(w => w.symbol === fromTokenSymbol);
      const destWallet = dbWallets.find(w => w.symbol === toTokenSymbol);
      
      const newSourceBalance = (sourceWallet?.balance ?? 0) - amt;
      const newDestBalance = (destWallet?.balance ?? 0) + outAmt;
      
      // Update source wallet
      await upsertWallet(
        user.id,
        fromTokenSymbol,
        fromToken.name,
        newSourceBalance,
        sourceWallet?.avg_buy_price ?? fromToken.price
      );
      
      // Update destination wallet
      await upsertWallet(
        user.id,
        toTokenSymbol,
        toToken.name,
        newDestBalance,
        toToken.price
      );
      
      // Insert transaction record
      const totalUsd = amt * fromToken.price;
      await addTransaction(user.id, {
        type: 'swap',
        symbol: fromTokenSymbol,
        amount: amt,
        price_usd: fromToken.price,
        total_usd: totalUsd,
        fee_usd: totalUsd * 0.001,
        status: 'completed',
        note: `Swapped ${amt} ${fromTokenSymbol} to ${outAmt.toFixed(4)} ${toTokenSymbol}`
      });
      createNotification(
        user.id, 'swap',
        `Swap completed`,
        `Swapped ${amt} ${fromToken.symbol} → ${outAmt.toFixed(6)} ${toToken.symbol}`,
        '/swap'
      ).catch(console.error);
      
      toast.success(`Successfully swapped ${amt} ${fromTokenSymbol} to ${outAmt.toFixed(4)} ${toTokenSymbol}!`);
      setFromAmount('');
      await loadWallets();
    } catch (err) {
      console.error(err);
      toast.error('Swap failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    user,
    fromAmount,
    getBalance,
    fromToken,
    toToken,
    calculatedToAmount,
    dbWallets,
    fromTokenSymbol,
    toTokenSymbol,
    loadWallets,
  ]);


  const selectToken = useCallback((symbol: string) => {
    if (selectorOpen === 'from') {
      if (symbol === toTokenSymbol) {
        setToTokenSymbol(fromTokenSymbol);
      }
      setFromTokenSymbol(symbol);
    } else if (selectorOpen === 'to') {
      if (symbol === fromTokenSymbol) {
        setFromTokenSymbol(toTokenSymbol);
      }
      setToTokenSymbol(symbol);
    }
    setSelectorOpen(null);
  }, [selectorOpen, fromTokenSymbol, toTokenSymbol]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation isPublic={false} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Swap</h1>
          <p className="text-muted-foreground mt-1">Exchange cryptocurrencies instantly at the best rates</p>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT — Exchange Card */}
          <motion.div 
            initial={shouldReduceMotion ? {} : 'hidden'}
            animate={shouldReduceMotion ? {} : 'visible'}
            variants={slideInLeft}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Exchange</h2>
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 8 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                  onClick={() => setSlippageOpen(!slippageOpen)}
                  className={`p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer ${
                    slippageOpen ? 'bg-secondary text-primary' : ''
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Slippage Panel */}
              <AnimatePresence>
                {slippageOpen && (
                  <motion.div 
                    initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                    className="p-4 bg-secondary rounded-xl space-y-3 border border-border overflow-hidden"
                  >
                    <span className="text-xs font-semibold text-muted-foreground block">Transaction Slippage Tolerance</span>
                    <div className="flex gap-2">
                      {['0.1%', '0.5%', '1.0%'].map((percent) => (
                        <motion.button
                          key={percent}
                          whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                          whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                          onClick={() => setSlippage(percent)}
                          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            slippage === percent
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-background hover:bg-background/80 text-foreground'
                          }`}
                        >
                          {percent}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* FROM Token selector container */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">From</span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    Balance: {getBalance(fromToken.symbol).toFixed(4)} {fromToken.symbol}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* Selector button */}
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    onClick={() => setSelectorOpen('from')}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 px-3 py-2 rounded-xl transition-all font-bold text-foreground cursor-pointer shrink-0"
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ backgroundColor: fromToken.color }}
                    >
                      {fromToken.icon}
                    </div>
                    <span>{fromToken.symbol}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" style={{ transform: selectorOpen === 'from' ? 'rotate(180deg)' : 'none' }} />
                  </motion.button>

                  {/* Input container */}
                  <div className="flex-1 flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="w-full text-right bg-transparent text-2xl font-bold focus:outline-none placeholder-muted-foreground font-mono"
                      />
                      <button 
                        onClick={() => setFromAmount(getBalance(fromToken.symbol).toString())}
                        className="px-2.5 py-1 text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all cursor-pointer"
                      >
                        MAX
                      </button>
                    </div>
                    
                    {/* Animate USD Value Entrance */}
                    <div className="h-4">
                      <AnimatePresence>
                        {fromUSDValue && (
                          <motion.span 
                            initial={shouldReduceMotion ? {} : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={shouldReduceMotion ? {} : { opacity: 0, y: 6 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs text-muted-foreground block text-right font-mono"
                          >
                            {fromUSDValue}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Swap direction button */}
              <div className="flex justify-center -my-3 z-10 relative">
                <motion.button
                  animate={shouldReduceMotion ? {} : { rotate: swapRotateTrigger ? 180 : 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  onClick={handleSwapTokens}
                  className="w-10 h-10 rounded-full border border-border bg-background hover:bg-secondary text-primary flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-105"
                >
                  <ArrowDownUp className="w-5 h-5" />
                </motion.button>
              </div>

              {/* TO Token selector container */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">To</span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    Balance: {getBalance(toToken.symbol).toFixed(4)} {toToken.symbol}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* Selector button */}
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    onClick={() => setSelectorOpen('to')}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 px-3 py-2 rounded-xl transition-all font-bold text-foreground cursor-pointer shrink-0"
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ backgroundColor: toToken.color }}
                    >
                      {toToken.icon}
                    </div>
                    <span>{toToken.symbol}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" style={{ transform: selectorOpen === 'to' ? 'rotate(180deg)' : 'none' }} />
                  </motion.button>

                  <div className="flex-1 text-right">
                    <p className="text-2xl font-bold text-foreground font-mono">{calculatedToAmount}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {fromUSDValue ? fromUSDValue : '~$0.00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rate & Route Card */}
              <div className="p-4 bg-secondary/50 rounded-xl space-y-2 border border-border/40 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="font-semibold text-foreground font-mono">{rate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Minimum Received</span>
                  <span className="font-semibold text-foreground font-mono">
                    {calculatedToAmount} {toToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="text-success font-semibold">Free (EVONANCE Swap)</span>
                </div>
              </div>

              {/* Swap Button */}
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
                onClick={handleSwapNow}
                className="w-full py-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Swap Tokens</span>
              </motion.button>

            </div>
          </motion.div>

          {/* RIGHT — Info and Route Details */}
          <motion.div 
            initial={shouldReduceMotion ? {} : 'hidden'}
            animate={shouldReduceMotion ? {} : 'visible'}
            variants={slideInRight}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <span>Why Swap on EVONANCE?</span>
              </h3>
              
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Zero Slippage Guarantee</p>
                  <p>Our hybrid routing algorithm matches your swap request with instant institutional liquidity pools for maximum rate execution.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">No Hidden Fees</p>
                  <p>Unlike standard exchanges, EVONANCE doesn't charge gas or platform markup fees for swap balances.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-foreground">Multi-Path Routing</p>
                  <p>We split transactions dynamically across multiple order path structures to minimize pricing spread impact.</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* SELECTOR DIALOG BACKDROP MODALS */}
      <AnimatePresence>
        {selectorOpen && (
          <motion.div 
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? {} : { opacity: 0 }}
            onClick={() => setSelectorOpen(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={shouldReduceMotion ? {} : { scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative overflow-hidden"
            >
              <h3 className="font-bold text-lg text-foreground">Select a Token</h3>
              
              <div className="divide-y divide-border/60 max-h-[300px] overflow-y-auto">
                {tokens.map((t) => (
                  <button
                    key={t.symbol}
                    onClick={() => selectToken(t.symbol)}
                    className="w-full flex items-center justify-between py-3 hover:bg-secondary rounded-lg px-2 transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-white font-bold"
                        style={{ backgroundColor: t.color }}
                      >
                        {t.icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{t.symbol}</p>
                        <p className="text-xs text-muted-foreground">{t.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-sm text-foreground font-mono">
                        {t.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        ~${(t.balance * t.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
