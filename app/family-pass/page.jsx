"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  MapPin,
  Clock,
  Star,
  Award,
  ChevronRight,
  Navigation,
  Filter,
  Calendar,
  TrendingUp,
  Shield,
  Heart,
  UserPlus,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function toLocalInput(date) {
  const dt = new Date(date);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export default function FamilyPassPage() {
  const [loading, setLoading] = useState(true);
  const [findingWorkers, setFindingWorkers] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [data, setData] = useState({
    allowed: false,
    activeMembership: null,
    currentPlan: null,
    me: null,
    nearbyMembers: [],
    note: "",
    priorityNote: "",
    redirectHref: "/membership?plan=FAMILY",
    error: "",
  });
  const [services, setServices] = useState([]);
  const [workerFilters, setWorkerFilters] = useState({
    serviceId: "",
    slotLocal: toLocalInput(new Date(Date.now() + 60 * 60 * 1000)),
  });
  const [nearestWorkers, setNearestWorkers] = useState([]);
  const [workerNote, setWorkerNote] = useState("");
  const [workerMode, setWorkerMode] = useState("");
  const [priorityQueueVisible, setPriorityQueueVisible] = useState(false);
  const [fasterRecommendations, setFasterRecommendations] = useState([]);

  const loadNearestWorkers = async ({ serviceId = "", slotLocal = "" } = {}) => {
    setFindingWorkers(true);
    const sp = new URLSearchParams();
    if (serviceId) sp.set("serviceId", serviceId);
    if (slotLocal) {
      const parsed = new Date(slotLocal);
      if (!Number.isNaN(parsed.getTime())) {
        sp.set("slotTime", parsed.toISOString());
      }
    }
    const res = await fetch(`/api/family-pass/nearest-workers?${sp.toString()}`, { credentials: "include" });
    const json = await res.json().catch(() => ({}));
    setFindingWorkers(false);
    if (!res.ok || !json.ok) {
      setNearestWorkers([]);
      setWorkerNote(json.error || "Failed to find nearest workers.");
      setWorkerMode("");
      setPriorityQueueVisible(false);
      setFasterRecommendations([]);
      return;
    }
    setNearestWorkers(json.workers || []);
    setWorkerNote(json.note || "");
    setWorkerMode(json.mode || "");
    setPriorityQueueVisible(Boolean(json.priorityQueueVisible));
    setFasterRecommendations(json.fasterRecommendations || []);
  };

  const useCurrentLocation = async () => {
    if (!navigator?.geolocation || savingLocation) {
      setWorkerNote("Geolocation is not supported in this browser.");
      return;
    }
    setSavingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords?.latitude);
        const lng = Number(position.coords?.longitude);
        const res = await fetch("/api/users/location", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ lat, lng }),
        });
        const json = await res.json().catch(() => ({}));
        setSavingLocation(false);
        if (!res.ok || !json.ok) {
          setWorkerNote(json.error || "Failed to save current location.");
          return;
        }
        setWorkerNote("Current location saved. Re-running nearest worker search...");
        await loadNearestWorkers(workerFilters);
      },
      (err) => {
        setSavingLocation(false);
        setWorkerNote(err?.message || "Unable to access current location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch("/api/family-pass/nearby", { credentials: "include" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        setData((prev) => ({
          ...prev,
          allowed: false,
          error: json.error || "This page is only for Family Pass members.",
          redirectHref: json.redirectHref || "/membership?plan=FAMILY",
          currentPlan: json.currentPlan || null,
        }));
        setLoading(false);
        return;
      }

      const servicesRes = await fetch("/api/services", { credentials: "include" });
      const servicesJson = await servicesRes.json().catch(() => ({}));
      setServices(servicesJson.services || []);

      setData({
        allowed: true,
        activeMembership: json.activeMembership || null,
        currentPlan: null,
        me: json.me || null,
        nearbyMembers: json.nearbyMembers || [],
        note: json.note || "",
        priorityNote: json.priorityNote || "",
        redirectHref: "/membership?plan=FAMILY",
        error: "",
      });
      await loadNearestWorkers({
        serviceId: "",
        slotLocal: workerFilters.slotLocal,
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-fuchsia-500"></div>
            <p className="mt-4 text-sm text-slate-400">Loading Family Pass...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data.allowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 sm:h-20 sm:w-20">
                <Users className="h-8 w-8 text-rose-400 sm:h-10 sm:w-10" />
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Family Pass Lounge</h1>
              <p className="mt-2 text-sm text-rose-400 sm:text-base">{data.error || "Only Family Pass members can access this page."}</p>
              
              {data.currentPlan && (
                <div className="mt-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-400">
                  Your active plan is {data.currentPlan.name || data.currentPlan.code}
                  {data.currentPlan.endsAt ? ` (valid till ${formatDate(data.currentPlan.endsAt)})` : ""}.
                </div>
              )}
              
              <p className="mt-4 text-sm text-slate-400 sm:text-base">
                Upgrade to Family Pass to unlock nearest member network and faster service priority.
              </p>
              
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={data.redirectHref}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:px-8"
                >
                  <Sparkles className="h-4 w-4" />
                  Upgrade To Family Pass
                </Link>
                <Link
                  href="/membership"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-fuchsia-400/50"
                >
                  View All Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-violet-500/10 p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
                <Award className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Family Pass Members Nearby</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Your location: {data.me?.city || "-"}, {data.me?.pincode || "-"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-400 sm:text-sm">{data.priorityNote}</p>
              <p className="text-xs text-slate-500">
                Valid till: {formatDate(data.activeMembership?.endsAt)}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/booking/new"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:px-6"
            >
              <Sparkles className="h-4 w-4" />
              Book Priority Service
            </Link>
            <Link
              href="/membership"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-fuchsia-400/50"
            >
              Membership Details
            </Link>
          </div>
        </div>

        {/* Note */}
        {data.note && (
          <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-400 sm:mb-6">
            {data.note}
          </div>
        )}

        {/* Nearest Workers Section */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-lg font-semibold text-white sm:text-xl">Nearest Workers For Fast Service</h2>
          </div>
          
          <p className="mb-4 text-xs text-slate-400 sm:text-sm">
            We rank workers by proximity + availability + rating + response speed.
          </p>

          {/* Location Button */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              onClick={useCurrentLocation}
              disabled={savingLocation}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              <Navigation className="h-4 w-4" />
              {savingLocation ? "Saving Location..." : "Use My Current Location"}
            </button>
            {workerMode && (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                Mode: {workerMode === "geo" ? "True Map Distance" : "Fallback"}
              </span>
            )}
          </div>

          {/* Filters */}
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <select
              className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white"
              value={workerFilters.serviceId}
              onChange={(e) => setWorkerFilters((prev) => ({ ...prev, serviceId: e.target.value }))}
            >
              <option value="">All services</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.title}
                </option>
              ))}
            </select>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white"
                type="datetime-local"
                value={workerFilters.slotLocal}
                onChange={(e) => setWorkerFilters((prev) => ({ ...prev, slotLocal: e.target.value }))}
              />
            </div>
            
            <button
              onClick={() => loadNearestWorkers(workerFilters)}
              disabled={findingWorkers}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${findingWorkers ? 'animate-spin' : ''}`} />
              {findingWorkers ? "Finding..." : "Find Nearest Workers"}
            </button>
          </div>

          {/* Status Messages */}
          {workerNote && (
            <div className="mb-4 rounded-lg bg-slate-800/50 p-3 text-xs text-slate-400">
              {workerNote}
            </div>
          )}

          {priorityQueueVisible && (
            <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-400">
              Family Pass priority queue is active. Lower queue position means faster assignment.
            </div>
          )}

          {/* Faster Recommendations */}
          {fasterRecommendations.length > 0 && (
            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                Faster Slot Recommendations
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {fasterRecommendations.map((row) => (
                  <div key={row.workerId} className="rounded-lg bg-slate-900/60 p-3">
                    <p className="font-semibold text-white">{row.name}</p>
                    <p className="mt-1 text-xs text-slate-400">ETA ~ {row.estimatedArrivalMinutes} min</p>
                    <p className="mt-1 text-xs text-amber-400">Queue #{row.priorityQueuePosition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workers Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nearestWorkers.map((worker) => (
              <article key={worker.workerId} className="group rounded-lg border border-white/10 bg-slate-900/40 p-4 transition hover:border-fuchsia-500/30">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-white">{worker.name}</h3>
                  <span className="rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-xs text-fuchsia-400">
                    #{worker.priorityQueuePosition}
                  </span>
                </div>
                
                <div className="mt-2 space-y-1 text-xs">
                  <p className="flex items-center gap-1 text-slate-400">
                    <MapPin className="h-3 w-3" />
                    {worker.city}, {worker.pincode} | {worker.proximity}
                  </p>
                  
                  {typeof worker.distanceKm === "number" && (
                    <p className="flex items-center gap-1 text-emerald-400">
                      <Navigation className="h-3 w-3" />
                      Distance: {worker.distanceKm} km
                    </p>
                  )}
                  
                  <p className="flex items-center gap-1 text-slate-400">
                    <Star className="h-3 w-3" />
                    Rating {worker.ratingAvg} • {worker.jobsCompleted} jobs
                  </p>
                  
                  <p className="flex items-center gap-1 text-amber-400">
                    <Clock className="h-3 w-3" />
                    Response {worker.responseTimeAvg} min • ETA {worker.estimatedArrivalMinutes} min
                  </p>
                  
                  <p className="text-xs text-fuchsia-400">Priority score: {worker.score}</p>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/booking/new?${workerFilters.serviceId ? `serviceId=${workerFilters.serviceId}&` : ""}workerId=${worker.workerId}`}
                    className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-center text-xs font-medium text-white transition hover:bg-emerald-500"
                  >
                    Book Now
                  </Link>
                  <Link
                    href={`/workers/${worker.workerId}`}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-center text-xs font-medium text-white transition hover:bg-white/10"
                  >
                    Profile
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {!workerNote && nearestWorkers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">No nearest workers found for selected filters.</p>
            </div>
          )}
        </div>

        {/* Nearby Members Section */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-lg font-semibold text-white sm:text-xl">Nearby Family Pass Members</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.nearbyMembers.map((member) => (
              <article key={member.userId} className="rounded-lg border border-white/10 bg-slate-900/40 p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <Heart className="h-4 w-4 text-fuchsia-400" />
                </div>
                
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3 w-3" />
                  {member.city || "-"}, {member.pincode || "-"}
                </p>
                
                <p className="mt-1 text-xs text-amber-400">{member.proximity}</p>
                
                <p className="mt-2 text-xs text-slate-500">
                  Family Pass till {formatDate(member.familyPassEndsAt)}
                </p>
              </article>
            ))}
          </div>

          {data.nearbyMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">No nearby Family Pass members found yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}