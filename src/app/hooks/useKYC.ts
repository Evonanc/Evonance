import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { getKYC, KYC, KYC_LIMITS } from '../lib/db';

export function useKYC() {
  const { user } = useAuth();
  const [kyc, setKyc]       = useState<KYC | null>(null);
  const [loading, setLoading] = useState(true);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!user) {
      if (isMountedRef.current) {
        setLoading(false);
      }
      return;
    }
    const data = await getKYC(user.id);
    if (isMountedRef.current) {
      setKyc(data);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const level      = kyc?.level ?? 0;
  const status     = kyc?.status ?? 'unverified';
  const limits     = KYC_LIMITS[level] ?? KYC_LIMITS[0];
  const isVerified = status === 'verified';
  const isPending  = status === 'pending';

  return { kyc, loading, level, status, limits,
           isVerified, isPending, refresh: load };
}
