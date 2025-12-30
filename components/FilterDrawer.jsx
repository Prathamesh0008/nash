"use client";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function FilterDrawer({
  open,
  onClose,
  filters,
  setFilters,
}) {
  const router = useRouter();
  if (!open) return null;

  /* ================== CONSTANTS ================== */

  const genderCategories = ["Men", "Women", "Couple"];

  const serviceCategories = [
    "BDSM",
    "Escort",
    "Massage",
    "Role Play",
    "Fetish",
    "Dominatrix",
    "Submissive",
    "Swingers",
    "Trans",
    "Gay",
    "Lesbian",
    "VIP",
    "New",
    "Popular",
  ];

  const europeanCountries = [
    "All Europe",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "United Kingdom",
    "Switzerland",
    "Austria",
    "Belgium",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Portugal",
    "Ireland",
    "Poland",
    "Czech Republic",
    "Hungary",
    "Greece",
    "Romania",
    "Bulgaria",
    "Croatia",
    "Slovakia",
    "Slovenia",
    "Lithuania",
    "Latvia",
    "Estonia",
    "Luxembourg",
  ];

  /* ================== APPLY FILTERS ================== */

  const handleApplyFilters = () => {
    const query = new URLSearchParams();

    // SERVICE categories only (exclude gender)
    const categories = filters.category.filter(
      (c) => !genderCategories.includes(c)
    );

    if (categories.length) {
      query.set("category", categories.join(","));
    }

    if (filters.country) {
      query.set("country", filters.country.toLowerCase());
    }

    if (filters.price.min > 0) {
      query.set("min", String(filters.price.min));
    }

    if (filters.price.max < 10000) {
      query.set("max", String(filters.price.max));
    }

    // Decide target page by gender
    let targetPage = "/explore";
    if (filters.category.includes("Women")) targetPage = "/women";
    else if (filters.category.includes("Men")) targetPage = "/men";
    else if (filters.category.includes("Couple")) targetPage = "/couple";

    router.push(`${targetPage}${query.toString() ? `?${query}` : ""}`);
    onClose();
  };

  /* ================== CATEGORY HANDLING ================== */

  const handleCategoryClick = (value) => {
    // ALL = reset everything
    if (value === "All") {
      setFilters({
        category: [],
        country: "",
        price: { min: 0, max: 10000 },
      });
      return;
    }

    // Gender selection (exclusive)
    if (genderCategories.includes(value)) {
      setFilters((prev) => ({
        ...prev,
        category: [
          ...prev.category.filter((c) => !genderCategories.includes(c)),
          value,
        ],
      }));
      return;
    }

    // Toggle service category
    setFilters((prev) => ({
      ...prev,
      category: prev.category.includes(value)
        ? prev.category.filter((c) => c !== value)
        : [...prev.category, value],
    }));
  };

  /* ================== CLEAR ================== */

  const handleClearFilters = () => {
    setFilters({
      category: [],
      country: "",
      price: { min: 0, max: 10000 },
    });
  };

  /* ================== UI ================== */

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full sm:w-[450px] bg-black border-l border-white/10 p-6 overflow-y-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold">Filters</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6 text-white/70 hover:text-white" />
          </button>
        </div>

        {/* GENDER */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Gender</h3>
          <div className="flex gap-2 flex-wrap">
            {["All", ...genderCategories].map((g) => (
              <button
                key={g}
                onClick={() => handleCategoryClick(g)}
                className={`px-4 py-2 rounded-lg border ${
                  filters.category.includes(g)
                    ? "bg-pink-500/20 border-pink-500/40 text-pink-400"
                    : "bg-white/5 border-white/10 text-white/70"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* SERVICE CATEGORIES */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Categories</h3>
          <div className="grid grid-cols-2 gap-2">
            {serviceCategories.map((c) => (
              <button
                key={c}
                onClick={() => handleCategoryClick(c)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  filters.category.includes(c)
                    ? "bg-white/10 border-white/30"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* REGION */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Region</h3>
          <select
            value={filters.country}
            onChange={(e) =>
              setFilters((p) => ({ ...p, country: e.target.value }))
            }
            className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3"
          >
            {europeanCountries.map((c) => (
              <option key={c} value={c === "All Europe" ? "" : c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* PRICE */}
        <div className="mb-10">
          <h3 className="font-semibold mb-4">
            Price €{filters.price.min} – €{filters.price.max}
          </h3>

          <div className="flex gap-4">
            <input
              type="number"
              value={filters.price.min}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  price: { ...p.price, min: Number(e.target.value) },
                }))
              }
              className="w-1/2 bg-black/40 border border-white/20 rounded-lg px-3 py-2"
              placeholder="Min"
            />
            <input
              type="number"
              value={filters.price.max}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  price: { ...p.price, max: Number(e.target.value) },
                }))
              }
              className="w-1/2 bg-black/40 border border-white/20 rounded-lg px-3 py-2"
              placeholder="Max"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="sticky bottom-0 bg-black pt-4 border-t border-white/10">
          <div className="flex gap-3">
            <button
              onClick={handleClearFilters}
              className="flex-1 py-3 rounded-xl bg-white/10"
            >
              Clear
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
