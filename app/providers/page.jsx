import ProviderGrid from "@/components/ProviderGrid";
import { providers } from "@/data/providers";
import PageContainer from "@/components/PageContainer";

export default function ProvidersPage({ searchParams }) {
  const q = searchParams?.q?.toLowerCase() || "";
  const category = searchParams?.category?.toLowerCase();

  const filtered = providers.filter(p => {
    const matchesQuery =
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.bio.toLowerCase().includes(q);

    const matchesCategory = category
      ? p.specialties.some(s =>
          s.toLowerCase().includes(category)
        )
      : true;

    return matchesQuery && matchesCategory;
  });

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold text-white mb-6">
        Providers
      </h1>
      <ProviderGrid providers={filtered} />
    </PageContainer>
  );
}
