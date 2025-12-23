"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b0214] to-black text-white flex items-center justify-center px-4">
      
      <div className="w-full max-w-md relative">
        {/* Glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-600/20 to-purple-600/20 blur-2xl" />

        <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold">Create Account</h1>
            <p className="text-white/70 text-sm mt-2">
              Sign up to book trusted home service workers
            </p>
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm mb-2 text-white/70">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your full name"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm mb-2 text-white/70">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm mb-2 text-white/70">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-sm mb-2 text-white/70">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-sm"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 active:scale-[0.98] transition shadow-lg shadow-purple-600/20"
          >
            Create Account
          </button>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-white/60">
            Already have an account?{" "}
            <span
              onClick={() => (window.location.href = "/login")}
              className="text-pink-400 hover:underline cursor-pointer"
            >
              Login
            </span>
          </div>

        </div>
      </div>
    </main>
  );
}
