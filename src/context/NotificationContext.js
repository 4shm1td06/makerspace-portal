import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    const cached = localStorage.getItem('readNotificationIds');
    return cached ? JSON.parse(cached) : [];
  });

  // Calculate unread count
  useEffect(() => {
    const unread = notifications.filter((n) => !readNotificationIds.includes(n.id)).length;
    setUnreadCount(unread);
  }, [notifications, readNotificationIds]);

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch notifications:', error);
    } else {
      const updated = data.map((n) => ({
        ...n,
        is_read: readNotificationIds.includes(n.id),
      }));
      setNotifications(updated);
    }
  }, [readNotificationIds]);

  // Mark a notification as read
  const markAsRead = async (id) => {
    if (!readNotificationIds.includes(id)) {
      const updatedIds = [...readNotificationIds, id];
      setReadNotificationIds(updatedIds);
      localStorage.setItem('readNotificationIds', JSON.stringify(updatedIds));

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    }

    // Optional: also mark on Supabase if needed
    // await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const resetNotificationState = () => {
    setReadNotificationIds([]);
    localStorage.removeItem('readNotificationIds');
    fetchNotifications();
  };

  // Fetch once on load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time listener
  useEffect(() => {
    let channel;

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, resetNotificationState }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
