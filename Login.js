import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../../services/authService";
import { supabase } from "../../services/supabase";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const backgroundImages = ["/bg1.jpg", "1.jpeg", "2.jpeg", "3.jpeg", "4.jpeg"];

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      await toast.promise(
        (async () => {
          await new Promise((res) => setTimeout(res, 1000));
          const { error } = await authService.signIn(email, password);
          if (error) throw error;
          const {
            data: { user },
          } = await supabase.auth.getUser();
          const { data: profile, error: profileError } = await supabase
            .from("profile")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (profileError) return `Welcome back, ${email.split("@")[0]}!`;
          return `Welcome back, ${profile.full_name || email.split("@")[0]}!`;
        })(),
        {
          loading: "Logging you in...",
          success: (msg) => msg,
          error: (err) => {
            const msg = err.message?.toLowerCase() || "";
            if (msg.includes("invalid login credentials")) return "Incorrect email or password.";
            if (msg.includes("network")) return "Network error. Please try again.";
            return err.message || "Login failed. Please try again.";
          },
        }
      );
      navigate("/dashboard");
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen flex bg-white dark:bg-gray-900">
        {/* Left Side with BG */}
        <div
          className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${backgroundImages[bgIndex]})` }}
        >
          <img src="/mks logo.jpeg" alt="Logo" className="w-40 h-auto mb-6 drop-shadow-xl" />
          <h1 className="text-white text-3xl font-bold text-shadow-lg text-center px-4">
            Welcome to MakerSpace Portal
          </h1>
        </div>

        {/* Right Side */}
        <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 py-12 relative">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="absolute top-4 right-4 text-sm text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <div className="w-full max-w-md mx-auto">
            <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800 dark:text-white">Login</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-black"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right text-sm">
                <Link to="/forgot-password" className="text-primary-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8z" />
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* T&C and Register */}
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              By logging in, you accept the{" "}
              <button onClick={() => setShowTerms(true)} className="text-primary-600 hover:underline">
                T&C
              </button>{" "}
              laid down by the ERP team.<br />
              Don’t have an account?{" "}
              <Link to="/register" className="text-primary-600 hover:underline font-medium">
                Register Now
              </Link>
            </div>

            {/* Footer */}
            <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
              Developed by MKS Web Dev Team | Project Lead: Ashmit Sharma
            </p>
          </div>
        </div>

        {/* Terms Modal */}
        {showTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full shadow-lg relative overflow-hidden">
              <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Terms and Conditions</h3>
              <div className="overflow-y-auto max-h-[70vh] pr-2 text-sm text-gray-700 dark:text-gray-300 space-y-3">
                <p>By using the MakerSpace Portal, you agree to abide by the policies set forth by the ERP team:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use all tools and materials responsibly and ethically.</li>
                  <li>Follow all safety protocols and standard operating procedures.</li>
                  <li>Log all equipment usage accurately in the system.</li>
                  <li>Ensure your project documentation is kept up to date.</li>
                  <li>Respect all fellow makers and staff within the space.</li>
                  <li>Violations may result in suspension or permanent banning.</li>
                  <li>Your activity may be logged and audited for compliance.</li>
                </ul>
              </div>
              <button
                onClick={() => setShowTerms(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-300"
              >
                ✕
              </button>
              <div className="mt-4 text-right">
                <button
                  onClick={() => setShowTerms(false)}
                  className="px-3 py-1 text-sm rounded bg-primary-600 text-white hover:bg-primary-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
