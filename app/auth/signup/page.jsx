"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  Lock,
  Gift,
  Users,
  Briefcase,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  UserCircle,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { refreshMe } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "other",
    password: "",
    role: "user",
    referralCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service");
      return;
    }
    
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.ok) {
      setError(data.error || "Signup failed");
      return;
    }

    const me = await refreshMe();
    if (me?.role === "worker") router.push("/worker/onboarding");
    else router.push("/services");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-600 mb-4">
            <UserCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-sm text-slate-400 mt-1">
            Join us today! Choose your account type
          </p>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 sm:p-8 backdrop-blur-sm">
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={submit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="name"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-300">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="phone"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Referral Code */}
            <div>
              <label htmlFor="referral" className="mb-1.5 block text-sm font-medium text-slate-300">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="referral"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none uppercase"
                  placeholder="SUMMER2024"
                  value={form.referralCode}
                  onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Gender & Role - Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Gender
                </label>
                <select
                  id="gender"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 px-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  disabled={loading}
                >
                  <option value="other">Other</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-300">
                  I am a *
                </label>
                <select
                  id="role"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 px-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  disabled={loading}
                >
                  <option value="user">👤 Customer</option>
                  <option value="worker">👥 Worker</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Minimum 8 characters
              </p>
            </div>

            {/* Terms Agreement */}
            <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 bg-slate-900/50 p-3 transition hover:border-fuchsia-500/30">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-800 text-fuchsia-500 focus:ring-fuchsia-500/20"
              />
              <span className="text-xs text-slate-300">
                I agree to the{" "}
                <Link href="/legal/terms" className="text-fuchsia-400 hover:text-fuchsia-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="text-fuchsia-400 hover:text-fuchsia-300">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !agreeTerms}
              className="relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Role-specific Info */}
          {form.role === "worker" && (
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
              <p className="flex items-center gap-2 text-amber-400">
                <Briefcase className="h-4 w-4" />
                <span className="font-medium">Worker Account</span>
              </p>
              <p className="mt-1 text-slate-300">
                You&apos;ll need to complete onboarding with KYC documents after signup.
              </p>
            </div>
          )}

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-fuchsia-400 hover:text-fuchsia-300 transition"
            >
              Sign in
              <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </p>

          {/* Role Icons */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Customer
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              Worker
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Secure
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-xs">
          <p className="text-center text-slate-400">
            By signing up, you agree to receive service updates via email/SMS
          </p>
        </div>
      </div>
    </div>
  );
}
