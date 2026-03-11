import Link from "next/link";

const sections = [
  {
    title: "1. Legal Use Only",
    points: [
      "The platform supports lawful escort and companionship bookings only.",
      "Any request for illegal activity is strictly prohibited.",
      "Accounts involved in unlawful behavior may be suspended immediately.",
    ],
  },
  {
    title: "2. 18+ Access And Verification",
    points: [
      "All users and escorts must be legally adults (18+ minimum).",
      "Identity checks and verification controls are applied during onboarding.",
      "Suspicious age or identity mismatch can trigger account review.",
    ],
  },
  {
    title: "3. Anti-Trafficking And Anti-Exploitation",
    points: [
      "Coercion, trafficking, forced activity, and exploitation are strictly banned.",
      "Any related report is escalated with highest priority to compliance.",
      "We cooperate with lawful authorities where required by law.",
    ],
  },
  {
    title: "4. In-App Safety Practices",
    points: [
      "Use in-app chat and booking flow; avoid sharing sensitive private data.",
      "Do not make off-platform payments to unknown parties.",
      "Report abusive language, threats, impersonation, or blackmail immediately.",
    ],
  },
  {
    title: "5. Emergency Guidance",
    points: [
      "For immediate physical danger, contact local emergency services first.",
      "Then raise a high-priority support ticket with booking and evidence details.",
      "The platform may freeze chats, accounts, and payouts during investigation.",
    ],
  },
];

export default function SafetyPolicyPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Safety & Compliance Policy</h1>
        <p className="text-sm text-slate-400">
          Rules for lawful usage, adult verification, anti-exploitation safeguards, and emergency handling.
        </p>
      </div>

      {sections.map((section) => (
        <article key={section.title} className="panel space-y-2">
          <h2 className="text-base font-semibold text-slate-100">{section.title}</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
            {section.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      ))}

      <div className="panel text-sm text-slate-300">
        To report a safety incident, use{" "}
        <Link href="/support" className="text-fuchsia-300 hover:text-fuchsia-200">
          Support
        </Link>{" "}
        with category `urgent`.
      </div>
    </section>
  );
}
