// "use client";

// import { useEffect, useState } from "react";
// import AdminWorkerRow from "@/components/AdminWorkerRow";

// export default function AdminPage() {
//   const [workers, setWorkers] = useState([]);
//   const [msg, setMsg] = useState("");

//   async function load() {
//     const res = await fetch("/api/admin/workers", { credentials: "include" });
//     const data = await res.json();
//     setWorkers(data.workers || []);
//   }

//   useEffect(() => {
//     load();
//   }, []);

//   async function onChangeStatus(workerUserId, status) {
//     setMsg("");
//     const res = await fetch(`/api/admin/workers/${workerUserId}/status`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ status }),
//     });
//     const data = await res.json();
//     if (!data.ok) return setMsg("Failed to update");
//     setMsg(`Updated to ${status}`);
//     load();
//   }

//   return (
//     <div className="space-y-4">
//       <h1 className="text-2xl font-bold">Admin Panel</h1>
//       {msg && <div className="text-sm text-green-700">{msg}</div>}

//       <div className="bg-white border rounded-xl p-4 space-y-3">
//         <h2 className="font-semibold">Workers</h2>
//         {workers.length === 0 ? (
//           <div className="text-gray-600 text-sm">No workers found</div>
//         ) : (
//           <div className="space-y-3">
//             {workers.map((w) => (
//               <AdminWorkerRow key={w.workerUserId} w={w} onChangeStatus={onChangeStatus} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import AdminWorkerRow from "@/components/AdminWorkerRow";

export default function AdminPage() {
  const [workers, setWorkers] = useState([]);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/workers", { credentials: "include" });
      const data = await res.json();
      setWorkers(data.workers || []);
    } finally {
      setIsLoading(false);
    }
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
    if (!data.ok) return setMsg("Failed to update worker status");
    setMsg(`Worker status updated to ${status}`);
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-1">Manage worker accounts and permissions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={load}
              disabled={isLoading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <div className="text-sm text-gray-500">
              {workers.length} worker{workers.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Status Message */}
        {msg && (
          <div
            className={`p-4 rounded-lg border ${
              msg.includes("Failed")
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            <div className="flex items-center">
              {msg.includes("Failed") ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{msg}</span>
            </div>
          </div>
        )}

        {/* Workers Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Workers</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Manage worker accounts and their status
                </p>
              </div>
              {isLoading && workers.length === 0 && (
                <div className="text-sm text-gray-500">Loading...</div>
              )}
            </div>
          </div>

          <div className="p-6">
            {workers.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workers found</h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  There are currently no worker accounts in the system.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Table Header (Optional, if AdminWorkerRow shows multiple fields) */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 pb-3 px-4 text-sm font-medium text-gray-600">
                  <div className="md:col-span-4">Worker Information</div>
                  <div className="md:col-span-3">Account Details</div>
                  <div className="md:col-span-3">Status</div>
                  <div className="md:col-span-2 text-right">Actions</div>
                </div>
                
                {workers.map((w) => (
                  <AdminWorkerRow key={w.workerUserId} w={w} onChangeStatus={onChangeStatus} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}