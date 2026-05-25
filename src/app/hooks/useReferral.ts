import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import {
  getReferralSettings, getReferrals,
  ReferralSettings, Referral,
  REFERRAL_REWARDS,
} from '../lib/db';

export function useReferral() {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading]     = useState(true);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      console.log('[useReferral] No authenticated user found. Setting loading to false.');
      if (isMountedRef.current) {
        setLoading(false);
      }
      return;
    }
    console.log('[useReferral] Fetching referral data for user:', user.id);
    try {
      const [s, r] = await Promise.all([
        getReferralSettings(user.id),
        getReferrals(user.id),
      ]);
      console.log('[useReferral] Loaded settings:', s, 'and referrals:', r);
      if (isMountedRef.current) {
        setSettings(s);
        setReferrals(r);
      }
    } catch (err) {
      console.error('[useReferral] Error fetching referral data:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    load();
  }, [load]);

  const referralLink = settings
    ? `${window.location.origin}/signup?ref=${settings.code}`
    : '';

  const pendingRewards = referrals
    .filter(r => r.status === 'qualified' && !r.reward_credited)
    .reduce((sum, r) => sum + r.reward_amount, 0);

  const statusCounts = {
    total:     referrals.filter(r => r.status !== 'pending').length,
    signedUp:  referrals.filter(r => r.status === 'signed_up').length,
    qualified: referrals.filter(r => r.status === 'qualified').length,
    rewarded:  referrals.filter(r => r.status === 'rewarded').length,
    pending:   referrals.filter(r => r.status === 'pending').length,
  };

  return {
    settings,
    referrals,
    loading,
    referralLink,
    pendingRewards,
    statusCounts,
    rewards: REFERRAL_REWARDS,
    refresh: load,
  };
}
