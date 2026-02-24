import Link from "next/link";

const LAST_UPDATED = "February 18, 2026";

const sections = [
  {
    title: "1. Acceptance Of Terms",
    points: [
      "By creating an account, accessing, or using Nash Wellness, you agree to these Terms & Conditions.",
      "If you do not agree, you must stop using the platform and related services.",
      "These terms apply to customers, workers, and any person using Nash Wellness features.",
    ],
  },
  {
    title: "2. Eligibility And Accounts",
    points: [
      "You must provide accurate information during signup, booking, and profile updates.",
      "You are responsible for account security, device safety, and all activities under your account.",
      "Nash Wellness may suspend accounts with false identity, fraud signals, or policy breaches.",
    ],
  },
  {
    title: "3. Platform Scope",
    points: [
      "Nash Wellness is a platform for booking wellness, massage, and spa home services.",
      "Service availability depends on city coverage, worker verification, slot timing, and operational limits.",
      "Estimated arrival times and assignment speed are dynamic and may change due to traffic or demand.",
    ],
  },
  {
    title: "4. Bookings And Assignment",
    points: [
      "A booking request is confirmed only after successful validation and system acceptance.",
      "Worker assignment may be manual or automatic based on area fit, availability, and policy rules.",
      "Users must provide correct service address, contact details, and access instructions.",
    ],
  },
  {
    title: "5. Pricing And Payments",
    points: [
      "All charges are displayed in-app, including base fee, visit fee, add-ons, taxes, and policy charges.",
      "Payment may be processed via supported online providers, wallet, or approved methods shown at checkout.",
      "Platform may block or reverse suspicious transactions as part of fraud prevention and compliance checks.",
    ],
  },
  {
    title: "6. Cancellation, Reschedule, Refunds",
    points: [
      "Reschedule and cancellation outcomes follow the active policy configured on the platform.",
      "Refund timelines depend on payment method, provider processing windows, and dispute review outcomes.",
      "Repeated abuse of cancellation flows, false claims, or payment chargeback misuse can lead to restrictions.",
    ],
  },
  {
    title: "7. Safety And Conduct",
    points: [
      "Users and workers must maintain safe, respectful, and lawful behavior during all interactions.",
      "Harassment, threats, discrimination, or requests for illegal activity are strictly prohibited.",
      "If safety is at risk, Nash Wellness may pause the job, lock accounts, and preserve records for review.",
    ],
  },
  {
    title: "8. Worker Obligations",
    points: [
      "Workers must complete onboarding, document verification, and platform compliance before going live.",
      "Workers must maintain accurate service area, schedule, pricing, and profile details.",
      "No-show, misrepresentation, repeated poor conduct, or policy violations may trigger penalties or deactivation.",
    ],
  },
  {
    title: "9. Communication And Content",
    points: [
      "Chat and support channels are provided for service coordination and platform support.",
      "Nash Wellness may retain communication records for quality, safety, fraud checks, and legal requirements.",
      "Users must not upload or send abusive, unlawful, or infringing content.",
    ],
  },
  {
    title: "10. Prohibited Activities",
    points: [
      "Account sharing, identity spoofing, scraping, bot abuse, payment abuse, or manipulation of ranking systems.",
      "Attempting to bypass platform controls, security checks, or audit logs.",
      "Using the platform for any activity that violates applicable law or third-party rights.",
    ],
  },
  {
    title: "11. Suspension And Termination",
    points: [
      "Nash Wellness may suspend, restrict, or terminate access for policy, legal, or risk-related reasons.",
      "Outstanding dues, penalties, open disputes, or compliance obligations may survive account closure.",
      "We may retain required records for legal, financial, and anti-fraud obligations.",
    ],
  },
  {
    title: "12. Liability Limitation",
    points: [
      "Service timelines, worker availability, and technical uptime are provided on a best-effort basis.",
      "Nash Wellness is not liable for indirect, incidental, consequential, or punitive damages.",
      "Maximum liability, where legally permitted, is limited to amounts paid for the relevant booking.",
    ],
  },
  {
    title: "13. Governing Law And Disputes",
    points: [
      "These Terms are governed by applicable laws of India unless mandatory law requires otherwise.",
      "Disputes should first be raised through in-app support for resolution.",
      "Unresolved disputes are subject to jurisdiction as per applicable law and policy.",
    ],
  },
  {
    title: "14. Updates To Terms",
    points: [
      "Nash Wellness may update these Terms to reflect operational, legal, or security changes.",
      "The updated version becomes effective when published on this page.",
      "Continued platform use after updates means you accept the revised Terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Terms & Conditions</h1>
        <p className="mt-1 text-sm text-slate-400">
          Rules and legal conditions for customers, workers, and platform usage.
        </p>
        <p className="mt-2 text-xs text-slate-500">Last updated: {LAST_UPDATED}</p>
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
        For policy clarifications, raise a ticket from the <Link href="/support" className="text-fuchsia-300 hover:text-fuchsia-200">Support</Link> page.
      </div>
    </section>
  );
}
