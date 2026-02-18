export default function PageLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen text-white">
      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-r from-fuchsia-900/20 via-transparent to-blue-900/20">
        <div className="mx-auto max-w-[92rem] px-4 py-12 md:px-6 md:py-14">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">{title}</h1>
          {subtitle && (
            <p className="max-w-2xl text-slate-300">{subtitle}</p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[92rem] px-4 py-8 md:px-6 md:py-10">
        {children}
      </section>
    </main>
  )
}
