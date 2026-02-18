"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function FavoritesPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const prefRes = await fetch("/api/users/preferences", { credentials: "include" });
      const prefData = await prefRes.json().catch(() => ({}));
      if (!prefRes.ok || !prefData.ok) {
        setMsg(prefData.error || "Failed to load favorites");
        setLoading(false);
        return;
      }

      const ids = (prefData.preferences?.favoriteWorkerIds || []).map((id) => String(id)).filter(Boolean);
      if (ids.length === 0) {
        setWorkers([]);
        setLoading(false);
        return;
      }

      const workersRes = await fetch(`/api/workers?ids=${ids.join(",")}`, { credentials: "include" });
      const workersData = await workersRes.json().catch(() => ({}));
      if (!workersRes.ok || !workersData.ok) {
        setMsg(workersData.error || "Failed to load worker details");
        setLoading(false);
        return;
      }
      setWorkers(workersData.workers || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Favorite Workers</h1>
        <p className="text-sm text-slate-400">Quick access to workers you saved.</p>
      </div>

      {loading && <p className="text-slate-400">Loading favorites...</p>}
      {msg && <p className="rounded bg-rose-950 p-2 text-sm text-rose-300">{msg}</p>}

      {!loading && !msg && workers.length === 0 && (
        <p className="rounded bg-slate-900/40 p-3 text-sm text-slate-400">No favorites yet. Add from worker profile.</p>
      )}

      <div className="grid-auto">
        {workers.map((worker) => (
          <article key={worker.id} className="panel space-y-2">
            <h2 className="font-semibold">{worker.name}</h2>
            <p className="text-sm text-slate-400">Rating {Number(worker.ratingAvg || 0).toFixed(1)} | Jobs {worker.jobsCompleted || 0}</p>
            <p className="text-sm text-slate-400">Areas: {(worker.serviceAreas || []).map((a) => `${a.city}-${a.pincode}`).join(", ")}</p>
            <div className="flex gap-2">
              <Link href={`/workers/${worker.id}`} className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Profile</Link>
              <Link href={`/booking/new?workerId=${worker.id}`} className="rounded bg-sky-700 px-3 py-2 text-sm text-white hover:bg-sky-600">Book</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
