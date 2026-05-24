import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router';
import { useTheme } from 'next-themes';
import { Sun, Moon, Wallet, CreditCard, Lock, Mail, CheckCircle, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'motion/react';
import { fadeUp, fadeIn, slideInRight, staggerContainer } from '../lib/animations';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [searchParams] = useSearchParams();
  const [refCode, setRefCode] = useState(
    searchParams.get('ref') ?? ''
  );
  const [refValid, setRefValid] = useState<boolean | null>(null);

  // Validate referral code when entered
  const validateRefCode = async (code: string) => {
    if (!code || code.length < 4) {
      setRefValid(null);
      return;
    }
    const { data } = await supabase
      .from('referral_settings')
      .select('code, user_id')
      .eq('code', code.toUpperCase())
      .single();
    setRefValid(!!data);
  };

  useEffect(() => {
    if (refCode) validateRefCode(refCode);
  }, [refCode]);

  const shouldReduceMotion = useReducedMotion();

  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Already logged in
  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Dynamic Password Strength Meter
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strengthPercent = getPasswordStrength(password);
  const strengthColor = strengthPercent <= 25 
    ? 'bg-destructive' 
    : strengthPercent <= 75 
      ? 'bg-warning' 
      : 'bg-success';

  // Step 1 submit — create account
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (!agree) {
      toast.error('Please accept the Terms of Service.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`.trim(),
            first_name: firstName,
            last_name: lastName,
            referral_code: refCode || null,  // ADD THIS
          },
        },
      });
      if (error) throw error;
      setStep(2); // Move to email verification step
    } catch (err: any) {
      toast.error(err.message ?? 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — go to dashboard
  const handleContinue = () => {
    toast.success('Account created! Welcome to EVONANCE.');
    navigate('/dashboard');
  };

  // Google OAuth
  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message ?? 'Google signup failed');
    }
  };

  // GitHub OAuth
  const handleGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin + '/dashboard' },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message ?? 'GitHub signup failed');
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
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative bg-background py-10">
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
            className="flex justify-center lg:justify-start mb-6"
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

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-6 justify-center lg:justify-start">
            <span className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-primary' : 'bg-secondary'}`} />
            <span className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} />
            <span className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-primary' : 'bg-secondary'}`} />
          </div>

          {step === 1 && (
            <>
              <motion.h2 
                variants={shouldReduceMotion ? {} : fadeUp}
                initial={shouldReduceMotion ? {} : 'hidden'}
                animate={shouldReduceMotion ? {} : 'visible'}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-foreground mb-2 text-center lg:text-left"
              >
                Create your account
              </motion.h2>
              <motion.p 
                variants={shouldReduceMotion ? {} : fadeUp}
                initial={shouldReduceMotion ? {} : 'hidden'}
                animate={shouldReduceMotion ? {} : 'visible'}
                transition={{ delay: 0.3 }}
                className="text-sm text-muted-foreground mb-6 text-center lg:text-left"
              >
                Start your crypto journey in just a few minutes
              </motion.p>

              <motion.form 
                variants={shouldReduceMotion ? {} : staggerForm}
                initial="hidden"
                animate="visible"
                onSubmit={handleSignup} 
                className="space-y-4"
              >
                {/* First + Last Name Grid */}
                <motion.div variants={shouldReduceMotion ? {} : fadeUp} className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1.5">
                      First Name
                    </label>
                    <div className="relative">
                      <input
                        id="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        onFocus={() => setFocusedField('first')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="John"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                      />
                      {!shouldReduceMotion && (
                        <motion.div 
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: focusedField === 'first' ? 1 : 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          style={{ originX: 0 }}
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-b-lg"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1.5">
                      Last Name
                    </label>
                    <div className="relative">
                      <input
                        id="lastName"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        onFocus={() => setFocusedField('last')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Doe"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                      />
                      {!shouldReduceMotion && (
                        <motion.div 
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: focusedField === 'last' ? 1 : 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          style={{ originX: 0 }}
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-b-lg"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={shouldReduceMotion ? {} : fadeUp}>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                    />
                    {!shouldReduceMotion && (
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: focusedField === 'email' ? 1 : 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{ originX: 0 }}
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-b-lg"
                      />
                    )}
                  </div>
                </motion.div>

                {/* Referral Code Field */}
                <motion.div variants={shouldReduceMotion ? {} : fadeUp}>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Referral code
                    <span className="text-muted-foreground font-normal ml-1">
                      (optional)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      value={refCode}
                      onChange={e => {
                        setRefCode(e.target.value.toUpperCase());
                        validateRefCode(e.target.value.toUpperCase());
                      }}
                      placeholder="e.g. EVON1234"
                      maxLength={8}
                      className={`w-full bg-input-background border rounded-lg
                        px-4 pr-10 py-2.5 text-foreground font-mono text-sm
                        placeholder:text-muted-foreground focus:outline-none
                        focus:ring-2 transition-all uppercase
                        ${refValid === true
                          ? 'border-success focus:border-success focus:ring-success/20'
                          : refValid === false
                            ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                            : 'border-border focus:border-primary focus:ring-primary/20'
                        }`}
                    />
                    {refValid === true && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check className="w-4 h-4 text-success" />
                      </span>
                    )}
                    {refValid === false && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      </span>
                    )}
                  </div>
                  {refValid === true && (
                    <p className="text-xs text-success mt-1">
                      Valid referral code — you'll both earn $10 USDT!
                    </p>
                  )}
                  {refValid === false && (
                    <p className="text-xs text-destructive mt-1">
                      Invalid referral code. Leave blank if you don't have one.
                    </p>
                  )}
                </motion.div>

                <motion.div variants={shouldReduceMotion ? {} : fadeUp}>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Create password"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                    />
                    {!shouldReduceMotion && (
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: focusedField === 'password' ? 1 : 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{ originX: 0 }}
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-b-lg"
                      />
                    )}
                  </div>

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: strengthPercent + '%' }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className={`h-full ${strengthColor}`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                        <span>Password Strength</span>
                        <span>
                          {strengthPercent <= 25 && 'Weak'}
                          {strengthPercent === 50 && 'Medium'}
                          {strengthPercent === 75 && 'Good'}
                          {strengthPercent === 100 && 'Strong'}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.div variants={shouldReduceMotion ? {} : fadeUp}>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirm')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Confirm password"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
                    />
                    {!shouldReduceMotion && (
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: focusedField === 'confirm' ? 1 : 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{ originX: 0 }}
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-b-lg"
                      />
                    )}
                  </div>
                </motion.div>

                {/* Terms and conditions */}
                <motion.div variants={shouldReduceMotion ? {} : fadeUp} className="flex items-start">
                  <input
                    id="agree"
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-primary/20 bg-input-background"
                  />
                  <label htmlFor="agree" className="ml-2 block text-xs text-muted-foreground leading-normal font-normal">
                    I agree to the <Link to="/terms" className="text-primary font-semibold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>
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
                      Creating Account...
                    </span>
                  ) : 'Create account'}
                </motion.button>
              </motion.form>

              {/* Divider */}
              <motion.div 
                variants={shouldReduceMotion ? {} : fadeIn}
                initial={shouldReduceMotion ? {} : 'hidden'}
                animate={shouldReduceMotion ? {} : 'visible'}
                transition={{ delay: 0.85 }}
                className="relative my-6"
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
                transition={{ delay: 0.95 }}
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
                transition={{ delay: 1.05 }}
                className="text-center text-sm text-muted-foreground mt-6"
              >
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </motion.p>
            </>
          )}

          {step === 2 && (
            <motion.div
              variants={shouldReduceMotion ? {} : staggerForm}
              initial="hidden"
              animate="visible"
              className="text-center space-y-6"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Mail className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Verify your email</h3>
                <p className="text-sm text-muted-foreground">
                  We sent a verification link to <span className="font-semibold text-foreground">{email}</span>.
                  Please check your inbox (and spam folder) to activate your account.
                </p>
              </div>
              
              <div className="space-y-3 pt-4">
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  onClick={() => setStep(3)}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10"
                >
                  Continue to Dashboard
                </motion.button>
                
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const { error } = await supabase.auth.resend({
                        type: 'signup',
                        email,
                      });
                      if (error) throw error;
                      toast.success('Verification email resent!');
                    } catch (err: any) {
                      toast.error(err.message ?? 'Failed to resend email');
                    }
                  }}
                  className="w-full py-2.5 rounded-lg border border-border bg-background hover:bg-secondary text-sm font-semibold transition-all cursor-pointer"
                >
                  Resend verification email
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              variants={shouldReduceMotion ? {} : staggerForm}
              initial="hidden"
              animate="visible"
              className="text-center space-y-6"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Registration Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Your account has been fully prepared. Get ready to trade, spend, and manage assets with EVONANCE.
                </p>
              </div>
              
              <div className="pt-4">
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  onClick={handleContinue}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10"
                >
                  Go to Dashboard
                </motion.button>
              </div>
            </motion.div>
          )}
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
            Your Crypto Journey Starts Here
          </motion.h3>
          <motion.p 
            variants={shouldReduceMotion ? {} : fadeUp}
            transition={{ delay: 0.45 }}
            className="text-xl text-white/90"
          >
            Access everything you need to trade, swap, and manage crypto with confidence.
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
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Secure multi-chain wallet</h4>
                <p className="text-white/80 text-sm">Store BTC, ETH, SOL, stablecoins and more in absolute custody.</p>
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
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Virtual USD cards from $1</h4>
                <p className="text-white/80 text-sm">Spend digital assets at 50M+ Visa merchants globally.</p>
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
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Insurance protected assets</h4>
                <p className="text-white/80 text-sm">Rest assured that your assets are protected by leading vaults.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
