"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Calendar,
  FileText,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Flag,
  Ban,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

const FRAUD_STAT_COLORS = {
  blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  rose: { bg: "bg-rose-500/20", text: "text-rose-400" },
  orange: { bg: "bg-orange-500/20", text: "text-orange-400" },
};

function StatCard({ icon: Icon, label, value, color = "blue", alert = false }) {
  const palette = FRAUD_STAT_COLORS[color] || FRAUD_STAT_COLORS.blue;

  return (
    <div
      className={`group rounded-xl border ${
        alert
          ? "border-rose-500/30 bg-rose-500/5"
          : "border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]"
      } p-4 transition hover:border-fuchsia-500/30 sm:p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 sm:text-sm">{label}</p>
          <p className={`mt-1 text-xl font-bold sm:text-2xl ${alert ? "text-rose-400" : "text-white"}`}>{value}</p>
        </div>
        <div className={`rounded-lg p-2 sm:p-2.5 ${alert ? "bg-rose-500/20" : palette.bg}`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${alert ? "text-rose-400" : palette.text}`} />
        </div>
      </div>
    </div>
  );
}

export default function AdminFraudPage() {
  const [signals, setSignals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const load = useCallback(async () => {
    const sp = new URLSearchParams();
    if (statusFilter) sp.set("status", statusFilter);
    if (severityFilter) sp.set("severity", severityFilter);
    const res = await fetch(`/api/admin/fraud?${sp.toString()}`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    setSignals(data.signals || []);
    setSummary(data.summary || null);
  }, [severityFilter, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const updateStatus = async (signalId, status) => {
    const res = await fetch("/api/admin/fraud", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ signalId, status }),
    });
    const data = await res.json().catch(() => ({}));
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? `Signal marked as ${status}` : data.error || "Failed to update signal");
    if (data.ok) await load();
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return <AlertOctagon className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <Flag className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'reviewing': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ignored': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-orange-600 sm:h-14 sm:w-14">
                <ShieldAlert className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Fraud Detection</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Review suspicious booking/payment patterns and resolve them
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
          <StatCard icon={AlertOctagon} label="Total Signals" value={summary?.total || 0} color="blue" />
          <StatCard 
            icon={AlertCircle} 
            label="Open" 
            value={summary?.byStatus?.open || 0} 
            color="rose" 
            alert={summary?.byStatus?.open > 0}
          />
          <StatCard 
            icon={AlertTriangle} 
            label="Critical" 
            value={summary?.bySeverity?.critical || 0} 
            color="rose" 
            alert={summary?.bySeverity?.critical > 0}
          />
          <StatCard 
            icon={Flag} 
            label="High" 
            value={summary?.bySeverity?.high || 0} 
            color="orange" 
            alert={summary?.bySeverity?.high > 0}
          />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-base font-semibold text-white sm:text-lg">Filters</h2>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Status</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="open">🟢 Open</option>
                <option value="reviewing">🟡 Reviewing</option>
                <option value="resolved">✅ Resolved</option>
                <option value="ignored">⚪ Ignored</option>
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Severity</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                value={severityFilter} 
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="">All severities</option>
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Signals List */}
        <div className="space-y-4">
          {signals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 text-center">
              <Shield className="h-12 w-12 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">No fraud signals found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters</p>
            </div>
          ) : (
            signals.map((signal) => (
              <article 
                key={signal._id} 
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:p-6"
              >
                {/* Severity Indicator Line */}
                <div className={`absolute left-0 top-0 h-full w-1 ${
                  signal.severity === 'critical' ? 'bg-gradient-to-b from-rose-500 to-rose-600' :
                  signal.severity === 'high' ? 'bg-gradient-to-b from-orange-500 to-orange-600' :
                  signal.severity === 'medium' ? 'bg-gradient-to-b from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-b from-blue-500 to-blue-600'
                }`} />

                <div className="pl-2 sm:pl-3">
                  {/* Header */}
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${getSeverityColor(signal.severity)}`}>
                        {getSeverityIcon(signal.severity)}
                        {signal.severity.toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${getStatusColor(signal.status)}`}>
                        {signal.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      <Clock className="mr-1 inline h-3 w-3" />
                      {new Date(signal.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Signal Type */}
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-white sm:text-lg">
                      {signal.signalType}
                    </h3>
                  </div>

                  {/* User & Booking Info */}
                  <div className="mb-3 grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <User className="h-4 w-4 text-fuchsia-400" />
                      <div className="text-sm">
                        <p className="text-white">{signal.user?.name || "Unknown User"}</p>
                        <p className="text-xs text-slate-400">{signal.user?.email || "No email"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <FileText className="h-4 w-4 text-fuchsia-400" />
                      <div className="text-sm">
                        <p className="text-white">Booking #{signal.bookingId ? String(signal.bookingId).slice(-6) : "-"}</p>
                        <p className="text-xs text-slate-400">ID: {signal.bookingId || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reasons */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1">Detection Reasons:</p>
                    <div className="flex flex-wrap gap-1">
                      {(signal.reasons || []).map((reason, idx) => (
                        <span key={idx} className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs text-rose-400">
                          {reason}
                        </span>
                      ))}
                      {(signal.reasons || []).length === 0 && (
                        <span className="text-xs text-slate-500">No specific reasons</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(signal._id, "reviewing")}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20 sm:px-4 sm:py-2 sm:text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">Mark</span> Reviewing
                    </button>
                    
                    <button
                      onClick={() => updateStatus(signal._id, "resolved")}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20 sm:px-4 sm:py-2 sm:text-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Mark</span> Resolved
                    </button>
                    
                    <button
                      onClick={() => updateStatus(signal._id, "ignored")}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/20 sm:px-4 sm:py-2 sm:text-sm"
                    >
                      <Ban className="h-4 w-4" />
                      Ignore
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
