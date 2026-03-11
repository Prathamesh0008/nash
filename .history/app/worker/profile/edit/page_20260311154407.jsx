"use client";

import { useEffect, useState } from "react";
import { 
  User, 
  Camera, 
  Image, 
  FileText, 
  Briefcase, 
  MapPin, 
  Mail,
  Phone,
  Calendar,
  Save,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  Plus,
  Globe,
  Home,
  Award,
  Tag,
  Sparkles,
  Heart,
  Clock,
  Shield,
  Star,
  Eye
} from "lucide-react";

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function WorkerProfileEditPage() {
  const [form, setForm] = useState({
    profilePhoto: "",
    galleryPhotos: "",
    bio: "",
    gender: "other",
    skills: "",
    categories: "",
    city: "",
    pincode: "",
    address: "",
    phone: "",
    email: "",
    experience: "",
    languages: "",
  });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/worker/profile", { credentials: "include" });
        const data = await res.json();
        
        if (!data.ok) {
          setMsg({ type: "error", text: data.error || "Failed to load profile" });
          setLoading(false);
          return;
        }

        const profile = data.profile || {};
        const firstArea = Array.isArray(profile.serviceAreas) && profile.serviceAreas.length > 0 ? profile.serviceAreas[0] : null;

        setForm({
          profilePhoto: profile.profilePhoto || "",
          galleryPhotos: (profile.galleryPhotos || []).join(","),
          bio: profile.bio || "",
          gender: profile.gender || "other",
          skills: (profile.skills || []).join(","),
          categories: (profile.categories || []).join(","),
          city: firstArea?.city || "",
          pincode: firstArea?.pincode || "",
          address: profile.address || "",
          phone: profile.phone || "",
          email: profile.email || "",
          experience: profile.experience || "",
          languages: (profile.languages || []).join(","),
        });
      } catch (error) {
        setMsg({ type: "error", text: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });

    const payload = {
      profilePhoto: form.profilePhoto.trim(),
      galleryPhotos: splitCsv(form.galleryPhotos),
      bio: form.bio.trim(),
      gender: form.gender,
      skills: splitCsv(form.skills),
      categories: splitCsv(form.categories),
      serviceAreas: form.city && form.pincode ? [{ city: form.city.trim(), pincode: form.pincode.trim() }] : [],
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      experience: form.experience,
      languages: splitCsv(form.languages),
    };

    try {
      const res = await fetch("/api/worker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMsg({ 
        type: data.ok ? "success" : "error", 
        text: data.ok ? "Profile updated successfully" : data.error || "Update failed" 
      });
    } catch (error) {
      setMsg({ type: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: User, color: "fuchsia" },
    { id: "photos", label: "Photos", icon: Camera, color: "fuchsia" },
    { id: "escort", label: "Escort Profile", icon: Sparkles, color: "fuchsia" },
    { id: "location", label: "Location", icon: MapPin, color: "fuchsia" },
    { id: "contact", label: "Contact", icon: Mail, color: "fuchsia" },
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case "basic":
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <User className="h-4 w-4 text-fuchsia-400" />
                Bio
              </label>
              <textarea 
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                rows={4}
                placeholder="Tell clients about yourself, your experience, and what makes you special..."
                value={form.bio} 
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} 
              />
              <p className="mt-1 text-xs text-slate-500">{form.bio.length} characters</p>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Heart className="h-4 w-4 text-fuchsia-400" />
                Gender
              </label>
              <select 
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2.5 text-sm text-white focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                value={form.gender} 
                onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Clock className="h-4 w-4 text-fuchsia-400" />
                Experience
              </label>
              <select 
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2.5 text-sm text-white focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                value={form.experience} 
                onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))}
              >
                <option value="">Select experience</option>
                <option value="0-1">Less than 1 year</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Globe className="h-4 w-4 text-fuchsia-400" />
                Languages
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input 
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                  placeholder="English, Hindi, Marathi (comma separated)"
                  value={form.languages} 
                  onChange={(e) => setForm((prev) => ({ ...prev, languages: e.target.value }))} 
                />
              </div>
              {splitCsv(form.languages).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {splitCsv(form.languages).map((lang, idx) => (
                    <span key={idx} className="rounded-full bg-fuchsia-950/50 px-2 py-1 text-xs text-fuchsia-400">
                      {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "photos":
        return (
          <div className="space-y-6">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Camera className="h-4 w-4 text-fuchsia-400" />
                Profile Photo
              </label>
              <div className="flex items-start gap-4">
                {form.profilePhoto ? (
                  <div className="group relative h-24 w-24 overflow-hidden rounded-lg border-2 border-fuchsia-500/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, profilePhoto: "" }))}
                      className="absolute top-1 right-1 rounded-full bg-rose-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-fuchsia-500/30 bg-fuchsia-950/20">
                    <Camera className="h-8 w-8 text-fuchsia-500/50" />
                  </div>
                )}
                <div className="flex-1">
                  <input 
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2.5 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                    placeholder="Profile photo URL" 
                    value={form.profilePhoto} 
                    onChange={(e) => setForm((prev) => ({ ...prev, profilePhoto: e.target.value }))} 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Image className="h-4 w-4 text-fuchsia-400" />
                Gallery Photos
              </label>
              <div className="mb-3 grid grid-cols-4 gap-2">
                {splitCsv(form.galleryPhotos).map((photo, idx) => (
                  <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <input 
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2.5 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                placeholder="Gallery photo URLs (comma separated)" 
                value={form.galleryPhotos} 
                onChange={(e) => setForm((prev) => ({ ...prev, galleryPhotos: e.target.value }))} 
              />
              <p className="mt-1 text-xs text-slate-500">Enter multiple URLs separated by commas</p>
            </div>
          </div>
        );

      case "escort":
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Star className="h-4 w-4 text-fuchsia-400" />
                Skills
              </label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input 
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                  placeholder="e.g., Massage, Companion, VIP (comma separated)"
                  value={form.skills} 
                  onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))} 
                />
              </div>
              {splitCsv(form.skills).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {splitCsv(form.skills).map((skill, idx) => (
                    <span key={idx} className="rounded-full bg-fuchsia-950/50 px-2 py-1 text-xs text-fuchsia-400">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Tag className="h-4 w-4 text-fuchsia-400" />
                Categories
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input 
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                  placeholder="e.g., Premium, Standard, VIP (comma separated)"
                  value={form.categories} 
                  onChange={(e) => setForm((prev) => ({ ...prev, categories: e.target.value }))} 
                />
              </div>
              {splitCsv(form.categories).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {splitCsv(form.categories).map((category, idx) => (
                    <span key={idx} className="rounded-full bg-fuchsia-950/50 px-2 py-1 text-xs text-fuchsia-400">
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <MapPin className="h-4 w-4 text-fuchsia-400" />
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input 
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                    placeholder="City"
                    value={form.city} 
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} 
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Shield className="h-4 w-4 text-fuchsia-400" />
                  Pincode
                </label>
                <input 
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2.5 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                  placeholder="Pincode"
                  value={form.pincode} 
                  onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))} 
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Home className="h-4 w-4 text-fuchsia-400" />
                Address
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input 
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                  placeholder="Street address"
                  value={form.address} 
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} 
                />
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Mail className="h-4 w-4 text-fuchsia-400" />
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input 
                  type="email"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                  placeholder="your@email.com"
                  value={form.email} 
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} 
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Phone className="h-4 w-4 text-fuchsia-400" />
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input 
                  type="tel"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none" 
                  placeholder="+91 98765 43210"
                  value={form.phone} 
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} 
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header with Fuchsia Accent */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-fuchsia-500/20 to-fuchsia-600/20 p-3">
              <User className="h-8 w-8 text-fuchsia-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          <p className="mt-2 text-slate-400">Update your escort information and preferences</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-fuchsia-500"></div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            {/* Tabs with Fuchsia Active State */}
            <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-800 pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "bg-fuchsia-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <form onSubmit={save}>
              <div className="min-h-[400px]">
                {renderTabContent()}
              </div>

              {/* Form Actions */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 rounded-lg border border-fuchsia-700 bg-fuchsia-900/30 px-4 py-2 text-sm font-medium text-fuchsia-300 transition hover:bg-fuchsia-800/50"
                >
                  <Eye className="h-4 w-4" />
                  {previewMode ? "Hide Preview" : "Preview Profile"}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 px-6 py-2 text-sm font-medium text-white transition hover:from-fuchsia-500 hover:to-fuchsia-400 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Message Display */}
            {msg.text && (
              <div className={`mt-4 rounded-lg p-3 ${
                msg.type === "error"
                  ? "bg-rose-900/50 text-rose-300"
                  : msg.type === "success"
                  ? "bg-fuchsia-900/50 text-fuchsia-300"
                  : "bg-slate-800 text-slate-300"
              }`}>
                <div className="flex items-center gap-2">
                  {msg.type === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : msg.type === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : null}
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview Modal with Fuchsia Accents */}
        {previewMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-fuchsia-800/30 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Profile Preview</h2>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-fuchsia-600 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  {form.profilePhoto ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.profilePhoto} alt="Profile" className="h-20 w-20 rounded-full object-cover ring-4 ring-fuchsia-500/30" />
                    </>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-950/30">
                      <User className="h-10 w-10 text-fuchsia-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-white">Your Profile</p>
                    <p className="text-sm text-slate-400 capitalize">{form.gender}</p>
                  </div>
                </div>

                {/* Bio */}
                {form.bio && (
                  <div className="rounded-lg bg-fuchsia-950/20 p-3">
                    <p className="text-sm text-slate-300">{form.bio}</p>
                  </div>
                )}

                {/* Skills & Categories */}
                <div className="grid gap-4 md:grid-cols-2">
                  {splitCsv(form.skills).length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-400">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {splitCsv(form.skills).map((skill, idx) => (
                          <span key={idx} className="rounded-full bg-fuchsia-950/50 px-2 py-1 text-xs text-fuchsia-400">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {splitCsv(form.categories).length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-400">Categories</p>
                      <div className="flex flex-wrap gap-1">
                        {splitCsv(form.categories).map((category, idx) => (
                          <span key={idx} className="rounded-full bg-fuchsia-950/50 px-2 py-1 text-xs text-fuchsia-400">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Languages */}
                {splitCsv(form.languages).length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-400">Languages</p>
                    <div className="flex flex-wrap gap-1">
                      {splitCsv(form.languages).map((lang, idx) => (
                        <span key={idx} className="rounded-full bg-fuchsia-950/50 px-2 py-1 text-xs text-fuchsia-400">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                {(form.city || form.address) && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-400">Location</p>
                    <p className="text-sm text-white">
                      {form.city}{form.city && form.pincode ? ", " : ""}{form.pincode}
                    </p>
                    {form.address && (
                      <p className="text-xs text-slate-400">{form.address}</p>
                    )}
                  </div>
                )}

                {/* Contact */}
                {(form.email || form.phone) && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-400">Contact</p>
                    {form.email && <p className="text-sm text-white">{form.email}</p>}
                    {form.phone && <p className="text-sm text-white">{form.phone}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}