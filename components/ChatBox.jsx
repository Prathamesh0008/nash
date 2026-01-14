"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/contexts/AuthContext";

export default function ChatBox({ conversationId }) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingName, setTypingName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const socket = useMemo(() => getSocket(), []);

  /* ---------------- LOAD MESSAGES ---------------- */
  async function loadMessages() {
    if (!conversationId) return;

    const res = await fetch(`/api/chat/messages/${conversationId}`, {
      credentials: "include",
    });
    const data = await res.json();

    if (data.ok) {
      setMessages(data.messages || []);
    }
  }

  /* ---------------- SOCKET SETUP ---------------- */
  useEffect(() => {
    if (!conversationId) return;

    loadMessages();

    socket.emit("join", conversationId);

    const onNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const onTyping = ({ name }) => {
      setTypingName(name || "Someone");
    };

    const onStopTyping = () => {
      setTypingName("");
    };

    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.filter((m) => String(m._id) !== String(messageId))
      );
    };

    socket.on("newMessage", onNewMessage);
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);
    socket.on("messageDeleted", onMessageDeleted);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
      socket.off("messageDeleted", onMessageDeleted);
    };
  }, [conversationId, socket]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- SEND MESSAGE ---------------- */
  async function send() {
    if (!text.trim() || !conversationId) return;

    const res = await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ conversationId, text }),
    });

    const data = await res.json();
    if (!data.ok) return;

    setText("");

    socket.emit("stopTyping", { conversationId });
    socket.emit("sendMessage", {
      conversationId,
      message: data.message,
    });
  }

  /* ---------------- TYPING HANDLER ---------------- */
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

  /* ---------------- DELETE MESSAGE ---------------- */
  async function deleteMsg(messageId) {
    const res = await fetch(`/api/chat/message/${messageId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();
    if (!data.ok) return;

    // optimistic UI
    setMessages((prev) =>
      prev.filter((m) => String(m._id) !== String(messageId))
    );

    socket.emit("messageDeleted", { conversationId, messageId });
  }

  return (
    <div className="flex mt-5 flex-col h-[calc(100vh-5rem)] sm:h-[70vh] w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-white rounded-none sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden text-white p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-400 animate-pulse"></div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Chat</h2>
              <p className="text-xs text-indigo-200 sm:hidden">Tap to view details</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xs sm:text-sm text-indigo-100 bg-white/20 px-2 sm:px-3 py-1 rounded-full">
              <span className="hidden sm:inline">{messages.length} messages</span>
              <span className="sm:hidden">{messages.length}</span>
            </div>
            <button className="hidden sm:block text-white hover:bg-white/20 p-1 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Optional) */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b">
          <div className="px-4 py-3 space-y-2">
            <button className="w-full text-left text-sm text-gray-700 py-2">Chat Details</button>
            <button className="w-full text-left text-sm text-gray-700 py-2">Mute Notifications</button>
            <button className="w-full text-left text-sm text-red-600 py-2">Clear Chat</button>
          </div>
        </div>
      )}

      {/* Typing Indicator */}
      {typingName && (
        <div className="px-4 sm:px-6 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
            <span className="text-xs sm:text-sm text-indigo-600 font-medium truncate">
              {typingName} is typing...
            </span>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 bg-gradient-to-b from-white via-gray-50/50 to-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-base sm:text-lg font-medium text-center">No messages yet</p>
            <p className="text-xs sm:text-sm text-center mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((m) => {
            const isOwnMessage = user?.id && String(m.senderId) === String(user.id);
            const canDelete = isOwnMessage;

            return (
              <div
                key={String(m._id)}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm ${
                    isOwnMessage
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none"
                      : "bg-white border border-gray-200 rounded-bl-none"
                  }`}
                >
                  {/* Message header with timestamp and delete button */}
                  <div className="flex items-center justify-between mb-1">
                    <div className={`text-xs ${isOwnMessage ? "text-indigo-100" : "text-gray-500"}`}>
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
                        className={`ml-2 sm:ml-3 p-1 transition-all duration-200 ${
                          isOwnMessage
                            ? "text-indigo-200 hover:text-white"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                        aria-label="Delete message"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Message content */}
                  <div className={`break-words text-sm sm:text-base ${isOwnMessage ? "" : "text-gray-800"}`}>
                    {m.text}
                  </div>

                  {/* Message date - hidden on mobile to save space */}
                  <div className={`text-xs mt-1 sm:mt-2 ${isOwnMessage ? "text-indigo-200" : "text-gray-400"} hidden sm:block`}>
                    {m.createdAt && !isNaN(new Date(m.createdAt))
                      ? new Date(m.createdAt).toLocaleDateString()
                      : ""}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 sm:p-4 md:p-6 bg-white">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <input
              className="w-full border border-gray-300 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3.5 pr-10 sm:pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white shadow-sm text-sm sm:text-base"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              aria-label="Message input"
            />
            <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <button
            onClick={send}
            disabled={!text.trim()}
            className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl sm:rounded-2xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-1 sm:space-x-2"
            aria-label="Send message"
          >
            <span className="text-sm sm:text-base">Send</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="mt-2 sm:mt-3 text-xs text-gray-500 text-center">
          <span className="hidden sm:inline">Press Enter to send • Click to delete your own messages</span>
          <span className="sm:hidden">Enter to send</span>
        </div>
      </div>

      {/* Mobile Floating Action Button (Optional) */}
      <div className="sm:hidden fixed bottom-20 right-4">
        <button
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg flex items-center justify-center"
          aria-label="Scroll to bottom"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </div>
  );
}