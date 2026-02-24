"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications?limit=20", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (data.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(Number(data.unreadCount || 0));
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    loadNotifications();
    const timer = setInterval(loadNotifications, 25000);
    return () => clearInterval(timer);
  }, [user, loadNotifications]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const markAsRead = async (id) => {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    });
    const data = await res.json();
    if (!data.ok) return;

    setNotifications((prev) =>
      prev.map((item) => (item._id === id ? { ...item, read: true, readAt: new Date().toISOString() } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    const res = await fetch("/api/notifications/read-all", {
      method: "PATCH",
      credentials: "include",
    });
    const data = await res.json();
    if (!data.ok) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, read: true, readAt: new Date().toISOString() })));
    setUnreadCount(0);
  };

  const recentItems = useMemo(() => notifications.slice(0, 8), [notifications]);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded bg-slate-800 p-2 hover:bg-slate-700"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 text-xs text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 p-3">
            <p className="text-sm font-semibold text-white">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-sky-400 hover:text-sky-300">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && <p className="p-3 text-sm text-slate-400">Loading...</p>}
            {!loading && recentItems.length === 0 && (
              <p className="p-3 text-sm text-slate-400">No notifications yet.</p>
            )}

            {!loading &&
              recentItems.map((item) => (
                <button
                  key={item._id}
                  onClick={async () => {
                    if (!item.read) await markAsRead(item._id);
                    setOpen(false);
                    if (item.href) router.push(item.href);
                  }}
                  className={`block w-full border-b border-slate-800 p-3 text-left hover:bg-slate-900 ${
                    item.read ? "" : "bg-slate-900/70"
                  }`}
                >
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  {!!item.body && <p className="mt-1 text-xs text-slate-400">{item.body}</p>}
                  <p className="mt-1 text-[11px] text-slate-500">{timeAgo(item.createdAt)}</p>
                </button>
              ))}
          </div>

          <div className="border-t border-slate-800 p-2 text-center">
            <Link href="/notifications" className="text-xs text-sky-400 hover:text-sky-300" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
