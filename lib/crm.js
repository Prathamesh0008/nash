import CrmTemplate from "@/models/CrmTemplate";
import CrmMessageLog from "@/models/CrmMessageLog";
import User from "@/models/User";

const DEFAULT_TEMPLATES = {
  booking_created_user: {
    email: {
      subject: "Booking {{bookingId}} confirmed",
      body: "Hi {{name}}, your booking for {{service}} is confirmed for {{slotTime}}.",
    },
    sms: {
      body: "Booking {{bookingId}} confirmed for {{service}} at {{slotTime}}.",
    },
    whatsapp: {
      body: "Hello {{name}}, booking {{bookingId}} confirmed. Service: {{service}}, Slot: {{slotTime}}.",
    },
  },
  booking_created_worker: {
    email: {
      subject: "New job assigned: {{bookingId}}",
      body: "Hi {{name}}, you have a new {{service}} booking at {{slotTime}}.",
    },
    sms: {
      body: "New {{service}} job assigned. Booking {{bookingId}} at {{slotTime}}.",
    },
    whatsapp: {
      body: "You have a new booking {{bookingId}} for {{service}} at {{slotTime}}.",
    },
  },
  worker_verification_update: {
    email: {
      subject: "Worker verification update: {{statusLabel}}",
      body: "Hi {{name}}, your worker verification status is {{statusLabel}}. {{reason}}",
    },
    sms: {
      body: "Verification update: {{statusLabel}}. {{reason}}",
    },
    whatsapp: {
      body: "Hello {{name}}, your worker verification status is {{statusLabel}}. {{reason}}",
    },
  },
};

export function renderTemplate(input = "", variables = {}) {
  return String(input || "").replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    const value = variables[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export async function resolveCrmTemplate({ key, channel }) {
  const dbTemplate = await CrmTemplate.findOne({ key, channel, active: true }).lean();
  if (dbTemplate) {
    return {
      key,
      channel,
      subject: dbTemplate.subject || "",
      body: dbTemplate.body || "",
      source: "db",
    };
  }

  const fallback = DEFAULT_TEMPLATES?.[key]?.[channel];
  if (!fallback) return null;
  return {
    key,
    channel,
    subject: fallback.subject || "",
    body: fallback.body || "",
    source: "default",
  };
}

async function deliverMessage({ channel, recipient, subject, body }) {
  const webhook = process.env.CRM_WEBHOOK_URL || "";
  if (!webhook) {
    return { ok: true, provider: "console", providerMessageId: `sim_${Date.now()}` };
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel, recipient, subject, body }),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "Webhook failed");
    return { ok: false, provider: "webhook", error: errorText };
  }
  const json = await res.json().catch(() => ({}));
  return {
    ok: true,
    provider: "webhook",
    providerMessageId: String(json?.id || json?.messageId || ""),
    response: json,
  };
}

export async function sendCrmTemplate({
  templateKey,
  channel,
  userId = null,
  recipient = "",
  variables = {},
  meta = {},
}) {
  const template = await resolveCrmTemplate({ key: templateKey, channel });
  if (!template) {
    return { ok: false, error: `Template not found for ${templateKey}:${channel}` };
  }

  let to = String(recipient || "").trim();
  let user = null;
  if (!to && userId) {
    user = await User.findById(userId).select("name email phone").lean();
    if (!user) return { ok: false, error: "Recipient user not found" };
    to = channel === "email" ? String(user.email || "") : String(user.phone || "");
  }
  if (!to) return { ok: false, error: "Recipient is required" };

  const mergedVars = {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    ...variables,
  };
  const subject = renderTemplate(template.subject, mergedVars);
  const body = renderTemplate(template.body, mergedVars);

  const log = await CrmMessageLog.create({
    userId: userId || null,
    channel,
    templateKey,
    recipient: to,
    subject,
    body,
    status: "queued",
    provider: "console",
    meta: { ...meta, templateSource: template.source },
  });

  const delivered = await deliverMessage({ channel, recipient: to, subject, body });
  if (!delivered.ok) {
    log.status = "failed";
    log.error = delivered.error || "Delivery failed";
    log.provider = delivered.provider || "webhook";
    log.response = delivered.response || {};
    await log.save();
    return { ok: false, error: log.error, log };
  }

  log.status = "sent";
  log.provider = delivered.provider || "console";
  log.providerMessageId = delivered.providerMessageId || "";
  log.response = delivered.response || {};
  await log.save();
  return { ok: true, log };
}

export async function upsertCrmTemplate({ key, channel, title = "", subject = "", body = "", active = true, updatedBy = null }) {
  const doc = await CrmTemplate.findOneAndUpdate(
    { key, channel },
    { $set: { key, channel, title, subject, body, active, updatedBy } },
    { upsert: true, new: true }
  );
  return doc;
}
