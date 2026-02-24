import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { logError } from "./lib/monitoring.js";
import { verifyTrackingToken } from "./lib/trackingToken.js";
import dbConnect from "./lib/dbConnect.js";
import Conversation from "./models/Conversation.js";
import { AUTH_COOKIE_NAME, verifyAccessToken } from "./lib/auth.js";

const dev = process.env.NODE_ENV !== "production";
const socketAllowedOrigins = (process.env.SOCKET_ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_APP_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function asText(value) {
  if (!value) return "";
  return String(value);
}

function parseCookieHeader(rawCookie = "") {
  const pairs = asText(rawCookie)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  const parsed = {};
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx <= 0) continue;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (!key || !value) continue;
    try {
      parsed[key] = decodeURIComponent(value);
    } catch {
      parsed[key] = value;
    }
  }

  return parsed;
}

function getSocketClaims(socket) {
  const bearer = asText(socket?.handshake?.headers?.authorization);
  let token = "";

  if (bearer.toLowerCase().startsWith("bearer ")) {
    token = bearer.slice(7).trim();
  }

  if (!token) {
    token = asText(socket?.handshake?.auth?.token);
  }

  if (!token) {
    const cookies = parseCookieHeader(socket?.handshake?.headers?.cookie);
    token = asText(cookies[AUTH_COOKIE_NAME]);
  }

  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload?.userId) return null;

  return {
    userId: asText(payload.userId),
    role: asText(payload.role || "user"),
  };
}

function getConversationId(payload) {
  if (typeof payload === "string") return payload;
  return payload?.conversationId;
}

async function canAccessConversation(conversationId, claims) {
  const room = asText(conversationId);
  const userId = asText(claims?.userId);
  if (!room || !userId) return false;

  try {
    await dbConnect();
    const convo = await Conversation.findById(room).select("userId workerUserId").lean();
    if (!convo) return false;
    if (claims?.role === "admin") return true;
    return convo.userId?.toString() === userId || convo.workerUserId?.toString() === userId;
  } catch {
    return false;
  }
}

async function ensureConversationAccess(socket, conversationId) {
  const room = asText(conversationId);
  if (!room) return false;

  if (!socket.data.allowedConversations) {
    socket.data.allowedConversations = new Set();
  }

  if (socket.data.allowedConversations.has(room)) {
    return true;
  }

  const claims = socket.data.auth || null;
  const allowed = await canAccessConversation(room, claims);
  if (allowed) {
    socket.data.allowedConversations.add(room);
  }
  return allowed;
}

function isAllowedSocketOrigin(origin) {
  const value = asText(origin);
  if (!value) return true;
  if (socketAllowedOrigins.includes(value)) return true;
  if (dev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value)) return true;
  return false;
}

function normalizeTrackingLocation(location) {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  const accuracy = Number(location?.accuracy);
  const speed = Number(location?.speed);
  const heading = Number(location?.heading);
  const rawRecordedAt = location?.recordedAt ? new Date(location.recordedAt) : new Date();

  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    accuracy: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null,
    speed: Number.isFinite(speed) && speed >= 0 ? speed : null,
    heading: Number.isFinite(heading) && heading >= 0 && heading <= 360 ? heading : null,
    recordedAt: Number.isNaN(rawRecordedAt.getTime()) ? new Date().toISOString() : rawRecordedAt.toISOString(),
  };
}

const app = next({ dev });
const handle = app.getRequestHandler();

process.on("uncaughtException", (error) => {
  logError("server.uncaughtException", error);
});

