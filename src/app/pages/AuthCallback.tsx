/*
  SUPABASE EMAIL TEMPLATES — configure in Supabase Dashboard:
  Authentication → Email Templates

  1. Confirm signup:
     Subject: Confirm your EVONANCE account
     Redirect URL: https://evonance.vercel.app/auth/callback?type=signup

  2. Reset password:
     Subject: Reset your EVONANCE password
     Redirect URL: https://evonance.vercel.app/auth/callback?type=recovery

  3. Authentication → URL Configuration:
     Add these redirect URLs:
     https://evonance.vercel.app/auth/callback
     https://evonance.vercel.app/auth/callback?type=signup
     https://evonance.vercel.app/auth/callback?type=recovery
     http://localhost:5173/auth/callback
*/

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { supabase } from '../lib/supabase';

type CallbackState =
  | 'processing'
  | 'success_signup'
  | 'success_recovery'
  | 'error';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<CallbackState>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const type = searchParams.get('type');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle error from Supabase
    if (errorParam) {
      setErrorMsg(errorDescription ?? 'Authentication failed');
      setState('error');
      return;
    }

    // Exchange the token from URL hash/params
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        // Try to get session from URL hash (Supabase v2 puts token in hash)
        const hash = window.location.hash;
        if (hash.includes('access_token')) {
          // Supabase SDK automatically parses this — wait briefly and retry
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: { session: s } }) => {
              if (s) {
                handleSuccess(type, s);
              } else {
                setErrorMsg('Session could not be established. Please try again.');
                setState('error');
              }
            });
          }, 500);
        } else {
          setErrorMsg(error?.message ?? 'Authentication failed. Link may have expired.');
          setState('error');
        }
        return;
      }
      handleSuccess(type, session);
    });
  }, []);

  const handleSuccess = (type: string | null, session: any) => {
    if (type === 'recovery') {
      // Password reset — go to reset password page
      setState('success_recovery');
      setTimeout(() => navigate('/reset-password'), 1500);
    } else if (type === 'signup') {
      // Email confirmed — go to dashboard
      setState('success_signup');
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      // OAuth or generic — go to dashboard
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">

        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center
          justify-center text-primary-foreground font-bold text-2xl mx-auto mb-6">
          E
        </div>

        {/* Processing */}
        {state === 'processing' && (
          <div className="space-y-3">
            <div className="w-8 h-8 border-2 border-border border-t-primary
              rounded-full animate-spin mx-auto" />
            <p className="text-foreground font-medium">Verifying...</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your details
            </p>
          </div>
        )}

        {/* Success — signup confirmed */}
        {state === 'success_signup' && (
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center
              justify-center mx-auto">
              <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p className="text-xl font-bold text-foreground">Email Confirmed!</p>
            <p className="text-sm text-muted-foreground">
              Your account is verified. Redirecting to dashboard...
            </p>
            <div className="w-6 h-6 border-2 border-border border-t-primary
              rounded-full animate-spin mx-auto mt-2" />
          </div>
        )}

        {/* Success — password recovery */}
        {state === 'success_recovery' && (
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center
              justify-center mx-auto">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <p className="text-xl font-bold text-foreground">Link Verified!</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to reset your password...
            </p>
            <div className="w-6 h-6 border-2 border-border border-t-primary
              rounded-full animate-spin mx-auto mt-2" />
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center
              justify-center mx-auto">
              <svg className="w-7 h-7 text-destructive" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">Link Expired</p>
              <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-primary text-primary-foreground rounded-xl
                  py-3 font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                Back to Login
              </button>
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full border border-border bg-background text-foreground
                  rounded-xl py-3 font-semibold hover:bg-secondary transition-colors cursor-pointer">
                Request New Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
