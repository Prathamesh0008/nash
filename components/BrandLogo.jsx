// components/BrandLogo.jsx
import Link from "next/link";

export default function BrandLogo({ compact = false }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      {/* Icon/Logo */}
      <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent"></div>
        <span className="text-lg md:text-xl font-bold tracking-tighter relative z-10">V</span>
      </div>
      
      {/* Text - ALWAYS SHOW on all screens */}
      <div className="flex flex-col">
        <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
          Valentina's
        </span>
        <span className="text-xs text-white/60 tracking-[0.2em] uppercase">
          Premium Companions
        </span>
      </div>
    </Link>
  );
}