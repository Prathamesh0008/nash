#!/usr/bin/env node

import { io } from "socket.io-client";

const BASE_URL = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const USER_EMAIL = process.env.SMOKE_USER_EMAIL || "";
const USER_PASSWORD = process.env.SMOKE_USER_PASSWORD || "";

let passed = 0;
let failed = 0;

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

function ensure(condition, message) {
  if (!condition) throw new Error(message);
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
        this.setCookie(item.split(";")[0]);
      }
      return;
    }

    const raw = response.headers.get("set-cookie");
    if (!raw) return;

    const authMatch = raw.match(/auth=([^;]+)/);
    if (authMatch) this.setCookie(`auth=${authMatch[1]}`);
    const refreshMatch = raw.match(/refresh=([^;]+)/);
    if (refreshMatch) this.setCookie(`refresh=${refreshMatch[1]}`);
  }

  cookieHeader() {
    if (this.cookies.size === 0) return "";
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  async request(path, options = {}) {
    const method = options.method || "GET";
    const headers = { ...(options.headers || {}) };
    const body = options.json !== undefined ? JSON.stringify(options.json) : undefined;
    if (body) headers["Content-Type"] = "application/json";

    const cookie = this.cookieHeader();
    if (cookie) headers.Cookie = cookie;

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body,
      redirect: "manual",
    });
    this.storeCookies(response);

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    return { status: response.status, data };
  }
}

async function login(session, email, password) {
  const result = await session.request("/api/auth/login", {
    method: "POST",
    json: { email, password },
  });
  ensure(result.status === 200 && result.data?.ok === true, "User login failed for socket smoke");
  logPass("user login");
}

function connectSocket({ cookieHeader = "" } = {}) {
  return new Promise((resolve, reject) => {
    const socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: false,
      timeout: 7000,
      forceNew: true,
      extraHeaders: cookieHeader ? { Cookie: cookieHeader } : {},
    });

    const timer = setTimeout(() => {
      cleanup();
      socket.close();
      reject(new Error("Socket connect timeout"));
    }, 9000);

    const onConnect = () => {
      cleanup();
      resolve(socket);
    };

    const onConnectError = (error) => {
      cleanup();
      socket.close();
      reject(error || new Error("Socket connect error"));
    };

    function cleanup() {
      clearTimeout(timer);
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
    }

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
  });
}

function expectUnauthenticatedSocketRejected() {
  return new Promise((resolve, reject) => {
    const socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: false,
      timeout: 7000,
      forceNew: true,
    });

    const timer = setTimeout(() => {
      cleanup();
      socket.close();
      reject(new Error("Unauthenticated socket was not rejected in time"));
    }, 9000);

    const onConnect = () => {
      cleanup();
      socket.close();
      reject(new Error("Unauthenticated socket connected unexpectedly"));
    };

    const onConnectError = () => {
      cleanup();
      socket.close();
      resolve();
    };

    function cleanup() {
      clearTimeout(timer);
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
    }

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
  });
}

function waitForChatError(socket, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for chat:error"));
    }, timeoutMs);

    const onError = (payload) => {
      cleanup();
      resolve(payload || {});
    };

    function cleanup() {
      clearTimeout(timer);
      socket.off("chat:error", onError);
    }

    socket.on("chat:error", onError);
  });
}

function assertNoChatErrorWithin(socket, timeoutMs = 1500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, timeoutMs);

    const onError = (payload) => {
      cleanup();
      reject(new Error(`Unexpected chat:error received: ${JSON.stringify(payload || {})}`));
    };

    function cleanup() {
      clearTimeout(timer);
      socket.off("chat:error", onError);
    }

    socket.on("chat:error", onError);
  });
}

async function run() {
  logInfo(`Base URL: ${BASE_URL}`);
  ensure(USER_EMAIL && USER_PASSWORD, "SMOKE_USER_EMAIL and SMOKE_USER_PASSWORD are required");

  await expectUnauthenticatedSocketRejected();
  logPass("unauthenticated socket rejected");

  const userSession = new SessionClient("user");
  await login(userSession, USER_EMAIL, USER_PASSWORD);

  const workers = await userSession.request("/api/workers/active");
  ensure(workers.status === 200 && workers.data?.ok, "Failed to fetch active workers");
  const worker = (workers.data.workers || [])[0];
  ensure(worker?.id, "No active worker found for socket smoke");

  const conversation = await userSession.request("/api/chat/conversation", {
    method: "POST",
    json: { workerUserId: worker.id },
  });
  ensure(conversation.status === 200 && conversation.data?.ok, "Failed to create chat conversation");
  const conversationId = String(conversation.data.conversationId || "");
  ensure(conversationId, "conversationId missing");
  logPass("conversation prepared");

  const authedSocket = await connectSocket({ cookieHeader: userSession.cookieHeader() });
  try {
    logPass("authenticated socket connected");

    const forbiddenConversationId = "000000000000000000000001";
    const forbiddenErrorPromise = waitForChatError(authedSocket, 6000);
    authedSocket.emit("join", { conversationId: forbiddenConversationId });
    const forbiddenError = await forbiddenErrorPromise;
    ensure(
      String(forbiddenError?.conversationId || "") === forbiddenConversationId,
      "Forbidden join did not return conversation-specific chat:error"
    );
    ensure(
      String(forbiddenError?.error || "").toLowerCase().includes("not allowed"),
      "Forbidden join did not include access-denied message"
    );
    logPass("unauthorized conversation join blocked");

    authedSocket.emit("join", { conversationId });
    await assertNoChatErrorWithin(authedSocket, 1800);
    logPass("authorized conversation join accepted");
  } finally {
    authedSocket.close();
  }

  console.log(`\n[SUMMARY] Passed: ${passed}, Failed: ${failed}`);
}

run()
  .then(() => {
    process.exit(failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    logFail(error.message || "Socket smoke failed");
    console.log(`\n[SUMMARY] Passed: ${passed}, Failed: ${failed}`);
    process.exit(1);
  });
