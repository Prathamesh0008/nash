import PageShell from "@/components/PageShell";

export default function PremiumPage() {
  return (
    <PageShell>
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Premium Access</h1>
        <p className="text-white/60 mb-6">
          Unlock verified companions and exclusive services.
        </p>
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-semibold">
          Upgrade Now
        </button>
      </section>
    </PageShell>
  );
}
