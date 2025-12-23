import PageShell from "@/components/PageShell";
import ProviderGrid from "@/components/ProviderGrid";
import { extendedProviders } from "@/data/providers";

export const metadata = {
  title: "Elite Couples | Valentina's",
};

export default function CouplePage() {
  const coupleProviders = extendedProviders.filter(
    p => p.category?.toLowerCase() === "couple"
  );

  return (
    <PageShell>
      <section className="max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-white mb-4">Couples</h1>
        <p className="text-white/60 max-w-2xl mb-12">
          Exclusive couples curated for refined and unforgettable shared experiences.
        </p>

        <ProviderGrid providers={coupleProviders} />
      </section>
    </PageShell>
  );
}
