import PageShell from "@/components/PageShell";
import ProviderGrid from "@/components/ProviderGrid";
import { providers } from "@/data/providers";

export const metadata = {
  title: "BDSM Escorts | Valentina's",
  description: "Explore verified BDSM companions across Europe",
};

export default function BDSMPage() {
  const bdsmProviders = providers.filter(
    (p) => p.categories?.includes("BDSM")
  );

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold">BDSM</h1>
          <p className="mt-4 text-white/60 max-w-2xl">
            Discover dominant, submissive, and fetish-friendly companions
            across major European cities.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <ProviderGrid providers={bdsmProviders} />
      </section>
    </PageShell>
  );
}
