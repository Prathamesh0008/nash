"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Bookmark,
  Briefcase,
  Calendar,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Crown,
  Eye,
  ExternalLink,
  Globe,
  Heart,
  MapPin,
  MessageCircle,
  MoreVertical,
  Music,
  Pause,
  Phone,
  Plane,
  Play,
  Share2,
  Shield,
  Sparkles,
  Star,
  Users,
  Wine,
  X,
} from "lucide-react";

function mapWorkerToProfile(worker, id) {
  const images = [worker?.profilePhoto, ...(worker?.galleryPhotos || [])].filter(Boolean);
  const primaryArea = (worker?.serviceAreas || [])[0] || {};
  const rating = Number(worker?.reviewSummary?.ratingAvg || worker?.ratingAvg || 0);
  return {
    id,
    name: worker?.user?.name || "Escort",
    age: 24,
    location: primaryArea.city ? `${primaryArea.city}${primaryArea.pincode ? `, ${primaryArea.pincode}` : ""}` : "City unavailable",
    ratePerHour: Number(worker?.pricing?.basePrice || 0),
    rating: Number.isFinite(rating) && rating > 0 ? Number(rating.toFixed(1)) : 4.8,
    available: worker?.isOnline !== false,
    bio: worker?.bio || "Verified premium escort profile.",
    images:
      images.length > 0
        ? images
        : ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1400&q=80"],
  };
}

