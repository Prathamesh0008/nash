import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MembershipPlan from "@/models/MembershipPlan";
import { ensureDefaultMembershipPlans } from "@/lib/membership";

export async function GET() {
  await dbConnect();
  await ensureDefaultMembershipPlans();

  const plans = await MembershipPlan.find({ active: true })
    .sort({ sortOrder: 1, price: 1 })
    .lean();

  return NextResponse.json({ ok: true, plans });
}
