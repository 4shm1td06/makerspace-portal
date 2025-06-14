import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';

const SettingsPage = ({ darkMode, setDarkMode }) => { 
 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  

  const [success, setSuccess] = useState('');   const [error, setError] = useState('');     
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const [editingBio, setEditingBio] = useState('');
  const [editingExpertise, setEditingExpertise] = useState('');
 
  const [hasProfileInfoChanged, setHasProfileInfoChanged] = useState(false);

  const [editingMobileNo, setEditingMobileNo] = useState('');
  const [editingEmergencyContactName, setEditingEmergencyContactName] = useState('');
  const [editingEmergencyContact, setEditingEmergencyContact] = useState('');
  const [hasContactDetailsChanged, setHasContactDetailsChanged] = useState(false);

  const [editingLinkedinUrl, setEditingLinkedinUrl] = useState('');
  const [editingGithubUrl, setEditingGithubUrl] = useState('');
  const [editingPersonalWebsiteUrl, setEditingPersonalWebsiteUrl] = useState('');
  const [hasOnlinePresenceChanged, setHasOnlinePresenceChanged] = useState(false);


  useEffect(() => {
    fetchProfile();
  }, []);

  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode); 
  };

  const fetchProfile = async () => {
    setLoading(true);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      navigate('/login');
      setLoading(false);
      return;
    }

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('name, bio, expertise, role, mobile_no, emergency_contact_name, emergency_contact, linkedin_url, github_url, personal_website_url')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError.message);
      setProfile({ email: user.email, id: user.id, name: user.name }); 
    } else {
      setProfile({ ...data, email: user.email, id: user.id });

     
      setEditingBio(data.bio || '');
      setEditingExpertise(data.expertise || '');
      setEditingMobileNo(data.mobile_no || '');
      setEditingEmergencyContactName(data.emergency_contact_name || '');
      setEditingEmergencyContact(data.emergency_contact || '');
      setEditingLinkedinUrl(data.linkedin_url || '');
      setEditingGithubUrl(data.github_url || '');
      setEditingPersonalWebsiteUrl(data.personal_website_url || '');

     
      setHasProfileInfoChanged(false);
      setHasContactDetailsChanged(false);
      setHasOnlinePresenceChanged(false);
    }
    setLoading(false);
  };



  const handleSaveProfileInfo = async () => {
    setError('');
    setSuccess('');

    const updates = {
      bio: editingBio,
      expertise: editingExpertise,
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (updateError) {
      setError("Failed to update profile information: " + updateError.message);
    } else {
      setSuccess("Profile information updated successfully!");
     
      setProfile(prevProfile => ({
        ...prevProfile,
        bio: editingBio,
        expertise: editingExpertise,
      }));
      setHasProfileInfoChanged(false); 
    }
  };

  const handleSaveContactDetails = async () => {
    setError('');
    setSuccess('');

    const updates = {
      mobile_no: editingMobileNo,
      emergency_contact_name: editingEmergencyContactName,
      emergency_contact: editingEmergencyContact,
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (updateError) {
      setError("Failed to update contact details: " + updateError.message);
    } else {
      setSuccess("Contact details updated successfully!");
      setProfile(prevProfile => ({
        ...prevProfile,
        mobile_no: editingMobileNo,
        emergency_contact_name: editingEmergencyContactName,
        emergency_contact: editingEmergencyContact,
      }));
      setHasContactDetailsChanged(false);
    }
  };

  const handleSaveOnlinePresence = async () => {
    setError('');
    setSuccess('');

    const updates = {
      linkedin_url: editingLinkedinUrl,
      github_url: editingGithubUrl,
      personal_website_url: editingPersonalWebsiteUrl,
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (updateError) {
      setError("Failed to update online presence links: " + updateError.message);
    } else {
      setSuccess("Online presence links updated successfully!");
      setProfile(prevProfile => ({
        ...prevProfile,
        linkedin_url: editingLinkedinUrl,
        github_url: editingGithubUrl,
        personal_website_url: editingPersonalWebsiteUrl,
      }));
      setHasOnlinePresenceChanged(false);
    }
  };



  const handleDeleteAccount = async () => {
    console.warn("Account deletion initiated. Implement a custom confirmation modal here instead of window.confirm().");

    setError('');
    setSuccess('');

    try {
     
      const { error: profileDeleteError } = await supabase.from('profiles').delete().eq('id', profile.id);
      if (profileDeleteError) {
        throw new Error(profileDeleteError.message);
      }

  
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw new Error(signOutError.message);
      }

      setSuccess("Account deleted successfully!");
      navigate('/signup'); 
    } catch (err) {
      setError("Failed to delete account: " + err.message);
      console.error("Account deletion error:", err);
    }
  };

  const handleConfirmResetPassword = async () => {
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (!newPassword) {
        setError("New password cannot be empty.");
        return;
    }

    try {
      
      const {  error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });

      if (signInError) {
        setError("Current password is incorrect. " + signInError.message);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError("Failed to update password: " + updateError.message);
      } else {
        setSuccess("Password updated successfully!");
        setShowResetDialog(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError("Something went wrong with password reset. Please try again.");
      console.error("Password reset error:", err);
    }
  };

  if (loading || !profile) return <div className="p-4 text-center dark:text-white">Loading settings...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white dark:bg-black text-gray-900 dark:text-white min-h-screen rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="flex items-center">
          <button
            onClick={toggleDarkMode}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            {/* UPDATED: Use the 'darkMode' prop directly for button text */}
            {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-600 dark:text-green-400 mb-4 text-center font-medium">{success}</p>}
      {error && <p className="text-red-600 dark:text-red-400 mb-4 text-center font-medium">{error}</p>}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-md space-y-6">

        {/* --- 1. Profile Information --- */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
            Profile Information
          </h2>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="text"
              id="email"
              value={profile.email || ''}
              disabled
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:text-white cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              id="full-name"
              value={profile.name || ''} 
              disabled 
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:text-white cursor-not-allowed" // Style as disabled
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio / About Me</label>
            <textarea
              id="bio"
              value={editingBio} 
              onChange={(e) => { setEditingBio(e.target.value); setHasProfileInfoChanged(true); setError(''); setSuccess(''); }}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white resize-y"
              placeholder="Tell us a little about yourself..."
            />
          </div>

          <div>
            <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills / Expertise</label>
            <input
              type="text"
              id="expertise"
              value={editingExpertise} 
              onChange={(e) => { setEditingExpertise(e.target.value); setHasProfileInfoChanged(true); setError(''); setSuccess(''); }}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
              placeholder="e.g., Python, Graphic Design, Event Planning (comma-separated)"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <input
              type="text"
              id="role"
              value={profile.role || 'Member'}
              disabled // Role is display-only
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:text-white cursor-not-allowed"
            />
          </div>

          {/* Conditional Save/Cancel for Profile Information */}
          {hasProfileInfoChanged && (
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleSaveProfileInfo}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-normal transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  
                  setEditingBio(profile.bio || '');
                  setEditingExpertise(profile.expertise || '');
                  setHasProfileInfoChanged(false);
                  setError(''); setSuccess(''); 
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-normal transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Social Media / Portfolio Links (nested section visually) */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Online Presence
            </h3>
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                id="linkedin"
                value={editingLinkedinUrl}
                onChange={(e) => { setEditingLinkedinUrl(e.target.value); setHasOnlinePresenceChanged(true); setError(''); setSuccess(''); }}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub Profile URL</label>
              <input
                type="url"
                id="github"
                value={editingGithubUrl}
                onChange={(e) => { setEditingGithubUrl(e.target.value); setHasOnlinePresenceChanged(true); setError(''); setSuccess(''); }}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
                placeholder="https://github.com/yourusername"
              />
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Personal Website / Portfolio URL</label>
              <input
                type="url"
                id="website"
                value={editingPersonalWebsiteUrl}
                onChange={(e) => { setEditingPersonalWebsiteUrl(e.target.value); setHasOnlinePresenceChanged(true); setError(''); setSuccess(''); }}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Conditional Save/Cancel for Online Presence */}
            {hasOnlinePresenceChanged && (
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={handleSaveOnlinePresence}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-normal transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    
                    setEditingLinkedinUrl(profile.linkedin_url || '');
                    setEditingGithubUrl(profile.github_url || '');
                    setEditingPersonalWebsiteUrl(profile.personal_website_url || '');
                    setHasOnlinePresenceChanged(false);
                    setError(''); setSuccess('');
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-normal transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>

        {/* --- 2. Contact Details --- */}
        <section className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
            Contact Details
          </h2>
          <div>
            <label htmlFor="primary-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Phone Number</label>
            <input
              type="tel"
              id="primary-phone"
              value={editingMobileNo}
              onChange={(e) => { setEditingMobileNo(e.target.value); setHasContactDetailsChanged(true); setError(''); setSuccess(''); }}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
              placeholder="e.g., +91 9876543210"
            />
          </div>
          <div>
            <label htmlFor="emergency-contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Name</label>
            <input
              type="text"
              id="emergency-contact-name"
              value={editingEmergencyContactName}
              onChange={(e) => { setEditingEmergencyContactName(e.target.value); setHasContactDetailsChanged(true); setError(''); setSuccess(''); }}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="emergency-contact-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Phone</label>
            <input
              type="tel"
              id="emergency-contact-phone"
              value={editingEmergencyContact}
              onChange={(e) => { setEditingEmergencyContact(e.target.value); setHasContactDetailsChanged(true); setError(''); setSuccess(''); }}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Conditional Save/Cancel for Contact Details */}
          {hasContactDetailsChanged && (
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleSaveContactDetails}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-normal transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  // Revert changes on cancel
                  setEditingMobileNo(profile.mobile_no || '');
                  setEditingEmergencyContactName(profile.emergency_contact_name || '');
                  setEditingEmergencyContact(profile.emergency_contact || '');
                  setHasContactDetailsChanged(false);
                  setError(''); setSuccess(''); // Clear messages
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-normal transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </section>

        {/* --- Account Actions --- */}
        <section className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">Account Actions</h2>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => { setError(''); setSuccess(''); setShowResetDialog(true); }}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm text-left"
            >
              Reset Password
            </button>
            <button
              onClick={handleDeleteAccount}
              className="text-red-600 dark:text-red-400 hover:underline text-sm text-left"
            >
              Delete Account
            </button>
          </div>
        </section>
      </div> {/* End of main content card div */}

      {/* Reset Password Modal */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Reset Password</h2>

            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
            />

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                    setShowResetDialog(false);
                    setError(''); 
                    setSuccess(''); 
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResetPassword}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
