export default function TimePicker({ time, setTime }) {
  const slots = [
    "10:00 AM",
    "12:00 PM",
    "2:00 PM",
    "4:00 PM",
    "6:00 PM",
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="font-semibold mb-3">Select Time</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {slots.map(t => (
          <button
            key={t}
            onClick={() => setTime(t)}
            className={`px-4 py-3 rounded-xl border ${
              time === t
                ? "bg-gradient-to-r from-pink-600 to-purple-600 border-transparent"
                : "bg-black/30 border-white/10 hover:bg-white/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
