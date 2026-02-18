"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, Plus, RefreshCw, Users, UserRound, Clock, ChevronRight, Send } from "lucide-react";

export default function ChatHomePage() {
  const [conversations, setConversations] = useState([]);
  const [workerId, setWorkerId] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/chat/conversations", { credentials: "include" });
    const data = await res.json();
    setConversations(data.conversations || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 12000);
    return () => clearInterval(timer);
  }, []);

  const start = async () => {
    if (!workerId) return;
    const res = await fetch("/api/chat/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ workerUserId: workerId }),
    });
    const data = await res.json();
    if (!data.ok) {
      setMsg(data.error || "Failed to start chat");
      return;
    }
    setMsg("Conversation created");
    window.location.href = `/chat/${data.conversationId}`;
  };

  // Helper to get time ago
  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
                <MessageCircle className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">Messages</h1>
                <p className="text-sm text-slate-400">
                  Real-time chat with workers and support
                </p>
              </div>
            </div>
            <button
              onClick={load}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white sm:rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Start New Chat Section */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:rounded-2xl sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-lg font-semibold text-white">Start New Conversation</h2>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none sm:rounded-xl"
                placeholder="Enter worker user ID"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
              />
            </div>
            <button
              onClick={start}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:rounded-xl sm:px-8"
            >
              <Send className="h-4 w-4" />
              Start Chat
            </button>
          </div>
          
          {msg && (
            <div className="mt-3 rounded-lg bg-fuchsia-500/10 p-3 text-sm text-fuchsia-400">
              {msg}
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white sm:text-xl">Your Conversations</h2>
            {conversations.length > 0 && (
              <span className="text-xs text-slate-500">
                {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
              </span>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-fuchsia-500"></div>
              <p className="mt-4 text-sm text-slate-400">Loading conversations...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 sm:py-16">
              <div className="rounded-full bg-slate-800/50 p-4">
                <MessageCircle className="h-8 w-8 text-slate-600 sm:h-12 sm:w-12" />
              </div>
              <p className="mt-4 text-sm text-slate-400">No conversations yet</p>
              <p className="text-xs text-slate-500">Start a new chat using the form above</p>
            </div>
          )}

          {/* Conversations Grid */}
          {!loading && conversations.length > 0 && (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/chat/${conversation.id}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition-all hover:border-fuchsia-500/30 hover:bg-white/[0.04] sm:rounded-2xl sm:p-6">
                    {/* Unread Indicator */}
                    {conversation.unreadCount > 0 && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-fuchsia-500 to-violet-500" />
                    )}

                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                        conversation.unreadCount > 0
                          ? "bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20"
                          : "bg-slate-800"
                      }`}>
                        <Users className={`h-6 w-6 ${
                          conversation.unreadCount > 0 ? "text-fuchsia-400" : "text-slate-400"
                        }`} />
                        {conversation.unreadCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-500 text-[10px] font-bold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className={`font-semibold truncate ${
                              conversation.unreadCount > 0 ? "text-white" : "text-slate-300"
                            }`}>
                              {conversation.name || "Unknown User"}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400 line-clamp-1">
                              {conversation.lastMessage || "No messages yet"}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5" />
                        </div>

                        {/* Footer */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                          {conversation.lastMessageAt && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="h-3 w-3" />
                              {timeAgo(conversation.lastMessageAt)}
                            </span>
                          )}
                          {conversation.lastMessageStatus && (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                              conversation.lastMessageStatus === 'delivered'
                                ? 'bg-blue-500/20 text-blue-400'
                                : conversation.lastMessageStatus === 'read'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-500/20 text-slate-400'
                            }`}>
                              {conversation.lastMessageStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}