import Link from "next/link";

const LAST_UPDATED = "February 18, 2026";

const sections = [
  {
    title: "1. Scope Of This Policy",
    points: [
      "This Privacy Policy explains how Nash Wellness collects, uses, stores, and protects personal data.",
      "It applies to customers, workers, and visitors using our website, apps, APIs, support, and chat features.",
      "By using Nash Wellness, you agree to the data practices described in this policy.",
    ],
  },
  {
    title: "2. Information We Collect",
    points: [
      "Account data: name, email, phone number, role, login details, and profile preferences.",
      "Booking data: service selection, address, slot timing, notes, order history, and status timeline.",
      "Payment data: transaction identifiers, payment status, refund status, wallet entries, and invoices.",
      "Communication data: support tickets, in-app chat messages, and notification records.",
      "Worker data: onboarding details, service areas, pricing, documents, verification status, and performance metrics.",
      "Device/technical data: IP, browser, logs, and operational telemetry used for security and reliability.",
    ],
  },
  {
    title: "3. How We Use Information",
    points: [
      "To create and manage accounts, verify identity, and operate secure login sessions.",
      "To process bookings, match workers, track service status, and provide live operational updates.",
      "To process payments, refunds, wallet adjustments, and financial reconciliation.",
      "To deliver support, send alerts/notifications, and resolve disputes.",
      "To detect fraud, abuse, policy violations, and suspicious activity.",
      "To improve service quality, platform safety, ranking logic, and product performance.",
    ],
  },
  {
    title: "4. Legal Basis And Compliance",
    points: [
      "We process data to perform contractual service obligations, operate the platform, and enforce policies.",
      "Processing may also occur for legal compliance, fraud prevention, and legitimate operational interests.",
      "Where required by law, we rely on user consent for specific processing activities.",
    ],
  },
  {
    title: "5. Location And Address Data",
    points: [
      "Address and optional geolocation are used for service-area matching, ETA estimation, and assignment quality.",
      "Location access is optional where supported; some features may be limited if permission is denied.",
      "We store only necessary location-related data needed for service delivery and audit trails.",
    ],
  },
  {
    title: "6. Chat, Calls, And Support Records",
    points: [
      "In-app chat and support records may be stored to provide customer service, dispute handling, and abuse prevention.",
      "We may review communication metadata and content when investigating fraud, safety, or legal complaints.",
      "Do not share sensitive payment credentials or unrelated personal secrets in chat.",
    ],
  },
  {
    title: "7. Payments And Financial Data",
    points: [
      "Online payments are processed through supported payment providers and platform payment APIs.",
      "Nash Wellness stores payment references and status data; full card credentials are not stored by us unless legally required.",
      "Refund, chargeback, and wallet records are retained for audit, taxation, and compliance obligations.",
    ],
  },
  {
    title: "8. Data Sharing",
    points: [
      "We share limited data with workers/customers as needed to fulfill confirmed bookings and contact rules.",
      "We share necessary data with payment providers, infrastructure vendors, communication services, and fraud/security systems.",
      "We may disclose data when required by law, court order, regulator request, or lawful investigation.",
      "We do not sell personal data as part of our core business model.",
    ],
  },
  {
    title: "9. Data Retention",
    points: [
      "We retain data for as long as needed to operate services, resolve disputes, enforce policies, and meet legal requirements.",
      "Retention periods vary by category: account, booking, tax/payment, support, and compliance records.",
      "When data is no longer required, it is deleted, anonymized, or archived according to policy and legal limits.",
    ],
  },
  {
    title: "10. Security Controls",
    points: [
      "We apply technical and organizational safeguards including access controls, audit logging, and secure development practices.",
      "No system is 100% risk-free; users should protect credentials and report suspicious activity immediately.",
      "If a security incident occurs, we will respond based on severity and legal notification obligations.",
    ],
  },
  {
    title: "11. User Rights And Choices",
    points: [
      "You may request access, correction, or update of your account data where supported by law.",
      "You may request account closure or deletion subject to legal retention and ongoing dispute/payment obligations.",
      "You can manage notification preferences, saved addresses, favorites, and related profile settings in-app.",
    ],
  },
  {
    title: "12. Children And Restricted Use",
    points: [
      "Our services are not intended for minors who are not legally eligible to use the platform.",
      "If we become aware of unauthorized minor data, we will take appropriate removal or restriction actions.",
    ],
  },
  {
    title: "13. International Access",
    points: [
      "If you access Nash Wellness from outside primary operating regions, local laws may differ.",
      "By using the platform, you understand your data may be processed in jurisdictions where our services operate.",
    ],
  },
  {
    title: "14. Policy Updates",
    points: [
      "We may update this Privacy Policy to reflect legal, technical, or business changes.",
      "Updated versions become effective when posted on this page with a revised " + "Last updated" + " date.",
      "Continued use after updates means you accept the revised policy.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="mt-1 text-sm text-slate-400">
          How Nash Wellness handles personal data for bookings, chat, payments, and worker operations.
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
        For privacy requests or data-related support, raise a ticket from <Link href="/support" className="text-fuchsia-300 hover:text-fuchsia-200">Support</Link>. You can also review our <Link href="/legal/cookies" className="text-fuchsia-300 hover:text-fuchsia-200">Cookie Policy</Link> and <Link href="/legal/terms" className="text-fuchsia-300 hover:text-fuchsia-200">Terms & Conditions</Link>.
      </div>
    </section>
  );
}
