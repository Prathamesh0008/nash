// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import { formatDistanceToNow } from "date-fns";
// import { Bell } from "lucide-react";

// export default function NotificationBell() {
//   const { user } = useAuth();
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showNotifications, setShowNotifications] = useState(false);
//   const dropdownRef = useRef(null);

//   // Load notifications from backend
//   async function loadNotifications() {
//     if (!user) return;

//     setLoading(true);
//     try {
//       const res = await fetch("/api/notifications", {
//         credentials: "include",
//         cache: "no-store",
//       });
//       const data = await res.json();
//       if (data.ok) {
//         // Actor info already populated from backend
//         setNotifications(data.notifications || []);
//       }
//     } catch (err) {
//       console.error("Failed to load notifications:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Poll notifications every 30s
//   useEffect(() => {
//     if (!user) return;

//     loadNotifications();
//     const interval = setInterval(loadNotifications, 30000);
//     return () => clearInterval(interval);
//   }, [user]);

//   // Mark a single notification as read
//   async function markAsRead(id) {
//     try {
//       const res = await fetch(`/api/notifications/${id}/read`, {
//         method: "PATCH",
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (data.ok) {
//         setNotifications(prev =>
//           prev.map(n => n._id === id ? { ...n, read: true, readAt: new Date() } : n)
//         );
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   // Mark all notifications as read
//   async function markAllAsRead() {
//     try {
//       const res = await fetch("/api/notifications/read-all", {
//         method: "PATCH",
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (data.ok) {
//         setNotifications(prev =>
//           prev.map(n => ({ ...n, read: true, readAt: new Date() }))
//         );
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowNotifications(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const unreadCount = notifications.filter(n => !n.read).length;
//   if (!user) return null;

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setShowNotifications(!showNotifications)}
//         className="relative p-2 rounded-lg hover:bg-white/10 transition-all"
//         aria-label="Notifications"
//       >
//         <Bell className="h-5 w-5" />
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
//             {unreadCount > 9 ? "9+" : unreadCount}
//           </span>
//         )}
//       </button>

//       {showNotifications && (
//         <div className="absolute right-0 mt-2 w-96 bg-black/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
//           <div className="p-4 border-b border-white/10 flex justify-between items-center">
//             <div className="font-semibold text-lg">Notifications</div>
//             {unreadCount > 0 && (
//               <button
//                 onClick={markAllAsRead}
//                 className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
//               >
//                 Mark all as read
//               </button>
//             )}
//           </div>

//           <div className="max-h-96 overflow-y-auto">
//             {loading ? (
//               <div className="p-4 text-sm text-gray-500 text-center">Loading...</div>
//             ) : notifications.length === 0 ? (
//               <div className="p-4 text-sm text-gray-500 text-center">No notifications yet</div>
//             ) : (
//               <div className="divide-y divide-gray-800">
//                 {notifications.map(n => (
//                   <div
//                     key={n._id}
//                     className={`flex gap-3 items-start p-3 cursor-pointer hover:bg-white/5 transition-colors ${n.read ? "" : "bg-white/5"}`}
//                     onClick={() => {
//                       if (!n.read) markAsRead(n._id);
//                       setShowNotifications(false);
//                       if (n.href) window.location.href = n.href;
//                     }}
//                   >
//                     {/* Actor / Sender */}
//                     {n.actor ? (
//                       <img
//                         src={n.actor.profilePhoto || "/users/default.png"}
//                         alt={n.actor.fullName}
//                         className="w-10 h-10 rounded-full object-cover border border-white/20"
//                       />
//                     ) : (
//                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600/50 to-purple-600/50 flex items-center justify-center text-xs text-white">
//                         SYS
//                       </div>
//                     )}

//                     <div className="flex-1 space-y-1">
//                       <div className="text-sm font-medium">
//                         {n.actor
//                           ? `${n.actor.fullName} sent you a ${n.type}`
//                           : n.title}
//                       </div>
//                       {n.body && <div className="text-gray-400 text-xs">{n.body}</div>}
//                       <div className="text-gray-500 text-xs">
//                         {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
//                       </div>

//                       {/* Worker reply / meta */}
//                       {n.meta?.replyText && (
//                         <div className="mt-1 p-2 bg-white/5 border-l border-pink-500/50 text-xs rounded">
//                           <b>Reply:</b> {n.meta.replyText}
//                         </div>
//                       )}
//                     </div>

//                     {!n.read && (
//                       <span className="w-2 h-2 rounded-full bg-pink-500 mt-1 flex-shrink-0"></span>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {notifications.length > 0 && (
//             <div className="p-3 border-t border-white/10 text-center text-sm text-gray-500">
//               {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  CheckCircle, 
  MessageCircle, 
  Star, 
  AlertCircle,
  Settings,
  X
} from "lucide-react";

const ICON_MAP = {
  message: MessageCircle,
  review: Star,
  review_reply: MessageCircle,
  status: AlertCircle,
  system: Settings
};

const TYPE_COLORS = {
  message: "text-blue-400",
  review: "text-yellow-400",
  review_reply: "text-green-400",
  status: "text-purple-400",
  system: "text-gray-400"
};

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Memoized notification fetcher
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const res = await fetch("/api/notifications", {
        credentials: "include",
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      if (data.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Poll notifications every 30s with cleanup
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    loadNotifications();
    
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  // Memoized derived values - MUST BE DECLARED BEFORE markAllAsRead
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const recentNotifications = useMemo(() => {
    return notifications.slice(0, 20); // Show only 20 most recent
  }, [notifications]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (id) => {
    if (!id) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      if (data.ok) {
        setNotifications(prev =>
          prev.map(n => 
            n._id === id 
              ? { ...n, read: true, readAt: new Date() } 
              : n
          )
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    } finally {
      setUpdating(false);
    }
  }, []);

  // Mark all notifications as read - NOW unreadCount is available
  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;
    
    setUpdating(true);
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        credentials: "include"
      });
      
      const data = await res.json();
      if (data.ok) {
        setNotifications(prev =>
          prev.map(n => ({ 
            ...n, 
            read: true, 
            readAt: new Date() 
          }))
        );
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    } finally {
      setUpdating(false);
    }
  }, [unreadCount]); // Add dependency

  // Handle notification click
  const handleNotificationClick = useCallback(async (notification) => {
    // Mark as read if not already
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    // Close dropdown
    setShowNotifications(false);
    
    // Navigate if href exists
    if (notification.href) {
      router.push(notification.href);
    }
  }, [markAsRead, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 group"
        aria-label="Notifications"
        disabled={updating}
      >
        <Bell className={`h-5 w-5 transition-all duration-200 ${
          showNotifications ? "text-pink-400" : "group-hover:text-pink-300"
        }`} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 min-w-[20px] flex items-center justify-center text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        
        {updating && (
          <span className="absolute inset-0 rounded-xl bg-white/5 animate-pulse" />
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-black/95 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/30 backdrop-blur-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-pink-400" />
              <div className="font-semibold text-lg">Notifications</div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-500 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={updating}
                  className="text-sm text-pink-400 hover:text-pink-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "..." : "Mark all read"}
                </button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="h-8 w-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mb-3"></div>
                <div className="text-sm text-gray-500">Loading notifications...</div>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-white/20 mx-auto mb-3" />
                <div className="text-sm text-gray-500">No notifications yet</div>
                <div className="text-xs text-gray-600 mt-1">We'll notify you when something arrives</div>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentNotifications.map((notification) => {
                  const Icon = ICON_MAP[notification.type] || Bell;
                  const typeColor = TYPE_COLORS[notification.type] || "text-gray-400";
                  
                  return (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex gap-3 items-start p-4 cursor-pointer transition-all duration-200 hover:bg-white/5 active:scale-[0.99] ${
                        notification.read ? "" : "bg-gradient-to-r from-pink-500/5 to-purple-500/5"
                      }`}
                    >
                      {/* Icon */}
                      <div className={`relative flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${typeColor} bg-white/10`}>
                        <Icon className="h-5 w-5" />
                        {!notification.read && (
                          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-pink-500 rounded-full border border-black"></span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-semibold truncate">
                            {notification.title}
                          </div>
                          <div className="text-xs text-gray-500 flex-shrink-0">
                            {notification.timeAgo || formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        
                        {notification.body && (
                          <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {notification.body}
                          </div>
                        )}
                        
                        {/* Actor info */}
                        {notification.actor && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1.5">
                              <img
                                src={notification.actor.profilePhoto || "/vercel.svg"}
                                alt={notification.actor.fullName}
                                className="h-5 w-5 rounded-full object-cover border border-white/20"
                               
                              />
                              <span className="text-xs text-gray-500">
                                {notification.actor.fullName || notification.actor.username}
                              </span>
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${typeColor} bg-white/5`}>
                              {notification.type}
                            </span>
                          </div>
                        )}
                        
                        {/* Meta data */}
                        {notification.meta?.replyText && (
                          <div className="mt-2 p-2 text-xs bg-white/5 border-l-2 border-pink-500/50 rounded">
                            <span className="font-medium text-pink-400">Reply: </span>
                            <span className="text-gray-400">{notification.meta.replyText}</span>
                          </div>
                        )}
                      </div>

                      {/* Status indicator */}
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {recentNotifications.length > 0 && (
            <div className="p-3 border-t border-white/10 bg-white/5 text-center">
              <div className="text-xs text-gray-500">
                Showing {recentNotifications.length} of {notifications.length} notifications
              </div>
              {notifications.length > 20 && (
                <button
                  onClick={() => router.push('/notifications')}
                  className="text-xs text-pink-400 hover:text-pink-300 mt-1"
                >
                  View all notifications →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}