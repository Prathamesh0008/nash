import HeroBanner from "@/components/HeroBanner";
import ProviderGrid from "@/components/ProviderGrid";
import PageContainer from "@/components/PageContainer";
import { providers } from "@/data/providers";
import MembershipBenefits from "@/components/MembershipBenefits";
import TopRanked from "@/components/TopRanked";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroBanner />
      {/* <TopRanked/> */}

      <section className="py-14">
        <PageContainer>
          <h2 className="text-2xl font-semibold text-white mb-6">
            Top Providers
          </h2>

          <ProviderGrid providers={providers} />
        </PageContainer>
        <MembershipBenefits/>
      </section>
    </main>
  );
}
