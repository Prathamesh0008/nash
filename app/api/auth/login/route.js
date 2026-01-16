import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  await dbConnect();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  // Optional auto admin promote if matches env (handy for beginner demo)
  if (
    process.env.ADMIN_EMAIL &&
    user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() &&
    user.role !== "admin"
  ) {
    user.role = "admin";
    await user.save();
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });
  const res = NextResponse.json({
    ok: true,
    user: { id: user._id, email: user.email, role: user.role, name: user.name || "" },
  });

  setAuthCookie(res, token);
  return res;
}
