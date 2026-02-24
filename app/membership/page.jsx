"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase();
}

export default function MembershipPage() {
  const [data, setData] = useState({ activeMembership: null, plans: [], memberships: [] });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [buyingPlanId, setBuyingPlanId] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/membership/me", { credentials: "include" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      setMsg(json.error || "Failed to load membership data");
      setLoading(false);
      return;
    }
    setData({
      activeMembership: json.activeMembership || null,
      plans: json.plans || [],
      memberships: json.memberships || [],
    });
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const active = data.activeMembership;
  const activeCode = normalizeCode(active?.planSnapshot?.code);
  const activeSortOrder = useMemo(() => {
    if (!activeCode) return null;
    const match = (data.plans || []).find((row) => normalizeCode(row?.code) === activeCode);
    return match ? Number(match.sortOrder || 0) : 0;
  }, [activeCode, data.plans]);
  const activeRemaining = useMemo(() => {
    if (!active?.planSnapshot) return null;
    const cap = Number(active.planSnapshot.maxTotalDiscount || 0);
    if (cap <= 0) return "Unlimited";
    return Math.max(0, cap - Number(active.discountUsed || 0));
  }, [active]);

  const buyPlan = async (planId) => {
    if (!planId || buyingPlanId) return;
    setBuyingPlanId(planId);
    const res = await fetch("/api/membership/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ planId, paymentMethod }),
    });
    const json = await res.json().catch(() => ({}));
    setBuyingPlanId("");
    setMsg(json.ok ? "Membership activated successfully" : json.error || "Failed to activate membership");
    if (json.ok) await load();
  };

  return (
    <section className="space-y-4">
      <div className="panel bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <h1 className="text-2xl font-semibold">Membership Plans</h1>
        <p className="text-sm text-slate-400">Buy once, use till expiry, then renew manually. Upgrade to higher plan anytime.</p>
        {msg && <p className="mt-2 text-sm text-slate-300">{msg}</p>}
      </div>

      {active ? (
        <div className="panel space-y-2 border-emerald-500/30">
          <h2 className="font-semibold">Active Membership</h2>
          <p className="text-sm">{active.planSnapshot?.name} ({active.planSnapshot?.code})</p>
          <p className="text-xs text-slate-400">Valid: {formatDate(active.startedAt)} - {formatDate(active.endsAt)}</p>
          <p className="text-xs text-slate-400">
            Savings used: INR {Number(active.discountUsed || 0)} | Remaining cap: {typeof activeRemaining === "number" ? `INR ${activeRemaining}` : activeRemaining}
          </p>
          {String(active.planSnapshot?.code || "").toUpperCase() === "FAMILY" && (
            <Link href="/family-pass" className="inline-block rounded bg-amber-700 px-3 py-2 text-sm text-white hover:bg-amber-600">
              Open Family Pass Members Page
            </Link>
          )}
        </div>
      ) : (
        <p className="panel text-sm text-slate-400">No active membership.</p>
      )}

      <div className="panel flex flex-wrap items-center gap-2">
        <label className="text-sm text-slate-300">Payment method</label>
        <select
          className="rounded border border-slate-700 bg-slate-900 p-2 text-sm"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="online">Online</option>
          <option value="wallet">Wallet</option>
        </select>
        {active && <p className="text-xs text-slate-400">You can upgrade only to a higher plan.</p>}
      </div>

      {loading && <p className="text-slate-400">Loading plans...</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {data.plans.map((plan) => {
          const planCode = normalizeCode(plan?.code);
          const planSort = Number(plan?.sortOrder || 0);
          const isSamePlan = Boolean(activeCode) && activeCode === planCode;
          const isUpgradeAllowed = Boolean(active) && !isSamePlan && planSort > Number(activeSortOrder ?? 0);
          const isBlockedByActive = Boolean(active) && !isSamePlan && !isUpgradeAllowed;
          const disabled = buyingPlanId === plan._id || isSamePlan || isBlockedByActive;

          let buttonLabel = "Buy Plan";
          if (buyingPlanId === plan._id) buttonLabel = "Processing...";
          else if (isSamePlan) buttonLabel = "Current Plan";
          else if (isUpgradeAllowed) buttonLabel = "Upgrade Plan";
          else if (isBlockedByActive) buttonLabel = "Lower Plan Blocked";

          const isRecommended = normalizeCode(plan?.code) === "FAMILY";
          return (
            <article
              key={plan._id}
              className={`panel space-y-2 ${isRecommended ? "border-sky-400/40 bg-gradient-to-b from-sky-950/40 to-slate-950" : ""}`}
            >
              {isRecommended && (
                <p className="inline-flex rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 text-[11px] text-sky-200">
                  Recommended for family usage
                </p>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-sm text-slate-400">{plan.description || "-"}</p>
              <p className="text-sm">INR {plan.price} / {plan.durationDays} days</p>
              <p className="text-xs text-slate-400">
                Discount: {plan.discountType === "percent" ? `${plan.discountValue}%` : `INR ${plan.discountValue}`} | Max/booking: INR {plan.maxDiscountPerBooking || 0}
              </p>
              <p className="text-xs text-slate-400">Total cap: INR {plan.maxTotalDiscount || 0}</p>
              {(plan.perks || []).length > 0 && (
                <ul className="list-disc pl-5 text-xs text-slate-300">
                  {(plan.perks || []).map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => buyPlan(plan._id)}
                disabled={disabled}
                className="rounded bg-sky-700 px-3 py-2 text-sm text-white hover:bg-sky-600 disabled:opacity-60"
              >
                {buttonLabel}
              </button>
            </article>
          );
        })}
      </div>

      <div className="panel space-y-2">
        <h2 className="font-semibold">Recent Membership History</h2>
        {data.memberships.length === 0 && <p className="text-sm text-slate-400">No membership purchases yet.</p>}
        {data.memberships.map((row) => (
          <p key={row._id} className="text-sm text-slate-300">
            {row.planSnapshot?.name || row.planSnapshot?.code} | {String(row.status || "").toUpperCase()} | {formatDate(row.startedAt)} - {formatDate(row.endsAt)}
          </p>
        ))}
      </div>
    </section>
  );
}
