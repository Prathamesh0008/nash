import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { signinSchema, parseOrThrow } from "@/lib/validators";
import { createSessionResponse } from "@/lib/session";
import { enforceRateLimit, getRateLimitKey } from "@/lib/rateLimit";

export async function POST(req) {
  const rl = enforceRateLimit({
    key: getRateLimitKey(req, "signin"),
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Too many login attempts" }, { status: 429 });
  }

  try {
    await dbConnect();
    const data = parseOrThrow(signinSchema, await req.json());

    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status === "blocked") {
      return NextResponse.json({ ok: false, error: "Account blocked" }, { status: 403 });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    await createSessionResponse({ user, response: res, req });
    return res;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to signin" }, { status: error.status || 400 });
  }
}