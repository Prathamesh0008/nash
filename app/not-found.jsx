export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-gray-400 mb-6">
          The page you’re looking for doesn’t exist.
        </p>

        <a
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-pink-600 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Go Home
        </a>
      </div>
    </main>
  )
}
