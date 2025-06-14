import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

const EmergencyInfo = () => {
  const { user } = useAuth();
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    relation: '',
    blood_type: '',
  });

  useEffect(() => {
    const fetchEmergencyInfo = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('emergency_contact_info')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Fetch error:', error.message);
      } else {
        setEmergency(data || null);
      }

      setLoading(false);
    };

    fetchEmergencyInfo();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('emergency_contact_info')
      .insert([{ id: user.id, ...form }]);

    if (error) {
      console.error('Insert error:', error.message);
    } else {
      setEmergency({ id: user.id, ...form });
    }

    setSaving(false);
  };

  if (loading) return <p className="text-gray-700 dark:text-gray-200">Loading...</p>;

  return (
    <div className="p-4 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md dark:text-white">
      <h2 className="text-xl font-semibold mb-4">Emergency Contact Info</h2>

      {emergency ? (
        <div className="space-y-1">
          <p><strong>Name:</strong> {emergency.name}</p>
          <p><strong>Phone:</strong> {emergency.phone}</p>
          <p><strong>Address:</strong> {emergency.address}</p>
          <p><strong>Relation:</strong> {emergency.relation}</p>
          <p><strong>Blood Type:</strong> {emergency.blood_type}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {['name', 'phone', 'address', 'relation', 'blood_type'].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              value={form[field]}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          ))}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Emergency Info'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmergencyInfo;
