"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const statusFlow = ["assigned", "onway", "working", "completed"];

export default function WorkerJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/worker/jobs", { credentials: "include" });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error || "Failed to load jobs");
      setLoading(false);
      return;
    }
    setJobs(data.jobs || []);
    setRequests(data.requests || []);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const updateStatus = async (job, nextStatus) => {
    const res = await fetch(`/api/bookings/${job._id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: nextStatus, note: `Worker moved status to ${nextStatus}` }),
    });

    const data = await res.json();
    setMsg(data.ok ? `Updated order ${job._id.slice(-6)} to ${nextStatus}` : data.error || "Failed");
    if (data.ok) load();
  };

  const acceptJob = async (job) => {
    const res = await fetch(`/api/worker/jobs/${job._id}/accept`, {
      method: "PATCH",
      credentials: "include",
    });
    const data = await res.json();
    setMsg(data.ok ? `Accepted order ${job._id.slice(-6)}` : data.error || "Failed to accept");
    if (data.ok) load();
  };

  return (
    <section className="space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Worker Jobs</h1>
        <p className="text-sm text-slate-400">Accept new requests, then manage assigned jobs through onway to working to completed.</p>
      </div>

      {msg && <p className="text-sm text-slate-300">{msg}</p>}
      {error && <p className="rounded bg-rose-950 p-3 text-rose-300">{error}</p>}
      {loading && <p className="text-slate-400">Loading jobs...</p>}

      {!loading && requests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">New Job Requests</h2>
          {requests.map((job) => (
            <article key={job._id} className="panel">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{job.service?.title || "Service"}</h3>
                  <p className="text-sm text-slate-400">Customer: {job.customer?.name || "N/A"}</p>
                  <p className="text-sm text-slate-400">Area: {job.address?.city}, {job.address?.pincode}</p>
                  <p className="text-sm text-slate-400">Slot: {new Date(job.slotTime).toLocaleString()}</p>
                </div>
                <p className="rounded bg-amber-700 px-2 py-1 text-xs uppercase">Request</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => acceptJob(job)}
                  className="rounded bg-emerald-700 px-3 py-2 text-sm text-white hover:bg-emerald-600"
                >
                  Accept Job
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {!loading && jobs.length === 0 && requests.length === 0 && (
          <p className="text-slate-400">No bookings yet for your categories and service areas.</p>
        )}
        {jobs.map((job) => {
          const idx = statusFlow.indexOf(job.status);
          const next = idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
          return (
            <article key={job._id} className="panel">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{job.service?.title || "Service"}</h2>
                  <p className="text-sm text-slate-400">Customer: {job.customer?.name || "N/A"}</p>
                  <p className="text-sm text-slate-400">Slot: {new Date(job.slotTime).toLocaleString()}</p>
                </div>
                <p className="rounded bg-slate-800 px-2 py-1 text-xs uppercase">{job.status}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/worker/jobs/${job._id}`} className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Details</Link>
                {next && (
                  next === "completed" ? (
                    <span className="rounded bg-amber-700 px-3 py-2 text-xs text-white">
                      Complete from Details
                    </span>
                  ) : (
                    <button onClick={() => updateStatus(job, next)} className="rounded bg-sky-700 px-3 py-2 text-sm text-white hover:bg-sky-600">
                      Mark {next}
                    </button>
                  )
                )}
                {job.conversationId && (
                  <Link href={`/chat/${job.conversationId}`} className="rounded bg-emerald-700 px-3 py-2 text-sm text-white hover:bg-emerald-600">
                    Chat Customer
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
