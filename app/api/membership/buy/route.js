import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MembershipPlan from "@/models/MembershipPlan";
import Payment from "@/models/Payment";
import UserMembership from "@/models/UserMembership";
import { membershipBuySchema, parseOrThrow } from "@/lib/validators";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { adjustWallet } from "@/lib/wallet";
import { createNotification } from "@/lib/notify";
import { ensureDefaultMembershipPlans, getActiveMembershipForUser } from "@/lib/membership";

function normalizeCode(value = "") {
  return String(value || "").trim().toUpperCase();
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user"] });
  if (errorResponse) return errorResponse;

  try {
    const data = parseOrThrow(membershipBuySchema, await req.json());
    if (!mongoose.Types.ObjectId.isValid(data.planId)) {
      return NextResponse.json({ ok: false, error: "Invalid membership plan id" }, { status: 400 });
    }

    await ensureDefaultMembershipPlans();

    const plan = await MembershipPlan.findById(data.planId).lean();
    if (!plan || !plan.active) {
      return NextResponse.json({ ok: false, error: "Membership plan unavailable" }, { status: 404 });
    }

    const activeMembership = await getActiveMembershipForUser({ userId: user.userId });
    if (activeMembership) {
      const activePlan = activeMembership.planId
        ? await MembershipPlan.findById(activeMembership.planId).select("code name sortOrder").lean()
        : null;

      const activeCode = normalizeCode(activeMembership?.planSnapshot?.code || activePlan?.code || "");
      const nextCode = normalizeCode(plan.code);
      if (activeCode && activeCode === nextCode) {
        return NextResponse.json(
          {
            ok: false,
            error: `You already have ${plan.name} active till ${new Date(activeMembership.endsAt).toLocaleDateString()}.`,
          },
          { status: 409 }
        );
      }

      const currentSort = Number(activePlan?.sortOrder || 0);
      const nextSort = Number(plan.sortOrder || 0);
      const isUpgrade = nextSort > currentSort;
      if (!isUpgrade) {
        return NextResponse.json(
          {
            ok: false,
            error: `Upgrade allowed only to a higher plan. Current plan: ${activePlan?.name || activeMembership?.planSnapshot?.name || "Active plan"}.`,
          },
          { status: 409 }
        );
      }

      await UserMembership.updateOne(
        { _id: activeMembership._id, status: "active" },
        {
          $set: {
            status: "cancelled",
            endsAt: new Date(),
          },
        }
      );
    }

    let payment = null;
    if (data.paymentMethod === "wallet") {
      await adjustWallet({
        userId: user.userId,
        ownerType: "user",
        direction: "debit",
        reason: "membership_purchase",
        amount: Number(plan.price || 0),
        referenceType: "membership",
      });
    } else {
      const provider = (process.env.PAYMENT_PROVIDER || "demo").toLowerCase();
      payment = await Payment.create({
        userId: user.userId,
        type: "membership",
        amount: Number(plan.price || 0),
        status: "paid",
        provider,
        providerPaymentId: `${provider}_membership_${Date.now()}`,
        metadata: { planId: String(plan._id), code: String(plan.code || "") },
      });
    }

    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + Number(plan.durationDays || 0) * 24 * 60 * 60 * 1000);

    const membership = await UserMembership.create({
      userId: user.userId,
      planId: plan._id,
      planSnapshot: {
        code: plan.code,
        name: plan.name,
        price: Number(plan.price || 0),
        durationDays: Number(plan.durationDays || 0),
        discountType: plan.discountType,
        discountValue: Number(plan.discountValue || 0),
        maxDiscountPerBooking: Number(plan.maxDiscountPerBooking || 0),
        maxTotalDiscount: Number(plan.maxTotalDiscount || 0),
      },
      status: "active",
      startedAt,
      endsAt,
      purchasedAt: new Date(),
      paymentId: payment?._id || null,
      paymentMethod: data.paymentMethod,
      amountPaid: Number(plan.price || 0),
    });

    await createNotification({
      userId: user.userId,
      actorId: user.userId,
      type: "system",
      title: `${plan.name} activated`,
      body: `Membership active till ${new Date(endsAt).toLocaleDateString()}.`,
      href: "/membership",
      meta: { membershipId: membership._id.toString(), planCode: plan.code },
    });

    const res = NextResponse.json({ ok: true, membership, payment });
    return applyRefreshCookies(res, refreshedResponse);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to purchase membership" },
      { status: error.status || 400 }
    );
  }
}
