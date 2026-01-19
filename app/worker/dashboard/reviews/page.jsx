"use client";

import { useEffect, useState } from "react";
import ReplyBox from "@/components/ReplyBox";

export default function WorkerReviewsPage() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch("/api/worker/reviews", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => d.ok && setReviews(d.reviews));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Customer Reviews</h1>

      {reviews.length === 0 && (
        <div className="text-gray-500">No reviews yet</div>
      )}

      {reviews.map((r) => (
        <div key={r._id} className="border rounded p-4">
          <div className="flex items-center gap-2">
            <div>⭐ {r.rating}</div>
            <div className="text-xs text-gray-500">
              {new Date(r.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="mt-2 text-sm">{r.comment}</div>

          {/* 🔥 WORKER REPLY */}
          {r.reply ? (
            <div className="mt-3 bg-gray-50 p-2 text-sm border-l">
              <b>Your Reply:</b> {r.reply.text}
            </div>
          ) : (
            <ReplyBox reviewId={r._id} />
          )}
        </div>
      ))}
    </div>
  );
}
