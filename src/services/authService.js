import { supabase } from "./supabase";
import axios from "axios"; // We'll use your own SMTP backend

export const authService = {
  signUp: async (email, password) => {
    try {
      // Check if email belongs to JECRC domain
      const isJECRC = email.endsWith("@jecrcu.edu.in");

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      if (isJECRC) {
        // JECRC mail: send OTP to user's email via your SMTP backend
        await axios.post("http://localhost:7049/send-otp", {
          to: email,
          subject: "Your JECRC Verification OTP",
          text: `Your OTP for registration is ${otp}. It will expire in 10 minutes.`,
        });

        // Store OTP temporarily in localStorage or Supabase temp table
        localStorage.setItem("pending_otp", otp);
        localStorage.setItem("pending_email", email);
        localStorage.setItem("pending_password", password);

        return { requireOtp: true }; // UI will show OTP input next
      } else {
        // Non-JECRC mail: notify ERP for approval
        await axios.post("http://localhost:7049/send-approval", {
          to: "erp.makerspace@gmail.com",
          subject: "New Account Approval Request",
          text: `A new registration attempt was made using ${email}. Please approve or deny manually.`,
        });

        return { waitingApproval: true };
      }
    } catch (error) {
      return { error };
    }
  },

  verifyOtpAndCreateUser: async (enteredOtp) => {
    const storedOtp = localStorage.getItem("pending_otp");
    const email = localStorage.getItem("pending_email");
    const password = localStorage.getItem("pending_password");

    if (!storedOtp || !email || !password)
      return { error: { message: "OTP session expired. Please re-register." } };

    if (enteredOtp !== storedOtp)
      return { error: { message: "Invalid OTP" } };

    // OTP is valid → create account in Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { error };

    const userId = data.user.id;

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
      });

    // Cleanup
    localStorage.removeItem("pending_otp");
    localStorage.removeItem("pending_email");
    localStorage.removeItem("pending_password");

    if (profileError) return { error: profileError };
    return { data };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: () => supabase.auth.getUser(),

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },

  updateProfile: async (userId, updates) => {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);
    return { error };
  },
};
