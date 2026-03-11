"use client";

import { useEffect, useMemo, useState } from "react";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { getWorkerOnboardingCompletion } from "@/lib/workerOnboardingChecklist";
import { 
  Camera, 
  Image, 
  User, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Plus,
  Trash2,
  Upload,
  AlertCircle
} from "lucide-react";

function createExtraServiceRow(title = "", price = "") {
  return {
    title: String(title || ""),
    price: String(price ?? ""),
  };
}

function mapProfileExtraServices(extraServices = []) {
  const rows = Array.isArray(extraServices)
    ? extraServices
        .map((row) => createExtraServiceRow(row?.title || "", row?.price ?? ""))
        .filter((row) => row.title.trim())
        .slice(0, 30)
    : [];
  return rows.length > 0 ? rows : [createExtraServiceRow()];
}

function parseExtraServiceRows(rows = []) {
  const extraServices = [];
  const normalizedRows = Array.isArray(rows) ? rows.slice(0, 30) : [];

  for (let idx = 0; idx < normalizedRows.length; idx += 1) {
    const row = normalizedRows[idx] || {};
    const title = String(row.title || "").trim();
    const priceRaw = String(row.price || "").trim();

    if (!title && !priceRaw) continue;
    if (!title) {
      return { extraServices: [], error: `Extra service title is required (row ${idx + 1})` };
    }
    if (!priceRaw) {
      return { extraServices: [], error: `Extra service price is required (row ${idx + 1})` };
    }

    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) {
      return { extraServices: [], error: `Enter valid extra service price (row ${idx + 1})` };
    }

    extraServices.push({ title, price });
  }

  return { extraServices, error: "" };
}

const steps = [
  { id: "photos", label: "Photos", icon: Camera },
  { id: "personal", label: "Personal Info", icon: User },
  { id: "professional", label: "Professional", icon: Briefcase },
  { id: "location", label: "Location", icon: MapPin },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "documents", label: "Documents", icon: FileText },
];