process.on("unhandledRejection", (reason) => {
  logError("server.unhandledRejection", reason instanceof Error ? reason : new Error(String(reason)));
});

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedSocketOrigin(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Socket origin not allowed"));
      },
      credentials: true,
    },
  });

  io.use((socket, nextSocket) => {
    const claims = getSocketClaims(socket);
    if (!claims?.userId) {
      return nextSocket(new Error("Not authenticated"));
    }

    socket.data.auth = claims;
    socket.data.allowedConversations = new Set();
    return nextSocket();
  });

  io.on("connection", (socket) => {
    const authUserId = asText(socket.data.auth?.userId);
    if (authUserId) {
      socket.join(`user:${authUserId}`);
    }

    socket.on("joinUser", (userId) => {
      const requestedUserId = asText(userId);
      const claims = socket.data.auth || null;
      if (!requestedUserId || !claims?.userId) return;

      if (claims.role !== "admin" && requestedUserId !== claims.userId) {
        socket.emit("chat:error", { error: "Not allowed to join this user room" });
        return;
      }

      socket.join(`user:${requestedUserId}`);
    });

    socket.on("join", async (payload) => {
      const conversationId = getConversationId(payload);
      if (!conversationId) return;

      const allowed = await ensureConversationAccess(socket, conversationId);
      if (!allowed) {
        socket.emit("chat:error", { conversationId, error: "Not allowed to join this conversation" });
        return;
      }

      socket.join(conversationId);
    });

    socket.on("leave", (payload) => {
      const conversationId = getConversationId(payload);
      if (!conversationId) return;
      socket.leave(conversationId);
      socket.data.allowedConversations?.delete(asText(conversationId));
    });

    socket.on("sendMessage", async ({ conversationId, message }) => {
      if (!conversationId || !message) return;

      const allowed = await ensureConversationAccess(socket, conversationId);
      if (!allowed) {
        socket.emit("chat:error", { conversationId, error: "Not allowed to send in this conversation" });
        return;
      }

      io.to(conversationId).emit("newMessage", message);
    });

    socket.on("typing", async ({ conversationId, name }) => {
      const allowed = await ensureConversationAccess(socket, conversationId);
      if (!allowed) return;
      socket.to(conversationId).emit("typing", { name });
    });

    socket.on("stopTyping", async ({ conversationId }) => {
      const allowed = await ensureConversationAccess(socket, conversationId);
      if (!allowed) return;
      socket.to(conversationId).emit("stopTyping");
    });

    socket.on("messageDelivered", async ({ conversationId, messageId }) => {
      if (!conversationId || !messageId) return;

      const allowed = await ensureConversationAccess(socket, conversationId);
      if (!allowed) return;

      io.to(conversationId).emit("messageStatus", {
        messageId,
        status: "delivered",
        byUserId: asText(socket.data.auth?.userId),
        at: new Date().toISOString(),
      });
    });

    socket.on("messageRead", async ({ conversationId, messageId }) => {
      if (!conversationId || !messageId) return;

      const allowed = await ensureConversationAccess(socket, conversationId);
      if (!allowed) return;

      io.to(conversationId).emit("messageStatus", {
        messageId,
        status: "read",
        byUserId: asText(socket.data.auth?.userId),
        at: new Date().toISOString(),
      });
    });

    socket.on("messageDeleted", async ({ conversationId, messageId }) => {
      if (!conversationId || !messageId) return;

      const allowed = await ensureConversationAccess(socket, conversationId);
      if (!allowed) return;

      io.to(conversationId).emit("messageDeleted", { messageId });
    });

    socket.on("bookingTracking:join", ({ bookingId, token }) => {
      const roomBookingId = asText(bookingId);
      if (!roomBookingId || !token) return;

      const claims = verifyTrackingToken(token);
      if (!claims || claims.bookingId !== roomBookingId) {
        socket.emit("bookingTracking:error", { bookingId: roomBookingId, error: "Tracking authorization failed" });
        return;
      }

      socket.join(`booking:${roomBookingId}`);
      if (!socket.data.trackingClaims) socket.data.trackingClaims = new Map();
      socket.data.trackingClaims.set(roomBookingId, claims);
      socket.emit("bookingTracking:joined", { bookingId: roomBookingId });
    });

    socket.on("bookingTracking:leave", ({ bookingId }) => {
      const roomBookingId = asText(bookingId);
      if (!roomBookingId) return;
      socket.leave(`booking:${roomBookingId}`);
      socket.data.trackingClaims?.delete(roomBookingId);
      socket.emit("bookingTracking:left", { bookingId: roomBookingId });
    });

    socket.on("bookingTracking:update", ({ bookingId, token, location }) => {
      const roomBookingId = asText(bookingId);
      if (!roomBookingId || !location) return;

      const fromToken = token ? verifyTrackingToken(token) : null;
      const fromSession = socket.data.trackingClaims?.get(roomBookingId) || null;
      const claims =
        fromToken && fromToken.bookingId === roomBookingId
          ? fromToken
          : fromSession && fromSession.bookingId === roomBookingId
            ? fromSession
            : null;

      if (!claims) {
        socket.emit("bookingTracking:error", { bookingId: roomBookingId, error: "Tracking session expired" });
        return;
      }

      if (!["worker", "admin"].includes(claims.role)) {
        socket.emit("bookingTracking:error", { bookingId: roomBookingId, error: "Not allowed to share location" });
        return;
      }

      const normalized = normalizeTrackingLocation(location);
      if (!normalized) return;

      const sentAt = new Date().toISOString();
      io.to(`booking:${roomBookingId}`).emit("bookingTracking:updated", {
        bookingId: roomBookingId,
        workerId: claims.userId,
        sentAt,
        location: normalized,
      });
    });
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((error) => {
  logError("server.prepare", error);
  process.exit(1);
});
