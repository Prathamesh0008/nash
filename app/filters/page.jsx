import PageShell from "@/components/PageShell";

export const metadata = {
  title: "Filters | Valentina's",
};

export default function FiltersPage() {
  return (
    <PageShell>
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold">Advanced Filters</h1>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-semibold mb-2">Category</h3>
            <p className="text-sm text-white/60">
              BDSM, Escort, Massage, Fetish…
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-semibold mb-2">Region</h3>
            <p className="text-sm text-white/60">
              Germany, France, Italy…
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-semibold mb-2">Price</h3>
            <p className="text-sm text-white/60">
              Hourly / Premium range
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
