import Link from "next/link";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import WorkerProfile from "@/models/WorkerProfile";
import User from "@/models/User";

function toTitleCity(citySlug = "") {
  return String(citySlug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { city, serviceSlug } = await params;
  await dbConnect();
  const service = await Service.findOne({ slug: serviceSlug, active: true }).select("description").lean();
  const cityTitle = toTitleCity(city);
  const serviceTitle = "All-Rounder Worker Visit";
  return {
    title: `${serviceTitle} in ${cityTitle} | Verified Workers`,
    description: `Book ${serviceTitle} in ${cityTitle} with verified workers and transparent pricing.`,
    alternates: {
      canonical: `/landing/${city}/${serviceSlug}`,
    },
  };
}

export default async function CityServiceLandingPage({ params }) {
  const { city, serviceSlug } = await params;
  const cityTitle = toTitleCity(city);

  await dbConnect();
  const service = await Service.findOne({ slug: serviceSlug, active: true }).lean();
  if (!service) {
    return (
      <section className="panel">
        <h1 className="text-xl font-semibold">Service not found</h1>
        <p className="text-sm text-slate-400">This landing page is unavailable.</p>
      </section>
    );
  }

  const workers = await WorkerProfile.find({
    verificationStatus: "APPROVED",
    verificationFeePaid: true,
    isOnline: true,
    categories: service.category,
    serviceAreas: {
      $elemMatch: {
        city: { $regex: `^${cityTitle}$`, $options: "i" },
      },
    },
  })
    .sort({ ratingAvg: -1, jobsCompleted: -1 })
    .limit(50)
    .lean();

  const userIds = workers.map((worker) => worker.userId).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } }).select("name").lean();
  const userMap = new Map(users.map((user) => [user._id.toString(), user.name]));

  return (
    <section className="space-y-4">
      <div className="panel">
        <h1 className="text-3xl font-semibold">All-Rounder Worker Visit in {cityTitle}</h1>
        <p className="mt-1 text-sm text-slate-400">Compare verified all-rounder workers in {cityTitle} by rating and availability.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={`/service/${service.slug}?city=${encodeURIComponent(cityTitle)}`} className="rounded bg-sky-700 px-3 py-2 text-sm text-white hover:bg-sky-600">
            View full service page
          </Link>
          <Link href={`/booking/new?serviceId=${service._id}`} className="rounded bg-emerald-700 px-3 py-2 text-sm text-white hover:bg-emerald-600">
            Book now
          </Link>
        </div>
      </div>

      <div className="panel">
        <h2 className="text-xl font-semibold">Top verified workers in {cityTitle}</h2>
        <p className="text-sm text-slate-400">{workers.length} worker(s) found</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {workers.map((worker) => (
            <article key={worker.userId} className="rounded border border-slate-700 bg-slate-900/40 p-3 text-sm">
              <p className="font-semibold">{userMap.get(String(worker.userId)) || "Worker"}</p>
              <p className="text-slate-400">Rating {Number(worker.ratingAvg || 0).toFixed(1)} | Jobs {worker.jobsCompleted || 0}</p>
              <p className="text-slate-400">Areas: {(worker.serviceAreas || []).map((area) => `${area.city}-${area.pincode}`).join(", ")}</p>
              <div className="mt-2 flex gap-2">
                <Link href={`/workers/${worker.userId}`} className="rounded bg-slate-800 px-2 py-1 hover:bg-slate-700">Profile</Link>
                <Link href={`/booking/new?serviceId=${service._id}&workerId=${worker.userId}`} className="rounded bg-sky-700 px-2 py-1 text-white hover:bg-sky-600">Book</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
