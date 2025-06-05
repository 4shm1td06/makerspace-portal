import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

const EmergencyInfo = () => {
  const { user } = useAuth();
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmergencyContact = async () => {
      if (!user) return;

      const { data, error } = await supabase
      .from('emergency_contact_info') // No quotes needed since there are no spaces
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching emergency contact info:', error.message);
      } else {
        setEmergency(data || null);
      }

      setLoading(false);
    };

    fetchEmergencyContact();
  }, [user]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-2">Emergency Contact</h2>
      {emergency ? (
        <>
          <p><strong>Name:</strong> {emergency.name}</p>
          <p><strong>Phone:</strong> {emergency.emergency_contact}</p>
          <p><strong>Address:</strong> {emergency.address}</p>
          <p><strong>Relation:</strong> {emergency.relation}</p>
          <p><strong>Blood Type:</strong> {emergency.blood_type}</p>
        </>
      ) : (
        <p>No emergency contact info found.</p>
      )}
    </div>
  );
};

export default EmergencyInfo;
