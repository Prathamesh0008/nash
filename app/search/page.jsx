import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<section className="mx-auto max-w-7xl px-4 py-16 text-sm text-slate-400">Loading search...</section>}>
      <SearchClient />
    </Suspense>
  );
}
