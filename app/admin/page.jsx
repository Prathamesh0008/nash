"use client";

import { useEffect, useState } from "react";
import AdminWorkerRow from "@/components/AdminWorkerRow";

export default function AdminPage() {
  const [workers, setWorkers] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/admin/workers", { credentials: "include" });
    const data = await res.json();
    setWorkers(data.workers || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onChangeStatus(workerUserId, status) {
    setMsg("");
    const res = await fetch(`/api/admin/workers/${workerUserId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!data.ok) return setMsg("Failed to update");
    setMsg(`Updated to ${status}`);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      {msg && <div className="text-sm text-green-700">{msg}</div>}

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Workers</h2>
        {workers.length === 0 ? (
          <div className="text-gray-600 text-sm">No workers found</div>
        ) : (
          <div className="space-y-3">
            {workers.map((w) => (
              <AdminWorkerRow key={w.workerUserId} w={w} onChangeStatus={onChangeStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
