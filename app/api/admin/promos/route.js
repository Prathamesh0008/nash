import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PromoCode from "@/models/PromoCode";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const promos = await PromoCode.find({}).sort({ createdAt: -1 }).lean();
  const res = NextResponse.json({ ok: true, promos });
  return applyRefreshCookies(res, refreshedResponse);
}

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const code = String(body.code || "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ ok: false, error: "Promo code is required" }, { status: 400 });
  }

  const promo = await PromoCode.findOneAndUpdate(
    { code },
    {
      $set: {
        code,
        title: String(body.title || ""),
        description: String(body.description || ""),
        discountType: body.discountType === "percent" ? "percent" : "flat",
        discountValue: Number(body.discountValue || 0),
        maxDiscount: Number(body.maxDiscount || 0),
        minOrderAmount: Number(body.minOrderAmount || 0),
        maxUses: Number(body.maxUses || 0),
        perUserLimit: Math.max(1, Number(body.perUserLimit || 1)),
        allowedCategories: Array.isArray(body.allowedCategories) ? body.allowedCategories : [],
        allowedServiceIds: Array.isArray(body.allowedServiceIds) ? body.allowedServiceIds : [],
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validTill: body.validTill ? new Date(body.validTill) : null,
        active: body.active !== false,
        createdBy: user.userId,
      },
    },
    { upsert: true, new: true }
  );

  await writeAuditLog({
    actorId: user.userId,
    actorRole: user.role,
    action: "promo.upsert",
    targetType: "promo",
    targetId: promo._id,
    metadata: { code: promo.code },
    req,
  });

  const res = NextResponse.json({ ok: true, promo });
  return applyRefreshCookies(res, refreshedResponse);
}
