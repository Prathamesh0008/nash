"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { getWorkerOnboardingMissingFields, hasWorkerOnboardingComplete } from "@/lib/workerOnboardingChecklist";
import {
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Ban,
  UserCog,
  Download,
  Eye,
  MoreVertical,
  Star,
  Briefcase,
  FileText,
  Upload,
  Award,
  TrendingUp,
  DollarSign,
  Home,
  Globe,
  Camera,
  FileCheck,
  FileWarning,
  AlertTriangle,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function isPdfUrl(url = "") {
  return /\.pdf($|\?)/i.test(url);
}

const VERIFICATION_STATUS_OPTIONS = [
  { value: "", label: "All verification statuses" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "INCOMPLETE", label: "Incomplete" },
];

const QUEUE_STATUS_OPTIONS = [
  { value: "", label: "All queue statuses" },
  { value: "pending_review", label: "Pending Review Queue" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Queue Approved" },
  { value: "rejected", label: "Queue Rejected" },
  { value: "reupload_required", label: "Reupload Required" },
  { value: "not_submitted", label: "Not Submitted" },
];

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [preview, setPreview] = useState({ open: false, url: "", title: "" });
  const [loading, setLoading] = useState(false);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState({});
  const [bulkNote, setBulkNote] = useState("");
  const [expandedWorkers, setExpandedWorkers] = useState({});
  const [filters, setFilters] = useState({
    q: "",
    verificationStatus: "",
    queueStatus: "",
    feePaid: "",
    flagged: "",
  });
  const [filterHydrated, setFilterHydrated] = useState(false);

  const load = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    try {
      const search = new URLSearchParams();
      if (nextFilters.q.trim()) search.set("q", nextFilters.q.trim());
      if (nextFilters.verificationStatus) search.set("verificationStatus", nextFilters.verificationStatus);
      if (nextFilters.queueStatus) search.set("queueStatus", nextFilters.queueStatus);
      if (nextFilters.feePaid) search.set("feePaid", nextFilters.feePaid);
      if (nextFilters.flagged) search.set("flagged", nextFilters.flagged);
      const qs = search.toString();
      const res = await fetch(`/api/admin/workers${qs ? `?${qs}` : ""}`, { credentials: "include" });
      const data = await res.json();
      setWorkers(data.workers || []);
    } catch {
      setMsgType("error");
      setMsg("Failed to load workers");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const next = {
      q: params.get("q") || "",
      verificationStatus: params.get("verificationStatus") || "",
      queueStatus: params.get("queueStatus") || "",
      feePaid: params.get("feePaid") || "",
      flagged: params.get("flagged") || "",
    };
    setFilters(next);
    setFilterHydrated(true);
  }, []);

  useEffect(() => {
    if (!filterHydrated) return;
    const timeout = setTimeout(() => {
      load(filters);
      const search = new URLSearchParams();
      if (filters.q.trim()) search.set("q", filters.q.trim());
      if (filters.verificationStatus) search.set("verificationStatus", filters.verificationStatus);
      if (filters.queueStatus) search.set("queueStatus", filters.queueStatus);
      if (filters.feePaid) search.set("feePaid", filters.feePaid);
      if (filters.flagged) search.set("flagged", filters.flagged);
      const qs = search.toString();
      const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", nextUrl);
    }, 400);
    return () => clearTimeout(timeout);
  }, [filterHydrated, filters, load]);

  const action = async (workerId, action, reason = "") => {
    const res = await fetch(`/api/admin/workers/${workerId}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action, reason }),
    });
    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? `Worker ${action} completed` : data.error || "Action failed");
    if (data.ok) load();
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const toggleSelect = (workerId) => {
    setSelectedWorkerIds((prev) => {
      const next = { ...prev };
      if (next[workerId]) delete next[workerId];
      else next[workerId] = true;
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (workers.length === 0) return;
    const selectedCount = Object.keys(selectedWorkerIds).length;
    if (selectedCount === workers.length) {
      setSelectedWorkerIds({});
      return;
    }
    const next = {};
    workers.forEach((worker) => {
      if (worker.userId) next[worker.userId] = true;
    });
    setSelectedWorkerIds(next);
  };

  const toggleExpand = (workerId) => {
    setExpandedWorkers(prev => ({
      ...prev,
      [workerId]: !prev[workerId]
    }));
  };

  const bulkAction = async (actionType, reason = "") => {
    let ids = Object.keys(selectedWorkerIds);
    if (ids.length === 0) {
      setMsgType("error");
      setMsg("Select at least one worker for bulk action");
      return;
    }

    const finalReason = String(reason || bulkNote || "").trim();
    if ((actionType === "reject" || actionType === "reupload") && !finalReason) {
      setMsgType("error");
      setMsg("Reason is required for reject/re-upload");
      return;
    }

    if (actionType === "approve") {
      const workerById = new Map(workers.map((worker) => [String(worker.userId), worker]));
      const eligible = [];
      const skipped = [];
      ids.forEach((workerId) => {
        const worker = workerById.get(String(workerId));
        const onboardingComplete = hasWorkerOnboardingComplete(worker || {});
        if (onboardingComplete) eligible.push(workerId);
        else skipped.push(workerId);
      });
      ids = eligible;
      if (ids.length === 0) {
        setMsgType("error");
        setMsg(`No eligible workers for bulk approve. Skipped incomplete workers: ${skipped.length}`);
        return;
      }
      if (skipped.length > 0) {
        setMsg(`Bulk approve will skip ${skipped.length} incomplete workers.`);
      }
    }

    setMsg(`Processing ${actionType} for ${ids.length} workers...`);
    const results = await Promise.all(
      ids.map(async (workerId) => {
        const res = await fetch(`/api/admin/workers/${workerId}/verify`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: actionType, reason: finalReason }),
        });
        return res.json().catch(() => ({ ok: false }));
      })
    );
    const success = results.filter((row) => row?.ok).length;
    const failed = results.length - success;
    setMsgType(success > 0 ? "success" : "error");
    setMsg(`Bulk ${actionType} complete. Success: ${success}, Failed: ${failed}`);
    setSelectedWorkerIds({});
    setBulkNote("");
    load();
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const askReason = (title, placeholder) => {
    const input = window.prompt(title, placeholder);
    if (input === null) return null;
    const reason = input.trim();
    if (!reason) {
      setMsgType("error");
      setMsg("Reason is required");
      return null;
    }
    return reason;
  };

  const buildMissingFieldsReason = (worker) => {
    const missing = getWorkerOnboardingMissingFields(worker);
    if (missing.length === 0) return "Please re-submit onboarding details.";
    return `Please complete missing onboarding details: ${missing.join(", ")}.`;
  };

  const requestReuploadForMissing = async (worker) => {
    const workerId = String(worker?.userId || "");
    if (!workerId) return;
    const reason = buildMissingFieldsReason(worker);
    await action(workerId, "reupload", reason);
  };

  const bulkReuploadMissing = async () => {
    const ids = Object.keys(selectedWorkerIds);
    if (ids.length === 0) {
      setMsgType("error");
      setMsg("Select at least one worker for bulk re-upload");
      return;
    }

    const workerById = new Map(workers.map((worker) => [String(worker.userId), worker]));
    setMsg(`Processing re-upload requests for ${ids.length} workers...`);

    const results = await Promise.all(
      ids.map(async (workerId) => {
        const worker = workerById.get(String(workerId));
        const reason = buildMissingFieldsReason(worker);
        const res = await fetch(`/api/admin/workers/${workerId}/verify`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action: "reupload", reason }),
        });
        return res.json().catch(() => ({ ok: false }));
      })
    );

    const success = results.filter((row) => row?.ok).length;
    const failed = results.length - success;
    setMsgType(success > 0 ? "success" : "error");
    setMsg(`Bulk re-upload (missing fields) complete. Success: ${success}, Failed: ${failed}`);
    setSelectedWorkerIds({});
    load();
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const summary = workers.reduce(
    (acc, worker) => {
      acc.total += 1;
      acc[worker.verificationStatus] = (acc[worker.verificationStatus] || 0) + 1;
      if ((worker.autoFlags || []).length > 0) acc.flagged += 1;
      return acc;
    },
    { total: 0, flagged: 0, INCOMPLETE: 0, PENDING_REVIEW: 0, APPROVED: 0, REJECTED: 0 }
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'PENDING_REVIEW': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'REJECTED': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'INCOMPLETE': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Image Preview Modal */}
        {preview.open && (
          <div className="fixed inset-0 z-50 bg-black/90 p-4" onClick={() => setPreview({ open: false, url: "", title: "" })}>
            <div className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center" onClick={(e) => e.stopPropagation()}>
              <div className="mb-2 flex items-center justify-between text-white">
                <p className="text-sm sm:text-base">{preview.title}</p>
                <button
                  onClick={() => setPreview({ open: false, url: "", title: "" })}
                  className="rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30"
                >
                  Close
                </button>
              </div>
              <Image
                src={preview.url}
                alt={preview.title}
                width={1440}
                height={1080}
                unoptimized
                className="max-h-[80vh] w-full rounded object-contain"
              />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
                <Users className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Worker Management</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Review worker profiles, photos, and KYC documents before approval
                </p>
              </div>
            </div>
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
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg bg-slate-900/40 p-2 text-center">
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-lg font-semibold text-white">{summary.total}</p>
          </div>
          <div className="rounded-lg bg-amber-500/10 p-2 text-center">
            <p className="text-xs text-amber-400">Pending</p>
            <p className="text-lg font-semibold text-amber-400">{summary.PENDING_REVIEW}</p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-center">
            <p className="text-xs text-emerald-400">Approved</p>
            <p className="text-lg font-semibold text-emerald-400">{summary.APPROVED}</p>
          </div>
          <div className="rounded-lg bg-rose-500/10 p-2 text-center">
            <p className="text-xs text-rose-400">Rejected</p>
            <p className="text-lg font-semibold text-rose-400">{summary.REJECTED}</p>
          </div>
          <div className="rounded-lg bg-slate-500/10 p-2 text-center">
            <p className="text-xs text-slate-400">Incomplete</p>
            <p className="text-lg font-semibold text-slate-400">{summary.INCOMPLETE}</p>
          </div>
          <div className="rounded-lg bg-rose-500/10 p-2 text-center">
            <p className="text-xs text-rose-400">Flagged</p>
            <p className="text-lg font-semibold text-rose-400">{summary.flagged}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-base font-semibold text-white">Filters</h2>
          </div>
          
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <input
              className="rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
              placeholder="Search by name/email/phone/city..."
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
            />
            <select
              className="rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
              value={filters.verificationStatus}
              onChange={(e) => setFilters((prev) => ({ ...prev, verificationStatus: e.target.value }))}
            >
              {VERIFICATION_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
              value={filters.queueStatus}
              onChange={(e) => setFilters((prev) => ({ ...prev, queueStatus: e.target.value }))}
            >
              {QUEUE_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
              value={filters.feePaid}
              onChange={(e) => setFilters((prev) => ({ ...prev, feePaid: e.target.value }))}
            >
              <option value="">All fee statuses</option>
              <option value="1">✅ Fee paid</option>
              <option value="0">❌ Fee unpaid</option>
            </select>
            <select
              className="rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
              value={filters.flagged}
              onChange={(e) => setFilters((prev) => ({ ...prev, flagged: e.target.value }))}
            >
              <option value="">All quality flags</option>
              <option value="1">⚠️ Only auto-flagged</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => load(filters)}
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-3 py-1.5 text-xs text-white transition hover:opacity-90"
            >
              <RefreshCw className="h-3 w-3" />
              Apply Filters
            </button>
            <button
              onClick={() => {
                const reset = { q: "", verificationStatus: "", queueStatus: "", feePaid: "", flagged: "" };
                setFilters(reset);
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:border-fuchsia-400/50"
            >
              Clear
            </button>
            {loading && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Loading...
              </span>
            )}
            <span className="text-xs text-slate-500">Filters auto-apply after typing</span>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="mb-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4">
          <div className="mb-3 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-base font-semibold text-white">Bulk Actions</h2>
          </div>

          <input
            className="mb-3 w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
            placeholder="Bulk note/reason (used for bulk actions)"
            value={bulkNote}
            onChange={(e) => setBulkNote(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:border-fuchsia-400/50"
            >
              {Object.keys(selectedWorkerIds).length === workers.length && workers.length > 0 ? "Unselect All" : "Select All"}
            </button>
            <button
              onClick={() => bulkAction("approve")}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-500"
            >
              Bulk Approve
            </button>
            <button
              onClick={() => {
                if (bulkNote.trim()) {
                  bulkAction("reject");
                  return;
                }
                const reason = askReason("Bulk reject reason", "Documents invalid");
                if (reason) bulkAction("reject", reason);
              }}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-500"
            >
              Bulk Reject
            </button>
            <button
              onClick={() => {
                if (bulkNote.trim()) {
                  bulkAction("reupload");
                  return;
                }
                const reason = askReason("Bulk re-upload reason", "Please re-upload clear documents");
                if (reason) bulkAction("reupload", reason);
              }}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs text-white hover:bg-amber-500"
            >
              Bulk Re-upload
            </button>
            <button
              onClick={bulkReuploadMissing}
              className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs text-white hover:bg-amber-600"
            >
              Bulk Re-upload (Missing)
            </button>
            <span className="text-xs text-slate-400">Selected: {Object.keys(selectedWorkerIds).length}</span>
          </div>
        </div>

        {/* Workers List */}
        <div className="space-y-4">
          {!loading && workers.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 text-center">
              <Users className="h-12 w-12 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">No workers found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters</p>
            </div>
          )}

          {workers.map((worker) => {
            const missingFields = getWorkerOnboardingMissingFields(worker);
            const onboardingComplete = missingFields.length === 0;

            return (
              <div
                key={worker._id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30"
              >
                {/* Status Indicator */}
                <div className={`absolute left-0 top-0 h-full w-1 ${
                  worker.verificationStatus === 'APPROVED' ? 'bg-gradient-to-b from-emerald-500 to-emerald-600' :
                  worker.verificationStatus === 'PENDING_REVIEW' ? 'bg-gradient-to-b from-amber-500 to-amber-600' :
                  worker.verificationStatus === 'REJECTED' ? 'bg-gradient-to-b from-rose-500 to-rose-600' :
                  'bg-gradient-to-b from-slate-500 to-slate-600'
                }`} />

                {/* Incomplete Warning */}
                {!onboardingComplete && (
                  <div className="mb-3 ml-2 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <p className="text-xs text-amber-400">
                      Onboarding incomplete. Missing: {missingFields.join(", ")}.
                    </p>
                  </div>
                )}

                <div className="ml-2">
                  {/* Header */}
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedWorkerIds[worker.userId])}
                        onChange={() => toggleSelect(worker.userId)}
                        className="mt-2 h-4 w-4 rounded border-slate-600 bg-slate-800 text-fuchsia-500"
                      />
                      
                      <button
                        className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10 bg-slate-900 sm:h-20 sm:w-20"
                        onClick={() => {
                          if (worker.profilePhoto) {
                            setPreview({ open: true, url: worker.profilePhoto, title: "Profile photo" });
                          }
                        }}
                      >
                        {worker.profilePhoto ? (
                          <Image
                            src={worker.profilePhoto}
                            alt="Profile"
                            fill
                            sizes="80px"
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Camera className="h-6 w-6 text-slate-600" />
                          </div>
                        )}
                      </button>

                      <div>
                        <h3 className="text-base font-semibold text-white sm:text-lg">
                          {worker.user?.name || "Worker"}
                        </h3>
                        <div className="mt-1 space-y-1 text-sm">
                          <p className="flex items-center gap-1 text-slate-400">
                            <Mail className="h-3 w-3" />
                            {worker.user?.email || "-"}
                          </p>
                          <p className="flex items-center gap-1 text-slate-400">
                            <Phone className="h-3 w-3" />
                            {worker.user?.phone || "-"}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">ID: {worker.userId?.slice(-8)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:flex-col">
                      <span className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-xs ${getStatusColor(worker.verificationStatus)}`}>
                        {worker.verificationStatus}
                      </span>
                      <span className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-300">
                        Queue: {worker.kyc?.queueStatus || "not_submitted"}
                      </span>
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpand(worker._id)}
                    className="mb-2 flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                  >
                    <Eye className="h-3 w-3" />
                    {expandedWorkers[worker._id] ? "Hide Details" : "View Details"}
                  </button>

                  {/* Expanded Details */}
                  {expandedWorkers[worker._id] && (
                    <>
                      {/* Profile & Verification Grid */}
                      <div className="mb-3 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                          <p className="mb-2 text-xs font-medium text-fuchsia-400">Profile Details</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-slate-500">Gender</p>
                              <p className="text-white">{worker.gender || "-"}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Base Price</p>
                              <p className="text-white">₹{worker.pricing?.basePrice || 0}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Quality Score</p>
                              <p className="text-white">{worker.quality?.qualityScore || 0}/100</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Online</p>
                              <p className="text-white">{worker.isOnline ? "Yes" : "No"}</p>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-slate-400">
                            <span className="text-slate-500">Address:</span> {worker.address || "-"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            <span className="text-slate-500">Bio:</span> {worker.bio || "-"}
                          </p>
                          {(worker.autoFlags || []).length > 0 && (
                            <p className="mt-2 text-xs text-rose-400">
                              Auto flags: {worker.autoFlags.join(", ")}
                            </p>
                          )}
                        </div>

                        <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                          <p className="mb-2 text-xs font-medium text-fuchsia-400">Verification Details</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-slate-500">Fee Paid</p>
                              <p className="text-white">{worker.verificationFeePaid ? "✅ Yes" : "❌ No"}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Fee Amount</p>
                              <p className="text-white">₹{worker.verificationFeeAmount || 0}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Submitted</p>
                              <p className="text-white">{formatDate(worker.kyc?.submittedAt)}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Reviewed</p>
                              <p className="text-white">{formatDate(worker.kyc?.reviewedAt)}</p>
                            </div>
                          </div>
                          {worker.verificationNote && (
                            <p className="mt-2 text-xs text-slate-400">
                              <span className="text-slate-500">Note:</span> {worker.verificationNote}
                            </p>
                          )}
                          {worker.kyc?.rejectionReason && (
                            <p className="mt-2 text-xs text-rose-400">
                              Rejection: {worker.kyc.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Categories & Skills */}
                      <div className="mb-3 rounded-lg border border-white/10 bg-slate-900/40 p-3">
                        <p className="mb-2 text-xs font-medium text-fuchsia-400">Categories & Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {(worker.categories || []).map((cat) => (
                            <span key={cat} className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-400">
                              {cat}
                            </span>
                          ))}
                          {(worker.skills || []).map((skill) => (
                            <span key={skill} className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-400">
                              {skill}
                            </span>
                          ))}
                          {(worker.categories || []).length === 0 && (worker.skills || []).length === 0 && (
                            <p className="text-xs text-slate-500">No categories or skills added</p>
                          )}
                        </div>
                      </div>

                      {/* Service Areas */}
                      <div className="mb-3 rounded-lg border border-white/10 bg-slate-900/40 p-3">
                        <p className="mb-2 text-xs font-medium text-fuchsia-400">Service Areas</p>
                        <div className="flex flex-wrap gap-2">
                          {(worker.serviceAreas || []).map((area) => (
                            <span key={`${area.city}-${area.pincode}`} className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400">
                              {area.city}-{area.pincode}
                            </span>
                          ))}
                          {(worker.serviceAreas || []).length === 0 && (
                            <p className="text-xs text-slate-500">No service areas added</p>
                          )}
                        </div>
                      </div>

                      {/* KYC Documents */}
                      <div className="mb-3 rounded-lg border border-white/10 bg-slate-900/40 p-3">
                        <p className="mb-2 text-xs font-medium text-fuchsia-400">KYC Documents</p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                          {/* ID Proof */}
                          <div className="rounded-lg bg-slate-800/50 p-2">
                            <p className="mb-1 text-xs text-slate-400">ID Proof</p>
                            {worker.docs?.idProof ? (
                              isPdfUrl(worker.docs.idProof) ? (
                                <a href={worker.docs.idProof} target="_blank" rel="noreferrer" className="text-xs text-fuchsia-400 underline">
                                  View PDF
                                </a>
                              ) : (
                                <button
                                  onClick={() => setPreview({ open: true, url: worker.docs.idProof, title: "ID Proof" })}
                                  className="relative h-16 w-full overflow-hidden rounded"
                                >
                                  <Image src={worker.docs.idProof} alt="ID proof" fill sizes="160px" unoptimized className="object-cover" />
                                </button>
                              )
                            ) : (
                              <p className="text-xs text-slate-500">Not uploaded</p>
                            )}
                          </div>

                          {/* Selfie */}
                          <div className="rounded-lg bg-slate-800/50 p-2">
                            <p className="mb-1 text-xs text-slate-400">Selfie</p>
                            {worker.docs?.selfie ? (
                              <button
                                onClick={() => setPreview({ open: true, url: worker.docs.selfie, title: "Selfie" })}
                                className="relative h-16 w-full overflow-hidden rounded"
                              >
                                <Image src={worker.docs.selfie} alt="Selfie" fill sizes="160px" unoptimized className="object-cover" />
                              </button>
                            ) : (
                              <p className="text-xs text-slate-500">Not uploaded</p>
                            )}
                          </div>

                          {/* Certificates */}
                          {(worker.docs?.certificates || []).map((url, index) => (
                            <div key={url} className="rounded-lg bg-slate-800/50 p-2">
                              <p className="mb-1 text-xs text-slate-400">Cert {index + 1}</p>
                              {isPdfUrl(url) ? (
                                <a href={url} target="_blank" rel="noreferrer" className="text-xs text-fuchsia-400 underline">
                                  View PDF
                                </a>
                              ) : (
                                <button
                                  onClick={() => setPreview({ open: true, url, title: `Certificate ${index + 1}` })}
                                  className="relative h-16 w-full overflow-hidden rounded"
                                >
                                  <Image src={url} alt={`Certificate ${index + 1}`} fill sizes="160px" unoptimized className="object-cover" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Gallery Photos */}
                      {worker.galleryPhotos?.length > 0 && (
                        <div className="mb-3 rounded-lg border border-white/10 bg-slate-900/40 p-3">
                          <p className="mb-2 text-xs font-medium text-fuchsia-400">Gallery Photos</p>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                            {worker.galleryPhotos.map((url, index) => (
                              <button
                                key={url}
                                onClick={() => setPreview({ open: true, url, title: `Gallery ${index + 1}` })}
                                className="relative h-16 overflow-hidden rounded-lg border border-white/10"
                              >
                                <Image src={url} alt={`Gallery ${index + 1}`} fill sizes="96px" unoptimized className="object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extra Services */}
                      {worker.pricing?.extraServices?.length > 0 && (
                        <div className="mb-3 rounded-lg border border-white/10 bg-slate-900/40 p-3">
                          <p className="mb-2 text-xs font-medium text-fuchsia-400">Extra Services</p>
                          <div className="flex flex-wrap gap-2">
                            {worker.pricing.extraServices.map((service) => (
                              <span key={service.title} className="rounded-full bg-amber-500/20 px-2 py-1 text-xs text-amber-400">
                                {service.title} (₹{service.price})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => action(worker.userId, "approve")}
                      disabled={!onboardingComplete}
                      title={!onboardingComplete ? `Missing: ${missingFields.join(", ")}` : ""}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Approve
                    </button>
                    
                    <button
                      onClick={() => {
                        const reason = askReason("Reject reason", "Documents invalid");
                        if (reason) action(worker.userId, "reject", reason);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-500"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </button>
                    
                    <button
                      onClick={() => {
                        const reason = askReason("Re-upload reason", "Please re-upload clear documents");
                        if (reason) action(worker.userId, "reupload", reason);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-500"
                    >
                      <Upload className="h-3 w-3" />
                      Re-upload
                    </button>
                    
                    {!onboardingComplete && (
                      <button
                        onClick={() => requestReuploadForMissing(worker)}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-600"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Re-upload (Missing)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
