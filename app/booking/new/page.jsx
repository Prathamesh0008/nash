"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Home,
  Building,
  Tag,
  Gift,
  CreditCard,
  Wallet,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  Award,
  Zap,
  Shield,
  User,
  Briefcase,
  Navigation,
  X,
  Plus,
  Minus,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

function toIsoLocal(dateValue, timeValue) {
  const dt = new Date(`${dateValue}T${timeValue}:00`);
  return dt.toISOString();
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toDateInput(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function toTimeInput(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatSlotLabel(isoString) {
  const dt = new Date(isoString);
  if (Number.isNaN(dt.getTime())) return isoString;
  return dt.toLocaleString();
}

function normalizeLower(value = "") {
  return String(value || "").trim().toLowerCase();
}

function toFriendlyBookingError(message = "") {
  const text = String(message || "").trim();
  if (!text) return "Booking failed";
  if (text.includes("does not serve this area")) {
    return "Selected worker does not serve this area. Use worker area button or choose another worker.";
  }
  if (text.includes("does not support this service category")) {
    return "Selected worker profile does not match this booking setup. Try another worker or continue with flexible assignment.";
  }
  if (text.includes("Too many booking attempts")) {
    return "Too many attempts. Wait a few minutes and retry.";
  }
  return text;
}

export default function BookingNewPage() {
  const router = useRouter();
  const [query, setQuery] = useState({ serviceId: "", workerId: "" });
  const [workerPreview, setWorkerPreview] = useState(null);
  const [workerPricing, setWorkerPricing] = useState({ basePrice: 0, extraServices: [] });

  const [services, setServices] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [form, setForm] = useState({
    serviceId: "",
    line1: "",
    line2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    date: "",
    time: "",
    notes: "",
    paymentMethod: "online",
    promoCode: "",
    referralCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [promoStatus, setPromoStatus] = useState("");
  const [strictWorkerOnly, setStrictWorkerOnly] = useState(true);
  const [manualAssist, setManualAssist] = useState(null);
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const requestKeyRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const next = {
        serviceId: params.get("serviceId") || "",
        workerId: params.get("workerId") || "",
      };
      setQuery(next);
      setStrictWorkerOnly(Boolean(next.workerId));
      if (next.serviceId) {
        setForm((prev) => ({ ...prev, serviceId: next.serviceId }));
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const loadWorker = async () => {
      if (!query.workerId) {
        setWorkerPreview(null);
        setWorkerPricing({ basePrice: 0, extraServices: [] });
        return;
      }
      const res = await fetch(`/api/workers/${query.workerId}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setWorkerPreview(null);
        setWorkerPricing({ basePrice: 0, extraServices: [] });
        return;
      }
      setWorkerPreview({
        id: query.workerId,
        name: data.worker?.user?.name || "Selected Worker",
        areas: data.worker?.serviceAreas || [],
        pricing: data.worker?.pricing || { basePrice: 0, extraServices: [] },
        badges: data.worker?.badges || {},
        quality: data.worker?.quality || null,
      });
      setWorkerPricing({
        basePrice: Number(data.worker?.pricing?.basePrice || 0),
        extraServices: Array.isArray(data.worker?.pricing?.extraServices) ? data.worker.pricing.extraServices : [],
      });
    };
    loadWorker();
  }, [query.workerId]);

  useEffect(() => {
    const load = async () => {
      const [servicesRes, userRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/users/me", { credentials: "include" }),
      ]);
      const [servicesData, userData] = await Promise.all([
        servicesRes.json().catch(() => ({})),
        userRes.json().catch(() => ({})),
      ]);
      setServices(servicesData.services || []);
      const addresses = userData?.user?.addresses || [];
      setSavedAddresses(addresses);
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddress) {
        setForm((prev) => ({
          ...prev,
          line1: prev.line1 || defaultAddress.line1 || "",
          line2: prev.line2 || defaultAddress.line2 || "",
          landmark: prev.landmark || defaultAddress.landmark || "",
          city: prev.city || defaultAddress.city || "",
          state: prev.state || defaultAddress.state || "",
          pincode: prev.pincode || defaultAddress.pincode || "",
        }));
      }
    };
    load();
  }, []);

  const selectedService = useMemo(
    () => services.find((service) => service._id === form.serviceId),
    [services, form.serviceId]
  );
  const workerPrimaryArea = useMemo(
    () => (Array.isArray(workerPreview?.areas) && workerPreview.areas.length > 0 ? workerPreview.areas[0] : null),
    [workerPreview]
  );
  const selectedSlotTime = useMemo(() => {
    if (!form.date || !form.time) return null;
    const dt = new Date(`${form.date}T${form.time}:00`);
    return Number.isNaN(dt.getTime()) ? null : dt.getTime();
  }, [form.date, form.time]);
  const slotRows = useMemo(() => (Array.isArray(availability?.slots) ? availability.slots : []), [availability]);
  const selectedSlotAvailability = useMemo(() => {
    if (!selectedSlotTime) return null;
    return slotRows.find((slot) => new Date(slot.iso).getTime() === selectedSlotTime) || null;
  }, [slotRows, selectedSlotTime]);

  const addons = useMemo(
    () => (Array.isArray(selectedService?.addons) ? selectedService.addons : []),
    [selectedService]
  );
  const [selectedAddons, setSelectedAddons] = useState([]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSelectedAddons([]);
    }, 0);
    return () => clearTimeout(timeout);
  }, [query.workerId, form.serviceId]);

  useEffect(() => {
    if (!form.date) {
      setAvailability(null);
      setAvailabilityError("");
      setAvailabilityLoading(false);
      return;
    }

    const hasSource = Boolean(query.workerId || form.serviceId);
    if (!hasSource) {
      setAvailability(null);
      setAvailabilityError("");
      setAvailabilityLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setAvailabilityLoading(true);
        setAvailabilityError("");
        const params = new URLSearchParams({ date: form.date });
        if (query.workerId) params.set("workerId", query.workerId);
        if (form.serviceId) params.set("serviceId", form.serviceId);
        if (String(form.city || "").trim()) params.set("city", String(form.city).trim());
        if (String(form.pincode || "").trim()) params.set("pincode", String(form.pincode).trim());

        const res = await fetch(`/api/bookings/availability?${params.toString()}`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          setAvailability(null);
          setAvailabilityError(data?.error || "Unable to load live slots");
          return;
        }
        setAvailability(data.availability || null);
      } catch (error) {
        if (error?.name !== "AbortError") {
          setAvailability(null);
          setAvailabilityError("Unable to load live slots");
        }
      } finally {
        setAvailabilityLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [form.date, form.serviceId, form.city, form.pincode, query.workerId]);
  const nowDate = useMemo(() => new Date(), []);
  const minDate = useMemo(() => toDateInput(nowDate), [nowDate]);
  const minTime = useMemo(() => {
    if (form.date !== minDate) return "";
    return toTimeInput(new Date());
  }, [form.date, minDate]);

  const estimated = useMemo(() => {
    if (query.workerId) {
      const extraMap = new Map((workerPricing.extraServices || []).map((item) => [item.title, Number(item.price || 0)]));
      const addonsTotal = selectedAddons.reduce((sum, title) => sum + (extraMap.get(title) || 0), 0);
      const base = Number(workerPricing.basePrice || 0);
      const visit = 0;
      const taxPercent = Number(selectedService?.taxPercent || 18);
      const tax = Math.round((base + visit + addonsTotal) * taxPercent / 100);
      const total = base + visit + addonsTotal + tax;
      return { base, visit, addons: addonsTotal, tax, total };
    }

    if (!selectedService) return null;
    const addonsTotal = selectedAddons.reduce((sum, title) => {
      const addon = addons.find((item) => item.title === title);
      return sum + Number(addon?.price || 0);
    }, 0);
    const base = Number(selectedService.basePrice || 0);
    const visit = Number(selectedService.visitFee || 0);
    const tax = Math.round((base + visit + addonsTotal) * Number(selectedService.taxPercent || 0) / 100);
    const total = base + visit + addonsTotal + tax;
    return { base, visit, addons: addonsTotal, tax, total };
  }, [selectedService, selectedAddons, addons, query.workerId, workerPricing]);

  const toggleAddon = (title) => {
    setSelectedAddons((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]));
  };

  const fillFromWorkerArea = () => {
    if (!workerPrimaryArea) return;
    setForm((prev) => ({
      ...prev,
      city: workerPrimaryArea.city || prev.city,
      pincode: workerPrimaryArea.pincode || prev.pincode,
    }));
    setStatus("Address city/pincode updated from selected worker service area.");
    setError("");
  };

  const checkPromo = async () => {
    if (!form.promoCode || !estimated?.total) {
      setPromoStatus("Enter promo code and calculate price first.");
      return;
    }
    setPromoStatus("Checking promo...");
    const res = await fetch("/api/promos/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        code: form.promoCode,
        amount: estimated.total,
        serviceId: form.serviceId || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setPromoStatus(data.error || "Promo is not valid");
      return;
    }
    setPromoStatus(`Promo applied: -INR ${data.promo?.discount || 0}, payable INR ${data.promo?.payable || estimated.total}`);
  };

  const createRequestKey = () => {
    if (requestKeyRef.current) return requestKeyRef.current;
    requestKeyRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `booking_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return requestKeyRef.current;
  };

  const postBookingWithRetry = async (payload, idempotencyKey) => {
    const maxAttempts = 3;
    let lastError = "Booking failed";

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        setStatus(`Submitting booking... (attempt ${attempt}/${maxAttempts})`);
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-idempotency-key": idempotencyKey,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) return { ok: true, data };
        if (res.status === 409 && data.bookingId) return { ok: false, duplicateId: data.bookingId, error: data.error };
        if (res.status === 409) return { ok: false, error: data.error || "Booking conflict", data };
        if (res.status >= 500 && attempt < maxAttempts) {
          lastError = data.error || "Temporary server error";
          await new Promise((resolve) => setTimeout(resolve, attempt * 600));
          continue;
        }
        return { ok: false, error: data.error || "Booking failed", data };
      } catch (networkError) {
        lastError = "Network error. Retrying...";
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 600));
          continue;
        }
        return { ok: false, error: networkError?.message || "Network error" };
      }
    }

    return { ok: false, error: lastError };
  };

  const applyNearestSlot = (isoSlot) => {
    const dt = new Date(isoSlot);
    if (Number.isNaN(dt.getTime())) return;
    setForm((prev) => ({
      ...prev,
      date: toDateInput(dt),
      time: toTimeInput(dt),
    }));
    setManualAssist(null);
    setStatus("Nearest available slot selected. Click Confirm Booking.");
    setError("");
  };

  const applyAvailabilitySlot = (isoSlot) => {
    const dt = new Date(isoSlot);
    if (Number.isNaN(dt.getTime())) return;
    setForm((prev) => ({
      ...prev,
      date: toDateInput(dt),
      time: toTimeInput(dt),
    }));
    setManualAssist(null);
    setStatus("Live available slot selected. Click Confirm Booking.");
    setError("");
  };

  const requestCallback = async () => {
    if (!query.workerId || callbackLoading) return;
    setCallbackLoading(true);
    const subject = "Callback request for selected worker";
    const message = [
      `Customer requested callback for worker ${workerPreview?.name || query.workerId}.`,
      "Request type: all-rounder support visit.",
      `Requested slot: ${form.date} ${form.time}.`,
      `Location: ${form.city}, ${form.pincode}.`,
      "Reason: strict selected worker not available.",
    ].join(" ");

    const res = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        subject,
        category: "booking",
        priority: "high",
        message,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setCallbackLoading(false);
    if (!res.ok || !data.ok) {
      setError(data.error || "Failed to request callback");
      return;
    }
    setStatus(`Callback request submitted (ticket: ${data.ticket?.ticketNo || "created"}).`);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setManualAssist(null);

    if (!query.workerId && !form.serviceId) {
      setError("Please select a service");
      return;
    }

    if (!form.date || !form.time) {
      setError("Select booking date and time");
      return;
    }

    if (!form.line1 || !form.city || !form.pincode) {
      setError("Address line 1, city and pincode are required");
      return;
    }

    if (!/^\d{4,10}$/.test(form.pincode.trim())) {
      setError("Enter a valid pincode");
      return;
    }

    if (query.workerId && strictWorkerOnly && Array.isArray(workerPreview?.areas) && workerPreview.areas.length > 0) {
      const city = normalizeLower(form.city);
      const pincode = String(form.pincode || "").trim();
      const serves = workerPreview.areas.some((row) => {
        const rowCity = normalizeLower(row?.city);
        const rowPincode = String(row?.pincode || "").trim();
        return (pincode && rowPincode === pincode) || (city && rowCity === city);
      });
      if (!serves) {
        setError("Selected worker does not serve this entered area. Use worker area or disable strict mode.");
        return;
      }
    }

    const slotDate = new Date(`${form.date}T${form.time}:00`);
    if (Number.isNaN(slotDate.getTime())) {
      setError("Invalid booking date/time");
      return;
    }
    if (slotDate.getTime() < Date.now() - 60 * 1000) {
      setError("Please select a future slot time");
      return;
    }

    setLoading(true);

    const payload = {
      serviceId: form.serviceId || undefined,
      address: {
        line1: form.line1,
        line2: form.line2,
        landmark: form.landmark,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      slotTime: toIsoLocal(form.date, form.time),
      notes: form.notes,
      addons: selectedAddons,
      paymentMethod: form.paymentMethod,
      assignmentMode: query.workerId ? "manual" : "auto",
      manualWorkerId: query.workerId || undefined,
      strictWorker: query.workerId ? strictWorkerOnly : false,
      promoCode: form.promoCode,
      referralCode: form.referralCode,
      images: [],
    };

    const requestKey = createRequestKey();
    const result = await postBookingWithRetry(payload, requestKey);
    setLoading(false);

    if (!result.ok && result.duplicateId) {
      setStatus("Duplicate request detected. Opening your existing order...");
      router.push(`/orders/${result.duplicateId}`);
      return;
    }

    if (!result.ok) {
      if (result.data?.code === "STRICT_WORKER_UNAVAILABLE" || result.data?.code === "MANUAL_WORKER_UNAVAILABLE") {
        setManualAssist(result.data);
      }
      setError(toFriendlyBookingError(result.error || "Booking failed"));
      setStatus("");
      return;
    }

    setManualAssist(null);
    setStatus("Booking confirmed. Redirecting...");
    router.push(`/orders/${result.data.booking._id}`);
    requestKeyRef.current = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
              <Calendar className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">Book a Service</h1>
              <p className="text-xs text-slate-400 sm:text-sm">
                Fill in the details to schedule your service
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          
          {/* Booking Form */}
          <form onSubmit={submit} className="space-y-6">
            
            {/* Error & Status Messages */}
            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {status && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{status}</span>
                </div>
              </div>
            )}

            {/* Selected Worker Card */}
            {query.workerId && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-400">Selected Worker</p>
                    <h3 className="text-lg font-semibold text-white">{workerPreview?.name || query.workerId}</h3>
                    
                    {workerPreview?.quality && (
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Star className="h-3 w-3 text-amber-400" />
                          {workerPreview.quality.qualityScore}/100
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Zap className="h-3 w-3 text-fuchsia-400" />
                          {workerPreview.quality.responseTimeAvg} min
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <X className="h-3 w-3 text-rose-400" />
                          {workerPreview.quality.cancelRate}% cancel
                        </span>
                      </div>
                    )}

                    {/* Badges */}
                    {workerPreview?.badges && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {workerPreview.badges.topRated && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-400">
                            <Award className="h-3 w-3" />
                            Top Rated
                          </span>
                        )}
                        {workerPreview.badges.fastResponse && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-400">
                            <Zap className="h-3 w-3" />
                            Fast Response
                          </span>
                        )}
                        {workerPreview.badges.lowCancel && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                            <CheckCircle className="h-3 w-3" />
                            Low Cancel
                          </span>
                        )}
                        {workerPreview.badges.trustedPro && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-xs text-fuchsia-400">
                            <Shield className="h-3 w-3" />
                            Trusted Pro
                          </span>
                        )}
                      </div>
                    )}

                    {/* Service Areas */}
                    {(workerPreview?.areas || []).length > 0 && (
                      <p className="mt-3 text-xs text-slate-400">
                        <span className="font-medium">Service areas:</span>{" "}
                        {workerPreview.areas.map((row) => `${row.city}-${row.pincode}`).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-2xl font-bold text-white">
                      ₹{Number(workerPricing.basePrice || 0)}
                    </span>
                    <p className="text-xs text-slate-400">Base price</p>
                  </div>
                </div>

                {/* Worker Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {workerPrimaryArea && (
                    <button
                      type="button"
                      onClick={fillFromWorkerArea}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white"
                    >
                      <Navigation className="h-3 w-3" />
                      Use Worker Area
                    </button>
                  )}
                  
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400">
                    <input
                      type="checkbox"
                      checked={strictWorkerOnly}
                      onChange={(e) => {
                        setStrictWorkerOnly(e.target.checked);
                        setManualAssist(null);
                      }}
                      className="h-3 w-3 rounded border-amber-600 bg-amber-800 text-amber-500"
                    />
                    <span>Strict worker mode</span>
                  </label>
                </div>

                {!strictWorkerOnly && (
                  <p className="mt-2 text-xs text-amber-400/70">
                    Alternate worker allowed if selected worker is unavailable
                  </p>
                )}
              </div>
            )}

            {/* Manual Assist Card */}
            {manualAssist && query.workerId && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-6">
                <h4 className="mb-3 text-sm font-medium text-amber-400">Worker Unavailable</h4>
                
                {(manualAssist.nearestSlots || []).length > 0 ? (
                  <>
                    <p className="mb-2 text-xs text-slate-300">Nearest available slots:</p>
                    <div className="flex flex-wrap gap-2">
                      {(manualAssist.nearestSlots || []).map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => applyNearestSlot(slot)}
                          className="rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-3 py-1.5 text-xs text-white transition hover:opacity-90"
                        >
                          {formatSlotLabel(slot)}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">No nearby slots found for this worker</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {manualAssist.options?.allowAlternateWorker && strictWorkerOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setStrictWorkerOnly(false);
                        setStatus("Alternate worker enabled. Click Confirm Booking again.");
                        setError("");
                      }}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-500"
                    >
                      Allow Alternate Worker
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={requestCallback}
                    disabled={callbackLoading}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs text-white hover:bg-amber-500 disabled:opacity-50"
                  >
                    {callbackLoading ? "Submitting..." : "Request Callback"}
                  </button>
                  
                  <Link
                    href={`/booking/new${form.serviceId ? `?serviceId=${form.serviceId}` : ""}`}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:border-fuchsia-400/50 hover:text-white"
                  >
                    Cancel Strict Mode
                  </Link>
                </div>
              </div>
            )}

            {/* Service Selection (if no worker) */}
            {!query.workerId && (
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Select Service *
                </label>
                <select
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  required
                >
                  <option value="">Choose a service</option>
                  {services.map((service, idx) => (
                    <option key={service._id} value={service._id}>
                      {service.title || `Service ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Address Section */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-fuchsia-400" />
                <h2 className="text-lg font-semibold text-white">Service Address</h2>
              </div>

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs text-slate-400">Saved Addresses</p>
                  <div className="flex flex-wrap gap-2">
                    {savedAddresses.map((address) => (
                      <button
                        key={address._id || `${address.line1}-${address.pincode}`}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            line1: address.line1 || "",
                            line2: address.line2 || "",
                            landmark: address.landmark || "",
                            city: address.city || "",
                            state: address.state || "",
                            pincode: address.pincode || "",
                          }))
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white"
                      >
                        <Home className="h-3 w-3" />
                        {(address.label || "Address").toUpperCase()} - {address.city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Form */}
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="col-span-2 rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none sm:col-span-2"
                  placeholder="Address Line 1 *"
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  required
                />
                
                <input
                  className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="Address Line 2"
                  value={form.line2}
                  onChange={(e) => setForm({ ...form, line2: e.target.value })}
                />
                
                <input
                  className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="Landmark"
                  value={form.landmark}
                  onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                />
                
                <input
                  className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="City *"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
                
                <input
                  className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
                
                <input
                  className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="Pincode *"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-fuchsia-400" />
                <h2 className="text-lg font-semibold text-white">Schedule</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Date *</label>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                    type="date"
                    min={minDate}
                    value={form.date}
                    onChange={(e) => {
                      setForm({ ...form, date: e.target.value });
                      setManualAssist(null);
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Time *</label>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                    type="time"
                    min={minTime || undefined}
                    value={form.time}
                    onChange={(e) => {
                      setForm({ ...form, time: e.target.value });
                      setManualAssist(null);
                    }}
                    required
                  />
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/40 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-300">Live Slot Availability</p>
                  {availability?.summary && !availabilityLoading && (
                    <p className="text-[11px] text-slate-400">
                      {availability.summary.available}/{availability.summary.total} slots available
                    </p>
                  )}
                </div>

                {availabilityLoading && (
                  <p className="text-xs text-slate-400">Checking slots...</p>
                )}

                {!availabilityLoading && availabilityError && (
                  <p className="text-xs text-rose-400">{availabilityError}</p>
                )}

                {!availabilityLoading && !availabilityError && !form.date && (
                  <p className="text-xs text-slate-500">Select a date to view available slots.</p>
                )}

                {!availabilityLoading &&
                  !availabilityError &&
                  form.date &&
                  Array.isArray(availability?.requirementsMissing) &&
                  availability.requirementsMissing.length > 0 && (
                    <p className="text-xs text-amber-400">{availability.requirementsMissing[0]}</p>
                  )}

                {!availabilityLoading &&
                  !availabilityError &&
                  form.date &&
                  slotRows.length > 0 &&
                  (!availability?.requirementsMissing || availability.requirementsMissing.length === 0) && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                        {slotRows.map((slot) => {
                          const slotTs = new Date(slot.iso).getTime();
                          const isSelected = selectedSlotTime != null && slotTs === selectedSlotTime;
                          const isAvailable = Boolean(slot.available);
                          return (
                            <button
                              key={slot.iso}
                              type="button"
                              title={isAvailable ? "Available" : slot.reason || "Unavailable"}
                              onClick={() => applyAvailabilitySlot(slot.iso)}
                              disabled={!isAvailable}
                              className={`rounded-md border px-2 py-1 text-[11px] transition ${
                                isSelected && isAvailable
                                  ? "border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200"
                                  : isAvailable
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                    : "cursor-not-allowed border-white/10 bg-white/5 text-slate-500"
                              }`}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>

                      {selectedSlotAvailability && !selectedSlotAvailability.available && (
                        <p className="text-xs text-amber-400">
                          Selected time is unavailable: {selectedSlotAvailability.reason || "Choose another slot"}
                        </p>
                      )}
                    </div>
                  )}

                {!availabilityLoading &&
                  !availabilityError &&
                  form.date &&
                  slotRows.length === 0 &&
                  (!availability?.requirementsMissing || availability.requirementsMissing.length === 0) && (
                    <p className="text-xs text-slate-500">No slots found for selected date.</p>
                  )}
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Notes for Worker
              </label>
              <textarea
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                rows={3}
                placeholder="Any special instructions..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            {/* Addons / Extra Services */}
            {((query.workerId && workerPricing.extraServices?.length > 0) || (!query.workerId && addons.length > 0)) && (
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
                <h3 className="mb-3 text-sm font-medium text-white">
                  {query.workerId ? "Extra Services" : "Add-ons"}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(query.workerId ? workerPricing.extraServices : addons).map((item) => (
                    <label
                      key={item.title}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-slate-900/50 p-3 transition hover:border-fuchsia-500/30"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(item.title)}
                        onChange={() => toggleAddon(item.title)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-fuchsia-500"
                      />
                      <span className="flex-1 text-sm text-slate-300">{item.title}</span>
                      <span className="text-sm font-medium text-fuchsia-400">+₹{item.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Promo & Referral */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Promo Code</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                      placeholder="SUMMER24"
                      value={form.promoCode}
                      onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Referral Code</label>
                  <div className="relative">
                    <Gift className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                      placeholder="FRIEND10"
                      value={form.referralCode}
                      onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={checkPromo}
                  className="rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
                >
                  Validate Promo
                </button>
                {promoStatus && (
                  <p className="text-xs text-slate-400">{promoStatus}</p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
              <label className="mb-3 block text-sm font-medium text-slate-300">
                Payment Method
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-slate-900/50 p-3 transition hover:border-fuchsia-500/30">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={form.paymentMethod === "online"}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="h-4 w-4 border-slate-600 bg-slate-800 text-fuchsia-500"
                  />
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Online</span>
                </label>
                
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-slate-900/50 p-3 transition hover:border-fuchsia-500/30">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={form.paymentMethod === "wallet"}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="h-4 w-4 border-slate-600 bg-slate-800 text-fuchsia-500"
                  />
                  <Wallet className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Wallet</span>
                </label>
                
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-slate-900/50 p-3 transition hover:border-fuchsia-500/30">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={form.paymentMethod === "cod"}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="h-4 w-4 border-slate-600 bg-slate-800 text-fuchsia-500"
                  />
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Cash</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  Creating Booking...
                </span>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </form>

          {/* Price Breakdown Sidebar */}
          <aside className="space-y-4">
            <div className="sticky top-24 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <DollarSign className="h-5 w-5 text-fuchsia-400" />
                Price Breakdown
              </h2>

              {!estimated ? (
                <p className="text-sm text-slate-400">Select a service to see charges</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Base Price</span>
                    <span className="text-white">₹{estimated.base}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Visit Fee</span>
                    <span className="text-white">₹{estimated.visit}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Add-ons</span>
                    <span className="text-white">+₹{estimated.addons}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tax</span>
                    <span className="text-white">₹{estimated.tax}</span>
                  </div>
                  
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-fuchsia-400">₹{estimated.total}</span>
                    </div>
                  </div>

                  {form.promoCode && (
                    <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-center text-xs text-emerald-400">
                      Promo code applied
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 text-xs text-slate-500">
                <p className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Final price may include additional charges
                </p>
              </div>
            </div>

            {/* Quick Help */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4">
              <h3 className="mb-2 text-sm font-medium text-white">Need Help?</h3>
              <p className="text-xs text-slate-400">
                Contact support for assistance with your booking
              </p>
              <Link
                href="/support"
                className="mt-3 inline-flex items-center gap-1 text-xs text-fuchsia-400 hover:text-fuchsia-300"
              >
                Contact Support
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
