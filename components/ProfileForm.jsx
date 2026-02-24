"use client";

import Link from "next/link";
import { Briefcase, CheckCircle, ShieldCheck } from "lucide-react";

export default function ProfileForm() {
  return (
    <section className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
        <h1 className="text-2xl font-semibold text-white">Therapist Onboarding</h1>
        <p className="mt-2 text-sm text-slate-400">
          Complete worker onboarding to publish your profile and start receiving bookings.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
          <Briefcase className="h-5 w-5 text-fuchsia-300" />
          <p className="mt-2 text-sm font-semibold text-white">Create Profile</p>
          <p className="mt-1 text-xs text-slate-400">Add skills, service areas, and pricing.</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
          <ShieldCheck className="h-5 w-5 text-emerald-300" />
          <p className="mt-2 text-sm font-semibold text-white">Submit KYC</p>
          <p className="mt-1 text-xs text-slate-400">Upload required identity and verification docs.</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
          <CheckCircle className="h-5 w-5 text-amber-300" />
          <p className="mt-2 text-sm font-semibold text-white">Go Live</p>
          <p className="mt-1 text-xs text-slate-400">Accept jobs, track earnings, and build ratings.</p>
        </article>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/worker/onboarding" className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-500">
          Start Onboarding
        </Link>
        <Link href="/worker/dashboard" className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100">
          Open Dashboard
        </Link>
      </div>
    </section>
  );
}
