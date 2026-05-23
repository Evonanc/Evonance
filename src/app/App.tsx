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
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import CookiePolicy from './pages/legal/CookiePolicy';
import Compliance from './pages/legal/Compliance';
import HelpCenter from './pages/HelpCenter';
import HelpArticle from './pages/HelpArticle';

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
        
        <Route path="/privacy"    element={<PageTransitionWrapper><PrivacyPolicy /></PageTransitionWrapper>} />
        <Route path="/terms"      element={<PageTransitionWrapper><TermsOfService /></PageTransitionWrapper>} />
        <Route path="/cookies"    element={<PageTransitionWrapper><CookiePolicy /></PageTransitionWrapper>} />
        <Route path="/compliance" element={<PageTransitionWrapper><Compliance /></PageTransitionWrapper>} />
        <Route path="/help"             element={<PageTransitionWrapper><HelpCenter /></PageTransitionWrapper>} />
        <Route path="/help/:articleId"  element={<PageTransitionWrapper><HelpArticle /></PageTransitionWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}
