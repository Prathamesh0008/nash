"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Banknote,
  RefreshCw,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Send,
  Receipt,
  Building,
} from "lucide-react";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [savingId, setSavingId] = useState("");
  const [inputs, setInputs] = useState({});

  const load = async () => {
    const sp = new URLSearchParams();
    if (statusFilter) sp.set("status", statusFilter);

    const res = await fetch(`/api/admin/payouts?${sp.toString()}`, { credentials: "include" });
    const data = await res.json();
    setPayouts(data.payouts || []);
    setSummary(data.summary || null);
    setInputs((prev) => {
      const next = { ...prev };
      for (const payout of data.payouts || []) {
        if (!next[payout._id]) {
          next[payout._id] = {
            note: payout.note || "",
            bankRef: payout.bankRef || "",
          };
        }
      }
      return next;
    });
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const update = async (id, status) => {
    setSavingId(id);
    const res = await fetch(`/api/admin/payouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        status,
        note: inputs[id]?.note || "",
        bankRef: inputs[id]?.bankRef || "",
      }),
    });
    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? `Payout marked as ${status}` : data.error || "Failed to update payout");
    if (data.ok) await load();
    setSavingId("");
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'requested': return <Clock className="h-4 w-4" />;
      case 'approved': return <ThumbsUp className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <ThumbsDown className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'requested': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'approved': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paid': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'rejected': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const StatCard = ({ icon: Icon, label, value, color = "fuchsia" }) => (
    <div className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 sm:text-sm">{label}</p>
          <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
        </div>
        <div className={`rounded-lg bg-${color}-500/20 p-2 sm:p-2.5`}>
          <Icon className={`h-4 w-4 text-${color}-400 sm:h-5 sm:w-5`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
                <Wallet className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Admin Payouts</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Manage worker payout requests and payments
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

        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatCard icon={Clock} label="Requested" value={summary?.counts?.requested || 0} color="amber" />
          <StatCard icon={ThumbsUp} label="Approved" value={summary?.counts?.approved || 0} color="blue" />
          <StatCard icon={CheckCircle} label="Paid" value={summary?.counts?.paid || 0} color="emerald" />
          <StatCard icon={ThumbsDown} label="Rejected" value={summary?.counts?.rejected || 0} color="rose" />
        </div>

        {/* Filter */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-base font-semibold text-white sm:text-lg">Filter by Status</h2>
          </div>
          
          <div className="max-w-xs">
            <select 
              className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="requested">🟡 Requested</option>
              <option value="approved">🔵 Approved</option>
              <option value="paid">🟢 Paid</option>
              <option value="rejected">🔴 Rejected</option>
            </select>
          </div>
        </div>

        {/* Payouts List */}
        <div className="space-y-4">
          {payouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 text-center">
              <Wallet className="h-12 w-12 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">No payouts found</p>
              <p className="text-xs text-slate-500">Try adjusting your status filter</p>
            </div>
          ) : (
            payouts.map((payout) => (
              <div 
                key={payout._id} 
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:p-6"
              >
                {/* Status Indicator Line */}
                <div className={`absolute left-0 top-0 h-full w-1 ${
                  payout.status === 'paid' ? 'bg-gradient-to-b from-emerald-500 to-emerald-600' :
                  payout.status === 'approved' ? 'bg-gradient-to-b from-blue-500 to-blue-600' :
                  payout.status === 'requested' ? 'bg-gradient-to-b from-amber-500 to-amber-600' :
                  payout.status === 'rejected' ? 'bg-gradient-to-b from-rose-500 to-rose-600' :
                  'bg-gradient-to-b from-slate-500 to-slate-600'
                }`} />

                <div className="pl-2 sm:pl-3">
                  {/* Header */}
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${getStatusColor(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                        {payout.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-white">
                      ₹{payout.amount}
                    </span>
                  </div>

                  {/* Worker Info Grid */}
                  <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <User className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm min-w-0">
                        <p className="text-white truncate">{payout.worker?.name || 'Unknown Worker'}</p>
                        <p className="text-xs text-slate-400 truncate">ID: {payout.workerId?.slice(-6)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <Mail className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm min-w-0">
                        <p className="text-white truncate">{payout.worker?.email || 'No email'}</p>
                        <p className="text-xs text-slate-400 truncate">Email</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <Phone className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm">
                        <p className="text-white">{payout.worker?.phone || 'No phone'}</p>
                        <p className="text-xs text-slate-400">Phone</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <Calendar className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm">
                        <p className="text-white">{new Date(payout.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400">Requested</p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Inputs */}
                  <div className="mb-4 grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">Bank Reference</label>
                      <input 
                        className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                        placeholder="Enter bank reference (for paid)" 
                        value={inputs[payout._id]?.bankRef || ""} 
                        onChange={(e) => setInputs((prev) => ({ 
                          ...prev, 
                          [payout._id]: { ...prev[payout._id], bankRef: e.target.value } 
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">Admin Note</label>
                      <input 
                        className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                        placeholder="Add internal note" 
                        value={inputs[payout._id]?.note || ""} 
                        onChange={(e) => setInputs((prev) => ({ 
                          ...prev, 
                          [payout._id]: { ...prev[payout._id], note: e.target.value } 
                        }))}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {payout.status === "requested" && (
                      <>
                        <button 
                          disabled={savingId === payout._id} 
                          onClick={() => update(payout._id, "approved")} 
                          className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          Approve
                        </button>
                        
                        <button 
                          disabled={savingId === payout._id} 
                          onClick={() => update(payout._id, "rejected")} 
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}
                    
                    {payout.status === "approved" && (
                      <>
                        <button 
                          disabled={savingId === payout._id} 
                          onClick={() => update(payout._id, "paid")} 
                          className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark Paid
                        </button>
                        
                        <button 
                          disabled={savingId === payout._id} 
                          onClick={() => update(payout._id, "rejected")} 
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>

                  {/* Status-specific hints */}
                  {payout.status === "requested" && (
                    <p className="mt-2 text-xs text-amber-400">
                      <AlertCircle className="mr-1 inline h-3 w-3" />
                      Review worker details before approving
                    </p>
                  )}
                  
                  {payout.status === "approved" && (
                    <p className="mt-2 text-xs text-blue-400">
                      <AlertCircle className="mr-1 inline h-3 w-3" />
                      Add bank reference before marking as paid
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}