"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export default function WorkerDashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/workers/my", { credentials: "include" });
      const data = await res.json();
      setProfile(data.profile || null);
    }
    load();
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="bg-white border rounded-xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Worker Dashboard</h1>
        <StatusBadge status={profile.status} />
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <div className="border rounded p-3">
          <div className="text-sm text-gray-500">City</div>
          <div className="font-semibold">{profile.city || "-"}</div>
        </div>

        <div className="border rounded p-3">
          <div className="text-sm text-gray-500">Availability</div>
          <div className="font-semibold">{profile.availability || "-"}</div>
        </div>

        <div className="border rounded p-3 sm:col-span-2">
          <div className="text-sm text-gray-500">Services</div>
          <div className="font-semibold">{profile.services?.join(", ") || "-"}</div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        Tip: Only <b>active</b> workers show on the Home page.
      </div>

      <div className="mt-4">
        <Link className="px-3 py-2 rounded bg-gray-100 inline-block" href="/worker/onboarding">
          Edit / Re-submit Onboarding
        </Link>
      </div>
    </div>
  );
}
