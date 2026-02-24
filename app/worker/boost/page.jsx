"use client";

import { useEffect, useState } from "react";

export default function WorkerBoostPage() {
  const [plans, setPlans] = useState([]);
  const [active, setActive] = useState([]);
  const [form, setForm] = useState({ planId: "", area: "Nerul", category: "Massage", paymentMethod: "online" });
  const [msg, setMsg] = useState("");

  const load = async () => {
    const [plansRes, activeRes] = await Promise.all([
      fetch("/api/boost/plans"),
      fetch("/api/boost/active", { credentials: "include" }),
    ]);
    const [plansData, activeData] = await Promise.all([plansRes.json(), activeRes.json()]);
    setPlans(plansData.plans || []);
    setActive(activeData.boosts || []);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const buy = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/boost/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMsg(data.ok ? "Boost activated" : data.error || "Boost purchase failed");
    if (data.ok) load();
  };

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={buy} className="panel space-y-3">
        <h1 className="text-2xl font-semibold">Worker Boost</h1>
        <p className="text-sm text-slate-400">Paid ranking by area + category with slot limit.</p>

        <select className="w-full rounded border border-slate-700 bg-slate-900 p-2" value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} required>
          <option value="">Select Plan</option>
          {plans.map((plan) => (
            <option key={plan._id} value={plan._id}>{plan.name} - INR {plan.price} ({plan.durationDays} days)</option>
          ))}
        </select>

        <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="Area (Nerul)" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
        <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="Category (Massage, Spa, Wellness)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <select className="w-full rounded border border-slate-700 bg-slate-900 p-2" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
          <option value="online">Online</option>
          <option value="wallet">Wallet</option>
        </select>

        <button className="rounded bg-sky-700 px-3 py-2 text-white hover:bg-sky-600">Buy Boost</button>
        {msg && <p className="text-sm text-slate-300">{msg}</p>}
      </form>

      <div className="panel">
        <h2 className="text-lg font-semibold">Active Boosts</h2>
        <div className="mt-2 space-y-2">
          {active.map((boost) => (
            <div key={boost._id} className="rounded border border-slate-700 p-2 text-sm">
              <p>Plan: {boost.plan?.name || "Plan"}</p>
              <p>Area: {boost.area || "All"} | Category: {boost.category || "All"}</p>
              <p>Boost Score: {boost.boostScore}</p>
              <p>Status: {boost.status}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