export default function WorkerDetailsPage() {
  const { id } = useParams();
  const workerId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showPhone, setShowPhone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!workerId) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/workers/${workerId}`, { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok || !data?.worker) {
          setError(data?.error || "Escort not found");
        } else {
          setWorker(data.worker);
        }
      } catch {
        setError("Failed to load escort profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workerId]);

  const profile = useMemo(() => mapWorkerToProfile(worker, String(workerId || "")), [worker, workerId]);

  useEffect(() => {
    if (!profile || !isPlaying || isHovering) return;
    intervalRef.current = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % profile.images.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [profile, isPlaying, isHovering]);

  const goPrev = () => setSelectedImage((prev) => (prev - 1 + profile.images.length) % profile.images.length);
  const goNext = () => setSelectedImage((prev) => (prev + 1) % profile.images.length);

  const reviews = [
    { name: "Alexander", rating: 5, date: "2 days ago", comment: "Elegant, discreet and professional.", verified: true },
    { name: "Michael", rating: 4.5, date: "1 week ago", comment: "Great for social and business events.", verified: true },
    { name: "David", rating: 5, date: "2 weeks ago", comment: "Excellent companion and smooth experience.", verified: true },
  ];

  const services = [
    { name: "Dinner Dates", icon: <Coffee className="h-4 w-4" />, price: profile.ratePerHour, duration: "2h min" },
    { name: "Event Escort", icon: <Award className="h-4 w-4" />, price: profile.ratePerHour * 1.5, duration: "3h min" },
    { name: "Travel Companion", icon: <Plane className="h-4 w-4" />, price: profile.ratePerHour * 2, duration: "Full day" },
    { name: "Concert Partner", icon: <Music className="h-4 w-4" />, price: profile.ratePerHour * 1.3, duration: "4h min" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0214] via-purple-950 to-black">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-fuchsia-500/30 border-t-fuchsia-400" />
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0214] via-purple-950 to-black text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">:(</div>
          <h1 className="text-2xl font-light mb-2">Escort Not Found</h1>
          <p className="text-white/60">{error || "The profile you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0214] via-purple-950 to-black text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 h-96 w-96 rounded-full bg-purple-900/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-40 h-96 w-96 rounded-full bg-pink-900/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="rounded-xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/10">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 text-sm text-white/60 md:flex">
              <span>Escorts</span>
              <span>•</span>
              <span>{profile.location}</span>
              <span>•</span>
              <span className="text-white">Profile</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsFavorited((prev) => !prev)} className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition hover:bg-white/10">
              <Bookmark className={`h-5 w-5 ${isFavorited ? "fill-pink-500 text-pink-500" : ""}`} />
            </button>
            <button className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition hover:bg-white/10">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition hover:bg-white/10">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
          <div className="space-y-6 lg:col-span-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">{[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}</div>
                  <span className="text-2xl font-bold">{profile.rating}</span>
                  <span className="text-sm text-white/60">/5.0</span>
                </div>
              </div>
              <div className="rounded-full border border-green-500/30 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1.5 text-sm text-green-300">
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" />Verified Reviews</span>
              </div>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border-2 border-white/10 group" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
              {profile.images.map((img, index) => (
                <div key={img + index} className={`absolute inset-0 transition-opacity duration-700 ${index === selectedImage ? "opacity-100" : "opacity-0"}`}>
                  <Image src={img} alt={`${profile.name} ${index + 1}`} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                </div>
              ))}

              <button onClick={goPrev} className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 opacity-0 transition group-hover:opacity-100">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={goNext} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 opacity-0 transition group-hover:opacity-100">
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute right-4 top-4 z-20 flex gap-2">
                <button onClick={() => setIsPlaying((prev) => !prev)} className="rounded-full bg-black/50 p-3">{isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}</button>
              </div>

              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                <div className="rounded-full bg-black/50 px-3 py-1.5 text-sm">{selectedImage + 1} / {profile.images.length}</div>
                <div className={`rounded-full px-3 py-1.5 text-sm ${profile.available ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                  {profile.available ? "Available Now" : "Busy"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {profile.images.map((img, i) => (
                <button key={img + i} onClick={() => setSelectedImage(i)} className={`relative aspect-square overflow-hidden rounded-xl border-2 ${selectedImage === i ? "border-pink-500" : "border-white/10"}`}>
                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>

            <div className="flex overflow-x-auto border-b border-white/10">
              {["overview", "services", "reviews", "availability"].map((tab) => (
                <button key={tab} onClick={() => setSelectedTab(tab)} className={`relative px-6 py-3 text-sm ${selectedTab === tab ? "text-white" : "text-white/60 hover:text-white"}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {selectedTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500" />}
                </button>
              ))}
            </div>

            <div className="pt-4">
              {selectedTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 text-lg font-semibold">About {profile.name.split(" ")[0]}</h4>
                    <p className="text-white/80">{profile.bio}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-white/5 p-4">
                      <h5 className="mb-2 font-medium">Languages</h5>
                      <div className="space-y-2 text-sm">
                        {["English", "French", "Spanish"].map((lang) => (
                          <div key={lang} className="flex items-center justify-between rounded-lg bg-white/5 p-2"><span className="flex items-center gap-2"><Globe className="h-4 w-4 text-white/60" />{lang}</span><span className="text-white/60">Fluent</span></div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-4">
                      <h5 className="mb-2 font-medium">Lifestyle</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2"><Wine className="h-4 w-4 text-amber-400" />Social Drinker</div>
                        <div className="flex items-center gap-2"><X className="h-4 w-4 text-emerald-400" />Non-smoker</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "services" && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {services.map((service) => (
                    <div key={service.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">{service.icon}<span>{service.name}</span></div>
                        <span className="font-semibold text-pink-400">EUR {Math.round(service.price)}/h</span>
                      </div>
                      <p className="text-xs text-white/60">{service.duration}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedTab === "reviews" && (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.name + review.date} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium">{review.name}</p>
                        <p className="text-xs text-white/60">{review.date}</p>
                      </div>
                      <p className="text-sm text-white/80">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedTab === "availability" && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 font-medium">Availability</p>
                  <p className="text-sm text-white/70">Fast response and flexible slots. Use booking to request your preferred time.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-light">{profile.name}, <span className="text-white/70">{profile.age}</span></h1>
                  <div className="mt-2 flex items-center gap-2 text-white/70"><MapPin className="h-4 w-4 text-white/60" />{profile.location}</div>
                </div>
                <div className="text-right">
                  <p className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">EUR {profile.ratePerHour}/h</p>
                  <p className="text-sm text-white/60">Starting rate</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => router.push("/chat")} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 p-4 font-semibold transition hover:from-pink-500 hover:to-purple-500">
                  <MessageCircle className="h-5 w-5" />Message
                </button>
                <button onClick={() => setShowPhone((prev) => !prev)} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 p-4 font-semibold transition hover:from-blue-500 hover:to-cyan-500">
                  <Phone className="h-5 w-5" />{showPhone ? phoneNumber : "Call Now"}
                </button>
              </div>
              <button onClick={() => router.push(`/booking/new?workerId=${workerId}`)} className="mt-3 w-full rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 p-4 font-semibold transition hover:from-pink-500 hover:to-purple-500">
                Book Now & Pay
              </button>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-5">
              <h3 className="mb-3 flex items-center gap-2 font-semibold"><Shield className="h-5 w-5 text-emerald-400" />Safety & Verification</h3>
              <div className="space-y-2 text-sm">
                {["ID Verified", "Phone Verified", "Background Checked", "Discreet Service"].map((item) => (
                  <div key={item} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" />{item}</div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-3 font-semibold">Similar Profiles</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30" />
                    <div className="flex-1">
                      <p className="font-medium">Profile {n}</p>
                      <p className="text-sm text-white/60">EUR {profile.ratePerHour}/h</p>
                    </div>
                    <button className="rounded-lg bg-white/10 p-2"><ExternalLink className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-5">
              <h3 className="mb-3 flex items-center gap-2 font-semibold"><Crown className="h-5 w-5 text-amber-400" />Premium Features</h3>
              <div className="space-y-2 text-sm">
                {["Priority Booking", "24/7 Availability", "Luxury Transportation", "VIP Support"].map((feature) => (
                  <div key={feature} className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-amber-400" />{feature}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const ShoppingBag = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
