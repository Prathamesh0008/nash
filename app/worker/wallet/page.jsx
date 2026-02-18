"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function WorkerWalletPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setProfile(data?.user?.workerProfile || null);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Worker Wallet</h1>
        <p className="text-sm text-slate-400">Track payout wallet and request withdrawals.</p>
      </div>

      <div className="grid-auto">
        <div className="panel">
          <p className="text-sm text-slate-400">Payout Wallet Balance</p>
          <p className="text-2xl font-semibold">
            {loading ? "Loading..." : `INR ${Number(profile?.payoutWalletBalance || 0)}`}
          </p>
        </div>
        <div className="panel">
          <p className="text-sm text-slate-400">Total Earnings</p>
          <p className="text-2xl font-semibold">
            {loading ? "Loading..." : `INR ${Number(profile?.totalEarnings || 0)}`}
          </p>
        </div>
      </div>

      <div className="panel flex gap-2">
        <Link href="/worker/payouts" className="rounded bg-sky-700 px-3 py-2 text-white hover:bg-sky-600">
          Manage Payouts
        </Link>
        <Link href="/wallet" className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700">
          Open User Wallet
        </Link>
      </div>
    </section>
  );
}
