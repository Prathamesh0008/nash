const WEEKDAY_MAP = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function isBooking24x7Enabled() {
  const value = String(process.env.BOOKING_24X7 || "").trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

function toMinutes(hhmm = "") {
  const [h = "0", m = "0"] = String(hhmm).split(":");
  const hours = Number(h);
  const mins = Number(m);
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) return 0;
  return hours * 60 + mins;
}

function getLocalParts(date, timezone = "Asia/Kolkata") {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value || "Sun";
  const hour = Number(parts.find((p) => p.type === "hour")?.value || "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value || "0");
  return {
    day: WEEKDAY_MAP[weekday] ?? 0,
    minutes: hour * 60 + minute,
  };
}

function normalizeWeekly(weekly = []) {
  if (!Array.isArray(weekly)) return [];
  return weekly
    .filter((row) => Number.isInteger(row?.day) && row.day >= 0 && row.day <= 6)
    .map((row) => ({
      day: row.day,
      start: String(row.start || "09:00"),
      end: String(row.end || "18:00"),
      isOff: Boolean(row.isOff),
    }))
    .sort((a, b) => a.day - b.day);
}

export function getDefaultWeekly() {
  return [
    { day: 0, start: "09:00", end: "18:00", isOff: true },
    { day: 1, start: "09:00", end: "18:00", isOff: false },
    { day: 2, start: "09:00", end: "18:00", isOff: false },
    { day: 3, start: "09:00", end: "18:00", isOff: false },
    { day: 4, start: "09:00", end: "18:00", isOff: false },
    { day: 5, start: "09:00", end: "18:00", isOff: false },
    { day: 6, start: "09:00", end: "18:00", isOff: false },
  ];
}

export function sanitizeBlockedSlots(blockedSlots = [], limit = 120) {
  if (!Array.isArray(blockedSlots)) return [];
  const now = Date.now() - 60 * 1000;
  const unique = new Set();
  const rows = [];
  for (const value of blockedSlots) {
    const dt = new Date(value);
    const ts = dt.getTime();
    if (Number.isNaN(ts) || ts < now) continue;
    const key = new Date(Math.floor(ts / 60000) * 60000).toISOString();
    if (unique.has(key)) continue;
    unique.add(key);
    rows.push(new Date(key));
    if (rows.length >= limit) break;
  }
  return rows.sort((a, b) => a.getTime() - b.getTime());
}

export function isWorkerAvailableForSlot(profile = {}, slotTime, now = new Date()) {
  const slot = new Date(slotTime);
  if (Number.isNaN(slot.getTime())) return false;
  if (slot.getTime() <= now.getTime()) return false;
  if (isBooking24x7Enabled()) return true;

  const calendar = profile.availabilityCalendar || {};
  const timezone = calendar.timezone || "Asia/Kolkata";
  const minNoticeMinutes = Number(calendar.minNoticeMinutes || 0);
  if (minNoticeMinutes > 0 && slot.getTime() < now.getTime() + minNoticeMinutes * 60 * 1000) {
    return false;
  }

  const blockedSlots = sanitizeBlockedSlots(calendar.blockedSlots || []);
  const slotMinute = Math.floor(slot.getTime() / 60000);
  if (blockedSlots.some((row) => Math.floor(new Date(row).getTime() / 60000) === slotMinute)) {
    return false;
  }

  const weekly = normalizeWeekly(calendar.weekly || getDefaultWeekly());
  const { day, minutes } = getLocalParts(slot, timezone);
  const dayConfig = weekly.find((row) => row.day === day);
  if (!dayConfig || dayConfig.isOff) return false;

  const fromMins = toMinutes(dayConfig.start);
  const toMins = toMinutes(dayConfig.end);
  if (toMins <= fromMins) return false;

  return minutes >= fromMins && minutes <= toMins;
}
