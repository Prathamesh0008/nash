"use client";

export default function StepPersonal({
  form,
  setForm,
  next,
  isEdit = false,
  onSave,
  onCancel,
}) {
  function update(key, value) {
    setForm({ ...form, [key]: value });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Personal Details</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Full Name" value={form.fullName} onChange={(v) => update("fullName", v)} />
        <Input label="Phone" value={form.phone} onChange={(v) => update("phone", v)} />

        <Input label="City" value={form.city} onChange={(v) => update("city", v)} />
        <Input label="Address" value={form.address} onChange={(v) => update("address", v)} />

        <Input type="date" label="Date of Birth" value={form.dob} onChange={(v) => update("dob", v)} />

        {/* GENDER */}
        <div>
          <label className="text-sm font-medium">Gender</label>
          <select
            className="w-full border rounded p-2 mt-1"
            value={form.gender || ""}
            onChange={(e) => update("gender", e.target.value)}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Input label="Nationality" value={form.nationality} onChange={(v) => update("nationality", v)} />
        <Input label="Hair Color" value={form.hairColor} onChange={(v) => update("hairColor", v)} />

        <Input label="Height (cm)" value={form.heightCm} onChange={(v) => update("heightCm", v)} />
        <Input label="Weight (kg)" value={form.weightKg} onChange={(v) => update("weightKg", v)} />
      </div>

      {/* BUTTONS */}
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

/* ---------------- INPUT ---------------- */

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        className="w-full border rounded p-2 mt-1"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
