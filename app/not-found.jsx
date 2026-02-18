import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center text-white">
      <div className="panel max-w-xl px-6 py-10 text-center">
        <h1 className="mb-4 text-6xl font-bold">404</h1>
        <p className="mb-6 text-slate-300">The page you are looking for does not exist.</p>

        <Link href="/" className="app-btn-primary inline-block rounded-lg px-6 py-3 text-sm font-semibold">
          Go Home
        </Link>
      </div>
    </main>
  );
}
