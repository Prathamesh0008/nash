import { useEffect, useState } from "react";
import api from "@/lib/api";

export function useChatMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;

    setLoading(true);
    api
  .get(`/api/chat/messages?conversationId=${conversationId}`)
  .then((data) => setMessages(data))
      .finally(() => setLoading(false));
  }, [conversationId]);

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  return {
    messages,
    setMessages,
    addMessage,
    loading,
  };
}
