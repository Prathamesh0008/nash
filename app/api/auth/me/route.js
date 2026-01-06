import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await dbConnect();

    // ✅ Get cookie correctly
    const cookieStore = await cookies(); // NO await here
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error("AUTH ME ERROR:", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
