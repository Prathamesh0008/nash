export default function PageLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <section className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold mb-3">{title}</h1>
          {subtitle && (
            <p className="text-gray-400 max-w-2xl">{subtitle}</p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {children}
      </section>
    </main>
  )
}
