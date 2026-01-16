"use client";

import WorkerOnboardingWizard from "@/components/worker-onboarding/WorkerOnboardingWizard";
import { useEffect, useState } from "react";

export default function WorkerProfileEditPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // small delay so wizard can fetch profile
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold">Edit Worker Profile</h1>
        <p className="text-white/70 mt-2">
          Update your details. Saving will send profile again for admin review.
        </p>

        <div className="mt-8">
          <WorkerOnboardingWizard mode="edit" />
        </div>
      </div>
    </main>
  );
}
