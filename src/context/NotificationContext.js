import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const NotificationContext = createContext(); // 🔧 make it exportable

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    const cached = localStorage.getItem('readNotificationIds');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    const unread = notifications.filter((n) => !readNotificationIds.includes(n.id)).length;
    setUnreadCount(unread);
  }, [notifications, readNotificationIds]);

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
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

    // Optionally update Supabase if needed
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
