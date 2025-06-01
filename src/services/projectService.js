import { supabase } from './supabase';

export const projectService = {
  getProjects: async (userId = null) => {
    let query = supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('owner_id', userId);
    }

    return await query;
  },

  createProject: async (projectData) => {
    return await supabase
      .from('projects')
      .insert([projectData])
      .select();
  },

  updateProject: async (id, updates) => {
    return await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select();
  },

  deleteProject: async (id) => {
    return await supabase
      .from('projects')
      .delete()
      .eq('id', id);
  },
};
