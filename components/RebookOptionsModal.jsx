"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Clock3, UserRound, Zap, X } from "lucide-react";

function formatIssue(issue) {
  if (!issue) return "";
  if (typeof issue === "string") return issue;
  return String(issue.message || issue.code || "").trim();
}

function formatSlot(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RebookOptionsModal({
  open,
  preview,
  sourceBooking,
  submitting = false,
  error = "",
  onClose,
  onConfirm,
}) {
  const defaultSameWorkerAvailable = Boolean(preview?.sameWorker?.available);
  const defaultWorkerPreference =
    preview?.recommendedWorkerPreference === "same" && defaultSameWorkerAvailable ? "same" : "auto";
  const [workerPreference, setWorkerPreference] = useState(defaultWorkerPreference);
  const [strictSameWorker, setStrictSameWorker] = useState(defaultSameWorkerAvailable);

  const reasons = useMemo(
    () => (preview?.eligibility?.reasons || []).map(formatIssue).filter(Boolean),
    [preview]
  );
  const warnings = useMemo(
    () => (preview?.eligibility?.warnings || []).map(formatIssue).filter(Boolean),
    [preview]
  );
  const eligible = Boolean(preview?.eligibility?.eligible);
  const sameWorkerAvailable = Boolean(preview?.sameWorker?.available);
  const sameWorkerReason = formatIssue(preview?.sameWorker?.reason);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950 p-4 text-white shadow-2xl sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Rebook Options</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close rebook modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
            <p className="text-slate-400">Order</p>
            <p className="font-medium text-white">#{String(sourceBooking?._id || "").slice(-6) || "-"}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
              <Clock3 className="h-3.5 w-3.5" />
              <span>{formatSlot(preview?.suggestedSlotTime)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <input
                type="radio"
                name="rebookWorkerPreference"
                className="mt-1"
                value="same"
                checked={workerPreference === "same"}
                disabled={!sameWorkerAvailable || submitting}
                onChange={() => setWorkerPreference("same")}
              />
              <div>
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-emerald-300" />
                  <p className="text-sm font-medium">Same Worker</p>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {sameWorkerAvailable ? "Try booking with your previous worker." : sameWorkerReason || "Not available right now."}
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <input
                type="radio"
                name="rebookWorkerPreference"
                className="mt-1"
                value="auto"
                checked={workerPreference === "auto"}
                disabled={submitting}
                onChange={() => setWorkerPreference("auto")}
              />
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-300" />
                  <p className="text-sm font-medium">Fastest Available Worker</p>
                </div>
                <p className="mt-1 text-xs text-slate-400">Auto-assign the best available worker for this slot.</p>
              </div>
            </label>
          </div>

          {workerPreference === "same" && sameWorkerAvailable && (
            <label className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={strictSameWorker}
                disabled={submitting}
                onChange={(e) => setStrictSameWorker(e.target.checked)}
              />
              <span className="text-slate-300">Do not fallback to auto assignment if previous worker is unavailable.</span>
            </label>
          )}

          {warnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <p className="mb-1 font-semibold">Warnings</p>
              <ul className="space-y-1">
                {warnings.map((text, idx) => (
                  <li key={`${text}-${idx}`}>- {text}</li>
                ))}
              </ul>
            </div>
          )}

          {!eligible && reasons.length > 0 && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
              <div className="mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <p className="font-semibold">Rebook not available</p>
              </div>
              <ul className="space-y-1">
                {reasons.map((text, idx) => (
                  <li key={`${text}-${idx}`}>- {text}</li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="text-sm text-rose-300">{error}</p>}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm transition hover:bg-white/[0.07] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onConfirm?.({
                workerPreference,
                strictSameWorker: workerPreference === "same" ? strictSameWorker : false,
              })
            }
            disabled={submitting || !eligible}
            className="flex-1 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-3 py-2 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Rebooking..." : "Confirm Rebook"}
          </button>
        </div>
      </div>
    </div>
  );
}
