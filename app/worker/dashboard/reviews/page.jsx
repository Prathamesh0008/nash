"use client";

import { useEffect, useState } from "react";

export default function WorkerDashboardReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/worker/reviews", { credentials: "include" });
      const data = await res.json();
      if (!data.ok) {
        setMsg(data.error || "Failed to load reviews");
        setLoading(false);
        return;
      }
      setReviews(data.reviews || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Worker Reviews</h1>
        <p className="text-sm text-slate-400">Recent customer feedback for your completed jobs.</p>
        {msg && <p className="mt-2 text-sm text-slate-300">{msg}</p>}
      </div>

      <div className="panel space-y-2">
        {loading && <p className="text-sm text-slate-400">Loading reviews...</p>}
        {!loading && reviews.length === 0 && <p className="text-sm text-slate-400">No reviews yet.</p>}

        {reviews.map((review) => (
          <article key={review._id} className="rounded border border-slate-700 p-3 text-sm">
            <p className="font-semibold">Rating: {review.rating || 0}/5</p>
            <p className="text-slate-400">{review.comment || "No comment"}</p>
            <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
