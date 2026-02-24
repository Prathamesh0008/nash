import Link from "next/link";
import Image from "next/image";

export default function WorkerCard({ w }) {
  const workerId = w.id || w.userId || w._id;
  const imageSrc =
    w.photoUrl && (w.photoUrl.startsWith("http") || w.photoUrl.startsWith("/"))
      ? w.photoUrl
      : "/globe.svg";

  return (
    <Link
      href={`/worker/${workerId}`}
      className="block rounded-2xl p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
    >
      <div className="flex gap-4">
        <Image
          src={imageSrc}
          alt={w.name || "Worker"}
          width={80}
          height={80}
          unoptimized
          className="w-20 h-20 rounded-xl object-cover border border-white/20"
        />

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg truncate">{w.name || "Worker"}</div>
          <div className="text-sm text-white/60">{w.city || "Unknown city"}</div>
          <div className="text-sm mt-1 text-white/80 line-clamp-1">
            <b>Services:</b> {w.services?.join(", ") || "Not specified"}
          </div>
          <div className="text-sm mt-1 text-white/70">
            Rating {w.ratingAvg || 0} ({w.ratingCount || 0})
          </div>
        </div>
      </div>
    </Link>
  );
}
