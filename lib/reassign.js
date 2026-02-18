import Booking from "@/models/Booking";
import Service from "@/models/Service";
import Conversation from "@/models/Conversation";
import { matchWorkerForBooking } from "@/lib/matching";
import { createNotification, notifyAdmins } from "@/lib/notify";

const REASSIGNABLE_STATUSES = new Set(["confirmed", "assigned", "onway"]);

function safeText(value, max = 220) {
  return String(value || "").trim().slice(0, max);
}

function buildNote({ actorRole, reason, note, previousWorkerId, nextWorkerId }) {
  const reasonText = safeText(reason);
  const noteText = safeText(note);
  const suffix = [reasonText, noteText].filter(Boolean).join(" | ");
  const transition = nextWorkerId
    ? `worker ${String(previousWorkerId || "none").slice(-6)} -> ${String(nextWorkerId).slice(-6)}`
    : `worker ${String(previousWorkerId || "none").slice(-6)} -> unassigned`;
  return `Auto reassigned by ${actorRole || "system"} (${transition})${suffix ? ` | ${suffix}` : ""}`;
}

function createHttpError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function autoReassignBooking({
  bookingId,
  actorId = null,
  actorRole = "system",
  reason = "",
  note = "",
  allowUnassign = true,
}) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw createHttpError("Booking not found", 404);

  if (!REASSIGNABLE_STATUSES.has(String(booking.status || ""))) {
    throw createHttpError(`Auto reassign not allowed at status: ${booking.status}`, 409);
  }

  const service = await Service.findById(booking.serviceId).select("title category").lean();
  if (!service?.category) {
    throw createHttpError("Booking service is missing category for reassignment", 400);
  }

  const previousWorkerId = booking.workerId ? String(booking.workerId) : null;
  const match = await matchWorkerForBooking({
    category: service.category,
    areaPincode: String(booking.address?.pincode || ""),
    areaCity: String(booking.address?.city || ""),
    slotTime: booking.slotTime,
    excludeWorkerIds: previousWorkerId ? [previousWorkerId] : [],
  });

  const nextWorkerId = match?.worker?.userId ? String(match.worker.userId) : null;
  const transitionNote = buildNote({
    actorRole,
    reason,
    note,
    previousWorkerId,
    nextWorkerId,
  });

  if (!nextWorkerId) {
    if (!allowUnassign) {
      throw createHttpError("No replacement worker found for this slot", 409);
    }

    booking.workerId = null;
    booking.status = "confirmed";
    booking.assignmentMode = "auto";
    booking.assignmentReason = "Auto reassign requested but no replacement worker found yet";
    booking.conversationId = null;
    booking.statusLogs.push({
      status: "confirmed",
      actorRole: actorRole || "system",
      actorId: actorId || null,
      note: transitionNote,
    });
    await booking.save();

    const notifyTasks = [];
    if (previousWorkerId && String(previousWorkerId) !== String(actorId || "")) {
      notifyTasks.push(
        createNotification({
          userId: previousWorkerId,
          actorId: actorId || null,
          type: "status",
          title: "Job moved from your queue",
          body: "Booking was unassigned while we search for a replacement worker.",
          href: `/worker/jobs/${booking._id}`,
          meta: { bookingId: booking._id.toString(), status: "confirmed", autoReassign: true },
        })
      );
    }
    if (String(booking.userId) !== String(actorId || "")) {
      notifyTasks.push(
        createNotification({
          userId: booking.userId,
          actorId: actorId || null,
          type: "status",
          title: "Reassignment requested",
          body: "No replacement worker found yet. We are actively searching.",
          href: `/orders/${booking._id}`,
          meta: { bookingId: booking._id.toString(), status: "confirmed", autoReassign: true },
        })
      );
    }
    notifyTasks.push(
      notifyAdmins({
        actorId: actorId || null,
        type: "status",
        title: "Booking reassign pending",
        body: `${service.title} booking #${booking._id.toString().slice(-6)} needs manual follow-up.`,
        href: `/admin/orders`,
        meta: { bookingId: booking._id.toString(), status: "confirmed", autoReassign: "pending" },
      })
    );
    await Promise.all(notifyTasks);

    return {
      booking,
      reassigned: false,
      previousWorkerId,
      nextWorkerId: null,
      reason: "pending",
      score: null,
    };
  }

  const conversation = await Conversation.findOneAndUpdate(
    {
      bookingId: booking._id,
      userId: booking.userId,
      workerUserId: nextWorkerId,
    },
    {
      $setOnInsert: {
        bookingId: booking._id,
        userId: booking.userId,
        workerUserId: nextWorkerId,
      },
      $set: { lastMessageAt: new Date() },
    },
    { upsert: true, new: true }
  ).lean();

  booking.workerId = nextWorkerId;
  booking.status = "assigned";
  booking.assignmentMode = "auto";
  booking.assignmentReason = `Auto reassigned with score ${Number(match?.score || 0).toFixed(2)}`;
  booking.conversationId = conversation?._id || booking.conversationId || null;
  booking.statusLogs.push({
    status: "assigned",
    actorRole: actorRole || "system",
    actorId: actorId || null,
    note: transitionNote,
  });
  await booking.save();

  const notifyTasks = [];
  if (previousWorkerId && String(previousWorkerId) !== String(actorId || "")) {
    notifyTasks.push(
      createNotification({
        userId: previousWorkerId,
        actorId: actorId || null,
        type: "status",
        title: "Job reassigned",
        body: "This booking has been moved to another worker.",
        href: `/worker/jobs/${booking._id}`,
        meta: { bookingId: booking._id.toString(), autoReassign: true },
      })
    );
  }
  notifyTasks.push(
    createNotification({
      userId: nextWorkerId,
      actorId: actorId || null,
      type: "status",
      title: "New reassigned job",
      body: `${service.title} booking needs your attention.`,
      href: `/worker/jobs/${booking._id}`,
      meta: { bookingId: booking._id.toString(), status: "assigned", autoReassign: true },
    })
  );
  if (String(booking.userId) !== String(actorId || "")) {
    notifyTasks.push(
      createNotification({
        userId: booking.userId,
        actorId: actorId || null,
        type: "status",
        title: "Replacement worker assigned",
        body: "Your booking has been reassigned successfully.",
        href: `/orders/${booking._id}`,
        meta: { bookingId: booking._id.toString(), status: "assigned", autoReassign: true },
      })
    );
  }
  await Promise.all(notifyTasks);

  return {
    booking,
    reassigned: true,
    previousWorkerId,
    nextWorkerId,
    reason: "matched",
    score: Number(match?.score || 0),
  };
}
