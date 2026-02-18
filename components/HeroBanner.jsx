"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Star,
  Sparkles,
  MoveLeft,
  MoveRight,
  Zap,
  Trophy,
  Users,
  Globe,
} from "lucide-react";

function normalizeProvider(provider, idx) {
  return {
    id: String(provider?.id || `worker-${idx + 1}`),
    name: provider?.name || "Worker",
    city: provider?.city || "City unavailable",
    rating: Number(provider?.rating || 0),
    price: Number(provider?.ratePerHour || provider?.price || 0),
    image: provider?.image || provider?.profilePhoto || provider?.images?.[0] || "",
    bio: provider?.bio || "Verified worker profile.",
    tier: provider?.tier || (provider?.boosted ? "Diamond" : "Verified"),
    specialties: provider?.tags || provider?.categories || [],
  };
}

function CardImage({ src, alt, priority = false, className = "" }) {
  if (src) {
    return <Image src={src} alt={alt} fill className={`object-cover ${className}`} priority={priority} unoptimized />;
  }
  return <div className={`absolute inset-0 bg-gradient-to-br from-purple-700/80 to-pink-700/80 ${className}`} />;
}

export default function HeroBanner({ providers = [] }) {
  const featured = useMemo(() => {
    const source = Array.isArray(providers) ? providers : [];
    const normalized = source
      .map((item, idx) => normalizeProvider(item, idx))
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));

    if (normalized.length >= 8) {
      return normalized.slice(0, 8);
    }

    if (normalized.length === 0) return [];

    const padded = [];
    let i = 0;
    while (padded.length < 8) {
      padded.push(normalized[i % normalized.length]);
      i += 1;
    }
    return padded;
  }, [providers]);

  const heroStats = useMemo(() => {
    const source = Array.isArray(providers) ? providers : [];
    const workerCount = source.length;
    const avgRating =
      workerCount > 0
        ? (source.reduce((sum, row) => sum + Number(row?.rating || 0), 0) / workerCount).toFixed(1)
        : "0.0";
    const cityCount = new Set(source.map((row) => String(row?.city || "").trim()).filter(Boolean)).size;

    return {
      workerCount,
      avgRating,
      cityCount,
    };
  }, [providers]);

  const resolveWorkerHref = useCallback((provider) => {
    if (provider?.id && String(provider.id).trim()) return `/workers/${provider.id}`;
    return "/workers";
  }, []);

  const scrollRef = useRef(null);
  const autoPlayRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const getCardWidth = useCallback(() => {
    if (typeof window === "undefined") return 320;
    if (window.innerWidth < 480) return 300;
    if (window.innerWidth < 768) return 320;
    if (window.innerWidth < 1024) return 350;
    return 400;
  }, []);

  const scrollToIndex = useCallback(
    (index) => {
      if (!scrollRef.current || featured.length === 0) return;
      const safeIndex = Math.max(0, Math.min(index, featured.length - 1));
      const width = getCardWidth() + 24;
      scrollRef.current.scrollTo({
        left: safeIndex * width,
        behavior: "smooth",
      });
      setActiveIndex(safeIndex);
    },
    [featured.length, getCardWidth]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let timeout;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const width = getCardWidth() + 24;
        const index = Math.round(el.scrollLeft / width);
        setActiveIndex(Math.max(0, Math.min(index, featured.length - 1)));
      }, 100);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [featured.length, getCardWidth]);

  useEffect(() => {
    if (typeof window === "undefined" || featured.length <= 1) return;
    if (window.innerWidth >= 1024) return;

    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % featured.length;
        scrollToIndex(next);
        return next;
      });
    }, 4000);

    return () => clearInterval(autoPlayRef.current);
  }, [featured.length, scrollToIndex]);

  if (featured.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 lg:p-12">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-2">
            <Sparkles className="h-4 w-4 text-pink-300" />
            <span className="text-sm font-semibold text-pink-300">Trusted Home Services</span>
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-5xl">
            Book <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Verified</span> Workers
          </h1>
          <p className="text-base text-gray-300 sm:text-lg">
            Live profiles are not available right now. Check back shortly or browse all workers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/workers"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-bold text-white transition-all hover:from-pink-600 hover:to-purple-700"
            >
              Browse Workers
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/booking/new"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition-all hover:bg-white/15"
            >
              Start Booking
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="absolute inset-0">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 lg:hidden">
        <div className="relative overflow-hidden px-6 pb-2 pt-10">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent" />

          <div className="relative mb-8">
            <div className="mb-6 flex items-center justify-center">
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm shadow-lg">
                  <Sparkles className="h-4 w-4 text-pink-300" />
                  <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-sm font-bold text-transparent">
                    Trusted Home Services
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-center">
                <h1 className="text-4xl font-black text-white">
                  Book <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Top Rated</span> Workers
                </h1>

              <div className="pt-1">
                <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-sm">
                  <MoveLeft className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Swipe to explore verified worker profiles</span>
                  <MoveRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{heroStats.avgRating}</div>
                  <div className="text-xs text-gray-400">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">Live</div>
                  <div className="text-xs text-gray-400">Status</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{heroStats.workerCount}+</div>
                  <div className="text-xs text-gray-400">Workers</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              ref={scrollRef}
              className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden scroll-smooth px-[calc(50vw-160px)] py-8"
            >
              {featured.map((p, i) => (
                <div
                  key={`${p.id}-${i}`}
                  style={{ width: getCardWidth() }}
                  className="group relative h-[460px] shrink-0 snap-center overflow-hidden rounded-3xl bg-black sm:h-[500px] md:h-[520px]"
                >
                  <div className="absolute inset-0">
                    <CardImage src={p.image} alt={p.name} className="transition-transform duration-500 group-hover:scale-105" priority={i < 2} />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 space-y-3 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-white">{p.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-lg font-bold text-pink-400">INR {p.price}/hr</span>
                    </div>

                    <h3 className="text-xl font-bold text-white">{p.name}</h3>
                    <p className="line-clamp-2 text-sm text-gray-300">{p.bio}</p>

                    <Link
                      href={resolveWorkerHref(p)}
                      className="mt-3 block rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 text-center font-bold text-white transition-all hover:from-pink-600 hover:to-purple-700"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 pb-4">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  activeIndex === i ? "w-8 bg-gradient-to-r from-pink-500 to-purple-600" : "w-3 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 hidden lg:block">
        <div className="mx-auto max-w-7xl px-8 py-12">
          <div className="mb-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-pink-300" />
              <span className="text-sm font-semibold text-pink-300">Verified Local Pros</span>
            </div>

            <h1 className="mb-4 text-6xl font-bold text-white">
              Book <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Trusted</span> Home Services
            </h1>
            <p className="max-w-2xl text-xl text-gray-300">Find verified workers by area, rating and availability.</p>

            <div className="mt-8 flex gap-8">
              {[
                { icon: Users, value: `${heroStats.workerCount}+`, label: "Verified Workers" },
                { icon: Trophy, value: heroStats.avgRating, label: "Avg Rating" },
                { icon: Globe, value: `${heroStats.cityCount}+`, label: "Cities" },
                { icon: Zap, value: "Live", label: "Availability" },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-2">
                    <stat.icon className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid h-[760px] grid-cols-2 gap-8">
            <div className="group relative h-full overflow-hidden rounded-3xl">
              <div className="absolute inset-0">
                <CardImage src={featured[0]?.image} alt={featured[0]?.name || "Featured"} className="transition-transform duration-700 group-hover:scale-105" priority />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white">{featured[0]?.tier || "Premium"}</span>
                      <span className="flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-sm font-bold text-white">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {featured[0]?.rating?.toFixed(1)}
                      </span>
                    </div>
                    <h3 className="mb-1 text-3xl font-bold text-white">{featured[0]?.name}</h3>
                    <p className="max-w-xl line-clamp-2 text-sm text-gray-300">{featured[0]?.bio}</p>
                  </div>
                    <div className="text-right">
                      <div className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                        INR {featured[0]?.price}
                      </div>
                      <div className="text-sm text-gray-400">per hour</div>
                    </div>
                </div>
                <Link
                  href={resolveWorkerHref(featured[0])}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 font-bold text-white transition-all hover:from-pink-600 hover:to-purple-700"
                >
                  View Full Profile
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="grid h-full grid-rows-3 gap-6">
              <div className="group relative row-span-2 overflow-hidden rounded-2xl">
                <div className="absolute inset-0">
                  <CardImage src={featured[1]?.image} alt={featured[1]?.name || "Featured"} className="transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-xl font-bold text-white">{featured[1]?.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="flex items-center gap-1 font-bold text-white">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          {featured[1]?.rating?.toFixed(1)}
                        </span>
                        <span>• All-Rounder</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-pink-400">INR {featured[1]?.price}/hr</div>
                  </div>

                  <Link
                    href={resolveWorkerHref(featured[1])}
                    className="inline-block w-full rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-center text-sm font-bold text-white transition-all hover:from-pink-600 hover:to-purple-700"
                  >
                    View Profile
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[2, 3].map((index) => (
                  <div key={index} className="group relative overflow-hidden rounded-xl">
                    <div className="absolute inset-0">
                      <CardImage src={featured[index]?.image} alt={featured[index]?.name || "Featured"} className="transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h4 className="mb-1 line-clamp-1 text-sm font-bold text-white">{featured[index]?.name}</h4>
                          <div className="flex items-center gap-1 text-xs font-bold text-white">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {featured[index]?.rating?.toFixed(1)}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-pink-400">INR {featured[index]?.price}</div>
                      </div>

                      <Link
                        href={resolveWorkerHref(featured[index])}
                        className="inline-block w-full rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1.5 text-center text-xs font-bold text-white transition-all hover:from-pink-600 hover:to-purple-700"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-6">
            {[4, 5, 6, 7].map((index) => (
              <div key={index} className="group relative h-[190px] overflow-hidden rounded-xl">
                <div className="absolute inset-0">
                  <CardImage src={featured[index]?.image} alt={featured[index]?.name || "Featured"} className="transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h4 className="line-clamp-1 text-sm font-bold text-white">{featured[index]?.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-white">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {featured[index]?.rating?.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-pink-400">INR {featured[index]?.price}</div>
                  </div>

                  <Link
                    href={resolveWorkerHref(featured[index])}
                    className="inline-block w-full rounded-lg border border-white/10 bg-gradient-to-r from-pink-500/80 to-purple-600/80 px-3 py-1.5 text-center text-xs font-bold text-white transition-all hover:from-pink-600 hover:to-purple-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/workers"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-10 py-4 text-lg font-bold text-white transition-all hover:from-pink-600 hover:to-purple-700"
            >
              View All {heroStats.workerCount || featured.length}+ Workers
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
