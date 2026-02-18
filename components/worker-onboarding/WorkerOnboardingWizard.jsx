"use client";

import { useEffect, useMemo, useState } from "react";

import StepPersonal from "./StepPersonal";
import StepPhotos from "./StepPhotos";
import StepServices from "./StepServices";
import StepAvailability from "./StepAvailability";
import StepSkillsBio from "./StepSkillsBio";
import StepDocuments from "./StepDocuments";
import StepReviewSubmit from "./StepReviewSubmit";

const LS_KEY = "worker-onboarding-draft-v1";

const steps = [
  { key: "personal", label: "Personal" },
  { key: "photos", label: "Photos" },
  { key: "services", label: "Services" },
  { key: "availability", label: "Availability" },
  { key: "skills", label: "Skills & Bio" },
  { key: "documents", label: "Documents" },
  { key: "review", label: "Review & Submit" },
];

const emptyForm = {
  fullName: "",
  phone: "",
  city: "",
  pincode: "",
  address: "",
  dob: "",
  gender: "male",
  nationality: "",
  heightCm: "",
  weightKg: "",
  hairColor: "",

  profilePhoto: "",
  galleryPhotos: [],

  services: [{ name: "", experienceYears: "", basePrice: "" }],
  extraServices: [{ title: "", price: "" }],
  speciality: "",

  availability: {
    workingDays: [],
    timeFrom: "09:00",
    timeTo: "18:00",
    emergencyAvailable: false,
  },
  serviceRadiusKm: "",

  skills: [],
  languages: [],
  bio: "",

  documents: {
    idProof: "",
    selfie: "",
  },
};

