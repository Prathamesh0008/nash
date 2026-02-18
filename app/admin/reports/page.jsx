"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Flag,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  Calendar,
  FileText,
  Filter,
  RefreshCw,
  Shield,
  Ban,
  Eye,
  EyeOff,
  MessageSquare,
  Link2,
  Download,
  Upload,
  ThumbsUp,
  ThumbsDown,
  Scale,
  Gavel,
} from "lucide-react";

const actions = ["warning", "tempBan", "permaBan", "noAction"];
const statuses = ["open", "investigating", "resolved", "closed"];
const severities = ["low", "medium", "high", "critical"];

function toInputState(report) {
  return {
    status: report.status || "open",
    adminAction: report.adminAction || "noAction",
    adminNotes: report.adminNotes || "",
    falseReport: Boolean(report.falseReportMarked || false),
  };
}

const REPORT_COLOR_STYLE_MAP = {
  blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  rose: { bg: "bg-rose-500/20", text: "text-rose-400" },
  amber: { bg: "bg-amber-500/20", text: "text-amber-400" },
  emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  slate: { bg: "bg-slate-500/20", text: "text-slate-400" },
};

function StatCard({ icon: Icon, label, value, color = "fuchsia", alert = false }) {
  const palette = REPORT_COLOR_STYLE_MAP[color] || REPORT_COLOR_STYLE_MAP.slate;

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
          <p className={`mt-1 text-xl font-bold sm:text-2xl ${alert ? "text-rose-400" : "text-white"}`}>
            {value}
          </p>
        </div>
        <div className={`rounded-lg p-2 sm:p-2.5 ${alert ? "bg-rose-500/20" : palette.bg}`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${alert ? "text-rose-400" : palette.text}`} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-5 w-5 text-fuchsia-400" />
      <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>
    </div>
  );
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [savingId, setSavingId] = useState("");
  const [disputeSavingId, setDisputeSavingId] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    severity: "",
    category: "",
    targetType: "",
  });
  const [inputs, setInputs] = useState({});

  const load = useCallback(async () => {
    const sp = new URLSearchParams();
    if (filters.status) sp.set("status", filters.status);
    if (filters.severity) sp.set("severity", filters.severity);
    if (filters.category) sp.set("category", filters.category);
    if (filters.targetType) sp.set("targetType", filters.targetType);

    const res = await fetch(`/api/admin/reports?${sp.toString()}`, { credentials: "include" });
    const data = await res.json();
    setReports(data.reports || []);
    setSummary(data.summary || null);
    setInputs((prev) => {
      const next = { ...prev };
      for (const report of data.reports || []) {
        if (!next[report._id]) {
          next[report._id] = toInputState(report);
        }
      }
      return next;
    });
  }, [filters.status, filters.severity, filters.category, filters.targetType]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const apply = async (reportId) => {
    const payload = inputs[reportId];
    if (!payload) return;
    setSavingId(reportId);
    const res = await fetch(`/api/admin/reports/${reportId}/action`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? "Report action applied successfully" : data.error || "Failed to apply action");
    if (data.ok) {
      await load();
    }
    setSavingId("");
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const applyDispute = async (reportId, status) => {
    setDisputeSavingId(`${reportId}:${status}`);
    const payload = {
      status,
      resolutionNote: inputs[reportId]?.adminNotes || "",
    };
    const res = await fetch(`/api/admin/reports/${reportId}/dispute`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? `Dispute marked as ${status}` : data.error || "Failed to update dispute");
    if (data.ok) await load();
    setDisputeSavingId("");
    
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
      case 'investigating': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'closed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 sm:h-14 sm:w-14">
                <Gavel className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Admin Reports</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Review disputes and take appropriate action
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
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          <StatCard icon={Flag} label="Total" value={summary?.total || 0} color="blue" />
          <StatCard icon={AlertCircle} label="Open" value={summary?.byStatus?.open || 0} color="rose" alert={summary?.byStatus?.open > 0} />
          <StatCard icon={Eye} label="Investigating" value={summary?.byStatus?.investigating || 0} color="amber" />
          <StatCard icon={CheckCircle} label="Resolved" value={summary?.byStatus?.resolved || 0} color="emerald" />
          <StatCard icon={XCircle} label="Closed" value={summary?.byStatus?.closed || 0} color="slate" />
          <StatCard icon={Clock} label="SLA Breached" value={summary?.slaBreached || 0} color="rose" alert={summary?.slaBreached > 0} />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
          <SectionHeader icon={Filter} title="Filters" />
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Status</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                value={filters.status} 
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Severity</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                value={filters.severity} 
                onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value }))}
              >
                <option value="">All Severity</option>
                {severities.map((severity) => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Category</label>
              <input 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                placeholder="e.g. fraud, abuse" 
                value={filters.category} 
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))} 
              />
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Target Type</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                value={filters.targetType} 
                onChange={(e) => setFilters((prev) => ({ ...prev, targetType: e.target.value }))}
              >
                <option value="">All Target Types</option>
                <option value="worker">👤 Worker</option>
                <option value="user">👥 User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 text-center">
              <Flag className="h-12 w-12 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">No reports found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters</p>
            </div>
          ) : (
            reports.map((report) => (
              <div 
                key={report._id} 
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:p-6"
              >
                {/* Severity Indicator Line */}
                <div className={`absolute left-0 top-0 h-full w-1 ${
                  report.severity === 'critical' ? 'bg-gradient-to-b from-rose-500 to-rose-600' :
                  report.severity === 'high' ? 'bg-gradient-to-b from-orange-500 to-orange-600' :
                  report.severity === 'medium' ? 'bg-gradient-to-b from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-b from-blue-500 to-blue-600'
                }`} />

                <div className="pl-2 sm:pl-3">
                  {/* Header */}
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${getSeverityColor(report.severity)}`}>
                        {getSeverityIcon(report.severity)}
                        {report.severity.toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${getStatusColor(report.status)}`}>
                        <Clock className="h-3 w-3" />
                        {report.status}
                      </span>
                      {report.slaBreached && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-400">
                          <AlertOctagon className="h-3 w-3" />
                          SLA Breached
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-white">
                      Category: {report.category}
                    </span>
                  </div>

                  {/* Report Details Grid */}
                  <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <Briefcase className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm min-w-0">
                        <p className="text-white truncate">Booking #{report.bookingId?.slice(-6)}</p>
                        <p className="text-xs text-slate-400 truncate">Status: {report.booking?.status || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <User className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm min-w-0">
                        <p className="text-white truncate">{report.reporter?.name || report.reporterType}</p>
                        <p className="text-xs text-slate-400 truncate">Reporter</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <Shield className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm min-w-0">
                        <p className="text-white truncate">{report.target?.name || report.targetType}</p>
                        <p className="text-xs text-slate-400 truncate">Target</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <Calendar className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm">
                        <p className="text-white">{report.booking?.slotTime ? new Date(report.booking.slotTime).toLocaleDateString() : 'N/A'}</p>
                        <p className="text-xs text-slate-400">Slot</p>
                      </div>
                    </div>
                  </div>

                  {/* Dispute Info */}
                  {report.disputeStatus && report.disputeStatus !== 'none' && (
                    <div className="mb-3 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-amber-400">
                        Dispute Status: {report.disputeStatus}
                      </span>
                    </div>
                  )}

                  {/* Message */}
                  <div className="mb-3 rounded-lg bg-slate-900/40 p-3">
                    <p className="text-sm text-white">{report.message}</p>
                  </div>

                  {/* Evidence Links */}
                  {Array.isArray(report.evidence) && report.evidence.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {report.evidence.map((url, idx) => (
                        <a
                          key={`${report._id}-evidence-${idx}`}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 transition hover:border-fuchsia-400/50 hover:text-white"
                        >
                          <Link2 className="h-3 w-3" />
                          Evidence {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <select 
                      className="rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                      value={inputs[report._id]?.status || "open"} 
                      onChange={(e) => setInputs((prev) => ({ ...prev, [report._id]: { ...prev[report._id], status: e.target.value } }))}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    
                    <select 
                      className="rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                      value={inputs[report._id]?.adminAction || "noAction"} 
                      onChange={(e) => setInputs((prev) => ({ ...prev, [report._id]: { ...prev[report._id], adminAction: e.target.value } }))}
                    >
                      {actions.map((action) => (
                        <option key={action} value={action}>{action}</option>
                      ))}
                    </select>
                    
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-slate-900/50 p-2 text-sm text-slate-300 transition hover:border-fuchsia-500/30">
                      <input 
                        type="checkbox" 
                        checked={Boolean(inputs[report._id]?.falseReport)} 
                        onChange={(e) => setInputs((prev) => ({ ...prev, [report._id]: { ...prev[report._id], falseReport: e.target.checked } }))}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-fuchsia-500 focus:ring-fuchsia-500/20"
                      />
                      <span>Mark False Report</span>
                    </label>
                    
                    <button 
                      onClick={() => apply(report._id)} 
                      disabled={savingId === report._id} 
                      className="rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      {savingId === report._id ? "Saving..." : "Apply Action"}
                    </button>
                  </div>

                  {/* Admin Notes */}
                  <textarea
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    rows={2}
                    placeholder="Add admin notes..."
                    value={inputs[report._id]?.adminNotes || ""}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [report._id]: { ...prev[report._id], adminNotes: e.target.value } }))}
                  />

                  {/* Dispute Actions */}
                  {["raised", "reviewing"].includes(report.disputeStatus) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => applyDispute(report._id, "reviewing")}
                        disabled={Boolean(disputeSavingId)}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
                      >
                        <Eye className="h-4 w-4" />
                        {disputeSavingId === `${report._id}:reviewing` ? "Saving..." : "Mark Reviewing"}
                      </button>
                      
                      <button
                        onClick={() => applyDispute(report._id, "closed")}
                        disabled={Boolean(disputeSavingId)}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {disputeSavingId === `${report._id}:closed` ? "Saving..." : "Close Dispute"}
                      </button>
                    </div>
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
