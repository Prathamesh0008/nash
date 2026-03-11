"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  Eye,
  LogOut,
  MessageCircle,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Star,
  TrendingUp,
  User,
  Wallet,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

function toLocalInputValue(isoValue) {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value) => String(value).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function StatCard({ label, value, hint, icon: Icon, trend, color = "fuchsia" }) {
  const colorClasses = {
    fuchsia: "from-fuchsia-500/20 to-fuchsia-600/20 text-fuchsia-400",
    emerald: "from-emerald-500/20 to-emerald-600/20 text-emerald-400",
    sky: "from-sky-500/20 to-sky-600/20 text-sky-400",
    amber: "from-amber-500/20 to-amber-600/20 text-amber-400",
    rose: "from-rose-500/20 to-rose-600/20 text-rose-400",
  };

  return (
    <article className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm transition-all hover:border-slate-700 hover:bg-slate-900/80">
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100 ${colorClasses[color]}`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <div className={`rounded-lg bg-gradient-to-br p-2 ${colorClasses[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        {hint && (
          <div className="mt-2 flex items-center gap-1">
            {trend && (
              <span className={`text-xs ${trend > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {trend > 0 ? "+" : ""}{trend}%
              </span>
            )}
            <p className="text-xs text-slate-500">{hint}</p>
          </div>
        )}
      </div>
    </article>
  );
}

function RequestCard({ request }) {
  const statusColors = {
    pending: "bg-amber-950/50 text-amber-400 border-amber-800",
    accepted: "bg-emerald-950/50 text-emerald-400 border-emerald-800",
    rejected: "bg-rose-950/50 text-rose-400 border-rose-800",
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 transition-all hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600" />
            <div>
              <p className="font-medium text-white">{request.clientName || "Client"}</p>
              <p className="text-xs text-slate-500">ID: {request._id.slice(-6)}</p>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-sm text-slate-300">{request.serviceType}</p>
            <p className="text-xs text-slate-500">
              {new Date(request.date).toLocaleDateString()} at {request.time}
            </p>
            <p className="text-xs text-slate-500">Duration: {request.duration} hrs</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[request.status] || statusColors.pending}`}>
            {request.status}
          </span>
          <p className="mt-2 text-lg font-semibold text-white">₹{request.price}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="flex-1 rounded-lg bg-sky-600 py-1.5 text-xs text-white hover:bg-sky-500">Accept</button>
        <button className="flex-1 rounded-lg bg-slate-800 py-1.5 text-xs text-slate-300 hover:bg-slate-700">Decline</button>
        <button className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700">
          <MessageCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function JobCard({ job }) {
  const statusColors = {
    assigned: "bg-sky-950/50 text-sky-400 border-sky-800",
    onway: "bg-amber-950/50 text-amber-400 border-amber-800",
    working: "bg-emerald-950/50 text-emerald-400 border-emerald-800",
    completed: "bg-slate-800 text-slate-400 border-slate-700",
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 transition-all hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800">
              <Briefcase className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-white">{job.title || "Service Job"}</p>
              <p className="text-xs text-slate-500">Job #{job._id.slice(-6)}</p>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-slate-400">{job.location}</p>
            <p className="text-xs text-slate-500">
              {new Date(job.scheduledAt).toLocaleDateString()} at {new Date(job.scheduledAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[job.status]}`}>
            {job.status}
          </span>
          <p className="mt-2 text-lg font-semibold text-white">₹{job.price}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="flex-1 rounded-lg bg-slate-800 py-1.5 text-xs text-slate-300 hover:bg-slate-700">View Details</button>
        <button className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700">
          <MessageCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function WorkerDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [online, setOnline] = useState(false);

  const [schedule, setSchedule] = useState({
    blockedSlots: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");

  const [blockedInput, setBlockedInput] = useState("");
  const [showAllRequests, setShowAllRequests] = useState(false);

  const setNotice = (text, type = "info") => {
    setMsg(text);
    setMsgType(type);
  };

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => {
      setMsg("");
      setMsgType("info");
    }, 3000);
    return () => clearTimeout(t);
  }, [msg]);

  const load = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");

      const [meRes, jobsRes, availRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include", cache: "no-store" }),
        fetch("/api/worker/jobs", { credentials: "include", cache: "no-store" }),
        fetch("/api/worker/availability", { credentials: "include", cache: "no-store" }),
      ]);

      const [meData, jobsData, availData] = await Promise.all([
        meRes.json().catch(() => ({})),
        jobsRes.json().catch(() => ({})),
        availRes.json().catch(() => ({})),
      ]);

      if (!meRes.ok || !meData?.ok) {
        setError(meData?.error || "Failed to load escort profile.");
        return;
      }

      if (!jobsRes.ok || !jobsData?.ok) {
        setError(jobsData?.error || "Failed to load jobs.");
      }

      setProfile(meData.user?.workerProfile || null);
      setJobs(Array.isArray(jobsData.jobs) ? jobsData.jobs : []);
      setRequests(Array.isArray(jobsData.requests) ? jobsData.requests : []);

      setOnline(Boolean(availData?.isOnline ?? meData.user?.workerProfile?.isOnline));
      setSchedule({
        blockedSlots: availData?.availabilityCalendar?.blockedSlots || [],
      });
    } catch {
      setError("Network error while loading dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeJobs = useMemo(
    () => jobs.filter((job) => ["assigned", "onway", "working"].includes(job.status)).length,
    [jobs]
  );
  const completedJobs = useMemo(() => jobs.filter((job) => job.status === "completed").length, [jobs]);
  const pendingRequests = useMemo(() => requests.filter((req) => req.status === "pending").length, [requests]);
  const totalEarnings = useMemo(
    () => jobs.filter((job) => job.status === "completed").reduce((sum, job) => sum + (job.price || 0), 0),
    [jobs]
  );

  const toggleOnline = async () => {
    if (togglingOnline) return;
    try {
      setTogglingOnline(true);
      const res = await fetch("/api/worker/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isOnline: !online }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setNotice(data.error || "Failed to update availability.", "error");
        return;
      }
      setOnline(!online);
      setNotice(`You are now ${!online ? "online" : "offline"}.`, "success");
      await load({ silent: true });
    } finally {
      setTogglingOnline(false);
    }
  };

  const addBlockedSlot = () => {
    if (!blockedInput) {
      setNotice("Select a date-time to block.", "error");
      return;
    }

    const dt = new Date(blockedInput);
    if (Number.isNaN(dt.getTime())) {
      setNotice("Invalid date-time selected.", "error");
      return;
    }

    if (dt.getTime() < Date.now()) {
      setNotice("Past slot cannot be blocked.", "error");
      return;
    }

    const iso = dt.toISOString();
    setSchedule((prev) => ({
      ...prev,
      blockedSlots: Array.from(new Set([...(prev.blockedSlots || []), iso])).sort(),
    }));
    setBlockedInput("");
    setNotice("Blocked slot added.", "success");
  };

  const removeBlockedSlot = (slotIso) => {
    setSchedule((prev) => ({
      ...prev,
      blockedSlots: (prev.blockedSlots || []).filter((row) => row !== slotIso),
    }));
  };

  const saveSchedule = async () => {
    if (savingSchedule) return;
    try {
      setSavingSchedule(true);
      const res = await fetch("/api/worker/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          blockedSlots: schedule.blockedSlots,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setNotice(data.error || "Failed to save availability.", "error");
        return;
      }
      setNotice("Availability settings saved.", "success");
      await load({ silent: true });
    } finally {
      setSavingSchedule(false);
    }
  };

  const noticeClass =
    msgType === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : msgType === "error"
      ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
      : "border-sky-500/30 bg-sky-500/10 text-sky-300";

  const verificationStatus = profile?.verificationStatus || "INCOMPLETE";
  const verificationColors = {
    VERIFIED: "text-emerald-400 bg-emerald-950/50",
    PENDING: "text-amber-400 bg-amber-950/50",
    INCOMPLETE: "text-rose-400 bg-rose-950/50",
    REJECTED: "text-rose-400 bg-rose-950/50",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 p-0.5">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900">
                    <User className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 ${
                  online ? "bg-emerald-500" : "bg-slate-600"
                }`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${verificationColors[verificationStatus] || verificationColors.INCOMPLETE}`}>
                    {verificationStatus}
                  </span>
                  {profile?.verificationFeePaid && (
                    <span className="rounded-full bg-emerald-950/50 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      Fee Paid
                    </span>
                  )}
                  <span className="text-sm text-slate-400">
                    Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => load({ silent: true })}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={toggleOnline}
                disabled={togglingOnline}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60 ${
                  online 
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400" 
                    : "bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500"
                }`}
              >
                {online ? (
                  <>
                    <Wifi className="h-4 w-4" />
                    Go Offline
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4" />
                    Go Online
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {msg && (
          <div className={`mb-6 rounded-xl border p-4 text-sm ${noticeClass}`}>
            {msg}
          </div>
        )}
        
        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={Briefcase} 
            label="Active Jobs" 
            value={loading ? "..." : activeJobs} 
            hint="Currently working"
            color="sky"
          />
          <StatCard 
            icon={CheckCircle2} 
            label="Completed" 
            value={loading ? "..." : completedJobs} 
            hint="Total jobs done"
            color="emerald"
          />
          <StatCard 
            icon={CalendarClock} 
            label="New Requests" 
            value={loading ? "..." : pendingRequests} 
            hint="Awaiting response"
            color="amber"
          />
          <StatCard 
            icon={DollarSign} 
            label="Total Earnings" 
            value={loading ? "..." : `₹${totalEarnings}`} 
            hint="Lifetime earnings"
            color="fuchsia"
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Availability & Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Availability Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">Availability</h2>
              
              <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3">
                <p className="text-xs text-emerald-300">
                  You are available 24/7 when online. Block specific time slots below if needed.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={blockedInput}
                    onChange={(e) => setBlockedInput(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 p-2 text-sm text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none"
                  />
                  <button
                    onClick={addBlockedSlot}
                    className="rounded-lg bg-slate-800 px-3 py-2 text-slate-300 transition hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {schedule.blockedSlots.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-400">Blocked Slots</p>
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {schedule.blockedSlots.map((slot) => (
                        <div
                          key={slot}
                          className="flex items-center justify-between rounded-lg border border-rose-800/50 bg-rose-950/30 p-2"
                        >
                          <span className="text-xs text-rose-300">
                            {toLocalInputValue(slot).replace("T", " ")}
                          </span>
                          <button
                            onClick={() => removeBlockedSlot(slot)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={saveSchedule}
                  disabled={savingSchedule}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:from-sky-500 hover:to-sky-400 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {savingSchedule ? "Saving..." : "Save Availability"}
                </button>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/worker/jobs"
                  className="flex flex-col items-center gap-2 rounded-lg bg-slate-800/50 p-3 text-center transition hover:bg-slate-800"
                >
                  <Briefcase className="h-5 w-5 text-sky-400" />
                  <span className="text-xs text-slate-300">Jobs</span>
                </Link>
                <Link
                  href="/worker/boost"
                  className="flex flex-col items-center gap-2 rounded-lg bg-gradient-to-br from-amber-900/30 to-amber-800/30 p-3 text-center transition hover:from-amber-900/50 hover:to-amber-800/50"
                >
                  <Zap className="h-5 w-5 text-amber-400" />
                  <span className="text-xs text-amber-300">Boost</span>
                </Link>
                <Link
                  href="/worker/payouts"
                  className="flex flex-col items-center gap-2 rounded-lg bg-slate-800/50 p-3 text-center transition hover:bg-slate-800"
                >
                  <Wallet className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs text-slate-300">Payouts</span>
                </Link>
                <Link
                  href="/worker/profile/edit"
                  className="flex flex-col items-center gap-2 rounded-lg bg-slate-800/50 p-3 text-center transition hover:bg-slate-800"
                >
                  <Edit className="h-5 w-5 text-fuchsia-400" />
                  <span className="text-xs text-slate-300">Profile</span>
                </Link>
              </div>
            </div>

            {/* Wallet Card */}
            <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Wallet Balance</p>
                  <p className="text-2xl font-bold text-white">₹{profile?.payoutWalletBalance || 0}</p>
                </div>
                <div className="rounded-lg bg-emerald-950/50 p-3">
                  <Wallet className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              <Link
                href="/worker/payouts"
                className="mt-4 block w-full rounded-lg bg-emerald-600 py-2 text-center text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Withdraw Funds
              </Link>
            </div>
          </div>

          {/* Right Column - Jobs & Requests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Jobs */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Active Jobs</h2>
                <Link href="/worker/jobs" className="text-xs text-sky-400 hover:text-sky-300">
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-sky-500" />
                </div>
              ) : jobs.filter(j => ["assigned", "onway", "working"].includes(j.status)).length > 0 ? (
                <div className="space-y-3">
                  {jobs.filter(j => ["assigned", "onway", "working"].includes(j.status)).slice(0, 3).map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 rounded-full bg-slate-800 p-3">
                    <Briefcase className="h-6 w-6 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No active jobs</p>
                  <p className="text-xs text-slate-500">New jobs will appear here when assigned</p>
                </div>
              )}
            </div>

            {/* Service Requests */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Service Requests</h2>
                <button
                  onClick={() => setShowAllRequests(!showAllRequests)}
                  className="text-xs text-sky-400 hover:text-sky-300"
                >
                  {showAllRequests ? "Show Less" : "View All"}
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-sky-500" />
                </div>
              ) : requests.length > 0 ? (
                <div className="space-y-3">
                  {(showAllRequests ? requests : requests.slice(0, 3)).map((request) => (
                    <RequestCard key={request._id} request={request} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 rounded-full bg-slate-800 p-3">
                    <CalendarClock className="h-6 w-6 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No pending requests</p>
                  <p className="text-xs text-slate-500">New requests will appear here when clients book</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}