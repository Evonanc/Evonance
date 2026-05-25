import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import {
  getNotifications, getUnreadCount,
  markAsRead, markAllAsRead,
  deleteNotification, clearAllNotifications,
  Notification,
} from '../lib/db';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(user.id),
        getUnreadCount(user.id),
      ]);
      if (isMountedRef.current) {
        setNotifications(notifs);
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Notifications load error:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Supabase Realtime — listen for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications:' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          if (isMountedRef.current) {
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
          // Browser notification if permission granted
          if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
            new window.Notification(newNotif.title, {
              body: newNotif.message,
              icon: '/favicon.svg',
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    await markAsRead(user.id, id);
    if (isMountedRef.current) {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
    if (isMountedRef.current) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const notif = notifications.find(n => n.id === id);
    await deleteNotification(user.id, id);
    if (isMountedRef.current) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notif && !notif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    await clearAllNotifications(user.id);
    if (isMountedRef.current) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    refresh: load,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    clearAll: handleClearAll,
  };
}
