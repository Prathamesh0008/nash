import Link from "next/link";

export default function BookingSummary({ provider, service, time }) {
  return (
    <aside className="bg-white/5 border border-white/10 rounded-3xl p-6 h-fit">
      <h3 className="text-xl font-semibold mb-4">
        Booking Summary
      </h3>

      <div className="space-y-3 text-sm text-white/80">
        <div>
          <span className="text-white/50">Provider</span>
          <div className="font-semibold text-white">
            {provider.name}
          </div>
        </div>

        <div>
          <span className="text-white/50">Service</span>
          <div>{service}</div>
        </div>

        <div>
          <span className="text-white/50">Time</span>
          <div>{time || "Not selected"}</div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="text-lg font-semibold text-pink-400">
            €{provider.ratePerHour}
          </div>
          <div className="text-white/50 text-xs">
            Demo pricing
          </div>
        </div>
      </div>

      <button
        disabled={!time}
        className={`w-full mt-6 py-3 rounded-xl font-semibold transition ${
          time
            ? "bg-gradient-to-r from-pink-600 to-purple-600"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        Confirm Booking
      </button>

      <Link
        href={`/providers/${provider.slug}`}
        className="block text-center text-sm text-white/50 mt-4 hover:text-white"
      >
        ← Back to profile
      </Link>
    </aside>
  );
}
