// app/messages/page.jsx
"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Mail,
  Clock,
  CheckCircle,
  Star,
  Shield,
  ChevronRight,
  Users,
  Archive,
  Trash2,
  Settings,
  Plus,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

const conversations = [
  {
    id: 1,
    name: "Alexander",
    age: 32,
    lastMessage: "Looking forward to our meeting!",
    time: "10:37 AM",
    unread: 2,
    isVIP: true,
    rating: 4.9,
    isVerified: true,
    status: "online",
  },
  {
    id: 2,
    name: "Michael",
    age: 45,
    lastMessage: "Are you available this weekend?",
    time: "Yesterday",
    unread: 0,
    isVIP: false,
    rating: 4.7,
    isVerified: true,
    status: "offline",
  },
  {
    id: 3,
    name: "David",
    age: 38,
    lastMessage: "Confirmed the booking details",
    time: "2 days ago",
    unread: 0,
    isVIP: true,
    rating: 5.0,
    isVerified: true,
    status: "online",
  },
  {
    id: 4,
    name: "Robert",
    age: 29,
    lastMessage: "Can we reschedule?",
    time: "3 days ago",
    unread: 1,
    isVIP: false,
    rating: 4.5,
    isVerified: false,
    status: "offline",
  },
];

const breadcrumbs = [
  { label: "Dashboard", href: "/" },
  { label: "Messages", href: "/messages", current: true },
];

export default function MessagesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredConversations = conversations.filter((conv) => {
    if (activeFilter === "unread" && conv.unread === 0) return false;
    if (activeFilter === "vip" && !conv.isVIP) return false;
    if (searchQuery) {
      return conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleConversationClick = (id) => {
    router.push(`/chat?conversation=${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0214] via-purple-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="text-white/40 mx-2">/</span>}
                <a
                  href={crumb.href}
                  className={`transition-colors ${
                    crumb.current
                      ? "text-white font-medium"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {crumb.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* New Message Button */}
            <button className="w-full p-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 font-semibold flex items-center justify-center gap-2 hover:from-pink-500 hover:to-purple-500 transition-all">
              <Plus className="h-5 w-5" />
              New Message
            </button>

            {/* Filters */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h3>
              <div className="space-y-2">
                {["all", "unread", "vip", "archived", "trash"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeFilter === filter
                        ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
              <h3 className="font-semibold mb-4">Conversation Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Total</span>
                  <span className="font-medium">{conversations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Unread</span>
                  <span className="font-medium text-pink-400">
                    {conversations.filter(c => c.unread > 0).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">VIP Clients</span>
                  <span className="font-medium text-amber-400">
                    {conversations.filter(c => c.isVIP).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Response Rate</span>
                  <span className="font-medium text-emerald-400">98%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-semibold">Messages</h1>
                    <p className="text-white/60">Manage your conversations</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-pink-500/50"
                      />
                    </div>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <Settings className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4">
                  {["Inbox", "Requests", "Archived", "Spam"].map((tab) => (
                    <button
                      key={tab}
                      className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages List */}
              <div className="divide-y divide-white/10">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation.id)}
                    className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-lg font-bold">
                            {conversation.name.charAt(0)}
                          </span>
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1a0b2e] ${
                            conversation.status === "online"
                              ? "bg-emerald-400"
                              : "bg-gray-500"
                          }`}
                        ></div>
                      </div>

                      {/* Message Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {conversation.name}, {conversation.age}
                            </h3>
                            {conversation.isVerified && (
                              <Shield className="h-4 w-4 text-emerald-400" />
                            )}
                            {conversation.isVIP && (
                              <div className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs">
                                VIP
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-sm text-white/60">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span>{conversation.rating}</span>
                            </div>
                            <span className="text-sm text-white/60">
                              {conversation.time}
                            </span>
                          </div>
                        </div>

                        <p className="text-white/70 truncate">
                          {conversation.lastMessage}
                        </p>

                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-white/40" />
                            <span className="text-white/60">
                              {conversation.unread > 0
                                ? `${conversation.unread} unread`
                                : "All read"}
                            </span>
                          </div>
                          {conversation.unread > 0 && (
                            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <ChevronRight className="h-5 w-5 text-white/40" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredConversations.length === 0 && (
                <div className="py-16 text-center">
                  <MessageSquare className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No messages found</h3>
                  <p className="text-white/60">Try adjusting your filters or search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}