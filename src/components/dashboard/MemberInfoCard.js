import React, { useEffect, useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

const MemberInfoCard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const cardRef = useRef();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        toast.error('Unable to load profile.');
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
        fetchAvatar(data.avatar_url);
      }

      setLoading(false);
    };

    const fetchAvatar = async (avatarUrl) => {
      if (!avatarUrl) return;

      const filename = avatarUrl.split('/').pop();
      const { data, error } = await supabase.storage.from('id').download(filename);

      if (error) {
        toast.error('Failed to fetch profile image');
        console.error('Avatar fetch error:', error.message);
        setAvatarSrc(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => setAvatarSrc(reader.result);
      reader.readAsDataURL(data);
    };

    fetchProfile();
  }, [user]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : 'N/A';

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error('Image must be ≤ 1MB');
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('id')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.error('Image upload failed');
      console.error(uploadError);
    } else {
      await supabase.from('profiles').update({ avatar_url: fileName }).eq('id', user.id);
      const { data, error: downloadErr } = await supabase.storage.from('id').download(fileName);

      if (downloadErr) {
        toast.error('Failed to update image');
        console.error(downloadErr);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => setAvatarSrc(reader.result);
        reader.readAsDataURL(data);
        toast.success('Image uploaded successfully');
      }
    }

    setUploading(false);
  };

  const downloadPDF = () => {
    if (!window.html2pdf) return toast.error('PDF library not loaded');

    const fileName = `${profile?.name?.replace(/\s+/g, '_') || 'member'}_${new Date()
      .toISOString()
      .split('T')[0]}.pdf`;

    window.html2pdf()
      .set({
        margin: 0.5,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      })
      .from(cardRef.current)
      .save()
      .then(() => toast.success('PDF downloaded!'))
      .catch(() => toast.error('PDF download failed'));
  };

  if (!user) return <div className="text-gray-700 dark:text-gray-300">User not authenticated.</div>;
  if (loading) return <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading member information...</div>;
  if (!profile) return <div className="text-red-500 dark:text-red-400">Profile not found.</div>;

  return (
    <div className="relative max-w-6xl mx-auto">
      <button
        onClick={downloadPDF}
        className="absolute top-4 right-4 z-10 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow"
        title="Download PDF"
      >
        <Download className="w-5 h-5" />
      </button>

      <div
        ref={cardRef}
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md dark:shadow-black/40 border border-gray-200 dark:border-gray-700 w-[5.5in] mx-auto"
      >
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {profile.name || 'Unnamed Member'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <div className="flex flex-col items-center">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Avatar"
                className="w-32 h-32 object-cover border border-gray-300 dark:border-gray-600 mb-2 shadow"
              />
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm text-white mb-2">
                  No Image
                </div>
                <label className="text-xs text-blue-600 hover:underline cursor-pointer">
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </>
            )}
          </div>
        </div>

        <hr className="mb-4 border-gray-300 dark:border-gray-600" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-700 dark:text-gray-300">
          <div><span className="font-medium">ID:</span> {user.id}</div>
          <div><span className="font-medium">Phone:</span> {profile.mobile_no}</div>
          <div><span className="font-medium">Blood Type:</span> {profile.blood_type}</div>
          <div><span className="font-medium">Registration No:</span> {profile.reg_no || 'N/A'}</div>
          <div><span className="font-medium">Role:</span> {profile.role || 'Member'}</div>
          <div><span className="font-medium">Created At:</span> {formatDate(user.created_at)}</div>
          <div><span className="font-medium">Last Login:</span> {formatDate(user.last_sign_in_at)}</div>
        </div>
      </div>
    </div>
  );
};

export default MemberInfoCard;
