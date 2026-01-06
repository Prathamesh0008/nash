"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(data?.message || "Invalid login credentials");
        return;
      }

      // ✅ Redirect based on role
      if (data.user?.role === "worker") {
        router.push("/worker/dashboard");
      } else {
        router.push("/profile");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
const { refreshUser } = useCurrentUser();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b0214] to-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-5xl relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20 blur-3xl rounded-3xl" />

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Error */}
            {error && (
              <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
                {error}
              </div>
            )}

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
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition shadow-lg
                ${
                  loading
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 shadow-purple-600/20"
                }
              `}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          {/* RIGHT — REGISTER */}
          <div className="border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6 flex flex-col justify-center">
            <h2 className="text-xl font-semibold mb-2">
              Don’t have an account?
            </h2>
            <p className="text-white/70 text-sm mb-6">
              Choose how you want to register
            </p>

            <button
             onClick={() => (window.location.href = "/register?role=customer")}
              className="w-full mb-4 py-3 rounded-xl border border-white/20 hover:border-pink-500/50 hover:bg-white/5 transition"
            >
              Register as Customer
            </button>

            <button
              onClick={() => (window.location.href = "/register?role=worker")}
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
