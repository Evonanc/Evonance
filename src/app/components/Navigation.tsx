import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, X, LogOut, Settings as SettingsIcon, Shield, ShieldCheck, Gift, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, Variants } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import NotificationBell from './NotificationBell';
import { useKYC } from '../hooks/useKYC';
import KYCBadge from './KYCBadge';
import { isMFAEnabled } from '../lib/mfa';
import { isAdmin } from '../lib/admin';

interface NavigationProps {
  isPublic?: boolean;
}

export default function Navigation({ isPublic = false }: NavigationProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { level, status } = useKYC();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      isMFAEnabled().then(setMfaEnabled).catch(() => {});
      isAdmin().then(setShowAdmin).catch(() => {});
    }
  }, [user]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    navigate('/');
  };

  // Get initials from user metadata or email
  const getInitials = () => {
    const name = user?.user_metadata?.full_name as string;
    if (name) {
      const parts = name.split(' ');
      return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0][0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() ?? 'U';
  };

  const publicLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Markets', href: '#markets' },
    { label: 'Security', href: '#security' },
  ];

  const appLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Swap', href: '/swap' },
    { label: 'Trade', href: '/trade' },
    { label: 'Cards', href: '/cards' },
  ];

  const links = isPublic ? publicLinks : appLinks;

  const isActive = (href: string) => {
    if (isPublic) return false;
    return location.pathname === href;
  };

  const navLinksVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  };

  const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } }
  };

  return (
    <motion.nav 
      animate={{ 
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.1)' : 'none',
        backgroundColor: scrolled ? 'var(--background)' : 'transparent'
      }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <motion.div 
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-bold text-white text-lg"
              >
                E
              </motion.div>
              <span className="font-bold text-lg text-foreground tracking-wider">
                EVONANCE
              </span>
            </Link>
          </div>

          {/* Center: Nav links */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => {
              const active = isActive(link.href);
              const linkClasses = `text-sm font-medium transition-colors relative pb-1 ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`;

              const linkProps = shouldReduceMotion ? {} : {
                whileHover: { y: -1 },
                transition: { type: 'spring' as const, stiffness: 400, damping: 25 }
              };

              return isPublic ? (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className={linkClasses}
                  {...linkProps}
                >
                  {link.label}
                </motion.a>
              ) : (
                <motion.span key={link.label} className="inline-block">
                  <Link
                    to={link.href}
                    className={linkClasses}
                  >
                    <motion.span {...linkProps} className="inline-block">
                      {link.label}
                    </motion.span>
                    {active && !shouldReduceMotion && (
                      <motion.span 
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.span>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 15 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="p-2 rounded-lg hover:bg-secondary text-foreground transition-colors cursor-pointer w-9 h-9 flex items-center justify-center overflow-hidden"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={shouldReduceMotion ? {} : { opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5 text-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={shouldReduceMotion ? {} : { opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notification bell — only for logged in users */}
            {!isPublic && user && <NotificationBell />}

            {isPublic ? (
              <>
                {user ? (
                  <motion.span
                    whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="inline-block"
                  >
                    <Link
                      to="/dashboard"
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/95 transition-all block shadow-sm"
                    >
                      Go to Dashboard
                    </Link>
                  </motion.span>
                ) : (
                  <>
                    <motion.span
                      whileHover={shouldReduceMotion ? {} : { y: -1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <Link
                        to="/login"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Sign In
                      </Link>
                    </motion.span>
                    <motion.span
                      whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="inline-block"
                    >
                      <Link
                        to="/signup"
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/95 transition-all block shadow-sm"
                      >
                        Get Started
                      </Link>
                    </motion.span>
                  </>
                )}
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
                >
                  {getInitials()}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-10 w-52 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.user_metadata?.full_name ?? 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {mfaEnabled ? (
                          <div className="flex items-center gap-1.5 text-xs text-success font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            2FA enabled
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-warning font-medium">
                            <Shield className="w-3.5 h-3.5" />
                            <button
                              onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                              className="hover:underline cursor-pointer bg-transparent border-none p-0 text-warning text-xs font-medium">
                              Enable 2FA
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                        Settings
                      </button>
                      <button
                        onClick={() => { navigate('/referral'); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Gift className="w-4 h-4 text-muted-foreground" />
                        Refer & Earn
                      </button>
                      <button
                        onClick={() => { navigate('/kyc'); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          Identity Verification
                        </span>
                        <KYCBadge level={level} status={status} size="sm" />
                      </button>
                      <button
                        onClick={() => { navigate('/cards'); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      >
                        My Cards
                      </button>
                    </div>
                    {showAdmin && (
                      <div className="border-t border-border py-1">
                        <button
                          onClick={() => { navigate('/admin'); setDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary transition-colors flex items-center gap-2 cursor-pointer font-semibold"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Panel
                        </button>
                      </div>
                    )}
                    <div className="border-t border-border py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center space-x-2">
            <motion.button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 15 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="p-2 rounded-lg hover:bg-secondary text-foreground transition-colors w-9 h-9 flex items-center justify-center overflow-hidden"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun-mobile"
                    initial={shouldReduceMotion ? {} : { opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5 text-foreground" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon-mobile"
                    initial={shouldReduceMotion ? {} : { opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5 text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-secondary text-foreground transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3 overflow-hidden"
          >
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col space-y-3"
            >
              {links.map((link) => (
                <motion.div 
                  key={link.label}
                  variants={shouldReduceMotion ? {} : navLinksVariants}
                >
                  {isPublic ? (
                    <a
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-medium text-muted-foreground hover:text-primary transition-colors block py-1"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-base font-medium transition-colors block py-1 ${
                        isActive(link.href)
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}
                </motion.div>
              ))}

              {isPublic && (
                <motion.div 
                  variants={shouldReduceMotion ? {} : navLinksVariants}
                  className="flex flex-col space-y-2 pt-2 border-t border-border"
                >
                  {user ? (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/95 transition-colors"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center text-sm font-medium text-muted-foreground hover:text-primary py-2 rounded-lg hover:bg-secondary transition-colors block"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-center bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/95 transition-colors block"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
