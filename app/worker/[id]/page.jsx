"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function WorkerProfilePage({ params }) {
  const router = useRouter();
  const { user } = useAuth();

  // ✅ REQUIRED IN NEXT 15
  const { id: workerId } = use(params);

  const [worker, setWorker] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!workerId) return;

    async function load() {
      const res = await fetch(`/api/workers/${workerId}`);
      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Worker not found");
        return;
      }

      setWorker(data.worker);
    }

    load();
  }, [workerId]);

  async function startChat() {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "user") {
      setError("Only users can start chat");
      return;
    }

    const res = await fetch("/api/chat/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ workerUserId: worker.id }),
    });

    const data = await res.json();
    if (!data.ok) {
      setError(data.error || "Failed to start chat");
      return;
    }

    router.push(`/chat/${data.conversationId}`);
  }

  if (error) return <div className="text-red-600">{error}</div>;
  if (!worker) return <div>Loading worker profile...</div>;

  return (
    <div className="bg-white border rounded-xl p-6">
      <div className="flex gap-4">
        <img
          src={worker.photoUrl || "/workers/default.png"}
          alt={worker.name}
          className="w-28 h-28 rounded-xl object-cover border"
        />

        <div>
          <h1 className="text-2xl font-bold">{worker.name}</h1>
          <div className="text-gray-600">{worker.city}</div>

          <div className="mt-2 text-sm">
            <b>Services:</b> {worker.services.join(", ")}
          </div>

          <div className="text-sm">
            <b>Availability:</b> {worker.availability}
          </div>

          <div className="mt-2 text-sm text-gray-700">
            ⭐ {worker.ratingAvg} ({worker.ratingCount})
          </div>

          <button
            onClick={startChat}
            className="mt-4 px-4 py-2 bg-black text-white rounded"
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
}
