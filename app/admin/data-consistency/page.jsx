"use client";

import { useEffect, useState } from "react";
import {
  Database,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  Layers,
  RefreshCw,
  Shield,
  AlertTriangle,
  UserX,
} from "lucide-react";

const CONSISTENCY_COLOR_STYLE_MAP = {
  blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  amber: { bg: "bg-amber-500/20", text: "text-amber-400" },
  rose: { bg: "bg-rose-500/20", text: "text-rose-400" },
  purple: { bg: "bg-purple-500/20", text: "text-purple-400" },
  indigo: { bg: "bg-indigo-500/20", text: "text-indigo-400" },
};

function StatCard({ icon: Icon, label, value, subValue, color = "fuchsia", alert = false }) {
  const palette = CONSISTENCY_COLOR_STYLE_MAP[color] || CONSISTENCY_COLOR_STYLE_MAP.blue;

  return (
    <div
      className={`group rounded-xl border ${
        alert
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]"
      } p-4 transition hover:border-fuchsia-500/30 sm:p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 sm:text-sm">{label}</p>
          <p className={`mt-1 text-xl font-bold sm:text-2xl ${alert ? "text-amber-400" : "text-white"}`}>
            {value}
          </p>
          {subValue && <p className="mt-1 text-xs text-slate-500">{subValue}</p>}
        </div>
        <div className={`rounded-lg p-2 sm:p-2.5 ${alert ? "bg-amber-500/20" : palette.bg}`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${alert ? "text-amber-400" : palette.text}`} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-fuchsia-400" />
        <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>
        {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export default function AdminDataConsistencyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [expandedMismatches, setExpandedMismatches] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/data-consistency", { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setMsg(json.error || "Failed to load data consistency report");
        setLoading(false);
        return;
      }
      setData(json.consistency || null);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
                <Database className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Data Consistency Tools</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Validate worker categories vs services and detect duplicate worker profiles
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white sm:self-start"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          
          {msg && (
            <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {msg}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-fuchsia-500"></div>
            <p className="mt-4 text-sm text-slate-400">Loading consistency report...</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && data && (
          <>
            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              <StatCard 
                icon={Layers} 
                label="Service Categories" 
                value={(data.serviceCategories || []).length} 
                color="blue" 
              />
              <StatCard 
                icon={AlertTriangle} 
                label="Category Mismatches" 
                value={data.workerCategoryMismatchCount || 0} 
                color="amber" 
                alert={data.workerCategoryMismatchCount > 0}
              />
              <StatCard 
                icon={UserX} 
                label="Duplicate by User" 
                value={data.duplicateWorkerProfileByUserCount || 0} 
                color="rose" 
                alert={data.duplicateWorkerProfileByUserCount > 0}
              />
              <StatCard 
                icon={Phone} 
                label="Duplicate Phones" 
                value={data.duplicateWorkerPhonesCount || 0} 
                color="purple" 
                alert={data.duplicateWorkerPhonesCount > 0}
              />
              <StatCard 
                icon={Mail} 
                label="Duplicate Emails" 
                value={data.duplicateWorkerEmailsCount || 0} 
                color="indigo" 
                alert={data.duplicateWorkerEmailsCount > 0}
              />
            </div>

            {/* Unknown Worker Categories */}
            <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
              <SectionHeader 
                icon={AlertTriangle} 
                title="Unknown Worker Categories" 
                subtitle={`${(data.workerCategoryMismatches || []).length} issues found`}
                action={
                  (data.workerCategoryMismatches || []).length > 5 && (
                    <button
                      onClick={() => setExpandedMismatches(!expandedMismatches)}
                      className="text-xs text-fuchsia-400 hover:text-fuchsia-300"
                    >
                      {expandedMismatches ? 'Show less' : 'Show all'}
                    </button>
                  )
                }
              />
              
              {(data.workerCategoryMismatches || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-emerald-500/50" />
                  <p className="mt-2 text-sm text-slate-400">No category mismatches found</p>
                  <p className="text-xs text-slate-500">All worker categories are valid</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(data.workerCategoryMismatches || [])
                    .slice(0, expandedMismatches ? undefined : 6)
                    .map((row) => (
                      <div 
                        key={`${row.workerId}_${row.unknownCategories?.join("_")}`} 
                        className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-white">{row.workerName || 'Unknown Worker'}</h3>
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">
                            {row.unknownCategories?.length || 0} issues
                          </span>
                        </div>
                        
                        <p className="mt-2 text-xs text-slate-400">
                          {row.workerEmail || 'No email'} • {row.workerPhone || 'No phone'}
                        </p>
                        
                        <div className="mt-3">
                          <p className="text-xs font-medium text-amber-400 mb-1">Unknown categories:</p>
                          <div className="flex flex-wrap gap-1">
                            {(row.unknownCategories || []).map((cat) => (
                              <span key={cat} className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <p className="mt-2 text-[10px] text-slate-500">ID: {row.workerId}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Duplicates Grid */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Duplicate Phones */}
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
                <SectionHeader 
                  icon={Phone} 
                  title="Duplicate Worker Phones" 
                  subtitle={`${(data.duplicateWorkerPhones || []).length} groups`}
                />
                
                {(data.duplicateWorkerPhones || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle className="h-10 w-10 text-emerald-500/50" />
                    <p className="mt-2 text-sm text-slate-400">No duplicate phones found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(data.duplicateWorkerPhones || []).map((row) => (
                      <div key={row.phone} className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-rose-400" />
                            <span className="font-mono text-sm text-white">{row.phone}</span>
                          </div>
                          <span className="rounded-full bg-rose-500/20 px-2 py-1 text-xs text-rose-400">
                            {row.count} workers
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Duplicate Emails */}
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
                <SectionHeader 
                  icon={Mail} 
                  title="Duplicate Worker Emails" 
                  subtitle={`${(data.duplicateWorkerEmails || []).length} groups`}
                />
                
                {(data.duplicateWorkerEmails || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle className="h-10 w-10 text-emerald-500/50" />
                    <p className="mt-2 text-sm text-slate-400">No duplicate emails found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(data.duplicateWorkerEmails || []).map((row) => (
                      <div key={row.email} className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-white truncate max-w-[200px]">{row.email}</span>
                          </div>
                          <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-400">
                            {row.count} workers
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Data Quality Summary */}
            <div className="mt-6 rounded-lg border border-white/10 bg-slate-900/30 p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-fuchsia-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm">
                  <p className="text-white font-medium">Data Quality Summary</p>
                  <p className="text-xs text-slate-400">
                    {data.workerCategoryMismatchCount === 0 && 
                     data.duplicateWorkerPhonesCount === 0 && 
                     data.duplicateWorkerEmailsCount === 0 ? (
                      <span className="text-emerald-400">✅ All data consistency checks passed</span>
                    ) : (
                      <span className="text-amber-400">
                        ⚠️ Found {data.workerCategoryMismatchCount + data.duplicateWorkerPhonesCount + data.duplicateWorkerEmailsCount} 
                        {' '}issues that need attention
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    Regular data consistency checks help maintain system integrity and prevent operational issues.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
