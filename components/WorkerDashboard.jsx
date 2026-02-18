// /components/WorkerDashboard.jsx
import { useState } from "react";

export default function WorkerDashboardPage({ profile, onProfileUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBoostProfile() {
    setLoading(true);
    setError("");

    try {
      const amount = 100; // Set boost cost here
      const res = await fetch(`/api/workers/${profile.userId}/paid-rank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "Error boosting profile");
      }

      alert("Profile boosted! You are now top-ranked for 24 hours.");
      if (data.worker && typeof onProfileUpdated === "function") {
        onProfileUpdated(data.worker);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleBoostProfile}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 text-white rounded mt-4"
      >
        {loading ? "Boosting..." : "Boost Profile"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}
