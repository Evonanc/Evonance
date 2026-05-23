import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);

  // Password strength
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8)           score++;
    if (pwd.length >= 12)          score++;
    if (/[A-Z]/.test(pwd))         score++;
    if (/[0-9]/.test(pwd))         score++;
    if (/[^A-Za-z0-9]/.test(pwd))  score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = [
    '', 'bg-destructive', 'bg-warning',
    'bg-yellow-500', 'bg-success', 'bg-success'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { toast.error('Enter a new password'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (strength < 3) { toast.error('Please use a stronger password'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success('Password updated successfully');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left panel */}
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

          {!success ? (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex
                  items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Set new password
                </h1>
                <p className="text-muted-foreground mt-2 font-medium">
                  {user?.email
                    ? `Resetting password for ${user.email}`
                    : 'Create a strong new password for your account'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* New password */}
                <div>
                  <label className="text-sm font-medium text-foreground
                    block mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full bg-input-background border border-border
                        rounded-lg px-4 pr-10 py-3 text-foreground
                        placeholder:text-muted-foreground focus:outline-none
                        focus:border-primary focus:ring-2 focus:ring-primary/20
                        transition-all"
                    />
                    <button type="button"
                      onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer
                        text-muted-foreground hover:text-foreground">
                      {showPwd
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all
                              duration-300 ${i <= strength
                                ? strengthColors[strength]
                                : 'bg-secondary'
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Strength:{' '}
                        <span className="font-semibold text-foreground">
                          {strengthLabels[strength]}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Requirements checklist */}
                  {password.length > 0 && (
                    <div className="mt-3 space-y-1 animate-in fade-in duration-300">
                      {[
                        { label: 'At least 8 characters', met: password.length >= 8 },
                        { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
                        { label: 'One number', met: /[0-9]/.test(password) },
                        { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
                      ].map(req => (
                        <div key={req.label}
                          className="flex items-center gap-2 text-xs font-medium">
                          <div className={`w-3.5 h-3.5 rounded-full flex
                            items-center justify-center flex-shrink-0 transition-colors
                            ${req.met
                              ? 'bg-success/20 text-success'
                              : 'bg-secondary text-muted-foreground border border-border/30'
                            }`}>
                            {req.met && (
                              <svg className="w-2 h-2" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor"
                                strokeWidth={3}>
                                <path strokeLinecap="round"
                                  strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </div>
                          <span className={req.met
                            ? 'text-foreground'
                            : 'text-muted-foreground'}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-sm font-medium text-foreground
                    block mb-1.5">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`w-full bg-input-background border rounded-lg
                        px-4 pr-10 py-3 text-foreground
                        placeholder:text-muted-foreground focus:outline-none
                        focus:ring-2 transition-all
                        ${confirm && confirm !== password
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : confirm && confirm === password
                            ? 'border-success focus:border-success focus:ring-success/20'
                            : 'border-border focus:border-primary focus:ring-primary/20'
                        }`}
                    />
                    <button type="button"
                      onClick={() => setShowConfirm(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer
                        text-muted-foreground hover:text-foreground">
                      {showConfirm
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-xs text-destructive mt-1 font-semibold animate-in fade-in duration-150">
                      Passwords do not match
                    </p>
                  )}
                  {confirm && confirm === password && (
                    <p className="text-xs text-success mt-1 font-semibold animate-in fade-in duration-150">
                      Passwords match ✓
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !password || password !== confirm || strength < 3}
                  className="w-full bg-primary text-primary-foreground
                    rounded-xl py-3 font-semibold hover:opacity-90 cursor-pointer
                    transition-opacity disabled:opacity-50
                    disabled:cursor-not-allowed mt-2">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30
                        border-t-white rounded-full animate-spin" />
                      Updating password...
                    </span>
                  ) : 'Update Password'}
                </button>

              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex
                items-center justify-center mx-auto animate-in zoom-in duration-300">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Password Updated!
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Your password has been changed successfully.
                  Redirecting to dashboard...
                </p>
              </div>
              <div className="w-6 h-6 border-2 border-border border-t-primary
                rounded-full animate-spin mx-auto" />
            </div>
          )}
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
          <h2 className="text-4xl font-bold text-white mb-4">
            Keep Your Account Safe
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Use a unique password you don't use on any other
            site to keep your assets secure.
          </p>
        </div>
      </div>

    </div>
  );
}
