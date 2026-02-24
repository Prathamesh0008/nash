"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MessageCircle, Repeat, Eye, CreditCard, AlertCircle } from "lucide-react";
import RebookOptionsModal from "@/components/RebookOptionsModal";

const STATUS_STEPS = ["confirmed", "assigned", "onway", "working", "completed"];

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

function emitRebookUiEvent(event, payload = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("nash:rebook", {
      detail: {
        event,
        payload,
        at: new Date().toISOString(),
      },
    })
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [rebookLoadingById, setRebookLoadingById] = useState({});
  const [rebookModal, setRebookModal] = useState({
    open: false,
    booking: null,
    preview: null,
    submitting: false,
    error: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/bookings/me", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          setError(data?.error || "Failed to load orders");
          setBookings([]);
          return;
        }
        setBookings(data.bookings || []);
      } catch {
        setError("Failed to load orders");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openRebookOptions = async (booking) => {
    const bookingId = String(booking?._id || "");
    if (!bookingId || rebookLoadingById[bookingId]) return;

    setRebookLoadingById((prev) => ({ ...prev, [bookingId]: true }));
    setError("");
    setActionMsg("");

    try {
      const previewRes = await fetch(`/api/bookings/${bookingId}/rebook-preview`, {
        credentials: "include",
        cache: "no-store",
      });
      const previewData = await previewRes.json().catch(() => ({}));
      if (!previewRes.ok || !previewData.ok) {
        setError(previewData.error || "Unable to prepare rebook");
        emitRebookUiEvent("preview_failed", { bookingId, reason: previewData.error || "preview_failed" });
        return;
      }
      setRebookModal({
        open: true,
        booking,
        preview: previewData.preview || null,
        submitting: false,
        error: "",
      });
      emitRebookUiEvent("preview_loaded", {
        bookingId,
        eligible: Boolean(previewData?.preview?.eligibility?.eligible),
        recommendedWorkerPreference: previewData?.preview?.recommendedWorkerPreference || "auto",
      });
    } finally {
      setRebookLoadingById((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const closeRebookModal = () => {
    if (rebookModal.submitting) return;
    setRebookModal((prev) => ({ ...prev, open: false, submitting: false, error: "" }));
  };

  const submitRebook = async ({ workerPreference, strictSameWorker }) => {
    const booking = rebookModal.booking;
    const bookingId = String(booking?._id || "");
    if (!bookingId || rebookModal.submitting) return;

    setRebookModal((prev) => ({ ...prev, submitting: true, error: "" }));
    setRebookLoadingById((prev) => ({ ...prev, [bookingId]: true }));
    emitRebookUiEvent("submit_started", { bookingId, workerPreference, strictSameWorker });

    try {
      const rebookRes = await fetch(`/api/bookings/${bookingId}/rebook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slotTime: rebookModal?.preview?.suggestedSlotTime || undefined,
          workerPreference,
          strictSameWorker,
          paymentMethod: booking?.paymentMethod || "online",
        }),
      });
      const rebookData = await rebookRes.json().catch(() => ({}));
      if (!rebookRes.ok || !rebookData.ok || !rebookData?.booking?._id) {
        const message = rebookData.error || "Rebook failed";
        setRebookModal((prev) => ({ ...prev, submitting: false, error: message }));
        emitRebookUiEvent("submit_failed", { bookingId, reason: message });
        return;
      }

      setRebookModal({ open: false, booking: null, preview: null, submitting: false, error: "" });
      setActionMsg("Rebook created successfully. Redirecting...");
      emitRebookUiEvent("submit_success", {
        bookingId,
        newBookingId: String(rebookData.booking._id),
      });
      router.push(`/orders/${rebookData.booking._id}`);
    } catch {
      setRebookModal((prev) => ({ ...prev, submitting: false, error: "Rebook failed" }));
      emitRebookUiEvent("submit_failed", { bookingId, reason: "network_error" });
    } finally {
      setRebookLoadingById((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">My Orders</h1>
              <p className="mt-1 text-sm text-slate-400 sm:text-base">
                Track your service orders from confirmation to completion
              </p>
            </div>
            <Link
              href="/booking/new"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:rounded-xl sm:px-6 sm:py-3"
            >
              <Calendar className="mr-2 h-4 w-4" />
              New Booking
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {actionMsg && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {actionMsg}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 sm:py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-fuchsia-500"></div>
            <p className="mt-4 text-sm text-slate-400">Loading your orders...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 sm:py-16">
            <div className="rounded-full bg-slate-800/50 p-4">
              <Calendar className="h-8 w-8 text-slate-600 sm:h-12 sm:w-12" />
            </div>
            <p className="mt-4 text-sm text-slate-400 sm:text-base">No orders found</p>
            <Link
              href="/booking/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 sm:mt-6 sm:rounded-xl sm:px-6 sm:py-3"
            >
              <Calendar className="h-4 w-4" />
              Book Your First Service
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {bookings.map((booking) => (
              <article
                key={booking._id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:rounded-2xl sm:p-6"
              >
                {/* Status Indicator Line */}
                <div className={`absolute left-0 top-0 h-full w-1 ${
                  booking.status === "cancelled" 
                    ? "bg-gradient-to-b from-rose-500 to-rose-600"
                    : "bg-gradient-to-b from-fuchsia-500 to-violet-500"
                }`} />

                {/* Main Content */}
                <div className="pl-2 sm:pl-3">
                  {/* Header Row */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left Side - Service Info */}
                    <div className="flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <h2 className="text-lg font-semibold text-white sm:text-xl">
                          {booking.service?.title || "Service Booking"}
                        </h2>
                        <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium sm:px-3 sm:py-1 ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        {booking.isRebook && (
                          <span className="inline-flex w-fit items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300 sm:px-3 sm:py-1">
                            Rebook
                          </span>
                        )}
                      </div>
                      
                      {/* Time Slot */}
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(booking.slotTime).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>

                      {booking.isRebook && booking.sourceBooking && (
                        <p className="mt-2 text-xs text-emerald-300/90">
                          Rebooked from order #{String(booking.sourceBooking._id).slice(-6)} on{" "}
                          {new Date(booking.sourceBooking.slotTime).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>

                    {/* Right Side - Price */}
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <span className="text-xl font-bold text-white sm:text-2xl">
                        ₹{booking.priceBreakup?.total || 0}
                      </span>
                      <span className="text-xs text-slate-500">Total</span>
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  {booking.status !== "cancelled" && (
                    <div className="mt-4 sm:mt-6">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {STATUS_STEPS.map((status, index) => {
                          const currentIndex = STATUS_STEPS.indexOf(booking.status);
                          const stepIndex = STATUS_STEPS.indexOf(status);
                          const isCompleted = currentIndex >= stepIndex;
                          const isCurrent = booking.status === status;

                          return (
                            <div key={status} className="flex items-center">
                              <div className="flex flex-col items-center">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:h-8 sm:w-8 ${
                                  isCompleted
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                                    : "bg-slate-800 text-slate-400"
                                }`}>
                                  {index + 1}
                                </div>
                                <span className={`mt-1 hidden text-[10px] uppercase sm:block ${
                                  isCurrent ? "text-fuchsia-400" : "text-slate-500"
                                }`}>
                                  {status}
                                </span>
                              </div>
                              {index < STATUS_STEPS.length - 1 && (
                                <div className={`mx-1 h-0.5 w-4 sm:mx-2 sm:w-8 ${
                                  isCompleted && STATUS_STEPS[index + 1] && currentIndex > index
                                    ? "bg-emerald-500/50"
                                    : "bg-slate-700"
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Cancelled Badge */}
                  {booking.status === "cancelled" && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 sm:mt-6">
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                      <span className="text-sm text-rose-400">This booking has been cancelled</span>
                    </div>
                  )}

                  {/* Info Message */}
                  <p className="mt-4 text-xs text-slate-500 sm:mt-6">
                    <AlertCircle className="mr-1 inline h-3 w-3" />
                    Reschedule/cancellation fee depends on policy. Open details for tier-wise charges.
                  </p>

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
                    <Link
                      href={`/orders/${booking._id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white sm:rounded-xl sm:px-4 sm:py-2.5"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span> Details
                    </Link>

                    <Link
                      href={`/booking/new?serviceId=${booking.serviceId}${booking.workerId ? `&workerId=${booking.workerId}` : ""}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white sm:rounded-xl sm:px-4 sm:py-2.5"
                    >
                      <Repeat className="h-4 w-4" />
                      <span className="hidden sm:inline">Book</span> Again
                    </Link>

                    <button
                      type="button"
                      onClick={() => openRebookOptions(booking)}
                      disabled={Boolean(rebookLoadingById[String(booking._id)])}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:rounded-xl sm:px-4 sm:py-2.5"
                    >
                      <Repeat className="h-4 w-4" />
                      {rebookLoadingById[String(booking._id)] ? "Preparing..." : "One-Tap Rebook"}
                    </button>

                    {booking.conversationId && (
                      <Link
                        href={`/chat/${booking.conversationId}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:rounded-xl sm:px-4 sm:py-2.5"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Chat with</span> Worker
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <RebookOptionsModal
          key={`${String(rebookModal.booking?._id || "none")}:${String(rebookModal.preview?.suggestedSlotTime || "")}`}
          open={rebookModal.open}
          sourceBooking={rebookModal.booking}
          preview={rebookModal.preview}
          submitting={rebookModal.submitting}
          error={rebookModal.error}
          onClose={closeRebookModal}
          onConfirm={submitRebook}
        />
      </div>
    </div>
  );
}
