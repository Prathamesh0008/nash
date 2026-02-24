import Link from "next/link";

export default function BookingSummary({ provider, service, time }) {
  const profileHref = provider?.id ? `/workers/${provider.id}` : "/workers";
  const currency = provider?.currency || "INR";

  return (
    <aside className="h-fit rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="mb-4 text-xl font-semibold">Booking Summary</h3>

      <div className="space-y-3 text-sm text-white/80">
        <div>
          <span className="text-white/50">Provider</span>
          <div className="font-semibold text-white">{provider.name}</div>
        </div>

        <div>
          <span className="text-white/50">Service</span>
          <div>{service}</div>
        </div>

        <div>
          <span className="text-white/50">Time</span>
          <div>{time || "Not selected"}</div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="text-lg font-semibold text-pink-400">
            {currency} {provider.ratePerHour}
          </div>
          <div className="text-xs text-white/50">Final pricing shown at checkout</div>
        </div>
      </div>

      <button
        disabled={!time}
        className={`mt-6 w-full rounded-xl py-3 font-semibold transition ${
          time ? "bg-gradient-to-r from-pink-600 to-purple-600" : "cursor-not-allowed bg-white/10 text-white/40"
        }`}
      >
        Confirm Booking
      </button>

      <Link href={profileHref} className="mt-4 block text-center text-sm text-white/50 hover:text-white">
        Back to profile
      </Link>
    </aside>
  );
}
