import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { getAdminRole, AdminRole } from '../lib/admin';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard, Users, ArrowLeftRight,
  ShieldCheck, Gift, ScrollText, Settings,
  LogOut, Sun, Moon, Menu, X,
  ChevronRight, AlertTriangle,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    href: '/admin',
    roles: ['super_admin','admin','support','compliance','finance'],
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    href: '/admin/users',
    roles: ['super_admin','admin','support','compliance'],
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: ArrowLeftRight,
    href: '/admin/transactions',
    roles: ['super_admin','admin','finance'],
  },
  {
    id: 'kyc',
    label: 'KYC Review',
    icon: ShieldCheck,
    href: '/admin/kyc',
    roles: ['super_admin','admin','compliance'],
  },
  {
    id: 'referrals',
    label: 'Referrals',
    icon: Gift,
    href: '/admin/referrals',
    roles: ['super_admin','admin','finance'],
  },
  {
    id: 'audit',
    label: 'Audit Log',
    icon: ScrollText,
    href: '/admin/audit',
    roles: ['super_admin','admin'],
  },
  {
    id: 'settings',
    label: 'Admin Settings',
    icon: Settings,
    href: '/admin/settings',
    roles: ['super_admin'],
  },
];

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({
  children, title, subtitle
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [role, setRole] = useState<AdminRole | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { getAdminRole().then(setRole); }, []);

  const visibleNav = NAV_ITEMS.filter(item =>
    role && item.roles.includes(role.role)
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const ROLE_COLORS: Record<string, string> = {
    super_admin: 'bg-destructive/10 text-destructive',
    admin:       'bg-primary/10 text-primary',
    support:     'bg-warning/10 text-warning',
    compliance:  'bg-purple-500/10 text-purple-500',
    finance:     'bg-success/10 text-success',
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border
        flex flex-col transition-transform duration-300
        lg:translate-x-0 lg:relative lg:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b
          border-border flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center
            justify-center text-primary-foreground font-bold text-sm">
            E
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">EVONANCE</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-muted-foreground
              hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role badge */}
        {role && (
          <div className="px-4 py-3 border-b border-border">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
              ${ROLE_COLORS[role.role] ?? 'bg-secondary text-muted-foreground'}`}>
              {role.role.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleNav.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href ||
              (item.href !== '/admin' &&
               location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5
                  rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-border space-y-1
          flex-shrink-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-sm font-medium text-muted-foreground
              hover:bg-secondary hover:text-foreground transition-all">
            <LayoutDashboard className="w-4 h-4" />
            User Dashboard
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5
              rounded-xl text-sm font-medium text-destructive
              hover:bg-destructive/10 transition-all">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur
          border-b border-border px-4 sm:px-6 py-4 flex items-center
          gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Warning badge for pending KYC */}
            <Link to="/admin/kyc"
              className="flex items-center gap-1.5 text-xs bg-warning/10
                text-warning px-3 py-1.5 rounded-lg font-medium
                hover:bg-warning/20 transition-colors hidden sm:flex">
              <AlertTriangle className="w-3.5 h-3.5" />
              KYC Queue
            </Link>
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(
                theme === 'dark' ? 'light' : 'dark'
              )}
              className="p-2 rounded-lg hover:bg-secondary
                text-muted-foreground hover:text-foreground
                transition-colors">
              {theme === 'dark'
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />
              }
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
