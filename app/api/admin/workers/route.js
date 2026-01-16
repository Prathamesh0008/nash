import dbConnect from "@/lib/dbConnect";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  await dbConnect();

  const token = (await cookies()).get("auth")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (!decoded || decoded.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const profiles = await WorkerProfile.find({}).lean();
  const users = await User.find({ role: "worker" }).lean();

  const userMap = {};
  users.forEach((u) => (userMap[u._id.toString()] = u));

  const workers = profiles.map((p) => {
    const u = userMap[p.userId?.toString()] || {};

    return {
      workerUserId: p.userId,
      fullName: p.fullName || u.name || "",
      email: u.email || "",
      phone: p.phone || "",
      city: p.city || "",
      status: p.status,

      profilePhoto: p.profilePhoto,
      galleryPhotos: p.galleryPhotos || [],

      services: p.services || [],
      extraServices: p.extraServices || [],
      speciality: p.speciality,

      skills: p.skills || [],
      languages: p.languages || [],

      availability: p.availability,
      documents: p.documents,
      bio: p.bio,
    };
  });

  return NextResponse.json({ ok: true, workers });
}
