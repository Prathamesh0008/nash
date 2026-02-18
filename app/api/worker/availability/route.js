import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { availabilitySchema, parseOrThrow } from "@/lib/validators";
import { getDefaultWeekly, sanitizeBlockedSlots } from "@/lib/availability";

function toAvailabilityPayload(profile) {
  const calendar = profile?.availabilityCalendar || {};
  return {
    isOnline: Boolean(profile?.isOnline),
    availabilityCalendar: {
      timezone: calendar.timezone || "Asia/Kolkata",
      minNoticeMinutes: Number(calendar.minNoticeMinutes || 30),
      weekly: Array.isArray(calendar.weekly) && calendar.weekly.length ? calendar.weekly : getDefaultWeekly(),
      blockedSlots: sanitizeBlockedSlots(calendar.blockedSlots || []).map((row) => row.toISOString()),
    },
  };
}

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  const profile = await WorkerProfile.findOne({ userId: user.userId }).lean();
  if (!profile) return NextResponse.json({ ok: false, error: "Worker profile not found" }, { status: 404 });

  const res = NextResponse.json({ ok: true, ...toAvailabilityPayload(profile) });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function PATCH(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  try {
    const data = parseOrThrow(availabilitySchema, await req.json());

    const profile = await WorkerProfile.findOne({ userId: user.userId });
    if (!profile) return NextResponse.json({ ok: false, error: "Worker profile not found" }, { status: 404 });

    if (
      data.isOnline === true &&
      !(profile.verificationStatus === "APPROVED" && profile.verificationFeePaid)
    ) {
      return NextResponse.json(
        { ok: false, error: "Verification pending. Online availability is blocked." },
        { status: 403 }
      );
    }

    if (typeof data.isOnline === "boolean") {
      profile.isOnline = data.isOnline;
    }

    const existingCalendar = profile.availabilityCalendar || {};
    const weekly = Array.isArray(data.weekly) && data.weekly.length ? data.weekly : existingCalendar.weekly || getDefaultWeekly();
    const blockedSlots = Array.isArray(data.blockedSlots)
      ? sanitizeBlockedSlots(data.blockedSlots)
      : sanitizeBlockedSlots(existingCalendar.blockedSlots || []);

    profile.availabilityCalendar = {
      timezone: existingCalendar.timezone || "Asia/Kolkata",
      minNoticeMinutes:
        typeof data.minNoticeMinutes === "number"
          ? data.minNoticeMinutes
          : Number(existingCalendar.minNoticeMinutes || 30),
      weekly,
      blockedSlots,
    };
    profile.lastActiveAt = new Date();
    await profile.save();

    const res = NextResponse.json({ ok: true, profile: toAvailabilityPayload(profile) });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to update availability" }, { status: error.status || 400 });
  }
}
