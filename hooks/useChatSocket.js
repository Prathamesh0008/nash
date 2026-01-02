import { useEffect } from "react";
import socket from "@/lib/socket";

export function useChatSocket({ conversationId, onMessage }) {
  useEffect(() => {
    if (!conversationId) return;

    socket.connect();
    socket.emit("join-room", conversationId);

    socket.on("message:new", onMessage);

    return () => {
      socket.emit("leave-room", conversationId);
      socket.off("message:new", onMessage);
    };
  }, [conversationId]);
}
