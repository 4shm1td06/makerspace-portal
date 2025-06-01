import { supabase } from './supabase';

export const newsService = {
  getPublishedNews: async () => {
    return await supabase
      .from('news_events')
      .select('*')
      .eq('type', 'news')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
  },

  getUpcomingEvents: async () => {
    return await supabase
      .from('news_events')
      .select('*')
      .eq('type', 'event')
      .eq('status', 'published')
      .order('event_date', { ascending: true });
  },

  createNewsEvent: async (eventData) => {
    return await supabase
      .from('news_events')
      .insert([eventData]);
  },
};
