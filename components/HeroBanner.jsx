"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
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
import { providers } from "../data/providers";

export default function HeroBanner() {
  const featured = [...providers].sort((a, b) => a.rank - b.rank).slice(0, 8);

  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const autoPlayRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  /* ---------------- FIXED CARD WIDTH ---------------- */
  const getCardWidth = useCallback(() => {
    if (typeof window === "undefined") return 320;
    if (window.innerWidth < 480) return 300;
    if (window.innerWidth < 768) return 320;
    if (window.innerWidth < 1024) return 350;
    return 400;
  }, []);

  /* ---------------- SNAP LOGIC ---------------- */
  const scrollToIndex = useCallback(
    (index) => {
      if (!scrollRef.current) return;
      const width = getCardWidth() + 24;
      scrollRef.current.scrollTo({
        left: index * width,
        behavior: "smooth",
      });
      setActiveIndex(index);
    },
    [getCardWidth]
  );

  /* ---------------- ARROWS ---------------- */
  const scrollBy = (dir) => {
    const next =
      dir === "left"
        ? Math.max(0, activeIndex - 1)
        : Math.min(featured.length - 1, activeIndex + 1);
    scrollToIndex(next);
  };

  /* ---------------- SCROLL SNAP (NATIVE) ---------------- */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let timeout;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const width = getCardWidth() + 24;
        const index = Math.round(el.scrollLeft / width);
        setActiveIndex(index);
      }, 100);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [getCardWidth]);

  /* ---------------- AUTOPLAY (MOBILE ONLY) ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 1024) return;

    autoPlayRef.current = setInterval(() => {
      scrollToIndex((activeIndex + 1) % featured.length);
    }, 4000);

    return () => clearInterval(autoPlayRef.current);
  }, [activeIndex, featured.length, scrollToIndex]);

  /* ===================================================== */

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 blur-3xl rounded-full" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* ---------------- MOBILE / TABLET ---------------- */}
      <div className="lg:hidden   relative z-10">
        <div className="lg:hidden pt-10 relative z-10 overflow-hidden">
  {/* Gradient Background */}
  <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent" />
  
  <div className="relative px-6 mb-8">
    {/* Premium Tag */}
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 shadow-lg">
        <div className="relative">
          <Sparkles className="w-4 h-4 text-pink-300" />
          <div className="absolute -inset-1 bg-pink-400/20 blur-sm rounded-full" />
        </div>
        <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
          Exclusive Talent
        </span>
        <div className="ml-2 w-1 h-1 rounded-full bg-pink-400" />
      </div>
    </div>

    {/* Main Headline */}
    <div className="text-center space-y-4">
      <div className="relative inline-block">
        <h1 className="text-4xl font-black text-white">
          Discover{" "}
          <span className="relative">
            <span className="relative z-10 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Exceptional
            </span>
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-80" />
            <span className="absolute -bottom-1.5 left-1/4 right-1/4 h-px bg-gradient-to-r from-pink-400/50 to-purple-400/50 blur-sm" />
          </span>{" "}
          Talent
        </h1>
      </div>

      {/* Subtitle with Direction */}
      <div className="pt-2">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-2">
            <MoveLeft className="w-4 h-4 text-gray-400" />
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-300 font-medium">Swipe</span>
              <div className="w-6 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mt-0.5" />
            </div>
            <MoveRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="h-6 w-px bg-white/20" />
          <p className="text-sm text-gray-300">
            Explore top-rated professionals
          </p>
        </div>
      </div>

      {/* Stats Preview */}
      <div className="pt-3 flex justify-center gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">4.9★</div>
          <div className="text-xs text-gray-400">Avg Rating</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">24h</div>
          <div className="text-xs text-gray-400">Response</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">500+</div>
          <div className="text-xs text-gray-400">Talent</div>
        </div>
      </div>
    </div>
  </div>

  {/* Bottom Glow */}
  <div className="absolute -bottom-4 inset-x-0 h-8 bg-gradient-to-t from-black/30 to-transparent" />
</div>
        {/* SLIDER */}
        <div ref={containerRef} className="relative">
          {/* SCROLL CONTAINER */}
          <div
  ref={scrollRef}
  className="
    flex gap-6 px-[calc(50vw-160px)] py-10
    overflow-x-auto
+   overflow-y-hidden
    scroll-smooth
    snap-x snap-mandatory
    no-scrollbar
  "
