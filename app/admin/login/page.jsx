"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { refreshMe } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!data.ok) {
      setError(data.error || "Login failed");
      return;
    }

    const me = await refreshMe();
    if (me?.role !== "admin") {
      setError("Admin access required");
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <section className="mx-auto max-w-md panel">
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      {error && <p className="mt-2 rounded bg-rose-950 p-2 text-sm text-rose-300">{error}</p>}
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input className="w-full p-2.5 text-sm" placeholder="Admin email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full p-2.5 text-sm" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="app-btn-primary w-full rounded-lg px-3 py-2 text-sm font-semibold text-white">Login</button>
      </form>
    </section>
  );
}
