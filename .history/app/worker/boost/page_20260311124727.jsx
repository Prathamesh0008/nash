"use client";

import { useEffect, useState } from "react";
import { 
  Zap, 
  Clock, 
  MapPin, 
  Tag, 
  Wallet, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Award,
  Shield,
  Sparkles,
  ArrowRight,
  Star,
  Info
} from "lucide-react";

export default function WorkerBoostPage() {
  const [plans, setPlans] = useState([]);
  const [active, setActive] = useState([]);
  const [form, setForm] = useState({ 
    planId: "", 
    area: "Nerul", 
    category: "Massage", 
    paymentMethod: "online" 
  });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [plansRes, activeRes] = await Promise.all([
        fetch("/api/boost/plans"),
        fetch("/api/boost/active", { credentials: "include" }),
      ]);
      const [plansData, activeData] = await Promise.all([plansRes.json(), activeRes.json()]);
      setPlans(plansData.plans || []);
      setActive(activeData.boosts || []);
    } catch (error) {
      setMsg({ type: "error", text: "Failed to load boost data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (form.planId && plans.length > 0) {
      const plan = plans.find(p => p._id === form.planId);
      setSelectedPlan(plan || null);
    } else {
      setSelectedPlan(null);
    }
  }, [form.planId, plans]);

  const buy = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMsg({ type: "", text: "" });

    try {
      const res = await fetch("/api/boost/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (data.ok) {
        setMsg({ type: "success", text: "Boost activated successfully! Your profile will now rank higher." });
        load();
        // Reset form but keep area and category
        setForm(prev => ({ ...prev, planId: "" }));
      } else {
        setMsg({ type: "error", text: data.error || "Boost purchase failed" });
      }
    } catch (error) {
      setMsg({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setProcessing(false);
    }
  };

  const getBoostStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-emerald-400 bg-emerald-950/50 border-emerald-800';
      case 'expired': return 'text-slate-400 bg-slate-800 border-slate-700';
      case 'pending': return 'text-amber-400 bg-amber-950/50 border-amber-800';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-3">
              <Zap className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Boost Your Profile</h1>
          <p className="mt-2 text-slate-400">Get more visibility and attract more clients with premium placement</p>
        </div>

        {/* Stats Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-900/30 p-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Active Boosts</p>
                <p className="text-xl font-semibold text-white">{active.length}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-900/30 p-2">
                <Award className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Boost Score</p>
                <p className="text-xl font-semibold text-white">
                  {active.reduce((acc, b) => acc + (b.boostScore || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-900/30 p-2">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Categories Covered</p>
                <p className="text-xl font-semibold text-white">
                  {new Set(active.map(b => b.category).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Plans Section - Left Column */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">Choose Your Boost Plan</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-sky-500"></div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {plans.map((plan) => (
                    <div
                      key={plan._id}
                      onClick={() => setForm({ ...form, planId: plan._id })}
                      className={`group cursor-pointer rounded-xl border p-5 transition-all ${
                        form.planId === plan._id
                          ? "border-sky-500 bg-sky-950/30 ring-2 ring-sky-500/20"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{plan.name}</h3>
                          <p className="text-xs text-slate-400">{plan.description || "Boost your visibility"}</p>
                        </div>
                        {plan.popular && (
                          <span className="rounded-full bg-amber-950/50 px-2 py-1 text-[10px] font-medium text-amber-400">
                            Popular
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-white">₹{plan.price}</span>
                        <span className="text-xs text-slate-400">/{plan.durationDays} days</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span>{plan.durationDays} days duration</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
                          <span>Boost score: +{plan.boostScore || 10}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Shield className="h-3.5 w-3.5 text-slate-500" />
                          <span>Priority placement</span>
                        </div>
                      </div>

                      {form.planId === plan._id && (
                        <div className="mt-4 flex items-center gap-1 text-xs text-sky-400">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Selected</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Purchase Form - Right Column */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-white">Configure & Purchase</h2>
              
              <form onSubmit={buy} className="space-y-4">
                {/* Selected Plan Summary */}
                {selectedPlan && (
                  <div className="rounded-lg border border-sky-800 bg-sky-950/30 p-3">
                    <p className="mb-1 text-xs text-sky-400">Selected Plan</p>
                    <p className="font-medium text-white">{selectedPlan.name}</p>
                    <p className="text-xs text-slate-400">₹{selectedPlan.price} for {selectedPlan.durationDays} days</p>
                  </div>
                )}

                {/* Area Input */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">Target Area</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input 
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                      placeholder="e.g., Nerul, Vashi, CBD"
                      value={form.area} 
                      onChange={(e) => setForm({ ...form, area: e.target.value })} 
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Your profile will rank higher in this area</p>
                </div>

                {/* Category Input */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">Target Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input 
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none" 
                      placeholder="e.g., Massage, Companion, VIP"
                      value={form.category} 
                      onChange={(e) => setForm({ ...form, category: e.target.value })} 
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition ${
                        form.paymentMethod === "online"
                          ? "border-sky-500 bg-sky-950/30 text-sky-400"
                          : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={form.paymentMethod === "online"}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                        className="hidden"
                      />
                      <CreditCard className="h-4 w-4" />
                      <span className="text-xs">Online</span>
                    </label>
                    
                    <label
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition ${
                        form.paymentMethod === "wallet"
                          ? "border-sky-500 bg-sky-950/30 text-sky-400"
                          : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="wallet"
                        checked={form.paymentMethod === "wallet"}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                        className="hidden"
                      />
                      <Wallet className="h-4 w-4" />
                      <span className="text-xs">Wallet</span>
                    </label>
                  </div>
                </div>

                {/* Price Summary */}
                {selectedPlan && (
                  <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Total Amount</span>
                      <span className="font-semibold text-white">₹{selectedPlan.price}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <Info className="h-3 w-3" />
                      <span>Valid for {selectedPlan.durationDays} days from purchase</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!form.planId || processing}
                  className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-3 font-medium text-white transition-all hover:from-sky-500 hover:to-sky-400 disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {processing ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Activate Boost
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Message Display */}
              {msg.text && (
                <div className={`mt-4 rounded-lg p-3 ${
                  msg.type === "error"
                    ? "bg-rose-900/50 text-rose-300"
                    : "bg-emerald-900/50 text-emerald-300"
                }`}>
                  <div className="flex items-center gap-2">
                    {msg.type === "error" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Boosts Section */}
        <div className="mt-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Your Active Boosts</h2>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">
                {active.length} active
              </span>
            </div>

            {active.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 rounded-full bg-slate-800 p-3">
                  <Zap className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-400">No active boosts</p>
                <p className="text-xs text-slate-500">Purchase a boost to increase your visibility</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {active.map((boost) => (
                  <div
                    key={boost._id}
                    className={`rounded-lg border p-4 transition-all hover:scale-[1.02] ${getBoostStatusColor(boost.status)}`}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p className="font-medium text-white">{boost.plan?.name || "Boost Plan"}</p>
                        <p className="text-xs opacity-80">
                          {boost.area || "All Areas"} • {boost.category || "All Categories"}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase ${
                        boost.status === 'active' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {boost.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Boost Score</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-400" />
                          <span className="font-medium text-white">{boost.boostScore}</span>
                        </div>
                      </div>

                      {boost.expiresAt && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Expires</span>
                          <span className="text-white">{formatDate(boost.expiresAt)}</span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      {boost.status === 'active' && boost.expiresAt && (
                        <div className="mt-2">
                          <div className="h-1 overflow-hidden rounded-full bg-slate-700">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                              style={{
                                width: `${Math.max(0, Math.min(100, 
                                  ((new Date(boost.expiresAt) - new Date()) / 
                                  (boost.plan?.durationDays * 24 * 60 * 60 * 1000)) * 100
                                ))}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/30 p-4">
            <div className="rounded-lg bg-sky-900/30 p-2">
              <TrendingUp className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Higher Rankings</p>
              <p className="text-xs text-slate-400">Your profile appears at the top of search results</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/30 p-4">
            <div className="rounded-lg bg-purple-900/30 p-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">More Visibility</p>
              <p className="text-xs text-slate-400">Get seen by more potential clients in your area</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/30 p-4">
            <div className="rounded-lg bg-amber-900/30 p-2">
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Priority Support</p>
              <p className="text-xs text-slate-400">Get faster responses and dedicated assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}