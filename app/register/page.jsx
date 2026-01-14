"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshMe } = useAuth();

  const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
  role: "user",
});

  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!data.ok) return setErr(data.error || "Failed");

    await refreshMe();

    // Redirect logic
    if (data.user.role === "worker") router.push("/worker/onboarding");
    else router.push("/");
  }

  return (
    <div className="max-w-md mx-auto bg-white border rounded-xl p-6">
      <h1 className="text-xl font-bold">Register</h1>

      {err && <div className="mt-3 text-red-600 text-sm">{err}</div>}

      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
  className="w-full border rounded p-2"
  placeholder="Full Name"
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
/>

        <input
          className="w-full border rounded p-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <div className="space-y-2">
          <div className="text-sm font-semibold">Sign up as</div>
          <select
            className="w-full border rounded p-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">User (Hire workers)</option>
            <option value="worker">Worker (Offer services)</option>
          </select>
        </div>

        <button className="w-full bg-black text-white rounded p-2">Create Account</button>
      </form>
    </div>
  );
}
