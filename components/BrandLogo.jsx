import Link from "next/link";

export default function BrandLogo({ compact = false }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-600 via-violet-600 to-fuchsia-600 md:h-12 md:w-12">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent"></div>
        <span className="relative z-10 text-lg font-bold tracking-tight md:text-xl">N</span>
      </div>

      {!compact && (
        <div className="flex flex-col">
          <span className="bg-gradient-to-r from-fuchsia-300 via-violet-300 to-fuchsia-300 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
            Nash Wellness
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-white/60">Home Spa Services</span>
        </div>
      )}
    </Link>
  );
}
