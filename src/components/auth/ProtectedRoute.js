import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [checkingProfile, setCheckingProfile] = useState(true);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkProfileAndRole = async () => {
      if (!user) return;

      console.log("🔍 Checking profile for user:", user.id);
      setCheckingProfile(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('mobile_no, name, reg_no, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("❌ Failed to fetch profile:", error);
        setCheckingProfile(false);
        return;
      }

      console.log("✅ Fetched profile data:", data);

      const isIncomplete =
        !data?.mobile_no || !data?.name || !data?.reg_no;
      setIsProfileIncomplete(isIncomplete);

      const role = data?.role?.toLowerCase();
      console.log("👑 Role from profile:", role);

      setIsAdmin(role === 'admin');
      setCheckingProfile(false);
    };

    if (user) checkProfileAndRole();
  }, [user, location.pathname]);

  if (loading || checkingProfile) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (isProfileIncomplete && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.warn("🚫 Not an admin, redirecting.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
