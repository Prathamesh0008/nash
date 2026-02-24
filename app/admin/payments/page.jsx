"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  DollarSign,
  Banknote,
  RefreshCw,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Mail,
  FileText,
  Wallet,
  ArrowLeftRight,
  Receipt,
  Building,
  Smartphone,
  Globe,
} from "lucide-react";

const PAYMENT_STAT_COLORS = {
  blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  amber: { bg: "bg-amber-500/20", text: "text-amber-400" },
};

function StatCard({ icon: Icon, label, value, color = "blue" }) {
  const palette = PAYMENT_STAT_COLORS[color] || PAYMENT_STAT_COLORS.blue;

  return (
    <div className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 sm:text-sm">{label}</p>
          <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
        </div>
        <div className={`rounded-lg p-2 sm:p-2.5 ${palette.bg}`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${palette.text}`} />
        </div>
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    provider: "",
    type: "",
    q: "",
  });
  const [refundInputs, setRefundInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const load = useCallback(async () => {
    const sp = new URLSearchParams();
    if (filters.status) sp.set("status", filters.status);
    if (filters.provider) sp.set("provider", filters.provider);
    if (filters.type) sp.set("type", filters.type);
    if (filters.q) sp.set("q", filters.q);

    setLoading(true);
    const res = await fetch(`/api/admin/payments?${sp.toString()}`, { credentials: "include" });
    const data = await res.json();
    setPayments(data.payments || []);
    setSummary(data.summary || null);
    setLoading(false);
  }, [filters.provider, filters.q, filters.status, filters.type]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const refund = async (paymentId) => {
    const rawAmount = refundInputs[paymentId]?.amount || "";
    const note = refundInputs[paymentId]?.note || "";
    const amount = rawAmount === "" ? undefined : Number(rawAmount);

    const res = await fetch("/api/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ paymentId, amount, note }),
    });
    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? "Refund completed to wallet ledger" : data.error || "Refund failed");
    if (data.ok) await load();
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'created': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'refunded': return <ArrowLeftRight className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'created': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'failed': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'refunded': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getProviderIcon = (provider) => {
    switch(provider) {
      case 'razorpay': return <Building className="h-4 w-4" />;
      case 'demo': return <Smartphone className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 sm:h-14 sm:w-14">
                <CreditCard className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Admin Payments</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Manage and process payment refunds
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
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <StatCard icon={Receipt} label="Total Payments" value={summary?.totalPayments || 0} color="blue" />
          <StatCard icon={DollarSign} label="Paid Amount" value={`₹${summary?.paidAmount || 0}`} color="emerald" />
          <StatCard icon={Wallet} label="Refunded" value={`₹${summary?.refundedAmount || 0}`} color="amber" />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-base font-semibold text-white sm:text-lg">Filters</h2>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Status</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                value={filters.status} 
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                {["created", "paid", "failed", "refunded"].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Provider</label>
              <input 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                placeholder="e.g., demo, razorpay" 
                value={filters.provider} 
                onChange={(e) => setFilters((prev) => ({ ...prev, provider: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Type</label>
              <input 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                placeholder="e.g., booking, boost" 
                value={filters.type} 
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input 
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="Search user/booking..." 
                  value={filters.q} 
                  onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">Loading payments...</p>
            </div>
          )}

          {!loading && payments.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 text-center">
              <CreditCard className="h-12 w-12 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">No payments found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters</p>
            </div>
          )}

          {!loading && payments.map((payment) => (
            <div 
              key={payment._id} 
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:p-6"
            >
              {/* Status Indicator Line */}
              <div className={`absolute left-0 top-0 h-full w-1 ${
                payment.status === 'paid' ? 'bg-gradient-to-b from-emerald-500 to-emerald-600' :
                payment.status === 'created' ? 'bg-gradient-to-b from-amber-500 to-amber-600' :
                payment.status === 'failed' ? 'bg-gradient-to-b from-rose-500 to-rose-600' :
                payment.status === 'refunded' ? 'bg-gradient-to-b from-purple-500 to-purple-600' :
                'bg-gradient-to-b from-slate-500 to-slate-600'
              }`} />

              <div className="pl-2 sm:pl-3">
                {/* Header */}
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                      {getProviderIcon(payment.provider)}
                      {payment.provider}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    ₹{payment.amount}
                  </span>
                </div>

                {/* Payment Details Grid */}
                <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                    <Receipt className="h-4 w-4 text-fuchsia-400 shrink-0" />
                    <div className="text-sm min-w-0">
                      <p className="text-white truncate">{payment.type}</p>
                      <p className="text-xs text-slate-400 truncate">ID: {payment._id.slice(-6)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                    <User className="h-4 w-4 text-fuchsia-400 shrink-0" />
                    <div className="text-sm min-w-0">
                      <p className="text-white truncate">{payment.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 truncate">{payment.user?.email || payment.userId?.slice(-6)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                    <FileText className="h-4 w-4 text-fuchsia-400 shrink-0" />
                    <div className="text-sm">
                      <p className="text-white">Booking</p>
                      <p className="text-xs text-slate-400">{payment.bookingId ? payment.bookingId.slice(-6) : "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                    <Banknote className="h-4 w-4 text-fuchsia-400 shrink-0" />
                    <div className="text-sm">
                      <p className="text-white">Provider ID</p>
                      <p className="text-xs text-slate-400 truncate">{payment.providerPaymentId || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Refund Controls */}
                {payment.status === "paid" && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <input 
                      className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                      placeholder="Partial refund amount (optional)" 
                      value={refundInputs[payment._id]?.amount || ""} 
                      onChange={(e) => setRefundInputs((prev) => ({ 
                        ...prev, 
                        [payment._id]: { ...prev[payment._id], amount: e.target.value } 
                      }))}
                    />
                    
                    <input 
                      className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                      placeholder="Refund note (optional)" 
                      value={refundInputs[payment._id]?.note || ""} 
                      onChange={(e) => setRefundInputs((prev) => ({ 
                        ...prev, 
                        [payment._id]: { ...prev[payment._id], note: e.target.value } 
                      }))}
                    />
                    
                    <button 
                      disabled={payment.status !== "paid"} 
                      onClick={() => refund(payment._id)} 
                      className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 sm:px-6"
                    >
                      Process Refund
                    </button>
                  </div>
                )}

                {payment.status !== "paid" && (
                  <div className="mt-4 rounded-lg bg-slate-800/50 p-3 text-xs text-slate-400">
                    <AlertCircle className="mr-1 inline h-3 w-3" />
                    Refunds are only available for paid payments
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
