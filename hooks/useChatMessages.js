import { useEffect, useState } from "react";

export function useChatMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!conversationId) {
        if (!cancelled) {
          setMessages([]);
          setError("");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError("");

      fetch(`/api/chat/messages/${conversationId}`, { credentials: "include" })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok || !data.ok) {
            throw new Error(data?.error || "Failed to load messages");
          }
          return data.messages || [];
        })
        .then((data) => {
          if (!cancelled) setMessages(data);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.message || "Failed to load messages");
            setMessages([]);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [conversationId]);

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  return {
    messages,
    setMessages,
    addMessage,
    loading,
    error,
  };
}
