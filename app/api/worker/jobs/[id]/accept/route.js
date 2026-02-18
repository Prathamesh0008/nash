import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import WorkerProfile from "@/models/WorkerProfile";
import Conversation from "@/models/Conversation";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { createNotification } from "@/lib/notify";
import { isWorkerAvailableForSlot } from "@/lib/availability";

function isServiceAreaMatch(profile, booking) {
  const areas = profile?.serviceAreas || [];
  const bookingPincode = String(booking?.address?.pincode || "").trim();
  const bookingCity = String(booking?.address?.city || "").trim().toLowerCase();

  return areas.some((area) => {
    const areaPincode = String(area?.pincode || "").trim();
    const areaCity = String(area?.city || "").trim().toLowerCase();
    return areaPincode === bookingPincode || areaCity === bookingCity;
  });
}

export async function PATCH(req, context) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid job id" }, { status: 400 });
  }

  const profile = await WorkerProfile.findOne({ userId: user.userId }).lean();
  if (!profile) {
    return NextResponse.json({ ok: false, error: "Worker profile not found" }, { status: 404 });
  }

  if (!(profile.verificationStatus === "APPROVED" && profile.verificationFeePaid)) {
    return NextResponse.json(
      { ok: false, error: "Complete verification before accepting jobs" },
      { status: 403 }
    );
  }
  if (!profile.isOnline) {
    return NextResponse.json(
      { ok: false, error: "Go online before accepting jobs" },
      { status: 403 }
    );
  }

  const booking = await Booking.findById(id).lean();
  if (!booking) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }

  if (booking.workerId) {
    if (booking.workerId.toString() === user.userId) {
      return NextResponse.json({ ok: true, booking, message: "Already assigned to you" });
    }
    return NextResponse.json({ ok: false, error: "Booking already assigned" }, { status: 409 });
  }

  if (booking.status !== "confirmed") {
    return NextResponse.json({ ok: false, error: "Booking is not available for acceptance" }, { status: 400 });
  }

  const service = await Service.findById(booking.serviceId).select("title category").lean();
  if (!service) {
    return NextResponse.json({ ok: false, error: "Service not found for booking" }, { status: 400 });
  }

  const categorySet = new Set((profile.categories || []).map((category) => String(category || "").trim().toLowerCase()));
  if (!categorySet.has(String(service.category || "").trim().toLowerCase())) {
    return NextResponse.json({ ok: false, error: "Service category does not match your profile" }, { status: 403 });
  }

  if (!isServiceAreaMatch(profile, booking)) {
    return NextResponse.json({ ok: false, error: "Booking area is outside your service area" }, { status: 403 });
  }
  if (!isWorkerAvailableForSlot(profile, booking.slotTime)) {
    return NextResponse.json(
      { ok: false, error: "This booking slot is outside your current availability schedule" },
      { status: 403 }
    );
  }

  const updated = await Booking.findOneAndUpdate(
    { _id: id, status: "confirmed", workerId: null },
    {
      $set: {
        workerId: user.userId,
        status: "assigned",
        assignmentMode: "manual",
        assignmentReason: "Accepted by worker",
      },
      $push: {
        statusLogs: {
          status: "assigned",
          actorRole: "worker",
          actorId: user.userId,
          note: "Accepted by worker",
        },
      },
    },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json(
      { ok: false, error: "Booking was already accepted by another worker" },
      { status: 409 }
    );
  }

  const conversation = await Conversation.findOneAndUpdate(
    {
      bookingId: updated._id,
      userId: updated.userId,
      workerUserId: user.userId,
    },
    {
      $setOnInsert: {
        bookingId: updated._id,
        userId: updated.userId,
        workerUserId: user.userId,
      },
      $set: { lastMessageAt: new Date() },
    },
    { upsert: true, new: true }
  ).lean();

  if (!updated.conversationId) {
    await Booking.updateOne({ _id: updated._id }, { $set: { conversationId: conversation._id } });
    updated.conversationId = conversation._id;
  }

  await createNotification({
    userId: updated.userId,
    actorId: user.userId,
    type: "status",
    title: "Worker accepted your booking",
    body: `${service.title} booking is now assigned.`,
    href: `/orders/${updated._id}`,
    meta: { bookingId: updated._id.toString(), status: "assigned" },
  });

  const res = NextResponse.json({ ok: true, booking: updated });
  return applyRefreshCookies(res, refreshedResponse);
}
