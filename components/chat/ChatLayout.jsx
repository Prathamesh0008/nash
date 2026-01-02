export default function ChatLayout({ list, chat, sidebar }) {
  return (
    <div className="h-200  bg-gradient-to-br pt-10 from-[#0b0214] via-purple-950 to-black">
      <div className="h-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr_300px]">

        {/* LEFT LIST */}
        <aside className="hidden lg:flex flex-col border-r border-white/10 bg-black/30">
          {list}
        </aside>

        {/* CENTER CHAT (PRIMARY FOCUS) */}
        <main className="flex justify-center items-stretch px-4">
          <div className="w-full max-w-[720px] flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden my-4">
            {chat}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:flex flex-col border-l border-white/10 bg-black/30">
          {sidebar}
        </aside>

      </div>
    </div>
  );
}
