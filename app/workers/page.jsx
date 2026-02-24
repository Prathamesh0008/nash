"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, RefreshCw, Search, Star, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function WorkerCard({ worker }) {
  const photo = worker.profilePhoto || worker.galleryPhotos?.[0] || "";
  const rating = Number(worker.ratingAvg || 0);
  const jobsCompleted = Number(worker.jobsCompleted || 0);
  const areas = [...new Set((worker.serviceAreas || []).map((area) => area.city).filter(Boolean))];
  const skills = (worker.skills || []).filter(Boolean);

  return (
    <article className="panel flex h-full flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        {photo ? (
          <Image
            src={photo}
            alt={worker.name || "Worker"}
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
            <h3 className="truncate text-base font-semibold text-slate-100">{worker.name || "Worker"}</h3>
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
            <span>{jobsCompleted} jobs</span>
            <span className="text-emerald-300">Online</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p className="line-clamp-2 text-slate-300">
          {skills.length ? skills.join(", ") : "All-round worker support available."}
        </p>
        <p className="flex items-start gap-1 text-xs text-slate-400">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">
            {areas.length ? areas.join(", ") : "Area details will be shared after booking confirmation."}
          </span>
        </p>
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
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [priorityOnly, setPriorityOnly] = useState(false);

  const loadWorkers = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");
      const res = await fetch("/api/workers", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Failed to load workers.");
        return;
      }
      setWorkers(Array.isArray(data.workers) ? data.workers : []);
    } catch {
      setError("Network error while loading workers.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

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
  }, [workers, searchQuery, selectedCity, sortBy, priorityOnly]);

  const totalWorkers = workers.length;
  const priorityWorkers = workers.filter((worker) => worker.isBoosted).length;
  const averageRating =
    workers.length > 0
      ? (workers.reduce((sum, worker) => sum + Number(worker.ratingAvg || 0), 0) / workers.length).toFixed(1)
      : "0.0";

  return (
    <section className="space-y-4 pb-2">
      <div className="panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Workers</h1>
            <p className="text-sm text-slate-400">
              Explore verified all-round workers. Booking requests are open anytime.
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

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
            <p className="text-xs text-slate-400">Online Workers</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{totalWorkers}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
            <p className="text-xs text-slate-400">Priority Workers</p>
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
      </div>

      <div className="panel space-y-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, area, skill..."
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
            Show priority workers only
          </label>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCity("all");
              setSortBy("recommended");
              setPriorityOnly(false);
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
          No workers match these filters right now.
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
