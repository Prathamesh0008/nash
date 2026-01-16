"use client";

export default function StepReviewSubmit({
  form,
  isEdit = false,
  onSave,
  onCancel,
}) {
  const a = form.availability || {};

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Review</h2>

      {/* ================= BASIC ================= */}
      <div className="border rounded p-4 bg-gray-50">
        <div className="font-semibold mb-2">Basic</div>
        <div className="text-sm">Name: {form.fullName || "--"}</div>
        <div className="text-sm">Phone: {form.phone || "--"}</div>
        <div className="text-sm">City: {form.city || "--"}</div>
        <div className="text-sm">Gender: {form.gender || "--"}</div>
        <div className="text-sm">
          Nationality: {form.nationality || "--"}
        </div>
      </div>

      {/* ================= AVAILABILITY ================= */}
      <div className="border rounded p-4 bg-gray-50">
        <div className="font-semibold mb-2">Availability</div>

        <div className="text-sm">
          Days: {(a.workingDays || []).join(", ") || "Not specified"}
        </div>

        <div className="text-sm">
          Time: {a.timeFrom || "--"} – {a.timeTo || "--"}
        </div>

        <div className="text-sm">
          Emergency: {a.emergencyAvailable ? "Yes" : "No"}
        </div>

        <div className="text-sm">
          Service Radius: {form.serviceRadiusKm || "--"} km
        </div>
      </div>

      {/* ================= SERVICES ================= */}
      <div className="border rounded p-4 bg-gray-50">
        <div className="font-semibold mb-2">Services</div>

        {(form.services || []).length === 0 ? (
          <div className="text-sm text-gray-500">
            No services added
          </div>
        ) : (
          <ul className="text-sm list-disc pl-5">
            {(form.services || []).map((s, i) => (
              <li key={i}>
                {s.name} — {s.experienceYears || 0} yrs — ₹
                {s.basePrice || 0}
              </li>
            ))}
          </ul>
        )}

        {(form.extraServices || []).length > 0 && (
          <>
            <div className="font-semibold mt-3 mb-1">
              Extra Services
            </div>
            <ul className="text-sm list-disc pl-5">
              {(form.extraServices || []).map((x, i) => (
                <li key={i}>
                  {x.title} — ₹{x.price || 0}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* ================= NOTE ================= */}
      {!isEdit && (
        <div className="border rounded p-4 bg-yellow-50 text-sm">
          Final submit will set status to <b>pending</b>.  
          Admin must approve your profile before it appears to users.
        </div>
      )}

      {/* ================= EDIT ACTIONS ================= */}
      {isEdit && (
        <div className="flex justify-end gap-2 pt-4">
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
        </div>
      )}
    </div>
  );
}
