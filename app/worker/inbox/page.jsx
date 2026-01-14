"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkerInboxPage() {
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
    <div className="bg-white border rounded-xl p-6">
      <h1 className="text-xl font-bold mb-4">Inbox</h1>

      {convos.length === 0 ? (
        <div className="text-gray-600">No chats yet</div>
      ) : (
        <div className="space-y-2">
          {convos.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/chat/${c.id}`)}
              className="w-full text-left border rounded p-3 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  Chat with <b>{c.name}</b>
                  {c.lastMessageAt && (
                    <div className="text-xs text-gray-500">
                      {new Date(c.lastMessageAt).toLocaleString()}
                    </div>
                  )}
                </div>

                {c.unreadCount > 0 && (
                  <span className="text-xs bg-black text-white px-2 py-1 rounded-full">
                    {c.unreadCount}
                  </span>
                )}
              </div>

              {c.lastMessage && (
                <div className="text-sm text-gray-700 mt-1 line-clamp-1">
                  {c.lastMessage}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
