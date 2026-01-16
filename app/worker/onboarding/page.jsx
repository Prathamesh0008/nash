// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/contexts/AuthContext";

// export default function WorkerOnboardingPage() {
//   const router = useRouter();
//   const { refreshMe } = useAuth();

//   const [form, setForm] = useState({
//     name: "",
//     phone: "",
//     city: "",
//     services: "Plumber, Electrician",
//     availability: "Mon-Fri 9am-6pm",
//     photoUrl: "",
//   });

//   const [err, setErr] = useState("");
//   const [ok, setOk] = useState("");

//   async function submit(e) {
//     e.preventDefault();
//     setErr("");
//     setOk("");

//     const payload = {
//       ...form,
//       services: form.services.split(",").map((s) => s.trim()).filter(Boolean),
//     };

//     const res = await fetch("/api/workers/onboarding", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify(payload),
//     });

//     const data = await res.json();
//     if (!data.ok) return setErr(data.error || "Failed");

//     setOk("Submitted! Your profile is now pending admin approval.");
//     await refreshMe();
//     router.push("/worker/dashboard");
//   }

//   return (
//     <div className="max-w-xl mx-auto bg-white border rounded-xl p-6">
//       <h1 className="text-xl font-bold">Worker Onboarding</h1>
//       <p className="text-sm text-gray-600 mt-1">
//         Fill your details. Admin must approve you before you appear on Home page.
//       </p>

//       {err && <div className="mt-3 text-red-600 text-sm">{err}</div>}
//       {ok && <div className="mt-3 text-green-700 text-sm">{ok}</div>}

//       <form onSubmit={submit} className="mt-4 space-y-3">
//         <input className="w-full border rounded p-2" placeholder="Full Name"
//           value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

//         <input className="w-full border rounded p-2" placeholder="Phone"
//           value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

//         <input className="w-full border rounded p-2" placeholder="City"
//           value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />

//         <input className="w-full border rounded p-2" placeholder="Services (comma separated)"
//           value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} />

//         <input className="w-full border rounded p-2" placeholder="Availability"
//           value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />

//         <input className="w-full border rounded p-2" placeholder="Profile Photo URL (optional)"
//           value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />

//         <button className="w-full bg-black text-white rounded p-2">Submit for Approval</button>
//       </form>
//     </div>
//   );
// }

"use client";

import WorkerOnboardingWizard from "@/components/worker-onboarding/WorkerOnboardingWizard";

export default function WorkerOnboardingPage() {
  return (
    <main className="min-h-screen bg-black text-white py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold">Worker Onboarding</h1>
        <p className="text-white/70 mt-2">
          Fill your details. You can save draft anytime. Final submit goes to admin approval.
        </p>

        <div className="mt-8">
          <WorkerOnboardingWizard />
        </div>
      </div>
    </main>
  );
}

