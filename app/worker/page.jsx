"use client";

import { useState } from "react";

export default function WorkerRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    service: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    // Backend will be connected later
    console.log("Worker Register Data:", {
      ...form,
      role: "worker",
    });

    alert("Worker registration submitted (mock)");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b0214] to-black text-white flex items-center justify-center px-4">
      
      <div className="w-full max-w-md relative">
        {/* Glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-600/20 to-purple-600/20 blur-2xl" />

        <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold">Create Worker Account</h1>
            <p className="text-white/70 text-sm mt-2">
              Register to get daily home service work
            </p>
          </div>

          {/* Full Name */}
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full mb-4 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500/20"
          />

          {/* Email (PRIMARY LOGIN FIELD) */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full mb-4 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500/20"
          />

          {/* Mobile */}
          <input
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            className="w-full mb-4 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20"
          />

          {/* Service */}
          <select
            name="service"
            value={form.service}
            onChange={handleChange}
            className="w-full mb-4 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
          >
            <option value="">Select Service Type</option>
            <option value="cleaning">Cleaning (Jhadu Pocha)</option>
            <option value="cooking">Cooking</option>
            <option value="utensils">Utensil Cleaning</option>
            <option value="elder">Elder Support</option>
          </select>

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-6 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20"
          />

          {/* CTA */}
          <button
            onClick={handleRegister}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 transition shadow-lg shadow-purple-600/20"
          >
            Register as Worker
          </button>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-white/60">
            Already registered?{" "}
            <span
              onClick={() => (window.location.href = "/login")}
              className="text-pink-400 hover:underline cursor-pointer"
            >
              Login here
            </span>
          </div>

        </div>
      </div>
    </main>
  );
}
