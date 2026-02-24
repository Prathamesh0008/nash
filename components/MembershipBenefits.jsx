import { CheckCircle, Clock3, ShieldCheck, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Sparkles,
    title: "Priority Booking",
    description: "Get faster slot confirmation for high-demand service windows.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Support",
    description: "Dedicated customer support for booking, reschedule, and refund help.",
  },
  {
    icon: Clock3,
    title: "Lower Wait Time",
    description: "Access quicker therapist assignment in supported service areas.",
  },
  {
    icon: CheckCircle,
    title: "Member Perks",
    description: "Enjoy plan-based discounts, referral rewards, and loyalty credits.",
  },
];

export default function MembershipBenefits() {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <h2 className="text-xl font-semibold text-white">Membership Benefits</h2>
        <p className="mt-1 text-sm text-slate-400">
          Designed for frequent wellness bookings with predictable savings and faster service.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {benefits.map((item) => (
          <article key={item.title} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
            <item.icon className="h-5 w-5 text-fuchsia-300" />
            <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-xs text-slate-400">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
