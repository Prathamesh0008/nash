#!/usr/bin/env node

import dotenv from "dotenv";
import mongoose from "mongoose";
import Service from "../models/Service.js";
import WorkerProfile from "../models/WorkerProfile.js";
import ActiveBoost from "../models/ActiveBoost.js";
import PromoCode from "../models/PromoCode.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "escort_service_platform";

if (!MONGODB_URI) {
  console.error("[FAIL] Missing MONGODB_URI");
  process.exit(1);
}

const TERM_RULES = [
  { re: /\bAC\s*Service\b/gi, value: "Companion Session" },
  { re: /\bCarpenter\s*Work\b/gi, value: "Dinner Date Companion" },
  { re: /\bCarpenter\b/gi, value: "Companion" },
  { re: /\bElectrician\b/gi, value: "Event Companion" },
  { re: /\bPlumber\b/gi, value: "Travel Companion" },
  { re: /\bHome\s*Service\b/gi, value: "Companion Service" },
  { re: /\bHousekeeping\b/gi, value: "Lifestyle Companion" },
  { re: /\bCleaning\b/gi, value: "Lifestyle Companion" },
  { re: /\bSalon\b/gi, value: "Premium Companion" },
  { re: /\bRepair\b/gi, value: "Companion" },
  { re: /\bVisit\s*Fee\b/gi, value: "Travel Fee" },
];

function normalizeText(input = "") {
  let out = String(input || "");
  for (const rule of TERM_RULES) {
    out = out.replace(rule.re, rule.value);
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

function normalizeArray(items = []) {
  return (Array.isArray(items) ? items : []).map((row) => normalizeText(row)).filter(Boolean);
}

async function updateServices() {
  const rows = await Service.find({}).lean();
  let updated = 0;
  for (const row of rows) {
    const next = {
      title: normalizeText(row.title),
      category: normalizeText(row.category),
      description: normalizeText(row.description),
      addons: (row.addons || []).map((addon) => ({
        ...addon,
        title: normalizeText(addon?.title || ""),
      })),
    };

    const changed =
      next.title !== String(row.title || "") ||
      next.category !== String(row.category || "") ||
      next.description !== String(row.description || "") ||
      JSON.stringify(next.addons) !== JSON.stringify(row.addons || []);

    if (!changed) continue;
    await Service.updateOne({ _id: row._id }, { $set: next });
    updated += 1;
  }
  return updated;
}

async function updateWorkerProfiles() {
  const rows = await WorkerProfile.find({}).lean();
  let updated = 0;
  for (const row of rows) {
    const nextCategories = normalizeArray(row.categories || []);
    const nextExtra = (row.pricing?.extraServices || []).map((item) => ({
      ...item,
      title: normalizeText(item?.title || ""),
    }));

    const categoriesChanged = JSON.stringify(nextCategories) !== JSON.stringify(row.categories || []);
    const extraChanged = JSON.stringify(nextExtra) !== JSON.stringify(row.pricing?.extraServices || []);
    if (!categoriesChanged && !extraChanged) continue;

    const set = {};
    if (categoriesChanged) set.categories = nextCategories;
    if (extraChanged) set["pricing.extraServices"] = nextExtra;
    await WorkerProfile.updateOne({ _id: row._id }, { $set: set });
    updated += 1;
  }
  return updated;
}

async function updateActiveBoosts() {
  const rows = await ActiveBoost.find({ category: { $exists: true, $ne: "" } }).lean();
  let updated = 0;
  for (const row of rows) {
    const nextCategory = normalizeText(row.category || "");
    if (nextCategory === String(row.category || "")) continue;
    await ActiveBoost.updateOne({ _id: row._id }, { $set: { category: nextCategory } });
    updated += 1;
  }
  return updated;
}

async function updatePromos() {
  const rows = await PromoCode.find({ allowedCategories: { $exists: true, $not: { $size: 0 } } }).lean();
  let updated = 0;
  for (const row of rows) {
    const nextAllowed = normalizeArray(row.allowedCategories || []);
    if (JSON.stringify(nextAllowed) === JSON.stringify(row.allowedCategories || [])) continue;
    await PromoCode.updateOne({ _id: row._id }, { $set: { allowedCategories: nextAllowed } });
    updated += 1;
  }
  return updated;
}

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  console.log(`[INFO] Connected to MongoDB (${DB_NAME})`);

  const [services, workers, boosts, promos] = await Promise.all([
    updateServices(),
    updateWorkerProfiles(),
    updateActiveBoosts(),
    updatePromos(),
  ]);

  console.log(`[PASS] Services updated: ${services}`);
  console.log(`[PASS] Worker profiles updated: ${workers}`);
  console.log(`[PASS] Active boosts updated: ${boosts}`);
  console.log(`[PASS] Promo codes updated: ${promos}`);
  console.log("[DONE] Domain term migration completed.");

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("[FAIL] Domain term migration failed:", error.message || error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

