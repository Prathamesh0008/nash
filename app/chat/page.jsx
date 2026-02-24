"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Plus,
  RefreshCw,
  Users,
  UserRound,
  Clock,
  ChevronRight,
  Send,
  Search,
  AlertCircle,
  Star,
} from "lucide-react";

function timeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

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
}

export default function ChatHomePage() {
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [workerSearch, setWorkerSearch] = useState("");
  const [workerId, setWorkerId] = useState("");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const loadConversations = async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");

      const res = await fetch("/api/chat/conversations", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load conversations.");
        setConversations([]);
        return;
      }

      setConversations(Array.isArray(data.conversations) ? data.conversations : []);
    } catch {
      setError("Network error while loading conversations.");
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadWorkers = async () => {
    try {
      setWorkersLoading(true);
      const res = await fetch("/api/workers", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setWorkers([]);
        return;
      }
      setWorkers(
        (data.workers || []).map((row) => ({
          id: String(row.id),
          name: row.name || "Therapist",
          city: row.serviceAreas?.[0]?.city || "",
          rating: Number(row.ratingAvg || 0),
        }))
      );
    } catch {
      setWorkers([]);
    } finally {
      setWorkersLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    loadWorkers();

    const timer = setInterval(() => {
      loadConversations({ silent: true });
    }, 12000);

    return () => clearInterval(timer);
  }, []);

  const filteredWorkers = useMemo(() => {
    const q = workerSearch.trim().toLowerCase();
    if (!q) return workers.slice(0, 50);
    return workers
      .filter((row) => `${row.name} ${row.city}`.toLowerCase().includes(q))
      .slice(0, 50);
  }, [workers, workerSearch]);

  const startConversation = async () => {
    if (!workerId || starting) return;

    setStarting(true);
    setMsg("");
    setError("");

    try {
      const res = await fetch("/api/chat/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ workerUserId: workerId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok || !data.conversationId) {
        setError(data.error || "Failed to start conversation.");
        return;
      }

      setMsg("Conversation created. Opening chat...");
      router.push(`/chat/${data.conversationId}`);
    } catch {
      setError("Network error while creating conversation.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
                <MessageCircle className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">Messages</h1>
                <p className="text-sm text-slate-400">Real-time chat with therapists and support</p>
              </div>
            </div>
            <button
              onClick={() => loadConversations({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:rounded-2xl sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-lg font-semibold text-white">Start New Conversation</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full rounded-lg border border-white/10 bg-slate-900 py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                placeholder="Search therapist by name or city"
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
              />
            </label>

            <select
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              disabled={workersLoading}
            >
              <option value="">{workersLoading ? "Loading therapists..." : "Select therapist"}</option>
              {filteredWorkers.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name} {row.city ? `(${row.city})` : ""}
                </option>
              ))}
            </select>
          </div>

          {workerId && (
            <p className="mt-2 text-xs text-slate-400">
              Selected worker ID: <span className="text-slate-300">{workerId}</span>
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={startConversation}
              disabled={!workerId || starting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {starting ? "Starting..." : "Start Chat"}
            </button>
            <Link href="/workers" className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-100">
              Browse Therapists
            </Link>
          </div>

          {msg && <div className="mt-3 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400">{msg}</div>}
          {error && <div className="mt-3 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400">{error}</div>}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white sm:text-xl">Your Conversations</h2>
            {conversations.length > 0 && (
              <span className="text-xs text-slate-500">
                {conversations.length} {conversations.length === 1 ? "chat" : "chats"}
              </span>
            )}
          </div>

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-20 animate-pulse rounded-xl border border-white/10 bg-slate-900/40" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            </div>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 sm:py-16">
              <div className="rounded-full bg-slate-800/50 p-4">
                <MessageCircle className="h-8 w-8 text-slate-600 sm:h-12 sm:w-12" />
              </div>
              <p className="mt-4 text-sm text-slate-400">No conversations yet</p>
              <p className="text-xs text-slate-500">Select a therapist above and start chatting</p>
            </div>
          )}

          {!loading && !error && conversations.length > 0 && (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Link key={conversation.id} href={`/chat/${conversation.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition-all hover:border-fuchsia-500/30 hover:bg-white/[0.04] sm:rounded-2xl sm:p-6">
                    {conversation.unreadCount > 0 && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-fuchsia-500 to-violet-500" />
                    )}

                    <div className="flex items-start gap-3 sm:gap-4">
                      <div
                        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                          conversation.unreadCount > 0
                            ? "bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20"
                            : "bg-slate-800"
                        }`}
                      >
                        <Users
                          className={`h-6 w-6 ${conversation.unreadCount > 0 ? "text-fuchsia-400" : "text-slate-400"}`}
                        />
                        {conversation.unreadCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white">
                            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3
                              className={`truncate font-semibold ${
                                conversation.unreadCount > 0 ? "text-white" : "text-slate-300"
                              }`}
                            >
                              {conversation.name || "Unknown User"}
                            </h3>
                            <p className="mt-1 line-clamp-1 text-sm text-slate-400">
                              {conversation.lastMessage || "No messages yet"}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5" />
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                          {conversation.lastMessageAt && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="h-3 w-3" />
                              {timeAgo(conversation.lastMessageAt)}
                            </span>
                          )}
                          {conversation.lastMessageStatus && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] ${
                                conversation.lastMessageStatus === "delivered"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : conversation.lastMessageStatus === "read"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-slate-500/20 text-slate-400"
                              }`}
                            >
                              {conversation.lastMessageStatus}
                            </span>
                          )}
                          {typeof conversation.unreadCount === "number" && conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[10px] text-fuchsia-300">
                              <Star className="h-3 w-3" />
                              {conversation.unreadCount} unread
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
