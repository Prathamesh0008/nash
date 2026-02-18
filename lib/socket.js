import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io({
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 600,
    });
  }
  return socket;
}
