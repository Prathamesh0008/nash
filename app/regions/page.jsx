import Link from "next/link";
import PageShell from "@/components/PageShell";

const EUROPE_REGIONS = [
  { slug: "germany", name: "Germany" },
  { slug: "france", name: "France" },
  { slug: "italy", name: "Italy" },
  { slug: "spain", name: "Spain" },
  { slug: "netherlands", name: "Netherlands" },
  { slug: "uk", name: "United Kingdom" },
  { slug: "switzerland", name: "Switzerland" },
];

export const metadata = {
  title: "Escort Regions | Europe | Valentina's",
};

export default function RegionsPage() {
  return (
    <PageShell>
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold">Europe Regions</h1>
        <p className="mt-3 text-white/60">
          Browse verified companions by country.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">
          {EUROPE_REGIONS.map((r) => (
            <Link
              key={r.slug}
              href={`/regions/${r.slug}`}
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-4 text-center transition-all"
            >
              {r.name}
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
