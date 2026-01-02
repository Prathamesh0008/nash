"use client";

import React, { useState } from "react"; // ✅ Ensure React + hooks are imported
import ChatLayout from "@/components/chat/ChatLayout";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatSocket } from "@/hooks/useChatSocket";

export default function ChatPage() {
  const conversationId = "demo-id"; // demo conversation for testing
  const user = { id: "u_me", name: "Alexander" }; // current user info

  // Custom hook to manage messages
  const { messages, addMessage } = useChatMessages(conversationId);
  const [text, setText] = useState("");

  // Socket connection for live messages
  useChatSocket({
    conversationId,
    onMessage: (msg) => addMessage(msg),
  });

  // Send a message
  const sendMessage = () => {
    if (!text.trim()) return;

    addMessage({
      id: Date.now(),
      senderId: user.id,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    setText("");
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#0b0214] via-purple-950 to-black text-white">
      <ChatLayout
        list={
          <div className="h-full p-4">
            <h2 className="font-semibold text-lg mb-4">Chat List</h2>
            {/* TODO: map real conversations here */}
          </div>
        }
        sidebar={
          <div className="h-full p-4">
            <h2 className="font-semibold text-lg mb-4">Booking Info</h2>
            {/* TODO: insert booking details */}
          </div>
        }
        chat={
          <div className="flex flex-col h-full">
            {/* HEADER */}
            <div className="shrink-0">
              <ChatHeader user={user} />
            </div>

            {/* MESSAGES SCROLL AREA */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <MessageList messages={messages} />
            </div>

            {/* INPUT BAR */}
            <div className="shrink-0">
              <MessageInput
                value={text}
                onChange={setText}
                onSend={sendMessage}
              />
            </div>
          </div>
        }
      />
    </div>
  );
}
