import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MembershipPlan from "@/models/MembershipPlan";
import UserMembership from "@/models/UserMembership";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { ensureDefaultMembershipPlans, getActiveMembershipForUser } from "@/lib/membership";

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user"] });
  if (errorResponse) return errorResponse;

  await ensureDefaultMembershipPlans();

  const [activeMembership, recentMemberships, plans] = await Promise.all([
    getActiveMembershipForUser({ userId: user.userId }),
    UserMembership.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    MembershipPlan.find({ active: true }).sort({ sortOrder: 1, price: 1 }).lean(),
  ]);

  const res = NextResponse.json({
    ok: true,
    activeMembership: activeMembership || null,
    memberships: recentMemberships || [],
    plans: plans || [],
  });
  return applyRefreshCookies(res, refreshedResponse);
}
