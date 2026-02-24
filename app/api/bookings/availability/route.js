import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import WorkerProfile from "@/models/WorkerProfile";
import { isWorkerAvailableForSlot } from "@/lib/availability";
import { workerServesAddress, workerSupportsCategory } from "@/lib/rebook";

const ACTIVE_SLOT_STATUSES = ["confirmed", "assigned", "onway", "working"];
const BOOKING_24X7 =
  String(process.env.BOOKING_24X7 || "").trim().toLowerCase() === "true" ||
  String(process.env.BOOKING_24X7 || "").trim().toLowerCase() === "1" ||
  String(process.env.BOOKING_24X7 || "").trim().toLowerCase() === "yes";
const SLOT_INTERVAL_MINUTES = Math.max(15, Number(process.env.BOOKING_SLOT_INTERVAL_MINUTES || 30));
const SLOT_LOOKAHEAD_DAYS = Math.max(1, Number(process.env.BOOKING_SLOT_LOOKAHEAD_DAYS || 21));
const DAY_START_HOUR = BOOKING_24X7 ? 0 : Math.max(0, Math.min(23, Number(process.env.BOOKING_DAY_START_HOUR || 8)));
const DAY_END_HOUR = BOOKING_24X7 ? 23 : Math.max(0, Math.min(23, Number(process.env.BOOKING_DAY_END_HOUR || 21)));

function normalizeText(value = "") {
  return String(value || "").trim();
}

function toSlotKey(value) {
  return Math.floor(new Date(value).getTime() / 60000);
}

