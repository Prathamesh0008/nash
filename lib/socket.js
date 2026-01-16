import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(); // connects to same domain
  }
  return socket;
}
