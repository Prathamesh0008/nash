"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import ProviderGrid from "@/components/ProviderGrid";
import PageContainer from "@/components/PageContainer";
import {
  ArrowRight,
  CalendarCheck2,
  Clock3,
  Navigation,
  Route,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Zap,
} from "lucide-react";

const quickAccessCards = [
  {
    title: "Instant Home Booking",
    desc: "Choose massage/spa service, slot, and address in one fast flow.",
    href: "/booking/new",
  },
  {
    title: "Live Tracking",
    desc: "Track therapist movement with live status, speed, and update freshness.",
    href: "/orders",
  },
  {
    title: "Chat With Therapist",
    desc: "Connect instantly for arrival notes and service preferences.",
    href: "/chat",
  },
  {
    title: "Family Pass Priority",
    desc: "Unlock priority queue and nearby high-response therapist options.",
    href: "/family-pass",
  },
];

const bookingJourney = [
  {
    title: "Select Therapist",
    desc: "Pick a verified massage/spa therapist by rating, area, and skills.",
    icon: Sparkles,
  },
  {
    title: "Pick Slot",
    desc: "Choose date, time, and home-service address instantly.",
    icon: CalendarCheck2,
  },
  {
    title: "Confirm Booking",
    desc: "Review transparent charges and confirm booking securely.",
    icon: ShieldCheck,
  },
  {
    title: "Track Arrival Live",
    desc: "See live location, ETA, and route progress till therapist arrival.",
    icon: Clock3,
  },
];

const trustPillars = [
  {
    title: "Verified Wellness Pros",
    desc: "Every therapist profile is verified before going live for booking.",
    tone: "from-emerald-500/15 to-emerald-900/10 border-emerald-400/25",
  },
  {
    title: "Smart Match + Availability",
    desc: "Faster assignment based on area fit, availability, and response speed.",
    tone: "from-cyan-500/15 to-cyan-900/10 border-cyan-400/25",
  },
  {
    title: "Clear Communication",
    desc: "In-app chat, timeline events, and live tracking keep everything clear.",
    tone: "from-fuchsia-500/15 to-fuchsia-900/10 border-fuchsia-400/25",
  },
];

const liveTrackingHighlights = [
  {
    title: "Live Status Health",
    desc: "Get LIVE / DELAYED / OFFLINE feed state in real time.",
    icon: Zap,
  },
  {
    title: "Speed + Heading",
    desc: "See movement quality with heading and speed updates.",
    icon: Navigation,
  },
  {
    title: "Distance + ETA",
    desc: "Know how far therapist is and expected arrival window.",
    icon: Route,
  },
  {
    title: "Freshness Guard",
    desc: "Auto stale detection prevents outdated location confusion.",
    icon: TimerReset,
  },
];

function mapWorkerToProvider(worker, idx) {
  const city = worker?.serviceAreas?.[0]?.city || "";
  const pincode = worker?.serviceAreas?.[0]?.pincode || "";
  const location = [city, pincode].filter(Boolean).join(", ") || "Location unavailable";
  const images = [worker?.profilePhoto, ...(Array.isArray(worker?.galleryPhotos) ? worker.galleryPhotos : [])].filter(Boolean);
  const skills = (Array.isArray(worker?.skills) ? worker.skills : []).filter(Boolean);
  const categories = (Array.isArray(worker?.categories) ? worker.categories : []).filter(Boolean);
  const basePrice = Number(worker?.basePrice || 0);

  return {
    id: String(worker?.id || worker?.userId || `worker-${idx + 1}`),
    name: worker?.name || "Therapist",
    city,
    location,
    rating: Number(worker?.ratingAvg || 0),
    reviewsCount: Number(worker?.jobsCompleted || 0),
    verified: String(worker?.verificationStatus || "").toUpperCase() === "APPROVED",
    available: worker?.isOnline !== false,
    images,
    bio: worker?.bio || (skills.length ? skills.slice(0, 3).join(", ") : "Verified wellness therapist profile."),
    tags: categories.length ? categories : skills.slice(0, 3),
    ratePerHour: basePrice,
    profileHref: worker?.id ? `/workers/${worker.id}` : "/workers",
  };
}

