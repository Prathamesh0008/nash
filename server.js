import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { logError } from "./lib/monitoring.js";
import { verifyTrackingToken } from "./lib/trackingToken.js";

function asText(value) {
  if (!value) return "";
  return String(value);
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

const dev = process.env.NODE_ENV !== "production";
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
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("joinUser", (userId) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      socket.data.userId = userId;
    });

    socket.on("join", (payload) => {
      const conversationId =
        typeof payload === "string" ? payload : payload?.conversationId;
      if (!conversationId) return;
      socket.join(conversationId);
    });

    socket.on("leave", (payload) => {
      const conversationId =
        typeof payload === "string" ? payload : payload?.conversationId;
      if (!conversationId) return;
      socket.leave(conversationId);
    });

    socket.on("sendMessage", ({ conversationId, message }) => {
      if (!conversationId || !message) return;
      io.to(conversationId).emit("newMessage", message);
    });

    socket.on("typing", ({ conversationId, name }) => {
      socket.to(conversationId).emit("typing", { name });
    });

    socket.on("stopTyping", ({ conversationId }) => {
      socket.to(conversationId).emit("stopTyping");
    });

    socket.on("messageDelivered", ({ conversationId, messageId, byUserId }) => {
      if (!conversationId || !messageId) return;
      io.to(conversationId).emit("messageStatus", {
        messageId,
        status: "delivered",
        byUserId,
        at: new Date().toISOString(),
      });
    });

    socket.on("messageRead", ({ conversationId, messageId, byUserId }) => {
      if (!conversationId || !messageId) return;
      io.to(conversationId).emit("messageStatus", {
        messageId,
        status: "read",
        byUserId,
        at: new Date().toISOString(),
      });
    });

    socket.on("messageDeleted", ({ conversationId, messageId }) => {
      if (!conversationId || !messageId) return;
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
