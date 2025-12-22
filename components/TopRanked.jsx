import Image from "next/image";
import Link from "next/link";
import { Crown, Flame, ArrowRight } from "lucide-react";
import RankBadge from "./RankBadge";

export default function TopRanked({ providers }) {
  const top = [...providers].sort((a, b) => a.rank - b.rank).slice(0, 5);

  return (
    <section className="max-w-7xl mx-auto px-4  relative z-10">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 md:p-8 flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-white/80 text-xs">
              <Crown className="h-4 w-4 text-amber-300" />
              Top Ranked This Week (Demo)
              <Flame className="h-4 w-4 text-orange-300" />
            </div>

            <h3 className="text-white text-xl md:text-2xl font-semibold mt-3">
              Featured creators on the leaderboard
            </h3>

            <p className="text-white/60 text-sm mt-1 max-w-xl">
              These profiles appear higher via performance + optional boosts (demo logic).
            </p>
          </div>

          <Link
            href="/creators"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 md:grid-cols-5 border-t border-white/10">
          {top.map((c, idx) => {
            const img = c.images?.[0]; // ✅ SAFE IMAGE

            return (
              <Link
                key={c.id}
                href={`/creators/${c.slug}`}
                className="group relative p-5 md:p-4 border-b md:border-b-0 md:border-r border-white/10 last:border-b-0 md:last:border-r-0 hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-4">
                  
                  {/* IMAGE */}
                  <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white/10 bg-black">
                    {img ? (
                      <Image
                        src={img}
                        alt={c.name}
                        fill
                        sizes="56px"
                        priority={idx < 2}
                        className="object-cover group-hover:scale-[1.05] transition"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600" />
                    )}
                  </div>

                  {/* INFO */}
                  <div className="min-w-0">
                    <div className="text-white font-semibold truncate">
                      {c.name}
                    </div>
                    <div className="text-white/60 text-xs truncate">
                      Rank #{c.rank} • €{c.ratePerHour}/hour
                    </div>
                    <div className="mt-2">
                      <RankBadge tier={c.tier} />
                    </div>
                  </div>
                </div>

                {/* #1 BADGE */}
                {c.rank === 1 && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 text-black text-xs font-bold flex items-center">
                    <Crown className="h-4 w-4 mr-1" /> #1
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* MOBILE CTA */}
        <div className="p-5 md:hidden">
          <Link
            href="/providers"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition"
          >
            View all creators <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
