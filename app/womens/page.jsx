"use client";

import { useEffect, useState } from "react";
import WorkerCard from "@/components/WorkerCard";

export default function WomensPage() {
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    fetch("/api/workers/by-gender/female", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.ok && setWorkers(d.workers));
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Women Workers</h1>

      {workers.length === 0 ? (
        <div className="text-gray-500">No workers found</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {workers.map((w) => (
            <WorkerCard  key={w.id}  w={w} />
          ))}
        </div>
      )}
    </main>
  );
}
