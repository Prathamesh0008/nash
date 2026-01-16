import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  await dbConnect();
  const body = await req.json();

 const { email, password, role, name } = body;


  if (!email || !password || !role) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  if (!["user", "worker"].includes(role)) {
    return NextResponse.json({ ok: false, error: "Invalid role" }, { status: 400 });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ ok: false, error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let finalRole = role;

  // Optional: auto admin if matches env
  if (process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
    finalRole = "admin";
  }

 const user = await User.create({
  email: email.toLowerCase(),
  passwordHash,
  role: finalRole,
  name: name?.trim() || "",
});


  // If worker, create worker profile draft
  if (finalRole === "worker") {
    await WorkerProfile.create({ userId: user._id, status: "draft", services: [] });
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });

  const res = NextResponse.json({
    ok: true,
    user: { id: user._id, email: user.email, role: user.role },
  });

  setAuthCookie(res, token);
  return res;
}
