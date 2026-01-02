import { CheckCheck } from "lucide-react";

export default function MessageBubble({ message }) {
  const isMe = message.from === "me";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMe
            ? "bg-gradient-to-r from-pink-600 to-purple-600 rounded-br-md"
            : "bg-white/10 rounded-bl-md"
        }`}
      >
        <p>{message.text}</p>
        <div className="flex justify-end items-center gap-1 mt-1 text-[10px] opacity-60">
          {message.time}
          {isMe && <CheckCheck className="h-3 w-3" />}
        </div>
      </div>
    </div>
  );
}
