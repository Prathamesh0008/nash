"use client";

import { useEffect, useMemo, useState } from "react";

import StepPersonal from "./StepPersonal";
import StepPhotos from "./StepPhotos";
import StepServices from "./StepServices";
import StepAvailability from "./StepAvailability";
import StepSkillsBio from "./StepSkillsBio";
import StepDocuments from "./StepDocuments";
import StepReviewSubmit from "./StepReviewSubmit";

/* ================= CONSTANTS ================= */

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
    addressProof: "",
  },
};

/* ================= COMPONENT ================= */

export default function WorkerOnboardingWizard() {
  const [active, setActive] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  /* ================= LOAD (LS → DB) ================= */

  useEffect(() => {
    async function load() {
      let base = structuredClone(emptyForm);

      // 1️⃣ Load localStorage FIRST
      const ls = localStorage.getItem(LS_KEY);
      if (ls) {
        base = { ...base, ...JSON.parse(ls) };
      }

      // 2️⃣ Load DB draft SECOND
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

  /* ================= AUTOSAVE (AFTER HYDRATE) ================= */

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_KEY, JSON.stringify(form));
  }, [form, hydrated]);

  /* ================= STEP PICKER ================= */

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
    setActive((i) => Math.min(i + 1, steps.length - 1));
  }

  function back() {
    setActive((i) => Math.max(i - 1, 0));
  }

  /* ================= SAVE DRAFT ================= */

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
        setStatusMsg("✅ Draft saved");
      }
    } catch {
      setStatusMsg("Draft save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(""), 2000);
    }
  }

  /* ================= FINAL SUBMIT ================= */

  async function submitFinal() {
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
        setStatusMsg("✅ Profile sent for approval");
        localStorage.removeItem(LS_KEY);
      }
    } catch {
      setStatusMsg("Submit failed");
    } finally {
      setSaving(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="bg-white text-black rounded-2xl p-6">
      {/* Step Header */}
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

      {/* Step Content */}
      <StepComp form={form} setForm={setForm} next={next} />

      {/* Footer */}
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

/* ================= HELPERS ================= */

function normalizeProfile(p) {
  return {
    ...p,
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

  copy.heightCm = copy.heightCm ? Number(copy.heightCm) : undefined;
  copy.weightKg = copy.weightKg ? Number(copy.weightKg) : undefined;
  copy.serviceRadiusKm = copy.serviceRadiusKm
    ? Number(copy.serviceRadiusKm)
    : undefined;

  copy.services = (copy.services || [])
    .map((s) => ({
      name: s.name,
      experienceYears: s.experienceYears
        ? Number(s.experienceYears)
        : 0,
      basePrice: s.basePrice ? Number(s.basePrice) : 0,
    }))
    .filter((s) => s.name);

  copy.extraServices = (copy.extraServices || [])
    .map((x) => ({
      title: x.title,
      price: x.price ? Number(x.price) : 0,
    }))
    .filter((x) => x.title);

  copy.dob = copy.dob ? new Date(copy.dob) : undefined;

  return copy;
}
