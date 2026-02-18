"use client";

import { useState } from 'react';

export default function AdminWorkerRow({ w, onChangeStatus }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const openPreview = (imageUrl, title) => {
    setPreviewImage(imageUrl);
    setPreviewTitle(title);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setPreviewTitle('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-300 bg-green-500/15 border-green-500/30';
      case 'rejected': return 'text-red-300 bg-red-500/15 border-red-500/30';
      case 'pending': return 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30';
      default: return 'text-white/60 bg-white/5 border-white/15';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending Review';
      default: return status;
    }
  };

  return (
    <>
      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={closePreview}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl"
            >
              ✕
            </button>
            <div className="text-white mb-2 text-center">{previewTitle}</div>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="border border-white/10 rounded-xl p-5 space-y-5 bg-black/20 backdrop-blur-sm">
        {/* ================= BASIC INFO ================= */}
        <div className="flex gap-4 items-start">
          <div className="relative group">
            <img
              src={w.profilePhoto || "/avatar.png"}
              alt="Profile"
              className="w-24 h-24 rounded-xl object-cover border-2 border-white/20 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openPreview(w.profilePhoto || "/avatar.png", "Profile Photo")}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">Click to view</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-xl text-white">
              {w.fullName || "(No name)"}
            </div>
            <div className="space-y-1">
              <div className="text-sm text-white/60 flex items-center gap-2">
                <span className="w-4">📧</span>
                {w.email}
              </div>
              <div className="text-sm text-white/80 flex items-center gap-2">
                <span className="w-4">📞</span>
                {w.phone || "-"}
              </div>
              <div className="text-sm text-white/80 flex items-center gap-2">
                <span className="w-4">📍</span>
                {w.city || "-"}
              </div>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-white/80">Current Status:</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium capitalize
                ${w.status === 'active' ? 'bg-green-500/20 text-green-300' : 
                  w.status === 'rejected' ? 'bg-red-500/20 text-red-300' : 
                  'bg-yellow-500/20 text-yellow-200'}`}>
                {w.status}
              </span>
            </div>
          </div>
        </div>

        {/* ================= SERVICES ================= */}
        <div className="space-y-2">
          <div className="font-semibold text-lg text-white border-b pb-1">Services</div>
          {w.services?.length ? (
            <div className="space-y-2">
              {w.services.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="font-medium text-white">{s.name}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full">
                      {s.experienceYears || 0} yrs
                    </span>
                    <span className="font-semibold text-green-700">₹{s.basePrice || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-white/50 italic p-3 bg-white/5 rounded-lg">
              No services added
            </div>
          )}
        </div>

        {/* ================= EXTRA SERVICES ================= */}
        {w.extraServices?.length > 0 && (
          <div className="space-y-2">
            <div className="font-semibold text-lg text-white border-b pb-1">Extra Services</div>
            <div className="space-y-2">
              {w.extraServices.map((x, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-purple-500/15 rounded-lg">
                  <span className="font-medium text-white">{x.title}</span>
                  <span className="font-semibold text-purple-700">₹{x.price || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SKILLS & DETAILS ================= */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <div className="font-semibold text-white mb-2">Skills</div>
              <div className="flex flex-wrap gap-2">
                {w.skills?.length ? (
                  w.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-white/40 italic text-sm">-</span>
                )}
              </div>
            </div>
            
            <div>
              <div className="font-semibold text-white mb-2">Languages</div>
              <div className="flex flex-wrap gap-2">
                {w.languages?.length ? (
                  w.languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm">
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-white/40 italic text-sm">-</span>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="font-semibold text-white mb-2">Bio</div>
            <p className="text-white/60 text-sm p-3 bg-white/5 rounded-lg leading-relaxed">
              {w.bio || <span className="text-white/40 italic">No bio provided</span>}
            </p>
          </div>
        </div>

        {/* ================= DOCUMENTS ================= */}
        <div className="space-y-3">
          <div className="font-semibold text-lg text-white border-b pb-1">Documents</div>
          <div className="flex flex-wrap gap-6">
            {w.documents?.idProof && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-white/60">ID Proof</div>
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => openPreview(w.documents.idProof, "ID Proof")}
                >
                  <img
                    src={w.documents.idProof}
                    className="w-48 h-36 object-cover rounded-lg border-2 border-white/20 shadow-sm hover:shadow-md transition-all group-hover:opacity-90"
                    alt="ID Proof"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Click to view</span>
                  </div>
                </div>
              </div>
            )}

            {w.documents?.addressProof && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-white/60">Address Proof</div>
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => openPreview(w.documents.addressProof, "Address Proof")}
                >
                  <img
                    src={w.documents.addressProof}
                    className="w-48 h-36 object-cover rounded-lg border-2 border-white/20 shadow-sm hover:shadow-md transition-all group-hover:opacity-90"
                    alt="Address Proof"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Click to view</span>
                  </div>
                </div>
              </div>
            )}

            {!w.documents?.idProof && !w.documents?.addressProof && (
              <div className="text-sm text-white/50 italic p-4 bg-white/5 rounded-lg">
                No documents uploaded
              </div>
            )}
          </div>
        </div>

        {/* ================= GALLERY ================= */}
        <div className="space-y-3">
          <div className="font-semibold text-lg text-white border-b pb-1">Gallery Photos</div>
          {w.galleryPhotos?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {w.galleryPhotos.map((url, i) => (
                <div 
                  key={i}
                  className="relative group aspect-square cursor-pointer"
                  onClick={() => openPreview(url, `Gallery Photo ${i + 1}`)}
                >
                  <img
                    src={url}
                    className="w-full h-full object-cover rounded-lg border border-white/15 shadow-sm hover:shadow-md transition-all group-hover:opacity-90"
                    alt={`Gallery ${i + 1}`}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">View</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-white/50 italic p-4 bg-white/5 rounded-lg">
              No gallery photos uploaded
            </div>
          )}
        </div>

        {/* ================= CHANGE STATUS ================= */}
        <div className="pt-4 border-t border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-white">Current Status</div>
              <div className="flex items-center gap-3 mt-1">
                <div className={`px-4 py-2 rounded-lg border ${getStatusColor(w.status)}`}>
                  <span className="font-medium capitalize">{getStatusText(w.status)}</span>
                </div>
                {w.status === 'active' && (
                  <span className="text-xs text-green-300 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Worker is approved and active
                  </span>
                )}
                {w.status === 'rejected' && (
                  <span className="text-xs text-red-300 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Worker is rejected
                  </span>
                )}
                {w.status === 'pending' && (
                  <span className="text-xs text-yellow-300 flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Awaiting review
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-sm text-white/50">
              ID: <span className="font-mono text-white/80">{w.workerUserId}</span>
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-3">Change Status To:</div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onChangeStatus(w.workerUserId, "active")}
                className={`px-5 py-3 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2 
                  ${w.status === 'active' 
                    ? 'bg-green-700 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
                disabled={w.status === 'active'}
              >
                <span className="w-2 h-2 bg-white rounded-full"></span>
                Approve
                {w.status === 'active' && <span className="text-xs opacity-90">(Current)</span>}
              </button>
              
              <button
                onClick={() => onChangeStatus(w.workerUserId, "rejected")}
                className={`px-5 py-3 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2
                  ${w.status === 'rejected' 
                    ? 'bg-red-700 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 active:scale-95'}`}
                disabled={w.status === 'rejected'}
              >
                <span className="w-2 h-2 bg-white rounded-full"></span>
                Reject
                {w.status === 'rejected' && <span className="text-xs opacity-90">(Current)</span>}
              </button>
              
              <button
                onClick={() => onChangeStatus(w.workerUserId, "pending")}
                className={`px-5 py-3 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2
                  ${w.status === 'pending' 
                    ? 'bg-yellow-600 cursor-not-allowed' 
                    : 'bg-yellow-500 hover:bg-yellow-600 active:scale-95'}`}
                disabled={w.status === 'pending'}
              >
                <span className="w-2 h-2 bg-white rounded-full"></span>
                Set as Pending
                {w.status === 'pending' && <span className="text-xs opacity-90">(Current)</span>}
              </button>
            </div>
            
            <div className="mt-3 text-xs text-white/50">
              Click a button to change the worker status. The current status is disabled.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

