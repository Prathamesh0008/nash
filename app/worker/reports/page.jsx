"use client";

import { useEffect, useState } from "react";

export default function WorkerReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/reports/me", { credentials: "include" });
      const data = await res.json();
      setReports(data.reports || []);
    };
    load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Worker Reports</h1>
        <p className="text-sm text-slate-400">Reports where you are reporter or target.</p>
      </div>

      <div className="space-y-2">
        {reports.map((report) => (
          <div key={report._id} className="panel text-sm">
            <p>Booking: {report.bookingId?.slice(-6)} | Category: {report.category}</p>
            <p>Status: {report.status} | Admin action: {report.adminAction || "pending"}</p>
            <p className="text-slate-400">{report.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}