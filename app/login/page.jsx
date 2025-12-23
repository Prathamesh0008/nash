"use client";

import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b0214] to-black text-white flex items-center justify-center px-4">
      
      <div className="w-full max-w-5xl relative">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20 blur-3xl rounded-3xl" />

        {/* Container */}
        <div className="relative grid md:grid-cols-2 gap-6 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">

          {/* LEFT — LOGIN */}
          <div>
            <h1 className="text-2xl font-semibold mb-2">
              Login to your account
            </h1>
            <p className="text-white/70 text-sm mb-6">
              Access your bookings and manage services
            </p>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm mb-2 text-white/70">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500/20"
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="block text-sm mb-2 text-white/70">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm text-white/60 mb-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-pink-500" />
                Remember me
              </label>
              <span className="hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Login Button */}
            <button className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 transition shadow-lg shadow-purple-600/20">
              Login
            </button>
          </div>

          {/* RIGHT — REGISTER OPTIONS */}
          <div className="border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6 flex flex-col justify-center">
            <h2 className="text-xl font-semibold mb-2">
              Don’t have an account?
            </h2>
            <p className="text-white/70 text-sm mb-6">
              Choose how you want to register
            </p>

            {/* Customer */}
            <button
              onClick={() => (window.location.href = "/register")}
              className="w-full mb-4 py-3 rounded-xl border border-white/20 hover:border-pink-500/50 hover:bg-white/5 transition"
            >
              Register as Customer
            </button>

            {/* Worker */}
            <button
              onClick={() => (window.location.href = "/worker")}
              className="w-full py-3 rounded-xl border border-white/20 hover:border-purple-500/50 hover:bg-white/5 transition"
            >
              Register as Worker
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
