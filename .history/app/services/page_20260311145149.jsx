"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Users,
  Filter,
  Grid3x3,
  List,
  ChevronDown,
  Heart,
  Share2,
  Shield,
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Award,
  Camera,
  MessageCircle,
  Phone,
  Calendar,
  X
} from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popular");

  const categories = [
    { id: "all", name: "All Services", icon: Grid3x3 },
    { id: "massage", name: "Massage", icon: Sparkles },
    { id: "companion", name: "Companion", icon: Users },
    { id: "vip", name: "VIP", icon: Award },
    { id: "travel", name: "Travel", icon: MapPin },
    { id: "events", name: "Events", icon: Calendar },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (sortBy) params.set("sort", sortBy);
        
        const res = await fetch(`/api/services?${params.toString()}`);
        const data = await res.json();
        setServices(data.services || []);
      } catch (error) {
        console.error("Failed to load services:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(load, 300);
    return () => clearTimeout(debounce);
  }, [query, selectedCategory, sortBy]);

  const filteredServices = services.filter(service => 
    service.basePrice >= priceRange.min && service.basePrice <= priceRange.max
  );

  const sortServices = (services) => {
    switch(sortBy) {
      case "price-low":
        return [...services].sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
      case "price-high":
        return [...services].sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
      case "rating":
        return [...services].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "newest":
        return [...services].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return services;
    }
  };

  const displayedServices = sortServices(filteredServices);

  const ServiceCard = ({ service, index }) => (
    <article className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        {service.images?.[0] ? (
          <img
            src={service.images[0]}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <Camera className="h-12 w-12 text-slate-700" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-1">
          {service.verified && (
            <span className="rounded-full bg-emerald-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Verified
            </span>
          )}
          {service.featured && (
            <span className="rounded-full bg-amber-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Featured
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-rose-600/80">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white line-clamp-1">
              {service.title || `Service ${index + 1}`}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-white">{service.rating || "4.5"}</span>
              </div>
              <span className="text-xs text-slate-500">({service.reviews || 0} reviews)</span>
              <span className="text-xs text-slate-600">•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-500" />
                <span className="text-xs text-slate-400">{service.city || "Mumbai"}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mb-3 text-sm text-slate-400 line-clamp-2">
          {service.description || "Professional escort service with verified companions."}
        </p>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {service.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Pricing */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Starting from</p>
            <p className="text-lg font-bold text-white">₹{service.basePrice}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Visit fee</p>
            <p className="text-sm font-medium text-emerald-400">₹{service.visitFee || 500}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/service/${service.slug || service._id}`}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-center text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            View Details
          </Link>
          <Link
            href={`/booking/new?serviceId=${service._id}`}
            className="flex-1 rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 px-3 py-2 text-center text-sm font-medium text-white transition hover:from-sky-500 hover:to-sky-400"
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );

  const ServiceListItem = ({ service, index }) => (
    <article className="group flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm transition-all hover:border-sky-500/50 md:flex-row">
      {/* Image */}
      <div className="relative h-32 w-full overflow-hidden rounded-lg md:w-48">
        {service.images?.[0] ? (
          <img
            src={service.images[0]}
            alt={service.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <Camera className="h-8 w-8 text-slate-700" />
          </div>
        )}
        {service.verified && (
          <div className="absolute left-2 top-2 rounded-full bg-emerald-500 p-1">
            <CheckCircle className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{service.title || `Service ${index + 1}`}</h3>
            <div className="mt-1 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-white">{service.rating || "4.5"}</span>
              </div>
              <span className="text-xs text-slate-500">{service.city || "Mumbai"}</span>
              <span className="text-xs text-slate-500">{service.duration || "2 hrs"}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">₹{service.basePrice}</p>
            <p className="text-xs text-slate-500">+₹{service.visitFee || 500} visit fee</p>
          </div>
        </div>

        <p className="mb-3 text-sm text-slate-400 line-clamp-2">
          {service.description || "Professional escort service with verified companions."}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Link
              href={`/service/${service.slug || service._id}`}
              className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Details
            </Link>
            <Link
              href={`/booking/new?serviceId=${service._id}`}
              className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-500"
            >
              Book Now
            </Link>
          </div>
          <div className="flex gap-1">
            <button className="rounded-full p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white">
              <Heart className="h-4 w-4" />
            </button>
            <button className="rounded-full p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Escort Service Catalog</h1>
          <p className="mt-2 text-slate-400">
            Choose from verified escort and companionship services in your city
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none"
                placeholder="Search by service name, location, or keywords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* View Toggle & Filter Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>

              <div className="flex rounded-lg border border-slate-700 bg-slate-800/50">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-l-lg p-2.5 transition ${
                    viewMode === "grid" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-r-lg p-2.5 transition ${
                    viewMode === "list" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <Link
                href="/booking/new"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:from-sky-500 hover:to-sky-400"
              >
                <Calendar className="h-4 w-4" />
                New Booking
              </Link>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 grid gap-4 border-t border-slate-800 pt-4 md:grid-cols-4">
              {/* Categories */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Category</label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 p-2.5 text-sm text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Sort By</label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 p-2.5 text-sm text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Price Range: ₹{priceRange.min} - ₹{priceRange.max}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                    className="flex-1 accent-sky-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="flex-1 accent-sky-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === cat.id
                    ? "bg-sky-600 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {displayedServices.length} {displayedServices.length === 1 ? "service" : "services"}
          </p>
          {loading && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-sky-500" />
              <span className="text-xs text-slate-400">Loading...</span>
            </div>
          )}
        </div>

        {/* Services Grid/List */}
        {loading && displayedServices.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-sky-500" />
          </div>
        ) : displayedServices.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayedServices.map((service, idx) => (
                <ServiceCard key={service._id} service={service} index={idx} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedServices.map((service, idx) => (
                <ServiceListItem key={service._id} service={service} index={idx} />
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <div className="mb-4 rounded-full bg-slate-800 p-4">
              <Search className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">No services found</h3>
            <p className="mb-4 text-sm text-slate-400">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setSelectedCategory("all");
                setPriceRange({ min: 0, max: 10000 });
                setSortBy("popular");
              }}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Featured Section */}
        {!query && selectedCategory === "all" && displayedServices.length > 0 && (
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Featured Services</h2>
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedServices.filter(s => s.featured).slice(0, 3).map((service, idx) => (
                <div key={service._id} className="relative">
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 opacity-30 blur" />
                  <ServiceCard service={service} index={idx} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}