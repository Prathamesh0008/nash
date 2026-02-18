"use client";

import { useEffect, useState } from "react";

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
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/worker/profile", { credentials: "include" });
      const data = await res.json();
      if (!data.ok) {
        setMsg(data.error || "Failed to load profile");
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
      });
      setLoading(false);
    };
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    const payload = {
      profilePhoto: form.profilePhoto.trim(),
      galleryPhotos: splitCsv(form.galleryPhotos),
      bio: form.bio.trim(),
      gender: form.gender,
      skills: splitCsv(form.skills),
      categories: splitCsv(form.categories),
      serviceAreas: form.city && form.pincode ? [{ city: form.city.trim(), pincode: form.pincode.trim() }] : [],
      address: form.address.trim(),
    };

    const res = await fetch("/api/worker/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMsg(data.ok ? "Profile updated successfully" : data.error || "Update failed");
    setSaving(false);
  };

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Edit Worker Profile</h1>
        <p className="text-sm text-slate-400">Update bio, skills, categories and service area.</p>
      </div>

      {loading ? (
        <div className="panel text-sm text-slate-400">Loading profile...</div>
      ) : (
        <form onSubmit={save} className="panel space-y-3">
          <input className="w-full p-2.5 text-sm" placeholder="Profile photo URL" value={form.profilePhoto} onChange={(e) => setForm((prev) => ({ ...prev, profilePhoto: e.target.value }))} />
          <input className="w-full p-2.5 text-sm" placeholder="Gallery photo URLs (comma separated)" value={form.galleryPhotos} onChange={(e) => setForm((prev) => ({ ...prev, galleryPhotos: e.target.value }))} />
          <textarea className="w-full p-2.5 text-sm" rows={3} placeholder="Bio" value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} />
          <select className="w-full p-2.5 text-sm" value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input className="w-full p-2.5 text-sm" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))} />
          <input className="w-full p-2.5 text-sm" placeholder="Categories (comma separated)" value={form.categories} onChange={(e) => setForm((prev) => ({ ...prev, categories: e.target.value }))} />
          <div className="grid gap-3 md:grid-cols-2">
            <input className="p-2.5 text-sm" placeholder="City" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
            <input className="p-2.5 text-sm" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))} />
          </div>
          <input className="w-full p-2.5 text-sm" placeholder="Address" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />

          <button disabled={saving} className="app-btn-primary rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {msg && <p className="text-sm text-slate-300">{msg}</p>}
        </form>
      )}
    </section>
  );
}
