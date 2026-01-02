"use client";

import { useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatSocket } from "@/hooks/useChatSocket";

export default function ChatPage() {
  const conversationId = "demo-id";
  const user = { name: "Alexander" };

  const { messages, addMessage } = useChatMessages(conversationId);
  const [text, setText] = useState("");

  useChatSocket({
    conversationId,
    onMessage: (msg) => addMessage(msg),
  });

  const sendMessage = () => {
    if (!text.trim()) return;

    addMessage({
      id: Date.now(),
      text,
      from: "me",
      time: "Now",
    });

    setText("");
  };

  return (
    <div className=" overflow-hidden">
      <ChatLayout
        list={<div className="h-full">Chat List</div>}
        sidebar={<div className="h-full">Booking Info</div>}
        chat={
          <div className="flex flex-col h-full">
            {/* HEADER */}
            <div className="shrink-0">
              <ChatHeader user={user} />
            </div>

            {/* MESSAGES (ONLY SCROLL AREA) */}
            <div className="flex-1 min-h-0">
              <MessageList messages={messages} />
            </div>

            {/* INPUT */}
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
