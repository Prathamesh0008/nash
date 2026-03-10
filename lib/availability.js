export function getDefaultWeekly() {
  return [
    { day: 0, start: "00:00", end: "23:59", isOff: false },
    { day: 1, start: "00:00", end: "23:59", isOff: false },
    { day: 2, start: "00:00", end: "23:59", isOff: false },
    { day: 3, start: "00:00", end: "23:59", isOff: false },
    { day: 4, start: "00:00", end: "23:59", isOff: false },
    { day: 5, start: "00:00", end: "23:59", isOff: false },
    { day: 6, start: "00:00", end: "23:59", isOff: false },
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

  const calendar = profile.availabilityCalendar || {};

  const blockedSlots = sanitizeBlockedSlots(calendar.blockedSlots || []);
  const slotMinute = Math.floor(slot.getTime() / 60000);
  if (blockedSlots.some((row) => Math.floor(new Date(row).getTime() / 60000) === slotMinute)) {
    return false;
  }
  // Worker availability is 24x7 by default. Optional block slots can still disable specific times.
  return true;
}
