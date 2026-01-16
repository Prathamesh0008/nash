"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLogin() {
  const router = useRouter();
  const { refreshMe } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!data.ok) return setErr(data.error || "Failed");
    await refreshMe();
    router.push("/admin");
  }

  return (
    <div className="max-w-md mx-auto bg-white border rounded-xl p-6">
      <h1 className="text-xl font-bold">Admin Login</h1>
      {err && <div className="mt-3 text-red-600 text-sm">{err}</div>}
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input className="w-full border rounded p-2" placeholder="Admin Email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="w-full bg-black text-white rounded p-2">Login</button>
      </form>
    </div>
  );
}
