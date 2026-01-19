"use client";

import { useState } from "react";

export default function ReplyBox({ reviewId }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    if (!text.trim()) return;

    const res = await fetch(`/api/reviews/${reviewId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    if (!data.ok) {
      setMsg("Failed to reply");
      return;
    }

    setMsg("Reply posted");
    setText("");
  }

  return (
    <div className="mt-2">
      <textarea
        className="w-full border rounded p-2 text-sm"
        rows={2}
        placeholder="Reply to this review..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={submit}
        className="mt-1 px-3 py-1 bg-black text-white text-sm rounded"
      >
        Reply
      </button>
      {msg && <div className="text-xs mt-1">{msg}</div>}
    </div>
  );
}
