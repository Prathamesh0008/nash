import Link from "next/link";

const sections = [
  {
    title: "1. Copyright Notice Requirements",
    points: [
      "Provide exact URL(s) of the allegedly infringing content.",
      "Provide proof of ownership or authorization to act on behalf of the owner.",
      "Include your legal name, contact email, and good-faith statement.",
    ],
  },
  {
    title: "2. Review Process",
    points: [
      "Notices are reviewed by moderation and compliance teams.",
      "If valid, content can be removed, hidden, or access-restricted.",
      "Account-level enforcement may be applied for repeat infringement.",
    ],
  },
  {
    title: "3. Counter-Notice",
    points: [
      "Users may submit a counter-notice if they believe removal was incorrect.",
      "Counter-notice must include legal identity and claim basis.",
      "False submissions may lead to permanent restrictions and legal escalation.",
    ],
  },
];

export default function DmcaPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">DMCA & Copyright Policy</h1>
        <p className="text-sm text-slate-400">
          Process for copyright notices, takedowns, and counter-notices.
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
        Submit notices via{" "}
        <Link href="/support" className="text-fuchsia-300 hover:text-fuchsia-200">
          Support
        </Link>{" "}
        with category `legal` and all required evidence.
      </div>
    </section>
  );
}
