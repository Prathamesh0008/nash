import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import User from "@/models/User";
import WorkerProfile from "@/models/WorkerProfile";
import { requireAuth, applyRefreshCookies } from "@/lib/apiAuth";
import { isWorkerAvailableForSlot } from "@/lib/availability";

export async function GET() {
  await dbConnect();
  const { user, errorResponse, refreshedResponse } = await requireAuth({ roles: ["worker"] });
  if (errorResponse) return errorResponse;

  const profile = await WorkerProfile.findOne({ userId: user.userId }).lean();
  if (!profile) {
    const res = NextResponse.json({ ok: true, jobs: [], requests: [] });
    return applyRefreshCookies(res, refreshedResponse);
  }

  const jobs = await Booking.find({ workerId: user.userId }).sort({ createdAt: -1 }).limit(100).lean();

  let requests = [];

  const categoryList = (profile.categories || []).filter(Boolean);
  const areas = profile.serviceAreas || [];
  const pincodeSet = new Set(areas.map((area) => String(area?.pincode || "").trim()).filter(Boolean));
  const citySet = new Set(areas.map((area) => String(area?.city || "").trim().toLowerCase()).filter(Boolean));

  let serviceMap = new Map();

  if (profile.verificationStatus === "APPROVED" && profile.verificationFeePaid && categoryList.length > 0) {
    const requestServices = await Service.find({ active: true, category: { $in: categoryList } })
      .select("title category")
      .lean();
    const requestServiceIds = requestServices.map((service) => service._id);

    if (requestServiceIds.length > 0) {
      const candidates = await Booking.find({
        status: "confirmed",
        workerId: null,
        serviceId: { $in: requestServiceIds },
      })
        .sort({ createdAt: -1 })
        .limit(80)
        .lean();

      requests = candidates.filter((booking) => {
        const bookingPincode = String(booking?.address?.pincode || "").trim();
        const bookingCity = String(booking?.address?.city || "").trim().toLowerCase();
        if (!(pincodeSet.has(bookingPincode) || citySet.has(bookingCity))) return false;
        return isWorkerAvailableForSlot(profile, booking.slotTime);
      });
    }

    serviceMap = new Map(requestServices.map((service) => [service._id.toString(), service]));
  }

  const serviceIds = [
    ...new Set([
      ...jobs.map((job) => job.serviceId?.toString()).filter(Boolean),
      ...requests.map((request) => request.serviceId?.toString()).filter(Boolean),
    ]),
  ];

  const userIds = [
    ...new Set([
      ...jobs.map((job) => job.userId?.toString()).filter(Boolean),
      ...requests.map((request) => request.userId?.toString()).filter(Boolean),
    ]),
  ];

  const [services, users] = await Promise.all([
    Service.find({ _id: { $in: serviceIds } }).select("title category").lean(),
    User.find({ _id: { $in: userIds } }).select("name phone").lean(),
  ]);

  for (const service of services) {
    serviceMap.set(service._id.toString(), service);
  }

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const rows = jobs.map((job) => ({
    ...job,
    service: serviceMap.get(job.serviceId?.toString()) || null,
    customer: userMap.get(job.userId?.toString()) || null,
  }));

  const requestRows = requests.map((job) => ({
    ...job,
    service: serviceMap.get(job.serviceId?.toString()) || null,
    customer: userMap.get(job.userId?.toString()) || null,
  }));

  const res = NextResponse.json({ ok: true, jobs: rows, requests: requestRows });
  return applyRefreshCookies(res, refreshedResponse);
}
