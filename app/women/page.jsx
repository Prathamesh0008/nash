"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import PageShell from "@/components/PageShell";
import ProviderGrid from "@/components/ProviderGrid";
import { extendedProviders } from "@/data/providers";
import {
  Sparkles,
  Shield,
  Star,
  Filter,
  Search,
  MapPin,
  ChevronDown,
  Check,
  Zap,
  Heart,
  Clock,
  Users
} from "lucide-react";

export default function WomenPage() {
  const searchParams = useSearchParams();

  /* ================= FILTER STATE ================= */
  const [filters, setFilters] = useState({
    category: [],
    country: "",
    price: { min: 0, max: 10000 },
    search: ""
  });

  /* ================= URL → STATE SYNC ================= */
  useEffect(() => {
    const category = searchParams.get("category");
    const country = searchParams.get("country");
    const min = searchParams.get("min");
    const max = searchParams.get("max");

    setFilters(prev => ({
      ...prev,
      category: category ? category.split(",") : [],
      country: country || "",
      price: {
        min: min ? Number(min) : 0,
        max: max ? Number(max) : 10000
      }
    }));
  }, [searchParams]);

  /* ================= BASE DATA ================= */
  const womenProviders = extendedProviders.filter(
    p =>
      p.gender?.toLowerCase() === "female" ||
      p.category?.toLowerCase() === "women"
  );

  const premiumCount = womenProviders.filter(p => p.isPremium).length;
  const verifiedCount = womenProviders.filter(p => p.isVerified).length;
  const availableNow = womenProviders.filter(p => p.isAvailable).length;

  /* ================= FILTER LOGIC ================= */
  const filteredProviders = womenProviders.filter(p => {
    // SEARCH
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !p.name?.toLowerCase().includes(q) &&
        !p.category?.toLowerCase().includes(q) &&
        !p.country?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    // CATEGORY
    if (
      filters.category.length &&
      !filters.category.some(c =>
        p.category?.toLowerCase().includes(c.toLowerCase())
      )
    ) {
      return false;
    }

    // COUNTRY
    if (filters.country && p.country !== filters.country) {
      return false;
    }

    // PRICE
    if (
      p.ratePerHour < filters.price.min ||
      p.ratePerHour > filters.price.max
    ) {
      return false;
    }

    return true;
  });

  /* ================= HANDLERS ================= */
  const handleSearchChange = e => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleQuickFilter = type => {
    if (type === "All") {
      setFilters({
        category: [],
        country: "",
        price: { min: 0, max: 10000 },
        search: ""
      });
    }
  };

  /* ================= UI ================= */
  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#0F0F1F] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <span className="text-sm font-medium text-pink-400 uppercase">
                  Premium Selection
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                Elite Female
                <span className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Companions
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-white/70">
                Discover discreet, verified companions offering refined
                experiences.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <Stat label="Available" value={womenProviders.length} icon={Users} />
              <Stat label="Verified" value={verifiedCount} icon={Shield} />
              <Stat label="Premium" value={premiumCount} icon={Star} />
              <Stat label="Online" value={availableNow} icon={Clock} />
            </div>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="sticky top-0 z-20 bg-black/90 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-4 justify-between">
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              {/* <Filter className="w-4 h-4 inline mr-2" /> */}
              Filters
            </button>

            {["All", "Premium", "Verified", "Available Now"].map(f => (
              <button
                key={f}
                onClick={() => handleQuickFilter(f)}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs"
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="search"
              placeholder="Search companions..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* PROVIDERS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {filteredProviders.length > 0 ? (
          <ProviderGrid providers={filteredProviders} />
        ) : (
          <div className="text-center py-20 text-white/60">
            No providers match your filters.
          </div>
        )}
      </section>
    </PageShell>
  );
}

/* ================= STAT CARD ================= */
function Stat({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
      <Icon className="w-5 h-5 text-pink-400" />
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/60">{label}</p>
      </div>
    </div>
  );
}
