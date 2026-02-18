"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  AlertCircle,
  RefreshCw,
  DollarSign,
  CreditCard,
  Wallet,
  MessageCircle,
  Repeat,
  FileText,
  Shield,
  XCircle,
  ChevronRight,
  Truck,
  Wrench,
  CheckCircle,
  UserRound,
} from "lucide-react";

const STATUS_STEPS = ["confirmed", "assigned", "onway", "working", "completed"];
const TRACKABLE_STATUSES = new Set(["assigned", "onway", "working"]);

function hoursBetween(fromDate, toDate) {
  return (new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60);
}

function estimatePolicyFee(policy, status, slotTime) {
  if (!policy) return null;
  if (policy.blockStatuses?.includes(status)) return { blocked: true, fee: null };
  if (policy.highFeeStatuses?.includes(status)) return { blocked: false, fee: policy.highFeeAmount ?? 299 };

  const hoursLeft = hoursBetween(new Date(), slotTime);
  for (const tier of policy.tiers || []) {
    if (hoursLeft >= tier.minHoursBefore && hoursLeft < tier.maxHoursBefore) {
      return { blocked: false, fee: tier.fee };
    }
  }
  const sorted = [...(policy.tiers || [])].sort((a, b) => a.minHoursBefore - b.minHoursBefore);
  return { blocked: false, fee: sorted[0]?.fee || 0 };
}

function getStatusIcon(status) {
  const icons = {
    confirmed: Calendar,
    assigned: UserRound,
    onway: Truck,
    working: Wrench,
    completed: CheckCircle,
    cancelled: XCircle,
  };
  return icons[status] || AlertCircle;
}

