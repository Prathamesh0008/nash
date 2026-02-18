import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PromoCode from "@/models/PromoCode";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

function calcDiscount(promo, amount) {
  const gross = Number(amount || 0);
  if (promo.discountType === "percent") {
    const raw = (gross * Number(promo.discountValue || 0)) / 100;
    const cap = Number(promo.maxDiscount || 0);
    return Math.round(cap > 0 ? Math.min(raw, cap) : raw);
  }
  return Math.round(Math.min(gross, Number(promo.discountValue || 0)));
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const code = String(body.code || "").trim().toUpperCase();
  const amount = Number(body.amount || 0);
  const serviceId = String(body.serviceId || "");

  if (!code || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Code and amount are required" }, { status: 400 });
  }

  const promo = await PromoCode.findOne({
    code,
    active: true,
    $and: [
      { $or: [{ validFrom: null }, { validFrom: { $lte: new Date() } }] },
      { $or: [{ validTill: null }, { validTill: { $gte: new Date() } }] },
    ],
  }).lean();
  if (!promo) return NextResponse.json({ ok: false, error: "Invalid or expired promo" }, { status: 404 });

  if (Number(promo.minOrderAmount || 0) > amount) {
    return NextResponse.json({ ok: false, error: `Minimum order INR ${promo.minOrderAmount}` }, { status: 400 });
  }
  if (Number(promo.maxUses || 0) > 0 && Number(promo.usedCount || 0) >= Number(promo.maxUses || 0)) {
    return NextResponse.json({ ok: false, error: "Promo usage limit reached" }, { status: 400 });
  }

  if (Number(promo.perUserLimit || 0) > 0) {
    const usage = await Booking.countDocuments({ userId: user.userId, promoCode: code });
    if (usage >= Number(promo.perUserLimit || 0)) {
      return NextResponse.json({ ok: false, error: "You have already used this promo" }, { status: 400 });
    }
  }

  if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
    const service = await Service.findById(serviceId).select("category").lean();
    if (service) {
      if (Array.isArray(promo.allowedCategories) && promo.allowedCategories.length > 0 && !promo.allowedCategories.includes(service.category)) {
        return NextResponse.json({ ok: false, error: "Promo not valid for this category" }, { status: 400 });
      }
      if (
        Array.isArray(promo.allowedServiceIds) &&
        promo.allowedServiceIds.length > 0 &&
        !promo.allowedServiceIds.some((id) => id?.toString() === serviceId)
      ) {
        return NextResponse.json({ ok: false, error: "Promo not valid for this service" }, { status: 400 });
      }
    }
  }

  const discount = calcDiscount(promo, amount);
  const res = NextResponse.json({
    ok: true,
    promo: {
      code: promo.code,
      title: promo.title,
      discount,
      payable: Math.max(0, amount - discount),
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}
