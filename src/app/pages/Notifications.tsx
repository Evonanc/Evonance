import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Navigation from '../components/Navigation';
import { useNotifications } from '../hooks/useNotifications';
import {
  Bell, BellOff, CheckCheck, Trash2,
  TrendingUp, ArrowDownLeft, ArrowUpRight,
  ArrowLeftRight, Shield, CreditCard,
  Info, Zap, Filter,
} from 'lucide-react';

const TYPE_CONFIG = {
  trade:       { icon: TrendingUp,      color: 'text-primary',     bg: 'bg-primary/10',     label: 'Trade' },
  deposit:     { icon: ArrowDownLeft,   color: 'text-success',     bg: 'bg-success/10',     label: 'Deposit' },
  withdrawal:  { icon: ArrowUpRight,    color: 'text-destructive', bg: 'bg-destructive/10', label: 'Withdrawal' },
  send:        { icon: ArrowUpRight,    color: 'text-destructive', bg: 'bg-destructive/10', label: 'Send' },
  receive:     { icon: ArrowDownLeft,   color: 'text-success',     bg: 'bg-success/10',     label: 'Receive' },
  swap:        { icon: ArrowLeftRight,  color: 'text-primary',     bg: 'bg-primary/10',     label: 'Swap' },
  price_alert: { icon: Zap,            color: 'text-warning',     bg: 'bg-warning/10',     label: 'Price Alert' },
  security:    { icon: Shield,          color: 'text-destructive', bg: 'bg-destructive/10', label: 'Security' },
  system:      { icon: Info,            color: 'text-primary',     bg: 'bg-primary/10',     label: 'System' },
  card:        { icon: CreditCard,      color: 'text-primary',     bg: 'bg-primary/10',     label: 'Card' },
};

const FILTER_TABS = [
  'All', 'Trade', 'Deposit', 'Security', 'System'
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000)     return 'Just now';
  if (diff < 3_600_000)  return Math.floor(diff / 60_000) + 'm ago';
  if (diff < 86_400_000) return Math.floor(diff / 3_600_000) + 'h ago';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

export default function Notifications() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');

  const {
    notifications, unreadCount, loading,
    markAsRead, markAllAsRead,
    deleteNotification, clearAll,
  } = useNotifications();

  const filtered = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    const config = TYPE_CONFIG[n.type];
    return config?.label === activeFilter ||
      n.type === activeFilter.toLowerCase();
  });

  // Group by date
  const grouped: Record<string, typeof notifications> = {};
  filtered.forEach(n => {
    const date = new Date(n.created_at);
    const now  = new Date();
    let key: string;
    if (date.toDateString() === now.toDateString()) {
      key = 'Today';
    } else {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      key = date.toDateString() === yesterday.toDateString()
        ? 'Yesterday'
        : date.toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
          });
    }
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation isPublic={false} />
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1 font-semibold">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer
                  border border-border bg-background text-foreground text-sm
                  font-semibold hover:bg-secondary transition-colors">
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer
                  border border-destructive/30 bg-background
                  text-destructive text-sm font-semibold
                  hover:bg-destructive/5 transition-colors">
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold cursor-pointer
                whitespace-nowrap transition-all flex-shrink-0
                ${activeFilter === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-card border border-border
                rounded-xl p-4 flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-secondary flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary w-2/3 rounded" />
                  <div className="h-3 bg-secondary w-full rounded" />
                  <div className="h-3 bg-secondary w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center
            py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex
              items-center justify-center mb-4">
              <BellOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              No notifications
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs font-semibold">
              {activeFilter !== 'All'
                ? `No ${activeFilter.toLowerCase()} notifications yet`
                : "You're all caught up! Notifications will appear here."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, notifs]) => (
              <div key={date}>
                <p className="text-xs font-bold text-muted-foreground
                  uppercase tracking-wider mb-3">
                  {date}
                </p>
                <div className="space-y-2">
                  {notifs.map(notif => {
                    const config = TYPE_CONFIG[notif.type]
                      ?? TYPE_CONFIG.system;
                    const Icon = config.icon;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id);
                          if (notif.action_url) navigate(notif.action_url);
                        }}
                        className={`flex gap-4 p-4 rounded-xl border
                          cursor-pointer transition-all group
                          hover:border-primary/30 hover:shadow-sm
                          ${!notif.read
                            ? 'bg-primary/[0.02] border-primary/20'
                            : 'bg-card border-border'
                          }`}>

                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0
                          flex items-center justify-center ${config.bg}`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm ${
                                  notif.read
                                    ? 'font-medium text-foreground'
                                    : 'font-bold text-foreground'
                                }`}>
                                  {notif.title}
                                </p>
                                {!notif.read && (
                                  <span className="w-2 h-2 rounded-full
                                    bg-primary flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground
                                mt-0.5 leading-relaxed font-semibold">
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] text-muted-foreground/70 font-semibold">
                                  {timeAgo(notif.created_at)}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full
                                  font-semibold ${config.bg} ${config.color}`}>
                                  {config.label}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1
                              opacity-0 group-hover:opacity-100
                              transition-opacity flex-shrink-0">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  deleteNotification(notif.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer
                                  text-muted-foreground hover:text-destructive
                                  transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
