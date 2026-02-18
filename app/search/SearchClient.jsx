"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ProviderGrid from "@/components/ProviderGrid";

export default function SearchClient() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") || "";
  const city = params.get("city") || "";
  const category = params.get("category") || "";
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prefs, setPrefs] = useState({
    favoriteWorkerIds: [],
    savedSearchFilters: [],
    recentSearches: [],
  });
  const [prefMsg, setPrefMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const sp = new URLSearchParams();
        if (query.trim()) sp.set("q", query.trim());
        if (city.trim()) sp.set("city", city.trim());
        if (category.trim()) sp.set("category", category.trim());
        const res = await fetch(`/api/workers?${sp.toString()}`, { credentials: "include" });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error || "Search failed");
          setProviders([]);
          return;
        }

        const mapped = (data.workers || []).map((worker, idx) => ({
          id: String(worker.id),
          name: worker.name || "Worker",
          location: worker.serviceAreas?.[0]?.city || "Unknown location",
          rating: Number(worker.ratingAvg || 0),
          reviewsCount: Number(worker.jobsCompleted || 0),
          ratePerHour: 90 + (idx % 6) * 10,
          images: [worker.profilePhoto, ...(worker.galleryPhotos || [])].filter(Boolean),
          bio:
            worker.skills?.length > 0
              ? `All-rounder worker with strengths in ${worker.skills.slice(0, 2).join(", ")}`
              : "Verified all-rounder worker profile",
          tags: ["All-Rounder", "Verified", "Home Visit"],
          specialties: [],
          verified: worker.verificationStatus === "APPROVED",
          available: worker.isOnline !== false,
          profileHref: `/workers/${worker.id}`,
        }));
        setProviders(mapped);
      } catch {
        setError("Search failed due to network error");
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [query, city, category]);

  useEffect(() => {
    const loadPrefs = async () => {
      const res = await fetch("/api/users/preferences", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setPrefs({
          favoriteWorkerIds: data.preferences?.favoriteWorkerIds || [],
          savedSearchFilters: data.preferences?.savedSearchFilters || [],
          recentSearches: data.preferences?.recentSearches || [],
        });
      }
    };
    loadPrefs();
  }, []);

  useEffect(() => {
    const track = async () => {
      if (!query && !city && !category) return;
      await fetch("/api/users/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "trackSearch",
          search: { q: query, city, category },
        }),
      });
    };
    track();
  }, [query, city, category]);

  const saveCurrentFilter = async () => {
    if (!query && !city && !category) {
      setPrefMsg("Nothing to save");
      return;
    }
    const name = [query || "Search", city, category].filter(Boolean).join(" | ");
    const res = await fetch("/api/users/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action: "saveFilter",
        filter: { name, q: query, city, category },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setPrefMsg(data.error || "Failed to save filter");
      return;
    }
    setPrefs({
      favoriteWorkerIds: data.preferences?.favoriteWorkerIds || [],
      savedSearchFilters: data.preferences?.savedSearchFilters || [],
      recentSearches: data.preferences?.recentSearches || [],
    });
    setPrefMsg("Filter saved");
  };

  const removeSavedFilter = async (filterId) => {
    const res = await fetch("/api/users/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "removeFilter", filterId }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      setPrefs({
        favoriteWorkerIds: data.preferences?.favoriteWorkerIds || [],
        savedSearchFilters: data.preferences?.savedSearchFilters || [],
        recentSearches: data.preferences?.recentSearches || [],
      });
    }
  };

  const clearRecent = async () => {
    const res = await fetch("/api/users/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "clearRecentSearches" }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      setPrefs({
        favoriteWorkerIds: data.preferences?.favoriteWorkerIds || [],
        savedSearchFilters: data.preferences?.savedSearchFilters || [],
        recentSearches: data.preferences?.recentSearches || [],
      });
    }
  };

  const goToSearch = (row) => {
    const sp = new URLSearchParams();
    if (row.q) sp.set("q", row.q);
    if (row.city) sp.set("city", row.city);
    if (row.category) sp.set("category", row.category);
    router.push(`/search${sp.toString() ? `?${sp.toString()}` : ""}`);
  };

  const title = useMemo(() => {
    const parts = [];
    if (query) parts.push(`"${query}"`);
    if (city) parts.push(city);
    if (category) parts.push(category);
    return parts.length ? `Search Results for ${parts.join(" • ")}` : "Search Results";
  }, [query, city, category]);

  const providersWithFav = useMemo(() => {
    const favoriteIds = new Set((prefs.favoriteWorkerIds || []).map((id) => String(id)));
    return (providers || []).map((provider) => ({
      ...provider,
      isFavorite: favoriteIds.has(String(provider.id)),
    }));
  }, [providers, prefs.favoriteWorkerIds]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-6">{title}</h1>
      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Saved Filters</p>
            <button onClick={saveCurrentFilter} className="rounded bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700">Save Current</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(prefs.savedSearchFilters || []).slice(0, 8).map((row) => (
              <div key={row.filterId} className="flex items-center gap-1">
                <button onClick={() => goToSearch(row)} className="rounded bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700">
                  {row.name || [row.q, row.city, row.category].filter(Boolean).join(" | ")}
                </button>
                <button onClick={() => removeSavedFilter(row.filterId)} className="rounded bg-rose-800 px-1.5 py-1 text-xs hover:bg-rose-700">x</button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Recent Searches</p>
            <button onClick={clearRecent} className="rounded bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700">Clear</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(prefs.recentSearches || []).slice(0, 8).map((row, idx) => (
              <button key={`${row.q}-${row.city}-${row.category}-${idx}`} onClick={() => goToSearch(row)} className="rounded bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700">
                {[row.q, row.city, row.category].filter(Boolean).join(" | ") || "Recent"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {prefMsg && <p className="mb-3 text-xs text-slate-300">{prefMsg}</p>}
      {loading && <p className="mb-6 text-sm text-slate-400">Searching live workers...</p>}
      {!!error && <p className="mb-6 rounded-lg bg-rose-950 p-3 text-sm text-rose-300">{error}</p>}

      {!loading && !error && providers.length > 0 ? (
        <ProviderGrid providers={providersWithFav} />
      ) : (
        !loading &&
        !error && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-white/60">
            No results found.
          </div>
        )
      )}
    </section>
  );
}
