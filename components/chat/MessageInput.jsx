import { Send, Smile, Paperclip } from "lucide-react";
import { useEffect, useRef } from "react";

export default function MessageInput({ value, onChange, onSend }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = Math.min(ref.current.scrollHeight, 100) + "px";
  }, [value]);

  return (
    <div className="border-t border-white/10 bg-black/40 px-4 py-3">
      <div className="flex items-end gap-3">
        <Paperclip className="h-5 w-5 text-white/50" />

        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={1}
          placeholder="Type a message…"
          className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder-white/40 max-h-[100px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />

        <Smile className="h-5 w-5 text-white/50" />

        <button
          onClick={onSend}
          className={`px-3 py-2 rounded-xl ${
            value.trim()
              ? "bg-gradient-to-r from-pink-600 to-purple-600"
              : "bg-white/10"
          }`}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
