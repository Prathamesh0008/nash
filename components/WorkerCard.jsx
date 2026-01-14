export default function WorkerCard({ w }) {
  const imageSrc =
    w.photoUrl &&
    (w.photoUrl.startsWith("http") || w.photoUrl.startsWith("/"))
      ? w.photoUrl
      : "/globe.svg";

  return (
    <a
      href={`/worker/${w.id}`}
      className="block bg-white border rounded-xl p-4 hover:shadow"
    >
      <div className="flex gap-4">
        <img
          src={imageSrc}
          alt={w.name}
          className="w-20 h-20 rounded-lg object-cover border"
        />

        <div className="flex-1">
          <div className="font-semibold text-lg">{w.name}</div>
          <div className="text-sm text-gray-600">{w.city}</div>
          <div className="text-sm mt-1">
            <b>Services:</b> {w.services?.join(", ")}
          </div>
          <div className="text-sm mt-1 text-gray-700">
            ⭐ {w.ratingAvg} ({w.ratingCount})
          </div>
        </div>
      </div>
    </a>
  );
}
