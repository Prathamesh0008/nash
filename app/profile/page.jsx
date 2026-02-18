"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", role: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/users/me", { credentials: "include" });
      const data = await res.json();
      if (data.ok && data.user) {
        setForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
          email: data.user.email || "",
          role: data.user.role || "",
        });
      }
    };
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: form.name, phone: form.phone }),
    });
    const data = await res.json();
    setMsg(data.ok ? "Profile updated" : data.error || "Update failed");
  };

  return (
    <section className="mx-auto max-w-xl panel">
      <h1 className="text-2xl font-semibold">Profile</h1>
      {msg && <p className="mt-2 text-sm text-slate-300">{msg}</p>}
      <form onSubmit={save} className="mt-4 space-y-3">
        <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" value={form.email} disabled />
        <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" value={form.role} disabled />
        <div className="flex flex-wrap gap-2">
          <button className="rounded bg-sky-700 px-3 py-2 text-white hover:bg-sky-600">Save</button>
          <Link href="/chat" className="rounded bg-emerald-700 px-3 py-2 text-white hover:bg-emerald-600">
            Open Chat
          </Link>
          <Link href="/referrals" className="rounded bg-fuchsia-700 px-3 py-2 text-white hover:bg-fuchsia-600">
            Referrals
          </Link>
          <Link href="/membership" className="rounded bg-amber-700 px-3 py-2 text-white hover:bg-amber-600">
            Membership
          </Link>
        </div>
      </form>
    </section>
  );
}
