import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const city = searchParams.get("city") || "";
  const service = searchParams.get("service") || "";
  const minPrice = Number(searchParams.get("minPrice")) || 0;
  const maxPrice = Number(searchParams.get("maxPrice")) || 0;
  const rating = Number(searchParams.get("rating")) || 0;
  const emergency = searchParams.get("emergency") === "true";
  const sort = searchParams.get("sort") || "";

  /* ================= FILTER ================= */
  const filter = { status: "active" };

  /* 🔍 TEXT SEARCH */
  if (q) {
    filter.$or = [
      { fullName: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { "services.name": { $regex: q, $options: "i" } },
      { speciality: { $regex: q, $options: "i" } },
    ];
  }

  /* 🏙 CITY */
  if (city) {
    filter.city = { $regex: city, $options: "i" };
  }

  /* 🛠 SERVICE */
  if (service) {
    filter["services.name"] = { $regex: service, $options: "i" };
  }

  /* 🚨 EMERGENCY */
  if (emergency) {
    filter["availability.emergencyAvailable"] = true;
  }

  /* 💰 PRICE */
  if (minPrice || maxPrice) {
    filter.services = {
      $elemMatch: {
        basePrice: {
          ...(minPrice ? { $gte: minPrice } : {}),
          ...(maxPrice ? { $lte: maxPrice } : {}),
        },
      },
    };
  }

  /* ⭐ RATING */
  if (rating) {
    filter.ratingAvg = { $gte: rating };
  }

  /* ================= QUERY ================= */
  let query = WorkerProfile.find(filter);

  /* ↕ SORT */
  if (sort === "rating") {
    query = query.sort({ ratingAvg: -1 });
  } else if (sort === "price") {
    query = query.sort({ "services.basePrice": 1 });
  }

  const profiles = await query.lean();

  /* ================= USERS ================= */
  const userIds = profiles.map((p) => p.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const map = {};
  users.forEach((u) => (map[u._id.toString()] = u));

  /* ================= RESPONSE ================= */
  const workers = profiles.map((p) => ({
    id: p.userId,
    name: map[p.userId.toString()]?.name || p.fullName || "Worker",
    city: p.city,
    services: p.services?.map((s) => s.name),
    photoUrl: p.profilePhoto || "",
    ratingAvg: p.ratingAvg || 0,
    ratingCount: p.ratingCount || 0,
  }));

  return NextResponse.json({ ok: true, workers });
}
