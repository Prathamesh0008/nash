import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { adjustWallet } from "@/lib/wallet";

export async function POST(req) {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["user", "worker", "admin"] });
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
  }

  const result = await adjustWallet({
    userId: user.userId,
    ownerType: user.role,
    direction: "credit",
    reason: body.reason || "manual_adjustment",
    amount,
    note: body.note || "Wallet add",
  });

  const res = NextResponse.json({ ok: true, wallet: { balance: result.balance }, transaction: result.transaction });
  return applyRefreshCookies(res, refreshedResponse);
}