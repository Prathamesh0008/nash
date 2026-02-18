"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import ProviderGrid from "@/components/ProviderGrid";
import PageContainer from "@/components/PageContainer";
import MembershipBenefits from "@/components/MembershipBenefits";
import { ArrowRight, CalendarCheck2, Clock3, ShieldCheck, Sparkles, Zap } from "lucide-react";

const quickAccessCards = [
  {
    title: "Book in Under 60 Seconds",
    desc: "Pick a provider, confirm your slot, and submit in one flow.",
    href: "/booking/new",
  },
  {
    title: "Track Active Orders",
    desc: "Watch each booking stage from request to completion.",
    href: "/orders",
  },
  {
    title: "Family Pass Lounge",
    desc: "Find priority slots and nearby recommended providers.",
    href: "/family-pass",
  },
  {
    title: "Referral Rewards",
    desc: "Invite friends and monitor reward milestones live.",
    href: "/referrals",
  },
];

const bookingJourney = [
  {
    title: "Select Provider",
    desc: "Open profile details and choose your preferred provider.",
    icon: Sparkles,
  },
  {
    title: "Pick Slot",
    desc: "Choose date, time, and location in one place.",
    icon: CalendarCheck2,
  },
  {
    title: "Confirm Booking",
    desc: "Review charges and lock your request instantly.",
    icon: ShieldCheck,
  },
  {
    title: "Get Live Updates",
    desc: "Track progress with status updates until completion.",
    icon: Clock3,
  },
];

const trustPillars = [
  {
    title: "Verified Profiles",
    desc: "Profiles are reviewed before they appear in search and booking.",
    tone: "from-emerald-500/15 to-emerald-900/10 border-emerald-400/25",
  },
  {
    title: "Faster Match Logic",
    desc: "Priority goes to available and location-friendly providers first.",
    tone: "from-cyan-500/15 to-cyan-900/10 border-cyan-400/25",
  },
  {
    title: "Clear Communication",
    desc: "In-app updates and timeline events keep every booking transparent.",
    tone: "from-fuchsia-500/15 to-fuchsia-900/10 border-fuchsia-400/25",
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
    name: worker?.name || "Worker",
    city,
    location,
    rating: Number(worker?.ratingAvg || 0),
    reviewsCount: Number(worker?.jobsCompleted || 0),
    verified: String(worker?.verificationStatus || "").toUpperCase() === "APPROVED",
    available: worker?.isOnline !== false,
    images,
    bio: worker?.bio || (skills.length ? skills.slice(0, 3).join(", ") : "Verified worker profile."),
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

  return (
    <main className="min-h-screen">
      <HeroBanner providers={providers} />

      <section className="py-14">
        <PageContainer>
          <h2 className="text-2xl font-semibold text-white mb-6">
            Top Providers
          </h2>
          {loadingProviders && <p className="mb-3 text-sm text-white/60">Loading live providers...</p>}
          {!loadingProviders && providersError && <p className="mb-3 text-sm text-rose-300">{providersError}</p>}
          <ProviderGrid providers={providers} />
        </PageContainer>
        <MembershipBenefits />
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
              <h2 className="text-xl font-semibold text-white">How Booking Works</h2>
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
                <p className="mt-1 text-lg font-semibold text-white">Need support today? Start now.</p>
                <p className="text-sm text-slate-300">Choose a provider and send booking request in one flow.</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/booking/new" className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
                  Book Provider
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
