"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import RatingStars from "@/components/RatingStars";

export default function WorkerProfilePage({ params }) {
  // ✅ REQUIRED FOR NEXT 15
  const { id: workerId } = usePromise(params);

  const router = useRouter();
  const { user } = useAuth();

  const [worker, setWorker] = useState(null);
  const [error, setError] = useState("");

  /* ---------------- LOAD WORKER ---------------- */
  async function loadWorker() {
    const res = await fetch(`/api/workers/${workerId}`, {
      cache: "no-store",
    });
    const data = await res.json();

    if (!data.ok) {
      setError(data.error || "Worker not found");
      return;
    }
    setWorker(data.worker);
  }

  useEffect(() => {
    if (workerId) loadWorker();
  }, [workerId]);

  /* ---------------- START CHAT ---------------- */
  async function startChat() {
    if (!user) return router.push("/login");

    if (user.role !== "user") {
      alert("Only users can start chat");
      return;
    }

    const res = await fetch("/api/chat/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ workerUserId: worker.userId }),
    });

    const data = await res.json();
    if (data.ok) router.push(`/chat/${data.conversationId}`);
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!worker) return <div className="p-6">Loading profile...</div>;

  const a = worker.availability || {};

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex gap-6">
        <img
          src={worker.profilePhoto || "/workers/default.png"}
          className="w-36 h-36 rounded-xl object-cover border"
          alt={worker.fullName}
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{worker.fullName}</h1>
          <div className="text-gray-600">{worker.city}</div>

          <div className="mt-2 text-sm text-gray-700">
            {worker.bio || "No bio provided"}
          </div>

          <div className="mt-2 text-sm">
            ⭐ {worker.ratingAvg?.toFixed(1) || "0.0"} (
            {worker.ratingCount || 0} reviews)
          </div>

          <button
            onClick={startChat}
            className="mt-4 px-4 py-2 bg-black text-white rounded"
          >
            Start Chat
          </button>
        </div>
      </div>

      {/* ================= GALLERY ================= */}
      {(worker.galleryPhotos || []).length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Gallery</h2>
          <div className="flex flex-wrap gap-3">
            {worker.galleryPhotos.map((g, i) => (
              <img
                key={i}
                src={g}
                className="w-32 h-32 rounded object-cover border"
              />
            ))}
          </div>
        </div>
      )}

      {/* ================= SERVICES ================= */}
      <div>
        <h2 className="font-semibold mb-2">Services</h2>
        <ul className="list-disc ml-5 text-sm">
          {(worker.services || []).map((s, i) => (
            <li key={i}>
              {s.name} — {s.experienceYears || 0} yrs — ₹{s.basePrice || 0}
            </li>
          ))}
        </ul>

        {(worker.extraServices || []).length > 0 && (
          <>
            <h3 className="font-semibold mt-3">Extra Services</h3>
            <ul className="list-disc ml-5 text-sm">
              {worker.extraServices.map((x, i) => (
                <li key={i}>
                  {x.title} — ₹{x.price}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* ================= AVAILABILITY ================= */}
      <div>
        <h2 className="font-semibold mb-2">Availability</h2>
        <div className="text-sm space-y-1">
          <div>Days: {a.workingDays?.join(", ") || "-"}</div>
          <div>
            Time: {a.timeFrom || "--"} – {a.timeTo || "--"}
          </div>
          <div>Emergency: {a.emergencyAvailable ? "Yes" : "No"}</div>
          <div>Service Radius: {worker.serviceRadiusKm || "-"} km</div>
        </div>
      </div>

      {/* ================= SKILLS ================= */}
      <div>
        <h2 className="font-semibold mb-2">Skills & Languages</h2>
        <div className="text-sm">
          <div>
            <b>Skills:</b> {(worker.skills || []).join(", ") || "-"}
          </div>
          <div>
            <b>Languages:</b> {(worker.languages || []).join(", ") || "-"}
          </div>
        </div>
      </div>

      {/* ================= PERSONAL INFO ================= */}
      <div>
        <h2 className="font-semibold mb-2">Personal Info</h2>
        <div className="text-sm space-y-1">
          <div>Gender: {worker.gender || "-"}</div>
          <div>Nationality: {worker.nationality || "-"}</div>
          <div>Height: {worker.heightCm || "-"} cm</div>
          <div>Weight: {worker.weightKg || "-"} kg</div>
          <div>Hair Color: {worker.hairColor || "-"}</div>
        </div>
      </div>

      {/* ================= DOCUMENTS ================= */}
      <div>
        <h2 className="font-semibold mb-2">Documents</h2>
        <div className="flex gap-4 text-sm">
          {worker.documents?.idProof && (
            <a
              href={worker.documents.idProof}
              target="_blank"
              className="text-blue-600 underline"
            >
              ID Proof
            </a>
          )}
          {worker.documents?.addressProof && (
            <a
              href={worker.documents.addressProof}
              target="_blank"
              className="text-blue-600 underline"
            >
              Address Proof
            </a>
          )}
        </div>
      </div>

      {/* ================= REVIEWS ================= */}
      <div>
        <h2 className="font-semibold mb-3">Reviews</h2>

        {(worker.reviews || []).length === 0 && (
          <div className="text-sm text-gray-500">No reviews yet</div>
        )}

        {(worker.reviews || []).map((r) => (
          <div key={r._id} className="border-b py-3 text-sm">
            <div>⭐ {r.rating}</div>
            <div>{r.comment}</div>

            {r.reply?.text && (
              <div className="mt-2 ml-4 p-2 bg-gray-50 border-l text-xs">
                <b>Worker Reply:</b>
                <div>{r.reply.text}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ================= REVIEW FORM ================= */}
      <ReviewBox
        workerId={worker.userId}
        user={user}
        onSuccess={loadWorker}
      />
    </div>
  );
}

/* ================= REVIEW BOX ================= */

function ReviewBox({ workerId, user, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (!rating) {
      setMsg("Please select rating");
      return;
    }

    const res = await fetch(`/api/workers/${workerId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ rating, comment }),
    });

    const data = await res.json();
    if (!data.ok) {
      setMsg(data.error || "Failed");
      return;
    }

    setMsg("✅ Review submitted");
    setRating(0);
    setComment("");
    onSuccess?.();
  }

  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold mb-2">Leave a Review</h3>

      <RatingStars value={rating} onChange={setRating} />

      <textarea
        className="w-full border rounded p-2 mt-2"
        rows={3}
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {msg && <div className="text-sm mt-1 text-red-600">{msg}</div>}

      <button
        onClick={submit}
        className="mt-2 px-4 py-2 bg-black text-white rounded"
      >
        Submit Review
      </button>
    </div>
  );
}





// // ------------New code---------------
// "use client";

// import { useEffect, useState, use } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/contexts/AuthContext";
// import Image from "next/image";
// import {
//   CheckCircle,
//   MapPin,
//   Star,
//   Phone,
//   MessageCircle,
//   Calendar,
//   Clock,
//   Heart,
//   Share2,
//   ChevronLeft,
//   ChevronRight,
//   Pause,
//   Play,
//   Users,
//   Award,
//   Shield,
//   Sparkles,
//   Globe,
//   Languages as LanguagesIcon,
//   Ruler,
//   Droplets,
//   TrendingUp,
//   Eye,
//   BookOpen,
//   Briefcase,
//   Coffee,
//   Plane,
//   Music,
//   Camera,
//   Gift,
//   Lock,
//   Bell,
//   Filter,
//   Bookmark,
//   MoreVertical,
//   Tag,
//   Percent,
//   Zap,
//   Crown,
//   Gem,
//   Diamond,
//   Moon,
//   Sun,
//   Palette,
//   Cake,
//   Gamepad2,
//   Wine,
//   Trophy,
//   Target,
//   Check,
//   X,
//   ExternalLink,
//   User,
//   Weight,
//   Award as AwardIcon,
//   ShieldCheck,
//   AlertCircle,
// } from "lucide-react";

// export default function WorkerProfilePage({ params }) {
//   const { id: workerId } = use(params);
//   const router = useRouter();
//   const { user } = useAuth();

//   const [worker, setWorker] = useState(null);
//   const [error, setError] = useState("");
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isHovering, setIsHovering] = useState(false);
//   const [isFavorited, setIsFavorited] = useState(false);
//   const [showAllServices, setShowAllServices] = useState(false);
//   const [showAllReviews, setShowAllReviews] = useState(false);
//   const [selectedTab, setSelectedTab] = useState("overview");
//   const [showPhone, setShowPhone] = useState(false);
//   const [images, setImages] = useState([]);
//   const intervalRef = useState(null);

//   useEffect(() => {
//     async function load() {
//       const res = await fetch(`/api/workers/${workerId}`);
//       const data = await res.json();

//       if (!data.ok) {
//         setError(data.error || "Worker not found");
//         return;
//       }
//       setWorker(data.worker);
      
//       // Prepare images array
//       const allImages = [];
//       if (data.worker.profilePhoto) allImages.push(data.worker.profilePhoto);
//       if (data.worker.galleryPhotos) {
//         allImages.push(...data.worker.galleryPhotos);
//       }
//       setImages(allImages);
//     }
//     load();
//   }, [workerId]);

//   // Auto-slideshow functionality
//   useEffect(() => {
//     if (!worker || !isPlaying || isHovering || images.length <= 1) return;

//     intervalRef.current = setInterval(() => {
//       setSelectedImage((prev) => (prev + 1) % images.length);
//     }, 4000);

//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, [worker, isPlaying, isHovering, images]);

//   const handlePrevImage = () => {
//     setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
//     resetAutoPlay();
//   };

//   const handleNextImage = () => {
//     setSelectedImage((prev) => (prev + 1) % images.length);
//     resetAutoPlay();
//   };

//   const resetAutoPlay = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//     }
//     if (isPlaying && worker && images.length > 1) {
//       intervalRef.current = setInterval(() => {
//         setSelectedImage((prev) => (prev + 1) % images.length);
//       }, 4000);
//     }
//   };

//   const toggleAutoPlay = () => {
//     setIsPlaying(!isPlaying);
//   };

//   async function startChat() {
//     if (!user) return router.push("/login");

//     const res = await fetch("/api/chat/conversation", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify({ workerUserId: worker.userId }),
//     });

//     const data = await res.json();
//     if (data.ok) router.push(`/chat/${data.conversationId}`);
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#0b0214] via-purple-950 to-black">
//         <div className="text-center">
//           <div className="text-6xl mb-4">😔</div>
//           <h1 className="text-2xl font-light mb-2">Worker Not Found</h1>
//           <p className="text-white/60">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   if (!worker) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#0b0214] via-purple-950 to-black">
//         <div className="text-center">
//           <div className="text-6xl mb-4 animate-pulse">✨</div>
//           <h1 className="text-2xl font-light mb-2">Loading Profile...</h1>
//           <p className="text-white/60">Please wait while we fetch the details</p>
//         </div>
//       </div>
//     );
//   }

//   const a = worker.availability || {};
//   const allServices = worker.services || [];
//   const extraServices = worker.extraServices || [];
//   const totalServices = [...allServices, ...extraServices];

//   // Calculate average experience
//   const avgExperience = allServices.length > 0 
//     ? Math.round(allServices.reduce((sum, s) => sum + (s.experienceYears || 0), 0) / allServices.length)
//     : 0;

//   // Calculate average price
//   const avgPrice = totalServices.length > 0
//     ? Math.round(totalServices.reduce((sum, s) => sum + (s.basePrice || s.price || 0), 0) / totalServices.length)
//     : 0;

//   // Mock reviews for UI
//   const reviews = [
//     {
//       name: "Alex",
//       rating: 4.8,
//       date: "1 week ago",
//       comment: "Excellent service! Very professional and skilled. Would definitely hire again.",
//       verified: true,
//     },
//     {
//       name: "Priya",
//       rating: 5,
//       date: "2 weeks ago",
//       comment: "Prompt and efficient. Quality of work exceeded my expectations.",
//       verified: true,
//     },
//     {
//       name: "Rahul",
//       rating: 4.5,
//       date: "1 month ago",
//       comment: "Reliable worker with great attention to detail. Highly recommended!",
//       verified: true,
//     },
//   ];

//   const languages = (worker.languages || []).map(lang => ({
//     language: lang,
//     level: "Fluent"
//   }));

//   // Detailed stats based on worker data
//   const detailedStats = {
//     experience: `${avgExperience}+ yrs`,
//     completionRate: "96%",
//     repeatClients: "68%",
//     responseTime: a.timeFrom ? `${a.timeFrom} min` : "Within hours",
//     satisfaction: "4.7/5",
//     rating: "4.8/5",
//   };

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-[#0b0214] via-purple-950 to-black text-white">
//       {/* Enhanced Background Elements */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-20 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute bottom-20 -right-40 w-96 h-96 bg-pink-900/20 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-pink-900/5 to-purple-900/5 rounded-full blur-3xl"></div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12 relative z-10">
//         {/* Navigation Bar */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center gap-4">
//             <button 
//               onClick={() => router.back()}
//               className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
//             >
//               <ChevronLeft className="h-5 w-5" />
//             </button>
//             <div className="hidden md:flex items-center gap-2 text-sm text-white/60">
//               <span>Professionals</span>
//               <span>•</span>
//               <span>{worker.city || "City"}</span>
//               <span>•</span>
//               <span className="text-white">Profile</span>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <button 
//               onClick={() => setIsFavorited(!isFavorited)}
//               className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
//             >
//               <Bookmark className={`h-5 w-5 ${isFavorited ? 'fill-pink-500 text-pink-500' : ''}`} />
//             </button>
//             <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
//               <Share2 className="h-5 w-5" />
//             </button>
//             <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
//               <MoreVertical className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
//           {/* LEFT – LARGE IMAGE GALLERY WITH SLIDESHOW */}
//           <div className="lg:col-span-3 space-y-6">
//             {/* REVIEW STARS AT THE TOP */}
//             <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center gap-2">
//                   <div className="flex items-center">
//                     {[...Array(5)].map((_, i) => (
//                       <Star key={i} className={`h-5 w-5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`} />
//                     ))}
//                   </div>
//                   <span className="text-2xl font-bold">4.8</span>
//                   <span className="text-white/60 text-sm">/5.0</span>
//                 </div>
//                 <div className="h-6 w-px bg-white/20"></div>
//                 <div className="text-sm">
//                   <span className="text-white/90 font-medium">{reviews.length} reviews</span>
//                   <span className="text-white/60 ml-2">• 96% satisfaction</span>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-2">
//                 <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
//                   <span className="text-sm font-medium text-green-300 flex items-center gap-1">
//                     <CheckCircle className="h-4 w-4" />
//                     Verified Reviews
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Badges */}
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
//                   <AwardIcon className="h-4 w-4 text-amber-400" />
//                   <span className="text-sm font-medium text-amber-300">Pro Verified</span>
//                 </div>
//                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
//                   <ShieldCheck className="h-4 w-4 text-blue-400" />
//                   <span className="text-sm font-medium text-blue-300">Background Checked</span>
//                 </div>
//                 {a.emergencyAvailable && (
//                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30">
//                     <AlertCircle className="h-4 w-4 text-red-400" />
//                     <span className="text-sm font-medium text-red-300">Emergency Available</span>
//                   </div>
//                 )}
//               </div>
              
//               <div className="flex items-center gap-3">
//                 <span className="text-sm text-white/60">Profile views: 1.2k</span>
//                 <Eye className="h-4 w-4 text-white/40" />
//               </div>
//             </div>

//             {/* Main Image Container */}
//             {images.length > 0 ? (
//               <div 
//                 className="relative aspect-[4/5] rounded-3xl overflow-hidden group border-2 border-white/10"
//                 onMouseEnter={() => setIsHovering(true)}
//                 onMouseLeave={() => setIsHovering(false)}
//               >
//                 {/* All Images Stack */}
//                 <div className="absolute inset-0">
//                   {images.map((img, index) => (
//                     <div
//                       key={index}
//                       className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
//                         index === selectedImage ? 'opacity-100' : 'opacity-0'
//                       }`}
//                     >
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10"></div>
//                       <Image
//                         src={img}
//                         alt={`${worker.fullName} - Image ${index + 1}`}
//                         fill
//                         className="object-cover"
//                         priority={index === 0}
//                         sizes="(max-width: 768px) 100vw, 50vw"
//                       />
//                     </div>
//                   ))}
//                 </div>
                
//                 {/* Navigation Arrows - Only show if multiple images */}
//                 {images.length > 1 && (
//                   <>
//                     <button
//                       onClick={handlePrevImage}
//                       className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
//                     >
//                       <ChevronLeft className="h-5 w-5" />
//                     </button>
//                     <button
//                       onClick={handleNextImage}
//                       className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
//                     >
//                       <ChevronRight className="h-5 w-5" />
//                     </button>
//                   </>
//                 )}
                
//                 {/* Top Controls */}
//                 <div className="absolute top-4 right-4 z-20 flex gap-2">
//                   <button 
//                     onClick={() => setIsFavorited(!isFavorited)}
//                     className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all hover:scale-110"
//                   >
//                     <Heart className={`h-5 w-5 ${isFavorited ? 'fill-pink-500 text-pink-500' : ''}`} />
//                   </button>
//                   <button className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all hover:scale-110">
//                     <Share2 className="h-5 w-5" />
//                   </button>
//                   {images.length > 1 && (
//                     <button 
//                       onClick={toggleAutoPlay}
//                       className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all hover:scale-110"
//                     >
//                       {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
//                     </button>
//                   )}
//                 </div>
                
//                 {/* Image Info */}
//                 <div className="absolute bottom-4 left-4 z-20">
//                   <div className="flex items-center gap-3">
//                     {images.length > 1 && (
//                       <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-sm">
//                         {selectedImage + 1} / {images.length}
//                       </div>
//                     )}
//                     <div className="px-3 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium bg-emerald-500/20 text-emerald-300">
//                       🟢 Available Now
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Tags Overlay */}
//                 <div className="absolute top-4 left-4 z-20 flex gap-2">
//                   <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/30 text-xs">
//                     Professional
//                   </div>
//                   {worker.skills?.[0] && (
//                     <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 text-xs">
//                       {worker.skills[0]}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="relative aspect-[4/5] rounded-3xl overflow-hidden group border-2 border-white/10 bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center">
//                 <div className="text-center">
//                   <User className="h-20 w-20 text-white/30 mx-auto mb-4" />
//                   <p className="text-white/60">No images available</p>
//                 </div>
//               </div>
//             )}

//             {/* Thumbnail Gallery */}
//             {images.length > 1 && (
//               <div className="grid grid-cols-5 gap-3">
//                 {images.map((img, i) => (
//                   <button
//                     key={i}
//                     onClick={() => {
//                       setSelectedImage(i);
//                       resetAutoPlay();
//                     }}
//                     onMouseEnter={() => setIsHovering(true)}
//                     onMouseLeave={() => setIsHovering(false)}
//                     className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 group ${
//                       selectedImage === i 
//                         ? 'border-pink-500 scale-105 shadow-lg shadow-pink-500/30' 
//                         : 'border-white/10 hover:border-white/30 hover:scale-102'
//                     }`}
//                   >
//                     <Image
//                       src={img}
//                       alt=""
//                       fill
//                       className="object-cover"
//                     />
//                     <div className={`absolute inset-0 transition-all duration-300 ${
//                       selectedImage === i 
//                         ? 'bg-gradient-to-tr from-pink-500/30 to-purple-500/30' 
//                         : 'bg-black/40 group-hover:bg-black/20'
//                     }`}></div>
//                     {isPlaying && selectedImage === i && images.length > 1 && (
//                       <div className="absolute top-2 right-2 z-10">
//                         <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
//                       </div>
//                     )}
//                     {/* Hover View Icon */}
//                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                       <Eye className="h-6 w-6 text-white/80" />
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}

//             {/* Detailed Stats Grid */}
//             <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm border border-white/10 p-6">
//               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                 <TrendingUp className="h-5 w-5 text-purple-400" />
//                 Performance Metrics
//               </h3>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {Object.entries(detailedStats).map(([key, value]) => (
//                   <div key={key} className="text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
//                     <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
//                       {value}
//                     </div>
//                     <div className="text-xs text-white/60 mt-1 capitalize">
//                       {key.replace(/([A-Z])/g, ' $1').trim()}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Tabs Navigation */}
//             <div className="flex border-b border-white/10 overflow-x-auto">
//               {["overview", "services", "availability", "reviews"].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setSelectedTab(tab)}
//                   className={`px-6 py-3 text-sm font-medium transition-all flex-shrink-0 relative ${
//                     selectedTab === tab 
//                       ? "text-white" 
//                       : "text-white/60 hover:text-white"
//                   }`}
//                 >
//                   {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                   {selectedTab === tab && (
//                     <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500"></div>
//                   )}
//                 </button>
//               ))}
//             </div>

//             {/* Tab Content */}
//             <div className="pt-6">
//               {selectedTab === "overview" && (
//                 <div className="space-y-6">
//                   <div>
//                     <h4 className="text-lg font-semibold mb-3">About {worker.fullName?.split(' ')[0]}</h4>
//                     <p className="text-white/80 leading-relaxed">
//                       {worker.bio || "Professional service provider with excellent skills and dedication."}
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-4">
//                       <h5 className="font-medium text-white/90 flex items-center gap-2">
//                         <Globe className="h-5 w-5" />
//                         Languages
//                       </h5>
//                       <div className="space-y-2">
//                         {languages.map((lang, i) => (
//                           <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
//                             <div className="flex items-center gap-3">
//                               <LanguagesIcon className="h-4 w-4 text-white/60" />
//                               <span>{lang.language}</span>
//                             </div>
//                             <span className="text-sm text-white/60 bg-white/5 px-2 py-1 rounded">{lang.level}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <h5 className="font-medium text-white/90 flex items-center gap-2">
//                         <AwardIcon className="h-5 w-5" />
//                         Skills & Expertise
//                       </h5>
//                       <div className="flex flex-wrap gap-2">
//                         {(worker.skills || []).map((skill, i) => (
//                           <span key={i} className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-sm">
//                             {skill}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Personal Info Grid */}
//                   <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6">
//                     <h5 className="font-semibold mb-4 flex items-center gap-2">
//                       <User className="h-5 w-5 text-purple-400" />
//                       Personal Information
//                     </h5>
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                       <div className="space-y-1">
//                         <div className="text-sm text-white/60">Gender</div>
//                         <div className="font-medium">{worker.gender || "-"}</div>
//                       </div>
//                       <div className="space-y-1">
//                         <div className="text-sm text-white/60">Nationality</div>
//                         <div className="font-medium">{worker.nationality || "-"}</div>
//                       </div>
//                       <div className="space-y-1">
//                         <div className="text-sm text-white/60">Experience</div>
//                         <div className="font-medium">{avgExperience}+ years</div>
//                       </div>
//                       <div className="space-y-1">
//                         <div className="text-sm text-white/60">Height</div>
//                         <div className="font-medium">{worker.heightCm || "-"} cm</div>
//                       </div>
//                       <div className="space-y-1">
//                         <div className="text-sm text-white/60">Weight</div>
//                         <div className="font-medium">{worker.weightKg || "-"} kg</div>
//                       </div>
//                       <div className="space-y-1">
//                         <div className="text-sm text-white/60">Hair Color</div>
//                         <div className="font-medium">{worker.hairColor || "-"}</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {selectedTab === "services" && (
//                 <div className="space-y-6">
//                   <div>
//                     <h4 className="text-lg font-semibold mb-4">Main Services</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {allServices.map((service, i) => (
//                         <div key={i} className="rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-5 hover:border-white/20 transition-all">
//                           <div className="flex items-start justify-between mb-3">
//                             <div className="flex items-center gap-3">
//                               <div className="p-2.5 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
//                                 <Briefcase className="h-5 w-5" />
//                               </div>
//                               <div>
//                                 <div className="font-medium">{service.name}</div>
//                                 <div className="text-sm text-white/60">{service.experienceYears || 0} years experience</div>
//                               </div>
//                             </div>
//                             <div className="text-xl font-bold text-pink-400">
//                               ₹{service.basePrice}
//                               <span className="text-sm text-white/60">/service</span>
//                             </div>
//                           </div>
//                           <button 
//                             onClick={startChat}
//                             className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
//                           >
//                             Book This Service
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {extraServices.length > 0 && (
//                     <div>
//                       <h4 className="text-lg font-semibold mb-4">Additional Services</h4>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {extraServices.map((service, i) => (
//                           <div key={i} className="rounded-xl bg-gradient-to-br from-white/5 to-white/3 border border-white/10 p-4 hover:border-white/20 transition-all">
//                             <div className="flex items-center justify-between">
//                               <div className="font-medium">{service.title}</div>
//                               <div className="text-lg font-bold text-purple-400">₹{service.price}</div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {selectedTab === "availability" && (
//                 <div className="space-y-6">
//                   <div>
//                     <h4 className="text-lg font-semibold mb-4">Availability Schedule</h4>
//                     <div className="grid grid-cols-7 gap-2">
//                       {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
//                         <div 
//                           key={i} 
//                           className={`text-center p-3 rounded-xl ${
//                             a.workingDays?.includes(day) 
//                               ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30' 
//                               : 'bg-white/5 border border-white/10'
//                           }`}
//                         >
//                           <div className="font-medium mb-2">{day}</div>
//                           {a.workingDays?.includes(day) ? (
//                             <div className="text-sm text-white/80">
//                               {a.timeFrom || "9:00"} - {a.timeTo || "18:00"}
//                             </div>
//                           ) : (
//                             <div className="text-sm text-white/30">Not Available</div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-blue-500/20">
//                           <MapPin className="h-5 w-5 text-blue-400" />
//                         </div>
//                         <div>
//                           <div className="font-medium">Service Radius</div>
//                           <div className="text-sm text-white/60">{worker.serviceRadiusKm || 10} km range</div>
//                         </div>
//                       </div>
//                     </div>

//                     {a.emergencyAvailable && (
//                       <div className="rounded-xl bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 p-4">
//                         <div className="flex items-center gap-3">
//                           <div className="p-2 rounded-lg bg-red-500/20">
//                             <AlertCircle className="h-5 w-5 text-red-400" />
//                           </div>
//                           <div>
//                             <div className="font-medium">Emergency Service</div>
//                             <div className="text-sm text-white/60">Available 24/7 for urgent needs</div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {selectedTab === "reviews" && (
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between">
//                     <h4 className="text-lg font-semibold">Client Reviews ({reviews.length})</h4>
//                     <div className="flex items-center gap-2">
//                       <div className="flex items-center gap-1">
//                         {[...Array(5)].map((_, i) => (
//                           <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
//                         ))}
//                       </div>
//                       <span className="text-lg font-bold">4.8</span>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     {reviews.slice(0, showAllReviews ? reviews.length : 2).map((review, i) => (
//                       <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-5">
//                         <div className="flex items-start justify-between mb-3">
//                           <div>
//                             <div className="flex items-center gap-2">
//                               <div className="font-medium">{review.name}</div>
//                               {review.verified && (
//                                 <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">
//                                   Verified
//                                 </div>
//                               )}
//                             </div>
//                             <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
//                               <span>{review.date}</span>
//                               <span>•</span>
//                               <div className="flex items-center gap-1">
//                                 {[...Array(5)].map((_, starIndex) => (
//                                   <Star 
//                                     key={starIndex} 
//                                     className={`h-3 w-3 ${starIndex < Math.floor(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
//                                   />
//                                 ))}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                         <p className="text-white/80">{review.comment}</p>
//                       </div>
//                     ))}
//                   </div>

//                   {reviews.length > 2 && (
//                     <button
//                       onClick={() => setShowAllReviews(!showAllReviews)}
//                       className="w-full py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
//                     >
//                       {showAllReviews ? "Show Less Reviews" : "Load All Reviews"}
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* RIGHT – SIDEBAR CONTENT */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Profile Header Card */}
//             <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border border-white/10 p-6">
//               <div className="flex justify-between items-start mb-6">
//                 <div>
//                   <h1 className="text-4xl font-light tracking-tight">
//                     {worker.fullName}
//                   </h1>
//                   <div className="flex items-center gap-2 mt-2">
//                     <MapPin className="h-4 w-4 text-white/60" />
//                     <span className="text-white/70">{worker.city || "City not specified"}</span>
//                   </div>
//                 </div>
                
//                 <div className="text-right">
//                   <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
//                     ₹{avgPrice}
//                     <span className="text-lg">/service</span>
//                   </div>
//                   <div className="text-sm text-white/60">Average rate</div>
//                 </div>
//               </div>

//               <div className="flex flex-wrap gap-2 mb-6">
//                 <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">
//                   <CheckCircle className="h-4 w-4" />
//                   Verified Profile
//                 </span>
//                 <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-sm">
//                   Professional Worker
//                 </span>
//                 {worker.documents?.idProof && (
//                   <span className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-sm">
//                     ID Verified
//                   </span>
//                 )}
//               </div>

//               <div className="flex items-center justify-between text-sm">
//                 <div className="flex items-center gap-6">
//                   <div>
//                     <div className="text-white/60">Member Since</div>
//                     <div className="font-medium">2023</div>
//                   </div>
//                   <div>
//                     <div className="text-white/60">Jobs Completed</div>
//                     <div className="font-medium">150+</div>
//                   </div>
//                   <div>
//                     <div className="text-white/60">Response Rate</div>
//                     <div className="font-medium text-emerald-400">98%</div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold flex items-center gap-2">
//                 <Zap className="h-5 w-5 text-pink-400" />
//                 Quick Actions
//               </h3>

//               <div className="grid grid-cols-1 gap-3">
//                 <button
//                   onClick={startChat}
//                   className="p-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-semibold flex items-center justify-center gap-3 hover:from-pink-500 hover:to-purple-500 transition-all hover:scale-[1.02]"
//                 >
//                   <MessageCircle className="h-5 w-5" />
//                   Start Chat
//                 </button>

//                 {worker.phone && (
//                   <button
//                     onClick={() => setShowPhone(!showPhone)}
//                     className={`p-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] ${
//                       showPhone 
//                         ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
//                         : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
//                     }`}
//                   >
//                     {showPhone ? (
//                       <a 
//                         href={`tel:${worker.phone}`}
//                         onClick={(e) => e.stopPropagation()}
//                         className="flex items-center gap-2"
//                       >
//                         <Phone className="h-5 w-5" />
//                         <span className="font-bold">{worker.phone}</span>
//                       </a>
//                     ) : (
//                       <>
//                         <Phone className="h-5 w-5" />
//                         Call Now
//                       </>
//                     )}
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Booking Widget */}
//             <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-5">
//               <h3 className="font-semibold mb-4">Quick Booking</h3>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm text-white/60 mb-2">Select Date</label>
//                   <div className="p-3 rounded-xl bg-white/5 border border-white/10">
//                     <Calendar className="h-5 w-5 inline mr-2" />
//                     <span>Tomorrow, {a.timeFrom || "10:00"}</span>
//                   </div>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm text-white/60 mb-2">Service Duration</label>
//                   <div className="grid grid-cols-3 gap-2">
//                     {["2h", "4h", "Full day"].map((duration) => (
//                       <button
//                         key={duration}
//                         className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
//                       >
//                         {duration}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
                
//                 <div className="pt-4 border-t border-white/10">
//                   <div className="flex justify-between mb-2">
//                     <span className="text-white/60">Service Fee</span>
//                     <span>₹{avgPrice}</span>
//                   </div>
//                   <div className="flex justify-between mb-2">
//                     <span className="text-white/60">Booking Fee</span>
//                     <span>₹50</span>
//                   </div>
//                   <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
//                     <span>Total</span>
//                     <span className="text-pink-400">₹{avgPrice + 50}</span>
//                   </div>
//                 </div>
                
//                 <button 
//                   onClick={startChat}
//                   className="w-full p-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-semibold hover:from-pink-500 hover:to-purple-500 transition-all"
//                 >
//                   Book Now
//                 </button>
//               </div>
//             </div>

//             {/* Documents Section */}
//             {(worker.documents?.idProof || worker.documents?.addressProof) && (
//               <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 p-5">
//                 <h3 className="font-semibold mb-4 flex items-center gap-2">
//                   <Shield className="h-5 w-5 text-emerald-400" />
//                   Verified Documents
//                 </h3>
                
//                 <div className="space-y-3">
//                   {worker.documents?.idProof && (
//                     <a 
//                       href={worker.documents.idProof} 
//                       target="_blank"
//                       className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
//                     >
//                       <div className="p-2 rounded-lg bg-emerald-500/20">
//                         <CheckCircle className="h-4 w-4 text-emerald-400" />
//                       </div>
//                       <div>
//                         <div className="font-medium">ID Proof Verified</div>
//                         <div className="text-sm text-white/60">Click to view document</div>
//                       </div>
//                     </a>
//                   )}
                  
//                   {worker.documents?.addressProof && (
//                     <a 
//                       href={worker.documents.addressProof} 
//                       target="_blank"
//                       className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
//                     >
//                       <div className="p-2 rounded-lg bg-emerald-500/20">
//                         <CheckCircle className="h-4 w-4 text-emerald-400" />
//                       </div>
//                       <div>
//                         <div className="font-medium">Address Proof Verified</div>
//                         <div className="text-sm text-white/60">Click to view document</div>
//                       </div>
//                     </a>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Service Radius Info */}
//             <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
//               <h3 className="font-semibold mb-4">Service Area</h3>
              
//               <div className="space-y-3">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
//                     <MapPin className="h-4 w-4 text-pink-400" />
//                   </div>
//                   <div>
//                     <div className="font-medium">Coverage Area</div>
//                     <div className="text-sm text-white/60">Within {worker.serviceRadiusKm || 10} km of {worker.city}</div>
//                   </div>
//                 </div>
                
//                 <div className="text-sm text-white/60 bg-white/5 p-3 rounded-lg">
//                   <div className="font-medium text-white mb-1">Service Policy:</div>
//                   <ul className="space-y-1 list-disc ml-4">
//                     <li>Free cancellation 24h before</li>
//                     <li>Flexible timing available</li>
//                     <li>Emergency service: {a.emergencyAvailable ? "Available" : "Not available"}</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>

//             {/* Similar Workers */}
//             <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
//               <h3 className="font-semibold mb-4">Similar Professionals</h3>
              
//               <div className="space-y-3">
//                 {[1, 2, 3].map((i) => (
//                   <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
//                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30"></div>
//                     <div className="flex-1">
//                       <div className="font-medium">Similar Worker {i}</div>
//                       <div className="text-sm text-white/60">₹{avgPrice + i * 100}/h • {worker.city}</div>
//                     </div>
//                     <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
//                       <ExternalLink className="h-4 w-4" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }

