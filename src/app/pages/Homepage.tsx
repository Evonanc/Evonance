import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import Navigation from '../components/Navigation';
import { 
  Zap, ArrowRight, ChevronUp, ChevronDown, CreditCard, 
  Wallet, ArrowLeftRight, TrendingUp, Shield, Lock, Eye, 
  Globe
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  fadeUp, fadeIn, scaleIn, slideInLeft, slideInRight, 
  staggerContainer 
} from '../lib/animations';
import { useCountUp } from '../hooks/useCountUp';
import { useTopCoins } from '../hooks/useCryptoData';
import { formatPrice } from '../lib/crypto';
import LiveIndicator from '../components/LiveIndicator';
import Footer from '../components/Footer';
import PWAInstallBanner from '../components/PWAInstallBanner';

// Custom CountUp Component to cleanly trigger individual stat triggers
function StatCounter({ target, prefix = '', suffix = '', decimals = 0 }: { target: number, prefix?: string, suffix?: string, decimals?: number }) {
  const { ref, value } = useCountUp(target, 1500, prefix, suffix, decimals);
  return <span ref={ref}>{value}</span>;
}

// Reusable flashing price component
function TickerPriceSpan({ price, change24h }: { price: number; change24h: number }) {
  const [flashClass, setFlashClass] = useState('');
  const prevPriceRef = useRef(price);

  useEffect(() => {
    if (price !== prevPriceRef.current) {
      const up = price > prevPriceRef.current;
      setFlashClass(up ? 'flash-up' : 'flash-down');
      prevPriceRef.current = price;
      const timeout = setTimeout(() => {
        setFlashClass('');
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [price]);

  return (
    <span className={`font-mono font-bold transition-all duration-200 ${flashClass || (change24h >= 0 ? 'text-success' : 'text-destructive')}`}>
      ${formatPrice(price)}
    </span>
  );
}

export default function Homepage() {
  const shouldReduceMotion = useReducedMotion();
  const { coins, loading, wsConnected, source } = useTopCoins();

  const features = [
    { icon: Wallet, title: 'Crypto Wallet', desc: 'Securely store and manage multiple cryptocurrencies in our bank-grade non-custodial wallet.' },
    { icon: ArrowLeftRight, title: 'Instant Swap', desc: 'Exchange your digital assets instantly with low fees, zero slippage, and optimal rates.' },
    { icon: TrendingUp, title: 'Advanced Trading', desc: 'Trade on our advanced engine with real-time order books, charting tools, and deep liquidity.' },
    { icon: CreditCard, title: 'Virtual USD Cards', desc: 'Issue virtual USD cards from just $1 and spend your crypto globally at any Visa merchant.' },
    { icon: Shield, title: 'Bank-Grade Security', desc: 'Your security is our priority. Cold vaults, multi-sig protocol, and up to $500k insurance coverage.' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Experience sub-millisecond execution speeds for all trades, deposits, and transfers.' },
  ];

  const securityFeatures = [
    { icon: Lock, title: 'Cold Storage', desc: '95% of digital assets stored offline in secure vaults' },
    { icon: Shield, title: 'Insurance Protected', desc: 'Up to $500,000 insurance coverage per user' },
    { icon: Eye, title: 'Fully Regulated', desc: 'Licensed and compliant with global financial regulations' },
  ];

  const newsList = [
    { title: 'Bitcoin reaches new all-time high above $67,000', source: 'CoinDesk', time: '2 hours ago' },
    { title: 'Ethereum network completes major upgrade', source: 'The Block', time: '5 hours ago' },
    { title: 'Global crypto adoption surges by 34% in Q1', source: 'Bloomberg', time: '8 hours ago' },
  ];

  const heroBadgeProps = shouldReduceMotion ? {} : {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, delay: 0.1 }
  };

  const heroLine1Props = shouldReduceMotion ? {} : {
    variants: fadeUp,
    initial: 'hidden',
    animate: 'visible',
    transition: { delay: 0.2 }
  };

  const heroLine2Props = shouldReduceMotion ? {} : {
    variants: fadeUp,
    initial: 'hidden',
    animate: 'visible',
    transition: { delay: 0.3 }
  };

  const heroSubProps = shouldReduceMotion ? {} : {
    variants: fadeUp,
    initial: 'hidden',
    animate: 'visible',
    transition: { delay: 0.4 }
  };

  const heroBtnProps = shouldReduceMotion ? {} : {
    variants: fadeUp,
    initial: 'hidden',
    animate: 'visible',
    transition: { delay: 0.5 }
  };

  const heroStatsProps = shouldReduceMotion ? {} : {
    variants: staggerContainer,
    initial: 'hidden',
    animate: 'visible',
    transition: { delay: 0.6 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Dynamic CSS animations styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .flash-up {
          animation: flashGreen 0.6s ease-out;
        }
        .flash-down {
          animation: flashRed 0.6s ease-out;
        }
        @keyframes flashGreen {
          0% { color: var(--success); text-shadow: 0 0 8px var(--success); }
          100% { color: inherit; text-shadow: none; }
        }
        @keyframes flashRed {
          0% { color: var(--destructive); text-shadow: 0 0 8px var(--destructive); }
          100% { color: inherit; text-shadow: none; }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* Scrolling ticker bar */}
      {!loading && coins.length > 0 && (
        <div className="bg-secondary/40 border-b border-border/50 py-2.5 overflow-hidden text-xs relative z-50">
          <div className="animate-marquee whitespace-nowrap gap-12 flex">
            {[...coins, ...coins].map((coin, index) => (
              <span key={`${coin.symbol}-${index}`} className="inline-flex items-center gap-2 px-1">
                <span className="font-bold text-foreground">{coin.symbol}</span>
                <span className="text-muted-foreground">•</span>
                <TickerPriceSpan price={coin.price} change24h={coin.change24h} />
                <span className={`text-[10px] font-semibold ${coin.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <Navigation isPublic={true} />
      <PWAInstallBanner />

      {/* SECTION 1 — Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Floating Blobs */}
        {!shouldReduceMotion && (
          <>
            <motion.div 
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }} 
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-[0.06] bg-primary pointer-events-none"
            />
            <motion.div 
              animate={{ x: [0, -20, 0], y: [0, 30, 0] }} 
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-[0.06] bg-primary pointer-events-none"
            />
          </>
        )}

        <div className="max-w-7xl mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div 
              {...heroBadgeProps}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4" />
              <span>Evolution Finance Limited</span>
            </motion.div>

            {/* H1 */}
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              <motion.span {...heroLine1Props} className="block">The Future of</motion.span>
              <motion.span {...heroLine2Props} className="block text-primary">Crypto Finance</motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p 
              {...heroSubProps}
              className="text-xl text-muted-foreground mb-8 max-w-2xl"
            >
              Trade, swap, and manage your crypto portfolio with institutional-grade security. Create virtual USD cards from just $1.
            </motion.p>

            {/* Buttons */}
            <motion.div 
              {...heroBtnProps}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              <motion.span
                whileHover={shouldReduceMotion ? {} : { scale: 1.03, filter: 'brightness(1.08)' }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="inline-block"
              >
                <Link 
                  to="/signup" 
                  className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.span>
              <motion.span
                whileHover={shouldReduceMotion ? {} : { scale: 1.03, backgroundColor: 'var(--secondary)' }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="inline-block rounded-xl border border-border"
              >
                <a 
                  href="#markets" 
                  className="px-8 py-4 text-foreground font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all rounded-xl"
                >
                  <span>Markets Feed</span>
                </a>
              </motion.span>
            </motion.div>

            {/* Stats */}
            <motion.div 
              {...heroStatsProps}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-border/60 max-w-lg"
            >
              <motion.div variants={shouldReduceMotion ? {} : fadeUp}>
                <p className="text-3xl font-bold text-foreground">
                  <StatCounter target={2} prefix="$" suffix="B+" decimals={1} />
                </p>
                <p className="text-sm text-muted-foreground">Trading Volume</p>
              </motion.div>
              <motion.div variants={shouldReduceMotion ? {} : fadeUp}>
                <p className="text-3xl font-bold text-foreground">
                  <StatCounter target={500} suffix="K+" />
                </p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </motion.div>
              <motion.div variants={shouldReduceMotion ? {} : fadeUp}>
                <p className="text-3xl font-bold text-foreground">
                  <StatCounter target={150} suffix="+" />
                </p>
                <p className="text-sm text-muted-foreground">Cryptocurrencies</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Live Markets (id="markets") */}
      <section id="markets" className="bg-card border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={shouldReduceMotion ? {} : 'hidden'}
            whileInView={shouldReduceMotion ? {} : 'visible'}
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            className="flex items-center justify-between mb-10"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-foreground">Live Markets</h2>
              <LiveIndicator wsConnected={wsConnected} loading={loading} source={source} />
            </div>
            <Link to="/trade" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              <span>View All Markets</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div 
            initial={shouldReduceMotion ? {} : 'hidden'}
            whileInView={shouldReduceMotion ? {} : 'visible'}
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-[88px] rounded-xl animate-pulse bg-secondary/50 border border-border" />
              ))
            ) : (
              coins.map((coin) => {
                const isUp = coin.change24h >= 0;
                const formattedChange = `${isUp ? '+' : ''}${coin.change24h.toFixed(2)}%`;
                return (
                  <motion.div 
                    key={coin.symbol}
                    variants={shouldReduceMotion ? {} : scaleIn}
                    whileHover={shouldReduceMotion ? {} : { y: -4, boxShadow: `0 8px 32px ${coin.color}18` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={() => window.location.href = '/trade'}
                    className="p-6 rounded-xl border border-border bg-background hover:border-primary/50 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                        style={{ backgroundColor: coin.color }}
                      >
                        {coin.icon}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{coin.symbol}</p>
                        <p className="text-xs text-muted-foreground">{coin.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        <TickerPriceSpan price={coin.price} change24h={coin.change24h} />
                      </p>
                      <p className={`text-xs font-semibold flex items-center justify-end gap-1 ${isUp ? 'text-success' : 'text-destructive'}`}>
                        {isUp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>{formattedChange}</span>
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </section>

      {/* SECTION 3 — Virtual Cards Feature */}
      <section className="bg-gradient-to-br from-primary to-blue-600 py-20 relative overflow-hidden text-white">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left text */}
            <motion.div 
              initial={shouldReduceMotion ? {} : 'hidden'}
              whileInView={shouldReduceMotion ? {} : 'visible'}
              viewport={{ once: true }}
              variants={slideInLeft}
              className="flex-1 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Featured Product</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Virtual USD Cards <br />
                from just $1
              </h2>
              <p className="text-white/90 text-lg max-w-lg leading-relaxed">
                Instantly issue virtual Visa cards funded directly from your crypto wallet. Pay at millions of online stores and merchants globally with absolute privacy and zero transaction conversion fees.
              </p>
              <div>
                <motion.span
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05, boxShadow: '0 0 32px rgba(255,255,255,0.2)' }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  className="inline-block"
                >
                  <Link 
                    to="/signup" 
                    className="px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-lg shadow-white/10 flex items-center gap-2 cursor-pointer transition-all hover:bg-white/95"
                  >
                    <span>Get Virtual Card</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.span>
              </div>
            </motion.div>

            {/* Right card visual */}
            <motion.div 
              initial={shouldReduceMotion ? {} : 'hidden'}
              whileInView={shouldReduceMotion ? {} : 'visible'}
              viewport={{ once: true }}
              variants={slideInRight}
              className="flex-1 flex justify-center w-full"
            >
              <div className="relative w-80 h-48 sm:w-[400px] sm:h-[240px] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 flex flex-col justify-between border border-white/10 shadow-2xl overflow-hidden hover:rotate-2 transition-transform duration-300">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,102,255,0.2),transparent_60%)] pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-white/50 uppercase tracking-widest font-mono">EVONANCE Card</span>
                    <span className="text-xs text-white/70 block mt-1 font-bold">Premium Visa</span>
                  </div>
                  <Globe className="w-8 h-8 text-white/20" />
                </div>
                <div className="text-xl sm:text-2xl font-bold tracking-widest text-white/90 font-mono">
                  ••••  ••••  ••••  8824
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[8px] text-white/40 block uppercase tracking-wider font-mono">Card Holder</span>
                    <span className="text-xs sm:text-sm font-semibold text-white/80 font-mono">Alex Mercer</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/80 font-black italic block tracking-wider font-mono">VISA</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Features Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={shouldReduceMotion ? {} : 'hidden'}
            whileInView={shouldReduceMotion ? {} : 'visible'}
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Complete Financial Ecosystem</h2>
            <p className="text-lg text-muted-foreground">Every tool you need to trade, invest, swap, and spend cryptocurrency at your fingertips.</p>
          </motion.div>

          <motion.div 
            initial={shouldReduceMotion ? {} : 'hidden'}
            whileInView={shouldReduceMotion ? {} : 'visible'}
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feat, i) => (
              <motion.div 
                key={i}
                variants={shouldReduceMotion ? {} : fadeUp}
                whileHover={shouldReduceMotion ? {} : { y: -6 }}
                className="p-8 rounded-2xl border border-border bg-card hover:border-primary/45 transition-all flex flex-col gap-4 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <feat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 — Bank-Grade Security */}
      <section className="bg-card border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            
            {/* Security stats list */}
            <motion.div 
              initial={shouldReduceMotion ? {} : 'hidden'}
              whileInView={shouldReduceMotion ? {} : 'visible'}
              viewport={{ once: true }}
              variants={slideInLeft}
              className="flex-1 space-y-6"
            >
              <h2 className="text-3xl lg:text-4xl font-bold">Your Security, Our Core Foundation</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Evolution Finance implements state-of-the-art multi-tier protection mechanics. We prioritize institutional compliance protocols to guard user deposits and virtual transactions.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                {securityFeatures.map((sec, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
                      <sec.icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-foreground">{sec.title}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{sec.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* High-tech security grid box animation representation */}
            <motion.div 
              initial={shouldReduceMotion ? {} : 'hidden'}
              whileInView={shouldReduceMotion ? {} : 'visible'}
              viewport={{ once: true }}
              variants={slideInRight}
              className="flex-1 flex justify-center w-full"
            >
              <div className="relative w-80 h-80 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border p-6 flex flex-col justify-center items-center shadow-md overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.08),transparent_70%)]" />
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary relative z-10 border border-primary/20">
                  <Shield className="w-12 h-12" />
                </div>
                <div className="text-center mt-6 relative z-10">
                  <span className="text-sm font-bold text-foreground block">SECURE PROTOCOL ACTIVE</span>
                  <span className="text-xs text-success font-semibold tracking-wider block mt-1">256-bit AES Vault Encryption</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* SECTION 6 — Newsletter News List */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            
            {/* Left text */}
            <motion.div 
              initial={shouldReduceMotion ? {} : 'hidden'}
              whileInView={shouldReduceMotion ? {} : 'visible'}
              viewport={{ once: true }}
              variants={slideInLeft}
              className="flex-1 space-y-6"
            >
              <h2 className="text-3xl lg:text-4xl font-bold">Stay Updated with Evolution Finance</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join our premium newsletter feed to receive exclusive crypto insights, platform feature announcements, and global spot market forecasts directly in your inbox.
              </p>
              
              <form onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed successfully!'); }} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                />
                <button type="submit" className="px-6 py-3 bg-primary text-white font-bold rounded-lg text-sm cursor-pointer hover:bg-primary/95 transition-all">
                  Subscribe
                </button>
              </form>
            </motion.div>

            {/* Right side news feed */}
            <motion.div 
              initial={shouldReduceMotion ? {} : 'hidden'}
              whileInView={shouldReduceMotion ? {} : 'visible'}
              viewport={{ once: true }}
              variants={slideInRight}
              className="flex-1 space-y-4 w-full"
            >
              <h3 className="font-bold text-lg text-foreground mb-4">Latest Insights</h3>
              <div className="space-y-4">
                {newsList.map((news, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{news.source} • {news.time}</span>
                    <a href="#" className="font-bold text-sm text-foreground hover:text-primary transition-colors leading-normal">{news.title}</a>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
