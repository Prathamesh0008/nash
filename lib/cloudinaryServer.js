import crypto from "crypto";

export function getCloudinaryConfig() {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  };
}

function signPayload(payload, apiSecret) {
  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export function buildUploadSignature({ folder = "uploads", timestamp = Math.floor(Date.now() / 1000) }) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary env vars missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
  }

  const toSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = signPayload(toSign, apiSecret);

  return { cloudName, apiKey, folder, timestamp, signature };
}