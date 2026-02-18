import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ActiveBoost from "@/models/ActiveBoost";

export async function GET(req, context) {
  await dbConnect();
  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid worker id" }, { status: 400 });
  }

  const boosts = await ActiveBoost.find({ workerId: id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, boosts });
}