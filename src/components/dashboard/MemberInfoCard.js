import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const MemberInfoCard = () => {
  const { user } = useAuth();

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-2">Member Information</h2>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>ID:</strong> {user?.id}</p>
      <p><strong>Role:</strong> {user?.role || 'Member'}</p>
      <p><strong>Created At:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
      <p><strong>Last Login:</strong> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</p>
    </div>
  );
};

export default MemberInfoCard;
