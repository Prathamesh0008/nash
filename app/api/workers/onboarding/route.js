import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  if (decoded.role !== "worker") return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, phone, city, services, availability, photoUrl } = body;

  if (!name || !phone || !city || !services?.length || !availability) {
    return NextResponse.json({ ok: false, error: "Please fill all fields" }, { status: 400 });
  }

  await User.findByIdAndUpdate(decoded.userId, { name });

  const profile = await WorkerProfile.findOneAndUpdate(
    { userId: decoded.userId },
    {
      phone,
      city,
      services,
      availability,
      photoUrl: photoUrl || "",
      status: "pending",
    },
    { new: true }
  );

  return NextResponse.json({ ok: true, profile });
}
