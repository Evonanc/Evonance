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
        <Route path="/dashboard" element={<PageTransitionWrapper><Dashboard /></PageTransitionWrapper>} />
        <Route path="/swap" element={<PageTransitionWrapper><Swap /></PageTransitionWrapper>} />
        <Route path="/trade" element={<PageTransitionWrapper><Trade /></PageTransitionWrapper>} />
        <Route path="/cards" element={<PageTransitionWrapper><CardManagement /></PageTransitionWrapper>} />
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
