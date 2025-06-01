// src/services/notificationService.js
import { supabase } from './supabase';

export const notificationService = {
  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return { count, error };
  },

  async getAll(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async markAsRead(id) {
    return supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
  },

  async create(userId, message) {
    return supabase
      .from('notifications')
      .insert([{ user_id: userId, message }]);
  }
};
