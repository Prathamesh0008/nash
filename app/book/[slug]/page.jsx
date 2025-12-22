"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  Star, 
  ChevronLeft,
  Shield,
  CreditCard,
  Gift,
  Sparkles,
  CalendarDays,
  Clock4,
  Wallet,
  MessageCircle,
  Phone,
  X,
  Bell
} from "lucide-react";
import { providers } from "@/data/providers";

export default function BookPage() {
  const { slug } = useParams();
  const router = useRouter();
  const provider = providers.find((p) => p.slug === slug);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("2");
  const [specialRequests, setSpecialRequests] = useState("");
  const [selectedServices, setSelectedServices] = useState(["dinner-dates"]);
  const [error, setError] = useState("");

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#0b0214] via-purple-950 to-black">
        Provider not found
      </div>
    );
  }

  const services = [
    { id: "dinner-dates", label: "Dinner Dates", icon: "🍽️", price: provider.ratePerHour },
    { id: "events", label: "Event Escort", icon: "🎭", price: provider.ratePerHour * 1.2 },
    { id: "travel", label: "Travel Companion", icon: "✈️", price: provider.ratePerHour * 1.5 },
    { id: "social", label: "Social Events", icon: "🥂", price: provider.ratePerHour },
  ];

  const calculateTotal = () => {
    let base = 0;
    selectedServices.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (service) base += service.price;
    });
    
    if (duration === "overnight") {
      return provider.overnightRate || provider.ratePerHour * 8;
    }
    return base * Number(duration);
  };

  const total = calculateTotal();
  const deposit = total * 0.3;

  const submit = (e) => {
    e.preventDefault();
    if (!date) {
      setError("Please select a date");
      return;
    }
    // Show booking confirmation
    alert(`Booking confirmed!\n\nTotal: €${total}\nDeposit: €${deposit}\nDate: ${date}\nDuration: ${duration === "overnight" ? "Overnight" : `${duration} hours`}`);
  };

  const toggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0214] via-purple-950 to-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-pink-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Profile
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE - PROVIDER & DETAILS */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="rounded-3xl bg-gradient-to-r from-white/5 via-white/5 to-white/3 backdrop-blur-sm border border-white/10 p-6">
              <div className="flex items-start gap-5">
                {/* Provider Image */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-pink-500/30">
                  <Image
                    src={provider.images?.[0]}
                    alt={provider.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-light">
                        Booking with <span className="font-semibold">{provider.name}</span>
                      </h1>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Verified
                        </span>
                        <span className="flex items-center gap-1.5 text-white/60 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {provider.rating} ({provider.reviewsCount} reviews)
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-white/60">Hourly Rate</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        €{provider.ratePerHour}<span className="text-lg">/h</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-white/70">
                    <MapPin className="h-4 w-4" />
                    {provider.location}
                  </div>
                </div>
              </div>
            </div>

            {/* Services Selection */}
            <div className="rounded-3xl bg-gradient-to-b from-white/5 to-white/3 backdrop-blur-sm border border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-400" />
                Select Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedServices.includes(service.id)
                        ? "border-pink-500 bg-pink-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{service.icon}</span>
                        <span className="font-medium">{service.label}</span>
                      </div>
                      <div className={`h-4 w-4 rounded-full border-2 ${
                        selectedServices.includes(service.id)
                          ? "bg-pink-500 border-pink-500"
                          : "border-white/30"
                      }`}>
                        {selectedServices.includes(service.id) && (
                          <div className="h-2 w-2 bg-white rounded-full m-auto mt-0.5"></div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-white/60">
                      €{service.price}/hour
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-gradient-to-b from-white/5 to-white/3 backdrop-blur-sm border border-white/10 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-pink-400" />
                  Select Date
                </h3>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setError("");
                    }}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-pink-500 text-white placeholder-white/40"
                  />
                </div>
                <div className="mt-4 text-sm text-white/60">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span>Available dates show in calendar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                    <span>Unavailable dates are blocked</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-b from-white/5 to-white/3 backdrop-blur-sm border border-white/10 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock4 className="h-5 w-5 text-pink-400" />
                  Duration
                </h3>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10" />
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-pink-500 text-white"
                  >
                    <option value="1">1 Hour - €{provider.ratePerHour}</option>
                    <option value="2">2 Hours - €{provider.ratePerHour * 2}</option>
                    <option value="3">3 Hours - €{provider.ratePerHour * 3}</option>
                    <option value="4">4 Hours - €{provider.ratePerHour * 4}</option>
                    <option value="overnight">Overnight - €{provider.overnightRate || provider.ratePerHour * 8}</option>
                  </select>
                </div>
                <div className="mt-4 space-y-2 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Flexible extensions available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="rounded-3xl bg-gradient-to-b from-white/5 to-white/3 backdrop-blur-sm border border-white/10 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5 text-pink-400" />
                Special Requests
              </h3>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special preferences, locations, or requirements..."
                className="w-full h-32 px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-pink-500 text-white placeholder-white/40 resize-none"
              />
            </div>
          </div>

          {/* RIGHT SIDE - BOOKING SUMMARY */}
          <div className="space-y-8">
            {/* Booking Summary */}
            <div className="rounded-3xl bg-gradient-to-b from-white/5 to-white/3 backdrop-blur-sm border border-white/10 p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Booking Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Base Rate</span>
                  <span>€{provider.ratePerHour}/hour</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Selected Services</span>
                  <span>{selectedServices.length} service(s)</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Duration</span>
                  <span>
                    {duration === "overnight" ? "Overnight" : `${duration} hour${duration !== "1" ? "s" : ""}`}
                  </span>
                </div>
                
                <div className="h-px bg-white/10 my-2"></div>
                
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    €{total}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm text-white/60">
                  <span>Required Deposit (30%)</span>
                  <span>€{deposit}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={submit}
                className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-semibold flex items-center justify-center gap-3 hover:from-pink-500 hover:to-purple-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-pink-900/30"
              >
                <CreditCard className="h-5 w-5" />
                Confirm & Pay Deposit
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full mt-3 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 font-semibold hover:bg-white/20 transition-all"
              >
                Cancel Booking
              </button>
            </div>

            {/* Security & Support */}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-900/20 to-emerald-900/10 backdrop-blur-sm border border-emerald-500/20 p-6">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="h-6 w-6 text-emerald-400" />
                <div>
                  <h3 className="font-semibold text-emerald-300">Secure Booking</h3>
                  <p className="text-sm text-white/60 mt-1">
                    Your payment and personal information are protected with bank-level security.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span>Verified provider identity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span>Refundable deposit system</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div className="rounded-3xl bg-gradient-to-r from-blue-900/20 to-blue-900/10 backdrop-blur-sm border border-blue-500/20 p-6">
              <h3 className="font-semibold mb-4">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full py-2.5 rounded-xl bg-white/10 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat with Support
                </button>
                <button className="w-full py-2.5 rounded-xl bg-white/10 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  Call Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}