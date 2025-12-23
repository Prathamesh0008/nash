"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Users,
  Award,
  Shield,
  Sparkles,
  Globe,
  Languages,
  Ruler,
  Droplets,
  TrendingUp,
  Eye,
  BookOpen,
  Briefcase,
  Coffee,
  Plane,
  Music,
  Camera,
  Gift,
  Lock,
  Bell,
  Filter,
  Bookmark,
  MoreVertical,
  Tag,
  Percent,
  Zap,
  Crown,
  Gem,
  Diamond,
  Moon,
  Sun,
  Palette,
  Cake,
  Gamepad2,
  Wine,
  Trophy,
  Target,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { providers } from "@/data/providers";
import { useState, useEffect, useRef } from "react";

export default function ProviderProfilePage() {
  const { slug } = useParams();
  const provider = providers.find((p) => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const intervalRef = useRef(null);

  // Mock data for enhanced features
  const detailedStats = {
    responseTime: "15 min",
    completionRate: "98%",
    repeatClients: "72%",
    totalHours: "1.2k+",
    satisfaction: "4.9/5",
    cancellationRate: "2%",
  };

  const availabilitySchedule = [
    { day: "Mon", slots: ["10:00-14:00", "18:00-22:00"] },
    { day: "Tue", slots: ["09:00-13:00", "19:00-23:00"] },
    { day: "Wed", slots: ["11:00-15:00", "20:00-00:00"] },
    { day: "Thu", slots: ["10:00-16:00", "18:00-22:00"] },
    { day: "Fri", slots: ["12:00-18:00", "20:00-02:00"] },
    { day: "Sat", slots: ["14:00-22:00"] },
    { day: "Sun", slots: ["16:00-20:00"] },
  ];

  const allServices = [
    { name: "Dinner Dates", icon: <Coffee className="h-4 w-4" />, price: provider.ratePerHour, duration: "2h min" },
    { name: "Event Escort", icon: <Award className="h-4 w-4" />, price: provider.ratePerHour * 1.5, duration: "3h min" },
    { name: "Travel Companion", icon: <Plane className="h-4 w-4" />, price: provider.ratePerHour * 2, duration: "Full day" },
    { name: "Social Events", icon: <Users className="h-4 w-4" />, price: provider.ratePerHour * 1.2, duration: "4h min" },
    { name: "Personal Shopping", icon: <ShoppingBag className="h-4 w-4" />, price: provider.ratePerHour, duration: "3h min" },
    { name: "Business Events", icon: <Briefcase className="h-4 w-4" />, price: provider.ratePerHour * 1.8, duration: "5h min" },
    { name: "Concert Partner", icon: <Music className="h-4 w-4" />, price: provider.ratePerHour * 1.3, duration: "4h min" },
    { name: "Photoshoot Model", icon: <Camera className="h-4 w-4" />, price: provider.ratePerHour * 2, duration: "3h min" },
  ];

  const reviews = [
    {
      name: "Alexander",
      rating: 5,
      date: "2 days ago",
      comment: "Absolutely stunning company! Made the evening unforgettable. Professional, elegant, and great conversation.",
      verified: true,
    },
    {
      name: "Michael",
      rating: 4.5,
      date: "1 week ago",
      comment: "Perfect for business events. Very professional and made great impressions with clients.",
      verified: true,
    },
    {
      name: "David",
      rating: 5,
      date: "2 weeks ago",
      comment: "Traveled to Paris together. Best companion I could ask for. Handled everything perfectly.",
      verified: true,
    },
  ];

  const languages = [
    { language: "English", level: "Native" },
    { language: "French", level: "Fluent" },
    { language: "Spanish", level: "Intermediate" },
    { language: "Italian", level: "Basic" },
  ];

  // Auto-slideshow functionality
  useEffect(() => {
    if (!provider || !isPlaying || isHovering) return;

    intervalRef.current = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % provider.images.length);
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [provider, isPlaying, isHovering]);

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev - 1 + provider.images.length) % provider.images.length);
    resetAutoPlay();
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % provider.images.length);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (isPlaying && provider) {
      intervalRef.current = setInterval(() => {
        setSelectedImage((prev) => (prev + 1) % provider.images.length);
      }, 4000);
    }
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#0b0214] via-purple-950 to-black">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-light mb-2">Provider Not Found</h1>
          <p className="text-white/60">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0214] via-purple-950 to-black text-white">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-pink-900/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-pink-900/5 to-purple-900/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12 relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-white/60">
              <span>Escorts</span>
              <span>•</span>
              <span>London</span>
              <span>•</span>
              <span className="text-white">Profile</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <Bookmark className={`h-5 w-5 ${isFavorited ? 'fill-pink-500 text-pink-500' : ''}`} />
            </button>
            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* LEFT – LARGE IMAGE GALLERY WITH SLIDESHOW */}
          <div className="lg:col-span-3 space-y-6">
            {/* Premium Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
                  <Crown className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">Premium Elite</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">ID Verified</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/60">Profile views: 2.4k</span>
                <Eye className="h-4 w-4 text-white/40" />
              </div>
            </div>

            {/* Main Image Container */}
            <div 
              className="relative aspect-[4/5] rounded-3xl overflow-hidden group border-2 border-white/10"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* All Images Stack */}
              <div className="absolute inset-0">
                {provider.images.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === selectedImage ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10"></div>
                    <Image
                      src={img}
                      alt={`${provider.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              {/* Top Controls */}
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button 
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all hover:scale-110"
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? 'fill-pink-500 text-pink-500' : ''}`} />
                </button>
                <button className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all hover:scale-110">
                  <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={toggleAutoPlay}
                  className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all hover:scale-110"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Image Info */}
              <div className="absolute bottom-4 left-4 z-20">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-sm">
                    {selectedImage + 1} / {provider.images.length}
                  </div>
                  <div className={`px-3 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium ${provider.available ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                    {provider.available ? "🟢 Available Now" : "🔴 Busy"}
                  </div>
                </div>
              </div>
              
              {/* Tags Overlay */}
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/30 text-xs">
                  Elegant
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 text-xs">
                  VIP
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-5 gap-3">
              {provider.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedImage(i);
                    resetAutoPlay();
                  }}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 group ${
                    selectedImage === i 
                      ? 'border-pink-500 scale-105 shadow-lg shadow-pink-500/30' 
                      : 'border-white/10 hover:border-white/30 hover:scale-102'
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute inset-0 transition-all duration-300 ${
                    selectedImage === i 
                      ? 'bg-gradient-to-tr from-pink-500/30 to-purple-500/30' 
                      : 'bg-black/40 group-hover:bg-black/20'
                  }`}></div>
                  {isPlaying && selectedImage === i && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  {/* Hover View Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-6 w-6 text-white/80" />
                  </div>
                </button>
              ))}
            </div>

            {/* Detailed Stats Grid */}
            <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(detailedStats).map(([key, value]) => (
                  <div key={key} className="text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                      {value}
                    </div>
                    <div className="text-xs text-white/60 mt-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-white/10">
              {["overview", "services", "reviews", "availability"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 py-3 text-sm font-medium transition-all relative ${
                    selectedTab === tab 
                      ? "text-white" 
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {selectedTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="pt-6">
              {selectedTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3">About {provider.name.split(' ')[0]}</h4>
                    <p className="text-white/80 leading-relaxed">
                      {provider.bio}
                    </p>
                    <p className="text-white/70 mt-3">
                      With over 2 years of experience in elite companionship, I specialize in creating memorable experiences 
                      for sophisticated gentlemen. My approach combines elegance, discretion, and genuine connection.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-white/90">Languages</h5>
                      {languages.map((lang, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-white/60" />
                            <span>{lang.language}</span>
                          </div>
                          <span className="text-sm text-white/60">{lang.level}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-white/90">Personal Details</h5>
                      {[
                        { icon: <Ruler className="h-4 w-4" />, label: "Height", value: "170cm" },
                        { icon: <Droplets className="h-4 w-4" />, label: "Hair Color", value: "Brunette" },
                        { icon: <Palette className="h-4 w-4" />, label: "Eye Color", value: "Brown" },
                        { icon: <Cake className="h-4 w-4" />, label: "Education", value: "University" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                          <div className="p-1.5 rounded-lg bg-white/10">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-white/60">{item.label}</div>
                            <div className="font-medium">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "services" && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">All Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allServices.slice(0, showAllServices ? allServices.length : 4).map((service, i) => (
                      <div key={i} className="rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-4 hover:border-white/20 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                              {service.icon}
                            </div>
                            <div>
                              <div className="font-medium">{service.name}</div>
                              <div className="text-sm text-white/60">{service.duration}</div>
                            </div>
                          </div>
                          <div className="text-xl font-bold text-pink-400">
                            €{service.price}
                            <span className="text-sm text-white/60">/h</span>
                          </div>
                        </div>
                        <button className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
                          Book This Service
                        </button>
                      </div>
                    ))}
                  </div>
                  {allServices.length > 4 && (
                    <button
                      onClick={() => setShowAllServices(!showAllServices)}
                      className="w-full py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-sm"
                    >
                      {showAllServices ? "Show Less" : `Show ${allServices.length - 4} More Services`}
                    </button>
                  )}
                </div>
              )}

              {selectedTab === "reviews" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Client Reviews ({reviews.length})</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-lg font-bold">{provider.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reviews.slice(0, showAllReviews ? reviews.length : 2).map((review, i) => (
                      <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{review.name}</div>
                              {review.verified && (
                                <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">
                                  Verified
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                              <span>{review.date}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, starIndex) => (
                                  <Star 
                                    key={starIndex} 
                                    className={`h-3 w-3 ${starIndex < Math.floor(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-white/80">{review.comment}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="w-full py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                  >
                    {showAllReviews ? "Show Less Reviews" : "Load All Reviews"}
                  </button>
                </div>
              )}

              {selectedTab === "availability" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Weekly Schedule</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {availabilitySchedule.map((day, i) => (
                        <div key={i} className="text-center p-3 rounded-xl bg-white/5">
                          <div className="font-medium mb-2">{day.day}</div>
                          {day.slots.map((slot, slotIndex) => (
                            <div key={slotIndex} className="text-sm text-white/60 bg-white/5 rounded-lg p-1.5 mb-1">
                              {slot}
                            </div>
                          ))}
                          {day.slots.length === 0 && (
                            <div className="text-sm text-white/30">Unavailable</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-emerald-400" />
                      <div>
                        <div className="font-medium">Fast Response Time</div>
                        <div className="text-sm text-white/60">Typically replies within 15 minutes</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT – SIDEBAR CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header Card */}
            <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border border-white/10 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-light tracking-tight">
                    {provider.name}, <span className="text-white/70">{provider.age}</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-white/60" />
                    <span className="text-white/70">{provider.location}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    €{provider.ratePerHour}
                    <span className="text-lg">/h</span>
                  </div>
                  <div className="text-sm text-white/60">Starting rate</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Verified Profile
                </span>
                <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-sm">
                  Elite Companion
                </span>
                <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                  Discreet Service
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-white/60">Member Since</div>
                    <div className="font-medium">2022</div>
                  </div>
                  <div>
                    <div className="text-white/60">Last Active</div>
                    <div className="font-medium">Today</div>
                  </div>
                  <div>
                    <div className="text-white/60">Response Rate</div>
                    <div className="font-medium text-emerald-400">98%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-pink-400" />
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-semibold flex items-center justify-center gap-3 hover:from-pink-500 hover:to-purple-500 transition-all hover:scale-[1.02]">
                  <MessageCircle className="h-5 w-5" />
                  Message
                </button>
                
                <button className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 font-semibold flex items-center justify-center gap-3 hover:bg-white/20 transition-all">
                  <Phone className="h-5 w-5" />
                  Call Now
                </button>
              </div>
              
              <button className="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 font-semibold flex items-center justify-center gap-3 hover:from-emerald-500 hover:to-green-500 transition-all">
                <Calendar className="h-5 w-5" />
                Book Appointment
              </button>
            </div>

            {/* Booking Widget */}
            <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-5">
              <h3 className="font-semibold mb-4">Instant Booking</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Select Date</label>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <Calendar className="h-5 w-5 inline mr-2" />
                    <span>Tomorrow, 19:00</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 4].map((hours) => (
                      <button
                        key={hours}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between mb-2">
                    <span className="text-white/60">Service Fee</span>
                    <span>€{provider.ratePerHour * 2}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/60">Booking Fee</span>
                    <span>€50</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-pink-400">€{provider.ratePerHour * 2 + 50}</span>
                  </div>
                </div>
                
                <button className="w-full p-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-semibold hover:from-pink-500 hover:to-purple-500 transition-all">
                  Book Now & Pay
                </button>
              </div>
            </div>

            {/* Safety & Verification */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                Safety & Verification
              </h3>
              
              <div className="space-y-3">
                {[
                  { icon: <CheckCircle className="h-4 w-4" />, text: "ID Verified" },
                  { icon: <CheckCircle className="h-4 w-4" />, text: "Phone Verified" },
                  { icon: <CheckCircle className="h-4 w-4" />, text: "Background Checked" },
                  { icon: <CheckCircle className="h-4 w-4" />, text: "Discreet Service" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20">
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Profiles */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <h3 className="font-semibold mb-4">Similar Profiles</h3>
              
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30"></div>
                    <div className="flex-1">
                      <div className="font-medium">Sophia, 24</div>
                      <div className="text-sm text-white/60">€400/h • London</div>
                    </div>
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Features */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                Premium Features
              </h3>
              
              <div className="space-y-2">
                {[
                  "Priority Booking",
                  "24/7 Availability",
                  "Luxury Transportation",
                  "Multi-language Support",
                  "Custom Experience Design",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ShoppingBag icon component (since it's not in lucide-react)
const ShoppingBag = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);