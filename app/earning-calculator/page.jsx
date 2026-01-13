import PageLayout from "@/components/PageLayout";
import EarningCalculator from "@/components/EarningCalculator";

export const generateMetadata = () => ({
  title: "Earning Calculator",
  description:
    "Estimate your potential earnings as a verified model on Elite Companions.",
  robots: {
    index: false,
    follow: false,
  },
});

export default function EarningCalculatorPage() {
  return (
    <PageLayout
      title="Earning Calculator"
      subtitle="Estimate your potential income before joining."
    >
      <EarningCalculator />
    </PageLayout>
  );
}
