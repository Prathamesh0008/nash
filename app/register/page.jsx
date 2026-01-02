"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "customer";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const update = (key, value) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    setError("");

    if (!form.fullName || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          role, // 🔥 IMPORTANT
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      // ✅ ROLE-BASED REDIRECT
      if (data.user.role === "worker") {
        window.location.href = "/worker/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b0214] to-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-600/20 to-purple-600/20 blur-2xl" />

        <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold">
              {role === "worker" ? "Register as Worker" : "Create Account"}
            </h1>
            <p className="text-white/70 text-sm mt-2">
              {role === "worker"
                ? "Create worker account to start getting jobs"
                : "Sign up to book trusted home services"}
            </p>
          </div>

          <Input
            label="Full Name"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <PasswordInput
            label="Password"
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />

          <PasswordInput
            label="Confirm Password"
            show={showConfirm}
            toggle={() => setShowConfirm(!showConfirm)}
            value={form.confirmPassword}
            onChange={(e) =>
              update("confirmPassword", e.target.value)
            }
          />

          {error && (
            <div className="mb-4 text-sm text-red-400 border border-red-500/20 bg-red-500/10 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 transition shadow-lg shadow-purple-600/20 disabled:opacity-40"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

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

/* ---------------- UI HELPERS ---------------- */

function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm mb-2 text-white/70">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500/20"
      />
    </div>
  );
}

function PasswordInput({ label, show, toggle, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm mb-2 text-white/70">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          type={show ? "text" : "password"}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-purple-500/20"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-sm"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
