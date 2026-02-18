export function maskPhone(phone = "") {
  const raw = String(phone || "").replace(/\D/g, "");
  if (!raw) return "Hidden until booking";
  if (raw.length <= 4) return "*".repeat(raw.length);
  return `${"*".repeat(Math.max(0, raw.length - 4))}${raw.slice(-4)}`;
}

export function maskEmail(email = "") {
  const value = String(email || "");
  if (!value.includes("@")) return "Hidden until booking";
  const [name, domain] = value.split("@");
  if (!name) return `***@${domain || ""}`;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(1, name.length - visible.length))}@${domain || ""}`;
}
