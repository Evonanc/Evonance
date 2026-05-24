import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { supabase } from '../lib/supabase';
import {
  getMFAFactors, verifyMFALogin, MFAFactor
} from '../lib/mfa';
import OTPInput from '../components/OTPInput';
import { toast } from 'sonner';
import {
  ShieldCheck, Smartphone, AlertCircle,
  Loader2, LogOut, RefreshCw, Check,
} from 'lucide-react';

export default function Verify2FA() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as any)?.from ?? '/dashboard';

  const [code, setCode]         = useState('');
  const [factor, setFactor]     = useState<MFAFactor | null>(null);
  const [loading, setLoading]   = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError]       = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Load the user's verified 2FA factor
  useEffect(() => {
    getMFAFactors().then(factors => {
      const verified = factors.find(f => f.status === 'verified');
      setFactor(verified ?? null);
      setLoading(false);

      // If no factor found, skip to dashboard
      if (!verified) navigate(from, { replace: true });
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleVerify = async () => {
    if (!factor || code.length !== 6) return;
    setVerifying(true);
    setError(false);

    try {
      await verifyMFALogin(factor.id, code);
      toast.success('Verified successfully');
      navigate(from, { replace: true });
    } catch {
      setError(true);
      setCode('');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        toast.error('Too many failed attempts. Please log in again.');
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
        return;
      }
      toast.error('Incorrect code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !verifying) {
      handleVerify();
    }
  }, [code]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center
      justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left panel */}
      <div className="flex-1 flex flex-col items-center justify-center
        px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 decoration-none">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center
              justify-center text-primary-foreground font-bold text-lg">
              E
            </div>
            <span className="text-xl font-bold text-foreground">
              EVONANCE
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex
              items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Two-Factor Auth
            </h1>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Enter the 6-digit code from your authenticator app
              to complete sign-in.
            </p>
          </div>

          {/* OTP Input */}
          <div className="space-y-5">
            <OTPInput
              value={code}
              onChange={val => {
                setCode(val);
                if (error) setError(false);
              }}
              autoFocus={true}
              disabled={verifying}
              error={error}
            />

            {error && (
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive text-center">
                  Incorrect code.
                  {attempts >= 1 && ` ${5 - attempts} attempts remaining.`}
                </p>
              </div>
            )}

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={code.length !== 6 || verifying}
              className="w-full bg-primary text-primary-foreground cursor-pointer
                rounded-xl py-3 font-semibold hover:opacity-90
                transition-opacity disabled:opacity-50
                disabled:cursor-not-allowed
                flex items-center justify-center gap-2">
              {verifying
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                : 'Verify Code'
              }
            </button>

            {/* Authenticator info */}
            <div className="bg-secondary rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">
                  Using authenticator app
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open Google Authenticator, Authy, or 1Password
                and enter the current 6-digit code for EVONANCE.
                Codes refresh every 30 seconds.
              </p>
            </div>

            {/* Trouble signing in */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Having trouble?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setCode('')}
                  className="flex items-center justify-center gap-2 cursor-pointer border-none bg-transparent
                    text-sm text-primary hover:underline">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Clear and try again
                </button>
                <a
                  href="mailto:support@evonance.com?subject=2FA Login Issue"
                  className="flex items-center justify-center gap-2 cursor-pointer
                    text-sm text-muted-foreground hover:text-foreground
                    transition-colors decoration-none">
                  Contact support for help
                </a>
              </div>
            </div>

            {/* Sign out */}
            <div className="pt-2 border-t border-border">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 cursor-pointer border-none bg-transparent
                  text-sm text-muted-foreground hover:text-foreground
                  transition-colors py-2">
                <LogOut className="w-4 h-4" />
                Sign in with a different account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br
        from-primary to-blue-600 items-center justify-center
        relative overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white
          rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-white
          rounded-full blur-3xl opacity-10" />
        <div className="relative z-10 max-w-md px-8 text-center">
          <ShieldCheck className="w-16 h-16 text-white/80 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">
            Keeping You Safe
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Two-factor authentication ensures only you can access
            your account, even if your password is compromised.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Time-based codes that expire in 30 seconds',
              'Works offline — no internet needed in your app',
              'Industry-standard TOTP (RFC 6238) security',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3
                bg-white/10 rounded-xl px-4 py-3">
                <div className="w-5 h-5 rounded-full bg-white/20
                  flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p className="text-white/90 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
