"use client";

import { useEffect, useState } from "react";
import {
  Gift,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Clock,
  Users,
  Infinity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Save,
  Edit,
  Trash2,
  AlertCircle,
  Copy,
  Award,
} from "lucide-react";

const emptyForm = {
  code: "",
  title: "",
  description: "",
  discountType: "flat",
  discountValue: "0",
  maxDiscount: "0",
  minOrderAmount: "0",
  maxUses: "0",
  perUserLimit: "1",
  validFrom: "",
  validTill: "",
  active: true,
};

export default function AdminPromosPage() {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/promos", { credentials: "include" });
    const data = await res.json();
    setPromos(data.promos || []);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...form,
        code: String(form.code || "").toUpperCase(),
      }),
    });
    const data = await res.json();
    setLoading(false);
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? "Promo saved successfully" : data.error || "Failed to save promo");
    if (data.ok) {
      setForm(emptyForm);
      load();
    }
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const toggle = async (promoId, nextActive) => {
    const res = await fetch(`/api/admin/promos/${promoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ active: nextActive }),
    });
    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? "Promo updated successfully" : data.error || "Failed to update promo");
    if (data.ok) load();
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setMsgType("success");
    setMsg(`Code ${code} copied to clipboard`);
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
                <Gift className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Promo Codes</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Create and manage discounts for bookings
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

        {/* Create Promo Form */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-lg font-semibold text-white">Create New Promo</h2>
          </div>

          <form onSubmit={save} className="space-y-4">
            {/* Basic Info Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Promo Code *</label>
                <input 
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="e.g. SUMMER2024" 
                  value={form.code} 
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} 
                  required 
                />
              </div>
              
              <div>
                <label className="mb-1 block text-xs text-slate-400">Title</label>
                <input 
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="e.g. Summer Special" 
                  value={form.title} 
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} 
                />
              </div>
              
              <div>
                <label className="mb-1 block text-xs text-slate-400">Discount Type</label>
                <select 
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                  value={form.discountType} 
                  onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}
                >
                  <option value="flat">💰 Flat Amount</option>
                  <option value="percent">📊 Percentage</option>
                </select>
              </div>
            </div>

            {/* Discount Values Row */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  {form.discountType === 'flat' ? 'Discount Amount (₹)' : 'Discount Percentage (%)'}
                </label>
                <div className="relative">
                  {form.discountType === 'flat' ? (
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  ) : (
                    <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  )}
                  <input 
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    type="number" 
                    placeholder={form.discountType === 'flat' ? 'Amount' : 'Percentage'} 
                    value={form.discountValue} 
                    onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} 
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-xs text-slate-400">Max Discount (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input 
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    type="number" 
                    placeholder="Max discount" 
                    value={form.maxDiscount} 
                    onChange={(e) => setForm((p) => ({ ...p, maxDiscount: e.target.value }))} 
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-xs text-slate-400">Min Order (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input 
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    type="number" 
                    placeholder="Min order amount" 
                    value={form.minOrderAmount} 
                    onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))} 
                  />
                </div>
              </div>
            </div>

            {/* Usage Limits Row */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Max Uses (0 = unlimited)</label>
                <div className="relative">
                  <Infinity className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input 
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    type="number" 
                    placeholder="Max uses" 
                    value={form.maxUses} 
                    onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))} 
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-xs text-slate-400">Per User Limit</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input 
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    type="number" 
                    placeholder="Per user limit" 
                    value={form.perUserLimit} 
                    onChange={(e) => setForm((p) => ({ ...p, perUserLimit: e.target.value }))} 
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-xs text-slate-400">Valid Until</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input 
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                    type="datetime-local" 
                    value={form.validTill} 
                    onChange={(e) => setForm((p) => ({ ...p, validTill: e.target.value }))} 
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-xs text-slate-400">Description</label>
              <textarea 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                rows={2}
                placeholder="Brief description of this promo" 
                value={form.description} 
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} 
              />
            </div>

            {/* Submit Button */}
            <button 
              disabled={loading} 
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 sm:w-auto sm:px-6"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Promo"}
            </button>
          </form>
        </div>

        {/* Promos List */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-lg font-semibold text-white">Existing Promos</h2>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {promos.length} {promos.length === 1 ? 'Promo' : 'Promos'}
            </span>
          </div>

          {promos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Gift className="h-12 w-12 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">No promos created yet</p>
              <p className="text-xs text-slate-500">Create your first promo using the form</p>
            </div>
          ) : (
            <div className="space-y-3">
              {promos.map((promo) => (
                <div 
                  key={promo._id} 
                  className={`group relative overflow-hidden rounded-lg border p-4 transition ${
                    promo.active 
                      ? 'border-emerald-500/30 bg-emerald-500/5' 
                      : 'border-white/10 bg-slate-900/40 hover:border-fuchsia-500/30'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className={`absolute left-0 top-0 h-full w-1 ${
                    promo.active 
                      ? 'bg-gradient-to-b from-emerald-500 to-emerald-600'
                      : 'bg-gradient-to-b from-slate-500 to-slate-600'
                  }`} />

                  <div className="pl-2 sm:pl-3">
                    {/* Header */}
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyCode(promo.code)}
                          className="group/copy relative"
                          title="Copy code"
                        >
                          <code className="rounded-lg bg-slate-800 px-3 py-1.5 font-mono text-sm font-bold text-fuchsia-400">
                            {promo.code}
                          </code>
                          <Copy className="absolute -right-2 -top-2 h-4 w-4 text-slate-400 opacity-0 transition group-hover/copy:opacity-100" />
                        </button>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                          promo.active 
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {promo.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => toggle(promo._id, !promo.active)}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          promo.active 
                            ? 'border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                            : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {promo.active ? (
                          <>
                            <XCircle className="h-3 w-3" />
                            Disable
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Enable
                          </>
                        )}
                      </button>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-xs text-slate-500">Discount</p>
                        <p className="font-medium text-white">
                          {promo.discountType === 'flat' 
                            ? `₹${promo.discountValue}` 
                            : `${promo.discountValue}%`}
                          {promo.discountType === 'percent' && promo.maxDiscount && (
                            <span className="ml-1 text-xs text-slate-400">
                              (max ₹{promo.maxDiscount})
                            </span>
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-slate-500">Min Order</p>
                        <p className="font-medium text-white">₹{promo.minOrderAmount || 0}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-slate-500">Usage</p>
                        <p className="font-medium text-white">
                          {promo.usedCount || 0} / {promo.maxUses === '0' ? '∞' : promo.maxUses}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-slate-500">Valid Until</p>
                        <p className="font-medium text-white">
                          {promo.validTill ? new Date(promo.validTill).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>

                    {/* Title & Description */}
                    {promo.title && (
                      <p className="mt-2 text-sm font-medium text-white">{promo.title}</p>
                    )}
                    {promo.description && (
                      <p className="mt-1 text-xs text-slate-400">{promo.description}</p>
                    )}

                    {/* Per User Limit */}
                    <p className="mt-2 text-xs text-slate-500">
                      Per user limit: {promo.perUserLimit || 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
