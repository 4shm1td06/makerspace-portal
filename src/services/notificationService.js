import { supabase } from './supabase';

export const notificationService = {
  // Get all notifications for a user or global (broadcast)
  async getAll(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Count all unread notifications (including broadcasts)
  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .or(`user_id.eq.${userId},user_id.is.null`);

    return { count, error };
  },

  // Mark one notification as read
  async markAsRead(id) {
    return supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
  },

  // Mark all notifications for user (and broadcasts) as read
  async markAllAsRead(userId) {
    return supabase
      .from('notifications')
      .update({ is_read: true })
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('is_read', false);
  },

  // Create a user-specific notification
  async create(userId, message) {
    return supabase
      .from('notifications')
      .insert([{ user_id: userId, message }]);
  },

  // Create a broadcast notification (user_id = null)
  async broadcast(message) {
    return supabase
      .from('notifications')
      .insert([{ user_id: null, message }]);
  }
};
