"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Trash2, 
  Send, 
  CheckCheck, 
  Check, 
  Clock,
  MoreVertical,
  User,
  Wifi,
  WifiOff,
  XCircle,
  Loader2
} from "lucide-react";

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
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socket = useMemo(() => getSocket(), []);

  // Socket connection status
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

  // Mark messages status
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

  // Load messages
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

  // Apply status locally
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

  // Socket event handlers
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

  // Polling for messages
  useEffect(() => {
    if (!conversationId) return undefined;
    const timer = setInterval(() => {
      loadMessages();
    }, 15000);
    return () => clearInterval(timer);
  }, [conversationId, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const bottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
    
    setIsAtBottom(bottom);
    setShowScrollButton(!bottom && messages.length > 10);
  }, [messages.length]);

  // Send message
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

  // Handle typing
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

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Delete message
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
      setSelectedMessage(null);
    } catch {
      setError("Failed to delete message");
    }
  }

  // Get peer ID
  const peerId = useMemo(() => {
    if (!conversation || !currentUserId) return "";
    const userId = asId(conversation.userId);
    const workerId = asId(conversation.workerUserId);
    if (currentUserId === userId) return workerId;
    if (currentUserId === workerId) return userId;
    return "";
  }, [conversation, currentUserId]);

  // Get message status
  const getMessageStatus = useCallback(
    (message) => {
      if (!peerId) return "sent";
      const isRead = (message.readBy || []).some((id) => asId(id) === peerId);
      if (isRead) return "read";
      const isDelivered = (message.deliveredTo || []).some((id) => asId(id) === peerId);
      return isDelivered ? "delivered" : "sent";
    },
    [peerId]
  );

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "read":
        return <CheckCheck className="h-3.5 w-3.5 text-blue-400" />;
      case "delivered":
        return <CheckCheck className="h-3.5 w-3.5 text-white/60" />;
      case "sent":
        return <Check className="h-3.5 w-3.5 text-white/40" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-white/40" />;
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date)) return "";
    
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (diff < oneDay) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diff < 2 * oneDay) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = null;
    
    messages.forEach((message) => {
      const date = message.createdAt ? new Date(message.createdAt).toDateString() : null;
      if (date !== lastDate) {
        groups.push({ type: "date", date: message.createdAt });
        lastDate = date;
      }
      groups.push({ type: "message", data: message });
    });
    
    return groups;
  }, [messages]);

  return (
    <div className="h-[calc(100vh-120px)] px-2 sm:px-4 py-4 sm:py-6 bg-gradient-to-b from-gray-900 to-black">
      <div className="h-full max-w-5xl mx-auto flex flex-col rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-black/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-black ${socketConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {conversation?.userId === currentUserId ? 'Worker' : 'User'} Chat
              </h2>
              <div className="flex items-center gap-1.5">
                {socketConnected ? (
                  <>
                    <Wifi className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-400" />
                    <span className="text-xs text-green-400">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400" />
                    <span className="text-xs text-yellow-400">Reconnecting...</span>
                  </>
                )}
                <span className="text-white/30 mx-1">•</span>
                <span className="text-xs text-white/50">{messages.length} messages</span>
              </div>
            </div>
          </div>
        </div>

        {/* Typing indicator */}
        {typingName && (
          <div className="px-4 sm:px-6 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-pink-400 rounded-full animate-bounce" />
              </div>
              <span className="text-xs sm:text-sm text-pink-300">
                <span className="font-medium">{typingName}</span> is typing...
              </span>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 bg-gradient-to-b from-black/30 to-black/10"
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500 animate-spin" />
                <p className="text-xs sm:text-sm text-white/60">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/50">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <Send className="h-5 w-5 sm:h-6 sm:w-6 text-white/30" />
              </div>
              <p className="text-base sm:text-lg font-medium text-center">No messages yet</p>
              <p className="text-xs sm:text-sm text-center mt-1 text-white/40">Start the conversation</p>
            </div>
          ) : (
            groupedMessages.map((item, index) => {
              if (item.type === "date") {
                return (
                  <div key={`date-${index}`} className="flex justify-center my-2 sm:my-3">
                    <span className="px-2 sm:px-3 py-1 text-xs bg-white/5 rounded-full text-white/50">
                      {item.date ? new Date(item.date).toLocaleDateString([], { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'Unknown date'}
                    </span>
                  </div>
                );
              }

              const m = item.data;
              const isOwnMessage = user?.id && String(m.senderId) === String(user.id);
              const canDelete = isOwnMessage;
              const status = isOwnMessage ? getMessageStatus(m) : null;

              return (
                <div 
                  key={String(m._id)} 
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} relative group`}
                  onMouseLeave={() => setSelectedMessage(null)}
                >
                  {!isOwnMessage && (
                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                    </div>
                  )}
                  
                  <div className={`relative max-w-[85%] sm:max-w-[70%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                    {/* Message actions */}
                    {canDelete && (
                      <div className={`absolute -left-8 sm:-left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${selectedMessage === m._id ? 'opacity-100' : ''}`}>
                        <button
                          onClick={() => deleteMsg(m._id)}
                          className="p-1 sm:p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-300 transition-colors"
                          aria-label="Delete message"
                        >
                          <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border ${
                        isOwnMessage
                          ? "bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400/30 text-white rounded-br-none shadow-lg shadow-pink-600/20"
                          : "bg-white/10 border-white/15 text-white rounded-bl-none shadow-lg shadow-black/20"
                      } ${selectedMessage === m._id ? 'ring-2 ring-pink-500/50' : ''}`}
                      onClick={() => setSelectedMessage(selectedMessage === m._id ? null : m._id)}
                    >
                      <div className="break-words text-xs sm:text-sm leading-relaxed">
                        {m.text}
                      </div>
                      
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isOwnMessage ? 'text-white/70' : 'text-white/50'}`}>
                        <span className="text-[10px] sm:text-xs">
                          {formatTime(m.createdAt)}
                        </span>
                        {isOwnMessage && status && getStatusIcon(status)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="absolute bottom-24 right-4 sm:right-8 p-2 sm:p-3 rounded-full bg-pink-600 hover:bg-pink-500 shadow-lg transition-all animate-bounce z-10"
            aria-label="Scroll to bottom"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7m14-8l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Error message */}
        {error && (
          <div className="px-4 sm:px-6 py-2 bg-red-500/20 border-t border-red-500/30">
            <div className="flex items-center gap-2 text-red-300">
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <p className="text-xs sm:text-sm flex-1">{error}</p>
              <button 
                onClick={() => setError("")}
                className="text-red-300 hover:text-red-200"
              >
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-white/10 p-3 sm:p-4 bg-black/30">
          <div className="flex gap-2 sm:gap-3">
            <input
              className="flex-1 rounded-xl sm:rounded-2xl border border-white/20 bg-black/40 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-pink-500/70 focus:ring-1 focus:ring-pink-500/30 transition-all"
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
              disabled={sending}
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 font-medium text-xs sm:text-sm"
              aria-label="Send message"
            >
              {sending ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-2 text-[10px] sm:text-xs text-white/30 text-center">
            Press Enter to send • Messages are end-to-end encrypted
          </div>
        </div>
      </div>
    </div>
  );
}