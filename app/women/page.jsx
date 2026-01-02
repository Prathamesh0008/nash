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
  Search,
  Users,
  Clock,
  Filter,
  ChevronRight,
  X,
  Check
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const resetFilters = () => {
    setFilters({
      category: [],
      country: "",
      price: { min: 0, max: 10000 },
      search: ""
    });
  };

  /* ================= UI ================= */
  return (
    <PageShell>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-b border-gray-800">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-transparent to-purple-500/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-32 -translate-x-32" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 md:gap-12 lg:gap-16">
            {/* Hero Content */}
            <div className="flex-1 max-w-3xl w-full">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/20">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                </div>
                <span className="text-xs md:text-sm font-semibold text-pink-400 uppercase tracking-wider">
                  Curated Selection
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
                <span className="block">Exclusive</span>
                <span className="block mt-1 md:mt-2 bg-gradient-to-r from-pink-400 via-pink-300 to-purple-400 bg-clip-text text-transparent">
                  Female Companions
                </span>
              </h1>

              <p className="text-base md:text-lg text-gray-300 max-w-2xl mb-6 md:mb-8">
                Discover verified, premium companions offering sophisticated experiences
                with complete discretion and professionalism.
              </p>

              {/* Mobile Stats (Hidden on desktop) */}
              <div className="lg:hidden grid grid-cols-2 gap-3 mb-8">
                <MobileStat label="Total" value={womenProviders.length} />
                <MobileStat label="Verified" value={verifiedCount} />
                <MobileStat label="Premium" value={premiumCount} />
                <MobileStat label="Available" value={availableNow} />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 md:gap-3">
                <Badge icon={Shield} text="Verified Profiles" color="emerald" />
                <Badge icon={Star} text="Premium Quality" color="amber" />
                <Badge icon={Clock} text="Real-time Availability" color="blue" />
              </div>
            </div>

            {/* Desktop Stats Grid */}
            <div className="hidden lg:flex w-full lg:w-auto">
              <div className="grid grid-cols-2 gap-4 min-w-[280px]">
                <StatCard 
                  label="Total Companions" 
                  value={womenProviders.length} 
                  icon={Users}
                  color="pink"
                />
                <StatCard 
                  label="Verified" 
                  value={verifiedCount} 
                  icon={Shield}
                  color="emerald"
                />
                <StatCard 
                  label="Premium" 
                  value={premiumCount} 
                  icon={Star}
                  color="amber"
                />
                <StatCard 
                  label="Available Now" 
                  value={availableNow} 
                  icon={Clock}
                  color="blue"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Results Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Available Companions
              </h2>
              <p className="text-sm md:text-base text-gray-400">
                Showing {filteredProviders.length} of {womenProviders.length} results
              </p>
            </div>
            
            {/* Mobile Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-300">{verifiedCount} Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-gray-300">{premiumCount} Premium</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredProviders.length > 0 ? (
          <ProviderGrid providers={filteredProviders} />
        ) : (
          <div className="text-center py-16 md:py-20 lg:py-24">
            <div className="max-w-md mx-auto px-4">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-800/50">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                No matches found
              </h3>
              <p className="text-gray-400 mb-8">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition-colors"
                >
                  Reset all filters
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl font-medium transition-colors border border-gray-700"
                >
                  Adjust filters
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, icon: Icon, color = "gray" }) {
  const colorClasses = {
    pink: "bg-pink-500/20 text-pink-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/20 text-amber-400",
    blue: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className={`p-1.5 md:p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
      <div className="mt-1 md:mt-2 h-1 w-8 md:w-12 rounded-full bg-gradient-to-r from-current to-transparent opacity-50" />
    </div>
  );
}

function MobileStat({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function Badge({ icon: Icon, text, color = "gray" }) {
  const colorClasses = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    pink: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClasses[color]}`}>
      <Icon className="w-3 h-3" />
      <span className="text-xs font-medium">{text}</span>
    </div>
  );
}

function FilterPill({ label, onRemove }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-lg">
      <span className="text-sm text-gray-300">{label}</span>
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-gray-300 transition-colors"
        aria-label="Remove filter"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}