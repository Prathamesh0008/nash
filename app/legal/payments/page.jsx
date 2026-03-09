import Link from "next/link";

const sections = [
  {
    title: "1. Accepted Payment Methods",
    points: [
      "Payments can be made through supported online gateways and wallet balance.",
      "Available methods may vary by city, provider, and risk checks at checkout.",
      "Cash mode is allowed only where explicitly shown during booking.",
    ],
  },
  {
    title: "2. Booking Charges",
    points: [
      "Final amount may include base fee, visit fee, add-ons, taxes, and urgency charges.",
      "Price breakdown is shown before confirmation and saved with the order record.",
      "Promo or referral discounts apply only when valid at booking time.",
    ],
  },
  {
    title: "3. Refund Rules",
    points: [
      "Refund eligibility depends on booking status, cancellation timing, and policy rules.",
      "Approved refunds may be returned to original method or wallet, based on platform logic.",
      "Processing timelines depend on payment provider and banking network.",
    ],
  },
  {
    title: "4. Chargebacks And Disputes",
    points: [
      "Chargebacks with misleading claims may trigger temporary account restrictions.",
      "Users should open a support ticket before filing external disputes where possible.",
      "All dispute actions are logged for compliance and audit review.",
    ],
  },
  {
    title: "5. Fraud And Risk Controls",
    points: [
      "High-risk transactions may be blocked, held, or require additional verification.",
      "Repeated failed payment attempts can trigger temporary rate limits.",
      "The platform may reverse suspicious wallet credits pending investigation.",
    ],
  },
];

export default function PaymentsPolicyPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Payments & Refunds Policy</h1>
        <p className="text-sm text-slate-400">
          Rules for booking payments, refunds, wallet use, disputes, and fraud controls.
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
        Need clarification on a specific payment? Open a ticket from{" "}
        <Link href="/support" className="text-fuchsia-300 hover:text-fuchsia-200">
          Support
        </Link>
        .
      </div>
    </section>
  );
}
