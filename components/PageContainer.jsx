export default function PageContainer({ children }) {
  return (
    <main
      className="
        min-h-screen
        pt-[var(--navbar-height)]
        pb-24
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {children}
      </div>
    </main>
  );
}