>

            {featured.map((p) => (
              <div
                key={p.id}
                style={{ width: getCardWidth() }}
                className="
                  snap-center
                  shrink-0
                  relative
                  rounded-3xl
                  overflow-hidden
                  bg-black
                  h-[460px]
                  sm:h-[500px]
                  md:h-[520px]
                  group
                "
              >
                {/* IMAGE WITH PROPER OBJECT FIT */}
                <div className="absolute inset-0">
                  <Image
                    src={p.images?.[0] || "/placeholder.jpg"}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes={`(max-width: 768px) ${getCardWidth()}px`}
                    priority={featured.indexOf(p) < 2}
                  />
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold">{p.rating}</span>
                    </div>
                    <span className="text-pink-400 font-bold text-lg">
                      €{p.ratePerHour}/h
                    </span>
                  </div>
                  
                  <h3 className="text-white font-bold text-xl">{p.name}</h3>
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {p.bio}
                  </p>
                  
                  <Link
                    href={`/providers/${p.slug}`}
                    className="mt-3 block bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl text-center font-bold hover:from-pink-600 hover:to-purple-700 transition-all"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DOTS */}
        <div className="flex justify-center gap-2 pb-6">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all ${
                activeIndex === i
                  ? "w-8 bg-gradient-to-r from-pink-500 to-purple-600"
                  : "w-3 bg-white/30"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-center gap-2 text-gray-400 pb-8 text-sm">
          <MoveLeft className="w-4 h-4" /> Swipe <MoveRight className="w-4 h-4" />
        </div>
      </div>

      {/* ---------------- DESKTOP GRID ---------------- */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 py-12 min-h-300 flex flex-col">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 mb-4">
              <Sparkles className="h-4 w-4 text-pink-300" />
              <span className="text-pink-300 text-sm font-semibold">Premium Selection</span>
            </div>
            
            <h1 className="text-6xl font-bold text-white mb-4">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Exceptional</span> Talent
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Handpicked professionals delivering outstanding results
            </p>
            
            {/* Stats */}
            <div className="flex gap-8 mt-8">
              {[
                { icon: Users, value: "10K+", label: "Talent Pool" },
                { icon: Trophy, value: "4.9★", label: "Avg Rating" },
                { icon: Globe, value: "150+", label: "Countries" },
                { icon: Zap, value: "24h", label: "Avg Response" },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20">
                    <stat.icon className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid Container */}
          <div className="flex-1 grid grid-cols-2 gap-8">
            {/* Large Featured Card */}
            <div className="relative group rounded-3xl overflow-hidden">
              <div className="absolute inset-0">
                {featured[0]?.images?.[0] ? (
                  <Image
                    src={featured[0].images[0]}
                    alt={featured[0].name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1536px) 50vw, 800px"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600" />
                )}
              </div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-sm">
                        <span className="text-white text-xs font-bold">{featured[0]?.tier || "Premium"}</span>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-white text-sm font-bold">{featured[0]?.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                      {featured[0]?.name}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-2 max-w-xl">
                      {featured[0]?.bio}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                      €{featured[0]?.ratePerHour}
                    </div>
                    <div className="text-gray-400 text-sm">per hour</div>
                  </div>
                </div>
                
                <Link
                  href={`/providers/${featured[0]?.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:shadow-pink-500/20"
                >
                  View Full Profile
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Right Column - Grid */}
            <div className="grid grid-rows-3 gap-6">
              {/* Top Card (Row 1-2) */}
              <div className="relative group rounded-2xl overflow-hidden row-span-2">
                <div className="absolute inset-0">
                  {featured[1]?.images?.[0] ? (
                    <Image
                      src={featured[1].images[0]}
                      alt={featured[1].name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 1536px) 25vw, 400px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-pink-600/90" />
                  )}
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {featured[1]?.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-white text-sm font-bold">{featured[1]?.rating}</span>
                        </div>
                        <span className="text-gray-300 text-sm">• {featured[1]?.specialties?.[0] || "Expert"}</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-pink-400">
                      €{featured[1]?.ratePerHour}<span className="text-gray-400 text-sm">/h</span>
                    </div>
                  </div>
                  
                  <Link
                    href={`/providers/${featured[1]?.slug}`}
                    className="inline-block w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-center rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all text-sm"
                  >
                    View Profile
                  </Link>
                </div>
              </div>

              {/* Bottom Two Cards (Row 3) */}
              <div className="grid grid-cols-2 gap-6">
                {[2, 3].map((index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden">
                    <div className="absolute inset-0">
                      {featured[index]?.images?.[0] ? (
                        <Image
                          src={featured[index].images[0]}
                          alt={featured[index].name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 1536px) 12.5vw, 250px h-20"
                        />
                      ) : (
                        <div className={`absolute inset-0 ${
                          index === 2 
                            ? 'bg-gradient-to-br from-purple-600/80 to-pink-600/80' 
                            : 'bg-gradient-to-br from-pink-600/80 to-purple-600/80'
                        }`} />
                      )}
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">
                            {featured[index]?.name}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-white text-xs font-bold">{featured[index]?.rating}</span>
                          </div>
                        </div>
                        <div className="text-pink-400 font-bold text-sm">
                          €{featured[index]?.ratePerHour}
                        </div>
                      </div>
                      
                      <Link
                        href={`/providers/${featured[index]?.slug}`}
                        className="inline-block w-full py-1.5 px-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-center rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all text-xs"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Talent Cards Row */}
          <div className="grid grid-cols-4 gap-6 mt-8">
            {[4, 5, 6, 7].map((index) => (
              <div key={index} className="relative group rounded-xl overflow-hidden">
                <div className="absolute inset-0">
                  {featured[index]?.images?.[0] ? (
                    <Image
                      src={featured[index].images[0]}
                      alt={featured[index].name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 1536px) 25vw, 300px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-pink-600/80" />
                  )}
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {featured[index]?.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-xs">{featured[index]?.rating}</span>
                      </div>
                    </div>
                    <div className="text-pink-400 font-bold text-sm">
                      €{featured[index]?.ratePerHour}
                    </div>
                  </div>
                  
                  <Link
                    href={`/providers/${featured[index]?.slug}`}
                    className="inline-block w-full py-1.5 px-3 bg-gradient-to-r from-pink-500/80 to-purple-600/80 text-white font-bold text-center rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all text-xs border border-white/10"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-12 text-center">
            <Link
              href="/providers"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl hover:shadow-pink-500/30"
            >
              View All {providers.length}+ Providers
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}