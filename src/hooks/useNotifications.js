import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    const {
      data,
      error,
    } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error.message);
      return;
    }

    setNotifications(data || []);
    setUnreadCount(data.filter((n) => !n.is_read).length);
  }, []);

  // Mark a specific notification as read
  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Failed to mark notification as read:', error.message);
      return;
    }

    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  // Optional: Mark all notifications as read
  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) {
      console.error('Failed to mark all as read:', error.message);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);
  };

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Optional: Real-time updates (enable if you want live notifications)
  /*
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Notification change:', payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);
  */

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
};