function getStatusColor(status) {
  const colors = {
    confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    assigned: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    onway: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    working: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    cancelled: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  };
  return colors[status] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

export default function OrderDetailPage() {
  const params = useParams();
  const bookingId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [booking, setBooking] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelPayVia, setCancelPayVia] = useState("online");
  const [reassignLoading, setReassignLoading] = useState(false);
  const [reassignNote, setReassignNote] = useState("");
  const [tracking, setTracking] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  const socketRef = useRef(null);
  const trackingTokenRef = useRef("");

  const getTrackingSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = getSocket();
    }
    return socketRef.current;
  }, []);

  const load = async () => {
    if (!bookingId) return;
    const [bookingRes, policyRes] = await Promise.all([
      fetch(`/api/bookings/${bookingId}`, { credentials: "include" }),
      fetch("/api/reschedule-policy", { credentials: "include" }),
    ]);
    const [bookingData, policyData] = await Promise.all([
      bookingRes.json().catch(() => ({})),
      policyRes.json().catch(() => ({})),
    ]);
    if (!bookingRes.ok || !bookingData.ok) {
      setError(bookingData.error || "Failed to load order");
      return;
    }
    setBooking(bookingData.booking);
    if (policyRes.ok && policyData.ok) setPolicy(policyData.policy || null);
  };

  useEffect(() => {
    load();
  }, [bookingId]);

  const loadTracking = useCallback(
    async ({ silent = false } = {}) => {
      if (!bookingId) return;
      if (!silent) setTrackingLoading(true);

      try {
        const res = await fetch(`/api/bookings/${bookingId}/tracking`, { credentials: "include", cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          if (!silent) setTrackingError(data.error || "Unable to load live location");
          return;
        }
        setTracking(data.tracking || null);
        if (!silent) setTrackingError("");
      } finally {
        if (!silent) setTrackingLoading(false);
      }
    },
    [bookingId]
  );

  useEffect(() => {
    if (!bookingId) return;
    let disposed = false;
    const socket = getTrackingSocket();

    const onTrackingUpdated = (payload) => {
      if (String(payload?.bookingId || "") !== String(bookingId)) return;
      const liveLocation = payload?.location || null;
      setTracking((prev) => ({
        bookingId,
        isLive: true,
        updatedAt: payload?.sentAt || new Date().toISOString(),
        lastLocation: liveLocation,
        trail: [...(prev?.trail || []).slice(-39), liveLocation].filter(Boolean),
      }));
    };

    const onTrackingError = (payload) => {
      if (String(payload?.bookingId || "") !== String(bookingId)) return;
      setTrackingError(payload?.error || "Tracking connection failed");
    };

    socket.on("bookingTracking:updated", onTrackingUpdated);
    socket.on("bookingTracking:error", onTrackingError);

    const init = async () => {
      await loadTracking();
      const tokenRes = await fetch(`/api/bookings/${bookingId}/tracking/token`, { credentials: "include" });
      const tokenData = await tokenRes.json().catch(() => ({}));
      if (!disposed && tokenRes.ok && tokenData.ok && tokenData.token) {
        trackingTokenRef.current = tokenData.token;
        socket.emit("bookingTracking:join", { bookingId, token: trackingTokenRef.current });
      }
    };

    init();
    const interval = setInterval(() => {
      loadTracking({ silent: true });
    }, 20000);

    return () => {
      disposed = true;
      clearInterval(interval);
      socket.emit("bookingTracking:leave", { bookingId });
      socket.off("bookingTracking:updated", onTrackingUpdated);
      socket.off("bookingTracking:error", onTrackingError);
    };
  }, [bookingId, getTrackingSocket, loadTracking]);

  const reschedule = async () => {
    if (!bookingId) return;
    if (!newSlot) return;
    const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ newSlotTime: new Date(newSlot).toISOString(), payVia: "online" }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error || "Reschedule failed");
      return;
    }
    setError("");
    setNewSlot("");
    load();
  };

  const cancelOrder = async () => {
    if (!bookingId || cancelLoading) return;
    setCancelLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ payVia: cancelPayVia }),
    });
    const data = await res.json().catch(() => ({}));
    setCancelLoading(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Cancellation failed");
      return;
    }
    setError("");
    setActionMsg("Order cancelled successfully");
    load();
  };

  const requestAutoReassign = async () => {
    if (!bookingId || reassignLoading) return;
    setReassignLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}/reassign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        reason: "customer_unavailable_worker",
        note: reassignNote,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setReassignLoading(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Failed to request auto reassign");
      return;
    }
    setError("");
    setActionMsg(data.message || "Auto reassign completed");
    setReassignNote("");
    await load();
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400">
              {error}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-fuchsia-500"></div>
              <p className="mt-4 text-sm text-slate-400">Loading booking details...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const stepIndex = STATUS_STEPS.indexOf(booking.status);
  const canCancel = ["confirmed", "assigned", "onway"].includes(booking.status);
  const canRequestReassign = ["assigned", "onway"].includes(booking.status) && Boolean(booking.workerId);
  const feePreview = estimatePolicyFee(policy, booking.status, booking.slotTime);
  const trackingPoint = tracking?.lastLocation || null;
  const canShowTracking = TRACKABLE_STATUSES.has(String(booking.status || "")) || Boolean(trackingPoint);
  const trackingLastUpdate = trackingPoint?.recordedAt || tracking?.updatedAt || null;
  const mapsUrl = trackingPoint
    ? `https://www.google.com/maps?q=${trackingPoint.lat},${trackingPoint.lng}`
    : "";
  const StatusIcon = getStatusIcon(booking.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400 sm:mb-6">
            {error}
          </div>
        )}
        {actionMsg && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 sm:mb-6">
            {actionMsg}
          </div>
        )}

        {/* Header */}
        <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getStatusColor(booking.status)} sm:h-14 sm:w-14`}>
              <StatusIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">Order #{booking._id.slice(-6)}</h1>
              <p className="text-sm text-slate-400">
                {booking.service?.title} • {booking.status.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/booking/new?serviceId=${booking.serviceId}${booking.workerId ? `&workerId=${booking.workerId}` : ""}`}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white sm:rounded-xl sm:px-4"
            >
              <Repeat className="h-4 w-4" />
              <span className="hidden sm:inline">Book</span> Again
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white sm:rounded-xl sm:px-4"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Raise</span> Report
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {/* Left Column - Timeline & Tracking */}
          <div className="space-y-4 lg:col-span-2">
            {/* Timeline Card */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:rounded-2xl sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Timeline</h2>
              
              {/* Status Steps */}
              <div className="mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
                {STATUS_STEPS.map((status, idx) => {
                  const isActive = idx <= stepIndex;
                  return (
                    <div key={status} className="flex items-center">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium sm:h-10 sm:w-10 ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {idx + 1}
                      </span>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`mx-1 h-0.5 w-4 sm:mx-2 sm:w-8 ${
                          isActive && STATUS_STEPS[idx + 1] && stepIndex > idx
                            ? "bg-emerald-500/50"
                            : "bg-slate-700"
                        }`} />
                      )}
                    </div>
                  );
                })}
                {booking.status === "cancelled" && (
                  <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-medium text-rose-400 border border-rose-500/30">
                    cancelled
                  </span>
                )}
              </div>

              {/* Status Logs */}
              <div className="space-y-3">
                {(booking.statusLogs || []).map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-fuchsia-400"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{String(log.status || "").toUpperCase()}</p>
                      <p className="text-xs text-slate-400">{new Date(log.at || log.createdAt || booking.updatedAt).toLocaleString()}</p>
                      {log.note && <p className="mt-1 text-xs text-slate-300">{log.note}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reschedule History */}
              {(booking.rescheduleLogs || []).length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Reschedule history</p>
                  <div className="space-y-2">
                    {(booking.rescheduleLogs || []).map((row) => (
                      <div key={row._id} className="text-xs text-slate-400">
                        <span>{new Date(row.createdAt).toLocaleString()}</span>
                        <ChevronRight className="mx-1 inline h-3 w-3" />
                        <span className="text-slate-300">Fee ₹{row.fee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Tracking Card */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:rounded-2xl sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Live Worker Tracking</h2>
                {tracking?.isLive && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
                    LIVE
                  </span>
                )}
              </div>
              
              {trackingError && (
                <div className="mt-3 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400">
                  {trackingError}
                </div>
              )}
              
              {trackingLoading && (
                <div className="mt-4 flex items-center justify-center py-4">
                  <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              )}
              
              {!canShowTracking && !trackingLoading && !trackingError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-800/50 p-4">
                  <MapPin className="h-5 w-5 text-slate-500" />
                  <p className="text-sm text-slate-400">Live tracking starts when worker begins travel.</p>
                </div>
              )}
              
              {trackingPoint && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg bg-slate-800/50 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Latitude</p>
                        <p className="text-sm font-mono text-white">{Number(trackingPoint.lat).toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Longitude</p>
                        <p className="text-sm font-mono text-white">{Number(trackingPoint.lng).toFixed(6)}</p>
                      </div>
                      {trackingPoint.accuracy !== null && (
                        <div className="col-span-2">
                          <p className="text-xs text-slate-500">GPS Accuracy</p>
                          <p className="text-sm text-white">{Math.round(trackingPoint.accuracy)} meters</p>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Last update: {trackingLastUpdate ? new Date(trackingLastUpdate).toLocaleString() : "-"}
                    </p>
                  </div>
                  
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto sm:px-6"
                  >
                    <Navigation className="h-4 w-4" />
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>

            {/* Worker Unavailable Card */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:rounded-2xl sm:p-6">
              <h2 className="text-lg font-semibold text-white">Worker Unavailable?</h2>
              <p className="mt-1 text-sm text-slate-400">
                If assigned worker is not responding or cannot attend, request auto reassignment.
              </p>
              
              <textarea
                rows={2}
                value={reassignNote}
                onChange={(e) => setReassignNote(e.target.value)}
                placeholder="Optional note for admin/ops"
                className="mt-4 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
              />
              
              <button
                onClick={requestAutoReassign}
                disabled={!canRequestReassign || reassignLoading}
                className="mt-3 w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-50 sm:w-auto sm:px-6"
              >
                {reassignLoading ? "Requesting..." : "Request Auto Reassign"}
              </button>
              
              {!canRequestReassign && (
                <p className="mt-2 text-xs text-amber-400">
                  Available only when booking is in assigned/onway stage.
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Price & Actions */}
          <div className="space-y-4 lg:col-span-1">
            {/* Price Card */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:rounded-2xl sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Price Breakdown</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Base</span>
                  <span className="text-white">₹{booking.priceBreakup?.base || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Visit</span>
                  <span className="text-white">₹{booking.priceBreakup?.visit || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Addons</span>
                  <span className="text-white">₹{booking.priceBreakup?.addons || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tax</span>
                  <span className="text-white">₹{booking.priceBreakup?.tax || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Discount</span>
                  <span className="text-emerald-400">-₹{booking.priceBreakup?.discount || 0}</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-fuchsia-400">₹{booking.priceBreakup?.total || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reschedule Card */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:rounded-2xl sm:p-6">
              <h2 className="text-lg font-semibold text-white">Reschedule</h2>
              
              <input
                type="datetime-local"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="mt-4 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white"
              />
              
              {feePreview?.blocked ? (
                <p className="mt-2 text-xs text-rose-400">Reschedule blocked for current booking stage.</p>
              ) : (
                <p className="mt-2 text-xs text-slate-400">
                  Estimated reschedule fee: ₹{feePreview?.fee ?? 0}
                </p>
              )}
              
              <button
                onClick={reschedule}
                className="mt-3 w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-500"
              >
                Reschedule (fee auto)
              </button>
            </div>

            {/* Cancellation Card */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:rounded-2xl sm:p-6">
              <h2 className="text-lg font-semibold text-white">Cancellation</h2>
              
              <p className="mt-1 text-sm text-slate-400">
                Allowed till early execution stages. Fee applies as per policy.
              </p>
              
              {feePreview?.blocked ? (
                <p className="mt-2 text-xs text-rose-400">Cancellation blocked for this stage.</p>
              ) : (
                <p className="mt-2 text-xs text-slate-400">
                  Estimated cancellation fee: ₹{feePreview?.fee ?? 0}
                </p>
              )}
              
              <select
                value={cancelPayVia}
                onChange={(e) => setCancelPayVia(e.target.value)}
                className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white"
              >
                <option value="online">Pay fee online</option>
                <option value="wallet">Pay fee via wallet</option>
              </select>
              
              <button
                onClick={cancelOrder}
                disabled={!canCancel || cancelLoading}
                className="mt-3 w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
              >
                {cancelLoading ? "Cancelling..." : "Cancel Order"}
              </button>
              
              {!canCancel && (
                <p className="mt-2 text-xs text-amber-400">
                  Cancellation not available at this order stage.
                </p>
              )}
            </div>

            {/* Policy Card */}
            {policy && (
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:rounded-2xl sm:p-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-fuchsia-400" />
                  <h2 className="text-lg font-semibold text-white">Policy</h2>
                </div>
                
                <p className="mt-2 text-sm text-slate-300">{policy.name}</p>
                
                <div className="mt-3 space-y-2">
                  {(policy.tiers || []).map((tier, idx) => (
                    <p key={idx} className="text-xs text-slate-400">
                      {tier.minHoursBefore}h - {tier.maxHoursBefore}h before: ₹{tier.fee}
                    </p>
                  ))}
                </div>
                
                <p className="mt-2 text-xs text-slate-500">
                  Blocked: {(policy.blockStatuses || []).join(", ") || "-"}
                </p>
              </div>
            )}

            {/* Chat Button */}
            {booking.conversationId && (
              <Link
                href={`/chat/${booking.conversationId}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" />
                Open Chat with Worker
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}