"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, RefreshCw, ChevronRight } from "lucide-react";

function timeAgo(dateValue) {
  const date = new Date(dateValue);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const firstLoad = notifications.length === 0;
    if (firstLoad) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const res = await fetch("/api/notifications?limit=100", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load notifications");
        return;
      }
      setNotifications(data.notifications || []);
      setUnreadCount(Number(data.unreadCount || 0));
    } catch {
      setError("Network error while loading notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAsRead = async (id) => {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return;

    setNotifications((prev) =>
      prev.map((item) => (item._id === id ? { ...item, read: true, readAt: new Date().toISOString() } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    const res = await fetch("/api/notifications/read-all", {
      method: "PATCH",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    setMarkingAll(false);
    if (!res.ok || !data.ok) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true, readAt: new Date().toISOString() })));
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-12 sm:w-12">
                <Bell className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Notifications</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  {unreadCount > 0 ? (
                    <span className="text-fuchsia-400">{unreadCount} unread</span>
                  ) : (
                    "All caught up"
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={load}
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white disabled:opacity-60 sm:rounded-xl sm:px-4"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={markingAll}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-3 py-2 text-sm text-white transition hover:opacity-90 disabled:opacity-60 sm:rounded-xl sm:px-4"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Mark All Read</span>
                  <span className="sm:hidden">{markingAll ? "..." : "All Read"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {!!error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 sm:py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-fuchsia-500"></div>
            <p className="mt-4 text-sm text-slate-400">Loading notifications...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 sm:py-16">
            <Bell className="h-12 w-12 text-slate-600 sm:h-16 sm:w-16" />
            <p className="mt-4 text-sm text-slate-400 sm:text-base">No notifications available</p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`group relative overflow-hidden rounded-xl border transition-all sm:rounded-2xl ${
                  notification.read
                    ? "border-white/5 bg-white/[0.02]"
                    : "border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-500/5 to-violet-500/5"
                }`}
              >
                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-fuchsia-500 to-violet-500" />
                )}

                <div className="p-4 sm:p-6">
                  {/* Main Content */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                        <h3 className={`text-base font-semibold sm:text-lg ${
                          notification.read ? "text-slate-300" : "text-white"
                        } break-words`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-slate-500">
                          {timeAgo(notification.createdAt)}
                        </span>
                      </div>
                      
                      {notification.body && (
                        <p className="mt-1 break-words text-sm text-slate-400 sm:mt-2">
                          {notification.body}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 transition hover:border-fuchsia-400/50 hover:text-white sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-sm"
                        >
                          <CheckCheck className="h-3 w-3" />
                          <span className="hidden sm:inline">Mark Read</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Link */}
                  {notification.href && (
                    <div className="mt-3 border-t border-white/10 pt-3 sm:mt-4 sm:pt-4">
                      <Link
                        href={notification.href}
                        className="inline-flex items-center gap-1 text-sm text-fuchsia-400 transition hover:text-fuchsia-300"
                      >
                        View details
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
