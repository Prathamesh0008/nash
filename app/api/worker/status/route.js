import dbConnect from "@/lib/db";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await dbConnect();

    // ✅ cookies() must be awaited in Next 16
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Not logged in" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).lean();
    if (!user || user.role !== "worker") {
      return NextResponse.json(
        { ok: false, message: "Not a worker" },
        { status: 403 }
      );
    }

    const worker = await WorkerProfile.findOne({ userId: user._id })
      .select("status promotionPlan")
      .lean();

    if (!worker) {
      return NextResponse.json({
        ok: true,
        status: "draft",
        promotionPlan: "standard",
      });
    }

    return NextResponse.json({
      ok: true,
      status: worker.status,
      promotionPlan: worker.promotionPlan,
    });
  } catch (err) {
    console.error("WORKER STATUS ERROR:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    );
  }
}
