"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  AlertCircle,
  Ticket,
  Star,
  DollarSign,
  CreditCard,
  PieChart,
  BarChart3,
  MapPin,
  Layers,
  ArrowUp,
  ArrowDown,
  Shield,
  Settings,
  FileText,
  Gift,
  MessageSquare,
  Database,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

const COLOR_STYLE_MAP = {
  blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  purple: { bg: "bg-purple-500/20", text: "text-purple-400" },
  fuchsia: { bg: "bg-fuchsia-500/20", text: "text-fuchsia-400" },
  emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  amber: { bg: "bg-amber-500/20", text: "text-amber-400" },
  rose: { bg: "bg-rose-500/20", text: "text-rose-400" },
  yellow: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  green: { bg: "bg-green-500/20", text: "text-green-400" },
  cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  violet: { bg: "bg-violet-500/20", text: "text-violet-400" },
  indigo: { bg: "bg-indigo-500/20", text: "text-indigo-400" },
  orange: { bg: "bg-orange-500/20", text: "text-orange-400" },
};

function StatCard({ icon: Icon, label, value, subValue, trend, color = "fuchsia" }) {
  const palette = COLOR_STYLE_MAP[color] || COLOR_STYLE_MAP.fuchsia;

  return (
    <div className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 sm:text-sm">{label}</p>
          <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
          {subValue && <p className="mt-1 text-xs text-slate-500">{subValue}</p>}
        </div>
        <div className={`rounded-lg p-2 sm:p-2.5 ${palette.bg}`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${palette.text}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          {trend > 0 ? (
            <ArrowUp className="h-3 w-3 text-emerald-400" />
          ) : (
            <ArrowDown className="h-3 w-3 text-rose-400" />
          )}
          <span className={trend > 0 ? "text-emerald-400" : "text-rose-400"}>
            {Math.abs(trend)}%
          </span>
          <span className="text-slate-500">vs last month</span>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-5 w-5 text-fuchsia-400" />
      <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      const data = await res.json();
      setMetrics(data.metrics || null);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
              <LayoutDashboard className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">Admin Dashboard</h1>
              <p className="text-xs text-slate-400 sm:text-sm">
                Control users, workers, reports, promos, CRM templates, pricing, boosts and payouts
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          <StatCard icon={Users} label="Users" value={metrics?.usersCount || 0} color="blue" />
          <StatCard icon={Briefcase} label="Workers" value={metrics?.workersCount || 0} color="purple" />
          <StatCard icon={Calendar} label="Bookings" value={metrics?.bookingsCount || 0} color="fuchsia" />
          <StatCard icon={TrendingUp} label="Bookings (7d)" value={metrics?.bookingsLast7Days || 0} color="emerald" />
          <StatCard icon={AlertCircle} label="Open Reports" value={metrics?.openReports || 0} color="amber" />
          <StatCard icon={Ticket} label="Support Tickets" value={metrics?.openSupportTickets || 0} color="rose" />
          <StatCard icon={Star} label="Pending Reviews" value={metrics?.pendingWorkerReviews || 0} color="yellow" />
          <StatCard icon={DollarSign} label="Revenue" value={`₹${metrics?.revenue || 0}`} color="green" />
          <StatCard icon={CreditCard} label="Avg Ticket" value={`₹${metrics?.avgTicketSize || 0}`} color="cyan" />
          <StatCard icon={CheckCircle} label="Paid Bookings" value={metrics?.paidBookingsCount || 0} color="emerald" />
          <StatCard icon={PieChart} label="Paid Rate" value={`${metrics?.paidBookingRate || 0}%`} color="violet" />
          <StatCard icon={BarChart3} label="Completion" value={`${metrics?.completionRate || 0}%`} color="indigo" />
          <StatCard icon={XCircle} label="Cancel Rate" value={`${metrics?.cancelRate || 0}%`} color="rose" />
          <StatCard icon={Gift} label="Promos" value={metrics?.promosCount || 0} color="pink" />
          <StatCard icon={Users} label="Referrals" value={metrics?.referralsCount || 0} color="orange" />
        </div>

        {/* Booking Status Breakdown */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <SectionHeader icon={PieChart} title="Booking Status Breakdown" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {["confirmed", "assigned", "onway", "working", "completed", "cancelled"].map((status) => (
              <div key={status} className="rounded-lg border border-white/10 bg-slate-900/40 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 sm:text-xs">{status}</p>
                <p className="mt-1 text-base font-semibold text-white sm:text-lg">
                  {metrics?.bookingByStatus?.[status] || 0}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="mb-6 grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Daily Bookings */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <SectionHeader icon={BarChart3} title="Daily Bookings (14d)" />
            {(metrics?.dailyBookings || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <BarChart3 className="h-8 w-8 text-slate-600" />
                <p className="mt-2 text-xs text-slate-400">No data available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(metrics?.dailyBookings || []).map((row) => (
                  <div key={row.date} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{row.date}</span>
                    <span className="font-semibold text-white">{row.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Areas */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <SectionHeader icon={MapPin} title="Top Areas" />
            {(metrics?.topAreas || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <MapPin className="h-8 w-8 text-slate-600" />
                <p className="mt-2 text-xs text-slate-400">No area data</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(metrics?.topAreas || []).map((row) => (
                  <div key={row.city} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{row.city}</span>
                    <span className="font-semibold text-white">{row.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Categories */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <SectionHeader icon={Layers} title="Top Categories" />
            {(metrics?.topCategories || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Layers className="h-8 w-8 text-slate-600" />
                <p className="mt-2 text-xs text-slate-400">No category data</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(metrics?.topCategories || []).map((row) => (
                  <div key={row.category} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{row.category}</span>
                    <span className="font-semibold text-white">{row.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Funnel & Data Consistency Row */}
        <div className="mb-6 grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Worker Onboarding Funnel */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <SectionHeader icon={TrendingUp} title="Worker Onboarding Funnel" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400">Registered</p>
                  <p className="text-lg font-semibold text-white">{metrics?.onboardingFunnel?.registeredWorkers || 0}</p>
                </div>
                <div className="rounded-lg bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400">Onboarded</p>
                  <p className="text-lg font-semibold text-white">{metrics?.onboardingFunnel?.onboardedWorkers || 0}</p>
                </div>
                <div className="rounded-lg bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400">Submitted</p>
                  <p className="text-lg font-semibold text-white">{metrics?.onboardingFunnel?.submittedWorkers || 0}</p>
                </div>
                <div className="rounded-lg bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400">Pending Review</p>
                  <p className="text-lg font-semibold text-white">{metrics?.onboardingFunnel?.pendingReviewWorkers || 0}</p>
                </div>
                <div className="rounded-lg bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400">Approved</p>
                  <p className="text-lg font-semibold text-white">{metrics?.onboardingFunnel?.approvedWorkers || 0}</p>
                </div>
                <div className="rounded-lg bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400">Live</p>
                  <p className="text-lg font-semibold text-white">{metrics?.onboardingFunnel?.liveWorkers || 0}</p>
                </div>
              </div>
              
              {/* Drop-off Rates */}
              <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-xs font-medium text-amber-400">Drop-off Analysis</p>
                <div className="mt-2 space-y-1 text-xs">
                  <p className="flex justify-between text-slate-300">
                    <span>Registered no onboarding:</span>
                    <span className="font-medium text-amber-400">{metrics?.onboardingFunnel?.dropOff?.registeredNoOnboarding || 0}</span>
                  </p>
                  <p className="flex justify-between text-slate-300">
                    <span>Onboarded no submission:</span>
                    <span className="font-medium text-amber-400">{metrics?.onboardingFunnel?.dropOff?.onboardedNoSubmission || 0}</span>
                  </p>
                  <p className="flex justify-between text-slate-300">
                    <span>Submitted not approved:</span>
                    <span className="font-medium text-amber-400">{metrics?.onboardingFunnel?.dropOff?.submittedNotApproved || 0}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Consistency */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <SectionHeader icon={Database} title="Data Consistency" />
            <div className="space-y-3">
              <div className="grid gap-3">
                <div className="rounded-lg bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400">Worker category mismatches</p>
                  <p className="text-lg font-semibold text-amber-400">{metrics?.dataConsistency?.workerCategoryMismatchCount || 0}</p>
                </div>
                <div className="rounded-lg bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400">Duplicate worker phones</p>
                  <p className="text-lg font-semibold text-rose-400">{metrics?.dataConsistency?.duplicateWorkerPhonesCount || 0}</p>
                </div>
                <div className="rounded-lg bg-slate-900/40 p-3">
                  <p className="text-xs text-slate-400">Duplicate worker emails</p>
                  <p className="text-lg font-semibold text-rose-400">{metrics?.dataConsistency?.duplicateWorkerEmailsCount || 0}</p>
                </div>
              </div>

              {/* Unknown Worker Categories */}
              {(metrics?.dataConsistency?.unknownWorkerCategories || []).length > 0 && (
                <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <p className="text-xs font-medium text-slate-400 mb-2">Unknown worker categories</p>
                  <div className="space-y-1">
                    {(metrics?.dataConsistency?.unknownWorkerCategories || []).map((row) => (
                      <p key={row.category} className="flex justify-between text-xs">
                        <span className="text-slate-300">{row.category}:</span>
                        <span className="font-medium text-white">{row.count}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
          <SectionHeader icon={Settings} title="Quick Actions" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
            <Link href="/admin/users" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              Users
            </Link>
            <Link href="/admin/workers" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              Workers
            </Link>
            <Link href="/admin/orders" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              Orders
            </Link>
            <Link href="/admin/reports" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              Reports
            </Link>
            <Link href="/admin/fraud" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              Fraud
            </Link>
            <Link href="/admin/support" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              Support
            </Link>
            <Link href="/admin/boost-plans" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              Boost Plans
            </Link>
            <Link href="/admin/reschedule-policy" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              Reschedule
            </Link>
            <Link href="/admin/payments" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              Payments
            </Link>
            <Link href="/admin/payouts" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              Payouts
            </Link>
            <Link href="/admin/cms" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              CMS
            </Link>
            <Link href="/admin/promos" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              Promos
            </Link>
            <Link href="/admin/crm-templates" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              CRM
            </Link>
            <Link href="/admin/data-consistency" className="rounded-lg bg-slate-800/80 px-3 py-2.5 text-center text-xs text-slate-200 transition hover:bg-slate-700 hover:text-white sm:text-sm">
              Data
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
