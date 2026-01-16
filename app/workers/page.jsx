"use client";

import { useEffect, useState } from "react";
import WorkerCard from "@/components/WorkerCard";

export default function HomePage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/workers/active");
      const data = await res.json();
      setWorkers(data.workers || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Find Home Service Workers</h1>

      {loading ? (
        <div>Loading workers...</div>
      ) : workers.length === 0 ? (
        <div className="text-gray-600">No active workers yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((w) => (
            <WorkerCard key={w.id} w={w} />
          ))}
        </div>
      )}
    </div>
  );
}
