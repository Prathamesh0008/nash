#!/usr/bin/env node

import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import WorkerProfile from "../models/WorkerProfile.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "home_service_platform";

if (!MONGODB_URI) {
  console.error("[FAIL] Missing MONGODB_URI");
  process.exit(1);
}

function missingGenderFilter() {
  return { $or: [{ gender: { $exists: false } }, { gender: null }, { gender: "" }] };
}

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  console.log(`[INFO] Connected to MongoDB (${DB_NAME})`);

  const userBackfill = await User.updateMany(missingGenderFilter(), { $set: { gender: "other" } });
  console.log(`[PASS] Users gender backfilled: ${userBackfill.modifiedCount}`);

  const workersNeedingBackfill = await WorkerProfile.find(missingGenderFilter()).select("_id userId").lean();
  const userIds = [...new Set(workersNeedingBackfill.map((w) => String(w.userId)).filter(Boolean))];

  const users = await User.find({ _id: { $in: userIds } }).select("_id gender").lean();
  const userGenderMap = new Map(users.map((u) => [String(u._id), u.gender || "other"]));

  let updatedWorkers = 0;
  for (const worker of workersNeedingBackfill) {
    const gender = userGenderMap.get(String(worker.userId)) || "other";
    const updated = await WorkerProfile.updateOne({ _id: worker._id }, { $set: { gender } });
    updatedWorkers += Number(updated.modifiedCount || 0);
  }
  console.log(`[PASS] Worker profiles gender backfilled: ${updatedWorkers}`);

  await mongoose.disconnect();
  console.log("[DONE] Gender migration completed.");
}

run().catch(async (error) => {
  console.error("[FAIL] Gender migration failed:", error.message || error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
