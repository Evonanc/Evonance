import React, { useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email address'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/auth/callback?type=recovery',
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center
        px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center
              justify-center text-primary-foreground font-bold text-lg">
              E
            </div>
            <span className="text-xl font-bold text-foreground">EVONANCE</span>
          </Link>

          {!sent ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                  Forgot password?
                </h1>
                <p className="text-muted-foreground mt-2">
                  No worries. Enter your email and we'll send you
                  a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-foreground
                    block mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                      w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full bg-input-background border border-border
                        rounded-lg pl-10 pr-4 py-3 text-foreground
                        placeholder:text-muted-foreground focus:outline-none
                        focus:border-primary focus:ring-2 focus:ring-primary/20
                        transition-all"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-primary text-primary-foreground
                    rounded-xl py-3 font-semibold hover:opacity-90 cursor-pointer
                    transition-opacity disabled:opacity-50
                    disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30
                        border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>

              </form>

              {/* Back to login */}
              <div className="mt-6 text-center">
                <Link to="/login"
                  className="flex items-center justify-center gap-2
                    text-sm text-muted-foreground hover:text-foreground
                    transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            /* Sent confirmation state */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex
                items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Check your email
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  We sent a password reset link to
                  <span className="text-foreground font-medium block mt-1">
                    {email}
                  </span>
                </p>
              </div>

              <div className="bg-secondary rounded-xl p-4 text-left space-y-2">
                <p className="text-xs font-medium text-foreground">
                  Didn't receive the email?
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure the email address is correct</li>
                  <li>• The link expires in 60 minutes</li>
                </ul>
              </div>

              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="w-full border border-border bg-background cursor-pointer
                  text-foreground rounded-xl py-3 font-semibold
                  hover:bg-secondary transition-colors">
                Try a different email
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full text-sm text-primary hover:underline cursor-pointer
                  font-medium">
                {loading ? 'Sending...' : 'Resend email'}
              </button>

              <Link to="/login"
                className="flex items-center justify-center gap-2
                  text-sm text-muted-foreground hover:text-foreground
                  transition-colors mt-2">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right panel — gradient (same as Login) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br
        from-primary to-blue-600 items-center justify-center
        relative overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white
          rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-white
          rounded-full blur-3xl opacity-10" />
        <div className="relative z-10 max-w-md px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Secure Account Recovery
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            We take security seriously. Password reset links expire
            in 60 minutes and can only be used once.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'End-to-end encrypted reset links',
              'Single-use tokens for maximum security',
              'Instant email delivery worldwide',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3
                bg-white/10 rounded-xl px-4 py-3">
                <div className="w-5 h-5 rounded-full bg-white/20
                  flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <p className="text-white/90 text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
