import PageLayout from "@/components/PageLayout"

export default function TopModelsPage() {
  return (
    <PageLayout
      title="Top Ranked Models"
      subtitle="Highest rated companions on the platform."
    >
      <p className="text-gray-400">
        Rankings are based on engagement, reviews, and platform activity.
      </p>
    </PageLayout>
  )
}
