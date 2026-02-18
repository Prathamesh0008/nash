export default function PaymentsPolicyPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Payments & Refunds Policy</h1>
        <p className="text-sm text-slate-400">Booking payments, verification fee and refund handling.</p>
      </div>
      <div className="panel space-y-2 text-sm text-slate-300">
        <p>Payments can be processed via supported online methods or wallet where available.</p>
        <p>Reschedule and cancellation charges are applied as per active admin policy.</p>
        <p>Refund decisions are audited and wallet credits are recorded in transaction ledgers.</p>
      </div>
    </section>
  );
}
