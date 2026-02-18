import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import BoostPlan from "@/models/BoostPlan";
import ActiveBoost from "@/models/ActiveBoost";
import Payment from "@/models/Payment";
import { boostBuySchema, parseOrThrow } from "@/lib/validators";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { adjustWallet } from "@/lib/wallet";
import { createNotification } from "@/lib/notify";

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  try {
    const data = parseOrThrow(boostBuySchema, await req.json());
    if (!mongoose.Types.ObjectId.isValid(data.planId)) {
      return NextResponse.json({ ok: false, error: "Invalid plan id" }, { status: 400 });
    }

    const [profile, plan] = await Promise.all([
      WorkerProfile.findOne({ userId: user.userId }),
      BoostPlan.findById(data.planId),
    ]);

    if (!profile) return NextResponse.json({ ok: false, error: "Worker profile missing" }, { status: 404 });
    if (!plan || !plan.active) return NextResponse.json({ ok: false, error: "Plan unavailable" }, { status: 404 });

    if (!profile.verificationFeePaid || profile.verificationStatus !== "APPROVED") {
      return NextResponse.json(
        { ok: false, error: "Only verified workers can buy boosts" },
        { status: 403 }
      );
    }

    const slotFilter = {
      status: "active",
      endAt: { $gt: new Date() },
    };
    if (plan.areaLimited && data.area) slotFilter.area = data.area;
    if (plan.categoryLimited && data.category) slotFilter.category = data.category;

    const activeCount = await ActiveBoost.countDocuments(slotFilter);
    if (activeCount >= plan.slotLimit) {
      return NextResponse.json(
        { ok: false, error: "Boost slot limit reached for selected area/category" },
        { status: 409 }
      );
    }

    let payment = null;
    if (data.paymentMethod === "wallet") {
      await adjustWallet({
        userId: user.userId,
        ownerType: "worker",
        direction: "debit",
        reason: "boost_purchase",
        amount: plan.price,
      });
    } else {
      payment = await Payment.create({
        userId: user.userId,
        workerId: user.userId,
        type: "boost",
        amount: plan.price,
        status: "paid",
        provider: "demo",
        providerPaymentId: `demo_boost_${Date.now()}`,
      });
    }

    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const activeBoost = await ActiveBoost.create({
      workerId: user.userId,
      planId: plan._id,
      area: plan.areaLimited ? data.area : "",
      category: plan.categoryLimited ? data.category : "",
      boostScore: plan.boostScore,
      startAt,
      endAt,
      status: "active",
      paymentId: payment?._id || null,
    });

    await createNotification({
      userId: user.userId,
      actorId: user.userId,
      type: "system",
      title: "Boost profile activated",
      body: `${plan.name} active till ${new Date(endAt).toLocaleDateString()}`,
      href: "/worker/boost",
      meta: { planId: plan._id.toString(), activeBoostId: activeBoost._id.toString() },
    });

    const res = NextResponse.json({ ok: true, activeBoost, payment });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to buy boost" }, { status: error.status || 400 });
  }
}
