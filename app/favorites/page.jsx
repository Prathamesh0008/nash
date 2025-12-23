"use client";

import PageWrapper from "@/components/PageWrapper";

export default function FavoritesPage() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-4xl font-light mb-4">Favorites</h1>
        <p className="text-white/60">
          Your saved companions will appear here.
        </p>
      </section>
    </PageWrapper>
  );
}
