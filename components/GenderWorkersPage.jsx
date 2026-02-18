"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";

function WorkerGenderCard({ worker }) {
  return (
    <Link
      href={`/workers/${worker.id}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-[#090b12] transition hover:border-fuchsia-500/60"
    >
      <div className="relative h-48 bg-slate-900">
        {worker.profilePhoto ? (
          <Image src={worker.profilePhoto} alt={worker.name} fill className="object-cover transition duration-500 group-hover:scale-105" unoptimized />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(120deg,#1e293b_0%,#4c1d95_45%,#0f172a_100%)]" />
        )}
        <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-emerald-300">
          {worker.isOnline ? "Online" : "Offline"}
        </div>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-white">{worker.name}</p>
          <span className="text-xs text-slate-400">{worker.gender || "other"}</span>
        </div>
        <div className="text-xs text-slate-400">
          <MapPin className="mr-1 inline h-3.5 w-3.5" />
          Service worker
        </div>
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>
            <Star className="mr-1 inline h-3 w-3 text-yellow-400" />
            {Number(worker.ratingAvg || 0).toFixed(1)}
          </span>
          <span>{worker.jobsCompleted || 0}+ jobs</span>
        </div>
      </div>
    </Link>
  );
}

export default function GenderWorkersPage({ gender, title, subtitle }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/workers/by-gender/${gender}`);
        const data = await res.json();
        if (!data.ok) {
          setError(data.error || "Failed to load workers");
          setLoading(false);
          return;
        }
        setWorkers(data.workers || []);
      } catch {
        setError("Failed to load workers");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [gender]);

  return (
    <section className="space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading {title.toLowerCase()}...</p>}
      {!!error && <p className="rounded-lg bg-rose-950 p-3 text-sm text-rose-200">{error}</p>}
      {!loading && !error && workers.length === 0 && (
        <div className="panel">
          <p className="text-sm text-slate-300">No workers found in this category yet.</p>
          <Link href="/workers" className="app-btn-secondary mt-3 inline-block rounded-lg px-3 py-2 text-sm font-medium">
            Browse All Workers
          </Link>
        </div>
      )}

      {!!workers.length && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workers.map((worker) => (
            <WorkerGenderCard key={worker.id} worker={worker} />
          ))}
        </div>
      )}
    </section>
  );
}
