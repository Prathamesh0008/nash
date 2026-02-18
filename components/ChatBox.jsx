"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/contexts/AuthContext";

function asId(value) {
  if (!value) return "";
  return String(value);
}

export default function ChatBox({ conversationId }) {
  const { user } = useAuth();
  const currentUserId = asId(user?.id);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingName, setTypingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    setSocketConnected(Boolean(socket.connected));
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  const markMessagesStatus = useCallback(
    async (messageIds, { delivered = false, read = false, emitSocket = true } = {}) => {
      const ids = (messageIds || []).filter(Boolean).map((id) => asId(id));
      if (!conversationId || ids.length === 0) return { deliveredIds: [], readIds: [] };

      const res = await fetch(`/api/chat/messages/${conversationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageIds: ids, delivered, read }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) return { deliveredIds: [], readIds: [] };

      const deliveredIds = (data.deliveredIds || []).map(asId);
      const readIds = (data.readIds || []).map(asId);

      if (emitSocket) {
        for (const id of deliveredIds) {
          socket.emit("messageDelivered", { conversationId, messageId: id, byUserId: currentUserId });
        }
        for (const id of readIds) {
          socket.emit("messageRead", { conversationId, messageId: id, byUserId: currentUserId });
        }
      }

      return { deliveredIds, readIds };
    },
    [conversationId, currentUserId, socket]
  );

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/chat/messages/${conversationId}`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Failed to load messages");
        setConversation(null);
        setMessages([]);
        return;
      }

      setConversation(data.conversation || null);
      setMessages(data.messages || []);

      const readIds = (data?.statusUpdates?.readIds || []).map(asId);
      for (const messageId of readIds) {
        socket.emit("messageRead", { conversationId, messageId, byUserId: currentUserId });
      }
    } catch {
      setError("Failed to load messages");
      setConversation(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentUserId, socket]);

  const applyStatusLocally = useCallback((messageId, status, byUserId) => {
    const by = asId(byUserId);
    const id = asId(messageId);
    if (!id || !status) return;

    setMessages((prev) =>
      prev.map((msg) => {
        if (asId(msg._id) !== id) return msg;

        const nextDelivered = new Set((msg.deliveredTo || []).map(asId));
        const nextRead = new Set((msg.readBy || []).map(asId));

        if (by) {
          if (status === "delivered") nextDelivered.add(by);
          if (status === "read") {
            nextDelivered.add(by);
            nextRead.add(by);
          }
        }

        return {
          ...msg,
          deliveredTo: Array.from(nextDelivered),
          readBy: Array.from(nextRead),
        };
      })
    );
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    loadMessages();

    if (currentUserId) {
      socket.emit("joinUser", currentUserId);
    }
    socket.emit("join", { conversationId });

    const onNewMessage = (msg) => {
      if (!msg?._id) return;

      setMessages((prev) => {
        const exists = prev.some((m) => asId(m._id) === asId(msg._id));
        return exists ? prev : [...prev, msg];
      });

      const senderId = asId(msg.senderId);
      if (!senderId || senderId === currentUserId) return;

      markMessagesStatus([msg._id], { delivered: true, read: false, emitSocket: true });
      setTimeout(() => {
        markMessagesStatus([msg._id], { delivered: true, read: true, emitSocket: true });
      }, 250);
    };

    const onTyping = ({ name }) => {
      setTypingName(name || "Someone");
    };

    const onStopTyping = () => {
      setTypingName("");
    };

    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => asId(m._id) !== asId(messageId)));
    };

    const onMessageStatus = ({ messageId, status, byUserId }) => {
      if (!messageId || !status) return;
      applyStatusLocally(messageId, status, byUserId);
    };

    socket.on("newMessage", onNewMessage);
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("messageStatus", onMessageStatus);

    return () => {
      socket.emit("leave", { conversationId });
      socket.off("newMessage", onNewMessage);
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("messageStatus", onMessageStatus);
    };
  }, [conversationId, socket, currentUserId, markMessagesStatus, applyStatusLocally, loadMessages]);

  useEffect(() => {
    if (!conversationId) return undefined;
    const timer = setInterval(() => {
      loadMessages();
    }, 15000);
    return () => clearInterval(timer);
  }, [conversationId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!text.trim() || !conversationId || sending) return;

    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversationId, text }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Failed to send message");
        return;
      }

      setText("");
      const sentMessage = data.message;
      setMessages((prev) => {
        const exists = prev.some((msg) => asId(msg._id) === asId(sentMessage?._id));
        return exists ? prev : [...prev, sentMessage];
      });
      socket.emit("stopTyping", { conversationId });
      socket.emit("sendMessage", { conversationId, message: sentMessage });
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function handleTyping(val) {
    setText(val);
    if (!conversationId) return;

    const name = user?.name || user?.email || "Someone";
    socket.emit("typing", { conversationId, name });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { conversationId });
    }, 600);
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  async function deleteMsg(messageId) {
    setError("");
    try {
      const res = await fetch(`/api/chat/message/${messageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Failed to delete message");
        return;
      }

      setMessages((prev) => prev.filter((m) => String(m._id) !== String(messageId)));
      socket.emit("messageDeleted", { conversationId, messageId });
    } catch {
      setError("Failed to delete message");
    }
  }

  const peerId = useMemo(() => {
    if (!conversation || !currentUserId) return "";
    const userId = asId(conversation.userId);
    const workerId = asId(conversation.workerUserId);
    if (currentUserId === userId) return workerId;
    if (currentUserId === workerId) return userId;
    return "";
  }, [conversation, currentUserId]);

  const getMessageStatus = useCallback(
    (message) => {
      if (!peerId) return "";
      const isRead = (message.readBy || []).some((id) => asId(id) === peerId);
      if (isRead) return "read";
      const isDelivered = (message.deliveredTo || []).some((id) => asId(id) === peerId);
      return isDelivered ? "delivered" : "sent";
    },
    [peerId]
  );

  return (
    <div className="min-h-[calc(100vh-220px)] px-4 py-6">
      <div className="h-[70vh] max-w-4xl mx-auto flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Chat</h2>
              <p className="text-xs sm:text-sm text-white/60">
                Conversation #{conversationId}
              </p>
            </div>
            <div className="text-xs sm:text-sm text-white/70 rounded-full bg-white/10 px-3 py-1">
              {messages.length} messages | {socketConnected ? "Live" : "Reconnecting..."}
            </div>
          </div>
        </div>

        {typingName && (
          <div className="px-5 py-2 border-b border-white/10 bg-white/5 text-sm text-pink-300">
            {typingName} is typing...
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-gradient-to-b from-black/30 to-black/10">
          {loading ? (
            <div className="h-full flex items-center justify-center text-white/60 text-sm">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/50">
              <p className="text-base sm:text-lg font-medium text-center">No messages yet</p>
              <p className="text-xs sm:text-sm text-center mt-1">Start the conversation</p>
            </div>
          ) : (
            messages.map((m) => {
              const isOwnMessage = user?.id && String(m.senderId) === String(user.id);
              const canDelete = isOwnMessage;

              return (
                <div key={String(m._id)} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 border ${
                      isOwnMessage
                        ? "bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400/20 text-white rounded-br-md"
                        : "bg-white/10 border-white/15 text-white rounded-bl-md"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className={`text-xs ${isOwnMessage ? "text-white/80" : "text-white/60"}`}>
                        {m.createdAt && !isNaN(new Date(m.createdAt))
                          ? new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => deleteMsg(m._id)}
                          className="ml-2 text-xs text-white/80 hover:text-white"
                          aria-label="Delete message"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="break-words text-sm sm:text-base">{m.text}</div>
                    {isOwnMessage && (
                      <div className="mt-1 text-right text-[11px] uppercase tracking-wide text-white/70">
                        {getMessageStatus(m)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-white/10 p-4 bg-black/20">
          {error && <div className="mb-2 text-xs text-red-300">{error}</div>}
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-sm sm:text-base placeholder:text-white/50 focus:outline-none focus:border-pink-500/70"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              aria-label="Message input"
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              className="px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm sm:text-base"
              aria-label="Send message"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
          <div className="mt-2 text-xs text-white/50 text-center">Press Enter to send</div>
        </div>
      </div>
    </div>
  );
}
