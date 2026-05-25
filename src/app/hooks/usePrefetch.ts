import { useCallback } from 'react';

// Map route paths to their lazy import functions
const PREFETCH_MAP: Record<string, () => Promise<any>> = {
  '/dashboard':    () => import('../pages/Dashboard'),
  '/trade':        () => import('../pages/Trade'),
  '/swap':         () => import('../pages/Swap'),
  '/cards':        () => import('../pages/CardManagement'),
  '/settings':     () => import('../pages/Settings'),
  '/referral':     () => import('../pages/Referral'),
  '/kyc':          () => import('../pages/KYCOnboarding'),
  '/notifications':() => import('../pages/Notifications'),
  '/login':        () => import('../pages/Login'),
  '/signup':       () => import('../pages/Signup'),
  '/help':         () => import('../pages/HelpCenter'),
  '/privacy':      () => import('../pages/legal/PrivacyPolicy'),
  '/terms':        () => import('../pages/legal/TermsOfService'),
  '/admin':        () => import('../pages/admin/AdminOverview'),
};

export function usePrefetch() {
  const prefetch = useCallback((path: string) => {
    const importFn = PREFETCH_MAP[path];
    if (importFn) {
      // Fire and forget — just warm up the chunk
      importFn().catch(() => {});
    }
  }, []);

  return prefetch;
}

// Hook for a prefetch-on-hover Link
// Usage: <PrefetchLink to="/trade">Trade</PrefetchLink>
export function usePrefetchLink(to: string) {
  const prefetch = usePrefetch();

  const handleMouseEnter = useCallback(() => {
    prefetch(to);
  }, [to, prefetch]);

  const handleFocus = useCallback(() => {
    prefetch(to);
  }, [to, prefetch]);

  return { onMouseEnter: handleMouseEnter, onFocus: handleFocus };
}
