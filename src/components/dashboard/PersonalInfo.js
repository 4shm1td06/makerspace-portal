import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const PersonalInfo = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error.message);
        } else {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <div className="text-gray-700 dark:text-gray-300">Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md dark:shadow-black/40">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
        Personal Information
      </h2>
      <p className="text-gray-700 dark:text-gray-300"><strong>Name:</strong> {profile.name}</p>
      <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> {profile.email}</p>
      <p className="text-gray-700 dark:text-gray-300"><strong>Phone:</strong> {profile.mobile_no}</p>
      <p className="text-gray-700 dark:text-gray-300"><strong>Address:</strong> {profile.address}</p>
      <p className="text-gray-700 dark:text-gray-300"><strong>Role:</strong> {profile.role}</p>
    </div>
  );
};

export default PersonalInfo;
