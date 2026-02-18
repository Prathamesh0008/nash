"use client";

import { useEffect, useMemo, useState } from "react";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { getWorkerOnboardingCompletion } from "@/lib/workerOnboardingChecklist";

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

export default function WorkerOnboardingPage() {
  const MAX_GALLERY_PHOTOS = 8;
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
  const [msg, setMsg] = useState("");
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
        setMsg("Could not load saved draft. You can still continue.");
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
      setMsg("Uploading file...");
      const url = await uploadToCloudinary(file, { folder: "nash/worker-docs" });
      setForm((prev) => ({ ...prev, [field]: url }));
      setMsg("Upload successful");
    } catch (error) {
      setMsg(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const uploadGallery = async (files) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      setMsg("Uploading gallery photos...");
      const urls = [];
      for (const file of Array.from(files).slice(0, MAX_GALLERY_PHOTOS)) {
        const url = await uploadToCloudinary(file, { folder: "nash/worker-gallery" });
        urls.push(url);
      }
      setForm((prev) => {
        const merged = Array.from(new Set([...(prev.galleryPhotos || []), ...urls])).slice(0, MAX_GALLERY_PHOTOS);
        return { ...prev, galleryPhotos: merged };
      });
      setMsg("Gallery uploaded");
    } catch (error) {
      setMsg(error.message || "Gallery upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    const skills = skillsList;
    const categories = categoriesList;
    const basePrice = Number(form.basePrice || 0);
    const { extraServices, error: extraServiceError } = parseExtraServiceRows(form.extraServicesRows);
    if (!form.profilePhoto) return setMsg("Profile photo is required");
    const galleryCount = (form.galleryPhotos || []).length;
    if (galleryCount < 3 || galleryCount > 8) return setMsg(`Add 3 to 8 gallery photos (current: ${galleryCount})`);
    if (form.bio.trim().length < 20) return setMsg("Bio must be at least 20 characters");
    if (skills.length < 1) return setMsg("At least one skill is required");
    if (categories.length < 1) return setMsg("At least one category is required");
    if (!Number.isFinite(basePrice) || basePrice < 0) return setMsg("Base price must be valid");
    if (extraServiceError) return setMsg(extraServiceError);
    if (!form.city || !form.pincode || !form.address) return setMsg("City, pincode and address are required");
    if (!/^\d{4,10}$/.test(form.pincode.trim())) return setMsg("Enter a valid pincode");
    if (!form.idProof || !form.selfie) return setMsg("ID proof and selfie are required");

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

    // Always save profile draft first so admin can see latest uploaded details
    // even if final onboarding validation fails on any specific field.
    const draftRes = await fetch("/api/worker/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const draftData = await draftRes.json().catch(() => ({}));
    if (!draftRes.ok || !draftData.ok) {
      setMsg(draftData.error || "Failed to save onboarding draft");
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
      setMsg(data.nextSteps || "Onboarding saved. Complete verification fee payment next.");
      return;
    }
    setMsg(`${data.error || "Final submit failed"}. Draft saved successfully. Please fix and submit again.`);
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
    setMsg(data.ok ? "Verification fee paid. Status is now PENDING_REVIEW." : data.error || "Payment failed");
  };

  return (
    <section className="mx-auto max-w-3xl panel space-y-4">
      <h1 className="text-2xl font-semibold">Worker Onboarding</h1>
      <p className="text-sm text-slate-400">Step 1 profile + docs. Step 2 verification fee payment.</p>
      {loadingDraft && <p className="text-xs text-slate-400">Loading saved profile draft...</p>}
      <div className="rounded border border-slate-700 bg-slate-900/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-200">Onboarding Progress</p>
          <p className="text-xs text-slate-300">
            {onboardingCompletion.percent}% ({onboardingCompletion.done}/{onboardingCompletion.total})
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded bg-slate-800">
          <div
            className="h-full bg-emerald-600 transition-all"
            style={{ width: `${onboardingCompletion.percent}%` }}
          />
        </div>
        {onboardingCompletion.missingFields.length > 0 ? (
          <p className="mt-2 text-xs text-amber-300">
            Missing: {onboardingCompletion.missingFields.join(", ")}
          </p>
        ) : (
          <p className="mt-2 text-xs text-emerald-300">
            All required onboarding details are completed.
          </p>
        )}
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {onboardingCompletion.checklist.map((item) => (
            <p
              key={item.key}
              className={`rounded px-2 py-1 text-xs ${
                item.done ? "bg-emerald-950/50 text-emerald-300" : "bg-slate-800 text-slate-400"
              }`}
            >
              {item.done ? "Done" : "Pending"} - {item.label}
            </p>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm text-slate-300">Profile Photo</p>
          <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="Profile photo URL" value={form.profilePhoto} onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })} />
          <input type="file" accept="image/*" onChange={(e) => uploadSingle(e.target.files?.[0], "profilePhoto")} />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-300">Gallery Photos (3-8)</p>
          <input
            className="w-full rounded border border-slate-700 bg-slate-900 p-2"
            placeholder="Comma separated URLs"
            value={(form.galleryPhotos || []).join(",")}
            onChange={(e) =>
              setForm({
                ...form,
                galleryPhotos: e.target.value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, MAX_GALLERY_PHOTOS),
              })
            }
          />
          <input type="file" accept="image/*" multiple onChange={(e) => uploadGallery(e.target.files)} />
          <p className="text-xs text-slate-500">Current: {(form.galleryPhotos || []).length} / {MAX_GALLERY_PHOTOS}</p>
        </div>

        <textarea className="w-full rounded border border-slate-700 bg-slate-900 p-2" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <select className="w-full rounded border border-slate-700 bg-slate-900 p-2" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option value="other">Other</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="Skills comma separated" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="Categories comma separated" value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} />
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
        </div>
        <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input
          className="w-full rounded border border-slate-700 bg-slate-900 p-2"
          placeholder="Base price (INR)"
          type="number"
          min="0"
          value={form.basePrice}
          onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
        />
        <div className="space-y-2 rounded border border-slate-700 bg-slate-900/30 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Extra Services and Price</p>
            <button
              type="button"
              onClick={addExtraServiceRow}
              className="rounded bg-slate-800 px-2 py-1 text-xs text-white hover:bg-slate-700"
            >
              Add Row
            </button>
          </div>
          <div className="grid grid-cols-[1fr_140px_84px] gap-2 text-xs text-slate-400">
            <p>Extra service</p>
            <p>Price (INR)</p>
            <p>Action</p>
          </div>
          {(form.extraServicesRows || []).map((row, index) => (
            <div key={`extra_service_${index}`} className="grid grid-cols-[1fr_140px_84px] gap-2">
              <input
                className="rounded border border-slate-700 bg-slate-900 p-2"
                placeholder="Service title"
                value={row.title}
                onChange={(e) => updateExtraServiceRow(index, "title", e.target.value)}
              />
              <input
                className="rounded border border-slate-700 bg-slate-900 p-2"
                placeholder="0"
                type="number"
                min="0"
                value={row.price}
                onChange={(e) => updateExtraServiceRow(index, "price", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeExtraServiceRow(index)}
                className="rounded bg-rose-800 px-2 py-1 text-xs text-white hover:bg-rose-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="Govt ID URL" value={form.idProof} onChange={(e) => setForm({ ...form, idProof: e.target.value })} />
          <input type="file" accept="image/*,.pdf" onChange={(e) => uploadSingle(e.target.files?.[0], "idProof")} />
        </div>
        <div className="space-y-2">
          <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="Selfie URL" value={form.selfie} onChange={(e) => setForm({ ...form, selfie: e.target.value })} />
          <input type="file" accept="image/*" onChange={(e) => uploadSingle(e.target.files?.[0], "selfie")} />
        </div>
        <div className="space-y-2">
          <input className="w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="Certificate URL" value={form.certificate} onChange={(e) => setForm({ ...form, certificate: e.target.value })} />
          <input type="file" accept="image/*,.pdf" onChange={(e) => uploadSingle(e.target.files?.[0], "certificate")} />
        </div>

        <button disabled={uploading} className="rounded bg-sky-700 px-3 py-2 text-white hover:bg-sky-600 disabled:opacity-60">
          {uploading ? "Uploading..." : "Save Onboarding"}
        </button>
      </form>

      <button onClick={payFee} className="rounded bg-amber-600 px-3 py-2 text-white hover:bg-amber-500">
        Pay Verification Fee (INR 299)
      </button>
      {msg && <p className="text-sm text-slate-300">{msg}</p>}
    </section>
  );
}
