"use client";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StepAvailability({
  form,
  setForm,
  next,
  isEdit = false,
  onSave,
  onCancel,
}) {
  const a = form.availability || {};

  function toggleDay(day) {
    const set = new Set(a.workingDays || []);
    set.has(day) ? set.delete(day) : set.add(day);

    setForm({
      ...form,
      availability: { ...a, workingDays: [...set] },
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Availability</h2>

      {/* WORKING DAYS */}
      <div>
        <div className="text-sm font-medium mb-2">Working Days</div>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => {
            const active = (a.workingDays || []).includes(d);
            return (
              <button
                type="button"
                key={d}
                onClick={() => toggleDay(d)}
                className={`px-3 py-1 rounded-full border text-sm transition ${
                  active ? "bg-black text-white" : "bg-white"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* TIME + OPTIONS */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Time From</label>
          <input
            type="time"
            className="w-full border rounded p-2 mt-1"
            value={a.timeFrom || "09:00"}
            onChange={(e) =>
              setForm({
                ...form,
                availability: { ...a, timeFrom: e.target.value },
              })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Time To</label>
          <input
            type="time"
            className="w-full border rounded p-2 mt-1"
            value={a.timeTo || "18:00"}
            onChange={(e) =>
              setForm({
                ...form,
                availability: { ...a, timeTo: e.target.value },
              })
            }
          />
        </div>

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
