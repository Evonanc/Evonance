import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase puts the token in the URL hash
    // getSession() automatically reads and exchanges it
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=callback_failed');
        return;
      }
      if (session) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    });
  }, [navigate]);

  // Show branded loading screen while processing
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center
          justify-center text-primary-foreground font-bold text-xl animate-pulse">
          E
        </div>
        <p className="text-sm text-muted-foreground">Verifying your account...</p>
        <div className="w-6 h-6 border-2 border-border border-t-primary
          rounded-full animate-spin" />
      </div>
    </div>
  );
}
