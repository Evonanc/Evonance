"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Bell, Check, Trash2, ArrowUpRight, ArrowDownLeft,
  ShoppingBag, CreditCard, Shield, Zap, Info,
  AlertCircle, ChevronRight, RefreshCw, CheckCircle2
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getNotifications, markRead, markAllRead } from "@/services/notifications";
import type { Notification } from "@/types/database";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async (uid: string) => {
    const data = await getNotifications(uid, 50);
    setNotifications(data as Notification[]);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id).finally(() => setLoading(false));
    }
  }, [user, fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    if (!user) return;
    await markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "trade": return ArrowUpRight;
      case "swap": return RefreshCw;
      case "card": return ShoppingBag;
      case "account": return CreditCard;
      case "security": return Shield;
      case "system": return Zap;
      default: return Info;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "trade": return "text-blue-500 bg-blue-500/10";
      case "swap": return "text-purple-500 bg-purple-500/10";
      case "card": return "text-orange-500 bg-orange-500/10";
      case "account": return "text-green-500 bg-green-500/10";
      case "security": return "text-red-500 bg-red-500/10";
      default: return "text-primary bg-primary/10";
    }
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold font-display">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Stay updated with your account activity</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="h-9 px-4 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl w-fit">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 h-8 rounded-lg text-xs font-medium transition-all",
              filter === "all" ? "bg-white dark:bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={cn(
              "px-4 h-8 rounded-lg text-xs font-medium transition-all flex items-center gap-2",
              filter === "unread" ? "bg-white dark:bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Fetching alerts...</p>
            </div>
          ) : filtered.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filtered.map((n) => {
                const Icon = getIcon(n.type);
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "ev-card p-4 flex items-start gap-4 transition-all group",
                      !n.read ? "border-primary/20 bg-primary/5" : "hover:bg-secondary/30"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", getIconColor(n.type))}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold">{n.title}</h3>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-primary/10 text-primary transition-all"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <div className="ev-card h-64 flex flex-col items-center justify-center p-8 text-center bg-secondary/20 border-dashed">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-muted-foreground/30" />
              </div>
              <h3 className="font-bold text-sm">All caught up!</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                You have no {filter === "unread" ? "unread " : ""}notifications at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
