import Link from "next/link";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import WorkerProfile from "@/models/WorkerProfile";

export const metadata = {
  title: "Service Areas & City Landing Pages",
  description: "Explore city and service specific pages for verified therapists.",
};

function slugifyCity(city = "") {
  return String(city || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function LandingIndexPage() {
  await dbConnect();
  const [services, workers] = await Promise.all([
    Service.find({ active: true }).select("title slug").sort({ title: 1 }).lean(),
    WorkerProfile.find({ verificationStatus: "APPROVED", verificationFeePaid: true, isOnline: true })
      .select("serviceAreas")
      .limit(400)
      .lean(),
  ]);

  const citySet = new Set();
  for (const worker of workers) {
    for (const area of worker.serviceAreas || []) {
      const city = String(area?.city || "").trim();
      if (city) citySet.add(city);
    }
  }
  const cities = [...citySet].sort((a, b) => a.localeCompare(b)).slice(0, 40);
  const topServices = services.slice(0, 20);

  return (
    <section className="space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">City + Service Landing Pages</h1>
        <p className="text-sm text-slate-400">SEO-ready pages for each service in major cities.</p>
      </div>

      <div className="panel space-y-3">
        <h2 className="text-lg font-semibold">Popular combinations</h2>
        <div className="grid gap-2 md:grid-cols-3">
          {cities.slice(0, 12).flatMap((city) => topServices.slice(0, 2).map((service) => (
            <Link
              key={`${city}-${service.slug}`}
              href={`/landing/${slugifyCity(city)}/${service.slug}`}
              className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
            >
              {service.title} in {city}
            </Link>
          )))}
        </div>
      </div>

      <div className="panel space-y-3">
        <h2 className="text-lg font-semibold">Cities</h2>
        <p className="text-sm text-slate-400">{cities.join(", ") || "No cities found yet."}</p>
      </div>
    </section>
  );
}
