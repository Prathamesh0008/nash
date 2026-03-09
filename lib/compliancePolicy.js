function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

function normalizeLower(value = "") {
  return String(value || "").trim().toLowerCase();
}

function parseList(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((row) => normalizeLower(row)).filter(Boolean))];
  }
  return [...new Set(String(value || "").split(",").map((row) => normalizeLower(row)).filter(Boolean))];
}

function parseCategoryMap(value = "") {
  const map = {};
  const chunks = String(value || "")
    .split(";")
    .map((row) => row.trim())
    .filter(Boolean);
  for (const chunk of chunks) {
    const [key, rawCategories] = chunk.split("=");
    const normalizedKey = normalizeLower(key);
    if (!normalizedKey) continue;
    map[normalizedKey] = parseList(String(rawCategories || "").replaceAll("|", ","));
  }
  return map;
}

function parseJsonPolicy() {
  const raw = String(process.env.GEO_POLICY_JSON || "").trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function getGeoCompliancePolicy() {
  const jsonPolicy = parseJsonPolicy();
  return {
    enabled: toBool(process.env.COMPLIANCE_ENFORCE_GEO_POLICY, true),
    blockedCities: parseList(jsonPolicy.blockedCities || process.env.COMPLIANCE_BLOCKED_CITIES || ""),
    blockedStates: parseList(jsonPolicy.blockedStates || process.env.COMPLIANCE_BLOCKED_STATES || ""),
    blockedPincodes: parseList(jsonPolicy.blockedPincodes || process.env.COMPLIANCE_BLOCKED_PINCODES || ""),
    allowedCities: parseList(jsonPolicy.allowedCities || process.env.COMPLIANCE_ALLOWED_CITIES || ""),
    allowedStates: parseList(jsonPolicy.allowedStates || process.env.COMPLIANCE_ALLOWED_STATES || ""),
    blockedCategoriesGlobal: parseList(
      jsonPolicy.blockedCategoriesGlobal || process.env.COMPLIANCE_BLOCKED_CATEGORIES || ""
    ),
    blockedCategoryByCity: {
      ...parseCategoryMap(process.env.COMPLIANCE_BLOCKED_CATEGORY_BY_CITY || ""),
      ...(jsonPolicy.blockedCategoryByCity || {}),
    },
    blockedCategoryByState: {
      ...parseCategoryMap(process.env.COMPLIANCE_BLOCKED_CATEGORY_BY_STATE || ""),
      ...(jsonPolicy.blockedCategoryByState || {}),
    },
  };
}

export function evaluateGeoPolicy({ address = {}, serviceCategory = "" } = {}) {
  const policy = getGeoCompliancePolicy();
  if (!policy.enabled) {
    return { allowed: true, code: "policy_disabled", reason: "" };
  }

  const city = normalizeLower(address.city);
  const state = normalizeLower(address.state);
  const pincode = normalizeLower(address.pincode);
  const category = normalizeLower(serviceCategory);

  if (pincode && policy.blockedPincodes.includes(pincode)) {
    return {
      allowed: false,
      code: "blocked_pincode",
      reason: "Bookings are not allowed in the selected pincode.",
    };
  }
  if (city && policy.blockedCities.includes(city)) {
    return {
      allowed: false,
      code: "blocked_city",
      reason: "Bookings are currently restricted in the selected city.",
    };
  }
  if (state && policy.blockedStates.includes(state)) {
    return {
      allowed: false,
      code: "blocked_state",
      reason: "Bookings are currently restricted in the selected state.",
    };
  }

  if (policy.allowedCities.length > 0 && city && !policy.allowedCities.includes(city)) {
    return {
      allowed: false,
      code: "city_not_allowed",
      reason: "Service is not enabled for this city.",
    };
  }
  if (policy.allowedStates.length > 0 && state && !policy.allowedStates.includes(state)) {
    return {
      allowed: false,
      code: "state_not_allowed",
      reason: "Service is not enabled for this state.",
    };
  }

  if (category) {
    const cityBlocked = policy.blockedCategoryByCity?.[city] || [];
    if (cityBlocked.includes(category)) {
      return {
        allowed: false,
        code: "category_blocked_in_city",
        reason: "Selected service category is restricted in this city.",
      };
    }
    const stateBlocked = policy.blockedCategoryByState?.[state] || [];
    if (stateBlocked.includes(category)) {
      return {
        allowed: false,
        code: "category_blocked_in_state",
        reason: "Selected service category is restricted in this state.",
      };
    }
    if (policy.blockedCategoriesGlobal.includes(category)) {
      return {
        allowed: false,
        code: "category_globally_blocked",
        reason: "Selected service category is restricted by platform policy.",
      };
    }
  }

  return { allowed: true, code: "allowed", reason: "" };
}
