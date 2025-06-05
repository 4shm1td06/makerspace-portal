import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  const fetchProfile = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      navigate('/login');
      return;
    }

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error(profileError.message);
    } else {
      setProfile(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePasswordReset = async () => {
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userEmail = session?.user?.email;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInError) {
      setError('Current password is incorrect.');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Password updated successfully!');
      setShowModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (loading || !profile) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white dark:bg-black text-gray-900 dark:text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <button
          onClick={toggleDarkMode}
          className="bg-secondary dark:bg-white text-white dark:text-black px-4 py-2 rounded shadow"
        >
          {isDarkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="text"
            value={profile.email}
            disabled
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <input
            type="text"
            value={profile.role || 'member'}
            disabled
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Reset Password
        </button>

        {success && <p className="text-green-600 dark:text-green-400">{success}</p>}
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md text-gray-900 dark:text-white">
            <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                className="w-full border px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 dark:text-white"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                id ="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full border px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 dark:text-white"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                className="w-full border px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 dark:text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:underline">{showPassword ? "Hide" : "Show"}
                </button>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordReset}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
