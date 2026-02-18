"use client";

import { useEffect, useState } from "react";
import {
  Zap,
  Plus,
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  MapPin,
  Layers,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Package,
} from "lucide-react";

export default function AdminBoostPlansPage() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    name: "Starter",
    price: 499,
    durationDays: 7,
    boostScore: 300,
    areaLimited: true,
    categoryLimited: true,
    slotLimit: 10,
    active: true,
  });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/boost-plans", { credentials: "include" });
    const data = await res.json();
    setPlans(data.plans || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      durationDays: Number(form.durationDays),
      boostScore: Number(form.boostScore),
      slotLimit: Number(form.slotLimit),
    };

    const res = await fetch("/api/admin/boost-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? "Boost plan created successfully" : data.error || "Failed to create plan");
    if (data.ok) {
      load();
      // Reset form to default values after successful creation
      setForm({
        name: "Starter",
        price: 499,
        durationDays: 7,
        boostScore: 300,
        areaLimited: true,
        categoryLimited: true,
        slotLimit: 10,
        active: true,
      });
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 sm:h-14 sm:w-14">
              <Zap className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">Boost Plans Management</h1>
              <p className="text-xs text-slate-400 sm:text-sm">
                Create and manage worker boost plans
              </p>
            </div>
          </div>
        </div>

        {/* Message Toast */}
        {msg && (
          <div className={`mb-4 rounded-lg p-3 text-sm sm:mb-6 ${
            msgType === "success" 
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
          }`}>
            <div className="flex items-center gap-2">
              {msgType === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {msg}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Create Plan Form */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-lg font-semibold text-white">Create New Boost Plan</h2>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {/* Plan Name */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Plan Name</label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Starter, Pro, Enterprise"
                  required
                />
              </div>

              {/* Price & Duration Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Price (INR)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Duration (Days)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                      type="number"
                      value={form.durationDays}
                      onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                      min="1"
                      step="1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Boost Score & Slot Limit Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Boost Score</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                      type="number"
                      value={form.boostScore}
                      onChange={(e) => setForm({ ...form, boostScore: e.target.value })}
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Slot Limit</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                      type="number"
                      value={form.slotLimit}
                      onChange={(e) => setForm({ ...form, slotLimit: e.target.value })}
                      min="1"
                      step="1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-slate-900/50 p-3 transition hover:border-fuchsia-500/30">
                  <input
                    type="checkbox"
                    checked={form.areaLimited}
                    onChange={(e) => setForm({ ...form, areaLimited: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-fuchsia-500 focus:ring-fuchsia-500/20"
                  />
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Area Limited</span>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-slate-900/50 p-3 transition hover:border-fuchsia-500/30">
                  <input
                    type="checkbox"
                    checked={form.categoryLimited}
                    onChange={(e) => setForm({ ...form, categoryLimited: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-fuchsia-500 focus:ring-fuchsia-500/20"
                  />
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Category Limited</span>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:rounded-xl"
              >
                Create Boost Plan
              </button>
            </form>
          </div>

          {/* Existing Plans List */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-fuchsia-400" />
                <h2 className="text-lg font-semibold text-white">Existing Plans</h2>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {plans.length} {plans.length === 1 ? 'Plan' : 'Plans'}
              </span>
            </div>

            {plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-slate-600" />
                <p className="mt-2 text-sm text-slate-400">No boost plans created yet</p>
                <p className="text-xs text-slate-500">Create your first plan using the form</p>
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-slate-900/40 p-4 transition hover:border-fuchsia-500/30"
                  >
                    {/* Status Indicator */}
                    <div className={`absolute left-0 top-0 h-full w-1 ${
                      plan.active 
                        ? "bg-gradient-to-b from-emerald-500 to-emerald-600"
                        : "bg-gradient-to-b from-slate-500 to-slate-600"
                    }`} />

                    <div className="pl-2">
                      {/* Header */}
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-white">{plan.name}</h3>
                          <p className="text-xs text-slate-400">ID: {plan._id.slice(-6)}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          plan.active 
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}>
                          {plan.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                        <div>
                          <p className="text-slate-500">Price</p>
                          <p className="font-medium text-white">₹{plan.price}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Duration</p>
                          <p className="font-medium text-white">{plan.durationDays}d</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Boost</p>
                          <p className="font-medium text-amber-400">{plan.boostScore}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Slot Limit</p>
                          <p className="font-medium text-white">{plan.slotLimit}</p>
                        </div>
                      </div>

                      {/* Limitations */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {plan.areaLimited && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-400">
                            <MapPin className="h-3 w-3" />
                            Area Limited
                          </span>
                        )}
                        {plan.categoryLimited && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-400">
                            <Layers className="h-3 w-3" />
                            Category Limited
                          </span>
                        )}
                      </div>

                      {/* Action Buttons (Placeholder for future functionality) */}
                      <div className="mt-3 flex gap-2 opacity-50">
                        <button className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400" disabled>
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-400/50" disabled>
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}