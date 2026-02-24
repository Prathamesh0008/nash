"use client";

import { useEffect, useState } from "react";

export default function WorkerPayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [earningSummary, setEarningSummary] = useState(null);
  const [amount, setAmount] = useState("1000");
  const [note, setNote] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [payoutRes, meRes] = await Promise.all([
      fetch("/api/admin/payouts", { credentials: "include" }),
      fetch("/api/auth/me", { credentials: "include" }),
    ]);
    const [payoutData, meData] = await Promise.all([payoutRes.json(), meRes.json()]);
    setPayouts(payoutData.payouts || []);
    setSummary(payoutData.summary || null);
    setEarningSummary(payoutData.earningSummary || null);
    setWalletBalance(Number(meData?.user?.workerProfile?.payoutWalletBalance || 0));
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const requestPayout = async () => {
    const res = await fetch("/api/admin/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount: Number(amount), note }),
    });
    const data = await res.json();
    setMsg(data.ok ? "Payout requested" : data.error || "Request failed");
    if (data.ok) {
      setNote("");
      await load();
    }
  };

  return (
    <section className="space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Payout Requests</h1>
        <p className="text-sm text-slate-400">Available payout wallet: INR {walletBalance}</p>
      </div>

      <div className="grid-auto">
        <div className="panel"><p className="text-sm text-slate-400">Requested</p><p className="text-2xl font-semibold">{summary?.counts?.requested || 0}</p></div>
        <div className="panel"><p className="text-sm text-slate-400">Approved</p><p className="text-2xl font-semibold">{summary?.counts?.approved || 0}</p></div>
        <div className="panel"><p className="text-sm text-slate-400">Paid</p><p className="text-2xl font-semibold">{summary?.counts?.paid || 0}</p></div>
        <div className="panel"><p className="text-sm text-slate-400">Rejected</p><p className="text-2xl font-semibold">{summary?.counts?.rejected || 0}</p></div>
      </div>

      <div className="grid-auto">
        <div className="panel"><p className="text-sm text-slate-400">Completed Jobs</p><p className="text-2xl font-semibold">{earningSummary?.totalCompletedJobs || 0}</p></div>
        <div className="panel"><p className="text-sm text-slate-400">Gross Earnings</p><p className="text-2xl font-semibold">INR {earningSummary?.grossAmount || 0}</p></div>
        <div className="panel"><p className="text-sm text-slate-400">Platform Fee</p><p className="text-2xl font-semibold">INR {earningSummary?.platformFee || 0}</p></div>
        <div className="panel"><p className="text-sm text-slate-400">Net Credited</p><p className="text-2xl font-semibold">INR {earningSummary?.netAmount || 0}</p></div>
      </div>

      <div className="panel flex flex-wrap gap-2">
        <input className="rounded border border-slate-700 bg-slate-900 p-2" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
        <input className="min-w-72 flex-1 rounded border border-slate-700 bg-slate-900 p-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note (UPI/bank details)" />
        <button onClick={requestPayout} className="rounded bg-sky-700 px-3 py-2 text-white hover:bg-sky-600">Request Payout</button>
        {msg && <p className="text-sm text-slate-300">{msg}</p>}
      </div>

      <div className="panel space-y-2">
        {loading && <p className="text-sm text-slate-400">Loading payouts...</p>}
        {payouts.map((payout) => (
          <div key={payout._id} className="rounded border border-slate-700 p-2 text-sm">
            <p>INR {payout.amount} - {payout.status.toUpperCase()}</p>
            {payout.bankRef && <p className="text-slate-400">Bank Ref: {payout.bankRef}</p>}
            {payout.note && <p className="text-slate-400">Note: {payout.note}</p>}
            <p className="text-slate-400">Requested: {new Date(payout.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
