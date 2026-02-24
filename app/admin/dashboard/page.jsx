"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  CheckCircle,
  Clock3,
  CreditCard,
  Database,
  DollarSign,
  Gift,
  LayoutDashboard,
  Layers,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Ticket,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

const STATUS_KEYS = ["confirmed", "assigned", "onway", "working", "completed", "cancelled"];

function StatCard({ icon: Icon, label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-500/20 text-slate-300",
    blue: "bg-blue-500/20 text-blue-300",
    purple: "bg-purple-500/20 text-purple-300",
    emerald: "bg-emerald-500/20 text-emerald-300",
    amber: "bg-amber-500/20 text-amber-300",
    rose: "bg-rose-500/20 text-rose-300",
  };

  return (
    <article className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{label}</p>
        <span className={`rounded-lg p-2 ${tones[tone] || tones.slate}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </article>
  );
}

function ListPanel({ title, icon: Icon, rows = [], emptyLabel = "No data" }) {
  return (
    <section className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-fuchsia-300" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{row.label}</span>
              <span className="font-semibold text-white">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");

      const res = await fetch("/api/admin/dashboard", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load dashboard metrics.");
        setMetrics(null);
        return;
      }

      setMetrics(data.metrics || null);
    } catch {
      setError("Network error while loading dashboard.");
      setMetrics(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const safe = useMemo(() => {
    const row = metrics || {};
    return {
      usersCount: Number(row.usersCount || 0),
      workersCount: Number(row.workersCount || 0),
      bookingsCount: Number(row.bookingsCount || 0),
      bookingsLast7Days: Number(row.bookingsLast7Days || 0),
      openReports: Number(row.openReports || 0),
      openSupportTickets: Number(row.openSupportTickets || 0),
      pendingWorkerReviews: Number(row.pendingWorkerReviews || 0),
      revenue: Number(row.revenue || 0),
      avgTicketSize: Number(row.avgTicketSize || 0),
      paidBookingRate: Number(row.paidBookingRate || 0),
      completionRate: Number(row.completionRate || 0),
      cancelRate: Number(row.cancelRate || 0),
      promosCount: Number(row.promosCount || 0),
      referralsCount: Number(row.referralsCount || 0),
      bookingByStatus: row.bookingByStatus || {},
      dailyBookings: row.dailyBookings || [],
      topAreas: row.topAreas || [],
      topCategories: row.topCategories || [],
      onboardingFunnel: row.onboardingFunnel || {},
      dataConsistency: row.dataConsistency || {},
    };
  }, [metrics]);

  const alerts = useMemo(() => {
    const rows = [];
    if (safe.openReports > 0) rows.push({ level: "high", label: `Open reports: ${safe.openReports}` });
    if (safe.openSupportTickets > 0) rows.push({ level: "high", label: `Open support tickets: ${safe.openSupportTickets}` });
    if (safe.pendingWorkerReviews > 0) rows.push({ level: "medium", label: `Pending worker reviews: ${safe.pendingWorkerReviews}` });

    const categoryMismatch = Number(safe.dataConsistency.workerCategoryMismatchCount || 0);
    const duplicatePhones = Number(safe.dataConsistency.duplicateWorkerPhonesCount || 0);
    const duplicateEmails = Number(safe.dataConsistency.duplicateWorkerEmailsCount || 0);

    if (categoryMismatch > 0) rows.push({ level: "medium", label: `Worker category mismatches: ${categoryMismatch}` });
    if (duplicatePhones > 0) rows.push({ level: "high", label: `Duplicate worker phones: ${duplicatePhones}` });
    if (duplicateEmails > 0) rows.push({ level: "high", label: `Duplicate worker emails: ${duplicateEmails}` });

    return rows;
  }, [safe]);

  const onboardingRows = [
    { label: "Registered", value: Number(safe.onboardingFunnel.registeredWorkers || 0) },
    { label: "Onboarded", value: Number(safe.onboardingFunnel.onboardedWorkers || 0) },
    { label: "Submitted", value: Number(safe.onboardingFunnel.submittedWorkers || 0) },
    { label: "Pending Review", value: Number(safe.onboardingFunnel.pendingReviewWorkers || 0) },
    { label: "Approved", value: Number(safe.onboardingFunnel.approvedWorkers || 0) },
    { label: "Live", value: Number(safe.onboardingFunnel.liveWorkers || 0) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Admin Dashboard</h1>
                <p className="text-xs text-slate-400 sm:text-sm">Operations, quality, risk, and growth overview</p>
              </div>
            </div>

            <button
              onClick={() => load({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-24 animate-pulse rounded-xl border border-white/10 bg-slate-900/40" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Users} label="Users" value={safe.usersCount} tone="blue" />
              <StatCard icon={Briefcase} label="Workers" value={safe.workersCount} tone="purple" />
              <StatCard icon={TrendingUp} label="Bookings (7d)" value={safe.bookingsLast7Days} tone="emerald" />
              <StatCard icon={DollarSign} label="Revenue" value={`INR ${safe.revenue}`} tone="amber" />
              <StatCard icon={CreditCard} label="Avg Ticket" value={`INR ${safe.avgTicketSize}`} tone="blue" />
              <StatCard icon={CheckCircle} label="Completion Rate" value={`${safe.completionRate}%`} tone="emerald" />
              <StatCard icon={XCircle} label="Cancel Rate" value={`${safe.cancelRate}%`} tone="rose" />
              <StatCard icon={Gift} label="Promos / Referrals" value={`${safe.promosCount} / ${safe.referralsCount}`} tone="purple" />
            </div>

            <div className="mb-6 rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-fuchsia-300" />
                <h2 className="text-sm font-semibold text-white">Booking Status Breakdown</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {STATUS_KEYS.map((key) => (
                  <div key={key} className="rounded-lg border border-white/10 bg-slate-950/60 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">{key}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{Number(safe.bookingByStatus[key] || 0)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 grid gap-3 lg:grid-cols-3">
              <ListPanel
                title="Daily Bookings (14d)"
                icon={Clock3}
                rows={safe.dailyBookings.map((row) => ({ label: row.date, value: row.count }))}
                emptyLabel="No daily booking trend yet"
              />
              <ListPanel
                title="Top Areas"
                icon={MapPin}
                rows={safe.topAreas.map((row) => ({ label: row.city, value: row.count }))}
                emptyLabel="No area data"
              />
              <ListPanel
                title="Top Categories"
                icon={Layers}
                rows={safe.topCategories.map((row) => ({ label: row.category, value: row.count }))}
                emptyLabel="No category data"
              />
            </div>

            <div className="mb-6 grid gap-3 lg:grid-cols-2">
              <section className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-fuchsia-300" />
                  <h2 className="text-sm font-semibold text-white">Worker Onboarding Funnel</h2>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {onboardingRows.map((row) => (
                    <div key={row.label} className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                      <p className="text-xs text-slate-400">{row.label}</p>
                      <p className="mt-1 text-lg font-semibold text-white">{row.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-fuchsia-300" />
                  <h2 className="text-sm font-semibold text-white">Operational Alerts</h2>
                </div>

                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500">No active alerts</p>
                ) : (
                  <div className="space-y-2">
                    {alerts.map((row) => (
                      <div
                        key={row.label}
                        className={`rounded-lg border p-2 text-sm ${
                          row.level === "high"
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          {row.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Data consistency snapshot</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded bg-slate-900/60 p-2 text-center">
                      <p className="text-slate-500">Category mismatch</p>
                      <p className="font-semibold text-white">{Number(safe.dataConsistency.workerCategoryMismatchCount || 0)}</p>
                    </div>
                    <div className="rounded bg-slate-900/60 p-2 text-center">
                      <p className="text-slate-500">Dup phones</p>
                      <p className="font-semibold text-white">{Number(safe.dataConsistency.duplicateWorkerPhonesCount || 0)}</p>
                    </div>
                    <div className="rounded bg-slate-900/60 p-2 text-center">
                      <p className="text-slate-500">Dup emails</p>
                      <p className="font-semibold text-white">{Number(safe.dataConsistency.duplicateWorkerEmailsCount || 0)}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-fuchsia-300" />
                <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
                <Link href="/admin/orders" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Orders</Link>
                <Link href="/admin/workers" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Workers</Link>
                <Link href="/admin/users" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Users</Link>
                <Link href="/admin/payments" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Payments</Link>
                <Link href="/admin/payouts" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Payouts</Link>
                <Link href="/admin/reports" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Reports</Link>
                <Link href="/admin/support" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Support</Link>
                <Link href="/admin/fraud" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Fraud</Link>
                <Link href="/admin/promos" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Promos</Link>
                <Link href="/admin/boost-plans" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Boost Plans</Link>
                <Link href="/admin/cms" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">CMS</Link>
                <Link href="/admin/crm-templates" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">CRM</Link>
                <Link href="/admin/reschedule-policy" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Reschedule</Link>
                <Link href="/admin/data-consistency" className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">Data</Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
