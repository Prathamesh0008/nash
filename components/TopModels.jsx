import Link from "next/link";

export default function TopModels({ providers = [] }) {
  const top = [...providers].slice(0, 10);

  if (!top.length) {
    return null;
  }

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-semibold text-white">Featured Therapists</h2>
        <p className="mt-1 text-sm text-slate-400">Top profiles available for home wellness sessions.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((row) => (
            <article key={row.id} className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-white">{row.name}</p>
              <p className="mt-1 text-xs text-slate-400">{row.location || "Location unavailable"}</p>
              <p className="mt-1 text-xs text-slate-400">INR {row.ratePerHour || 0}/hr</p>
              <Link href={`/workers/${row.id}`} className="mt-3 inline-block rounded-lg bg-fuchsia-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-fuchsia-500">
                View profile
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
