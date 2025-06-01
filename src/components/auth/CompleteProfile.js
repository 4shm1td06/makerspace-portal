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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Complete Your Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              {...register("name", { required: true })}
              className="w-full border p-2 rounded"
            />
            {errors.name && <p className="text-red-500 text-sm">Name is required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Registration Number</label>
            <input
              {...register("reg_no", { required: true })}
              className="w-full border p-2 rounded"
            />
            {errors.reg_no && <p className="text-red-500 text-sm">Registration number is required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Mobile Number</label>
            <input
              {...register("mobile_no", { required: true })}
              className="w-full border p-2 rounded"
            />
            {errors.mobile_no && <p className="text-red-500 text-sm">Mobile number is required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Emergency Contact</label>
            <input
              {...register("emergency_contact")}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Blood Type</label>
            <input
              {...register("blood_type")}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Age</label>
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
              className="w-full border p-2 rounded"
            />
            {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Address</label>
            <textarea
              {...register("address")}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Avatar URL</label>
            <input
              {...register("avatar_url")}
              className="w-full border p-2 rounded"
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
