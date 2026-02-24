import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crown, Star } from "lucide-react";

export default function TopRanked({ providers = [] }) {
  const top = [...providers]
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0, 5);

  if (!top.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <p className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-200">
              <Crown className="h-3.5 w-3.5" />
              Top Rated
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">Top wellness therapists</h3>
            <p className="text-sm text-slate-400">Sorted by rating and recent service performance.</p>
          </div>
          <Link href="/workers" className="hidden items-center gap-1 text-sm text-sky-300 hover:text-sky-200 md:inline-flex">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 border-t border-white/10 md:grid-cols-5">
          {top.map((row, idx) => (
            <Link key={`${row.id}-${idx}`} href={`/workers/${row.id}`} className="border-b border-white/10 p-4 hover:bg-white/5 md:border-b-0 md:border-r md:last:border-r-0">
              <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                {row.images?.[0] ? (
                  <Image src={row.images[0]} alt={row.name} fill sizes="64px" className="object-cover" />
                ) : null}
              </div>
              <p className="truncate text-sm font-semibold text-white">{row.name}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-300">
                <Star className="h-3.5 w-3.5 text-amber-300" />
                {Number(row.rating || 0).toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-slate-400">INR {row.ratePerHour || 0}/hr</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