export default function HomePage() {
  const [liveProviders, setLiveProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [providersError, setProvidersError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProviders = async () => {
      try {
        const res = await fetch("/api/workers", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          if (active) {
            setProvidersError(data?.error || "Unable to load live providers.");
            setLiveProviders([]);
          }
          return;
        }

        if (active) {
          const rows = Array.isArray(data.workers) ? data.workers.map(mapWorkerToProvider) : [];
          setLiveProviders(rows);
          setProvidersError("");
        }
      } catch {
        if (active) {
          setProvidersError("Unable to load live providers.");
          setLiveProviders([]);
        }
      } finally {
        if (active) setLoadingProviders(false);
      }
    };

    loadProviders();
    return () => {
      active = false;
    };
  }, []);

  const providers = useMemo(() => liveProviders.slice(0, 24), [liveProviders]);
  const liveStats = useMemo(() => {
    const total = liveProviders.length;
    const online = liveProviders.filter((row) => row?.available !== false).length;
    const rated = liveProviders.filter((row) => Number(row?.rating || 0) > 0);
    const avgRating =
      rated.length > 0
        ? (rated.reduce((sum, row) => sum + Number(row.rating || 0), 0) / rated.length).toFixed(1)
        : "0.0";
    return { total, online, avgRating };
  }, [liveProviders]);

  return (
    <main className="min-h-screen">
      <HeroBanner providers={providers} />

      <section className="py-14">
        <PageContainer>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-slate-900/45 p-3">
              <p className="text-xs text-slate-400">Live Therapists</p>
              <p className="mt-1 text-xl font-semibold text-white">{liveStats.online}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-slate-900/45 p-3">
              <p className="text-xs text-slate-400">Total Profiles</p>
              <p className="mt-1 text-xl font-semibold text-white">{liveStats.total}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-slate-900/45 p-3">
              <p className="text-xs text-slate-400">Avg Rating</p>
              <p className="mt-1 text-xl font-semibold text-white">{liveStats.avgRating}</p>
            </article>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-6">
            Top Wellness Therapists
          </h2>
          {loadingProviders && <p className="mb-3 text-sm text-white/60">Loading live providers...</p>}
          {!loadingProviders && providersError && <p className="mb-3 text-sm text-rose-300">{providersError}</p>}
          <ProviderGrid providers={providers} />
          <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-950/80 via-slate-900/70 to-slate-950/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Membership + Family Pass</p>
                <p className="text-xs text-slate-400">Unlock priority slots, faster support, and better therapist matching.</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/membership" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-white/10">
                  View Plans
                </Link>
                <Link href="/family-pass" className="rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-3 py-2 text-xs font-semibold text-white hover:brightness-110">
                  Open Family Pass
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="pb-12">
        <PageContainer>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickAccessCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-4">
                <p className="text-base font-semibold text-white">{card.title}</p>
                <p className="mt-2 text-xs text-slate-400">{card.desc}</p>
                <Link href={card.href} className="mt-4 inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">
                  Open
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="pb-12">
        <PageContainer>
          <div className="panel space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold text-white">How Home Service Booking Works</h2>
              <Link href="/booking/new" className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:text-emerald-200">
                Start Booking
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {bookingJourney.map((step, index) => (
                <article key={step.title} className="rounded-xl border border-white/10 bg-slate-950/65 p-4">
                  <p className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-xs font-semibold text-slate-300">
                    {index + 1}
                  </p>
                  <step.icon className="mt-3 h-5 w-5 text-amber-300" />
                  <p className="mt-2 text-sm font-semibold text-white">{step.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="pb-12">
        <PageContainer>
          <div className="panel space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold text-white">Top Quality Live Tracking</h2>
              <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-sky-300 hover:text-sky-200">
                Open Live Tracking
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {liveTrackingHighlights.map((item) => (
                <article key={item.title} className="rounded-xl border border-white/10 bg-slate-950/65 p-4">
                  <item.icon className="h-5 w-5 text-sky-300" />
                  <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="pb-12">
        <PageContainer>
          <div className="grid gap-4 lg:grid-cols-3">
            {trustPillars.map((item) => (
              <article key={item.title} className={`rounded-2xl border bg-gradient-to-br p-4 ${item.tone}`}>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-xs text-slate-300">{item.desc}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="pb-12">
        <PageContainer>
          <div className="rounded-2xl border border-fuchsia-400/30 bg-gradient-to-r from-[#16112e] via-[#121a34] to-[#072a2f] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-fuchsia-200">
                  <Zap className="h-3.5 w-3.5" />
                  Ready for instant booking
                </p>
                <p className="mt-1 text-lg font-semibold text-white">Need massage or spa support today? Start now.</p>
                <p className="text-sm text-slate-300">Choose a therapist and send your home-service booking request in one flow.</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/booking/new" className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
                  Book Therapist
                </Link>
                <Link href="/family-pass" className="rounded-xl border border-white/20 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/[0.1]">
                  Family Pass
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
