"use client";

import { useParams } from "next/navigation";
import ChatBox from "@/components/ChatBox";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = Array.isArray(params?.conversationId) ? params.conversationId[0] : params?.conversationId;
  if (!conversationId) return <p className="rounded bg-rose-950 p-3 text-rose-300">Invalid conversation</p>;
  return <ChatBox conversationId={conversationId} />;
}