export default function WorkerOnboardingPage() {
  const MAX_GALLERY_PHOTOS = 8;
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    gender: "other",
    profilePhoto: "",
    galleryPhotos: [],
    bio: "",
    skills: "",
    categories: "",
    city: "",
    pincode: "",
    address: "",
    basePrice: "",
    extraServicesRows: [createExtraServiceRow()],
    idProof: "",
    selfie: "",
    certificate: "",
  });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [uploading, setUploading] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/worker/profile/me", { credentials: "include" });
        const data = await res.json();
        const profile = data?.profile;
        if (data?.ok && profile) {
          const firstArea = Array.isArray(profile.serviceAreas) ? profile.serviceAreas[0] : null;
          setForm((prev) => ({
            ...prev,
            gender: profile.gender || prev.gender,
            profilePhoto: profile.profilePhoto || "",
            galleryPhotos: profile.galleryPhotos || [],
            bio: profile.bio || "",
            skills: (profile.skills || []).join(", "),
            categories: (profile.categories || []).join(", "),
            city: firstArea?.city || "",
            pincode: firstArea?.pincode || "",
            address: profile.address || "",
            basePrice: String(Number(profile?.pricing?.basePrice || 0) || ""),
            extraServicesRows: mapProfileExtraServices(profile?.pricing?.extraServices),
            idProof: profile.docs?.idProof || "",
            selfie: profile.docs?.selfie || "",
            certificate: profile.docs?.certificates?.[0] || "",
          }));
        }
      } catch {
        setMsg({ type: "warning", text: "Could not load saved draft. You can still continue." });
      } finally {
        setLoadingDraft(false);
      }
    };
    load();
  }, []);

  const skillsList = useMemo(
    () => form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    [form.skills]
  );
  const categoriesList = useMemo(
    () => form.categories.split(",").map((s) => s.trim()).filter(Boolean),
    [form.categories]
  );
  const onboardingPreview = useMemo(
    () => ({
      profilePhoto: form.profilePhoto,
      galleryPhotos: form.galleryPhotos,
      bio: form.bio,
      skills: skillsList,
      categories: categoriesList,
      serviceAreas: [{ city: form.city, pincode: form.pincode }],
      address: form.address,
      docs: {
        idProof: form.idProof,
        selfie: form.selfie,
      },
    }),
    [form, skillsList, categoriesList]
  );
  const onboardingCompletion = useMemo(
    () => getWorkerOnboardingCompletion(onboardingPreview),
    [onboardingPreview]
  );

  const uploadSingle = async (file, field) => {
    if (!file) return;
    try {
      setUploading(true);
      setMsg({ type: "info", text: "Uploading file..." });
      const url = await uploadToCloudinary(file, { folder: "nash/worker-docs" });
      setForm((prev) => ({ ...prev, [field]: url }));
      setMsg({ type: "success", text: "Upload successful" });
    } catch (error) {
      setMsg({ type: "error", text: error.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const uploadGallery = async (files) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      setMsg({ type: "info", text: "Uploading gallery photos..." });
      const urls = [];
      for (const file of Array.from(files).slice(0, MAX_GALLERY_PHOTOS)) {
        const url = await uploadToCloudinary(file, { folder: "nash/worker-gallery" });
        urls.push(url);
      }
      setForm((prev) => {
        const merged = Array.from(new Set([...(prev.galleryPhotos || []), ...urls])).slice(0, MAX_GALLERY_PHOTOS);
        return { ...prev, galleryPhotos: merged };
      });
      setMsg({ type: "success", text: "Gallery uploaded" });
    } catch (error) {
      setMsg({ type: "error", text: error.message || "Gallery upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const validateStep = (step) => {
    switch(step) {
      case 0: // Photos
        if (!form.profilePhoto) return "Profile photo is required";
        const galleryCount = (form.galleryPhotos || []).length;
        if (galleryCount < 3 || galleryCount > 8) 
          return `Add 3 to 8 gallery photos (current: ${galleryCount})`;
        break;
      case 1: // Personal
        if (form.bio.trim().length < 20) return "Bio must be at least 20 characters";
        break;
      case 2: // Professional
        if (skillsList.length < 1) return "At least one skill is required";
        if (categoriesList.length < 1) return "At least one category is required";
        break;
      case 3: // Location
        if (!form.city || !form.pincode || !form.address) 
          return "City, pincode and address are required";
        if (!/^\d{4,10}$/.test(form.pincode.trim())) 
          return "Enter a valid pincode";
        break;
      case 4: // Pricing
        const basePrice = Number(form.basePrice || 0);
        if (!Number.isFinite(basePrice) || basePrice < 0) 
          return "Base price must be valid";
        const { error: extraServiceError } = parseExtraServiceRows(form.extraServicesRows);
        if (extraServiceError) return extraServiceError;
        break;
      case 5: // Documents
        if (!form.idProof || !form.selfie) 
          return "ID proof and selfie are required";
        break;
    }
    return "";
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      setMsg({ type: "error", text: error });
      return;
    }
    setMsg({ type: "", text: "" });
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setMsg({ type: "", text: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    
    // Validate all steps before final submit
    for (let i = 0; i < steps.length; i++) {
      const error = validateStep(i);
      if (error) {
        setCurrentStep(i);
        setMsg({ type: "error", text: error });
        return;
      }
    }

    setMsg({ type: "", text: "" });
    
    const skills = skillsList;
    const categories = categoriesList;
    const basePrice = Number(form.basePrice || 0);
    const { extraServices, error: extraServiceError } = parseExtraServiceRows(form.extraServicesRows);
    
    if (extraServiceError) {
      setCurrentStep(4);
      setMsg({ type: "error", text: extraServiceError });
      return;
    }

    const payload = {
      gender: form.gender,
      profilePhoto: form.profilePhoto,
      galleryPhotos: form.galleryPhotos,
      bio: form.bio,
      skills,
      categories,
      serviceAreas: [{ city: form.city, pincode: form.pincode }],
      address: form.address,
      pricing: {
        basePrice,
        extraServices,
      },
      docs: {
        idProof: form.idProof,
        selfie: form.selfie,
        certificates: form.certificate ? [form.certificate] : [],
      },
    };

    const draftRes = await fetch("/api/worker/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const draftData = await draftRes.json().catch(() => ({}));
    if (!draftRes.ok || !draftData.ok) {
      setMsg({ type: "error", text: draftData.error || "Failed to save onboarding draft" });
      return;
    }

    const res = await fetch("/api/worker/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      setMsg({ type: "success", text: data.nextSteps || "Onboarding saved. Complete verification fee payment next." });
      return;
    }
    setMsg({ type: "error", text: `${data.error || "Final submit failed"}. Draft saved successfully. Please fix and submit again.` });
  };

  const addExtraServiceRow = () => {
    setForm((prev) => {
      const rows = Array.isArray(prev.extraServicesRows) ? prev.extraServicesRows : [];
      if (rows.length >= 30) return prev;
      return { ...prev, extraServicesRows: [...rows, createExtraServiceRow()] };
    });
  };

  const removeExtraServiceRow = (index) => {
    setForm((prev) => {
      const rows = Array.isArray(prev.extraServicesRows) ? prev.extraServicesRows : [];
      const next = rows.filter((_, idx) => idx !== index);
      return { ...prev, extraServicesRows: next.length > 0 ? next : [createExtraServiceRow()] };
    });
  };

  const updateExtraServiceRow = (index, key, value) => {
    setForm((prev) => {
      const rows = Array.isArray(prev.extraServicesRows) ? prev.extraServicesRows : [];
      const next = rows.map((row, idx) => (idx === index ? { ...row, [key]: value } : row));
      return { ...prev, extraServicesRows: next };
    });
  };

  const payFee = async () => {
    const res = await fetch("/api/worker/verification-fee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount: 299 }),
    });
    const data = await res.json();
    setMsg({ type: data.ok ? "success" : "error", text: data.ok ? "Verification fee paid. Status is now PENDING_REVIEW." : data.error || "Payment failed" });
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0: // Photos
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Profile Photo</label>
                <div className="flex items-start gap-4">
                  {form.profilePhoto && (
                    <div className="h-20 w-20 overflow-hidden rounded-lg border-2 border-sky-500/30">
                      <img src={form.profilePhoto} alt="Profile preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input 
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                      placeholder="Profile photo URL" 
                      value={form.profilePhoto} 
                      onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })} 
                    />
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="profile-upload"
                        className="hidden"
                        onChange={(e) => uploadSingle(e.target.files?.[0], "profilePhoto")} 
                      />
                      <label
                        htmlFor="profile-upload"
                        className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Gallery Photos ({form.galleryPhotos?.length || 0}/{MAX_GALLERY_PHOTOS})
                </label>
                <div className="mb-3 grid grid-cols-4 gap-2">
                  {form.galleryPhotos?.map((photo, idx) => (
                    <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-700">
                      <img src={photo} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const newGallery = form.galleryPhotos.filter((_, i) => i !== idx);
                          setForm({ ...form, galleryPhotos: newGallery });
                        }}
                        className="absolute top-1 right-1 hidden rounded-full bg-rose-600 p-1 text-white group-hover:block"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <input 
                  className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                  placeholder="Comma separated URLs"
                  value={(form.galleryPhotos || []).join(",")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      galleryPhotos: e.target.value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, MAX_GALLERY_PHOTOS),
                    })
                  }
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    id="gallery-upload"
                    className="hidden"
                    onChange={(e) => uploadGallery(e.target.files)} 
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Gallery Photos
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Personal
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Bio</label>
              <textarea 
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                rows={4}
                placeholder="Tell us about yourself (minimum 20 characters)"
                value={form.bio} 
                onChange={(e) => setForm({ ...form, bio: e.target.value })} 
              />
              <p className="mt-1 text-xs text-slate-500">{form.bio.length}/20 characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Gender</label>
              <select 
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                value={form.gender} 
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="other">Other</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        );

      case 2: // Professional
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Skills (comma separated)</label>
              <input 
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                placeholder="e.g., Plumbing, Electrical, Carpentry"
                value={form.skills} 
                onChange={(e) => setForm({ ...form, skills: e.target.value })} 
              />
              <p className="mt-1 text-xs text-slate-500">{skillsList.length} skills entered</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Categories (comma separated)</label>
              <input 
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                placeholder="e.g., Home Repair, Cleaning, Moving"
                value={form.categories} 
                onChange={(e) => setForm({ ...form, categories: e.target.value })} 
              />
              <p className="mt-1 text-xs text-slate-500">{categoriesList.length} categories entered</p>
            </div>
          </div>
        );

      case 3: // Location
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">City</label>
                <input 
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                  placeholder="City"
                  value={form.city} 
                  onChange={(e) => setForm({ ...form, city: e.target.value })} 
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Pincode</label>
                <input 
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                  placeholder="Pincode"
                  value={form.pincode} 
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })} 
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Address</label>
              <input 
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                placeholder="Street address"
                value={form.address} 
                onChange={(e) => setForm({ ...form, address: e.target.value })} 
              />
            </div>
          </div>
        );

      case 4: // Pricing
        return (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Base Price (INR)</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none"
                placeholder="0"
                type="number"
                min="0"
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
              />
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Extra Services</label>
                <button
                  type="button"
                  onClick={addExtraServiceRow}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white transition hover:bg-slate-700"
                >
                  <Plus className="h-3 w-3" />
                  Add Service
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_120px_80px] gap-2 px-2 text-xs font-medium text-slate-400">
                  <p>Service</p>
                  <p>Price (₹)</p>
                  <p></p>
                </div>
                
                {(form.extraServicesRows || []).map((row, index) => (
                  <div key={index} className="grid grid-cols-[1fr_120px_80px] gap-2">
                    <input
                      className="rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none"
                      placeholder="Service title"
                      value={row.title}
                      onChange={(e) => updateExtraServiceRow(index, "title", e.target.value)}
                    />
                    <input
                      className="rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none"
                      placeholder="0"
                      type="number"
                      min="0"
                      value={row.price}
                      onChange={(e) => updateExtraServiceRow(index, "price", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeExtraServiceRow(index)}
                      className="flex items-center justify-center rounded-lg bg-rose-900/50 px-2 py-1 text-rose-300 transition hover:bg-rose-800 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5: // Documents
        return (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Government ID</label>
              <div className="space-y-2">
                <input 
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                  placeholder="ID document URL" 
                  value={form.idProof} 
                  onChange={(e) => setForm({ ...form, idProof: e.target.value })} 
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    id="id-upload"
                    className="hidden"
                    onChange={(e) => uploadSingle(e.target.files?.[0], "idProof")} 
                  />
                  <label
                    htmlFor="id-upload"
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                  >
                    <Upload className="h-4 w-4" />
                    Upload ID
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Selfie</label>
              <div className="space-y-2">
                <input 
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                  placeholder="Selfie URL" 
                  value={form.selfie} 
                  onChange={(e) => setForm({ ...form, selfie: e.target.value })} 
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="selfie-upload"
                    className="hidden"
                    onChange={(e) => uploadSingle(e.target.files?.[0], "selfie")} 
                  />
                  <label
                    htmlFor="selfie-upload"
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Selfie
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Certificate (Optional)</label>
              <div className="space-y-2">
                <input 
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                  placeholder="Certificate URL" 
                  value={form.certificate} 
                  onChange={(e) => setForm({ ...form, certificate: e.target.value })} 
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    id="cert-upload"
                    className="hidden"
                    onChange={(e) => uploadSingle(e.target.files?.[0], "certificate")} 
                  />
                  <label
                    htmlFor="cert-upload"
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Certificate
                  </label>
                </div>
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
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Complete Your Onboarding</h1>
          <p className="mt-2 text-slate-400">Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}</p>
        </div>

        {/* Compact Progress Bar - FIXED SPACING */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    <div className="relative">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isActive
                            ? "bg-sky-600 text-white ring-4 ring-sky-600/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <StepIcon className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-1 ${
                          index < currentStep ? "bg-emerald-600" : "bg-slate-800"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`mt-1 text-[10px] font-medium ${
                      index === currentStep
                        ? "text-sky-400"
                        : index < currentStep
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loadingDraft && (
          <div className="mb-6 rounded-lg bg-slate-800/50 p-4 text-center">
            <p className="text-sm text-slate-400">Loading saved profile draft...</p>
          </div>
        )}

        {/* Main Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <form onSubmit={submit}>
            {/* Step Content */}
            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex gap-3">
                {currentStep === steps.length - 1 ? (
                  <>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex items-center gap-2 rounded-lg bg-sky-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:opacity-50"
                    >
                      {uploading ? "Uploading..." : "Submit Onboarding"}
                    </button>
                    <button
                      type="button"
                      onClick={payFee}
                      className="flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-amber-500"
                    >
                      Pay Fee (₹299)
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 rounded-lg bg-sky-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-sky-500"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Message Display */}
          {msg.text && (
            <div
              className={`mt-4 rounded-lg p-3 ${
                msg.type === "error"
                  ? "bg-rose-900/50 text-rose-300"
                  : msg.type === "success"
                  ? "bg-emerald-900/50 text-emerald-300"
                  : msg.type === "warning"
                  ? "bg-amber-900/50 text-amber-300"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {msg.type === "error" && <AlertCircle className="h-4 w-4" />}
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Summary */}
        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Overall Progress</span>
            <span className="text-sm text-slate-400">
              {onboardingCompletion.percent}% ({onboardingCompletion.done}/{onboardingCompletion.total})
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all"
              style={{ width: `${onboardingCompletion.percent}%` }}
            />
          </div>
          {onboardingCompletion.missingFields.length > 0 && (
            <p className="mt-2 text-xs text-amber-400">
              Missing: {onboardingCompletion.missingFields.join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}