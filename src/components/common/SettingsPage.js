import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return;

    setUserId(user.id);
    setUserEmail(user.email);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setName(data.name || "");
    } else {
      toast.error("Error fetching profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      toast.error("User not authenticated.");
      return;
    }

    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    const updateData = {
      id: user.id,
      name,
      address: "address", // required by schema
    };

    let response;
    if (existing) {
      response = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);
    } else {
      response = await supabase.from("profiles").insert(updateData);
    }

    const { error } = response;

    if (error) {
      toast.error("Failed to save changes.");
      console.error("Supabase error:", error);
    } else {
      toast.success("Settings saved.");
      fetchProfile();
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !userId) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File is too large. Max size is 2MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPG, PNG, or WEBP allowed.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}.${fileExt}`;

    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      toast.error("Upload failed!");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) {
      toast.error("Could not get public URL.");
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (updateError) {
      toast.error("Failed to update avatar.");
    } else {
      toast.success("Avatar updated!");
      fetchProfile();
    }

    setUploading(false);
  };

  const handleResetPassword = async () => {
    if (!userEmail) {
      toast.error("Email not found.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail);
    if (error) {
      toast.error("Failed to send reset email.");
    } else {
      toast.success("Password reset email sent!");
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Account Settings</h2>

      <div className="flex flex-col items-center space-y-4">
        <img
          src={profile?.avatar_url || "https://placehold.co/96x96"}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border"
        />
        <label className="text-sm font-medium text-gray-700">Change Avatar</label>
        <input type="file" accept="image/*" onChange={handleAvatarUpload} />
        {uploading && <p className="text-xs text-gray-500">Uploading...</p>}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800">Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800">Role</label>
          <p className="w-full border rounded px-3 py-2 text-gray-900 bg-white">
            {profile.role || "member"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetPassword}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Reset Password
          </button>
        </div>

        <div className="pt-4 flex gap-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            onClick={fetchProfile}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
