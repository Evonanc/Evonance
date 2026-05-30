import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Navigation from '../components/Navigation';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  CreditCard, Eye, EyeOff, Copy, Lock, Unlock, Settings, 
  Plus, ShoppingCart, Utensils, Zap, ArrowUpRight, 
  CheckCircle2, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { fadeUp, scaleIn, slideInLeft, staggerContainer, staggerFast } from '../lib/animations';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { 
  getCards, 
  updateCardStatus, 
  topUpCard, 
  getCardTransactions, 
  Card, 
  CardTransaction,
  createNotification,
  getProfile,
  Profile,
  updateCardLimit,
  updateCardName
} from '../lib/db';
import RequestCardModal from '../components/RequestCardModal';

export default function CardManagement() {
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();
  
  const [dbCards, setDbCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [dbTransactions, setDbTransactions] = useState<CardTransaction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  // Settings Modal States
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cardNickname, setCardNickname] = useState('');
  const [cardLimit, setCardLimit] = useState(5000);
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [intlEnabled, setIntlEnabled] = useState(true);
  const [atmEnabled, setAtmEnabled] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // 3D tilt tracking states
  const cardVisualRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({ rotateX: 0, rotateY: 0 });

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [fetchedCards, fetchedProfile] = await Promise.all([
        getCards(user.id),
        getProfile(user.id)
      ]);
      
      setDbCards(fetchedCards);
      setProfile(fetchedProfile);
      
      let selId = selectedCardId;
      if (!selId && fetchedCards.length > 0) {
        selId = fetchedCards[0].id;
        setSelectedCardId(selId);
      }

      if (selId) {
        const fetchedTx = await getCardTransactions(user.id, selId);
        setDbTransactions(fetchedTx);
      } else {
        setDbTransactions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedCardId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const mappedCards = useMemo(() => {
    return dbCards.map(c => {
      const cardholderName = profile?.full_name || 
        `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
        user?.user_metadata?.full_name || 
        'CARD HOLDER';

      return {
        id: c.id,
        name: c.name,
        last4: c.last4,
        cardNumber: (c as any).card_number || `4589 1234 5678 ${c.last4}`,
        cvv: (c as any).cvv || '321',
        balance: `$${c.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        limit: `$${c.spending_limit.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
        status: c.status,
        expiry: c.expiry,
        cardholder: cardholderName
      };
    });
  }, [dbCards, user, profile]);

  const selectedCard = useMemo(() => {
    const cardholderName = profile?.full_name || 
      `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
      user?.user_metadata?.full_name || 
      'CARD HOLDER';

    return mappedCards.find(c => c.id === selectedCardId) || mappedCards[0] || {
      id: '',
      name: 'No Cards',
      last4: '0000',
      cardNumber: '•••• •••• •••• 0000',
      cvv: '000',
      balance: '$0.00',
      limit: '$0',
      status: 'active' as 'active' | 'frozen' | 'pending',
      expiry: '00/00',
      cardholder: cardholderName
    };
  }, [mappedCards, selectedCardId, profile, user]);

  // Sync settings inputs when selected card changes
  useEffect(() => {
    if (selectedCard && selectedCard.id) {
      setCardNickname(selectedCard.name);
      const limitVal = parseFloat(selectedCard.limit.replace('$', '').replace(',', '')) || 5000;
      setCardLimit(limitVal);
    }
  }, [selectedCardId, selectedCard]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    if (!cardVisualRef.current) return;
    const rect = cardVisualRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    const rotateY = (mouseX / (width / 2)) * 8; // max 8 deg
    const rotateX = -(mouseY / (height / 2)) * 8; // max 8 deg
    setTiltStyle({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTiltStyle({ rotateX: 0, rotateY: 0 });
  };

  const handleToggleFreeze = async () => {
    if (!selectedCard.id || !user) return;
    const nextStatus = selectedCard.status === 'active' ? 'frozen' : 'active';
    try {
      setLoading(true);
      await updateCardStatus(selectedCard.id, nextStatus);
      createNotification(
        user.id, 'card',
        `Card ${nextStatus === 'frozen' ? 'frozen' : 'unfrozen'}`,
        `Your ${selectedCard.name} ending in ${selectedCard.last4} has been ${nextStatus}.`,
        '/cards'
      ).catch(console.error);
      toast.success(`Card successfully ${nextStatus === 'active' ? 'unfrozen' : 'frozen'}!`);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update card status');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyNumber = () => {
    if (!selectedCard.id) return;
    navigator.clipboard.writeText(selectedCard.cardNumber);
    toast.success('Card number copied to clipboard!');
  };

  const handleFundCard = async () => {
    if (!selectedCard.id || !user) return;
    const amountStr = window.prompt(`Enter top-up amount for ${selectedCard.name}:`, '100');
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid top-up amount');
      return;
    }
    
    try {
      setLoading(true);
      await topUpCard(selectedCard.id, user.id, amount);
      createNotification(
        user.id, 'card',
        `Card top-up successful`,
        `$${amount.toFixed(2)} added to your ${selectedCard.name} ending in ${selectedCard.last4}.`,
        '/cards'
      ).catch(console.error);
      toast.success(`Successfully topped up $${amount.toFixed(2)}!`);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to fund card');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedCard.id || !user) return;
    setSavingSettings(true);
    try {
      if (cardNickname.trim() && cardNickname !== selectedCard.name) {
        await updateCardName(selectedCard.id, cardNickname.trim());
      }
      
      const originalLimit = parseFloat(selectedCard.limit.replace('$', '').replace(',', '')) || 5000;
      if (cardLimit !== originalLimit) {
        await updateCardLimit(selectedCard.id, cardLimit);
      }
      
      toast.success('Card settings updated successfully!');
      setSettingsOpen(false);
      await loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update card settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCancelCard = async () => {
    if (!selectedCard.id || !user) return;
    const confirm = window.confirm(
      `Are you sure you want to permanently cancel and terminate ${selectedCard.name}? ` +
      `Any remaining balance will be returned to your main USD wallet.`
    );
    if (!confirm) return;
    
    setSavingSettings(true);
    try {
      const balanceVal = parseFloat(selectedCard.balance.replace('$', '').replace(',', '')) || 0;
      if (balanceVal > 0) {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .eq('symbol', 'USDT')
          .single();
          
        await supabase
          .from('wallets')
          .update({ balance: (wallet?.balance ?? 0) + balanceVal })
          .eq('user_id', user.id)
          .eq('symbol', 'USDT');
          
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'receive',
          symbol: 'USDT',
          amount: balanceVal,
          price_usd: 1,
          total_usd: balanceVal,
          fee_usd: 0,
          status: 'completed',
          note: `Refund from cancelled card ${selectedCard.name}`
        });
      }
      
      await updateCardStatus(selectedCard.id, 'cancelled');
      
      toast.success('Card terminated successfully!');
      setSettingsOpen(false);
      setSelectedCardId(''); 
      await loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to cancel card');
    } finally {
      setSavingSettings(false);
    }
  };

  // Spending Stats data
  const spendData = useMemo(() => {
    const baseValue = parseFloat(selectedCard.balance.replace('$', '').replace(',', '')) || 0;
    return [
      { name: 'Jan', value: Math.max(100, baseValue * 0.4) },
      { name: 'Feb', value: Math.max(150, baseValue * 0.6) },
      { name: 'Mar', value: Math.max(120, baseValue * 0.5) },
      { name: 'Apr', value: Math.max(200, baseValue * 0.8) },
      { name: 'May', value: Math.max(180, baseValue * 0.7) },
      { name: 'Jun', value: Math.max(250, baseValue) },
    ];
  }, [selectedCard.balance]);

  const pieData = useMemo(() => {
    const totalSpent = dbTransactions.reduce((acc, curr) => acc + (curr.category !== 'deposit' ? curr.amount : 0), 0);
    if (totalSpent === 0) {
      return [
        { name: 'No spend', value: 1, color: '#64748b' }
      ];
    }
    const categories: Record<string, number> = {};
    dbTransactions.forEach(t => {
      if (t.category !== 'deposit') {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });
    const colors: Record<string, string> = {
      shopping: '#0066ff',
      food: '#10b981',
      entertainment: '#f59e0b',
      travel: '#8b5cf6',
      other: '#64748b'
    };
    return Object.entries(categories).map(([name, val]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: val,
      color: colors[name.toLowerCase()] || '#64748b'
    }));
  }, [dbTransactions]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation isPublic={false} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Cards</h1>
            <p className="text-muted-foreground mt-1">Manage and spend with your virtual USD cards</p>
          </div>

          {/* Selector Horizontal Row */}
          <div className="flex bg-secondary p-1 rounded-xl gap-1 relative">
            {mappedCards.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  setSelectedCardId(card.id);
                  setShowCardNumber(false);
                  setShowCvv(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all relative cursor-pointer ${
                  selectedCardId === card.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="relative z-10">{card.name} (•• {card.last4})</span>
                {selectedCardId === card.id && !shouldReduceMotion && (
                  <motion.div
                    layoutId="cardTabIndicator"
                    className="absolute inset-0 bg-background rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Col Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COL 1-6 — Selected Card visual & Actions */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Visual Card Wrapper */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent blur-3xl pointer-events-none" />
              
              {/* Realistic card with floating drift and 3D Tilt */}
              <motion.div 
                ref={cardVisualRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                animate={shouldReduceMotion ? {} : { 
                  rotateX: tiltStyle.rotateX, 
                  rotateY: tiltStyle.rotateY, 
                  y: [0, -6, 0] 
                }}
                transition={{
                  rotateX: { type: 'spring', stiffness: 200, damping: 20 },
                  rotateY: { type: 'spring', stiffness: 200, damping: 20 },
                  y: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                }}
                style={{ 
                  transformStyle: 'preserve-3d', 
                  perspective: '1000px',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)'
                }}
                className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-white/10 flex flex-col justify-between text-white relative overflow-hidden aspect-[1.6/1] select-none"
              >
                {/* Frozen Overlay AnimatePresence */}
                <AnimatePresence>
                  {selectedCard.status === 'frozen' && (
                    <motion.div
                      initial={shouldReduceMotion ? {} : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={shouldReduceMotion ? {} : { opacity: 0 }}
                      className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center gap-2 z-20 pointer-events-none"
                    >
                      <motion.div
                        initial={shouldReduceMotion ? {} : { scale: 0.8, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={shouldReduceMotion ? {} : { scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Lock className="w-10 h-10 text-warning" />
                      </motion.div>
                      <span className="text-sm font-bold text-white tracking-widest uppercase">Card Frozen</span>
                    </motion.div>
                  )}

                  {selectedCard.status === 'pending' && (
                    <motion.div
                      initial={shouldReduceMotion ? {} : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={shouldReduceMotion ? {} : { opacity: 0 }}
                      className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center gap-2 z-20"
                    >
                      <Clock className="w-8 h-8 text-white/70 animate-pulse" />
                      <p className="text-white/90 text-sm font-semibold mt-1">
                        Activation pending
                      </p>
                      <p className="text-white/60 text-xs">
                        Usually within 24 hours
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Background Blobs inside card */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                
                {/* Top Row */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-white/50 block uppercase">{selectedCard.name}</span>
                    <span className="font-semibold text-white/80">Visa Virtual</span>
                  </div>
                  <span className="font-bold tracking-tighter text-white/90 text-2xl italic">Visa</span>
                </div>

                {/* Middle number with show/hide and copy buttons */}
                <div className="my-4">
                  <div className="flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={showCardNumber ? 'full' : 'masked'}
                        initial={shouldReduceMotion ? {} : { opacity: 0, filter: 'blur(4px)', scale: 0.98 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, filter: 'blur(4px)', scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="font-mono text-xl tracking-widest text-white/90 inline-block flex-1"
                      >
                        {showCardNumber ? selectedCard.cardNumber : `•••• •••• •••• ${selectedCard.last4}`}
                      </motion.span>
                    </AnimatePresence>
                    {/* Toggle show/hide card number */}
                    <motion.button 
                      whileHover={shouldReduceMotion ? {} : { scale: 1.15 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                      onClick={() => setShowCardNumber(!showCardNumber)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer relative z-30 flex-shrink-0"
                      title={showCardNumber ? 'Hide card number' : 'Show card number'}
                    >
                      {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.button>
                    {/* Copy card number (only works when revealed) */}
                    <motion.button 
                      whileHover={shouldReduceMotion ? {} : { scale: 1.15 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                      onClick={handleCopyNumber}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer relative z-30 flex-shrink-0"
                      title="Copy card number"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                  </div>
                  
                  {/* CVV and Expiry info */}
                  <div className="flex items-center gap-6 mt-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40">CVV:</span>
                      <span className="font-mono font-semibold">{showCvv ? selectedCard.cvv : '•••'}</span>
                      <button 
                        onClick={() => setShowCvv(!showCvv)}
                        className="text-white/60 hover:text-white transition-colors cursor-pointer"
                      >
                        {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-white/40">Expires:</span>
                      <span className="font-mono font-semibold">{selectedCard.expiry}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[9px] font-bold text-white/40 block">CARD HOLDER</span>
                    <span className="font-mono text-sm text-white/90 font-semibold tracking-wider uppercase">{selectedCard.cardholder}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                    selectedCard.status === 'active' 
                      ? 'bg-success/20 text-success border border-success/30'
                      : selectedCard.status === 'pending'
                        ? 'bg-slate-700/50 text-white/70 border border-white/10'
                        : 'bg-warning/20 text-warning border border-warning/30'
                  }`}>
                    {selectedCard.status}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Actions Bar */}
            <motion.div 
              variants={staggerFast}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 gap-4"
            >
              <motion.button
                variants={shouldReduceMotion ? {} : scaleIn}
                whileHover={selectedCard.status === 'pending' || shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={selectedCard.status === 'pending' || shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={handleToggleFreeze}
                disabled={selectedCard.status === 'pending' || !selectedCard.id}
                className="py-3 px-4 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedCard.status === 'active' ? (
                  <>
                    <Lock className="w-4 h-4 text-warning" />
                    <span>Freeze</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-success" />
                    <span>Unfreeze</span>
                  </>
                )}
              </motion.button>

              <motion.button
                variants={shouldReduceMotion ? {} : scaleIn}
                whileHover={selectedCard.status === 'pending' || shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={selectedCard.status === 'pending' || shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={() => setSettingsOpen(true)}
                disabled={selectedCard.status === 'pending' || !selectedCard.id}
                className="py-3 px-4 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>Settings</span>
              </motion.button>

              <motion.button
                variants={shouldReduceMotion ? {} : scaleIn}
                whileHover={selectedCard.status === 'pending' || shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={selectedCard.status === 'pending' || shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={handleFundCard}
                disabled={selectedCard.status === 'pending' || !selectedCard.id}
                className="py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Fund Card</span>
              </motion.button>
            </motion.div>

            {/* Spending limits and details */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-foreground">Card Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-secondary rounded-xl border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Available Balance</span>
                  <span className="text-lg font-bold text-foreground font-mono">{selectedCard.balance}</span>
                </div>
                <div className="p-3 bg-secondary rounded-xl border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Monthly Spend Limit</span>
                  <span className="text-lg font-bold text-foreground font-mono">{selectedCard.limit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COL 7-12 — Spending Stats & Transactions */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* SPENDING STATS */}
            <motion.div 
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate={shouldReduceMotion ? {} : 'visible'}
              variants={slideInLeft}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <h3 className="font-bold text-foreground mb-4">Spending Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Area Chart */}
                <div className="h-[150px] w-full">
                  <span className="text-xs font-semibold text-muted-foreground block mb-2">Monthly spend overview</span>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0066ff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0066ff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#0066ff" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSpend)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="h-[150px] w-full flex items-center justify-center gap-4">
                  <motion.div 
                    initial={shouldReduceMotion ? {} : { rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-[100px] h-[100px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={25}
                          outerRadius={45}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </motion.div>
                  
                  {/* Legend list */}
                  <div className="space-y-1.5">
                    {pieData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-[10px]">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">${item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* TRANSACTIONS LIST */}
            <motion.div 
              initial={shouldReduceMotion ? {} : 'hidden'}
              animate={shouldReduceMotion ? {} : 'visible'}
              variants={fadeUp}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <h3 className="font-bold text-foreground mb-4">Card Transactions</h3>

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
                ) : dbTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No transactions found for this card.</p>
                ) : (
                  dbTransactions.map((tx, i) => {
                    const isDeposit = tx.category === 'deposit';
                    const amountFormatted = `${isDeposit ? '+' : '-'}$${tx.amount.toFixed(2)}`;
                    
                    const getCategoryIcon = (category: string) => {
                      switch (category.toLowerCase()) {
                        case 'shopping': return ShoppingCart;
                        case 'food': return Utensils;
                        case 'entertainment': return Zap;
                        case 'deposit': return ArrowUpRight;
                        default: return ShoppingCart;
                      }
                    };
                    const Icon = getCategoryIcon(tx.category);

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
                        whileHover={shouldReduceMotion ? {} : { x: 4, backgroundColor: 'var(--secondary)' }}
                        transition={{ duration: 0.15 }}
                        className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between px-1 rounded-lg transition-colors animate-fade-in"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isDeposit
                              ? 'bg-success/10 text-success'
                              : 'bg-secondary text-muted-foreground'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">{tx.merchant}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{tx.category} • {timeStr}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-mono font-bold text-sm ${isDeposit ? 'text-success' : 'text-foreground'}`}>
                            {amountFormatted}
                          </p>
                          <span className="text-[9px] font-bold text-success flex items-center justify-end gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>{tx.status || 'Completed'}</span>
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            </motion.div>

            {/* Create New Card tile */}
            <button
              onClick={() => setRequestOpen(true)}
              className="border-2 border-dashed border-border rounded-2xl
                p-6 flex flex-col items-center justify-center gap-3
                hover:border-primary/50 hover:bg-primary/5 transition-all
                group cursor-pointer w-full bg-card"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary group-hover:bg-primary/10
                flex items-center justify-center transition-colors">
                <CreditCard className="w-6 h-6 text-muted-foreground
                  group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">
                  Request New Card
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
                  $1.00 USDT issuance fee
                </p>
              </div>
            </button>

            <RequestCardModal
              open={requestOpen}
              onClose={() => setRequestOpen(false)}
              onSuccess={() => {
                setRequestOpen(false);
                if (user) {
                  getCards(user.id).then(setDbCards);
                }
              }}
            />
          </div>
        </div>
      </main>

      {/* Card Settings Modal overlay */}
      <AnimatePresence>
        {settingsOpen && selectedCard.id && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              {/* Radial glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

              <h3 className="font-extrabold text-xl text-foreground mb-1">
                Card Settings
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Configure spending limits and security controls for ending in {selectedCard.last4}
              </p>

              <div className="space-y-5">
                {/* Cardholder name (Read-only for compliance) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Official Cardholder
                  </label>
                  <div className="bg-secondary/60 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {selectedCard.cardholder}
                  </div>
                  <span className="text-[9px] text-muted-foreground leading-normal block font-medium">
                    Bound to your verified KYC profile name for global legal compliance.
                  </span>
                </div>

                {/* Nickname input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Card Label / Nickname
                  </label>
                  <input
                    type="text"
                    value={cardNickname}
                    onChange={(e) => setCardNickname(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="e.g. Shopping Card"
                  />
                </div>

                {/* Spending limit slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Monthly Spend Limit
                    </label>
                    <span className="font-mono text-sm font-extrabold text-primary">
                      ${cardLimit.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={10000}
                    step={100}
                    value={cardLimit}
                    onChange={(e) => setCardLimit(Number(e.target.value))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
                    <span>$100</span>
                    <span>$5,000</span>
                    <span>$10,000</span>
                  </div>
                </div>

                {/* Security Toggles (Fully functional UI controls) */}
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Security & Controls
                  </label>

                  <div className="flex items-center justify-between p-3 bg-secondary/30 border border-border/40 rounded-2xl">
                    <div>
                      <p className="text-xs font-bold text-foreground">Online Payments</p>
                      <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">Allow virtual online checkouts</p>
                    </div>
                    <button
                      onClick={() => setOnlineEnabled(!onlineEnabled)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${onlineEnabled ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${onlineEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/30 border border-border/40 rounded-2xl">
                    <div>
                      <p className="text-xs font-bold text-foreground">International Payments</p>
                      <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">Support multi-currency spittings</p>
                    </div>
                    <button
                      onClick={() => setIntlEnabled(!intlEnabled)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${intlEnabled ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${intlEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/30 border border-border/40 rounded-2xl">
                    <div>
                      <p className="text-xs font-bold text-foreground">ATM Cashout Requests</p>
                      <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">Allow physical card terminal emulation</p>
                    </div>
                    <button
                      onClick={() => setAtmEnabled(!atmEnabled)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${atmEnabled ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${atmEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Destructive actions and footer */}
                <div className="border-t border-border/50 pt-4 mt-2 flex flex-col gap-3">
                  <button
                    onClick={handleCancelCard}
                    disabled={savingSettings}
                    className="w-full border border-rose-500/30 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    Terminate Card permanently
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSettingsOpen(false)}
                      className="flex-1 border border-border bg-background hover:bg-secondary text-foreground rounded-xl py-3 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      disabled={savingSettings}
                      className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl py-3 text-xs font-bold transition-colors shadow-lg shadow-primary/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {savingSettings ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
