import Link from "next/link";

export default async function LegacyProviderRoute({ params }) {
  const resolved = await params;
  const slug = Array.isArray(resolved?.slug) ? resolved.slug[0] : resolved?.slug || "";

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 text-center">
        <h1 className="text-2xl font-semibold text-white">Profile moved</h1>
        <p className="mt-2 text-sm text-slate-300">
          This old provider link is no longer active. Please continue to the live therapists directory.
        </p>
        {slug ? (
          <p className="mt-3 text-xs text-slate-500">Legacy slug: {slug}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/workers"
            className="rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Browse Therapists
          </Link>
          <Link
            href="/search"
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100"
          >
            Search Services
          </Link>
        </div>
      </div>
    </section>
  );
}
