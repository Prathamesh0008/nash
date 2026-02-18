import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import MembershipPlan from "@/models/MembershipPlan";
import UserMembership from "@/models/UserMembership";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { getActiveMembershipForUser, isFamilyPassMembership, isFamilyPassPlan } from "@/lib/membership";

function pickPrimaryAddress(user) {
  const addresses = Array.isArray(user?.addresses) ? user.addresses : [];
  return addresses.find((row) => row?.isDefault) || addresses[0] || null;
}

function proximityLabel(score) {
  if (score >= 3) return "Same pincode";
  if (score >= 2) return "Same city";
  if (score >= 1) return "Same state";
  return "Nearby region";
}

function getProximityScore(base, candidate) {
  const basePincode = String(base?.pincode || "").trim();
  const baseCity = String(base?.city || "").trim().toLowerCase();
  const baseState = String(base?.state || "").trim().toLowerCase();
  const candidatePincode = String(candidate?.pincode || "").trim();
  const candidateCity = String(candidate?.city || "").trim().toLowerCase();
  const candidateState = String(candidate?.state || "").trim().toLowerCase();

  if (basePincode && candidatePincode && basePincode === candidatePincode) return 3;
  if (baseCity && candidateCity && baseCity === candidateCity) return 2;
  if (baseState && candidateState && baseState === candidateState) return 1;
  return 0;
}

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user"] });
  if (errorResponse) return errorResponse;

  const [me, activeMembership] = await Promise.all([
    User.findById(user.userId).select("name addresses").lean(),
    getActiveMembershipForUser({ userId: user.userId }),
  ]);

  let activePlan = null;
  if (activeMembership?.planId) {
    activePlan = await MembershipPlan.findById(activeMembership.planId).select("code name").lean();
  }
  const isFamilyPass = isFamilyPassMembership(activeMembership) || isFamilyPassPlan(activePlan || {});

  if (!isFamilyPass) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[family-pass][nearby] access denied", {
        userId: user.userId,
        membershipId: activeMembership?._id?.toString?.() || "",
        snapshotCode: String(activeMembership?.planSnapshot?.code || ""),
        snapshotName: String(activeMembership?.planSnapshot?.name || ""),
        planCode: String(activePlan?.code || ""),
        planName: String(activePlan?.name || ""),
      });
    }
    const res = NextResponse.json(
      {
        ok: false,
        memberOnly: true,
        redirectHref: "/membership?plan=FAMILY",
        error: "This page is only for Family Pass members.",
        currentPlan: activeMembership
          ? {
              code: String(activeMembership?.planSnapshot?.code || activePlan?.code || "").trim().toUpperCase(),
              name: activeMembership?.planSnapshot?.name || activePlan?.name || "",
              endsAt: activeMembership?.endsAt || null,
            }
          : null,
      },
      { status: 403 }
    );
    return applyRefreshCookies(res, refreshedResponse);
  }

  const myAddress = pickPrimaryAddress(me);
  if (!myAddress) {
    const res = NextResponse.json({
      ok: true,
      activeMembership,
      nearbyMembers: [],
      note: "Add a default address to see nearest Family Pass members.",
    });
    return applyRefreshCookies(res, refreshedResponse);
  }

  const now = new Date();
  const memberships = await UserMembership.find({
    userId: { $ne: user.userId },
    status: "active",
    startedAt: { $lte: now },
    endsAt: { $gt: now },
  })
    .select("userId planId endsAt usageCount createdAt planSnapshot")
    .lean();

  const peerPlanIds = [
    ...new Set(
      memberships
        .map((row) => String(row?.planId || ""))
        .filter(Boolean)
    ),
  ];
  const peerPlans = peerPlanIds.length
    ? await MembershipPlan.find({ _id: { $in: peerPlanIds } }).select("code name").lean()
    : [];
  const peerPlanMap = new Map(peerPlans.map((row) => [String(row._id), row]));
  const familyMemberships = memberships.filter((row) => {
    if (isFamilyPassMembership(row)) return true;
    const plan = peerPlanMap.get(String(row?.planId || ""));
    return isFamilyPassPlan(plan || {});
  });

  if (familyMemberships.length === 0) {
    const res = NextResponse.json({
      ok: true,
      activeMembership,
      nearbyMembers: [],
      note: "No nearby Family Pass members found yet.",
    });
    return applyRefreshCookies(res, refreshedResponse);
  }

  const familyUserIds = familyMemberships.map((row) => row.userId).filter(Boolean);
  const familyUsers = await User.find({
    _id: { $in: familyUserIds },
    role: "user",
    status: "active",
  })
    .select("name addresses")
    .lean();

  const membershipMap = new Map(familyMemberships.map((row) => [String(row.userId), row]));

  const nearbyMembers = familyUsers
    .map((memberUser) => {
      const memberAddress = pickPrimaryAddress(memberUser);
      const score = getProximityScore(myAddress, memberAddress);
      const membership = membershipMap.get(String(memberUser._id));
      return {
        userId: memberUser._id,
        name: memberUser.name || "Member",
        city: memberAddress?.city || "",
        pincode: memberAddress?.pincode || "",
        state: memberAddress?.state || "",
        proximityScore: score,
        proximity: proximityLabel(score),
        familyPassEndsAt: membership?.endsAt || null,
        memberSince: membership?.createdAt || null,
      };
    })
    .sort((a, b) => {
      if (b.proximityScore !== a.proximityScore) return b.proximityScore - a.proximityScore;
      return new Date(b.memberSince || 0).getTime() - new Date(a.memberSince || 0).getTime();
    })
    .slice(0, 30);

  const res = NextResponse.json({
    ok: true,
    activeMembership,
    me: {
      name: me?.name || "",
      city: myAddress?.city || "",
      pincode: myAddress?.pincode || "",
    },
    nearbyMembers,
    priorityNote: "Family Pass members receive priority in service allocation and response handling.",
  });
  return applyRefreshCookies(res, refreshedResponse);
}
