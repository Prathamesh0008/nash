"use client";

import { useEffect, useState } from "react";
import WorkerCard from "@/components/WorkerCard";
import Filters from "@/components/Filters";


export default function MensPage() {
  const [filters, setFilters] = useState({
    city: "",
    service: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
    emergency: false,
    sort: "",
  });

  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    load();
  }, [filters]);

  async function load() {
    const params = new URLSearchParams({
      gender: "male",
      ...filters,
      emergency: filters.emergency ? "true" : "",
    });

    const res = await fetch(`/api/workers?${params.toString()}`);
    const data = await res.json();
    if (data.ok) setWorkers(data.workers);
  }

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* FILTERS */}
      <Filters filters={filters} setFilters={setFilters} />

      {/* WORKERS */}
      <div className="md:col-span-3 space-y-4">
        {workers.map((w) => (
          <WorkerCard key={w.id} w={w} />
        ))}
      </div>
    </div>
  );
}
