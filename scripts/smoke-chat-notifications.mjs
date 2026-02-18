#!/usr/bin/env node

const BASE_URL = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const USER_EMAIL = process.env.SMOKE_USER_EMAIL || "";
const USER_PASSWORD = process.env.SMOKE_USER_PASSWORD || "";
const WORKER_EMAIL = process.env.SMOKE_WORKER_EMAIL || "";
const WORKER_PASSWORD = process.env.SMOKE_WORKER_PASSWORD || "";
const PROVIDED_WORKER_ID = process.env.SMOKE_WORKER_USER_ID || "";

let passed = 0;
let failed = 0;
let skipped = 0;

function logInfo(message) {
  console.log(`[INFO] ${message}`);
}

function logPass(message) {
  passed += 1;
  console.log(`[PASS] ${message}`);
}

function logFail(message) {
  failed += 1;
  console.error(`[FAIL] ${message}`);
}

function logSkip(message) {
  skipped += 1;
  console.log(`[SKIP] ${message}`);
}

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class SessionClient {
  constructor(label) {
    this.label = label;
    this.cookies = new Map();
  }

  setCookie(cookiePair) {
    const sep = cookiePair.indexOf("=");
    if (sep <= 0) return;
    const name = cookiePair.slice(0, sep).trim();
    const value = cookiePair.slice(sep + 1).trim();
    if (!name) return;
    this.cookies.set(name, value);
  }

  storeCookies(response) {
    if (typeof response.headers.getSetCookie === "function") {
      const setCookies = response.headers.getSetCookie();
      for (const item of setCookies) {
        const pair = item.split(";")[0];
        this.setCookie(pair);
      }
      return;
    }

    const raw = response.headers.get("set-cookie");
    if (!raw) return;

    const match = raw.match(/auth=([^;]+)/);
    if (match) {
      this.setCookie(`auth=${match[1]}`);
    }
  }

  cookieHeader() {
    if (this.cookies.size === 0) return "";
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  async request(path, options = {}) {
    const method = options.method || "GET";
    const headers = { ...(options.headers || {}) };
    const body = options.json !== undefined ? JSON.stringify(options.json) : undefined;

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const cookieHeader = this.cookieHeader();
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
    const response = await fetch(url, {
      method,
      headers,
      body,
      redirect: "manual",
    });

    this.storeCookies(response);

    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    return { status: response.status, data };
  }
}

async function login(session, email, password, expectedRole) {
  const result = await session.request("/api/auth/login", {
    method: "POST",
    json: { email, password },
  });

  ensure(result.status === 200, `${session.label} login failed (HTTP ${result.status})`);
  ensure(result.data?.ok === true, `${session.label} login response not ok`);
  logPass(`${session.label} login`);

  const me = await session.request("/api/auth/me");
  ensure(me.status === 200, `${session.label} /api/auth/me failed (HTTP ${me.status})`);
  ensure(me.data?.ok === true, `${session.label} /api/auth/me not ok`);
  ensure(!!me.data?.user?.id, `${session.label} id missing in /api/auth/me`);
  if (expectedRole) {
    ensure(
      me.data.user.role === expectedRole,
      `${session.label} role mismatch: expected ${expectedRole}, got ${me.data.user.role}`
    );
  }
  logPass(`${session.label} auth identity`);

  return me.data.user;
}

async function pollForNotification(userSession, matcher, retries = 6, delayMs = 1000) {
  for (let i = 0; i < retries; i += 1) {
    const result = await userSession.request("/api/notifications?limit=30");
    if (result.status === 200 && result.data?.ok) {
      const found = (result.data.notifications || []).find(matcher);
      if (found) return { notification: found, snapshot: result.data };
    }
    if (i < retries - 1) {
      await sleep(delayMs);
    }
  }
  return { notification: null, snapshot: null };
}

async function run() {
  logInfo(`Base URL: ${BASE_URL}`);

  ensure(USER_EMAIL && USER_PASSWORD, "SMOKE_USER_EMAIL आणि SMOKE_USER_PASSWORD required आहेत.");

  const userSession = new SessionClient("user");
  const user = await login(userSession, USER_EMAIL, USER_PASSWORD);

  let workerUserId = PROVIDED_WORKER_ID;
  if (!workerUserId) {
    const workers = await userSession.request("/api/workers/active");
    ensure(workers.status === 200 && workers.data?.ok, "Failed to fetch active workers");
    const candidate = (workers.data.workers || []).find((w) => String(w.id) !== String(user.id));
    ensure(candidate?.id, "No active worker available for smoke test");
    workerUserId = String(candidate.id);
  }
  logPass(`worker selected (${workerUserId})`);

  const createConversation = await userSession.request("/api/chat/conversation", {
    method: "POST",
    json: { workerUserId },
  });
  ensure(
    createConversation.status === 200 && createConversation.data?.ok,
    `Conversation create failed (HTTP ${createConversation.status})`
  );
  const conversationId = String(createConversation.data.conversationId);
  ensure(!!conversationId, "conversationId missing");
  logPass(`conversation create/get (${conversationId})`);

  const listConversations = await userSession.request("/api/chat/conversations?limit=50");
  ensure(
    listConversations.status === 200 && listConversations.data?.ok,
    `Conversation list failed (HTTP ${listConversations.status})`
  );
  const hasConversation = (listConversations.data.conversations || []).some(
    (c) => String(c.id) === conversationId
  );
  ensure(hasConversation, "Created conversation not present in list");
  logPass("conversation list includes conversation");

  const userMessageText = `[SMOKE][USER] ${new Date().toISOString()}`;
  const userMessage = await userSession.request("/api/chat/message", {
    method: "POST",
    json: { conversationId, text: userMessageText },
  });
  ensure(userMessage.status === 200 && userMessage.data?.ok, "User message send failed");
  const userMessageId = String(userMessage.data.message?._id || "");
  ensure(!!userMessageId, "User message id missing");
  logPass("user message send");

  const messageList = await userSession.request(`/api/chat/messages/${conversationId}`);
  ensure(messageList.status === 200 && messageList.data?.ok, "Message list load failed");
  const hasUserMessage = (messageList.data.messages || []).some(
    (m) => String(m._id) === userMessageId
  );
  ensure(hasUserMessage, "Sent user message not found in conversation messages");
  logPass("conversation message fetch");

  const notificationsBefore = await userSession.request("/api/notifications?limit=30");
  ensure(
    notificationsBefore.status === 200 && notificationsBefore.data?.ok,
    "Notification list fetch failed"
  );
  logPass("notification list fetch");

  const canRunWorkerFlow = !!(WORKER_EMAIL && WORKER_PASSWORD);
  if (!canRunWorkerFlow) {
    logSkip("worker credentials missing; cross-account notification flow skipped");
  } else {
    const workerSession = new SessionClient("worker");
    const worker = await login(workerSession, WORKER_EMAIL, WORKER_PASSWORD, "worker");
    if (String(worker.id) !== String(workerUserId)) {
      logSkip(
        `worker credentials (${worker.id}) आणि selected worker (${workerUserId}) mismatch; notification flow skipped`
      );
    } else {
      const workerReplyText = `[SMOKE][WORKER] ${new Date().toISOString()}`;
      const workerReply = await workerSession.request("/api/chat/message", {
        method: "POST",
        json: { conversationId, text: workerReplyText },
      });
      ensure(workerReply.status === 200 && workerReply.data?.ok, "Worker message send failed");
      const workerReplyId = String(workerReply.data.message?._id || "");
      ensure(!!workerReplyId, "Worker reply message id missing");
      logPass("worker reply send");

      const poll = await pollForNotification(
        userSession,
        (notification) =>
          notification?.meta?.messageId === workerReplyId &&
          notification?.href === `/chat/${conversationId}`
      );
      ensure(!!poll.notification?._id, "User notification for worker reply not found");
      logPass("notification created for worker reply");

      const notificationId = String(poll.notification._id);
      const markOne = await userSession.request(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      ensure(markOne.status === 200 && markOne.data?.ok, "Mark single notification as read failed");
      logPass("notification mark single read");
    }
  }

  const readAll = await userSession.request("/api/notifications/read-all", { method: "PATCH" });
  ensure(readAll.status === 200 && readAll.data?.ok, "Mark all notifications as read failed");
  logPass("notification mark all read");

  const summary = `Passed: ${passed}, Failed: ${failed}, Skipped: ${skipped}`;
  console.log(`\n[SUMMARY] ${summary}`);
}

run()
  .then(() => {
    if (failed > 0) process.exit(1);
    process.exit(0);
  })
  .catch((error) => {
    logFail(error.message || "Smoke test failed");
    console.log(`\n[SUMMARY] Passed: ${passed}, Failed: ${failed}, Skipped: ${skipped}`);
    process.exit(1);
  });
