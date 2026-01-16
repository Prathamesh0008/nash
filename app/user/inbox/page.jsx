"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserInboxPage() {
  const [convos, setConvos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/chat/conversations", { credentials: "include" });
      const data = await res.json();
      setConvos(data.conversations || []);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-2">Manage your conversations</p>
            </div>
            <div className="relative">
              <svg className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search conversations..."
                className="pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
              />
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-500 font-medium">Total Conversations</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{convos.length}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-500 font-medium">Unread Messages</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {convos.reduce((total, c) => total + (c.unreadCount || 0), 0)}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-500 font-medium">Active Now</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">-</div>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Recent Conversations</h2>
          </div>

          {convos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No conversations yet</h3>
              <p className="text-gray-500 max-w-md">
                Start a new conversation to connect with others. Your messages will appear here.
              </p>
              <button className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm">
                Start New Chat
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {convos.map((c) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/chat/${c.id}`)}
                  className="w-full text-left p-6 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-white transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md">
                        {c.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      {c.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{c.unreadCount}</span>
                        </div>
                      )}
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        true /* Replace with actual online status if available */
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`} />
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                            {c.name}
                          </h3>
                          {c.unreadCount > 0 && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full">
                              New messages
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                            {c.lastMessageAt && new Date(c.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5">
                            {c.lastMessageAt && new Date(c.lastMessageAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {c.lastMessage && (
                        <div className="flex items-start justify-between">
                          <p className="text-gray-600 truncate text-sm leading-relaxed group-hover:text-gray-800 transition-colors">
                            {c.lastMessage}
                          </p>
                          <div className="ml-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>You have {convos.length} conversation{convos.length !== 1 ? 's' : ''} • 
            <button className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium">
              Refresh list
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}