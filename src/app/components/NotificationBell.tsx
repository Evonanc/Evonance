import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useNotifications } from '../hooks/useNotifications';
import {
  Bell, BellOff, Check, CheckCheck,
  Trash2, X, TrendingUp, ArrowDownLeft,
  ArrowUpRight, ArrowLeftRight, Shield,
  CreditCard, Info, Zap,
} from 'lucide-react';

// Icon and color per notification type
const TYPE_CONFIG = {
  trade:       { icon: TrendingUp,      color: 'text-primary',     bg: 'bg-primary/10' },
  deposit:     { icon: ArrowDownLeft,   color: 'text-success',     bg: 'bg-success/10' },
  withdrawal:  { icon: ArrowUpRight,    color: 'text-destructive', bg: 'bg-destructive/10' },
  send:        { icon: ArrowUpRight,    color: 'text-destructive', bg: 'bg-destructive/10' },
  receive:     { icon: ArrowDownLeft,   color: 'text-success',     bg: 'bg-success/10' },
  swap:        { icon: ArrowLeftRight,  color: 'text-primary',     bg: 'bg-primary/10' },
  price_alert: { icon: Zap,            color: 'text-warning',     bg: 'bg-warning/10' },
  security:    { icon: Shield,          color: 'text-destructive', bg: 'bg-destructive/10' },
  system:      { icon: Info,            color: 'text-primary',     bg: 'bg-primary/10' },
  card:        { icon: CreditCard,      color: 'text-primary',     bg: 'bg-primary/10' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000)    return 'Just now';
  if (diff < 3_600_000) return Math.floor(diff / 60_000) + 'm ago';
  if (diff < 86_400_000)return Math.floor(diff / 3_600_000) + 'h ago';
  if (diff < 604_800_000)return Math.floor(diff / 86_400_000) + 'd ago';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  });
}

function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications, unreadCount, loading,
    markAsRead, markAllAsRead,
    deleteNotification, clearAll,
  } = useNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const handleNotifClick = useCallback((notif: typeof notifications[0]) => {
    markAsRead(notif.id);
    if (notif.action_url) {
      navigate(notif.action_url);
      setOpen(false);
    }
  }, [markAsRead, navigate]);

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative p-2 rounded-lg transition-colors cursor-pointer
          ${open
            ? 'bg-secondary text-foreground'
            : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
          }`}>
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
            rounded-full bg-destructive text-destructive-foreground text-[10px]
            font-bold flex items-center justify-center px-1 leading-none
            animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 w-96 bg-card border
          border-border rounded-2xl shadow-2xl z-50 overflow-hidden
          max-h-[520px] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
            border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-destructive text-destructive-foreground
                  rounded-full px-2 py-0.5 font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer
                    text-muted-foreground hover:text-foreground
                    transition-colors">
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Clear all"
                  className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer
                    text-muted-foreground hover:text-destructive
                    transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer
                  text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-border flex-shrink-0">
            {(['all', 'unread'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 text-sm font-semibold transition-colors cursor-pointer
                  capitalize ${filter === f
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}>
                {f === 'unread' && unreadCount > 0
                  ? `Unread (${unreadCount})`
                  : f.charAt(0).toUpperCase() + f.slice(1)
                }
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-3/4 rounded" />
                      <div className="skeleton h-3 w-full rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center
                py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-secondary flex
                  items-center justify-center mb-3">
                  <BellOff className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {filter === 'unread'
                    ? 'All caught up!'
                    : 'No notifications yet'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-semibold">
                  {filter === 'unread'
                    ? 'You have no unread notifications'
                    : 'Notifications will appear here'
                  }
                </p>
              </div>
            ) : (
              <div>
                {filtered.map(notif => {
                  const config = TYPE_CONFIG[notif.type] ??
                    TYPE_CONFIG.system;
                  const Icon = config.icon;
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`flex gap-3 px-4 py-3 cursor-pointer
                        transition-colors hover:bg-secondary group
                        ${!notif.read ? 'bg-primary/[0.02]' : ''}`}>

                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex-shrink-0
                        flex items-center justify-center
                        ${config.bg}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug
                            ${notif.read
                              ? 'text-foreground font-normal'
                              : 'text-foreground font-bold'
                            }`}>
                            {notif.title}
                          </p>
                          <div className="flex items-center gap-1
                            flex-shrink-0 opacity-0 group-hover:opacity-100
                            transition-opacity">
                            {!notif.read && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  markAsRead(notif.id);
                                }}
                                title="Mark as read"
                                className="p-1 rounded hover:bg-secondary cursor-pointer
                                  text-muted-foreground hover:text-foreground">
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={e => {
                                  e.stopPropagation();
                                  deleteNotification(notif.id);
                                }}
                              title="Delete"
                              className="p-1 rounded hover:bg-secondary cursor-pointer
                                text-muted-foreground hover:text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5
                          leading-relaxed line-clamp-2 font-semibold">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1 font-semibold">
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-primary
                          flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-border px-4 py-3 flex-shrink-0">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setOpen(false);
                }}
                className="w-full text-center text-sm text-primary cursor-pointer
                  hover:underline font-semibold">
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(NotificationBell);
