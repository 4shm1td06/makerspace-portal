// src/context/NotificationContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    const cached = localStorage.getItem('readNotificationIds');
    return cached ? JSON.parse(cached) : [];
  });

  // 🔄 Sync unreadCount whenever notifications or read IDs change
  useEffect(() => {
    const unread = notifications.filter((n) => !readNotificationIds.includes(n.id)).length;
    setUnreadCount(unread);
  }, [notifications, readNotificationIds]);

  // 📥 Load notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch notifications:', error);
    } else {
      // Merge with cached read status
      const updated = data.map((n) => ({
        ...n,
        is_read: readNotificationIds.includes(n.id),
      }));
      setNotifications(updated);
    }
  }, [readNotificationIds]);

  // ✅ Mark as read (updates local state + cache)
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

    // Optionally also update DB status if needed:
    // await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const resetNotificationState = () => {
    setReadNotificationIds([]);
    localStorage.removeItem('readNotificationIds');
  };

  useEffect(() => {
    fetchNotifications();
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
