export default function RatingStars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={n <= value ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </button>
      ))}
    </div>
  );
}
