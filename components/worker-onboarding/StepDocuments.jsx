"use client";

import UploadImage from "@/components/UploadImage";

export default function StepDocuments({
  form,
  setForm,
  next,
  isEdit = false,
  onSave,
  onCancel,
}) {
  const docs = form.documents || {};

  function updateDoc(key, url) {
    setForm({
      ...form,
      documents: { ...docs, [key]: url },
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Documents</h2>

      {/* ID PROOF */}
      <div className="space-y-2">
        <UploadImage
          label="ID Proof"
          onUploaded={(url) => updateDoc("idProof", url)}
        />

        {docs.idProof && (
          <img
            src={docs.idProof}
            alt="ID Proof"
            className="w-32 rounded border"
          />
        )}
      </div>

      {/* ADDRESS PROOF */}
      <div className="space-y-2">
        <UploadImage
          label="Address Proof"
          onUploaded={(url) => updateDoc("addressProof", url)}
        />

        {docs.addressProof && (
          <img
            src={docs.addressProof}
            alt="Address Proof"
            className="w-32 rounded border"
          />
        )}
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
