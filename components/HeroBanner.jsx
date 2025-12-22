"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Star,
  CheckCircle,
} from "lucide-react";
import { providers } from "../data/providers";

export default function HeroBanner() {
  const featured = [...providers].sort((a, b) => a.rank - b.rank).slice(0, 5);
  const [index, setIndex] = useState(0);

  // auto rotate
  useEffect(() => {
    if (!featured.length) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 6000);
    return () => clearInterval(id);
  }, [featured.length]);

  const active = featured[index];

  const prev = () =>
    setIndex((i) => (i - 1 + featured.length) % featured.length);
  const next = () =>
    setIndex((i) => (i + 1) % featured.length);

  return (
   <section
  className="
    relative w-full overflow-hidden
    min-h-[70svh]
    md:min-h-[calc(100svh-72px)]
  "
>


      {/* BACKGROUND IMAGES */}
      {featured.map((c, i) => (
        <div
          key={c.id}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          {c.images?.[0] ? (
            <Image
              src={c.images[0]}
              alt={c.name}
              fill
              priority={i === index}
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600" />
          )}
        </div>
      ))}

      {/* OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.35),transparent_45%)]" />

      {/* CONTENT */}
      {active && (
       <div
  className="
    relative z-10
    max-w-7xl mx-auto px-6
    pt-24 pb-16

    md:absolute
    md:left-0
    md:right-0
    md:bottom-0
    md:pb-28
  "
>




          <div className="max-w-2xl text-white">
            {/* BADGES */}
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <CheckCircle className="h-4 w-4" />
                Verified
              </span>

              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-semibold">
                <Star className="h-4 w-4" />
                {active.rating}
              </span>

              <span className="flex items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-semibold">
                <Crown className="h-4 w-4" />
                Exclusive Selection
              </span>
            </div>

            {/* NAME */}
            <h1 className="text-5xl md:text-6xl font-light tracking-tight">
              {active.name}
            </h1>

            <p className="mt-3 text-white/80 text-lg">
              {active.bio}
            </p>

            {/* PRICE */}
            <div className="mt-6 flex items-center gap-4">
              <div className="text-5xl font-bold text-pink-400">
                €{active.ratePerHour}
              </div>
              <span className="text-white/60 text-lg">/ hour</span>

              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold">
                {active.tier}
              </span>
            </div>

            {/* TAGS */}
            <div className="mt-5 flex gap-3 flex-wrap">
              {active.specialties.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* ACTIONS */}
           <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
  <button className="w-full sm:w-auto px-8 py-3 rounded-xl
                     bg-gradient-to-r from-pink-600 to-purple-600
                     hover:from-pink-700 hover:to-purple-700
                     font-semibold shadow-lg transition">
    Unlock Full Profile
  </button>

  <button className="w-full sm:w-auto px-8 py-3 rounded-xl
                     bg-white text-gray-900 font-semibold
                     hover:bg-gray-100 transition">
    Private Message
  </button>
</div>

          </div>
        </div>
      )}

      {/* ARROWS */}
      <button
        onClick={prev}
        className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
      >
        <ChevronLeft />
      </button>

      <button
        onClick={next}
        className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
      >
        <ChevronRight />
      </button>
    </section>
  );
}
