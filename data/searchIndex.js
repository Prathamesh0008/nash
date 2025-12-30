import { providers } from "./providers";

export const SEARCH_INDEX = [
  // ===== STATIC PAGES =====
  { label: "Home", keywords: ["home"], href: "/" },
  { label: "Women", keywords: ["women", "female", "girls"], href: "/women" },
  { label: "Men", keywords: ["men", "male"], href: "/men" },
  { label: "Couple", keywords: ["couple", "pairs"], href: "/couple" },
  { label: "Videos", keywords: ["videos", "media"], href: "/videos" },
  { label: "Support", keywords: ["help", "support"], href: "/support" },
  { label: "Premium", keywords: ["premium", "vip"], href: "/premium" },

  // ===== SERVICES =====
  { label: "Massage", keywords: ["massage", "spa", "body"], href: "/search?q=massage" },
  { label: "BDSM", keywords: ["bdsm", "fetish"], href: "/search?q=bdsm" },
  { label: "Escort", keywords: ["escort"], href: "/search?q=escort" },
  { label: "Role Play", keywords: ["roleplay", "fantasy"], href: "/search?q=role play" },

  // ===== CITIES =====
  { label: "Delhi Escorts", keywords: ["delhi"], href: "/search?q=delhi" },
  { label: "Mumbai Escorts", keywords: ["mumbai"], href: "/search?q=mumbai" },
  { label: "Bangalore Escorts", keywords: ["bangalore"], href: "/search?q=bangalore" },
];

// ===== PROVIDERS (AUTO-INJECT) =====
providers.forEach((p) => {
  SEARCH_INDEX.push({
    label: p.name,
    keywords: [
      p.name,
      p.location,
      ...(p.tags || []),
      ...(p.specialties || []),
    ],
    href: `/providers/${p.slug}`,
    type: "provider",
  });
});
