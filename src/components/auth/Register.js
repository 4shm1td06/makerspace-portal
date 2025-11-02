import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// --- Validation Schema ---
const registerSchema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  // --- Step 1: Request OTP / Approval ---
  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await axios.post("http://mks-smtp.vercel.app/api/request-registration", {
        email,
        password,
      });

      if (res.data.requiresApproval) {
        toast("Approval request sent to ERP Admin.");
      } else if (res.data.otpSent) {
        toast.success("OTP sent to your JECRC email!");
        setOtpSent(true);
        setEmail(email);
        setPassword(password);
      } else {
        toast.error("Unexpected server response. Try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Error sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Verify OTP via Backend ---
  const verifyOtp = async () => {
    if (!enteredOtp) return toast.error("Please enter the OTP");

    setLoading(true);
    try {
      const res = await axios.post("http://mks-smtp.vercel.app/api/verify-otp", {
        email,
        otp: enteredOtp,
        password,
      });

      if (res.data.success) {
        toast.success("Account created successfully!");
        navigate("/login");
      } else {
        toast.error(res.data.error || "Invalid OTP");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error("Server error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">
          Create Account
        </h2>

        {!otpSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                {...register("password")}
                className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
              />
              {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Confirm Password</label>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition disabled:opacity-60"
            >
              {loading ? "Processing..." : "Register"}
            </button>
          </form>
        ) : (
          // --- OTP Verification ---
          <div className="space-y-4">
            <p className="text-center text-gray-700 dark:text-gray-300">
              Enter the OTP sent to your email
            </p>
            <input
              type="text"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              className="w-full border px-3 py-2 rounded text-center tracking-widest text-lg dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}