"use client";

export default function StepSkillsBio({
  form,
  setForm,
  next,
  isEdit = false,
  onSave,
  onCancel,
}) {
  /* ---------------- HELPERS ---------------- */

  function setList(key, val) {
    const arr = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setForm({ ...form, [key]: arr });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Skills & Bio</h2>

      {/* ---------------- SKILLS ---------------- */}
      <div>
        <label className="text-sm font-medium">
          Skills (comma separated)
        </label>
        <input
          className="w-full border rounded p-2 mt-1"
          value={(form.skills || []).join(", ")}
          onChange={(e) => setList("skills", e.target.value)}
          placeholder="e.g., wiring, repair, installation"
        />
      </div>

      {/* ---------------- LANGUAGES ---------------- */}
      <div>
        <label className="text-sm font-medium">
          Languages (comma separated)
        </label>
        <input
          className="w-full border rounded p-2 mt-1"
          value={(form.languages || []).join(", ")}
          onChange={(e) => setList("languages", e.target.value)}
          placeholder="e.g., Hindi, English, Marathi"
        />
      </div>

      {/* ---------------- BIO ---------------- */}
      <div>
        <label className="text-sm font-medium">Bio</label>
        <textarea
          className="w-full border rounded p-2 mt-1"
          rows={5}
          value={form.bio || ""}
          onChange={(e) =>
            setForm({ ...form, bio: e.target.value })
          }
          placeholder="Tell users about your experience..."
        />
      </div>

      {/* ---------------- ACTION BUTTONS ---------------- */}
      <div className="flex justify-end gap-2 pt-4">
        {isEdit ? (
          <>
            <button
              onClick={onCancel}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-black text-white rounded"
            >
              Save Changes
            </button>
          </>
        ) : (
          <button
            onClick={next}
            className="px-6 py-2 bg-black text-white rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
