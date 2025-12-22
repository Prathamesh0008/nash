import ProviderGrid from "@/components/ProviderGrid";
import { providers } from "@/data/providers";
import PageContainer from "@/components/PageContainer";

export default function WomenPage() {
  const filtered = providers.filter(p =>
    p.specialties.some(s => s.toLowerCase().includes("companion"))
  );

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold text-white mb-6">Women</h1>
      <ProviderGrid providers={filtered} />
    </PageContainer>
  );
}
