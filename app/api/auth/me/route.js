import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) return NextResponse.json({ ok: false, user: null }, { status: 401 });

  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ ok: false, user: null }, { status: 401 });

  const user = await User.findById(decoded.userId).lean();
  if (!user) return NextResponse.json({ ok: false, user: null }, { status: 401 });

  let workerProfile = null;
  if (user.role === "worker") {
    workerProfile = await WorkerProfile.findOne({ userId: user._id }).lean();
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name || "",
      workerStatus: workerProfile?.status || null,
    },
  });
}

