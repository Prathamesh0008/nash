export default function CookiesPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Cookie Policy</h1>
        <p className="text-sm text-slate-400">How session and preference cookies are used.</p>
      </div>
      <div className="panel space-y-2 text-sm text-slate-300">
        <p>Authentication cookies keep users signed in securely using access and refresh tokens.</p>
        <p>Operational cookies are used to improve performance, notifications and chat experience.</p>
        <p>Users can sign out to invalidate active session cookies.</p>
      </div>
    </section>
  );
}
