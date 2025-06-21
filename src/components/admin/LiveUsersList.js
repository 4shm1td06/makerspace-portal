import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const PRESENCE_THRESHOLD_MS = 60 * 1000;

const LiveUsersList = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    fetchOnlineUsers();

    const channel = supabase
      .channel('presence-live-users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'presence' },
        () => {
          fetchOnlineUsers(); // Refresh on insert/update/delete
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOnlineUsers = async () => {
    const now = Date.now();

    const { data: presence, error: presenceError } = await supabase
      .from('presence')
      .select('user_id, last_seen, profiles(name, role)')
      .eq('is_online', true);

    if (presenceError) {
      console.error(presenceError);
      return;
    }

    const filtered = presence.filter((entry) => {
      const seen = new Date(entry.last_seen).getTime();
      return now - seen < PRESENCE_THRESHOLD_MS;
    });

    setOnlineUsers(filtered);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">🟢 Live Online Members</h2>
      {onlineUsers.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No one is online</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {onlineUsers.map(({ user_id, profiles }) => (
            <li key={user_id} className="py-2 flex items-center justify-between">
              <span className="text-gray-800 dark:text-white font-medium">{profiles?.name || 'Unnamed'}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{profiles?.role || 'Member'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveUsersList;
