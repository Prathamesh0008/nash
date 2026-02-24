import Link from "next/link";
import { HelpCircle, MessageCircle, ShieldCheck, Wallet, CalendarClock, UserCheck } from "lucide-react";

const faqGroups = [
  {
    title: "Booking",
    icon: CalendarClock,
    items: [
      {
        q: "How do I book a therapist?",
        a: "Open Services or Workers, choose a therapist/service, select date-time, add address, and confirm booking.",
      },
      {
        q: "Can I choose a specific worker?",
        a: "Yes. If a worker profile is selected, booking tries strict assignment first. If unavailable, you can allow alternate assignment.",
      },
      {
        q: "Why was my slot changed or delayed?",
        a: "Slot updates may happen due to worker availability, route conditions, safety checks, or high demand in your area.",
      },
      {
        q: "How does live tracking work?",
        a: "For active jobs, tracking shows worker location updates, status freshness, ETA, and route movement until arrival.",
      },
    ],
  },
  {
    title: "Payments",
    icon: Wallet,
    items: [
      {
        q: "Which payment methods are supported?",
        a: "Supported methods are shown at checkout and can include online payment, wallet, and approved alternatives.",
      },
      {
        q: "How are refunds processed?",
        a: "Refund outcomes depend on cancellation/reschedule policy and payment status. Approved refunds are tracked in your account records.",
      },
      {
        q: "Where can I see invoices or payment status?",
        a: "Open Orders and order details to view payment state, amount breakdown, and related transaction information.",
      },
      {
        q: "Can I use promo or referral code?",
        a: "Yes. You can apply valid promo/referral codes during booking where eligible.",
      },
    ],
  },
  {
    title: "Workers",
    icon: UserCheck,
    items: [
      {
        q: "How do workers become verified?",
        a: "Workers complete onboarding, upload required documents, and pass verification review before going live.",
      },
      {
        q: "Can I contact worker directly?",
        a: "Direct contact may be restricted until policy conditions are met. Use in-app chat for safe communication.",
      },
      {
        q: "Why does worker availability change quickly?",
        a: "Availability is live and can change with active jobs, blocked slots, area constraints, or online/offline status updates.",
      },
    ],
  },
  {
    title: "Safety & Account",
    icon: ShieldCheck,
    items: [
      {
        q: "How do I report abuse or suspicious activity?",
        a: "Use Support or Report flows from your account/order page. Include clear details for faster review.",
      },
      {
        q: "How is my data used?",
        a: "Data is used for booking operations, safety, fraud prevention, payment processing, and support as explained in Privacy Policy.",
      },
      {
        q: "What if I cannot log in?",
        a: "Try OTP/password recovery, then contact Support if issue continues.",
      },
      {
        q: "Can I delete my account?",
        a: "You can request account closure through Support. Some records may be retained for legal and financial compliance.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-4">
      <div className="panel">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-fuchsia-300" />
          <h1 className="text-2xl font-semibold">Frequently Asked Questions</h1>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Quick answers for booking, payments, live tracking, worker profiles, and account support.
        </p>
      </div>

      {faqGroups.map((group) => (
        <article key={group.title} className="panel space-y-3">
          <div className="flex items-center gap-2">
            <group.icon className="h-4 w-4 text-fuchsia-300" />
            <h2 className="text-base font-semibold text-slate-100">{group.title}</h2>
          </div>

          <div className="space-y-2">
            {group.items.map((row) => (
              <details key={row.q} className="rounded-xl border border-white/10 bg-slate-900/50 p-3">
                <summary className="cursor-pointer list-none text-sm font-medium text-slate-100">{row.q}</summary>
                <p className="mt-2 text-sm text-slate-300">{row.a}</p>
              </details>
            ))}
          </div>
        </article>
      ))}

      <div className="panel flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-300">Didn&apos;t find your answer?</p>
        <div className="flex items-center gap-2">
          <Link href="/support" className="inline-flex items-center gap-1 rounded-lg bg-fuchsia-600 px-3 py-2 text-xs font-semibold text-white hover:bg-fuchsia-500">
            <MessageCircle className="h-3.5 w-3.5" />
            Contact Support
          </Link>
          <Link href="/legal/terms" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100">
            Terms
          </Link>
        </div>
      </div>
    </section>
  );
}
