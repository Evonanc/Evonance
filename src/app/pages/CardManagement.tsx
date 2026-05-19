import { useState, useRef } from 'react';
import Navigation from '../components/Navigation';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  CreditCard, Eye, EyeOff, Copy, Lock, Unlock, Settings, 
  Plus, ShoppingCart, Utensils, Zap, ArrowUpRight, 
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { fadeUp, scaleIn, slideInLeft, staggerContainer, staggerFast } from '../lib/animations';

interface CardData {
  id: string;
  name: string;
  last4: string;
  cardNumber: string;
  cvv: string;
  balance: string;
  limit: string;
  status: 'active' | 'frozen';
  expiry: string;
  cardholder: string;
}

export default function CardManagement() {
  const shouldReduceMotion = useReducedMotion();
  const [cards, setCards] = useState<CardData[]>([
    { 
      id: '1', 
      name: 'Primary Card', 
      last4: '4589', 
      cardNumber: '4589 1234 5678 4589', 
      cvv: '321', 
      balance: '$1,250.45', 
      limit: '$5,000', 
      status: 'active', 
      expiry: '12/28', 
      cardholder: 'JOHN DOE' 
    },
    { 
      id: '2', 
      name: 'Shopping Card', 
      last4: '7823', 
      cardNumber: '7823 8765 4321 7823', 
      cvv: '987', 
      balance: '$450.00', 
      limit: '$2,000', 
      status: 'frozen', 
      expiry: '09/27', 
      cardholder: 'JOHN DOE' 
    },
  ]);

  const [selectedCardId, setSelectedCardId] = useState('1');
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];

  // 3D tilt tracking states
  const cardVisualRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({ rotateX: 0, rotateY: 0 });

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

  const handleToggleFreeze = () => {
    setCards(prev => prev.map(c => {
      if (c.id === selectedCard.id) {
        const nextStatus = c.status === 'active' ? 'frozen' : 'active';
        toast.success(`Card successfully ${nextStatus === 'active' ? 'unfrozen' : 'frozen'}!`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(selectedCard.cardNumber);
    toast.success('Card number copied to clipboard!');
  };

  const handleCreateCard = () => {
    toast.success('Simulation: New virtual card created successfully!');
  };

  const handleFundCard = () => {
    toast.success('Simulation: Card successfully funded!');
  };

  // Spending Stats data
  const spendData = [
    { name: 'Jan', value: 890 },
    { name: 'Feb', value: 1240 },
    { name: 'Mar', value: 980 },
    { name: 'Apr', value: 1450 },
    { name: 'May', value: 1200 },
    { name: 'Jun', value: 1700 },
  ];

  const pieData = [
    { name: 'Shopping', value: 450, color: '#0066ff' },
    { name: 'Food', value: 320, color: '#10b981' },
    { name: 'Entertainment', value: 180, color: '#f59e0b' },
    { name: 'Travel', value: 250, color: '#8b5cf6' },
    { name: 'Other', value: 100, color: '#64748b' },
  ];

  const transactions = [
    { merchant: 'Amazon', amount: '-$89.99', category: 'shopping', time: '2h ago', status: 'completed', icon: ShoppingCart },
    { merchant: 'Uber Eats', amount: '-$32.50', category: 'food', time: '5h ago', status: 'completed', icon: Utensils },
    { merchant: 'Netflix', amount: '-$15.99', category: 'entertainment', time: '1d ago', status: 'completed', icon: Zap },
    { merchant: 'Spotify', amount: '-$9.99', category: 'entertainment', time: '2d ago', status: 'completed', icon: Zap },
    { merchant: 'Wallet Top-up', amount: '+$500.00', category: 'deposit', time: '3d ago', status: 'completed', icon: ArrowUpRight },
  ];

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
            {cards.map((card) => (
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

                {/* Middle number with copy button */}
                <div className="my-4">
                  <div className="flex items-center gap-3">
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={showCardNumber ? 'full' : 'masked'}
                        initial={shouldReduceMotion ? {} : { opacity: 0, filter: 'blur(4px)', scale: 0.98 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, filter: 'blur(4px)', scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="font-mono text-2xl tracking-widest text-white/90 inline-block"
                      >
                        {showCardNumber ? selectedCard.cardNumber : `•••• •••• •••• ${selectedCard.last4}`}
                      </motion.span>
                    </AnimatePresence>
                    <motion.button 
                      whileHover={shouldReduceMotion ? {} : { scale: 1.15 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                      onClick={handleCopyNumber}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer relative z-30"
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
                    <span className="font-mono text-sm text-white/90 font-semibold tracking-wider">{selectedCard.cardholder}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                    selectedCard.status === 'active' 
                      ? 'bg-success/20 text-success border border-success/30'
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
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={handleToggleFreeze}
                className="py-3 px-4 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={() => toast.success('Settings configuration simulated')}
                className="py-3 px-4 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>Settings</span>
              </motion.button>

              <motion.button
                variants={shouldReduceMotion ? {} : scaleIn}
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={handleFundCard}
                className="py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 cursor-pointer"
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
                {transactions.map((tx, i) => (
                  <motion.div 
                    key={i} 
                    variants={shouldReduceMotion ? {} : fadeUp}
                    whileHover={shouldReduceMotion ? {} : { x: 4, backgroundColor: 'var(--secondary)' }}
                    transition={{ duration: 0.15 }}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between px-1 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.category === 'deposit'
                          ? 'bg-success/10 text-success'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        <tx.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{tx.merchant}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{tx.category} • {tx.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-bold text-sm ${tx.category === 'deposit' ? 'text-success' : 'text-foreground'}`}>
                        {tx.amount}
                      </p>
                      <span className="text-[9px] font-bold text-success flex items-center justify-end gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Completed</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Create New Card tile */}
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
              onClick={handleCreateCard}
              className="w-full p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-card hover:bg-secondary/20 transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-base text-foreground block">+ Create New Card</span>
                <span className="text-xs text-muted-foreground">Issue a new virtual card funded immediately</span>
              </div>
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}
