"use client";

import { useState } from "react";

export default function EarningCalculator() {
  const [hours, setHours] = useState(4);
  const [rate, setRate] = useState(5);

  const daily = hours * rate * 10;
  const monthly = daily * 30;

  return (
    <div className="max-w-xl bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-2xl font-bold mb-6">Earning Calculator</h3>

      <div className="space-y-6">
        {/* Hours */}
        <div>
          <label className="text-sm text-gray-400">
            Hours per day: <span className="text-white">{hours}</span>
          </label>
          <input
            type="range"
            min="1"
            max="12"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>

        {/* Rate */}
        <div>
          <label className="text-sm text-gray-400">
            Sessions per hour: <span className="text-white">{rate}</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>

        {/* Results */}
        <div className="border-t border-gray-800 pt-4 space-y-2">
          <p className="text-gray-400">
            Daily Earnings: <span className="text-emerald-400 font-bold">${daily}</span>
          </p>
          <p className="text-gray-400">
            Monthly Earnings:{" "}
            <span className="text-emerald-500 font-bold">${monthly}</span>
          </p>
        </div>

        {/* CTA */}
        <a
          href="/models-join"
          className="block text-center mt-4 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Join & Start Earning
        </a>
      </div>
    </div>
  );
}
