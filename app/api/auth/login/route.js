import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });

    const res = NextResponse.json({
      ok: true,
      user: { id: user._id, email: user.email, role: user.role, fullName: user.fullName },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
