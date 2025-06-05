import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';

const MemberInfoCard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setErrorMsg('Unable to load profile.');
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : 'N/A';

  if (!user) return <div className="text-gray-700 dark:text-gray-300">User not authenticated.</div>;
  if (loading) return <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading member information...</div>;
  if (errorMsg) return <div className="text-red-500 dark:text-red-400">{errorMsg}</div>;
  if (!profile) return <div className="text-gray-700 dark:text-gray-300">No profile data found.</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md dark:shadow-black/40 border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          {profile.name || 'Unnamed Member'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
      </div>

      <hr className="mb-4 border-gray-300 dark:border-gray-600" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-700 dark:text-gray-300">
        <div>
          <span className="font-medium text-gray-600 dark:text-gray-400">ID:</span> {user.id}
        </div>
        <div>
          <span className="font-medium text-gray-600 dark:text-gray-400">Phone:</span> {profile.mobile_no}
        </div>
        <div>
          <span className="font-medium text-gray-600 dark:text-gray-400">Role:</span> {profile.role || 'Member'}
        </div>
        <div>
          <span className="font-medium text-gray-600 dark:text-gray-400">Created At:</span> {formatDate(user.created_at)}
        </div>
        <div>
          <span className="font-medium text-gray-600 dark:text-gray-400">Last Login:</span> {formatDate(user.last_sign_in_at)}
        </div>
      </div>
    </div>
  );
};

export default MemberInfoCard;
