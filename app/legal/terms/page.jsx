export default function TermsPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Terms of Service</h1>
        <p className="text-sm text-slate-400">Rules for customers, workers and platform usage.</p>
      </div>
      <div className="panel space-y-2 text-sm text-slate-300">
        <p>Users must provide accurate details and follow platform safety and conduct policies.</p>
        <p>Workers must complete verification before accepting jobs or buying boosts.</p>
        <p>Any fraud, abuse or repeated false reports may result in account restrictions.</p>
      </div>
    </section>
  );
}
