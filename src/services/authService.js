import { supabase } from './supabase';

export const authService = {
  signUp: async (email, password) => {
    // Sign up without extra user metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) return { error };

    // Create profile entry with minimal info (id and email)
    const userId = data.user.id;

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
      });

    if (profileError) {
      // Optional: handle cleanup if profile insert fails
      // await supabase.auth.admin.deleteUser(userId);
      return { error: profileError };
    }

    return { data, error: null };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: () => supabase.auth.getUser(),

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },

  updateProfile: async (userId, updates) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    return { error };
  },
};
