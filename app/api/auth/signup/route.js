import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import Referral from "@/models/Referral";
import { signupSchema, parseOrThrow } from "@/lib/validators";
import { createSessionResponse } from "@/lib/session";
import { enforceRateLimit, getRateLimitKey } from "@/lib/rateLimit";
import { generateUniqueReferralCode } from "@/lib/referral";

export async function POST(req) {
  const rl = await enforceRateLimit({
    key: getRateLimitKey(req, "signup"),
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  try {
    await dbConnect();
    const data = parseOrThrow(signupSchema, await req.json());

    const existing = await User.findOne({ email: data.email.toLowerCase() }).lean();
    if (existing) {
      return NextResponse.json({ ok: false, error: "Email already registered" }, { status: 409 });
    }

    let referrer = null;
    const incomingReferralCode = String(data.referralCode || "").trim().toUpperCase();
    if (incomingReferralCode) {
      referrer = await User.findOne({ referralCode: incomingReferralCode }).select("_id name").lean();
      if (!referrer) {
        return NextResponse.json({ ok: false, error: "Invalid referral code" }, { status: 400 });
      }
    }

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone || "",
      role: data.role,
      gender: data.gender || "other",
      passwordHash: await bcrypt.hash(data.password, 10),
      status: "active",
      referralCode: await generateUniqueReferralCode(data.name || data.email),
      referredBy: referrer?._id || null,
    });

    if (user.role === "worker") {
      await WorkerProfile.create({
        userId: user._id,
        gender: data.gender || "other",
        accountStatus: "REGISTERED",
        verificationStatus: "INCOMPLETE",
      });
    }

    if (referrer?._id) {
      await Referral.findOneAndUpdate(
        { referrerId: referrer._id, refereeId: user._id },
        {
          $set: {
            referrerId: referrer._id,
            refereeId: user._id,
            referralCode: incomingReferralCode,
            status: "signed_up",
            note: "Referral linked at signup",
          },
        },
        { upsert: true, new: true }
      );
      await User.updateOne(
        { _id: referrer._id },
        { $inc: { "referralStats.totalReferrals": 1 } }
      );
    }

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        referralCode: user.referralCode,
      },
    });

    await createSessionResponse({ user, response: res, req });
    return res;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to signup" }, { status: error.status || 400 });
  }
}
