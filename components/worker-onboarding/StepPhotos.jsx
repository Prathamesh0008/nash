"use client";

import UploadImage from "@/components/UploadImage";

export default function StepPhotos({
  form,
  setForm,
  next,
  isEdit = false,
  onSave,
  onCancel,
}) {
  /* ---------------- HELPERS ---------------- */

  function setProfilePhoto(url) {
    setForm({ ...form, profilePhoto: url });
  }

  function addGalleryPhotos(urls) {
    setForm({
      ...form,
      galleryPhotos: [...(form.galleryPhotos || []), ...urls],
    });
  }

  function removeGalleryPhoto(index) {
    const updated = [...(form.galleryPhotos || [])];
    updated.splice(index, 1);
    setForm({ ...form, galleryPhotos: updated });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Photos</h2>

      {/* ---------------- PROFILE PHOTO ---------------- */}
      <div className="space-y-2">
        <UploadImage
          label="Profile Photo"
          onUploaded={setProfilePhoto}
        />

        {form.profilePhoto && (
          <img
            src={form.profilePhoto}
            alt="Profile"
            className="w-32 h-32 object-cover rounded border"
          />
        )}
      </div>

      {/* ---------------- GALLERY ---------------- */}
      <div className="space-y-2">
        <UploadImage
          label="Gallery Photos"
          multiple
          onUploaded={addGalleryPhotos}
        />

        <div className="flex flex-wrap gap-3">
          {(form.galleryPhotos || []).map((url, i) => (
            <div key={i} className="relative">
              <img
                src={url}
                className="w-24 h-24 object-cover rounded border"
              />

              {isEdit && (
                <button
                  onClick={() => removeGalleryPhoto(i)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>
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

