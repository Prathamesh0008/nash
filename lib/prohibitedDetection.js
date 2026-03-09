const RULES = [
  {
    id: "underage_request",
    severity: "critical",
    block: true,
    patterns: [/\bminor\b/i, /\bunder[\s-]?age\b/i, /\bchild\b/i, /\bteen\b/i],
  },
  {
    id: "non_consent_or_force",
    severity: "critical",
    block: true,
    patterns: [/\bwithout consent\b/i, /\bforced?\b/i, /\bunconscious\b/i, /\bdrugged\b/i],
  },
  {
    id: "trafficking_signal",
    severity: "critical",
    block: true,
    patterns: [/\btraffick/i, /\bconfiscated passport\b/i, /\bcoercion\b/i],
  },
  {
    id: "illegal_substance_or_weapon",
    severity: "high",
    block: true,
    patterns: [/\b(cocaine|heroin|meth|illegal drug)\b/i, /\bweapon\b/i],
  },
  {
    id: "off_platform_or_cash_risk",
    severity: "medium",
    block: false,
    patterns: [/\bcash only\b/i, /\boff[-\s]?platform\b/i, /\btelegram\b/i, /\bcontact direct\b/i],
  },
];

const SEVERITY_RANK = { low: 1, medium: 2, high: 3, critical: 4 };

function normalizeText(input = "") {
  return String(input || "").replace(/\s+/g, " ").trim();
}

function unique(list = []) {
  return [...new Set(list.filter(Boolean))];
}

export function scanProhibitedContent(input, context = {}) {
  const text = normalizeText(input);
  if (!text) {
    return {
      matched: false,
      shouldBlock: false,
      severity: "low",
      reasons: [],
      matchedRules: [],
      context,
    };
  }

  const matchedRules = RULES.filter((rule) => rule.patterns.some((pattern) => pattern.test(text)));
  if (matchedRules.length === 0) {
    return {
      matched: false,
      shouldBlock: false,
      severity: "low",
      reasons: [],
      matchedRules: [],
      context,
    };
  }

  const shouldBlock = matchedRules.some((rule) => rule.block);
  const severity = matchedRules.reduce(
    (best, rule) => (SEVERITY_RANK[rule.severity] > SEVERITY_RANK[best] ? rule.severity : best),
    "low"
  );

  return {
    matched: true,
    shouldBlock,
    severity,
    reasons: unique(matchedRules.map((rule) => rule.id)),
    matchedRules: matchedRules.map((rule) => ({
      id: rule.id,
      severity: rule.severity,
      block: rule.block,
    })),
    context,
  };
}
