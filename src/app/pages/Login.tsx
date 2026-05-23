import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router';
import { useTheme } from 'next-themes';
import { Sun, Moon, TrendingUp, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'motion/react';
import { fadeUp, fadeIn, slideInRight, staggerContainer } from '../lib/animations';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const from = (location.state as any)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Already logged in — redirect away from login page
  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Form submit handler — replaces the old window.location.href redirect
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth handler
  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message ?? 'Google login failed');
    }
  };

  // GitHub OAuth handler
  const handleGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin + '/dashboard' },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message ?? 'GitHub login failed');
    }
  };

  const staggerForm = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.4 }
    }
  };

  const featureStagger = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.55 }
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      {/* LEFT PANEL */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative bg-background">
        {/* Absolute top-right: theme toggle */}
        <div className="absolute top-4 right-4 z-20">
          <motion.button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 15 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-secondary text-foreground transition-colors cursor-pointer w-9 h-9 flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Centered Form container */}
        <div className="w-full max-w-sm relative z-10">
          {/* Logo */}
          <motion.div 
            initial={shouldReduceMotion ? {} : { opacity: 0, x: -16 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex justify-center lg:justify-start mb-8"
          >
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-bold text-white text-lg">
                E
              </div>
              <span className="font-bold text-lg text-foreground tracking-wider">
                EVONANCE
              </span>
            </Link>
          </motion.div>

          <motion.h2 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial={shouldReduceMotion ? {} : 'hidden'}
            animate={shouldReduceMotion ? {} : 'visible'}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-foreground mb-2"
          >
            Welcome back
          </motion.h2>
          <motion.p 
            variants={shouldReduceMotion ? {} : fadeUp}
            initial={shouldReduceMotion ? {} : 'hidden'}
            animate={shouldReduceMotion ? {} : 'visible'}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground mb-8"
          >
            Sign in to your account to continue trading
          </motion.p>

          <motion.form 
            variants={shouldReduceMotion ? {} : staggerForm}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            <motion.div variants={shouldReduceMotion ? {} : fadeUp}>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              {/* Focus bottom border wrapper */}
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                />
                {!shouldReduceMotion && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isEmailFocused ? 1 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{ originX: 0 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-b-lg"
                  />
                )}
              </div>
            </motion.div>

            <motion.div variants={shouldReduceMotion ? {} : fadeUp}>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="••••••••"
                  className="w-full pr-12 pl-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                {!shouldReduceMotion && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isPasswordFocused ? 1 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{ originX: 0 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-b-lg"
                  />
                )}
              </div>
            </motion.div>

            <motion.div variants={shouldReduceMotion ? {} : fadeUp} className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 bg-input-background"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground font-normal">
                Remember me
              </label>
            </motion.div>

            <motion.button
              variants={shouldReduceMotion ? {} : fadeUp}
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10 flex items-center justify-center min-h-[48px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <motion.div 
            variants={shouldReduceMotion ? {} : fadeIn}
            initial={shouldReduceMotion ? {} : 'hidden'}
            animate={shouldReduceMotion ? {} : 'visible'}
            transition={{ delay: 0.8 }}
            className="relative my-8"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">Or continue with</span>
            </div>
          </motion.div>

          {/* OAuth Buttons */}
          <motion.div 
            variants={shouldReduceMotion ? {} : fadeIn}
            initial={shouldReduceMotion ? {} : 'hidden'}
            animate={shouldReduceMotion ? {} : 'visible'}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-2 gap-3"
          >
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              type="button"
              onClick={handleGoogle}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-background hover:bg-secondary text-sm font-semibold transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.357-2.828-6.357-6.32s2.847-6.32 6.357-6.32c1.614 0 3.15.58 4.35 1.696l3.07-3.07C19.263 2.5 15.938 1.5 12.24 1.5 6.037 1.5 1 6.537 1 12.75s5.037 11.25 11.24 11.25c6.262 0 11.36-4.5 11.36-11.25 0-.78-.07-1.54-.2-2.285h-11.16z"/>
              </svg>
              <span>Google</span>
            </motion.button>
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              type="button"
              onClick={handleGitHub}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-background hover:bg-secondary text-sm font-semibold transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>GitHub</span>
            </motion.button>
          </motion.div>

          <motion.p 
            variants={shouldReduceMotion ? {} : fadeIn}
            initial={shouldReduceMotion ? {} : 'hidden'}
            animate={shouldReduceMotion ? {} : 'visible'}
            transition={{ delay: 1.0 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign up for free
            </Link>
          </motion.p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <motion.div 
        initial={shouldReduceMotion ? {} : 'hidden'}
        animate={shouldReduceMotion ? {} : 'visible'}
        variants={slideInRight}
        transition={{ delay: 0.15 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-blue-600 justify-center items-center text-white relative overflow-hidden"
      >
        {/* Ambient Blur Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-10 pointer-events-none" />

        <div className="max-w-md space-y-8 relative z-10 px-8">
          <motion.h3 
            variants={shouldReduceMotion ? {} : fadeUp}
            transition={{ delay: 0.35 }}
            className="text-4xl font-bold leading-tight"
          >
            Trade with Confidence
          </motion.h3>
          <motion.p 
            variants={shouldReduceMotion ? {} : fadeUp}
            transition={{ delay: 0.45 }}
            className="text-xl text-white/90"
          >
            Join 500,000+ users managing $2.4B+ in digital assets on EVONANCE with ultra-low fees and bank-grade security.
          </motion.p>

          <motion.div 
            variants={shouldReduceMotion ? {} : featureStagger}
            className="space-y-6"
          >
            <motion.div 
              variants={shouldReduceMotion ? {} : {
                hidden: { opacity: 0, x: -16 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
              }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Advanced trading tools</h4>
                <p className="text-white/80 text-sm">Real-time charting, order books, and depth streams.</p>
              </div>
            </motion.div>

            <motion.div 
              variants={shouldReduceMotion ? {} : {
                hidden: { opacity: 0, x: -16 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
              }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Bank-grade security</h4>
                <p className="text-white/80 text-sm">Cold vault custody and multi-signature security.</p>
              </div>
            </motion.div>

            <motion.div 
              variants={shouldReduceMotion ? {} : {
                hidden: { opacity: 0, x: -16 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
              }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Instant transactions</h4>
                <p className="text-white/80 text-sm">Exchange, send, and spend digital assets sub-second.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
