"use client";

import { useEffect, useState } from "react";

export default function WalletPage() {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [amount, setAmount] = useState("500");
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch("/api/wallet", { credentials: "include" });
    const data = await res.json();
    if (data.ok) setWallet(data.wallet);
  };

  useEffect(() => {
    load();
  }, []);

  const topup = async () => {
    const res = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount: Number(amount) }),
    });
    const data = await res.json();
    setMsg(data.ok ? "Wallet topped up" : data.error || "Top-up failed");
    if (data.ok) load();
  };

  return (
    <section className="space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Wallet</h1>
        <p className="text-sm text-slate-400">Balance: INR {wallet.balance || 0}</p>
      </div>

      <div className="panel flex flex-wrap items-center gap-2">
        <input className="rounded border border-slate-700 bg-slate-900 p-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button onClick={topup} className="rounded bg-sky-700 px-3 py-2 text-white hover:bg-sky-600">Demo Top-up</button>
        {msg && <p className="text-sm text-slate-300">{msg}</p>}
      </div>

      <div className="panel">
        <h2 className="mb-2 text-lg font-semibold">Transactions</h2>
        <div className="space-y-2">
          {(wallet.transactions || []).map((txn) => (
            <div key={txn._id} className="rounded border border-slate-700 p-2 text-sm">
              {txn.direction.toUpperCase()} INR {txn.amount} - {txn.reason} - Balance {txn.balanceAfter}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}