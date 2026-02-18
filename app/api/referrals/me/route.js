import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Referral from "@/models/Referral";
import User from "@/models/User";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";

function buildReferralMilestones({ totalReferrals = 0, totalRewards = 0 } = {}) {
  const definitions = [
    { key: "starter", label: "Starter", targetReferrals: 1, targetRewards: 100 },
    { key: "growth", label: "Growth", targetReferrals: 5, targetRewards: 500 },
    { key: "champion", label: "Champion", targetReferrals: 10, targetRewards: 1200 },
    { key: "elite", label: "Elite", targetReferrals: 25, targetRewards: 3500 },
  ];

  const milestones = definitions.map((row) => {
    const referralsProgress = Math.min(100, Math.round((Number(totalReferrals || 0) / row.targetReferrals) * 100));
    const rewardsProgress = Math.min(100, Math.round((Number(totalRewards || 0) / row.targetRewards) * 100));
    const progress = Math.min(referralsProgress, rewardsProgress);
    return {
      ...row,
      done: Number(totalReferrals || 0) >= row.targetReferrals && Number(totalRewards || 0) >= row.targetRewards,
      progress,
    };
  });

  const nextMilestone = milestones.find((row) => !row.done) || null;
  return {
    milestones,
    nextMilestone,
  };
}

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const me = await User.findById(user.userId)
    .select("name email referralCode referralStats referredBy walletBalance")
    .lean();
  if (!me) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  const [referredUsers, referralsAsReferee] = await Promise.all([
    Referral.find({ referrerId: user.userId }).sort({ createdAt: -1 }).limit(200).lean(),
    Referral.find({ refereeId: user.userId }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  const refereeIds = referredUsers.map((row) => row.refereeId).filter(Boolean);
  const referrerIds = referralsAsReferee.map((row) => row.referrerId).filter(Boolean);
  const peers = await User.find({ _id: { $in: [...refereeIds, ...referrerIds] } }).select("name email").lean();
  const peerMap = new Map(peers.map((p) => [p._id.toString(), p]));

  const res = NextResponse.json({
    ok: true,
    referral: {
      code: me.referralCode || "",
      stats: me.referralStats || { totalReferrals: 0, totalRewards: 0 },
      walletBalance: Number(me.walletBalance || 0),
      referredBy: me.referredBy || null,
      referrals: referredUsers.map((row) => ({
        ...row,
        referee: peerMap.get(row.refereeId?.toString()) || null,
      })),
      referredMe: referralsAsReferee.map((row) => ({
        ...row,
        referrer: peerMap.get(row.referrerId?.toString()) || null,
      })),
      tracker: buildReferralMilestones({
        totalReferrals: Number(me?.referralStats?.totalReferrals || 0),
        totalRewards: Number(me?.referralStats?.totalRewards || 0),
      }),
    },
  });
  return applyRefreshCookies(res, refreshedResponse);
}
