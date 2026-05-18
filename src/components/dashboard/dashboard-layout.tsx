"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, TrendingUp, ArrowLeftRight, CreditCard,
  Wallet, Settings, Bell, Sun, Moon, ChevronLeft, ChevronRight,
  LogOut, HelpCircle, BarChart3, User, Menu, X, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { getUnreadCount } from "@/services/notifications";

// ── Nav items ────────────────────────────────────────────────────
const NAV_PRIMARY = [
  { href: "/dashboard",          icon: LayoutDashboard,  label: "Overview" },
  { href: "/dashboard/wallet",   icon: Wallet,           label: "Wallet" },
  { href: "/trade",              icon: TrendingUp,        label: "Trade" },
  { href: "/dashboard/swap",     icon: ArrowLeftRight,   label: "Swap" },
  { href: "/dashboard/transactions", icon: BarChart3,     label: "History" },
  { href: "/markets",            icon: Globe,            label: "Markets" },
  { href: "/dashboard/cards",    icon: CreditCard,        label: "Cards" },
];

const NAV_SECONDARY = [
  { href: "/dashboard/settings", icon: Settings,  label: "Settings" },
  { href: "/help",               icon: HelpCircle, label: "Help" },
];

// ── Sidebar ──────────────────────────────────────────────────────
function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    const current = resolvedTheme || theme;
    setTheme(current === "dark" ? "light" : "dark");
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const userName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ""}`.trim() 
    : user?.email?.split("@")[0] || "Trader";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full z-40 flex flex-col",
        "sidebar-bg border-r border-sidebar-border",
        "transition-all duration-300 ease-out-expo",
        collapsed ? "w-[64px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-14 px-4 border-b border-sidebar-border shrink-0",
        collapsed ? "justify-center" : "gap-2.5"
      )}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg ev-gradient flex items-center justify-center shadow-glow-primary shrink-0">
            <Wallet className="w-3.5 h-3.5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight font-display whitespace-nowrap overflow-hidden">
              EVO<span className="ev-gradient-text">NANCE</span>
            </span>
          )}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-14 mt-4 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors shadow-ev-2 z-50"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-muted-foreground" />
          : <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        }
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 px-2 mb-2">
            Main
          </p>
        )}
        {NAV_PRIMARY.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-3 h-9 px-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                collapsed && "justify-center"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-primary" />
              )}
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}

        <div className="h-px bg-border/50 my-3 mx-2" />

        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 px-2 mb-2">
            Account
          </p>
        )}
        {NAV_SECONDARY.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-3 h-9 px-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                collapsed && "justify-center"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}

        <button
          onClick={() => signOut()}
          className={cn(
            "relative flex items-center gap-3 h-9 px-2.5 w-full rounded-xl text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-red-500 hover:bg-red-500/5",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </button>
      </nav>

      {/* Bottom: User + Theme */}
      <div className="shrink-0 border-t border-sidebar-border p-2 space-y-1">
        {mounted && (
          <button
            onClick={toggleTheme}
            title={collapsed ? "Toggle theme" : undefined}
            className={cn(
              "w-full flex items-center gap-3 h-9 px-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all",
              collapsed && "justify-center"
            )}
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {!collapsed && <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>
        )}

        <div className={cn(
          "flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-secondary transition-colors cursor-pointer",
          collapsed && "justify-center"
        )}>
          <div className="w-7 h-7 rounded-full ev-gradient flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-none truncate">{userName}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{profile?.kyc_status === "approved" ? "Verified Member" : "Standard Member"}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ── Top Bar ──────────────────────────────────────────────────────
function TopBar({ collapsed, title, onMobileToggle }: { collapsed: boolean; title?: string; onMobileToggle: () => void }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    const count = await getUnreadCount(user.id);
    setUnread(count);
  }, [user]);

  useEffect(() => {
    fetchUnread();
    // Refresh every minute
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-14 flex items-center px-5 bg-background/90 backdrop-blur-xl border-b border-border transition-all duration-300 ease-out-expo",
        "left-0 lg:left-[220px]",
        collapsed && "lg:left-[64px]"
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu toggle */}
        <button className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary" onClick={onMobileToggle}>
          <Menu className="w-4 h-4" />
        </button>
        {title && <p className="text-sm font-semibold text-foreground hidden sm:block">{title}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Link href="/dashboard/cards" className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl ev-gradient text-white text-xs font-semibold shadow-glow-primary">
          <CreditCard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Get Card from $1</span>
        </Link>
        <Link href="/dashboard/notifications" className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
          )}
        </Link>
      </div>
    </header>
  );
}

// ── Dashboard Layout ─────────────────────────────────────────────
export function DashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm lg:hidden"
            />
            {/* Sidebar Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] w-72 lg:hidden"
            >
              <div className="h-full sidebar-bg border-r border-sidebar-border">
                <div className="flex items-center justify-between h-14 px-4 border-b border-sidebar-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg ev-gradient flex items-center justify-center">
                      <Wallet className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold font-display">EVONANCE</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100%-3.5rem)]">
                   <SidebarContent mobile onSelect={() => setMobileOpen(false)} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <TopBar collapsed={collapsed} title={title} onMobileToggle={() => setMobileOpen(true)} />
      
      <main
        className={cn(
          "min-h-screen pt-14 transition-all duration-300 ease-out-expo",
          "pl-0 lg:pl-[220px]",
          collapsed && "lg:pl-[64px]"
        )}
      >
        <div className="p-5 md:p-6 lg:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={usePathname()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ── Sidebar Content Helper ─────────────────────────────────────────
function SidebarContent({ mobile, onSelect }: { mobile?: boolean; onSelect?: () => void }) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    const current = resolvedTheme || theme;
    setTheme(current === "dark" ? "light" : "dark");
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const userName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ""}`.trim() 
    : user?.email?.split("@")[0] || "Trader";

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 px-2 mb-2">Main</p>
        {NAV_PRIMARY.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onSelect}
            className={cn(
              "flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-all",
              isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="h-px bg-border/50 my-4 mx-2" />
        
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 px-2 mb-2">Account</p>
        {NAV_SECONDARY.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onSelect}
            className={cn(
              "flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-all",
              isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          onClick={() => { signOut(); onSelect?.(); }}
          className="flex items-center gap-3 h-10 px-3 w-full rounded-xl text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </nav>

      <div className="mt-auto pt-4 space-y-2 border-t border-border/50">
        {mounted && (
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 h-10 px-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
        )}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/30">
          <div className="w-8 h-8 rounded-full ev-gradient flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{profile?.kyc_status === "approved" ? "Verified Member" : "Standard Member"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
