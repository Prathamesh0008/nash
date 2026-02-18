// expirePaidRanks.js
import cron from "node-cron";
import mongoose from "mongoose";
import WorkerProfile from "../models/WorkerProfile.js"; // Add .js extension

// Function to expire paid ranks
export const expirePaidRanks = async () => {
  const now = new Date();
  await WorkerProfile.updateMany(
    { "paidRank.active": true, "paidRank.expiresAt": { $lte: now } },
    { $set: { "paidRank.active": false, "paidRank.expiresAt": null } }
  );
  console.log("Expired paid ranks reset.");
};

// Schedule the task to run every hour (adjust as needed)
cron.schedule("0 * * * *", expirePaidRanks); 