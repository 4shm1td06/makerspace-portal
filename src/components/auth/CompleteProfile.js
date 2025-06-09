import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import toast from "react-hot-toast";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate("/login");
      else setUser(user);
    });
  }, [navigate]);

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
      avatar_url: formData.avatar_url || null,
      // role is automatically set to 'member' by Supabase default
    });

    if (error) {
      console.error(error);
      toast.error("Failed to complete profile");
    } else {
      toast.success("Profile completed successfully!");
      navigate("/dashboard");
      window.location.reload(); // ensures ProtectedRoute re-evaluates
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Complete Your Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              {...register("name", { required: true })}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            />
            {errors.name && <p className="text-red-500 text-sm">Name is required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Number</label>
            <input
              {...register("reg_no", { required: true })}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            />
            {errors.reg_no && <p className="text-red-500 text-sm">Registration number is required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
            <input
              {...register("mobile_no", { required: true })}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            />
            {errors.mobile_no && <p className="text-red-500 text-sm">Mobile number is required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact</label>
            <input
              {...register("emergency_contact")}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blood Type</label>
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
                min: {
                  value: 16,
                  message: "Minimum age is 16",
                },
                max: {
                  value: 80,
                  message: "Maximum age is 80",
                },
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar URL</label>
            <input
              {...register("avatar_url")}
              className="w-full border p-2 rounded dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            />
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
