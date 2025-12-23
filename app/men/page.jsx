import PageShell from "@/components/PageShell";
import ProviderGrid from "@/components/ProviderGrid";
import { extendedProviders } from "@/data/providers";

export const metadata = {
  title: "Men | Valentina's",
  description: "Browse premium male companions and service providers",
};

export default function MenPage() {
  const menProviders = extendedProviders.filter(
    (p) =>
      p.gender?.toLowerCase() === "male" ||
      p.category?.toLowerCase() === "men"
  );

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative bg-gradient-to-b from-black via-black/90 to-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Men
          </h1>
          <p className="mt-3 text-white/60 max-w-2xl">
            Explore verified male companions offering premium experiences,
            professional presence, and exclusive services.
          </p>
        </div>
      </section>

      {/* LISTING */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        {menProviders.length > 0 ? (
          <ProviderGrid providers={menProviders} />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/60">
            No male providers available right now.
          </div>
        )}
      </section>
    </PageShell>
  );
}