export default function WorkerOnboardingWizard() {
  const [active, setActive] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    async function load() {
      let base = structuredClone(emptyForm);

      const ls = localStorage.getItem(LS_KEY);
      if (ls) {
        try {
          base = { ...base, ...JSON.parse(ls) };
        } catch {}
      }

      try {
        const res = await fetch("/api/worker/profile/me", {
          credentials: "include",
        });
        const data = await res.json();

        if (data.ok && data.profile) {
          base = mergeSafe(base, normalizeProfile(data.profile));
        }
      } catch {}

      setForm(base);
      setHydrated(true);
    }

    load();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_KEY, JSON.stringify(form));
  }, [form, hydrated]);

  const StepComp = useMemo(() => {
    const key = steps[active]?.key;
    if (key === "personal") return StepPersonal;
    if (key === "photos") return StepPhotos;
    if (key === "services") return StepServices;
    if (key === "availability") return StepAvailability;
    if (key === "skills") return StepSkillsBio;
    if (key === "documents") return StepDocuments;
    return StepReviewSubmit;
  }, [active]);

  function next() {
    const key = steps[active]?.key;
    const stepError = validateForStep(form, key);
    if (stepError) {
      setStatusMsg(stepError);
      return;
    }
    setStatusMsg("");
    setActive((i) => Math.min(i + 1, steps.length - 1));
  }

  function back() {
    setActive((i) => Math.max(i - 1, 0));
  }

  async function saveDraft() {
    setSaving(true);
    setStatusMsg("");

    try {
      const res = await fetch("/api/worker/onboarding/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cleanForApi(form)),
      });

      const data = await res.json();
      if (!data.ok) {
        setStatusMsg(data.error || "Draft save failed");
      } else {
        setStatusMsg("Draft saved");
      }
    } catch {
      setStatusMsg("Draft save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(""), 2000);
    }
  }

  async function submitFinal() {
    const finalError = validateForSubmit(form);
    if (finalError) {
      setStatusMsg(finalError);
      return;
    }

    setSaving(true);
    setStatusMsg("");

    try {
      const res = await fetch("/api/worker/onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cleanForApi(form)),
      });

      const data = await res.json();
      if (!data.ok) {
        setStatusMsg(data.error || "Submit failed");
      } else {
        setStatusMsg("Profile sent for approval");
        localStorage.removeItem(LS_KEY);
      }
    } catch {
      setStatusMsg("Submit failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white text-black rounded-2xl p-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {steps.map((s, idx) => (
          <button
            key={s.key}
            onClick={() => setActive(idx)}
            className={`px-3 py-1 rounded-full text-sm border ${
              idx === active ? "bg-black text-white" : "bg-white"
            }`}
          >
            {idx + 1}. {s.label}
          </button>
        ))}
      </div>

      <StepComp form={form} setForm={setForm} next={next} />

      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">{statusMsg}</div>

        <div className="flex gap-2">
          <button
            onClick={back}
            disabled={active === 0}
            className="px-4 py-2 rounded border disabled:opacity-50"
          >
            Back
          </button>

          <button
            onClick={saveDraft}
            disabled={saving}
            className="px-4 py-2 rounded border"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>

          {active < steps.length - 1 ? (
            <button
              onClick={next}
              className="px-4 py-2 rounded bg-black text-white"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submitFinal}
              disabled={saving}
              className="px-4 py-2 rounded bg-green-600 text-white"
            >
              {saving ? "Submitting..." : "Submit for Approval"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function normalizeProfile(p) {
  const firstArea = Array.isArray(p?.serviceAreas) ? p.serviceAreas[0] : null;
  return {
    ...p,
    city: p?.city || firstArea?.city || "",
    pincode: p?.pincode || firstArea?.pincode || "",
    documents: {
      idProof: p?.documents?.idProof || p?.docs?.idProof || "",
      selfie: p?.documents?.selfie || p?.docs?.selfie || "",
    },
    services:
      Array.isArray(p?.services) && p.services.length
        ? p.services
        : (p?.categories || []).map((name) => ({
            name,
            experienceYears: "",
            basePrice: "",
          })),
    skills: Array.isArray(p?.skills) ? p.skills : [],
    galleryPhotos: Array.isArray(p?.galleryPhotos) ? p.galleryPhotos : [],
    dob: p?.dob ? new Date(p.dob).toISOString().slice(0, 10) : "",
  };
}

function mergeSafe(base, incoming) {
  const out = { ...base };

  for (const key in incoming) {
    if (incoming[key] === undefined || incoming[key] === null) continue;

    if (Array.isArray(incoming[key])) {
      out[key] = incoming[key].length ? incoming[key] : base[key];
      continue;
    }

    if (typeof incoming[key] === "object") {
      out[key] = { ...(base[key] || {}), ...incoming[key] };
      continue;
    }

    out[key] = incoming[key];
  }

  return out;
}

function cleanForApi(f) {
  const copy = structuredClone(f);
  const profilePhoto = String(copy.profilePhoto || "").trim();
  const galleryPhotos = (copy.galleryPhotos || []).map((x) => String(x || "").trim()).filter(Boolean);
  const skills = (copy.skills || []).map((x) => String(x || "").trim()).filter(Boolean);
  const categories = Array.from(
    new Set(
      (copy.services || [])
        .map((service) => String(service?.name || "").trim())
        .filter(Boolean)
    )
  );
  const city = String(copy.city || "").trim();
  const pincode = String(copy.pincode || "").trim();
  const address = String(copy.address || "").trim();
  const docs = {
    idProof: String(copy.documents?.idProof || "").trim(),
    selfie: String(copy.documents?.selfie || "").trim(),
    certificates: [],
  };
  const basePrice = Math.max(
    0,
    Number(
      (copy.services || []).find((service) => String(service?.basePrice || "").trim())?.basePrice || 0
    )
  );
  const extraServices = (copy.extraServices || [])
    .map((row) => ({
      title: String(row?.title || "").trim(),
      price: Math.max(0, Number(row?.price || 0)),
    }))
    .filter((row) => row.title)
    .slice(0, 30);

  return {
    gender: copy.gender || "other",
    profilePhoto,
    galleryPhotos,
    bio: String(copy.bio || "").trim(),
    skills,
    categories,
    serviceAreas: city && pincode ? [{ city, pincode }] : [],
    address,
    pricing: {
      basePrice,
      extraServices,
    },
    docs,
  };
}

function validateForStep(form, key) {
  if (key === "personal") {
    if (!String(form.city || "").trim()) return "City is required";
    if (!String(form.pincode || "").trim()) return "Pincode is required";
    if (!/^\d{4,10}$/.test(String(form.pincode || "").trim())) return "Enter a valid pincode";
    if (!String(form.address || "").trim()) return "Address is required";
  }

  if (key === "photos") {
    if (!String(form.profilePhoto || "").trim()) return "Profile photo is required";
    const count = (form.galleryPhotos || []).filter(Boolean).length;
    if (count < 3 || count > 8) return "Gallery must have 3 to 8 photos";
  }

  if (key === "services") {
    const categories = (form.services || []).map((s) => String(s?.name || "").trim()).filter(Boolean);
    if (categories.length < 1) return "Add at least one service";
  }

  if (key === "skills") {
    const skills = (form.skills || []).map((x) => String(x || "").trim()).filter(Boolean);
    if (skills.length < 1) return "Add at least one skill";
    if (String(form.bio || "").trim().length < 20) return "Bio must be at least 20 characters";
  }

  if (key === "documents") {
    if (!String(form.documents?.idProof || "").trim()) return "ID proof is required";
    if (!String(form.documents?.selfie || "").trim()) return "Selfie is required";
  }

  return "";
}

function validateForSubmit(form) {
  const checks = ["personal", "photos", "services", "skills", "documents"];
  for (const key of checks) {
    const error = validateForStep(form, key);
    if (error) return error;
  }
  return "";
}
