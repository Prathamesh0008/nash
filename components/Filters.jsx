export default function Filters({ filters, setFilters }) {
  function update(key, val) {
    setFilters((f) => ({
      ...f,
      [key]: val === "" ? "" : val,
    }));
  }

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-white">
      <h2 className="font-semibold text-lg">Filters</h2>

      {/* 🔍 GLOBAL SEARCH */}
      <input
        placeholder="Search name, service, city..."
        className="w-full border rounded p-2"
        value={filters.q || ""}
        onChange={(e) => update("q", e.target.value)}
      />

      {/* CITY */}
      <input
        placeholder="City"
        className="w-full border rounded p-2"
        value={filters.city || ""}
        onChange={(e) => update("city", e.target.value)}
      />

      {/* SERVICE */}
      <input
        placeholder="Service (Plumber, Electrician)"
        className="w-full border rounded p-2"
        value={filters.service || ""}
        onChange={(e) => update("service", e.target.value)}
      />

      {/* PRICE RANGE */}
      <div className="flex gap-2">
        <input
          placeholder="Min ₹"
          type="number"
          className="w-full border rounded p-2"
          value={filters.minPrice || ""}
          onChange={(e) => update("minPrice", e.target.value)}
        />
        <input
          placeholder="Max ₹"
          type="number"
          className="w-full border rounded p-2"
          value={filters.maxPrice || ""}
          onChange={(e) => update("maxPrice", e.target.value)}
        />
      </div>

      {/* RATING */}
      <select
        className="w-full border rounded p-2"
        value={filters.rating || ""}
        onChange={(e) => update("rating", e.target.value)}
      >
        <option value="">Rating</option>
        <option value="4">4★ & above</option>
        <option value="3">3★ & above</option>
      </select>

      {/* EMERGENCY */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!filters.emergency}
          onChange={(e) => update("emergency", e.target.checked)}
        />
        Emergency Available
      </label>

      {/* SORT */}
      <select
        className="w-full border rounded p-2"
        value={filters.sort || ""}
        onChange={(e) => update("sort", e.target.value)}
      >
        <option value="">Sort</option>
        <option value="rating">Top Rated</option>
        <option value="priceLow">Lowest Price</option>
        <option value="priceHigh">Highest Price</option>
      </select>

      {/* RESET */}
      <button
        onClick={() =>
          setFilters({
            q: "",
            city: "",
            service: "",
            minPrice: "",
            maxPrice: "",
            rating: "",
            emergency: false,
            sort: "",
          })
        }
        className="w-full border rounded p-2 text-sm hover:bg-gray-50"
      >
        Reset Filters
      </button>
    </div>
  );
}
