export default function Filters({ filters, setFilters }) {
  function update(key, val) {
    setFilters((prev) => ({
      ...prev,
      [key]: val === "" ? "" : val,
    }));
  }

  function resetFilters() {
    setFilters({
      q: "",
      city: "",
      service: "",
      minPrice: "",
      maxPrice: "",
      rating: "",
      emergency: false,
      sort: "",
    });
  }

  const inputClass =
    "w-full rounded-xl bg-black/40 border border-white/20 px-3 py-2.5 text-sm placeholder:text-white/50 focus:outline-none focus:border-pink-500/70";

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 space-y-4 h-fit">
      <h2 className="font-semibold text-lg">Filters</h2>

      <input
        placeholder="Search name, service, city..."
        className={inputClass}
        value={filters.q || ""}
        onChange={(e) => update("q", e.target.value)}
      />

      <input
        placeholder="City"
        className={inputClass}
        value={filters.city || ""}
        onChange={(e) => update("city", e.target.value)}
      />

      <input
        placeholder="Worker type (All-Rounder)"
        className={inputClass}
        value={filters.service || ""}
        onChange={(e) => update("service", e.target.value)}
      />

      <div className="flex gap-2">
        <input
          placeholder="Min Price"
          type="number"
          className={inputClass}
          value={filters.minPrice || ""}
          onChange={(e) => update("minPrice", e.target.value)}
        />
        <input
          placeholder="Max Price"
          type="number"
          className={inputClass}
          value={filters.maxPrice || ""}
          onChange={(e) => update("maxPrice", e.target.value)}
        />
      </div>

      <select
        className={inputClass}
        value={filters.rating || ""}
        onChange={(e) => update("rating", e.target.value)}
      >
        <option value="">Rating</option>
        <option value="4">4 and above</option>
        <option value="3">3 and above</option>
      </select>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          checked={!!filters.emergency}
          onChange={(e) => update("emergency", e.target.checked)}
          className="h-4 w-4 rounded border-white/30 bg-black/30"
        />
        Emergency Available
      </label>

      <select
        className={inputClass}
        value={filters.sort || ""}
        onChange={(e) => update("sort", e.target.value)}
      >
        <option value="">Sort</option>
        <option value="rating">Top Rated</option>
        <option value="priceLow">Lowest Price</option>
        <option value="priceHigh">Highest Price</option>
      </select>

      <button
        onClick={resetFilters}
        className="w-full rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 py-2.5 text-sm transition-colors"
      >
        Reset Filters
      </button>
    </aside>
  );
}
