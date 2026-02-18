"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

const STATUS_STEPS = ["assigned", "onway", "working", "completed"];
const TRACKABLE_STATUSES = new Set(["assigned", "onway", "working"]);
const TRACKING_PERSIST_INTERVAL_MS = 8000;

export default function WorkerJobDetailPage() {
  const params = useParams();
  const jobId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [reassignReason, setReassignReason] = useState("");
  const [reassigning, setReassigning] = useState(false);
  const [trackingBusy, setTrackingBusy] = useState(false);
  const [trackingActive, setTrackingActive] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [lastLocation, setLastLocation] = useState(null);

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const trackingTokenRef = useRef("");
  const lastPersistAtRef = useRef(0);

  const getTrackingSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = getSocket();
    }
    return socketRef.current;
  }, []);

  const load = async () => {
    if (!jobId) return;
    const res = await fetch(`/api/worker/jobs/${jobId}`, { credentials: "include" });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error || "Failed to load job");
      return;
    }
    setJob(data.job);
  };

  useEffect(() => {
    load();
  }, [jobId]);

  const stepIndex = useMemo(() => STATUS_STEPS.indexOf(job?.status), [job?.status]);
  const canTrackLive = useMemo(() => TRACKABLE_STATUSES.has(String(job?.status || "")), [job?.status]);
  const nextStatus = useMemo(() => {
    if (!job?.status) return null;
    const index = STATUS_STEPS.indexOf(job.status);
    if (index < 0 || index >= STATUS_STEPS.length - 1) return null;
    return STATUS_STEPS[index + 1];
  }, [job?.status]);

  const persistTrackingLocation = useCallback(
    async (location) => {
      if (!jobId || !location) return;
      await fetch(`/api/bookings/${jobId}/tracking`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(location),
      }).catch(() => null);
    },
    [jobId]
  );

  const stopTracking = useCallback(
    async ({ markOffline = true, updateState = true } = {}) => {
      if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      if (updateState) setTrackingActive(false);
      trackingTokenRef.current = "";

      if (jobId) {
        const socket = getTrackingSocket();
        socket.emit("bookingTracking:leave", { bookingId: jobId });
      }

      if (markOffline && jobId) {
        await fetch(`/api/bookings/${jobId}/tracking`, {
          method: "DELETE",
          credentials: "include",
        }).catch(() => null);
      }
    },
    [getTrackingSocket, jobId]
  );

  const startTracking = useCallback(async () => {
    if (!jobId || trackingBusy || trackingActive) return;
    if (!canTrackLive) {
      setTrackingError("Tracking is available only in assigned/onway/working stage");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setTrackingError("Geolocation is not supported in this browser");
      return;
    }

    setTrackingBusy(true);
    setTrackingError("");

    const tokenRes = await fetch(`/api/bookings/${jobId}/tracking/token`, { credentials: "include" });
    const tokenData = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenData.ok || !tokenData.token) {
      setTrackingBusy(false);
      setTrackingError(tokenData.error || "Unable to start live tracking");
      return;
    }
    if (!tokenData.permissions?.canSend) {
      setTrackingBusy(false);
      setTrackingError("You are not allowed to share location for this booking");
      return;
    }

    trackingTokenRef.current = tokenData.token;
    const socket = getTrackingSocket();
    socket.emit("bookingTracking:join", { bookingId: jobId, token: trackingTokenRef.current });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          recordedAt: new Date(position.timestamp || Date.now()).toISOString(),
        };

        setLastLocation(location);
        socket.emit("bookingTracking:update", {
          bookingId: jobId,
          token: trackingTokenRef.current,
          location,
        });

        const now = Date.now();
        if (now - lastPersistAtRef.current >= TRACKING_PERSIST_INTERVAL_MS) {
          lastPersistAtRef.current = now;
          persistTrackingLocation(location);
        }
      },
      (geoError) => {
        setTrackingError(geoError?.message || "Unable to read location");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20000,
      }
    );

    watchIdRef.current = watchId;
    setTrackingActive(true);
    setTrackingBusy(false);
    setMsg("Live tracking started");
  }, [canTrackLive, getTrackingSocket, jobId, persistTrackingLocation, trackingActive, trackingBusy]);

  const markNext = async () => {
    if (!nextStatus || saving || !job) return;
    setSaving(true);
    const res = await fetch(`/api/bookings/${job._id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        status: nextStatus,
        note: `Worker moved status to ${nextStatus}`,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Failed to update status");
      return;
    }
    setError("");
    setMsg(`Updated order to ${nextStatus}`);
    await load();
  };

  const requestReassign = async () => {
    if (!job || reassigning) return;
    setReassigning(true);
    const res = await fetch(`/api/bookings/${job._id}/reassign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        reason: "worker_unavailable",
        note: reassignReason,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setReassigning(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Failed to auto reassign");
      return;
    }
    setError("");
    setMsg(data.message || "Auto reassign completed");
    setReassignReason("");
    await load();
  };

  useEffect(() => {
    const socket = getTrackingSocket();
    const onTrackingError = (payload) => {
      if (String(payload?.bookingId || "") !== String(jobId || "")) return;
      setTrackingError(payload?.error || "Tracking error");
    };
    socket.on("bookingTracking:error", onTrackingError);
    return () => {
      socket.off("bookingTracking:error", onTrackingError);
    };
  }, [getTrackingSocket, jobId]);

  useEffect(() => {
    if (trackingActive && !canTrackLive) {
      stopTracking();
    }
  }, [canTrackLive, stopTracking, trackingActive]);

  useEffect(() => {
    return () => {
      stopTracking({ updateState: false });
    };
  }, [stopTracking]);

  if (error && !job) return <p className="rounded bg-rose-950 p-3 text-rose-300">{error}</p>;
  if (!job) return <p className="text-slate-400">Loading job...</p>;
  const canReassign = ["assigned", "onway"].includes(job.status);

  return (
    <section className="space-y-4">
      {error && <p className="rounded bg-rose-950 p-3 text-rose-300">{error}</p>}
      {msg && <p className="rounded bg-emerald-950 p-3 text-emerald-300">{msg}</p>}

      <div className="panel">
        <h1 className="text-2xl font-semibold">Job #{job._id.slice(-6)}</h1>
        <p className="text-sm text-slate-400">
          {job.service?.title} | {String(job.status || "").toUpperCase()}
        </p>
      </div>

      <div className="panel space-y-3">
        <h2 className="font-semibold">Status Timeline</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_STEPS.map((status, idx) => (
            <span
              key={status}
              className={`rounded px-2 py-1 text-xs uppercase ${
                idx <= stepIndex ? "bg-emerald-700 text-white" : "bg-slate-800 text-slate-300"
              }`}
            >
              {status}
            </span>
          ))}
        </div>
        <div className="space-y-1">
          {(job.statusLogs || []).map((log, idx) => (
            <div key={`${log.status}_${idx}`} className="rounded border border-slate-700 bg-slate-900/30 p-2 text-xs">
              <p className="font-semibold uppercase">{log.status}</p>
              <p className="text-slate-400">{new Date(log.at || job.updatedAt).toLocaleString()}</p>
              {log.note && <p>{log.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel space-y-2">
          <h2 className="font-semibold">Customer Details</h2>
          <p className="text-sm">Name: {job.customer?.name || "-"}</p>
          <p className="text-sm">Phone: {job.customer?.phone || "-"}</p>
          <p className="text-sm">Email: {job.customer?.email || "-"}</p>
        </div>

        <div className="panel space-y-2">
          <h2 className="font-semibold">Address + Slot</h2>
          <p className="text-sm">
            {job.address?.line1}, {job.address?.city}, {job.address?.pincode}
          </p>
          <p className="text-sm">Slot: {new Date(job.slotTime).toLocaleString()}</p>
          <p className="text-sm">Notes: {job.notes || "No notes"}</p>
        </div>
      </div>

      <div className="panel space-y-3">
        <h2 className="font-semibold">Live Location Tracking</h2>
        <p className="text-xs text-slate-400">
          Start tracking when you are traveling for this job. Customer will see your live location updates.
        </p>
        {trackingError && <p className="rounded bg-rose-950 p-2 text-xs text-rose-300">{trackingError}</p>}
        {lastLocation ? (
          <p className="text-xs text-slate-300">
            Last sent: {new Date(lastLocation.recordedAt || Date.now()).toLocaleString()} |{" "}
            {Number(lastLocation.lat).toFixed(5)}, {Number(lastLocation.lng).toFixed(5)}
          </p>
        ) : (
          <p className="text-xs text-slate-500">No location shared yet.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={startTracking}
            disabled={!canTrackLive || trackingActive || trackingBusy}
            className="rounded bg-emerald-700 px-3 py-2 text-sm text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {trackingBusy ? "Starting..." : trackingActive ? "Live Tracking On" : "Start Live Tracking"}
          </button>
          <button
            onClick={() => stopTracking()}
            disabled={!trackingActive}
            className="rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600 disabled:opacity-60"
          >
            Stop Tracking
          </button>
        </div>
        {!canTrackLive && <p className="text-xs text-slate-500">Tracking works only before completion/cancellation.</p>}
      </div>

      <div className="panel space-y-3">
        <h2 className="font-semibold">Unable To Attend</h2>
        <p className="text-xs text-slate-400">If you cannot attend this job, request auto reassignment so customer gets a replacement.</p>
        <textarea
          className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-sm"
          rows={2}
          placeholder="Reason (optional)"
          value={reassignReason}
          onChange={(e) => setReassignReason(e.target.value)}
        />
        <button
          onClick={requestReassign}
          disabled={!canReassign || reassigning}
          className="rounded bg-amber-700 px-3 py-2 text-sm text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {reassigning ? "Requesting..." : "Auto Reassign This Job"}
        </button>
        {!canReassign && <p className="text-xs text-slate-500">Allowed only in assigned/onway stage.</p>}
      </div>

      <div className="panel space-y-3">
        <h2 className="font-semibold">Update Job Status</h2>
        <p className="text-xs text-slate-400">Move job to the next stage when work progresses.</p>
        {nextStatus && (
          <button
            onClick={markNext}
            disabled={saving}
            className="rounded bg-sky-700 px-3 py-2 text-sm text-white hover:bg-sky-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : `Mark ${nextStatus}`}
          </button>
        )}
      </div>
    </section>
  );
}
