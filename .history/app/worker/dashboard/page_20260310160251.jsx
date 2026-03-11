"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  Save,
  Wallet,
  Wifi,
  WifiOff,
  X,
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

function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <article className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{label}</p>
        <Icon className="h-4 w-4 text-fuchsia-300" />
      </div>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </article>
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

  return (
    <section className="space-y-4">
      <div className="panel flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Escort Dashboard</h1>
          <p className="text-sm text-slate-400">
            Verification: {profile?.verificationStatus || "INCOMPLETE"} | Fee Paid: {String(profile?.verificationFeePaid || false)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => load({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={toggleOnline}
            disabled={togglingOnline}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60 ${
              online ? "bg-emerald-700 hover:bg-emerald-600" : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {online ? "Go Offline" : "Go Online"}
          </button>
        </div>
      </div>

      {msg ? <div className={`rounded-xl border p-3 text-sm ${noticeClass}`}>{msg}</div> : null}
      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Briefcase} label="Active Jobs" value={loading ? "..." : activeJobs} />
        <StatCard icon={CheckCircle2} label="Completed Jobs" value={loading ? "..." : completedJobs} />
        <StatCard icon={CalendarClock} label="New Requests" value={loading ? "..." : requests.length} />
        <StatCard icon={Wallet} label="Payout Wallet" value={`INR ${profile?.payoutWalletBalance || 0}`} />
      </div>

      <div className="panel space-y-3">
        <h2 className="text-lg font-semibold">Availability</h2>
        <p className="rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          You are available 24/7 whenever you are online. No off-days or daily time limits are applied.
        </p>

        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            type="datetime-local"
            value={blockedInput}
            onChange={(e) => setBlockedInput(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 p-2 text-sm"
          />

          <button
            onClick={addBlockedSlot}
            className="inline-flex items-center justify-center gap-2 rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
          >
            <Plus className="h-4 w-4" />
            Add Block Slot
          </button>
        </div>

        {(schedule.blockedSlots || []).length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs uppercase text-slate-400">Blocked Slots</p>
            <div className="flex flex-wrap gap-2">
              {schedule.blockedSlots.slice(0, 30).map((slot) => (
                <button
                  key={slot}
                  onClick={() => removeBlockedSlot(slot)}
                  className="inline-flex items-center gap-1 rounded bg-rose-900/30 px-2 py-1 text-xs text-rose-300 hover:bg-rose-800/40"
                >
                  <Clock3 className="h-3.5 w-3.5" />
                  {toLocalInputValue(slot).replace("T", " ")}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <button
          onClick={saveSchedule}
          disabled={savingSchedule}
          className="inline-flex items-center justify-center gap-2 rounded bg-sky-700 px-3 py-2 text-sm text-white hover:bg-sky-600 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {savingSchedule ? "Saving..." : "Save Availability"}
        </button>
      </div>

      <div className="panel">
        <h2 className="text-base font-semibold">Quick Actions</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/worker/jobs" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">
            Manage Jobs
          </Link>
          <Link href="/worker/boost" className="rounded bg-sky-700 px-3 py-2 text-sm text-white hover:bg-sky-600">
            Buy Boost
          </Link>
          <Link href="/worker/payouts" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">
            Payouts
          </Link>
          <Link href="/worker/profile/edit" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">
            Edit Profile
          </Link>
        </div>
      </div>
    </section>
  );
}
