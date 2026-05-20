import { useState, useMemo, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip 
} from 'recharts';
import { 
  Search, Star, ChevronUp, ChevronDown, Clock, ArrowDown, ArrowUp 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { fadeUp, scaleIn, staggerFast } from '../lib/animations';
import { useCryptoData } from '../hooks/useCryptoData';
import { formatPrice, formatVolume } from '../lib/crypto';
import LiveIndicator from '../components/LiveIndicator';

interface Pair {
  symbol: string;
  name: string;
  price: number;
  priceString: string;
  change: string;
  isUp: boolean;
  vol: string;
  open24h: string;
  high24h: string;
  low24h: string;
}

export default function Trade() {
  const shouldReduceMotion = useReducedMotion();
  const [selectedPairSymbol, setSelectedPairSymbol] = useState('BTC/USDT');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [amountInput, setAmountInput] = useState('');
  const [timeframe, setTimeframe] = useState('1D');
  const [bottomTab, setBottomTab] = useState<'trades' | 'orders' | 'history'>('trades');
  
  // Place Order button pulse trigger
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);

  // Live Crypto Data Hook (WebSocket enabled)
  const { coins, loading, wsConnected, source, lastUpdated } = useCryptoData();

  // Timestamp updated seconds ago count up
  const [secondsAgo, setSecondsAgo] = useState(0);
  useEffect(() => {
    if (!lastUpdated) return;
    setSecondsAgo(0);
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const pairs: Pair[] = useMemo(() => {
    const staticPairs = [
      { symbol: 'BTC/USDT', name: 'BTC', coinId: 'BTCUSDT' },
      { symbol: 'ETH/USDT', name: 'ETH', coinId: 'ETHUSDT' },
      { symbol: 'SOL/USDT', name: 'SOL', coinId: 'SOLUSDT' },
      { symbol: 'BNB/USDT', name: 'BNB', coinId: 'BNBUSDT' },
    ];

    return staticPairs.map(p => {
      const coin = coins.find(c => c.symbol === p.name);
      if (!coin) {
        // Fallback to static mock values
        if (p.coinId === 'BTCUSDT') return { symbol: 'BTC/USDT', name: 'BTC', price: 67234.56, priceString: '$67,234.56', change: '+2.34%', isUp: true, vol: '2.4B', open24h: '$65,712.00', high24h: '$67,890.00', low24h: '$65,210.00' };
        if (p.coinId === 'ETHUSDT') return { symbol: 'ETH/USDT', name: 'ETH', price: 3456.78, priceString: '$3,456.78', change: '-1.23%', isUp: false, vol: '890M', open24h: '$3,500.12', high24h: '$3,540.00', low24h: '$3,410.00' };
        if (p.coinId === 'SOLUSDT') return { symbol: 'SOL/USDT', name: 'SOL', price: 142.34, priceString: '$142.34', change: '+5.67%', isUp: true, vol: '234M', open24h: '$134.70', high24h: '$145.20', low24h: '$133.50' };
        return { symbol: 'BNB/USDT', name: 'BNB', price: 589.12, priceString: '$589.12', change: '+3.45%', isUp: true, vol: '456M', open24h: '$569.30', high24h: '$595.00', low24h: '$565.00' };
      }

      const isUp = coin.change24h >= 0;
      const changeString = `${isUp ? '+' : ''}${coin.change24h.toFixed(2)}%`;
      
      return {
        symbol: p.symbol,
        name: p.name,
        price: coin.price,
        priceString: `$${formatPrice(coin.price)}`,
        change: changeString,
        isUp,
        vol: formatVolume(coin.volume24h),
        open24h: `$${formatPrice(coin.price / (1 + coin.change24h / 100))}`,
        high24h: `$${formatPrice(coin.high24h)}`,
        low24h: `$${formatPrice(coin.low24h)}`,
      };
    });
  }, [coins]);

  const selectedPair = useMemo(() => {
    return pairs.find(p => p.symbol === selectedPairSymbol) || pairs[0];
  }, [selectedPairSymbol, pairs]);

  const activeCoin = useMemo(() => {
    return coins.find(c => c.symbol === selectedPair.symbol.split('/')[0]);
  }, [coins, selectedPair.symbol]);

  const [priceInput, setPriceInput] = useState('');
  
  // Set price input ONLY on selected pair changes
  useEffect(() => {
    const currentPrice = activeCoin ? activeCoin.price : selectedPair.price;
    setPriceInput(currentPrice.toFixed(4));
  }, [selectedPairSymbol]);

  const filteredPairs = pairs.filter(p => 
    p.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentPairPrice = activeCoin ? activeCoin.price : selectedPair.price;

  const chartData = [
    { name: '00:00', value: currentPairPrice - (currentPairPrice * 0.005) },
    { name: '04:00', value: currentPairPrice - (currentPairPrice * 0.002) },
    { name: '08:00', value: currentPairPrice - (currentPairPrice * 0.003) },
    { name: '12:00', value: currentPairPrice + (currentPairPrice * 0.004) },
    { name: '16:00', value: currentPairPrice - (currentPairPrice * 0.001) },
    { name: '20:00', value: currentPairPrice },
  ];

  const totalCost = useMemo(() => {
    const amt = parseFloat(amountInput);
    const prc = parseFloat(priceInput);
    if (isNaN(amt) || isNaN(prc)) return '0.00';
    return (amt * prc).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [amountInput, priceInput]);

  // Order Book: 8 rows of bids and asks from real Bybit bid/ask and spread
  const bids = useMemo(() => {
    if (!activeCoin) {
      const spreadVal = selectedPair.price * 0.0001;
      return Array.from({ length: 8 }, (_, i) => ({
        price: selectedPair.price - (i + 1) * spreadVal,
        amount: +(Math.random() * 2 + 0.1).toFixed(3),
      }));
    }
    const spread = activeCoin.ask - activeCoin.bid;
    return Array.from({ length: 8 }, (_, i) => ({
      price: activeCoin.bid - i * spread * 0.5,
      amount: +(Math.random() * 2 + 0.1).toFixed(3),
    }));
  }, [activeCoin, activeCoin?.price, selectedPair.price]);

  const asks = useMemo(() => {
    if (!activeCoin) {
      const spreadVal = selectedPair.price * 0.0001;
      return Array.from({ length: 8 }, (_, i) => ({
        price: selectedPair.price + (i + 1) * spreadVal,
        amount: +(Math.random() * 2 + 0.1).toFixed(3),
      })).reverse();
    }
    const spread = activeCoin.ask - activeCoin.bid;
    return Array.from({ length: 8 }, (_, i) => ({
      price: activeCoin.ask + i * spread * 0.5,
      amount: +(Math.random() * 2 + 0.1).toFixed(3),
    })).reverse();
  }, [activeCoin, activeCoin?.price, selectedPair.price]);

  // Live prepend recent trades logic (every 2s)
  interface TradeItem {
    id: number;
    price: number;
    amount: string;
    time: string;
    isBuy: boolean;
  }

  const [trades, setTrades] = useState<TradeItem[]>([]);

  useEffect(() => {
    const basePrice = activeCoin ? activeCoin.price : selectedPair.price;
    setTrades([
      { id: 1, price: basePrice - (basePrice * 0.0001), amount: '0.1450', time: '18:42:15', isBuy: true },
      { id: 2, price: basePrice + (basePrice * 0.0002), amount: '1.2040', time: '18:42:08', isBuy: false },
      { id: 3, price: basePrice - (basePrice * 0.00005), amount: '0.0530', time: '18:41:59', isBuy: true },
      { id: 4, price: basePrice + (basePrice * 0.0003), amount: '0.8800', time: '18:41:47', isBuy: false },
      { id: 5, price: basePrice - (basePrice * 0.00015), amount: '2.1500', time: '18:41:33', isBuy: true },
    ]);
  }, [selectedPair, activeCoin?.price]);

  useEffect(() => {
    const timer = setInterval(() => {
      const basePrice = activeCoin ? activeCoin.price : selectedPair.price;
      const isBuy = Math.random() > 0.45;
      const nudge = (Math.random() - 0.5) * (basePrice * 0.0003);
      const nextPrice = basePrice + nudge;
      const nextAmount = (Math.random() * 1.5 + 0.01).toFixed(4);
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const newTrade: TradeItem = {
        id: Date.now(),
        price: parseFloat(nextPrice.toFixed(2)),
        amount: nextAmount,
        time: timeStr,
        isBuy
      };

      setTrades(prev => [newTrade, ...prev.slice(0, 7)]);
    }, 2000);

    return () => clearInterval(timer);
  }, [selectedPair, activeCoin?.price]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput || parseFloat(amountInput) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!shouldReduceMotion) {
      setIsSubmitClicked(true);
      setTimeout(() => setIsSubmitClicked(false), 300);
    }

    toast.success(`${activeTab === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);
    setAmountInput('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation isPublic={false} />

      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* COL 1-3 — Trading Pairs sidebar */}
        <motion.div 
          initial={shouldReduceMotion ? {} : 'hidden'}
          animate={shouldReduceMotion ? {} : 'visible'}
          variants={fadeUp}
          className="lg:col-span-3 bg-card border border-border rounded-xl p-4 flex flex-col gap-4"
        >
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pairs..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
            />
          </div>

          {/* List of Pairs */}
          <motion.div 
            variants={shouldReduceMotion ? {} : staggerFast}
            className="flex-1 overflow-y-auto space-y-2 max-h-[600px] lg:max-h-none"
          >
            {filteredPairs.map((pair) => {
              const isSelected = pair.symbol === selectedPairSymbol;
              return (
                <motion.div
                  key={pair.symbol}
                  variants={shouldReduceMotion ? {} : fadeUp}
                  onClick={() => setSelectedPairSymbol(pair.symbol)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                    isSelected
                      ? 'bg-primary/10 border-primary/20'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  {/* Selected Pair Pop Indicator */}
                  <AnimatePresence>
                    {isSelected && !shouldReduceMotion && (
                      <motion.div 
                        layoutId="activePairIndicator"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 border border-primary rounded-lg pointer-events-none"
                      />
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-2 relative z-10">
                    <button className="text-muted-foreground hover:text-warning transition-colors cursor-pointer">
                      <Star className="w-4 h-4 fill-transparent" />
                    </button>
                    <div>
                      <p className="font-bold text-sm text-foreground">{pair.symbol}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Vol {pair.vol}</p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="font-bold text-sm text-foreground font-mono">{pair.priceString}</p>
                    <p className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${pair.isUp ? 'text-success' : 'text-destructive'}`}>
                      {pair.isUp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{pair.change}</span>
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* COL 4-9 — Chart area */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* Top bar */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-foreground">{selectedPair.symbol}</span>
              <LiveIndicator wsConnected={wsConnected} loading={loading} source={source} />
              
              <span className={`text-lg font-bold font-mono transition-colors duration-200 ${
                activeCoin 
                  ? (activeCoin.change24h >= 0 ? 'text-success' : 'text-destructive') 
                  : (selectedPair.isUp ? 'text-success' : 'text-destructive')
              }`}>
                ${activeCoin ? formatPrice(activeCoin.price) : formatPrice(selectedPair.price)}
              </span>

              <span className={`text-sm font-semibold flex items-center gap-0.5 ${
                activeCoin 
                  ? (activeCoin.change24h >= 0 ? 'text-success' : 'text-destructive') 
                  : (selectedPair.isUp ? 'text-success' : 'text-destructive')
              }`}>
                {activeCoin 
                  ? (activeCoin.change24h >= 0 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)
                  : (selectedPair.isUp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                <span>
                  {activeCoin 
                    ? `${activeCoin.change24h >= 0 ? '+' : ''}${activeCoin.change24h.toFixed(2)}%` 
                    : selectedPair.change}
                </span>
              </span>

              {lastUpdated && (
                <span className="text-xs text-muted-foreground font-medium ml-2">Updated {secondsAgo}s ago</span>
              )}
            </div>

            <div className="flex gap-4 text-xs font-mono">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-sans">24h Open</span>
                <span className="font-semibold text-foreground">
                  {activeCoin ? `$${formatPrice(activeCoin.price / (1 + activeCoin.change24h / 100))}` : selectedPair.open24h}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-sans">24h High</span>
                <span className="font-semibold text-foreground">
                  {activeCoin ? `$${formatPrice(activeCoin.high24h)}` : selectedPair.high24h}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-sans">24h Low</span>
                <span className="font-semibold text-foreground">
                  {activeCoin ? `$${formatPrice(activeCoin.low24h)}` : selectedPair.low24h}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-sans">24h Volume</span>
                <span className="font-semibold text-foreground">
                  {activeCoin ? formatVolume(activeCoin.volume24h) : selectedPair.vol}
                </span>
              </div>
            </div>
          </div>

          {/* Chart Card */}
          <motion.div 
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Price Chart</span>
              {/* Timeframe selectors */}
              <div className="flex bg-secondary p-1 rounded-lg gap-1">
                {['1H', '4H', '1D', '1W', '1M'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      timeframe === tf 
                        ? 'bg-background text-primary shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066ff" stopOpacity={0.3}/>
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
                    domain={['dataMin - 100', 'dataMax + 100']}
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
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorTrade)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bottom Tabs area */}
          <div className="bg-card border border-border rounded-xl p-4 flex-1 flex flex-col gap-4 min-h-[300px]">
            <div className="flex border-b border-border gap-6 relative">
              {[
                { id: 'trades', label: 'Recent Trades' },
                { id: 'orders', label: 'Open Orders' },
                { id: 'history', label: 'Order History' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setBottomTab(tab.id as any)}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer relative ${
                    bottomTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {bottomTab === tab.id && !shouldReduceMotion && (
                    <motion.div 
                      layoutId="bottomTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Bottom Tab Content */}
            <div className="flex-1 overflow-x-auto">
              {bottomTab === 'trades' && (
                <div className="w-full">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border/50">
                        <th className="pb-2">Price (USDT)</th>
                        <th className="pb-2">Amount ({selectedPair.name})</th>
                        <th className="pb-2 text-right">Time</th>
                      </tr>
                    </thead>
                  </table>
                  
                  {/* Dynamic pop prepend trade rows with AnimatePresence */}
                  <div className="relative">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {trades.map((trade) => (
                        <motion.div
                          key={trade.id}
                          initial={shouldReduceMotion ? {} : { opacity: 0, height: 0, y: -20 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="flex items-center justify-between py-2 border-b border-border/10 font-mono text-xs"
                        >
                          <div className={`flex items-center gap-1 w-1/3 text-left ${trade.isBuy ? 'text-success' : 'text-destructive'}`}>
                            {trade.isBuy ? <ArrowUp className="w-3.5 h-3.5 shrink-0" /> : <ArrowDown className="w-3.5 h-3.5 shrink-0" />}
                            <span>{trade.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="w-1/3 text-left text-foreground pl-2">{trade.amount}</div>
                          <div className="w-1/3 text-right text-muted-foreground">{trade.time}</div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {bottomTab === 'orders' && (
                <div className="divide-y divide-border/50 text-sm">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">BTC/USDT <span className="text-xs text-success font-semibold px-2 py-0.5 rounded bg-success/10 uppercase">Limit Buy</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Price: $66,500.00 • Amount: 0.5 BTC</p>
                    </div>
                    <button 
                      onClick={() => toast.success('Order cancelled')} 
                      className="text-xs text-destructive hover:underline font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">ETH/USDT <span className="text-xs text-destructive font-semibold px-2 py-0.5 rounded bg-destructive/10 uppercase">Limit Sell</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Price: $3,500.00 • Amount: 2.0 ETH (0.5 filled)</p>
                    </div>
                    <button 
                      onClick={() => toast.success('Order cancelled')} 
                      className="text-xs text-destructive hover:underline font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {bottomTab === 'history' && (
                <div className="py-8 text-center text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                  <p className="text-sm">No historical orders found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COL 10-12 — Order Book and Order Form */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Order Book Card */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Order Book</h3>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Spread {activeCoin && activeCoin.price ? ((asks[asks.length - 1]?.price - bids[0]?.price) / activeCoin.price * 100).toFixed(4) : '0.0100'}%
              </span>
            </div>
            
            <div className="space-y-3">
              {/* Asks (Red) */}
              <div className="space-y-1 font-mono text-xs">
                {asks.map((ask, i) => (
                  <div 
                    key={i} 
                    onClick={() => setPriceInput(ask.price.toFixed(4))}
                    className="flex justify-between text-destructive cursor-pointer hover:bg-destructive/5 px-1 rounded transition-colors"
                    title="Use this ask price"
                  >
                    <span>{formatPrice(ask.price)}</span>
                    <span className="text-muted-foreground">{ask.amount}</span>
                  </div>
                ))}
              </div>

              {/* Mid Price / Last Price */}
              <div 
                onClick={() => setPriceInput((activeCoin ? activeCoin.price : selectedPair.price).toFixed(4))}
                className="py-2 border-y border-border/50 text-center font-bold font-mono text-sm text-foreground bg-secondary/20 rounded-md cursor-pointer hover:bg-secondary/40 transition-colors"
                title="Use current spot trade price"
              >
                ${activeCoin ? formatPrice(activeCoin.price) : formatPrice(selectedPair.price)}
              </div>

              {/* Bids (Green) */}
              <div className="space-y-1 font-mono text-xs">
                {bids.map((bid, i) => (
                  <div 
                    key={i} 
                    onClick={() => setPriceInput(bid.price.toFixed(4))}
                    className="flex justify-between text-success cursor-pointer hover:bg-success/5 px-1 rounded transition-colors"
                    title="Use this bid price"
                  >
                    <span>{formatPrice(bid.price)}</span>
                    <span className="text-muted-foreground">{bid.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Form Card */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between flex-1">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              
              {/* Buy / Sell switch tab */}
              <div className="flex bg-secondary p-1 rounded-xl relative">
                <button
                  type="button"
                  onClick={() => setActiveTab('buy')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 cursor-pointer ${
                    activeTab === 'buy' ? 'text-success' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Buy
                  {activeTab === 'buy' && !shouldReduceMotion && (
                    <motion.div 
                      layoutId="orderBuySellIndicator"
                      className="absolute inset-0 bg-background rounded-lg shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sell')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 cursor-pointer ${
                    activeTab === 'sell' ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sell
                  {activeTab === 'sell' && !shouldReduceMotion && (
                    <motion.div 
                      layoutId="orderBuySellIndicator"
                      className="absolute inset-0 bg-background rounded-lg shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              </div>

              {/* Limit / Market tab */}
              <div className="flex bg-secondary p-1 rounded-lg relative">
                <button
                  type="button"
                  onClick={() => setOrderType('limit')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all relative z-10 cursor-pointer ${
                    orderType === 'limit' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Limit
                  {orderType === 'limit' && !shouldReduceMotion && (
                    <motion.div 
                      layoutId="orderTypeIndicator"
                      className="absolute inset-0 bg-background rounded-md shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('market')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all relative z-10 cursor-pointer ${
                    orderType === 'market' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Market
                  {orderType === 'market' && !shouldReduceMotion && (
                    <motion.div 
                      layoutId="orderTypeIndicator"
                      className="absolute inset-0 bg-background rounded-md shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                {orderType === 'limit' && (
                  <div>
                    <label htmlFor="order-price" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Limit Price (USDT)
                    </label>
                    <input
                      id="order-price"
                      type="number"
                      step="any"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                    />
                  </div>
                )}

                {orderType === 'market' && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Price (USDT)
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Market Price"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-secondary text-muted-foreground cursor-not-allowed transition-all font-semibold"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="order-amount" className="block text-xs font-semibold text-muted-foreground mb-1.5 flex justify-between">
                    <span>Amount ({selectedPair.name})</span>
                    <span className="text-[10px] text-primary hover:underline cursor-pointer" onClick={() => setAmountInput('0.5')}>MAX</span>
                  </label>
                  <input
                    id="order-amount"
                    type="number"
                    step="any"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all font-mono"
                  />
                </div>
              </div>

              {/* Total */}
              <div className="bg-secondary/50 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Total:</span>
                  <span className="font-bold text-foreground font-mono">{totalCost} USDT</span>
                </div>
              </div>

              {/* Place Order Button */}
              <motion.button
                type="submit"
                animate={isSubmitClicked ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
                className={`w-full py-3 text-white font-bold rounded-xl transition-all shadow-lg cursor-pointer ${
                  activeTab === 'buy'
                    ? 'bg-success hover:bg-success/95 shadow-success/15'
                    : 'bg-destructive hover:bg-destructive/95 shadow-destructive/15'
                }`}
              >
                <span>{activeTab === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}</span>
              </motion.button>
            </form>

            {/* Balance display */}
            <div className="mt-6 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>Available Balance:</span>
              <span className="font-semibold text-foreground">10,254.50 USDT</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
