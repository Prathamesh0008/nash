import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";

export async function adjustWallet({ userId, ownerType, direction, reason, amount, referenceType = "", referenceId = null, note = "" }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found for wallet update");
  }

  const delta = direction === "credit" ? amount : -amount;
  const nextBalance = Number(user.walletBalance || 0) + Number(delta);

  if (nextBalance < 0) {
    throw new Error("Insufficient wallet balance");
  }

  user.walletBalance = nextBalance;
  await user.save();

  const txn = await WalletTransaction.create({
    ownerId: user._id,
    ownerType,
    direction,
    reason,
    amount,
    balanceAfter: nextBalance,
    referenceType,
    referenceId,
    note,
  });

  return { balance: nextBalance, transaction: txn };
}