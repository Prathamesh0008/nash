export function getReportSeverity(category, message) {
  if (category === "safety" || category === "fraud") return "high";
  if (message.length > 500) return "high";
  if (category === "misbehavior" || category === "payment") return "medium";
  return "low";
}