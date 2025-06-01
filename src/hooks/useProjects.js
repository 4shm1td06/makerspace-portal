import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useProjects = (ownerId = null) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    query.then(({ data }) => {
      setProjects(data || []);
      setLoading(false);
    });
  }, [ownerId]);

  return { projects, loading };
};
