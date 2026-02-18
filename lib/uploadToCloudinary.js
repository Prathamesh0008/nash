export async function uploadToCloudinary(file, options = {}) {
  const folder = options.folder || "nash/uploads";

  const signRes = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ folder }),
  });

  const signData = await signRes.json().catch(() => ({}));
  if (!signRes.ok || !signData.ok || !signData.signature) {
    throw new Error(signData.error || "Unable to fetch upload signature");
  }

  const { cloudName, apiKey, signature, timestamp, folder: signedFolder } = signData.signature;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("signature", signature);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", signedFolder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const uploadJson = await uploadRes.json().catch(() => ({}));
  if (!uploadRes.ok || !uploadJson.secure_url) {
    throw new Error(uploadJson.error?.message || "Upload failed");
  }

  return uploadJson.secure_url;
}