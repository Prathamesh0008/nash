import Link from "next/link";

export default function BrandLogo({ compact = false }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      {/* Logo mark */}
      <div
        className={`
          relative rounded-2xl bg-gradient-to-br 
          from-pink-500 via-purple-600 to-pink-500 
          flex items-center justify-center overflow-hidden
          ${compact ? "h-8 w-8" : "h-10 w-10 md:h-12 md:w-12"}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent" />
        <span className="relative z-10 text-lg font-bold tracking-tight">V</span>
      </div>

      {/* Brand text */}
      <div className="flex flex-col leading-tight">
        <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
          Valentina&apos;s
        </span>

        {!compact && (
          <span className="text-xs text-white/60 tracking-[0.2em] uppercase">
            Premium Companions
          </span>
        )}
      </div>
    </Link>
  );
}