import PageLayout from "@/components/PageLayout";

export const generateMetadata = () => ({
  title: "Models Directory",
  description:
    "Browse verified adult models available worldwide. Secure, private, and adults-only platform.",
  robots: {
    index: true,
    follow: true,
  },
});

export default function ModelsPage() {
  return (
    <PageLayout
      title="Models Directory"
      subtitle="Browse verified models available worldwide."
    >
      <p className="text-gray-400">
        Explore verified profiles. All models are 18+ and identity verified.
      </p>
    </PageLayout>
  );
}
