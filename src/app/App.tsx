/*
  DEPLOY SUPABASE EDGE FUNCTION:
  ────────────────────────────────
  Run these commands once from your project root:

  1. Install Supabase CLI:
     npm install -g supabase

  2. Login to Supabase:
     supabase login

  3. Link to your project:
     supabase link --project-ref YOUR_PROJECT_REF
     (Find project ref in Supabase Dashboard → Settings → General)

  4. Set Resend API key as secret:
     supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
     supabase secrets set FROM_EMAIL=noreply@yourdomain.com

  5. Deploy the edge function:
     supabase functions deploy send-email

  6. Test it works:
     supabase functions invoke send-email --body '{
       "type": "welcome",
       "to": "test@example.com",
       "data": { "firstName": "Test", "email": "test@example.com" }
     }'

  The edge function URL will be:
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email
  This is already used in src/app/lib/email.ts via VITE_SUPABASE_URL
*/

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';


// Components & Helpers
import ProtectedRoute from './components/ProtectedRoute';
import OfflineBanner from './components/OfflineBanner';
import PWAUpdateBanner from './components/PWAUpdateBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader, AdminPageLoader } from './components/PageLoader';
import PerformanceBadge from './components/PerformanceBadge';

// ── Lazy page imports ─────────────────────────────────────────
// Each page becomes its own JS chunk loaded on demand

// Public pages
const Homepage       = lazy(() => import('./pages/Homepage'));
const Login          = lazy(() => import('./pages/Login'));
const Signup         = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));
const AuthCallback   = lazy(() => import('./pages/AuthCallback'));
const Verify2FA      = lazy(() => import('./pages/Verify2FA'));
const HelpCenter     = lazy(() => import('./pages/HelpCenter'));
const HelpArticle    = lazy(() => import('./pages/HelpArticle'));
const InstallGuide   = lazy(() => import('./pages/InstallGuide'));

// Legal pages
const PrivacyPolicy  = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const CookiePolicy   = lazy(() => import('./pages/legal/CookiePolicy'));
const Compliance     = lazy(() => import('./pages/legal/Compliance'));

// Protected pages — loaded only when user is authenticated
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const Trade          = lazy(() => import('./pages/Trade'));
const Swap           = lazy(() => import('./pages/Swap'));
const CardManagement = lazy(() => import('./pages/CardManagement'));
const Settings       = lazy(() => import('./pages/Settings'));
const Referral       = lazy(() => import('./pages/Referral'));
const KYCOnboarding  = lazy(() => import('./pages/KYCOnboarding'));
const Notifications  = lazy(() => import('./pages/Notifications'));

// Admin pages — only loaded if user is admin
const AdminOverview     = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));
const AdminKYC          = lazy(() => import('./pages/admin/AdminKYC'));
const AdminReferrals    = lazy(() => import('./pages/admin/AdminReferrals'));
const AdminWithdrawals  = lazy(() => import('./pages/admin/AdminWithdrawals'));
const AdminAudit        = lazy(() => import('./pages/admin/AdminAudit'));
const AdminSettings     = lazy(() => import('./pages/admin/AdminSettings'));

function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? {} : { opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransitionWrapper><Homepage /></PageTransitionWrapper>} />
            <Route path="/login" element={<PageTransitionWrapper><Login /></PageTransitionWrapper>} />
            <Route path="/signup" element={<PageTransitionWrapper><Signup /></PageTransitionWrapper>} />
            <Route path="/forgot-password" element={<PageTransitionWrapper><ForgotPassword /></PageTransitionWrapper>} />
            <Route path="/reset-password" element={<PageTransitionWrapper><ResetPassword /></PageTransitionWrapper>} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageTransitionWrapper>
                  <Dashboard />
                </PageTransitionWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/swap" element={
              <ProtectedRoute>
                <PageTransitionWrapper>
                  <Swap />
                </PageTransitionWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/trade" element={
              <ProtectedRoute>
                <PageTransitionWrapper>
                  <Trade />
                </PageTransitionWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/cards" element={
              <ProtectedRoute>
                <PageTransitionWrapper>
                  <CardManagement />
                </PageTransitionWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <PageTransitionWrapper>
                  <Settings />
                </PageTransitionWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute>
                <PageTransitionWrapper>
                  <Notifications />
                </PageTransitionWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/kyc" element={
              <ProtectedRoute>
                <PageTransitionWrapper>
                  <KYCOnboarding />
                </PageTransitionWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/referral" element={
              <ProtectedRoute>
                <PageTransitionWrapper>
                  <Referral />
                </PageTransitionWrapper>
              </ProtectedRoute>
            } />
            
            <Route path="/privacy"    element={<PageTransitionWrapper><PrivacyPolicy /></PageTransitionWrapper>} />
            <Route path="/terms"      element={<PageTransitionWrapper><TermsOfService /></PageTransitionWrapper>} />
            <Route path="/cookies"    element={<PageTransitionWrapper><CookiePolicy /></PageTransitionWrapper>} />
            <Route path="/compliance" element={<PageTransitionWrapper><Compliance /></PageTransitionWrapper>} />
            <Route path="/help"             element={<PageTransitionWrapper><HelpCenter /></PageTransitionWrapper>} />
            <Route path="/help/:articleId"  element={<PageTransitionWrapper><HelpArticle /></PageTransitionWrapper>} />
            <Route path="/verify-2fa"       element={<PageTransitionWrapper><Verify2FA /></PageTransitionWrapper>} />
            <Route path="/install"          element={<PageTransitionWrapper><InstallGuide /></PageTransitionWrapper>} />

            {/* Admin routes — ProtectedRoute (auth) + AdminGuard (role) inside each page */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminOverview />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminUsers />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/transactions" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminTransactions />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/withdrawals" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminWithdrawals />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/kyc" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminKYC />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/referrals" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminReferrals />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/audit" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminAudit />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <Suspense fallback={<AdminPageLoader />}>
                  <AdminSettings />
                </Suspense>
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <OfflineBanner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
      <Toaster position="top-right" />
      <PWAUpdateBanner />
      {import.meta.env.DEV && <PerformanceBadge />}
    </ThemeProvider>
  );
}
