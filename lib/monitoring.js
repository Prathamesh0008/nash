export async function sendAlert({ level = "error", title = "", message = "", meta = {} }) {
  const webhook = process.env.ALERT_WEBHOOK_URL || "";
  if (!webhook) return;

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level,
        title,
        message,
        meta,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Avoid alert loop failures from crashing app
  }
}

export async function logError(context, error, meta = {}) {
  const message = error instanceof Error ? error.message : String(error || "Unknown error");
  const stack = error instanceof Error ? error.stack || "" : "";
  console.error(`[${context}]`, message, meta, stack);
  await sendAlert({
    level: "error",
    title: `Error in ${context}`,
    message,
    meta: { ...meta, stack: stack ? stack.split("\n").slice(0, 8).join("\n") : "" },
  });
}
