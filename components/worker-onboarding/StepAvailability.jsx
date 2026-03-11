"use client";

export default function StepAvailability({
  form,
  setForm,
  next,
  isEdit = false,
  onSave,
  onCancel,
}) {
  const a = form.availability || {};

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Availability</h2>
      <div className="rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
        Escort availability is fixed to 24/7. There are no off-days or daily time windows.
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">
            Service Radius (km)
          </label>
          <input
            className="w-full border rounded p-2 mt-1"
            value={form.serviceRadiusKm || ""}
            onChange={(e) =>
              setForm({
                ...form,
                serviceRadiusKm: e.target.value,
              })
            }
            placeholder="e.g., 10"
          />
        </div>

        <label className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={!!a.emergencyAvailable}
            onChange={(e) =>
              setForm({
                ...form,
                availability: {
                  ...a,
                  emergencyAvailable: e.target.checked,
                },
              })
            }
          />
          Emergency Available
        </label>
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
