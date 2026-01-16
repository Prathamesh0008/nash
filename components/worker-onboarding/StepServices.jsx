"use client";

export default function StepServices({
  form,
  setForm,
  next,
  isEdit = false,
  onSave,
  onCancel,
}) {
  /* ---------------- MAIN SERVICES ---------------- */

  function addService() {
    setForm({
      ...form,
      services: [
        ...(form.services || []),
        { name: "", experienceYears: "", basePrice: "" },
      ],
    });
  }

  function updateService(i, key, val) {
    const nextServices = [...(form.services || [])];
    nextServices[i] = { ...nextServices[i], [key]: val };
    setForm({ ...form, services: nextServices });
  }

  function removeService(i) {
    const nextServices = [...(form.services || [])];
    nextServices.splice(i, 1);
    setForm({ ...form, services: nextServices });
  }

  /* ---------------- EXTRA SERVICES ---------------- */

  function addExtra() {
    setForm({
      ...form,
      extraServices: [
        ...(form.extraServices || []),
        { title: "", price: "" },
      ],
    });
  }

  function updateExtra(i, key, val) {
    const nextExtras = [...(form.extraServices || [])];
    nextExtras[i] = { ...nextExtras[i], [key]: val };
    setForm({ ...form, extraServices: nextExtras });
  }

  function removeExtra(i) {
    const nextExtras = [...(form.extraServices || [])];
    nextExtras.splice(i, 1);
    setForm({ ...form, extraServices: nextExtras });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Services & Pricing</h2>

      {/* ---------------- SPECIALITY ---------------- */}
      <div>
        <label className="text-sm font-medium">Speciality</label>
        <input
          className="w-full border rounded p-2 mt-1"
          value={form.speciality || ""}
          onChange={(e) =>
            setForm({ ...form, speciality: e.target.value })
          }
          placeholder="e.g., Bathroom fitting expert"
        />
      </div>

      {/* ---------------- MAIN SERVICES ---------------- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Main Services</h3>
          <button
            type="button"
            onClick={addService}
            className="px-3 py-1 border rounded text-sm"
          >
            + Add
          </button>
        </div>

        {(form.services || []).map((s, i) => (
          <div
            key={i}
            className="grid sm:grid-cols-4 gap-2 border rounded p-3"
          >
            <input
              className="border rounded p-2"
              placeholder="Service name"
              value={s.name || ""}
              onChange={(e) =>
                updateService(i, "name", e.target.value)
              }
            />
            <input
              className="border rounded p-2"
              placeholder="Exp (years)"
              value={s.experienceYears || ""}
              onChange={(e) =>
                updateService(i, "experienceYears", e.target.value)
              }
            />
            <input
              className="border rounded p-2"
              placeholder="Base price"
              value={s.basePrice || ""}
              onChange={(e) =>
                updateService(i, "basePrice", e.target.value)
              }
            />
            <button
              type="button"
              onClick={() => removeService(i)}
              className="border rounded px-3"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* ---------------- EXTRA SERVICES ---------------- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Extra Services</h3>
          <button
            type="button"
            onClick={addExtra}
            className="px-3 py-1 border rounded text-sm"
          >
            + Add
          </button>
        </div>

        {(form.extraServices || []).map((x, i) => (
          <div
            key={i}
            className="grid sm:grid-cols-3 gap-2 border rounded p-3"
          >
            <input
              className="border rounded p-2"
              placeholder="Extra service"
              value={x.title || ""}
              onChange={(e) =>
                updateExtra(i, "title", e.target.value)
              }
            />
            <input
              className="border rounded p-2"
              placeholder="Price"
              value={x.price || ""}
              onChange={(e) =>
                updateExtra(i, "price", e.target.value)
              }
            />
            <button
              type="button"
              onClick={() => removeExtra(i)}
              className="border rounded px-3"
            >
              Remove
            </button>
          </div>
        ))}
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
