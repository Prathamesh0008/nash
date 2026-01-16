"use client";

import { useState } from "react";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

export default function UploadImage({ label, onUploaded, multiple = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setLoading(true);
    setError("");

    try {
      const uploads = [];
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        uploads.push(url);
      }

      onUploaded(multiple ? uploads : uploads[0]);
    } catch (err) {
      setError("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        className="block w-full text-sm"
      />

      {loading && <p className="text-xs text-gray-500">Uploading...</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
