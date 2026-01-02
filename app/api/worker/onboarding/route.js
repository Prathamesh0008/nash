import dbConnect from "@/lib/db";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    await dbConnect();

    // ✅ CORRECT cookies usage
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Not logged in" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "worker") {
      return NextResponse.json(
        { ok: false, message: "Only workers can onboard" },
        { status: 403 }
      );
    }

    const payload = await req.json();

    // ✅ email validation (this part is GOOD)
    const profileObj = payload.profile ? payload.profile : payload;

    if (!profileObj?.email) {
      return NextResponse.json(
        { ok: false, message: "Email is required" },
        { status: 400 }
      );
    }

  const doc = await WorkerProfile.findOneAndUpdate(
  { userId: user._id },
  {
    userId: user._id,

    profile: {
      ...profileObj,
      email: profileObj.email.toLowerCase(),
    },

    services: payload.services || [],
    languages: payload.languages || [],

    availability: payload.availability || {
      workingDays: [],
      startTime: "",
      endTime: "",
    },

    contactPreferences: payload.contactPreferences || {
      call: false,
      whatsapp: false,
      platform: false,
    },

    verification: payload.verification || {
      phoneCountry: "+31",
      phoneNumber: "",
      phoneVerified: false,
      identityPhoto: "",
      bodyPhoto: "",
    },

    advertisement: payload.advertisement || {
      promoSticker: "",
    },

    promotionPlan: payload.promotionPlan || "standard",
    acceptedTerms: !!payload.acceptedTerms,

    status: "pending_payment",
  },
  { upsert: true, new: true }
);


    return NextResponse.json({ ok: true, workerId: doc._id });
  } catch (e) {
    console.error("WORKER ONBOARDING ERROR:", e);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    );
  }
}
