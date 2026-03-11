export function showPopup(message, type = "info") {
  if (typeof window === "undefined") return;
  const text = String(message || "").trim();
  if (!text) return;
  window.dispatchEvent(
    new CustomEvent("app-popup", {
      detail: { message: text, type },
    })
  );
}
