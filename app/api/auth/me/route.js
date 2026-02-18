import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const dbUser = await User.findById(user.userId).lean();
  if (!dbUser) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  const payload = {
    id: dbUser._id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    role: dbUser.role,
    status: dbUser.status,
    walletBalance: dbUser.walletBalance || 0,
    addresses: dbUser.addresses || [],
    referralCode: dbUser.referralCode || "",
    referralStats: dbUser.referralStats || { totalReferrals: 0, totalRewards: 0 },
    preferences: dbUser.preferences || { favoriteWorkerIds: [], savedSearchFilters: [], recentSearches: [] },
  };

  if (dbUser.role === "worker") {
    const profile = await WorkerProfile.findOne({ userId: dbUser._id }).lean();
    payload.workerProfile = profile || null;
  }

  const res = NextResponse.json({ ok: true, user: payload });
  return applyRefreshCookies(res, refreshedResponse);
}
