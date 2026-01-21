"use client";

import { useEffect, useState } from "react";
import WorkerCard from "@/components/WorkerCard";
import Filters from "@/components/Filters";

export default function HomePage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);

  // 🎛 FILTER STATE (USED BY Filters.jsx)
  const [filters, setFilters] = useState({
    q: "",
    city: "",
    service: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
    emergency: false,
    sort: "",
  });

  /* ---------------- LOAD WORKERS (DEBOUNCED) ---------------- */
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [filters]);

  async function load() {
    setTyping(true);
    setLoading(true);

    const params = new URLSearchParams({
      q: filters.q,
      city: filters.city,
      service: filters.service,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      rating: filters.rating,
      emergency: filters.emergency ? "1" : "",
      sort: filters.sort,
    });

    const res = await fetch(`/api/workers/active?${params.toString()}`, {
      cache: "no-store",
    });

    const data = await res.json();
    setWorkers(data.workers || []);
    setLoading(false);
    setTyping(false);
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      {/* ================= FILTER SIDEBAR ================= */}
      <Filters filters={filters} setFilters={setFilters} />

      {/* ================= RESULTS ================= */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Find Home Service Workers</h1>

        {typing && (
          <div className="text-sm text-gray-500">Searching…</div>
        )}

        {loading ? (
          <div>Loading workers...</div>
        ) : workers.length === 0 ? (
          <div className="text-gray-600">No matching workers found.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map((w) => (
              <WorkerCard
                key={w.id || w.userId || w._id}
                w={w}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
