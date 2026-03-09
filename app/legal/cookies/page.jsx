const sections = [
  {
    title: "1. Why Cookies Are Used",
    points: [
      "Cookies keep sessions active and secure after login.",
      "They help remember language, basic preferences, and UI settings.",
      "Operational cookies improve chat, notifications, and performance stability.",
    ],
  },
  {
    title: "2. Cookie Types",
    points: [
      "Essential cookies: required for authentication and core platform access.",
      "Preference cookies: store selected options for a smoother user experience.",
      "Security cookies: assist fraud detection, device checks, and risk controls.",
    ],
  },
  {
    title: "3. Cookie Controls",
    points: [
      "You can clear browser cookies at any time from browser settings.",
      "Disabling essential cookies may prevent login or booking actions.",
      "Signing out invalidates active session cookies from the app side.",
    ],
  },
  {
    title: "4. Retention",
    points: [
      "Some cookies expire quickly (session cookies) while others are persistent.",
      "Retention duration depends on security and product requirements.",
      "Expired cookies are deleted automatically by the browser.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Cookie Policy</h1>
        <p className="text-sm text-slate-400">
          How cookies are used for authentication, security, and platform preferences.
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
    </section>
  );
}
