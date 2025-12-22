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
} from "lucide-react";
import { providers } from "@/data/providers";
import { useState, useEffect, useRef } from "react";

export default function ProviderProfilePage() {
  const { slug } = useParams();
  const provider = providers.find((p) => p.slug === slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef(null);

  // Auto-slideshow functionality
  useEffect(() => {
    if (!provider || !isPlaying || isHovering) return;

    intervalRef.current = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % provider.images.length);
    }, 3000); // Change image every 3 seconds

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
      }, 3000);
    }
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#0b0214] via-purple-950 to-black">
        Provider not found
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0214] via-purple-950 to-black text-white">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-pink-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* LEFT – LARGE IMAGE GALLERY WITH SLIDESHOW */}
          <div className="lg:col-span-3 space-y-6">
            {/* Main Image Container with Slideshow */}
            <div 
              className="relative aspect-[4/5] rounded-3xl overflow-hidden group"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* All Images Stack with Fade Animation */}
              <div className="absolute inset-0">
                {provider.images.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === selectedImage ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>
                    <Image
                      src={img}
                      alt={`${provider.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
              
              {/* Slideshow Controls */}
             
              
              {/* Image Indicators */}
              {/* <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1">
                {provider.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      resetAutoPlay();
                    }}
                    className={`w-8 h-1 rounded-full transition-all duration-300 ${
                      index === selectedImage 
                        ? 'bg-white' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div> */}
              
              {/* Image Controls */}
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all hover:scale-110">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all hover:scale-110">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              
              {/* Slideshow Timer Bar */}
              {/* <div className="absolute top-0 left-0 right-0 h-1 z-20 bg-transparent">
                <div 
                  className={`h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 ease-linear ${
                    isPlaying && !isHovering ? 'w-full' : 'w-0'
                  }`}
                  style={{
                    animation: isPlaying && !isHovering 
                      ? 'slideTimer 3s linear infinite' 
                      : 'none'
                  }}
                />
              </div> */}
              
              {/* Availability Badge */}
              <div className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium ${provider.available ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                {provider.available ? "Available Now" : "Currently Unavailable"}
              </div>
              
              {/* Image Counter */}
              {/* <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-sm">
                {selectedImage + 1} / {provider.images.length}
              </div> */}
            </div>

            {/* Thumbnail Gallery with Auto-select */}
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
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
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
                  {selectedImage === i && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-500/20"></div>
                  )}
                  {/* Playing indicator on thumbnail */}
                  {isPlaying && selectedImage === i && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Stats Card */}
            <div className="rounded-2xl bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10 p-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">{provider.rating}</div>
                  <div className="text-xs text-white/60 mt-1">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{provider.reviewsCount}</div>
                  <div className="text-xs text-white/60 mt-1">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">98%</div>
                  <div className="text-xs text-white/60 mt-1">Response Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT – CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header with Glass Effect */}
            <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border border-white/10 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-light tracking-tight">
                    {provider.name}, <span className="text-white/70">{provider.age}</span>
                  </h1>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </span>
                    <span className="text-sm text-white/60">Active since 2022</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-white/70">
                    <MapPin className="h-4 w-4" />
                    {provider.location}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    €{provider.ratePerHour}<span className="text-lg">/h</span>
                  </div>
                  <div className="text-sm text-white/60">Starting from</div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <div className="h-1 w-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                About Me
              </h3>
              <p className="text-white/80 leading-relaxed">
                {provider.bio}
              </p>
            </section>

            {/* Essentials Grid */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <div className="h-1 w-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                Essentials
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Language", value: "EN" },
                  { label: "Height", value: "170cm" },
                  { label: "Size", value: "M" },
                  { label: "Style", value: "Elegant" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 p-4 hover:border-white/20 transition-colors"
                  >
                    <div className="text-sm text-white/60">{item.label}</div>
                    <div className="font-medium">{item.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Services */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <div className="h-1 w-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                Services
              </h3>
              <div className="space-y-2">
                {[
                  "Dinner Dates",
                  "Event Escort",
                  "Travel Companion",
                  "Social Events",
                ].map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span>{service}</span>
                    <span className="text-pink-400 font-medium">€{provider.ratePerHour}/h</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Pricing & Availability Card */}
            <div className="rounded-2xl bg-gradient-to-r from-pink-900/20 via-purple-900/20 to-transparent border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-white/60">Flexible Availability</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Book in advance</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Fast Response</span>
                </div>
              </div>
              
              <div className="text-center text-sm text-white/60">
                Minimum booking: 2 hours
              </div>
            </div>

            {/* Contact Actions */}
            <div className="space-y-3">
              <button className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-semibold flex items-center justify-center gap-3 hover:from-pink-500 hover:to-purple-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-pink-900/30">
                <MessageCircle className="h-5 w-5" />
                Message on WhatsApp
              </button>
              
              <button className="w-full py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 font-semibold flex items-center justify-center gap-3 hover:bg-white/20 transition-all">
                <Phone className="h-5 w-5" />
                Call Now
              </button>
            </div>

            {/* Reviews Preview */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Client Reviews</h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-white/60 mb-4">
                {provider.reviewsCount} verified reviews
              </div>
              
              <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-colors">
                View All Reviews
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animation for timer */}
      <style jsx>{`
        @keyframes slideTimer {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}