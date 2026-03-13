"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  ChevronsDown,
  Clock,
  Loader2,
  Send,
  Trash2,
  User,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/contexts/AuthContext";

function asId(value) {
  if (!value) return "";
  return String(value);
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diff = now - date;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 2 * oneDay) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function groupMessagesByDate(messages = []) {
  const groups = [];
  let lastDate = "";

  for (const message of messages) {
    const dateKey = message?.createdAt ? new Date(message.createdAt).toDateString() : "Unknown date";
    if (dateKey !== lastDate) {
      groups.push({ type: "date", key: dateKey, value: message?.createdAt || null });
      lastDate = dateKey;
    }
    groups.push({ type: "message", key: asId(message?._id), value: message });
  }

  return groups;
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
  const [selectedMessageId, setSelectedMessageId] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesContainerRef = useRef(null);
  const textAreaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const didInitialScrollRef = useRef(false);
  const socket = useMemo(() => getSocket(), []);

  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  const conversationLabel = useMemo(() => {
    const id = asId(conversationId);
    if (!id) return "Conversation";
    return `Conversation #${id.slice(-6).toUpperCase()}`;
  }, [conversationId]);

  const scrollMessagesToBottom = useCallback((behavior = "smooth") => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, []);

  const getMessageStatus = useCallback(
    (message) => {
      if (!conversation || !currentUserId) return "sent";
      const userId = asId(conversation.userId);
      const workerId = asId(conversation.workerUserId);
      const peerId = currentUserId === userId ? workerId : userId;
      if (!peerId) return "sent";

      const isRead = (message.readBy || []).some((id) => asId(id) === peerId);
      if (isRead) return "read";
      const isDelivered = (message.deliveredTo || []).some((id) => asId(id) === peerId);
      return isDelivered ? "delivered" : "sent";
    },
    [conversation, currentUserId]
  );

  const renderStatusIcon = (status) => {
    if (status === "read") return <CheckCheck className="h-3.5 w-3.5 text-sky-300" />;
    if (status === "delivered") return <CheckCheck className="h-3.5 w-3.5 text-white/65" />;
    if (status === "sent") return <Check className="h-3.5 w-3.5 text-white/45" />;
    return <Clock className="h-3.5 w-3.5 text-white/40" />;
  };

  const applyStatusLocally = useCallback((messageId, status, byUserId) => {
    const by = asId(byUserId);
    const id = asId(messageId);
    if (!id || !status) return;

    setMessages((prev) =>
      prev.map((msg) => {
        if (asId(msg._id) !== id) return msg;
        const deliveredTo = new Set((msg.deliveredTo || []).map(asId));
        const readBy = new Set((msg.readBy || []).map(asId));
        if (by) {
          if (status === "delivered") deliveredTo.add(by);
          if (status === "read") {
            deliveredTo.add(by);
            readBy.add(by);
          }
        }
        return {
          ...msg,
          deliveredTo: Array.from(deliveredTo),
          readBy: Array.from(readBy),
        };
      })
    );
  }, []);

  const markMessagesStatus = useCallback(
    async (messageIds, { delivered = false, read = false, emitSocket = true } = {}) => {
      const ids = (messageIds || []).filter(Boolean).map(asId);
      if (!conversationId || ids.length === 0) return;

      const res = await fetch(`/api/chat/messages/${conversationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageIds: ids, delivered, read }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok || !emitSocket) return;

      for (const id of (data.deliveredIds || []).map(asId)) {
        socket.emit("messageDelivered", { conversationId, messageId: id, byUserId: currentUserId });
      }
      for (const id of (data.readIds || []).map(asId)) {
        socket.emit("messageRead", { conversationId, messageId: id, byUserId: currentUserId });
      }
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data?.error || "Failed to load messages");
        setConversation(null);
        setMessages([]);
        return;
      }

      setConversation(data.conversation || null);
      setMessages(Array.isArray(data.messages) ? data.messages : []);

      for (const messageId of (data?.statusUpdates?.readIds || []).map(asId)) {
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

  useEffect(() => {
    if (!conversationId) return;

    loadMessages();
    if (currentUserId) socket.emit("joinUser", currentUserId);
    socket.emit("join", { conversationId });

    const onNewMessage = (msg) => {
      if (!msg?._id) return;
      setMessages((prev) => {
        const exists = prev.some((m) => asId(m._id) === asId(msg._id));
        return exists ? prev : [...prev, msg];
      });

      const senderId = asId(msg.senderId);
      if (senderId && senderId !== currentUserId) {
        markMessagesStatus([msg._id], { delivered: true, read: false, emitSocket: true });
        setTimeout(() => {
          markMessagesStatus([msg._id], { delivered: true, read: true, emitSocket: true });
        }, 250);
      }
    };

    const onTyping = ({ name }) => setTypingName(name || "Someone");
    const onStopTyping = () => setTypingName("");
    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => asId(m._id) !== asId(messageId)));
    };
    const onMessageStatus = ({ messageId, status, byUserId }) => {
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
  }, [conversationId, socket, currentUserId, loadMessages, markMessagesStatus, applyStatusLocally]);

  useEffect(() => {
    if (!conversationId) return undefined;
    const timer = setInterval(() => loadMessages(), 15000);
    return () => clearInterval(timer);
  }, [conversationId, loadMessages]);

  useEffect(() => {
    didInitialScrollRef.current = false;
    setIsAtBottom(true);
    setShowScrollButton(false);
  }, [conversationId]);

  useEffect(() => {
    if (!didInitialScrollRef.current && messages.length > 0) {
      scrollMessagesToBottom("auto");
      didInitialScrollRef.current = true;
      return;
    }
    if (isAtBottom) scrollMessagesToBottom("smooth");
  }, [messages, isAtBottom, scrollMessagesToBottom]);

  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  useEffect(
    () => () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    },
    []
  );

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom && messages.length > 10);
  }, [messages.length]);

  const handleTyping = (value) => {
    setText(value);
    if (!conversationId) return;

    const name = user?.name || user?.email || "Someone";
    socket.emit("typing", { conversationId, name });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { conversationId });
    }, 600);
  };

  const send = async () => {
    const content = String(text || "").trim();
    if (!content || !conversationId || sending) return;

    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversationId, text: content }),
      });

      const data = await res.json().catch(() => ({}));
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

      requestAnimationFrame(() => scrollMessagesToBottom("smooth"));
      socket.emit("stopTyping", { conversationId });
      socket.emit("sendMessage", { conversationId, message: sentMessage });
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleComposerKeyDown = (event) => {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;
    event.preventDefault();
    send();
  };

  const deleteMsg = async (messageId) => {
    setError("");
    try {
      const res = await fetch(`/api/chat/message/${messageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data?.error || "Failed to delete message");
        return;
      }

      setMessages((prev) => prev.filter((m) => asId(m._id) !== asId(messageId)));
      socket.emit("messageDeleted", { conversationId, messageId });
      setSelectedMessageId("");
    } catch {
      setError("Failed to delete message");
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] bg-gradient-to-b from-slate-900 to-black px-2 py-3 sm:px-4 sm:py-6">
      <div className="relative mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl sm:rounded-2xl">
        <div className="border-b border-white/10 bg-black/35 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-violet-500 sm:h-10 sm:w-10">
                  <User className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-black ${
                    socketConnected ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-white sm:text-lg">
                  {conversation?.userId === currentUserId ? "Worker" : "User"} Chat
                </h2>
                <p className="truncate text-[11px] text-white/45">{conversationLabel}</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 sm:flex">
              {socketConnected ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                  Reconnecting
                </>
              )}
              <span className="text-white/30">•</span>
              <span>{messages.length}</span>
            </div>
          </div>
        </div>

        {typingName && (
          <div className="border-b border-white/10 bg-fuchsia-500/8 px-4 py-2 text-xs text-fuchsia-200 sm:px-6 sm:text-sm">
            <span className="font-medium">{typingName}</span> is typing...
          </div>
        )}

        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-gradient-to-b from-black/25 to-black/10 p-3 sm:p-5"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-white/65">
                <Loader2 className="h-7 w-7 animate-spin text-pink-400" />
                <p className="text-sm">Loading messages...</p>
              </div>
            </div>
          ) : groupedMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/6">
                <Send className="h-6 w-6 text-white/40" />
              </div>
              <p className="text-sm font-medium text-white/85 sm:text-base">No messages yet</p>
              <p className="text-xs text-white/45 sm:text-sm">Start the conversation to see messages here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedMessages.map((item) => {
                if (item.type === "date") {
                  return (
                    <div key={`date-${item.key}`} className="flex justify-center">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/50">
                        {item.value
                          ? new Date(item.value).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
                          : "Unknown date"}
                      </span>
                    </div>
                  );
                }

                const m = item.value;
                const id = asId(m?._id);
                const isOwnMessage = currentUserId && asId(m?.senderId) === currentUserId;
                const canDelete = isOwnMessage;
                const status = isOwnMessage ? getMessageStatus(m) : "";
                const selected = selectedMessageId === id;

                return (
                  <div
                    key={`msg-${id}`}
                    className={`group relative flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    onMouseLeave={() => setSelectedMessageId("")}
                  >
                    {!isOwnMessage && (
                      <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-violet-500/90 to-fuchsia-500/90">
                        <User className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}

                    <div className={`relative max-w-[86%] sm:max-w-[72%] ${isOwnMessage ? "order-1" : "order-2"}`}>
                      {canDelete && (
                        <div
                          className={`absolute -left-9 top-1/2 -translate-y-1/2 transition-opacity ${
                            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <button
                            onClick={() => deleteMsg(id)}
                            className="rounded-full border border-rose-400/35 bg-rose-500/20 p-1.5 text-rose-200 transition-colors hover:bg-rose-500/35"
                            aria-label="Delete message"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      <div
                        className={`rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3 ${
                          isOwnMessage
                            ? "rounded-br-none border-pink-400/30 bg-gradient-to-r from-pink-600 to-violet-600 text-white shadow-lg shadow-pink-700/20"
                            : "rounded-bl-none border-white/15 bg-white/10 text-white shadow-lg shadow-black/20"
                        } ${selected ? "ring-2 ring-pink-500/40" : ""}`}
                        onClick={() => setSelectedMessageId(selected ? "" : id)}
                      >
                        <p className="break-words text-xs leading-relaxed sm:text-sm">{m?.text || ""}</p>
                        <div className={`mt-1 flex items-center justify-end gap-1 ${isOwnMessage ? "text-white/75" : "text-white/55"}`}>
                          <span className="text-[10px] sm:text-[11px]">{formatTime(m?.createdAt)}</span>
                          {isOwnMessage && renderStatusIcon(status)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showScrollButton && (
          <button
            onClick={() => scrollMessagesToBottom("smooth")}
            className="absolute bottom-24 right-4 z-10 rounded-full bg-fuchsia-600 p-2.5 text-white shadow-lg shadow-fuchsia-900/40 transition-colors hover:bg-fuchsia-500"
            aria-label="Scroll to latest message"
          >
            <ChevronsDown className="h-4 w-4" />
          </button>
        )}

        {error && (
          <div className="border-t border-rose-500/30 bg-rose-500/15 px-4 py-2 sm:px-6">
            <div className="flex items-center gap-2 text-rose-200">
              <p className="flex-1 text-xs sm:text-sm">{error}</p>
              <button onClick={() => setError("")} className="rounded p-1 hover:bg-rose-500/20" aria-label="Dismiss error">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-white/10 bg-black/30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
          <div className="flex items-end gap-2.5 sm:gap-3">
            <textarea
              ref={textAreaRef}
              rows={1}
              className="min-h-[44px] max-h-36 flex-1 resize-none rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-white/40 transition-all focus:border-pink-500/70 focus:outline-none focus:ring-1 focus:ring-pink-500/30 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              aria-label="Message input"
              disabled={sending}
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 px-4 text-white transition-all hover:from-pink-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:min-w-12 sm:rounded-2xl"
              aria-label="Send message"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-white/35 sm:text-xs">
            Enter to send • Shift+Enter for new line • End-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

