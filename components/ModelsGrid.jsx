import Link from "next/link";
import { Star, MapPin } from "lucide-react";

export default function ModelsGrid({ workers = [] }) {
  if (!workers.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-6 text-sm text-slate-400">
        No therapist profiles available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {workers.map((worker) => (
        <article key={worker.id} className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-white">{worker.name}</h3>
            <span className="text-xs text-slate-400">INR {worker.ratePerHour || 0}/hr</span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5" />
            {worker.location || "Area not specified"}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-300">
            <Star className="h-3.5 w-3.5 text-amber-300" />
            {Number(worker.rating || 0).toFixed(1)}
          </p>
          <Link href={`/workers/${worker.id}`} className="mt-3 inline-block rounded-lg bg-fuchsia-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-fuchsia-500">
            View Profile
          </Link>
        </article>
      ))}
    </div>
  );
}
