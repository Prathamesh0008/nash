"use client";

import { useState } from "react";

export default function EditSection({ title, children }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="border rounded-xl bg-white p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">{title}</h2>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-blue-600 underline"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div>
          {children(() => setEditing(false))}
          <button
            onClick={() => setEditing(false)}
            className="mt-3 text-sm text-gray-600 underline"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Click edit to update</div>
      )}
    </div>
  );
}
