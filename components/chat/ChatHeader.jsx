import { Phone, Video, MoreVertical } from "lucide-react";

export default function ChatHeader({ user }) {
  return (
    <div className="h-16 px-5 flex items-center justify-between bg-black/30 border-b border-white/10">
      <div>
        <h3 className="font-semibold text-white leading-tight">
          {user.name}
        </h3>
        <p className="text-xs text-emerald-400">Online</p>
      </div>

      <div className="flex gap-4 text-white/70">
        <Phone className="h-5 w-5 hover:text-white cursor-pointer" />
        <Video className="h-5 w-5 hover:text-white cursor-pointer" />
        <MoreVertical className="h-5 w-5 hover:text-white cursor-pointer" />
      </div>
    </div>
  );
}
