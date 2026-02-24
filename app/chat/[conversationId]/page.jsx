"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ChatBox from "@/components/ChatBox";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = Array.isArray(params?.conversationId) ? params.conversationId[0] : params?.conversationId;
  if (!conversationId) return <p className="rounded bg-rose-950 p-3 text-rose-300">Invalid conversation</p>;

  return (
    <section className="space-y-3">
      <Link
        href="/chat"
        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 hover:border-fuchsia-400/40"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to conversations
      </Link>
      <ChatBox conversationId={conversationId} />
    </section>
  );
}
