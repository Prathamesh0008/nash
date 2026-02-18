import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET() {
  await dbConnect();
  const { errorResponse, refreshedResponse } = await requireAuth({ roles: ["admin"] });
  if (errorResponse) return errorResponse;

  const users = await User.find({ role: "user" }).sort({ createdAt: -1 }).lean();
  const res = NextResponse.json({ ok: true, users });
  return applyRefreshCookies(res, refreshedResponse);
}