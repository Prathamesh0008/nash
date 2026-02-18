const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";

function fail(message, details = "") {
  console.error(`[FAIL] ${message}${details ? `: ${details}` : ""}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

class CookieClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cookies = new Map();
  }

  cookieHeader() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  captureSetCookie(headers) {
    const values = headers.getSetCookie?.() || [];
    values.forEach((raw) => {
      const pair = raw.split(";")[0];
      const [name, value] = pair.split("=");
      if (name && value) this.cookies.set(name.trim(), value.trim());
    });
  }

  async request(path, { method = "GET", body, headers = {} } = {}) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(this.cookies.size ? { Cookie: this.cookieHeader() } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    this.captureSetCookie(res.headers);
    const data = await res.json().catch(() => ({}));
    return { res, data };
  }
}

async function main() {
  console.log(`[INFO] Base URL: ${BASE_URL}`);
  const client = new CookieClient(BASE_URL);

  const uniq = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const email = `e2e_user_${uniq}@example.com`;
  const password = "User@123";

  const signup = await client.request("/api/auth/signup", {
    method: "POST",
    body: {
      name: `E2E User ${uniq}`,
      email,
      phone: "9999999999",
      role: "user",
      gender: "other",
      password,
    },
  });
  if (!signup.res.ok || !signup.data.ok) fail("Signup failed", signup.data.error || signup.res.statusText);
  pass("Signup completed");

  const services = await client.request("/api/services");
  if (!services.res.ok || !services.data.ok || !(services.data.services || []).length) {
    fail("Services unavailable", services.data.error || "No active services");
  }
  const service = services.data.services[0];
  pass("Service list loaded");

  const workers = await client.request("/api/workers");
  if (!workers.res.ok || !workers.data.ok || !(workers.data.workers || []).length) {
    fail("Workers unavailable", workers.data.error || "No workers");
  }
  const worker = workers.data.workers[0];
  pass("Workers list loaded");

  const workerCategories = Array.isArray(worker.categories)
    ? worker.categories.map((row) => String(row || "").trim().toLowerCase()).filter(Boolean)
    : [];
  const matchedService =
    (services.data.services || []).find((item) =>
      workerCategories.includes(String(item?.category || "").trim().toLowerCase())
    ) || service;

  const primaryArea = Array.isArray(worker.serviceAreas) && worker.serviceAreas.length > 0
    ? worker.serviceAreas[0]
    : null;
  const bookingCity = String(primaryArea?.city || "Navi Mumbai");
  const bookingPincode = String(primaryArea?.pincode || "400706");

  const now = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const booking = await client.request("/api/bookings", {
    method: "POST",
    body: {
      serviceId: matchedService._id,
      address: {
        line1: "E2E Street 1",
        line2: "",
        landmark: "Near Test Mall",
        city: bookingCity,
        state: "MH",
        pincode: bookingPincode,
      },
      slotTime: now,
      notes: "E2E booking",
      addons: [],
      paymentMethod: "online",
      assignmentMode: "manual",
      manualWorkerId: worker.id,
      images: [],
    },
    headers: {
      "x-idempotency-key": `e2e_${uniq}`,
    },
  });
  if (!booking.res.ok || !booking.data.ok || !booking.data.booking?._id) {
    fail("Booking creation failed", booking.data.error || booking.res.statusText);
  }
  const bookingId = booking.data.booking._id;
  pass("Booking created");

  const payCreate = await client.request("/api/payments/create", {
    method: "POST",
    body: {
      type: "booking",
      amount: 99,
      bookingId,
      workerId: worker.id,
      metadata: { source: "e2e" },
    },
  });
  if (!payCreate.res.ok || !payCreate.data.ok || !payCreate.data.payment?._id) {
    fail("Payment create failed", payCreate.data.error || payCreate.res.statusText);
  }
  const paymentId = payCreate.data.payment._id;
  pass("Payment order created");

  const payVerify = await client.request("/api/payments/verify", {
    method: "POST",
    body: {
      paymentId,
      paymentToken: `demo_tok_${uniq}`,
      provider: "demo",
    },
  });
  if (!payVerify.res.ok || !payVerify.data.ok) {
    fail("Payment verify failed", payVerify.data.error || payVerify.res.statusText);
  }
  pass("Payment verified");

  const orders = await client.request("/api/bookings/me");
  if (!orders.res.ok || !orders.data.ok) fail("Order fetch failed", orders.data.error || orders.res.statusText);
  const hasOrder = (orders.data.bookings || []).some((item) => item._id === bookingId);
  if (!hasOrder) fail("Created booking missing from /api/bookings/me");
  pass("Order retrieval passed");

  const convo = await client.request("/api/chat/conversation", {
    method: "POST",
    body: { bookingId, workerUserId: worker.id },
  });
  if (!convo.res.ok || !convo.data.ok || !convo.data.conversationId) {
    fail("Conversation create failed", convo.data.error || convo.res.statusText);
  }
  const conversationId = convo.data.conversationId;
  pass("Conversation created");

  const message = await client.request("/api/chat/message", {
    method: "POST",
    body: {
      conversationId,
      text: "E2E smoke message",
    },
  });
  if (!message.res.ok || !message.data.ok) fail("Chat message failed", message.data.error || message.res.statusText);
  pass("Chat message sent");

  console.log("[SUMMARY] Critical E2E flow passed: signup -> booking -> payment -> order -> chat");
}

main().catch((error) => fail("E2E script crashed", error?.message || String(error)));
