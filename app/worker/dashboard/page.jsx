"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const DAYS = [
  { day: 0, label: "Sun" },
  { day: 1, label: "Mon" },
  { day: 2, label: "Tue" },
  { day: 3, label: "Wed" },
  { day: 4, label: "Thu" },
  { day: 5, label: "Fri" },
  { day: 6, label: "Sat" },
];

function getDefaultWeekly() {
  return DAYS.map((row) => ({
    day: row.day,
    start: "09:00",
    end: "18:00",
    isOff: row.day === 0,
  }));
}

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

export default function WorkerDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [msg, setMsg] = useState("");
  const [blockedInput, setBlockedInput] = useState("");
  const [schedule, setSchedule] = useState({
    weekly: getDefaultWeekly(),
    blockedSlots: [],
    minNoticeMinutes: 30,
  });

  const load = async () => {
    setLoading(true);
    const [meRes, jobsRes, availRes] = await Promise.all([
      fetch("/api/auth/me", { credentials: "include" }),
      fetch("/api/worker/jobs", { credentials: "include" }),
      fetch("/api/worker/availability", { credentials: "include" }),
    ]);
    const [meData, jobsData, availData] = await Promise.all([meRes.json(), jobsRes.json(), availRes.json()]);
    setProfile(meData.user?.workerProfile || null);
    setJobs(jobsData.jobs || []);
    setOnline(Boolean(availData?.isOnline ?? meData.user?.workerProfile?.isOnline));
    setSchedule({
      weekly: availData?.availabilityCalendar?.weekly?.length ? availData.availabilityCalendar.weekly : getDefaultWeekly(),
      blockedSlots: availData?.availabilityCalendar?.blockedSlots || [],
      minNoticeMinutes: Number(availData?.availabilityCalendar?.minNoticeMinutes || 30),
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const activeJobs = useMemo(
    () => jobs.filter((job) => ["assigned", "onway", "working"].includes(job.status)).length,
    [jobs]
  );
  const completedJobs = useMemo(
    () => jobs.filter((job) => job.status === "completed").length,
    [jobs]
  );

  const toggleOnline = async () => {
    const res = await fetch("/api/worker/availability", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isOnline: !online }),
    });
    const data = await res.json();
    setMsg(data.ok ? `Availability changed to ${!online ? "Online" : "Offline"}` : data.error || "Failed");
    if (data.ok) {
      setOnline(!online);
      load();
    }
  };

  const updateDay = (day, key, value) => {
    setSchedule((prev) => ({
      ...prev,
      weekly: prev.weekly.map((row) => (row.day === day ? { ...row, [key]: value } : row)),
    }));
  };

  const addBlockedSlot = () => {
    if (!blockedInput) return;
    const iso = new Date(blockedInput).toISOString();
    if (Number.isNaN(new Date(iso).getTime())) return;
    setSchedule((prev) => ({
      ...prev,
      blockedSlots: Array.from(new Set([...(prev.blockedSlots || []), iso])).sort(),
    }));
    setBlockedInput("");
  };

  const removeBlockedSlot = (slotIso) => {
    setSchedule((prev) => ({
      ...prev,
      blockedSlots: (prev.blockedSlots || []).filter((row) => row !== slotIso),
    }));
  };

  const saveSchedule = async () => {
    setSavingSchedule(true);
    const res = await fetch("/api/worker/availability", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        weekly: schedule.weekly,
        blockedSlots: schedule.blockedSlots,
        minNoticeMinutes: Number(schedule.minNoticeMinutes || 0),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingSchedule(false);
    setMsg(data.ok ? "Availability calendar saved" : data.error || "Failed to save schedule");
    if (data.ok) load();
  };

  return (
    <section className="space-y-4">
      <div className="panel flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Worker Dashboard</h1>
          <p className="text-sm text-slate-400">
            Verification: {profile?.verificationStatus || "INCOMPLETE"} | Fee Paid: {String(profile?.verificationFeePaid || false)}
          </p>
        </div>
        <button
          onClick={toggleOnline}
          className={`rounded px-3 py-2 text-white ${online ? "bg-emerald-700 hover:bg-emerald-600" : "bg-slate-700 hover:bg-slate-600"}`}
        >
          {online ? "Go Offline" : "Go Online"}
        </button>
      </div>

      <div className="grid-auto">
        <div className="panel">
          <p className="text-sm text-slate-400">Active Jobs</p>
          <p className="text-2xl font-semibold">{loading ? "..." : activeJobs}</p>
        </div>
        <div className="panel">
          <p className="text-sm text-slate-400">Completed Jobs</p>
          <p className="text-2xl font-semibold">{loading ? "..." : completedJobs}</p>
        </div>
        <div className="panel">
          <p className="text-sm text-slate-400">Payout Wallet</p>
          <p className="text-2xl font-semibold">INR {profile?.payoutWalletBalance || 0}</p>
        </div>
      </div>

      <div className="panel space-y-3">
        <h2 className="text-lg font-semibold">Availability Calendar</h2>
        <div className="grid gap-2 md:grid-cols-7">
          {DAYS.map((dayRow) => {
            const row = schedule.weekly.find((item) => item.day === dayRow.day) || {
              day: dayRow.day,
              start: "09:00",
              end: "18:00",
              isOff: false,
            };
            return (
              <div key={dayRow.day} className="rounded border border-slate-700 bg-slate-900/30 p-2">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-400">{dayRow.label}</p>
                <label className="mb-2 flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(row.isOff)}
                    onChange={(e) => updateDay(dayRow.day, "isOff", e.target.checked)}
                  />
                  Off day
                </label>
                <input
                  type="time"
                  value={row.start || "09:00"}
                  disabled={row.isOff}
                  onChange={(e) => updateDay(dayRow.day, "start", e.target.value)}
                  className="mb-2 w-full rounded border border-slate-700 bg-slate-900 p-1 text-xs disabled:opacity-60"
                />
                <input
                  type="time"
                  value={row.end || "18:00"}
                  disabled={row.isOff}
                  onChange={(e) => updateDay(dayRow.day, "end", e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-900 p-1 text-xs disabled:opacity-60"
                />
              </div>
            );
          })}
        </div>

        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="number"
            min={0}
            max={1440}
            value={schedule.minNoticeMinutes}
            onChange={(e) =>
              setSchedule((prev) => ({ ...prev, minNoticeMinutes: Number(e.target.value || 0) }))
            }
            className="rounded border border-slate-700 bg-slate-900 p-2 text-sm"
            placeholder="Min notice minutes"
          />
          <input
            type="datetime-local"
            value={blockedInput}
            onChange={(e) => setBlockedInput(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 p-2 text-sm"
          />
          <button onClick={addBlockedSlot} className="rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600">
            Add Block Slot
          </button>
        </div>

        {(schedule.blockedSlots || []).length > 0 && (
          <div className="space-y-1">
            <p className="text-xs uppercase text-slate-400">Blocked Slots</p>
            <div className="flex flex-wrap gap-2">
              {schedule.blockedSlots.slice(0, 20).map((slot) => (
                <button
                  key={slot}
                  onClick={() => removeBlockedSlot(slot)}
                  className="rounded bg-rose-900/30 px-2 py-1 text-xs text-rose-300 hover:bg-rose-800/40"
                >
                  {toLocalInputValue(slot).replace("T", " ")} x
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={saveSchedule}
          disabled={savingSchedule}
          className="rounded bg-sky-700 px-3 py-2 text-sm text-white hover:bg-sky-600 disabled:opacity-60"
        >
          {savingSchedule ? "Saving..." : "Save Availability Calendar"}
        </button>
      </div>

      <div className="panel flex flex-wrap gap-2">
        <Link href="/worker/jobs" className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700">
          Manage Jobs
        </Link>
        <Link href="/worker/boost" className="rounded bg-sky-700 px-3 py-2 text-white hover:bg-sky-600">
          Buy Boost
        </Link>
        <Link href="/worker/payouts" className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700">
          Payouts
        </Link>
        <Link href="/worker/reports" className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700">
          Reports
        </Link>
      </div>

      {msg && <p className="text-sm text-slate-300">{msg}</p>}
    </section>
  );
}
