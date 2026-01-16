import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function PATCH(req, context) {
  await dbConnect();

  /* ================= AUTH ================= */
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  /* ================= PARAMS (NEXT 15 FIX) ================= */
  const { id: workerUserId } = await context.params;

  if (!workerUserId) {
    return NextResponse.json(
      { ok: false, error: "Missing worker id" },
      { status: 400 }
    );
  }

  /* ================= BODY ================= */
  const { status } = await req.json();

  if (!["active", "pending", "rejected"].includes(status)) {
    return NextResponse.json(
      { ok: false, error: "Invalid status" },
      { status: 400 }
    );
  }

  /* ================= UPDATE ================= */
  const updated = await WorkerProfile.findOneAndUpdate(
    { userId: workerUserId },
    { status },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json(
      { ok: false, error: "Worker not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, profile: updated });
}
