import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const category = (searchParams.get("category") || "").trim();

  const filter = { active: true };
  if (category) filter.category = category;
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  const services = await Service.find(filter).sort({ title: 1 }).lean();
  return NextResponse.json({ ok: true, services });
}