import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

export function useChatSocket({ conversationId, onMessage }) {
  useEffect(() => {
    if (!conversationId) return;

    const socket = getSocket();
    socket.emit("join", conversationId);

    socket.on("newMessage", onMessage);

    return () => {
      socket.emit("leave", conversationId);
      socket.off("newMessage", onMessage);
    };
  }, [conversationId, onMessage]);
}
