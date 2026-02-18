"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, CheckCircle, MapPin, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function ProviderCard({ provider }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isFavorite, setIsFavorite] = useState(Boolean(provider.isFavorite));
  const [favoriteSaving, setFavoriteSaving] = useState(false);
  const intervalRef = useRef(null);

  const images = provider.images || [];
  const profileHref =
    provider.profileHref ||
    (provider.slug ? `/providers/${provider.slug}` : provider.id ? `/workers/${provider.id}` : "/workers");
  const locationText = provider.location || provider.city || "Location unavailable";
  const ratingValue = Number(provider.rating || 0);
  const reviewsCount = Number(provider.reviewsCount || provider.jobs || 0);
  const tags = provider.tags?.length ? provider.tags : provider.specialties || [];

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

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!provider.id || favoriteSaving) return;
    setFavoriteSaving(true);
    const res = await fetch("/api/users/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "toggleFavorite", workerId: provider.id }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      const favIds = (data.preferences?.favoriteWorkerIds || []).map((id) => String(id));
      setIsFavorite(favIds.includes(String(provider.id)));
    }
    setFavoriteSaving(false);
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
      <button
        onClick={toggleFavorite}
        disabled={favoriteSaving}
        className="absolute top-3 right-3 z-40 rounded-full bg-black/40 p-2 backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60"
      >
        <Heart className={`h-4 w-4 ${isFavorite ? "fill-pink-500 text-pink-500" : ""}`} />
      </button>

      <div
        className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {images.length > 0 ? (
          <>
            <div className="relative aspect-[4/3.5]">
              {images.map((img, index) => (
                <Link
                  key={index}
                  href={profileHref}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                    index === currentImage ? "opacity-100" : "opacity-0"
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

            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 transform items-center gap-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImage(index);
                      resetAutoPlay();
                    }}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                      index === currentImage ? "w-4 bg-white" : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 z-20 -translate-y-1/2 transform rounded-full bg-black/40 p-1.5 backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60 opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2 transform rounded-full bg-black/40 p-1.5 backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60 opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            {provider.verified && (
              <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md">
                <CheckCircle className="h-3 w-3" />
                Verified
              </div>
            )}

            <div
              className={`absolute bottom-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md ${
                provider.available ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {provider.available ? "Available" : "Booked"}
            </div>
          </>
        ) : (
          <div className="relative aspect-[4/4.5] bg-gradient-to-br from-purple-600 to-pink-600" />
        )}
      </div>

      <div className="flex flex-1 flex-col space-y-3 bg-gradient-to-b from-transparent to-black/10 p-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-lg font-semibold leading-tight tracking-tight">{provider.name}</h3>
            {provider.age && <span className="shrink-0 text-sm font-light text-white/60">{provider.age}</span>}
          </div>

          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-xs">{locationText}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(ratingValue) ? "fill-yellow-400 text-yellow-400" : "fill-white/20 text-white/20"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-white">{ratingValue.toFixed(1)}</span>
          </div>
          <span className="text-xs text-white/50">{reviewsCount} reviews</span>
        </div>

        <p className="line-clamp-2 min-h-[2rem] text-xs text-white/60">{provider.bio}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/60">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto border-t border-white/10 pt-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/50">Starting at</div>
            <div className="flex items-baseline gap-0.5">
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                INR {provider.ratePerHour}
              </span>
              <span className="text-xs font-medium text-white/50">/hr</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Link
            href={profileHref}
            className="
              flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-center
              text-xs font-semibold transition-all duration-300
              hover:scale-[1.02] hover:border-white/20 hover:bg-white/10 active:scale-[0.98]
            "
          >
            View
          </Link>

          <Link
            href="/chat"
            className="
              flex-1 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 py-2 text-center
              text-xs font-semibold transition-all duration-300
              hover:scale-[1.02] hover:from-pink-500 hover:to-purple-500 active:scale-[0.98]
              shadow-md shadow-pink-900/20
            "
          >
            Message
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-400 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/5 via-transparent to-purple-500/5" />
      </div>
    </div>
  );
}
