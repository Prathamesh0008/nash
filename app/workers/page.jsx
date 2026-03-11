"use client";

import Image from "next/image";
import Link from "next/link";
import { LocateFixed, MapPin, RefreshCw, Search, Star, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

function WorkerCard({ worker }) {
  const photo = worker.profilePhoto || worker.galleryPhotos?.[0] || "";
  const rating = Number(worker.ratingAvg || 0);
  const jobsCompleted = Number(worker.jobsCompleted || 0);
  const areas = [...new Set((worker.serviceAreas || []).map((area) => area.city).filter(Boolean))];
  const skills = (escort.skills || []).filter(Boolean);

  return (
    <article className="panel flex h-full flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        {photo ? (
          <Image
            src={photo}
            alt={worker.name || "Escort"}
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 rounded-xl border border-white/15 object-cover"
          />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-xl border border-white/15 bg-slate-900/70 text-lg font-semibold text-slate-200">
            {(worker.name || "W").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-100">{worker.name || "Escort"}</h3>
            {worker.isBoosted && (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                Priority
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-300" />
              {rating.toFixed(1)}
            </span>
            <span>{jobsCompleted} sessions</span>
            <span className="text-emerald-300">Online</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p className="line-clamp-2 text-slate-300">
          {skills.length ? skills.join(", ") : "Verified companionship support available."}
        </p>
        <p className="flex items-start gap-1 text-xs text-slate-400">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">
            {areas.length ? areas.join(", ") : "Area details will be shared after booking confirmation."}
          </span>
        </p>
        {typeof worker.distanceKm === "number" && (
          <p className="text-xs text-emerald-300">
            Nearby: {worker.distanceKm.toFixed(1)} km
          </p>
        )}
      </div>

      <div className="mt-auto flex gap-2 pt-1">
        <Link href={`/workers/${worker.id}`} className="flex-1 rounded-lg app-btn-secondary px-3 py-2 text-center text-sm font-medium">
          View Profile
        </Link>
        <Link href={`/booking/new?workerId=${worker.id}`} className="flex-1 rounded-lg app-btn-primary px-3 py-2 text-center text-sm font-medium">
          Book Now
        </Link>
      </div>
    </article>
  );
}

export default function WorkersPage() {
  const DEFAULT_NEARBY_RADIUS_KM = 25;
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const requestUserLocation = () =>
    new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setLocationError("Location access is not supported in this browser.");
        resolve(null);
        return;
      }
      setLocationLoading(true);
      setLocationError("");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: Number(position.coords.latitude),
            lng: Number(position.coords.longitude),
          };
          setUserLocation(coords);
          setLocationLoading(false);
          resolve(coords);
        },
        (geoError) => {
          const message =
            geoError?.code === 1
              ? "Location permission denied. Allow location to use Nearby filter."
              : geoError?.code === 2
                ? "Unable to detect your location right now."
                : "Location request timed out. Try again.";
          setLocationError(message);
          setLocationLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
      );
    });

  const loadWorkers = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");
      if (nearbyOnly && !(userLocation?.lat && userLocation?.lng)) {
        setError("Enable location access to use Nearby filter.");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const sp = new URLSearchParams();
      if (userLocation?.lat && userLocation?.lng) {
        sp.set("lat", String(userLocation.lat));
        sp.set("lng", String(userLocation.lng));
      }
      if (nearbyOnly) {
        sp.set("nearby", "1");
        sp.set("maxDistanceKm", String(DEFAULT_NEARBY_RADIUS_KM));
      }
      if (sortBy === "nearby" && userLocation?.lat && userLocation?.lng) {
        sp.set("sort", "nearby");
      }
      const qs = sp.toString();
      const res = await fetch(`/api/workers${qs ? `?${qs}` : ""}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Failed to load escorts.");
        return;
      }
      setWorkers(Array.isArray(data.workers) ? data.workers : []);
    } catch {
      setError("Network error while loading escorts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [DEFAULT_NEARBY_RADIUS_KM, nearbyOnly, sortBy, userLocation?.lat, userLocation?.lng]);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  const cityOptions = useMemo(() => {
    const unique = new Set();
    for (const worker of workers) {
      for (const area of worker.serviceAreas || []) {
        if (area?.city) unique.add(String(area.city).trim());
      }
    }
    return ["all", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const rows = workers.filter((worker) => {
      if (priorityOnly && !worker.isBoosted) return false;
      if (nearbyOnly) {
        if (typeof worker.distanceKm !== "number") return false;
        if (worker.distanceKm > DEFAULT_NEARBY_RADIUS_KM) return false;
      }

      if (selectedCity !== "all") {
        const hasCity = (worker.serviceAreas || []).some(
          (area) => String(area?.city || "").toLowerCase() === selectedCity.toLowerCase()
        );
        if (!hasCity) return false;
      }

      if (!q) return true;

      const indexable = [
        worker.name,
        ...(worker.skills || []),
        ...(worker.categories || []),
        ...(worker.serviceAreas || []).map((area) => `${area?.city || ""} ${area?.pincode || ""}`),
      ]
        .join(" ")
        .toLowerCase();

      return indexable.includes(q);
    });

    rows.sort((a, b) => {
      if (sortBy === "nearby") {
        const aHas = typeof a.distanceKm === "number";
        const bHas = typeof b.distanceKm === "number";
        if (aHas !== bHas) return aHas ? -1 : 1;
        if (aHas && bHas && a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
        return Number(b.ratingAvg || 0) - Number(a.ratingAvg || 0);
      }
      if (sortBy === "rating") return Number(b.ratingAvg || 0) - Number(a.ratingAvg || 0);
      if (sortBy === "jobs") return Number(b.jobsCompleted || 0) - Number(a.jobsCompleted || 0);
      if (sortBy === "name") return String(a.name || "").localeCompare(String(b.name || ""));
      if (a.isBoosted !== b.isBoosted) return a.isBoosted ? -1 : 1;
      if (Number(a.boostScore || 0) !== Number(b.boostScore || 0)) {
        return Number(b.boostScore || 0) - Number(a.boostScore || 0);
      }
      if (Number(a.ratingAvg || 0) !== Number(b.ratingAvg || 0)) {
        return Number(b.ratingAvg || 0) - Number(a.ratingAvg || 0);
      }
      return Number(b.jobsCompleted || 0) - Number(a.jobsCompleted || 0);
    });

    return rows;
  }, [DEFAULT_NEARBY_RADIUS_KM, workers, searchQuery, selectedCity, sortBy, priorityOnly, nearbyOnly]);

  const totalWorkers = workers.length;
  const priorityWorkers = workers.filter((worker) => worker.isBoosted).length;
  const nearbyWorkers = workers.filter(
    (worker) => typeof escort.distanceKm === "number" && escort.distanceKm <= DEFAULT_NEARBY_RADIUS_KM
  ).length;
  const averageRating =
    workers.length > 0
      ? (workers.reduce((sum, worker) => sum + Number(escort.ratingAvg || 0), 0) / escorts.length).toFixed(1)
      : "0.0";

  return (
    <section className="space-y-4 pb-2">
      <div className="panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Escorts</h1>
            <p className="text-sm text-slate-400">
              Explore verified escorts. Booking requests are open anytime.
            </p>
          </div>
          <button
            onClick={() => loadWorkers({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg app-btn-secondary px-3 py-2 text-sm font-medium disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => requestUserLocation()}
            disabled={locationLoading}
            className="inline-flex items-center gap-2 rounded-lg app-btn-secondary px-3 py-2 text-xs font-medium disabled:opacity-60"
          >
            <LocateFixed className={`h-4 w-4 ${locationLoading ? "animate-spin" : ""}`} />
            {userLocation ? "Update My Location" : "Use My Location"}
          </button>
          {userLocation && (
            <span className="text-xs text-emerald-300">Location enabled</span>
          )}
          {!userLocation && <span className="text-xs text-slate-400">Enable location for nearby escorts.</span>}
          {locationError && <span className="text-xs text-rose-300">{locationError}</span>}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
            <p className="text-xs text-slate-400">Online Escorts</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{totalWorkers}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
            <p className="text-xs text-slate-400">Priority Escorts</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xl font-semibold text-amber-200">
              <Zap className="h-4 w-4" />
              {priorityWorkers}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
            <p className="text-xs text-slate-400">Average Rating</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{averageRating}</p>
          </div>
        </div>
        {userLocation && (
          <p className="mt-2 text-xs text-slate-400">
            Nearby in {DEFAULT_NEARBY_RADIUS_KM} km: <span className="text-emerald-300">{nearbyWorkers}</span>
          </p>
        )}
      </div>

      <div className="panel space-y-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, area, specialty..."
              className="h-11 w-full rounded-lg border border-white/15 bg-slate-950/60 pl-9 pr-3 text-sm text-slate-100"
            />
          </label>

          <select
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value)}
            className="h-11 rounded-lg border border-white/15 bg-slate-950/60 px-3 text-sm text-slate-100"
          >
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city === "all" ? "All Areas" : city}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-11 rounded-lg border border-white/15 bg-slate-950/60 px-3 text-sm text-slate-100"
          >
            <option value="recommended">Recommended</option>
            <option value="nearby" disabled={!userLocation}>Nearby</option>
            <option value="rating">Top Rating</option>
            <option value="jobs">Most Jobs</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={priorityOnly}
              onChange={(event) => setPriorityOnly(event.target.checked)}
              className="h-4 w-4 rounded border border-white/20 bg-slate-950/70"
            />
            Show priority escorts only
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={nearbyOnly}
              onChange={async (event) => {
                const checked = event.target.checked;
                if (!checked) {
                  setNearbyOnly(false);
                  return;
                }
                if (!userLocation) {
                  const coords = await requestUserLocation();
                  if (!coords) return;
                }
                setNearbyOnly(true);
              }}
              className="h-4 w-4 rounded border border-white/20 bg-slate-950/70"
            />
            Nearby only ({DEFAULT_NEARBY_RADIUS_KM} km)
          </label>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCity("all");
              setSortBy("recommended");
              setPriorityOnly(false);
              setNearbyOnly(false);
            }}
            className="rounded-lg app-btn-secondary px-3 py-2 text-xs font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="panel h-48 animate-pulse rounded-2xl border-white/10 bg-slate-900/40" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="panel border-rose-500/30 bg-rose-950/20 text-sm text-rose-200">
          <p>{error}</p>
          <button onClick={() => loadWorkers()} className="mt-3 rounded-lg app-btn-secondary px-3 py-2 text-xs font-medium">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filteredWorkers.length === 0 && (
        <div className="panel text-center text-sm text-slate-300">
          No escorts match these filters right now.
        </div>
      )}

      {!loading && !error && filteredWorkers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredWorkers.map((worker) => (
            <WorkerCard key={String(worker.id)} worker={worker} />
          ))}
        </div>
      )}
    </section>
  );
}
