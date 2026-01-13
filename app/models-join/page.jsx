import PageLayout from "@/components/PageLayout"
export const generateMetadata = () => ({
  title: "Join Our Platform",
  description:
    "Join Elite Companions as a verified model. Secure earnings and full privacy.",
  robots: {
    index: false,
    follow: false,
  },
});


export default function JoinPlatformPage() {
  return (
    <PageLayout
      title="Join Our Platform"
      subtitle="Earn securely with complete privacy."
    >
      <ul className="space-y-3 text-gray-400">
        <li>✔ Fast onboarding</li>
        <li>✔ Anonymous payouts</li>
        <li>✔ Full control over availability</li>
        <li>✔ 24/7 safety monitoring</li>
      </ul>
    </PageLayout>
  )
}
