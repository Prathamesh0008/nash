import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);

  const gender = searchParams.get("gender");
  const city = searchParams.get("city");
  const service = searchParams.get("service");
  const q = searchParams.get("q");          // 🔍 global search
  const rating = searchParams.get("rating");

  const filter = { status: "active" };
  const or = [];

  /* ================= BASIC FILTERS ================= */
  if (gender) filter.gender = gender;

  if (rating) {
    filter.ratingAvg = { $gte: Number(rating) };
  }

  /* ================= SEARCH / TEXT FILTERS ================= */
  if (q) {
    or.push(
      { fullName: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { "services.name": { $regex: q, $options: "i" } },
      { speciality: { $regex: q, $options: "i" } }
    );
  }

  if (city) {
    or.push({ city: { $regex: city, $options: "i" } });
  }

  if (service) {
    or.push({ "services.name": { $regex: service, $options: "i" } });
  }

  if (or.length > 0) {
    filter.$or = or;
  }

  /* ================= FETCH ================= */
  const profiles = await WorkerProfile.find(filter)
    .sort({ ratingAvg: -1 })
    .lean();

  /* ================= MAP USERS ================= */
  const users = await User.find({ role: "worker" }).lean();
  const userMap = {};
  users.forEach((u) => (userMap[u._id.toString()] = u));

  const result = profiles.map((p) => ({
    id: p.userId,
    name: p.fullName,
    city: p.city,
    profilePhoto: p.profilePhoto,
    services: (p.services || []).map((s) => s.name),
    ratingAvg: p.ratingAvg || 0,
    ratingCount: p.ratingCount || 0,
  }));

  return NextResponse.json({ ok: true, workers: result });
}
