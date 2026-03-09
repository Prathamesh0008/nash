"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // Placeholder flow until reset API is enabled.
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMsg("If this email is registered, reset instructions will be sent shortly.");
    }, 600);
  };

  return (
    <section className="mx-auto max-w-lg px-4 py-14">
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6">
        <h1 className="text-2xl font-semibold text-white">Forgot Password</h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter your account email to receive password reset instructions.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            <AlertCircle className="mr-1 inline h-4 w-4" />
            {error}
          </div>
        )}
        {msg && (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            <CheckCircle className="mr-1 inline h-4 w-4" />
            {msg}
          </div>
        )}

        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block text-sm text-slate-300">
            Email
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white"
                placeholder="you@example.com"
                required
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-400">
          Remembered your password?{" "}
          <Link href="/auth/login" className="text-fuchsia-300 hover:text-fuchsia-200">
            Back to login
          </Link>
        </div>
      </div>
    </section>
  );
}
