import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { format, isToday, parseISO } from 'date-fns';

const ActivityStatus = () => {
  const [projectCount, setProjectCount] = useState(0);
  const [lastLogin, setLastLogin] = useState('');
  const [userId, setUserId] = useState(null);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);

        // Set last login
        const loginDate = parseISO(user.last_sign_in_at);
        const display = isToday(loginDate)
          ? 'Today'
          : format(loginDate, 'PPpp');
        setLastLogin(display);
      } else {
        setLastLogin('Unknown');
      }
    };

    fetchUser();
  }, []);

  // Fetch and listen to project count
  useEffect(() => {
    if (!userId) return;

    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId);

      if (!error && typeof count === 'number') {
        setProjectCount(count);
      }
    };

    fetchCount();

    const channel = supabase
      .channel('realtime:project-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `owner_id=eq.${userId}`,
        },
        () => {
          fetchCount(); // Refresh on insert/update/delete
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-2">Activity Status</h2>
      <p>You're currently active in {projectCount} project(s).</p>
      <p>Last login: {lastLogin}</p>
    </div>
  );
};

export default ActivityStatus;
