import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Swap from './pages/Swap';
import Trade from './pages/Trade';
import CardManagement from './pages/CardManagement';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';
import Settings from './pages/Settings'; // Re-trigger TypeScript server cache validation
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Notifications from './pages/Notifications';
import KYCOnboarding from './pages/KYCOnboarding';
import Referral from './pages/Referral';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import CookiePolicy from './pages/legal/CookiePolicy';
import Compliance from './pages/legal/Compliance';
import HelpCenter from './pages/HelpCenter';
import HelpArticle from './pages/HelpArticle';
import Verify2FA from './pages/Verify2FA';
import InstallGuide from './pages/InstallGuide';
import OfflineBanner from './components/OfflineBanner';
import PWAUpdateBanner from './components/PWAUpdateBanner';

import AdminOverview     from './pages/admin/AdminOverview';
import AdminUsers        from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminKYC          from './pages/admin/AdminKYC';
import AdminReferrals    from './pages/admin/AdminReferrals';
import AdminAudit        from './pages/admin/AdminAudit';
import AdminSettings     from './pages/admin/AdminSettings';

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
        <Route path="/admin"              element={<ProtectedRoute><AdminOverview /></ProtectedRoute>} />
        <Route path="/admin/users"        element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/transactions" element={<ProtectedRoute><AdminTransactions /></ProtectedRoute>} />
        <Route path="/admin/kyc"          element={<ProtectedRoute><AdminKYC /></ProtectedRoute>} />
        <Route path="/admin/referrals"    element={<ProtectedRoute><AdminReferrals /></ProtectedRoute>} />
        <Route path="/admin/audit"        element={<ProtectedRoute><AdminAudit /></ProtectedRoute>} />
        <Route path="/admin/settings"     element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
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
    </ThemeProvider>
  );
}
