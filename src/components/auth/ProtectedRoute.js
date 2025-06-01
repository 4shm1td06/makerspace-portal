import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      setCheckingProfile(true); // Reset state while fetching

      const { data, error } = await supabase
        .from('profiles')
        .select('mobile_no, name, reg_no')
        .eq('id', user.id)
        .single();

      if (!data || !data.mobile_no || !data.name || !data.reg_no) {
        setIsProfileIncomplete(true);
      } else {
        setIsProfileIncomplete(false);
      }

      if (error && error.code !== 'PGRST116') {
        console.error("Failed to fetch profile:", error);
      }

      setCheckingProfile(false);
    };

    if (user) {
      checkProfile();
    }
  }, [user, location.pathname]); // 👈 triggers profile recheck on route change

  if (loading || checkingProfile) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (isProfileIncomplete && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
