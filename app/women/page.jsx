import PageShell from "@/components/PageShell";
import ProviderGrid from "@/components/ProviderGrid";
import { extendedProviders } from "@/data/providers";
import { Sparkles, Shield, Star, Filter, Search, MapPin, ChevronDown, Check, Zap, Heart, Clock, Users } from "lucide-react";

export const metadata = {
  title: "Elite Female Companions | Valentina's",
  description: "Discover verified, premium female companions offering discreet, refined experiences for discerning clients",
};

export default function WomenPage() {
  const womenProviders = extendedProviders.filter(
    (p) =>
      p.gender?.toLowerCase() === "female" ||
      p.category?.toLowerCase() === "women"
  );

  const premiumCount = womenProviders.filter(p => p.isPremium).length;
  const verifiedCount = womenProviders.filter(p => p.isVerified).length;
  const availableNow = womenProviders.filter(p => p.isAvailable).length;

  return (
    <PageShell>
      {/* COMPACT HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#0F0F1F] border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
        <div className="absolute -right-20 -top-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 bottom-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <span className="text-sm font-medium text-pink-400 tracking-wider uppercase">
                  Premium Selection
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                Elite Female
                <span className="block mt-1 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Companions
                </span>
              </h1>
              
              <p className="mt-4 max-w-2xl text-lg text-white/70 leading-relaxed">
                Discover discreet, verified companions offering refined experiences 
                and premium presence for discerning individuals.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-3">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <Users className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{womenProviders.length}</p>
                  <p className="text-xs text-white/60">Available</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{verifiedCount}</p>
                  <p className="text-xs text-white/60">Verified</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{premiumCount}</p>
                  <p className="text-xs text-white/60">Premium</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{availableNow}</p>
                  <p className="text-xs text-white/60">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENHANCED FILTERS & SEARCH */}
      <section className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left: Quick Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm transition-all hover:scale-105 group">
                <Filter className="w-4 h-4 group-hover:text-pink-400" />
                <span>Filters</span>
              </button>
              
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                {["All", "Premium", "Verified", "Available Now", "New"].map((filter) => (
                  <button 
                    key={filter}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-medium whitespace-nowrap transition-all"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Search & Location */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="search"
                  placeholder="Search companions..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-pink-500"
                />
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm transition-all hover:scale-105">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Location</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {/* Header with Benefits */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Curated Selection
              </h2>
              <p className="text-white/60 max-w-2xl">
                Each companion undergoes rigorous verification for safety and discretion. 
                Profiles are regularly updated for accuracy.
              </p>
            </div>
            
            {/* Premium Benefits */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30">
                <Zap className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-xs font-medium text-white">VIP Access</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-white">Verified</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium text-white">24/7</span>
              </div>
            </div>
          </div>

          {/* Featured Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <Check className="w-5 h-5 text-pink-400" />
                </div>
                <h3 className="font-semibold text-white">Verified Profiles</h3>
              </div>
              <p className="text-sm text-white/60">All companions undergo identity verification and background checks.</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white">Discretion Assured</h3>
              </div>
              <p className="text-sm text-white/60">Your privacy is our priority. All interactions are completely confidential.</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-semibold text-white">Premium Service</h3>
              </div>
              <p className="text-sm text-white/60">Exceptional service standards with dedicated concierge support.</p>
            </div>
          </div>
        </div>
        
        {/* Providers Grid */}
        {womenProviders.length > 0 ? (
          <ProviderGrid providers={womenProviders} />
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 mb-6">
              <Sparkles className="w-10 h-10 text-white/60" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              Currently Unavailable
            </h3>
            <p className="text-white/60 max-w-md mx-auto mb-8">
              Our premium companions are often in high demand. Check back soon or 
              contact our concierge for personalized recommendations.
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/30">
              Contact Concierge
            </button>
          </div>
        )}
      </section>

      {/* ENHANCED CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 via-white/10 to-white/5 border border-white/10 backdrop-blur-sm">
          {/* Background elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-pink-500/5 rounded-full -translate-x-16 -translate-y-16 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full translate-x-20 translate-y-20 blur-3xl" />
          
          <div className="relative p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-6">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-medium text-white">Premium Matchmaking</span>
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-4">
                Need a Perfect Match?
              </h3>
              <p className="text-white/70 mb-8 text-lg">
                Our dedicated concierge service matches you with the ideal companion 
                based on your preferences, schedule, and requirements.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group px-8 py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all transform hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/30 flex items-center justify-center gap-3">
                  <span>Book a Consultation</span>
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </button>
                <button className="px-8 py-3.5 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/30 transition-all transform hover:-translate-y-1">
                  View All Services
                </button>
              </div>
              
              <p className="text-sm text-white/40 mt-8">
                All consultations are confidential and tailored to your specific needs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}