function parseDateInput(dateText) {
  const raw = String(dateText || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [year, month, day] = raw.split("-").map((row) => Number(row));
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function makeDaySlots(dayStart) {
  const start = new Date(dayStart);
  start.setHours(DAY_START_HOUR, 0, 0, 0);
  const end = new Date(dayStart);
  if (BOOKING_24X7) {
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);
  } else {
    end.setHours(DAY_END_HOUR + 1, 0, 0, 0);
  }

  const slots = [];
  let cursor = new Date(start);
  while (cursor < end) {
    slots.push(new Date(cursor));
    cursor = new Date(cursor.getTime() + SLOT_INTERVAL_MINUTES * 60 * 1000);
  }
  return slots;
}

function toSlotResponseRow(slotDate, extra = {}) {
  return {
    iso: slotDate.toISOString(),
    label: slotDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    ...extra,
  };
}

export async function GET(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "admin"] });
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const date = normalizeText(searchParams.get("date"));
  const serviceId = normalizeText(searchParams.get("serviceId"));
  const workerId = normalizeText(searchParams.get("workerId"));
  const areaCity = normalizeText(searchParams.get("city"));
  const areaPincode = normalizeText(searchParams.get("pincode"));

  const parsedDate = parseDateInput(date);
  if (!parsedDate) {
    return NextResponse.json({ ok: false, error: "Invalid date. Use YYYY-MM-DD." }, { status: 400 });
  }
  const now = new Date();
  const maxAllowedDate = new Date();
  maxAllowedDate.setDate(maxAllowedDate.getDate() + SLOT_LOOKAHEAD_DAYS);
  maxAllowedDate.setHours(23, 59, 59, 999);
  if (parsedDate.start.getTime() > maxAllowedDate.getTime()) {
    return NextResponse.json(
      { ok: false, error: `Availability is visible for next ${SLOT_LOOKAHEAD_DAYS} days only` },
      { status: 400 }
    );
  }

  if (!workerId && !serviceId) {
    return NextResponse.json({ ok: false, error: "serviceId or workerId is required" }, { status: 400 });
  }
  if (workerId && !mongoose.Types.ObjectId.isValid(workerId)) {
    return NextResponse.json({ ok: false, error: "Invalid workerId" }, { status: 400 });
  }
  if (serviceId && !mongoose.Types.ObjectId.isValid(serviceId)) {
    return NextResponse.json({ ok: false, error: "Invalid serviceId" }, { status: 400 });
  }

  const slots = makeDaySlots(parsedDate.start);
  const leadMs = Math.max(1, BOOKING_24X7 ? 1 : 15) * 60 * 1000;
  const requirementsMissing = [];
  if (!areaCity && !areaPincode) {
    requirementsMissing.push("Enter city or pincode to check live availability.");
  }

  const [service, userConflicts] = await Promise.all([
    serviceId ? Service.findById(serviceId).lean() : Promise.resolve(null),
    Booking.find({
      userId: user.userId,
      slotTime: { $gte: parsedDate.start, $lt: parsedDate.end },
      status: { $in: ACTIVE_SLOT_STATUSES },
    })
      .select("slotTime")
      .lean(),
  ]);

  if (serviceId && (!service || !service.active)) {
    return NextResponse.json({ ok: false, error: "Service not available" }, { status: 404 });
  }

  const userConflictKeys = new Set(userConflicts.map((row) => toSlotKey(row.slotTime)));

  let rows = slots.map((slotDate) => toSlotResponseRow(slotDate, { available: false, reason: "Checking..." }));

  if (requirementsMissing.length > 0) {
    rows = rows.map((row) => {
      const ts = new Date(row.iso).getTime();
      if (ts <= now.getTime() + leadMs) {
        return { ...row, available: false, reason: "Lead time required" };
      }
      if (userConflictKeys.has(toSlotKey(row.iso))) {
        return { ...row, available: false, reason: "You already have a booking at this time" };
      }
      return { ...row, available: false, reason: requirementsMissing[0] };
    });
  } else if (workerId) {
    const worker = await WorkerProfile.findOne({
      userId: workerId,
      verificationStatus: "APPROVED",
      verificationFeePaid: true,
      isOnline: true,
    })
      .select("userId categories serviceAreas availabilityCalendar")
      .lean();
    const workerConflictRows = worker
      ? await Booking.find({
          workerId,
          slotTime: { $gte: parsedDate.start, $lt: parsedDate.end },
          status: { $in: ACTIVE_SLOT_STATUSES },
        })
          .select("slotTime")
          .lean()
      : [];
    const workerConflictKeys = new Set(workerConflictRows.map((row) => toSlotKey(row.slotTime)));
    const servesArea = worker ? workerServesAddress(worker, { city: areaCity, pincode: areaPincode }) : false;
    const supportsCategory = worker && service?.category ? workerSupportsCategory(worker, service.category) : true;

    rows = rows.map((row) => {
      const slotDate = new Date(row.iso);
      const slotTs = slotDate.getTime();
      const slotKey = toSlotKey(slotDate);

      if (slotTs <= now.getTime() + leadMs) {
        return { ...row, available: false, reason: "Lead time required" };
      }
      if (userConflictKeys.has(slotKey)) {
        return { ...row, available: false, reason: "You already have a booking at this time" };
      }
      if (!worker) {
        return { ...row, available: false, reason: "Selected worker is offline or unavailable" };
      }
      if (!servesArea) {
        return { ...row, available: false, reason: "Selected worker does not serve this area" };
      }
      if (!supportsCategory) {
        return { ...row, available: false, reason: "Selected worker does not support this service" };
      }
      if (!isWorkerAvailableForSlot(worker, slotDate, now)) {
        return { ...row, available: false, reason: "Selected worker is unavailable as per schedule" };
      }
      if (workerConflictKeys.has(slotKey)) {
        return { ...row, available: false, reason: "Selected worker already has another booking" };
      }
      return { ...row, available: true, reason: "", availableWorkers: 1 };
    });
  } else {
    const candidateWorkers = await WorkerProfile.find({
      verificationStatus: "APPROVED",
      verificationFeePaid: true,
      isOnline: true,
      categories: service?.category || "",
      serviceAreas: {
        $elemMatch: {
          $or: [{ pincode: areaPincode }, { city: { $regex: `^${areaCity}$`, $options: "i" } }],
        },
      },
    })
      .select("userId categories serviceAreas availabilityCalendar")
      .lean();

    const candidateWorkerIds = candidateWorkers.map((row) => row.userId).filter(Boolean);
    const workerConflicts = candidateWorkerIds.length
      ? await Booking.find({
          workerId: { $in: candidateWorkerIds },
          slotTime: { $gte: parsedDate.start, $lt: parsedDate.end },
          status: { $in: ACTIVE_SLOT_STATUSES },
        })
          .select("workerId slotTime")
          .lean()
      : [];

    const busyBySlot = new Map();
    for (const row of workerConflicts) {
      const key = toSlotKey(row.slotTime);
      if (!busyBySlot.has(key)) busyBySlot.set(key, new Set());
      busyBySlot.get(key).add(String(row.workerId));
    }

    rows = rows.map((row) => {
      const slotDate = new Date(row.iso);
      const slotTs = slotDate.getTime();
      const slotKey = toSlotKey(slotDate);

      if (slotTs <= now.getTime() + leadMs) {
        return { ...row, available: false, reason: "Lead time required" };
      }
      if (userConflictKeys.has(slotKey)) {
        return { ...row, available: false, reason: "You already have a booking at this time" };
      }
      if (!service) {
        return { ...row, available: false, reason: "Please select service first" };
      }
      if (candidateWorkers.length === 0) {
        return { ...row, available: false, reason: "No workers available in this area" };
      }

      const busyWorkers = busyBySlot.get(slotKey) || new Set();
      let availableWorkers = 0;
      for (const worker of candidateWorkers) {
        if (!worker?.userId) continue;
        if (busyWorkers.has(String(worker.userId))) continue;
        if (!isWorkerAvailableForSlot(worker, slotDate, now)) continue;
        availableWorkers += 1;
      }

      if (availableWorkers > 0) {
        return { ...row, available: true, reason: "", availableWorkers };
      }
      return { ...row, available: false, reason: "No workers available at this time", availableWorkers: 0 };
    });
  }

  const availableCount = rows.filter((row) => row.available).length;
  const res = NextResponse.json({
    ok: true,
    availability: {
      date,
      mode: workerId ? "manual" : "auto",
      intervalMinutes: SLOT_INTERVAL_MINUTES,
      requirementsMissing,
      slots: rows,
      summary: {
        total: rows.length,
        available: availableCount,
        unavailable: rows.length - availableCount,
      },
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}
