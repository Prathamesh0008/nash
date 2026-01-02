import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await dbConnect();
    const { fullName, email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400 });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return NextResponse.json({ ok: false, message: "Email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: fullName || "",
      email: email.toLowerCase(),
      passwordHash,
      role,
    });

    const token = signToken({ userId: user._id.toString(), role: user.role });

    const res = NextResponse.json({
      ok: true,
      user: { id: user._id, email: user.email, role: user.role, fullName: user.fullName },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true on production https
      path: "/",
    });

    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
