"use client";

export default function AdminWorkerRow({ w, onChangeStatus }) {
  return (
    <div className="border rounded p-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
      <div>
        <div className="font-semibold">{w.name || "(no name)"}</div>
        <div className="text-sm text-gray-600">{w.email}</div>
        <div className="text-sm">City: {w.city || "-"}</div>
        <div className="text-sm">Services: {w.services?.join(", ") || "-"}</div>
        <div className="text-sm"><b>Status:</b> {w.status}</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onChangeStatus(w.workerUserId, "active")}
          className="px-3 py-2 rounded bg-green-600 text-white"
        >
          Approve
        </button>
        <button
          onClick={() => onChangeStatus(w.workerUserId, "rejected")}
          className="px-3 py-2 rounded bg-red-600 text-white"
        >
          Reject
        </button>
        <button
          onClick={() => onChangeStatus(w.workerUserId, "pending")}
          className="px-3 py-2 rounded bg-yellow-500 text-white"
        >
          Pending
        </button>
      </div>
    </div>
  );
}
