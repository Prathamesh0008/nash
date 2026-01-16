"use client";

import { use } from "react";
import ChatBox from "@/components/ChatBox";

export default function ChatPage({ params }) {
  // ✅ REQUIRED IN NEXT.JS 15
  const { conversationId } = use(params);

  return <ChatBox conversationId={conversationId} />;
}
