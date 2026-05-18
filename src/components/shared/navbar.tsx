"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Menu, X, Sun, Moon, ChevronDown,
  LayoutDashboard, ArrowLeftRight, TrendingUp,
  CreditCard, Wallet, Bell, Search, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const NAV = [
  { label: "Markets",   href: "/markets" },
  { label: "Trade",     href: "/trade" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Cards",     href: "/dashboard/cards" },
];

export function Navbar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const toggleTheme = () => {
    const current = resolvedTheme || theme;
    setTheme(current === "dark" ? "light" : "dark");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/90 backdrop-blur-2xl border-b border-border/60 shadow-ev-1"
            : "bg-transparent"
        )}
      >
        <div className="page-container">
          <div className="flex items-center h-16 gap-8">
            {/* ─ Logo ─ */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-xl ev-gradient flex items-center justify-center shadow-glow-primary transition-transform duration-300 group-hover:scale-105">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight font-display">
                EVO<span className="ev-gradient-text">NANCE</span>
              </span>
            </Link>

            {/* ─ Desktop Nav ─ */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive(item.href)
                      ? "text-primary bg-primary/8"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* ─ Right Actions ─ */}
            <div className="hidden md:flex items-center gap-2 ml-auto">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={resolvedTheme}
                      initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      {resolvedTheme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              )}

              <div className="h-4 w-px bg-border mx-1" />

              {!loading && (
                user ? (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 h-10 px-4 rounded-xl ev-gradient text-white text-sm font-semibold shadow-glow-primary transition-all hover:opacity-90"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="btn-amber h-9 px-5 text-sm shadow-amber"
                    >
                      Start for Free
                    </Link>
                  </>
                )
              )}
            </div>

            {/* ─ Mobile Toggle ─ */}
            <button
              className="lg:hidden ml-auto w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ─ Mobile Menu ─ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 lg:hidden bg-background/95 backdrop-blur-2xl border-b border-border"
          >
            <div className="page-container py-6 flex flex-col gap-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary/8 text-primary"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  {item.label}
                  <ChevronDown className="w-4 h-4 -rotate-90 text-muted-foreground" />
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-border">
                {!loading && (
                  user ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-3.5 text-center text-sm font-semibold rounded-xl ev-gradient text-white shadow-glow-primary"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="w-full py-3 text-center text-sm font-medium rounded-xl border border-border hover:bg-secondary transition-colors"
                      >
                        Log In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="btn-amber w-full py-3 text-sm text-center"
                      >
                        Start for Free
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
