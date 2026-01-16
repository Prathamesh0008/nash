"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import StepPersonal from "@/components/worker-onboarding/StepPersonal";
import StepPhotos from "@/components/worker-onboarding/StepPhotos";
import StepServices from "@/components/worker-onboarding/StepServices";
import StepSkillsBio from "@/components/worker-onboarding/StepSkillsBio";
import StepAvailability from "@/components/worker-onboarding/StepAvailability";
import StepDocuments from "@/components/worker-onboarding/StepDocuments";
import StepReviewSubmit from "@/components/worker-onboarding/StepReviewSubmit";

import EditSection from "@/components/worker-dashboard/EditSection";

export default function WorkerDashboardPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      const res = await fetch("/api/worker/profile", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.ok) setProfile(data.profile);
      setLoadingProfile(false);
    }

    loadProfile();
  }, [user]);

  if (loading || loadingProfile) {
    return <div className="p-6">Loading...</div>;
  }

  if (!profile) {
    return <div className="p-6">Profile not found</div>;
  }

  /* ================= SAVE HELPER ================= */
  async function save(fields) {
    const res = await fetch("/api/worker/profile/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(fields),
    });

    const data = await res.json();
    if (data.ok) {
      setProfile(data.profile);
      return true;
    }
    return false;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Worker Dashboard</h1>

      {/* ================= PERSONAL ================= */}
      <EditSection title="Personal Information">
        {(close) => (
          <StepPersonal
            form={profile}
            setForm={setProfile}
            isEdit
            onCancel={close}
            onSave={async () => {
              const ok = await save({
                fullName: profile.fullName,
                phone: profile.phone,
                city: profile.city,
                address: profile.address,
                dob: profile.dob,
                gender: profile.gender,
                nationality: profile.nationality,
                heightCm: profile.heightCm,
                weightKg: profile.weightKg,
                hairColor: profile.hairColor,
              });
              if (ok) close();
            }}
          />
        )}
      </EditSection>

      {/* ================= PHOTOS ================= */}
      <EditSection title="Photos">
        {(close) => (
          <StepPhotos
            form={profile}
            setForm={setProfile}
            isEdit
            onCancel={close}
            onSave={async () => {
              const ok = await save({
                profilePhoto: profile.profilePhoto,
                galleryPhotos: profile.galleryPhotos,
              });
              if (ok) close();
            }}
          />
        )}
      </EditSection>

      {/* ================= SERVICES ================= */}
      <EditSection title="Services & Pricing">
        {(close) => (
          <StepServices
            form={profile}
            setForm={setProfile}
            isEdit
            onCancel={close}
            onSave={async () => {
              const ok = await save({
                speciality: profile.speciality,
                services: profile.services,
                extraServices: profile.extraServices,
              });
              if (ok) close();
            }}
          />
        )}
      </EditSection>

      {/* ================= SKILLS & BIO ================= */}
      <EditSection title="Skills & Bio">
        {(close) => (
          <StepSkillsBio
            form={profile}
            setForm={setProfile}
            isEdit
            onCancel={close}
            onSave={async () => {
              const ok = await save({
                skills: profile.skills,
                languages: profile.languages,
                bio: profile.bio,
              });
              if (ok) close();
            }}
          />
        )}
      </EditSection>

      {/* ================= AVAILABILITY ================= */}
      <EditSection title="Availability">
        {(close) => (
          <StepAvailability
            form={profile}
            setForm={setProfile}
            isEdit
            onCancel={close}
            onSave={async () => {
              const ok = await save({
                availability: profile.availability,
                serviceRadiusKm: profile.serviceRadiusKm,
              });
              if (ok) close();
            }}
          />
        )}
      </EditSection>

      {/* ================= DOCUMENTS ================= */}
      <EditSection title="Documents">
        {(close) => (
          <StepDocuments
            form={profile}
            setForm={setProfile}
            isEdit
            onCancel={close}
            onSave={async () => {
              const ok = await save({
                documents: profile.documents,
              });
              if (ok) close();
            }}
          />
        )}
      </EditSection>

      {/* ================= REVIEW ================= */}
      <EditSection title="Review Profile">
        {(close) => (
          <StepReviewSubmit
            form={profile}
            isEdit
            onCancel={close}
            onSave={async () => {
              const ok = await save(profile);
              if (ok) close();
            }}
          />
        )}
      </EditSection>

      {/* ================= STATUS ================= */}
      <div className="border rounded p-4 bg-gray-50">
        <div className="text-sm">
          <strong>Status:</strong>{" "}
          <span
            className={
              profile.status === "active"
                ? "text-green-600"
                : "text-orange-600"
            }
          >
            {profile.status}
          </span>
        </div>

        {profile.status !== "active" && (
          <div className="text-xs text-gray-600 mt-1">
            Any change will require admin re-approval
          </div>
        )}

        {profile.adminNote && (
          <div className="mt-2 text-xs text-red-600">
            Admin note: {profile.adminNote}
          </div>
        )}
      </div>
    </div>
  );
}
