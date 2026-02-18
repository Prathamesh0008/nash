"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Award,
  Shield,
  Zap,
  Clock,
  Briefcase,
  DollarSign,
  Heart,
  HeartOff,
  Camera,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  ThumbsUp,
  Medal,
  TrendingUp,
  BookOpen,
  FileText,
  Share2,
  Flag,
  MoreHorizontal,
} from "lucide-react";

export default function WorkerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const workerId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [prefLoading, setPrefLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [selectedImage, setSelectedImage] = useState(null);

  const startChat = async () => {
    if (!workerId || chatLoading) return;
    setChatLoading(true);
    setChatMsg("");
    try {
      const res = await fetch("/api/chat/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ workerUserId: workerId }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok || !data.conversationId) {
        setChatMsg(data.error || "Failed to start chat");
        return;
      }

      router.push(`/chat/${data.conversationId}`);
    } catch {
      setChatMsg("Network error. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (!workerId) return;
    const load = async () => {
      const res = await fetch(`/api/workers/${workerId}`);
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Worker not found");
        return;
      }
      setWorker(data.worker);
    };
    load();
  }, [workerId]);

  useEffect(() => {
    if (!workerId) return;
    const loadPref = async () => {
      const res = await fetch("/api/users/preferences", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) return;
      const fav = (data.preferences?.favoriteWorkerIds || []).map((id) => String(id));
      setIsFavorite(fav.includes(String(workerId)));
    };
    loadPref();
  }, [workerId]);

  const toggleFavorite = async () => {
    if (!workerId || prefLoading) return;
    setPrefLoading(true);
    const res = await fetch("/api/users/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "toggleFavorite", workerId }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      const fav = (data.preferences?.favoriteWorkerIds || []).map((id) => String(id));
      setIsFavorite(fav.includes(String(workerId)));
    }
    setPrefLoading(false);
  };

  const submitReview = async () => {
    if (!workerId || reviewSaving) return;
    setReviewSaving(true);
    setReviewMsg("");
    const res = await fetch(`/api/workers/${workerId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        rating: Number(reviewForm.rating),
        comment: String(reviewForm.comment || ""),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setReviewSaving(false);
    if (!res.ok || !data.ok) {
      setReviewMsg(data.error || "Review submit failed");
      return;
    }
    setReviewMsg("Review submitted");
    setReviewForm({ rating: "5", comment: "" });
    const refresh = await fetch(`/api/workers/${workerId}`);
    const refreshData = await refresh.json().catch(() => ({}));
    if (refreshData?.ok) setWorker(refreshData.worker);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-400" />
            <p className="mt-2 text-rose-400">{error}</p>
            <Link
              href="/workers"
              className="mt-4 inline-block rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2 text-sm text-white"
            >
              Browse Workers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-fuchsia-500"></div>
            <p className="mt-4 text-sm text-slate-400">Loading worker profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const canContactDirectly = Boolean(worker.contactUnlocked && worker.user?.phone);
  const ratingAvg = Number(worker.reviewSummary?.ratingAvg || worker.ratingAvg || 0).toFixed(1);
  const reviewCount = worker.reviewSummary?.ratingCount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Image Preview Modal */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
            <div className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center">
              <div className="mb-2 flex items-center justify-between text-white">
                <p className="text-sm">Worker Gallery</p>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30"
                >
                  Close
                </button>
              </div>
              <img src={selectedImage} alt="Gallery" className="max-h-[80vh] w-full rounded object-contain" />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {/* Profile Photo */}
              <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-slate-900 sm:h-24 sm:w-24">
                {worker.profilePhoto ? (
                  <img
                    src={worker.profilePhoto}
                    alt={worker.user?.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <User className="h-8 w-8 text-slate-600" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    {worker.user?.name || "Worker"}
                  </h1>
                  {worker.badges?.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                  {worker.badges?.topRated && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-1 text-xs text-indigo-400">
                      <Medal className="h-3 w-3" />
                      Top Rated
                    </span>
                  )}
                  {worker.isBoosted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1 text-xs text-amber-400">
                      <Zap className="h-3 w-3" />
                      Boosted
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Star className="h-4 w-4 text-amber-400" />
                    {ratingAvg} ({reviewCount} reviews)
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Briefcase className="h-4 w-4" />
                    {worker.jobsCompleted} jobs
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="h-4 w-4" />
                    Response: {worker.availability?.responseTimeAvg || 0} min
                  </span>
                </div>

                {worker.isBoosted && (
                  <p className="mt-2 text-sm text-amber-400">
                    <Zap className="mr-1 inline h-3 w-3" />
                    {worker.boostPlan?.name || "Boosted"} • Score: {worker.activeBoost?.boostScore || 0}
                  </p>
                )}
              </div>
            </div>

            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              disabled={prefLoading}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                isFavorite
                  ? "bg-fuchsia-600 text-white hover:bg-fuchsia-500"
                  : "border border-white/10 bg-white/5 text-slate-200 hover:border-fuchsia-400/50 hover:text-white"
              } disabled:opacity-50`}
            >
              {prefLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  Saving...
                </>
              ) : isFavorite ? (
                <>
                  <Heart className="h-4 w-4 fill-current" />
                  Favorited
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  Add to Favorites
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex overflow-x-auto border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("about")}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition ${
              activeTab === "about"
                ? "border-b-2 border-fuchsia-500 text-fuchsia-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition ${
              activeTab === "gallery"
                ? "border-b-2 border-fuchsia-500 text-fuchsia-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition ${
              activeTab === "pricing"
                ? "border-b-2 border-fuchsia-500 text-fuchsia-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Pricing
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition ${
              activeTab === "reviews"
                ? "border-b-2 border-fuchsia-500 text-fuchsia-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Left Column - About & Gallery */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* About Tab */}
            {activeTab === "about" && (
              <>
                {/* Bio */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                    <User className="h-5 w-5 text-fuchsia-400" />
                    About
                  </h2>
                  <p className="text-sm text-slate-300">{worker.bio || "No bio provided"}</p>
                </div>

                {/* Skills */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                    <Briefcase className="h-5 w-5 text-fuchsia-400" />
                    Skills & Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(worker.skills || []).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs text-fuchsia-400"
                      >
                        {skill}
                      </span>
                    ))}
                    {(worker.skills || []).length === 0 && (
                      <p className="text-sm text-slate-400">No skills listed</p>
                    )}
                  </div>
                </div>

                {/* Service Areas */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                    <MapPin className="h-5 w-5 text-fuchsia-400" />
                    Service Areas
                  </h2>
                  <div className="space-y-2">
                    {(worker.serviceAreas || []).length > 0 ? (
                      (worker.serviceAreas || []).map((area) => (
                        <div key={`${area.city}-${area.pincode}`} className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-300">{area.city}</span>
                          <span className="text-slate-500">- {area.pincode}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">No service areas specified</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Gallery Tab */}
            {activeTab === "gallery" && (
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                  <Camera className="h-5 w-5 text-fuchsia-400" />
                  Gallery Photos
                </h2>
                
                {(worker.galleryPhotos || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Camera className="h-12 w-12 text-slate-600" />
                    <p className="mt-2 text-sm text-slate-400">No gallery photos available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {(worker.galleryPhotos || []).map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(photo)}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-slate-900 transition hover:border-fuchsia-500/30"
                      >
                        <img
                          src={photo}
                          alt={`Gallery ${idx + 1}`}
                          className="h-full w-full object-cover transition group-hover:scale-110"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === "pricing" && (
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                  <DollarSign className="h-5 w-5 text-fuchsia-400" />
                  Pricing Information
                </h2>

                <div className="space-y-4">
                  {/* Base Price */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-slate-400">Base Price</span>
                    <span className="text-xl font-bold text-white">₹{worker.pricing?.basePrice || 0}</span>
                  </div>

                  {/* Historical Pricing */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-white">Historical Range</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-slate-900/40 p-2">
                        <p className="text-xs text-slate-400">Min</p>
                        <p className="text-lg font-semibold text-white">₹{worker.historicalPricing?.min || 0}</p>
                      </div>
                      <div className="rounded-lg bg-slate-900/40 p-2">
                        <p className="text-xs text-slate-400">Avg</p>
                        <p className="text-lg font-semibold text-white">₹{worker.historicalPricing?.avg || 0}</p>
                      </div>
                      <div className="rounded-lg bg-slate-900/40 p-2">
                        <p className="text-xs text-slate-400">Max</p>
                        <p className="text-lg font-semibold text-white">₹{worker.historicalPricing?.max || 0}</p>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Based on {worker.historicalPricing?.sampleBookings || 0} past bookings
                    </p>
                  </div>

                  {/* Extra Services */}
                  {(worker.pricing?.extraServices || []).length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-white">Extra Services</p>
                      <div className="space-y-2">
                        {worker.pricing.extraServices.map((service) => (
                          <div key={service.title} className="flex items-center justify-between rounded-lg bg-slate-900/40 p-2">
                            <span className="text-sm text-slate-300">{service.title}</span>
                            <span className="text-sm font-medium text-fuchsia-400">+₹{service.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                {/* Review Summary */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white">{ratingAvg}</div>
                      <div className="mt-1 flex items-center justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(Number(ratingAvg))
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{reviewCount} reviews</p>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = worker.reviewSummary?.ratingBreakdown?.[star] || 0;
                        const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="w-8 text-xs text-slate-400">{star}★</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
                              <div
                                className="h-full bg-amber-400"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-8 text-xs text-slate-400">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Review Form */}
                {worker.canReview && (
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
                    <h3 className="mb-3 font-semibold text-white">Write a Review</h3>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm((prev) => ({ ...prev, rating: star.toString() }))}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  star <= Number(reviewForm.rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-600 hover:text-slate-400"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <textarea
                        className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                        rows={3}
                        placeholder="Share your experience with this worker..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      />
                      
                      <button
                        onClick={submitReview}
                        disabled={reviewSaving}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        {reviewSaving ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <ThumbsUp className="h-4 w-4" />
                            Submit Review
                          </>
                        )}
                      </button>
                      
                      {reviewMsg && (
                        <p className={`text-xs ${
                          reviewMsg.includes("failed") ? "text-rose-400" : "text-emerald-400"
                        }`}>
                          {reviewMsg}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Reviews */}
                <div className="space-y-3">
                  {(worker.recentReviews || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-8 text-center">
                      <Star className="h-12 w-12 text-slate-600" />
                      <p className="mt-2 text-sm text-slate-400">No reviews yet</p>
                    </div>
                  ) : (
                    (worker.recentReviews || []).map((review) => (
                      <div
                        key={review._id}
                        className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-500/20">
                              <User className="h-4 w-4 text-fuchsia-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{review.userName}</p>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= review.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="mt-2 text-sm text-slate-300">{review.comment}</p>
                        
                        {review.reply?.text && (
                          <div className="mt-2 rounded-lg bg-slate-800/50 p-2">
                            <p className="text-xs font-medium text-fuchsia-400">Worker Reply:</p>
                            <p className="mt-1 text-xs text-slate-300">{review.reply.text}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-4">
            {/* Contact Card */}
            <div className="sticky top-24 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Phone className="h-5 w-5 text-fuchsia-400" />
                Contact
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-300">{worker.user?.phone || "Not available"}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-300">{worker.user?.email || "Not available"}</span>
                </div>

                {!worker.contactUnlocked && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-400">
                    <AlertCircle className="mr-1 inline h-3 w-3" />
                    Contact details unlock after a valid booking
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {canContactDirectly ? (
                  <a
                    href={`tel:${worker.user.phone}`}
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
                  >
                    <Phone className="h-4 w-4" />
                    Call Now
                  </a>
                ) : (
                  <span className="flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300">
                    <Phone className="h-4 w-4" />
                    Book to Unlock
                  </span>
                )}

                <Link
                  href={`/booking/new?workerId=${workerId}`}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Calendar className="h-4 w-4" />
                  Book Now
                </Link>

                <button
                  onClick={startChat}
                  disabled={chatLoading}
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white disabled:opacity-50"
                >
                  {chatLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                      Starting...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </>
                  )}
                </button>
              </div>

              {chatMsg && (
                <p className="mt-2 text-xs text-rose-400">{chatMsg}</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4">
              <h3 className="mb-3 text-sm font-medium text-white">Performance</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-900/40 p-2 text-center">
                  <p className="text-xs text-slate-400">Jobs</p>
                  <p className="text-lg font-semibold text-white">{worker.jobsCompleted}</p>
                </div>
                <div className="rounded-lg bg-slate-900/40 p-2 text-center">
                  <p className="text-xs text-slate-400">Response</p>
                  <p className="text-lg font-semibold text-white">{worker.availability?.responseTimeAvg || 0}min</p>
                </div>
                <div className="rounded-lg bg-slate-900/40 p-2 text-center">
                  <p className="text-xs text-slate-400">Rating</p>
                  <p className="text-lg font-semibold text-white">{ratingAvg}</p>
                </div>
                <div className="rounded-lg bg-slate-900/40 p-2 text-center">
                  <p className="text-xs text-slate-400">Reviews</p>
                  <p className="text-lg font-semibold text-white">{reviewCount}</p>
                </div>
              </div>
            </div>

            {/* Report */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4">
              <Link
                href={`/support?workerId=${workerId}`}
                className="flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white"
              >
                <Flag className="h-3 w-3" />
                Report this worker
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}