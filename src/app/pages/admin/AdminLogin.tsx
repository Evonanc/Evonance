import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { getAdminRole } from '../../lib/admin';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Lock, Mail, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Check if already authenticated as admin
  useEffect(() => {
    async function checkExistingSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = await getAdminRole();
        if (role) {
          navigate('/admin', { replace: true });
          return;
        }
      }
      setCheckingSession(false);
    }
    checkExistingSession();
  }, [navigate]);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setLockoutRemaining(0);
        setAttemptCount(0);
        clearInterval(interval);
      } else {
        setLockoutRemaining(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutUntil && Date.now() < lockoutUntil) {
      toast.error(`Too many attempts. Wait ${lockoutRemaining}s.`);
      return;
    }

    if (!email || !password) {
      toast.error('Enter your admin credentials.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Authentication failed.');

      // Step 2: Verify admin role — sign out immediately if not admin
      const role = await getAdminRole();
      if (!role) {
        await supabase.auth.signOut();
        const newCount = attemptCount + 1;
        setAttemptCount(newCount);
        if (newCount >= 3) {
          const lockUntil = Date.now() + 30_000; // 30s lockout after 3 failures
          setLockoutUntil(lockUntil);
          setLockoutRemaining(30);
          toast.error('Account not authorized for admin access. Locked for 30s.');
        } else {
          toast.error(`Not an admin account. ${3 - newCount} attempt(s) remaining.`);
        }
        return;
      }

      toast.success(`Welcome back, ${data.user.user_metadata?.full_name ?? 'Admin'}.`);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      const newCount = attemptCount + 1;
      setAttemptCount(newCount);
      if (newCount >= 3) {
        const lockUntil = Date.now() + 30_000;
        setLockoutUntil(lockUntil);
        setLockoutRemaining(30);
      }
      toast.error(err.message ?? 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockoutUntil !== null && Date.now() < lockoutUntil;

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl" />
      </div>

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-sm text-zinc-500 mt-1">Restricted access — authorized personnel only</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">

          {/* Lockout banner */}
          <AnimatePresence>
            {isLocked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Access locked. Try again in <strong>{lockoutRemaining}s</strong>.</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  id="admin-email"
                  name="admin-email"
                  autoComplete="username"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={isLocked || loading}
                  className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-40 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="admin-password"
                  name="admin-password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLocked || loading}
                  className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-40 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Attempt warning */}
            {attemptCount > 0 && !isLocked && (
              <p className="text-xs text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {3 - attemptCount} attempt(s) remaining before lockout
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="admin-login-submit"
              disabled={loading || isLocked || !email || !password}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : isLocked ? (
                `Locked (${lockoutRemaining}s)`
              ) : (
                'Sign In to Admin Portal'
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-600">
              This portal is monitored and all access attempts are logged.
              <br />
              Unauthorized access is prohibited.
            </p>
          </div>
        </div>

        {/* Back link */}
        <p className="text-center mt-5 text-xs text-zinc-700">
          Not an admin?{' '}
          <a href="/login" className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2">
            Regular login
          </a>
        </p>
      </motion.div>
    </div>
  );
}
