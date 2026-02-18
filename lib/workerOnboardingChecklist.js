function hasText(value = "") {
  return String(value || "").trim().length > 0;
}

function getGalleryCount(worker = {}) {
  return Array.isArray(worker.galleryPhotos)
    ? worker.galleryPhotos.filter((row) => hasText(row)).length
    : 0;
}

function getSkillsCount(worker = {}) {
  return Array.isArray(worker.skills)
    ? worker.skills.filter((row) => hasText(row)).length
    : 0;
}

function getCategoriesCount(worker = {}) {
  return Array.isArray(worker.categories)
    ? worker.categories.filter((row) => hasText(row)).length
    : 0;
}

function getValidServiceAreas(worker = {}) {
  return Array.isArray(worker.serviceAreas)
    ? worker.serviceAreas.filter((row) => hasText(row?.city) && hasText(row?.pincode))
    : [];
}

export function getWorkerOnboardingChecklist(worker = {}) {
  const galleryCount = getGalleryCount(worker);
  const skillsCount = getSkillsCount(worker);
  const categoriesCount = getCategoriesCount(worker);
  const serviceAreaCount = getValidServiceAreas(worker).length;

  return [
    { key: "profile_photo", label: "profile photo", done: hasText(worker.profilePhoto) },
    { key: "gallery", label: "gallery photos (3-8)", done: galleryCount >= 3 && galleryCount <= 8 },
    { key: "bio", label: "bio (minimum 20 chars)", done: String(worker.bio || "").trim().length >= 20 },
    { key: "skills", label: "skills", done: skillsCount >= 1 },
    { key: "categories", label: "categories", done: categoriesCount >= 1 },
    { key: "service_areas", label: "service areas", done: serviceAreaCount >= 1 },
    { key: "address", label: "address", done: hasText(worker.address) },
    { key: "id_proof", label: "ID proof", done: hasText(worker?.docs?.idProof) },
    { key: "selfie", label: "selfie", done: hasText(worker?.docs?.selfie) },
  ];
}

export function getWorkerOnboardingMissingFields(worker = {}) {
  return getWorkerOnboardingChecklist(worker)
    .filter((row) => !row.done)
    .map((row) => row.label);
}

export function getWorkerOnboardingCompletion(worker = {}) {
  const checklist = getWorkerOnboardingChecklist(worker);
  const done = checklist.filter((row) => row.done).length;
  const total = checklist.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const missingFields = checklist.filter((row) => !row.done).map((row) => row.label);
  return {
    done,
    total,
    percent,
    checklist,
    missingFields,
  };
}

export function hasWorkerOnboardingComplete(worker = {}) {
  return getWorkerOnboardingMissingFields(worker).length === 0;
}
