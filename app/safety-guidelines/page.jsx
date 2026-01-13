import PageLayout from "@/components/PageLayout"

export default function SafetyGuidelinesPage() {
  return (
    <PageLayout title="Safety Guidelines">
      <ul className="space-y-3 text-gray-400">
        <li>✔ Identity verification</li>
        <li>✔ Encrypted messaging</li>
        <li>✔ Zero-tolerance abuse policy</li>
        <li>✔ Manual moderation team</li>
      </ul>
    </PageLayout>
  )
}
