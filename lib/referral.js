import User from "@/models/User";

function normalizeSeed(seed = "") {
  return String(seed || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4) || "NASH";
}

function randomChunk(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let output = "";
  for (let i = 0; i < length; i += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
}

export async function generateUniqueReferralCode(nameOrEmail = "") {
  const prefix = normalizeSeed(nameOrEmail);
  for (let i = 0; i < 8; i += 1) {
    const code = `${prefix}${randomChunk(6)}`;
    const exists = await User.exists({ referralCode: code });
    if (!exists) return code;
  }
  return `${prefix}${Date.now().toString().slice(-6)}`;
}
