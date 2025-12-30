import PageShell from "@/components/PageShell";
import ProviderGrid from "@/components/ProviderGrid";
import { providers } from "@/data/providers";

export default function RegionPage({ params }) {
  const { country } = params;

  const regionProviders = providers.filter(
    (p) => p.country?.toLowerCase() === country
  );

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold capitalize">
            {country} Escorts
          </h1>
          <p className="mt-3 text-white/60">
            Verified companions available across {country}.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <ProviderGrid providers={regionProviders} />
      </section>
    </PageShell>
  );
}
