"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, CheckCircle, MapPin, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function ProviderCard({ provider }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef(null);
  const images = provider.images || [];

  // Auto-slideshow for images
  useEffect(() => {
    if (!images.length || isHovering) return;

    intervalRef.current = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length, isHovering]);

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    resetAutoPlay();
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (images.length) {
      intervalRef.current = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }, 4000);
    }
  };

  return (
    <div
      className="
        group relative rounded-2xl overflow-hidden
        bg-gradient-to-br from-white/[0.02] to-white/[0.01]
        border border-white/10 backdrop-blur-sm
        hover:border-pink-500/50 hover:shadow-[0_0_40px_-15px_rgba(236,72,153,0.3)]
        transition-all duration-400
        hover:-translate-y-0.5 cursor-pointer
        h-full flex flex-col
      "
    >
      {/* Favorite Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all hover:scale-110 z-40"
      >
        <Heart className="h-4 w-4" />
      </button>

      {/* IMAGE SLIDESHOW */}
      <div 
        className="relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {images.length > 0 ? (
          <>
            {/* Main Images with Fade */}
            <div className="aspect-[4/3.5] relative">
              {images.map((img, index) => (
                <Link
                  key={index}
                  href={`/providers/${provider.slug}`}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                    index === currentImage ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${provider.name} - Image ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                </Link>
              ))}
            </div>

            {/* Image Navigation Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImage(index);
                      resetAutoPlay();
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      index === currentImage 
                        ? 'w-4 bg-white' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Previous/Next Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all hover:scale-110 z-20 opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all hover:scale-110 z-20 opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            {/* VERIFIED BADGE */}
            {provider.verified && (
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs text-emerald-300 font-medium">
                <CheckCircle className="h-3 w-3" />
                Verified
              </div>
            )}

            {/* AVAILABILITY BADGE */}
            <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-medium ${
              provider.available 
                ? "bg-emerald-500/20 text-emerald-300" 
                : "bg-rose-500/20 text-rose-300"
            }`}>
              {provider.available ? "Available" : "Booked"}
            </div>
          </>
        ) : (
          <div className="aspect-[4/4.5] relative bg-gradient-to-br from-purple-600 to-pink-600" />
        )}
      </div>

      {/* CONTENT - Compressed */}
      <div className="p-4 space-y-3 bg-gradient-to-b from-transparent to-black/10 flex-1 flex flex-col">
        {/* NAME & LOCATION */}
        <div className="space-y-1 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold leading-tight tracking-tight truncate">
              {provider.name}
            </h3>
            {provider.age && (
              <span className="text-sm font-light text-white/60 shrink-0">{provider.age}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-xs">{provider.location}</span>
          </div>
        </div>

        {/* RATING */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(provider.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-white/20 text-white/20"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-white">
              {provider.rating}
            </span>
          </div>
          <span className="text-xs text-white/50">
            {provider.reviewsCount} reviews
          </span>
        </div>

        {/* BIO - Shortened */}
        <p className="text-xs text-white/60 line-clamp-2 min-h-[2rem]">
          {provider.bio}
        </p>

        {/* TAGS - Smaller */}
        {provider.tags && provider.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {provider.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-white/60 border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* PRICE ROW - Compressed */}
        <div className="pt-2 border-t border-white/10 mt-auto">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/50">Starting at</div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                €{provider.ratePerHour}
              </span>
              <span className="text-xs font-medium text-white/50">/hr</span>
            </div>
          </div>
        </div>

        {/* ACTIONS - Smaller */}
        <div className="pt-2 flex gap-2">
          <Link
            href={`/providers/${provider.slug}`}
            className="
              flex-1 text-center py-2 rounded-lg
              bg-white/5 border border-white/10
              hover:bg-white/10 hover:border-white/20
              text-xs font-semibold transition-all duration-300
              hover:scale-[1.02] active:scale-[0.98]
            "
          >
            View
          </Link>

          <Link
            href={`/book/${provider.slug}`}
            className="
              flex-1 text-center py-2 rounded-lg
              bg-gradient-to-r from-pink-600 to-purple-600
              hover:from-pink-500 hover:to-purple-500
              text-xs font-semibold transition-all duration-300
              hover:scale-[1.02] active:scale-[0.98]
              shadow-md shadow-pink-900/20
            "
          >
            Book
          </Link>
        </div>
      </div>

      {/* HOVER EFFECT GLOW */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/5 via-transparent to-purple-500/5" />
      </div>
    </div>
  );
}