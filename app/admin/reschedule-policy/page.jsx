"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  Trash2,
  Shield,
  AlertTriangle,
  Ban,
  Zap,
} from "lucide-react";

export default function AdminReschedulePolicyPage() {
  const [policy, setPolicy] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/reschedule-policy", { credentials: "include" });
    const data = await res.json();
    setPolicy(data.policy || null);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const updateTier = (idx, key, value) => {
    setPolicy((prev) => ({
      ...prev,
      tiers: prev.tiers.map((tier, i) => (i === idx ? { ...tier, [key]: Number(value) } : tier)),
    }));
  };

  const addTier = () => {
    setPolicy((prev) => ({
      ...prev,
      tiers: [...prev.tiers, { minHoursBefore: 0, maxHoursBefore: 24, fee: 0 }],
    }));
  };

  const removeTier = (idx) => {
    if (policy.tiers.length <= 1) {
      setMsgType("error");
      setMsg("At least one tier is required");
      setTimeout(() => {
        setMsg("");
        setMsgType("");
      }, 3000);
      return;
    }
    setPolicy((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== idx),
    }));
  };

  const toggleBlockStatus = (status) => {
    setPolicy((prev) => ({
      ...prev,
      blockStatuses: prev.blockStatuses?.includes(status)
        ? prev.blockStatuses.filter((s) => s !== status)
        : [...(prev.blockStatuses || []), status],
    }));
  };

  const toggleHighFeeStatus = (status) => {
    setPolicy((prev) => ({
      ...prev,
      highFeeStatuses: prev.highFeeStatuses?.includes(status)
        ? prev.highFeeStatuses.filter((s) => s !== status)
        : [...(prev.highFeeStatuses || []), status],
    }));
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      name: policy.name,
      tiers: policy.tiers,
      blockStatuses: policy.blockStatuses || [],
      highFeeStatuses: policy.highFeeStatuses || [],
      highFeeAmount: Number(policy.highFeeAmount || 0),
    };

    const res = await fetch("/api/admin/reschedule-policy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? "Policy updated successfully" : data.error || "Failed to update policy");
    if (data.ok) load();
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  if (!policy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-fuchsia-500"></div>
            <p className="mt-4 text-sm text-slate-400">Loading policy...</p>
          </div>
        </div>
      </div>
    );
  }

  const bookingStatuses = ["confirmed", "assigned", "onway", "working", "completed", "cancelled"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
                <Calendar className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Reschedule Policy</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Configure fees based on time before slot and booking status
                </p>
              </div>
            </div>
            <button
              onClick={() => load()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white sm:self-start"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          
          {/* Message Toast */}
          {msg && (
            <div className={`mt-4 rounded-lg p-3 text-sm ${
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
        </div>

        {/* Policy Form */}
        <div className="space-y-6">
          
          {/* Policy Name */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Edit className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-lg font-semibold text-white">Policy Details</h2>
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Policy Name</label>
              <input 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                value={policy.name} 
                onChange={(e) => setPolicy({ ...policy, name: e.target.value })} 
              />
            </div>
          </div>

          {/* Fee Tiers */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-fuchsia-400" />
                <h2 className="text-lg font-semibold text-white">Fee Tiers</h2>
              </div>
              <button
                onClick={addTier}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-fuchsia-400/50 hover:text-white sm:text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Tier
              </button>
            </div>

            <p className="mb-4 text-xs text-slate-400">
              Configure fees based on hours before the scheduled slot
            </p>

            <div className="space-y-3">
              {/* Header */}
              <div className="hidden grid-cols-12 gap-2 px-2 text-xs text-slate-500 sm:grid">
                <div className="col-span-3">Min Hours</div>
                <div className="col-span-3">Max Hours</div>
                <div className="col-span-3">Fee (₹)</div>
                <div className="col-span-3"></div>
              </div>

              {policy.tiers.map((tier, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5 sm:col-span-3">
                    <input 
                      className="w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                      type="number" 
                      placeholder="Min" 
                      value={tier.minHoursBefore} 
                      onChange={(e) => updateTier(idx, "minHoursBefore", e.target.value)} 
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <input 
                      className="w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                      type="number" 
                      placeholder="Max" 
                      value={tier.maxHoursBefore} 
                      onChange={(e) => updateTier(idx, "maxHoursBefore", e.target.value)} 
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input 
                        className="w-full rounded-lg border border-white/10 bg-slate-900 p-2 pl-8 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                        type="number" 
                        placeholder="Fee" 
                        value={tier.fee} 
                        onChange={(e) => updateTier(idx, "fee", e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <button
                      onClick={() => removeTier(idx)}
                      className="flex items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400 transition hover:bg-rose-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Example: 24+ hours before = ₹0, 6-24 hours before = ₹99, less than 6 hours = ₹199
            </p>
          </div>

          {/* Blocked Statuses */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Ban className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-lg font-semibold text-white">Blocked Statuses</h2>
            </div>

            <p className="mb-3 text-xs text-slate-400">
              Reschedule/cancellation not allowed for these booking statuses
            </p>

            <div className="flex flex-wrap gap-2">
              {bookingStatuses.map((status) => (
                <label
                  key={status}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition ${
                    policy.blockStatuses?.includes(status)
                      ? 'border-rose-500/30 bg-rose-500/10'
                      : 'border-white/10 bg-slate-900/50 hover:border-fuchsia-500/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={policy.blockStatuses?.includes(status) || false}
                    onChange={() => toggleBlockStatus(status)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-fuchsia-500 focus:ring-fuchsia-500/20"
                  />
                  <span className={`text-sm ${
                    policy.blockStatuses?.includes(status) ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* High Fee Statuses */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-lg font-semibold text-white">High Fee Statuses</h2>
            </div>

            <p className="mb-3 text-xs text-slate-400">
              Apply a fixed high fee for these booking statuses
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              {bookingStatuses.map((status) => (
                <label
                  key={status}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition ${
                    policy.highFeeStatuses?.includes(status)
                      ? 'border-amber-500/30 bg-amber-500/10'
                      : 'border-white/10 bg-slate-900/50 hover:border-fuchsia-500/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={policy.highFeeStatuses?.includes(status) || false}
                    onChange={() => toggleHighFeeStatus(status)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-fuchsia-500 focus:ring-fuchsia-500/20"
                  />
                  <span className={`text-sm ${
                    policy.highFeeStatuses?.includes(status) ? 'text-amber-400' : 'text-slate-300'
                  }`}>
                    {status}
                  </span>
                </label>
              ))}
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">High Fee Amount (₹)</label>
              <div className="relative max-w-xs">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input 
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                  type="number" 
                  value={policy.highFeeAmount || 0} 
                  onChange={(e) => setPolicy({ ...policy, highFeeAmount: Number(e.target.value) })} 
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              onClick={save} 
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Policy"}
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 rounded-lg border border-white/10 bg-slate-900/30 p-4 text-xs text-slate-400">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-fuchsia-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">How it works:</p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-slate-400">
                <li>Fee tiers are evaluated in order based on hours before slot</li>
                <li>If booking status is in blocked list, reschedule/cancellation is not allowed</li>
                <li>If booking status is in high fee list, the fixed high fee amount is applied</li>
                <li>Otherwise, the matching tier fee is applied based on time before slot</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
