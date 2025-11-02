import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // ✅ Fetch user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate("/login");
      else setUser(user);
    });
  }, [navigate]);

  // ✅ Fetch avatars from storage
  useEffect(() => {
    const fetchAvatars = async () => {
      const { data, error } = await supabase.storage.from("avatars").list("", { limit: 30 });
      if (error) return console.error("Error fetching avatars", error);
      setAvatars(data.map((file) => file.name));
    };
    fetchAvatars();
  }, []);

  const getAvatarPublicUrl = (path) => {
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data?.publicUrl;
  };

  const onSubmit = async (formData) => {
    if (!user) return;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name: formData.name,
      reg_no: formData.reg_no,
      mobile_no: formData.mobile_no,
      emergency_contact: formData.emergency_contact,
      blood_type: formData.blood_type,
      age: formData.age ? parseInt(formData.age, 10) : null,
      address: formData.address,
      avatar_url: selectedAvatar || null,
      is_profile_complete: true, // ✅ mark as complete
    });

    if (error) {
      console.error(error);
      toast.error("Failed to complete profile");
    } else {
      toast.success("Profile completed successfully!");
      navigate("/dashboard");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Complete Your Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              {...register("name", { required: true })}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            />
            {errors.name && <p className="text-red-500 text-sm">Name is required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Registration Number
            </label>
            <input
              {...register("reg_no", { required: true })}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            />
            {errors.reg_no && <p className="text-red-500 text-sm">Registration number is required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mobile Number
            </label>
            <input
              {...register("mobile_no", { required: true })}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            />
            {errors.mobile_no && <p className="text-red-500 text-sm">Mobile number is required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Emergency Contact
            </label>
            <input
              {...register("emergency_contact")}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Blood Type
            </label>
            <input
              {...register("blood_type")}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
            <input
              type="number"
              {...register("age", {
                required: "Age is required",
                min: { value: 16, message: "Minimum age is 16" },
                max: { value: 80, message: "Maximum age is 80" },
              })}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            />
            {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
            <textarea
              {...register("address")}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose an Avatar
            </label>
            <div className="grid grid-cols-4 gap-4">
              {avatars.map((path, index) => {
                const publicUrl = getAvatarPublicUrl(path);
                return (
                  <img
                    key={index}
                    src={publicUrl}
                    alt={`Avatar ${index}`}
                    onClick={() => setSelectedAvatar(path)}
                    className={`cursor-pointer rounded-full border-2 p-1 ${
                      selectedAvatar === path ? "border-blue-500" : "border-transparent"
                    } hover:scale-105 transition-transform`}
                  />
                );
              })}
            </div>
            {selectedAvatar && (
              <p className="mt-2 text-sm text-green-500">Selected avatar set!</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
