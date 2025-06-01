import { supabase } from './supabase';

export const authService = {
  signUp: async (email, password, userData) => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (signUpError || !signUpData.user) return { error: signUpError };

    const userId = signUpData.user.id;

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email,
      ...userData,
    });

    if (profileError) {
      // Optionally delete user if profile creation fails (requires admin privileges)
      // await supabase.auth.admin.deleteUser(userId);
      return { error: profileError };
    }

    return { data: signUpData, error: null };
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

  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },

  updateProfile: async (userId, updates) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    return { error };
  },
};
