"use client";

import { useSearchParams } from "next/navigation";
import ProviderGrid from "@/components/ProviderGrid";
import { providers } from "@/data/providers";

export default function SearchClient() {
  const params = useSearchParams();
  const query = params.get("q")?.toLowerCase() || "";

  const results = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query) ||
      p.specialties?.some((s) =>
        s.toLowerCase().includes(query)
      )
  );

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-6">
        Search Results {query && `for "${query}"`}
      </h1>

      {results.length > 0 ? (
        <ProviderGrid providers={results} />
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-white/60">
          No results found.
        </div>
      )}
    </section>
  );
}
