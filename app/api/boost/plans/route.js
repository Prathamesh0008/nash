import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import BoostPlan from "@/models/BoostPlan";

export async function GET() {
  await dbConnect();
  const plans = await BoostPlan.find({ active: true }).sort({ boostScore: 1 }).lean();
  return NextResponse.json({ ok: true, plans });
}