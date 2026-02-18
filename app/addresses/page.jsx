"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Home,
  Building,
  Plus,
  Save,
  Trash2,
  Star,
  Edit,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const emptyAddress = {
  label: "Home",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: true,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([emptyAddress]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/users/me", { credentials: "include" });
      const data = await res.json();
      if (data.ok) {
        setAddresses(data.user?.addresses?.length ? data.user.addresses : [emptyAddress]);
      }
    };
    load();
  }, []);

  const save = async () => {
    const clean = addresses.filter((item) => item.line1 && item.city && item.pincode);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ addresses: clean }),
    });
    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? "Addresses updated successfully" : data.error || "Failed to update");
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const removeAddress = (index) => {
    if (addresses.length <= 1) {
      setMsgType("error");
      setMsg("At least one address is required");
      setTimeout(() => {
        setMsg("");
        setMsgType("");
      }, 3000);
      return;
    }
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const setDefaultAddress = (index) => {
    setAddresses((prev) => prev.map((addr, i) => ({
      ...addr,
      isDefault: i === index
    })));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
                <MapPin className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Saved Addresses</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Manage your addresses for faster checkout
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {addresses.length} {addresses.length === 1 ? 'Address' : 'Addresses'}
              </span>
            </div>
          </div>
        </div>

        {/* Message Toast */}
        {msg && (
          <div className={`mb-4 rounded-lg p-3 text-sm sm:mb-6 ${
            msgType === "success" 
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
          }`}>
            <div className="flex items-center gap-2">
              {msgType === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {msg}
            </div>
          </div>
        )}

        {/* Address Cards */}
        <div className="space-y-4">
          {addresses.map((address, index) => (
            <div
              key={index}
              className={`group relative rounded-xl border transition-all ${
                address.isDefault
                  ? "border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 to-violet-500/10"
                  : "border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-fuchsia-500/30"
              }`}
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div className="absolute -top-2 left-4 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 px-3 py-0.5 text-xs font-medium text-white">
                  Default Address
                </div>
              )}

              <div className="p-4 sm:p-6">
                {/* Header with Actions */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-lg p-2 ${
                      address.label === "Home" 
                        ? "bg-emerald-500/20" 
                        : address.label === "Work" 
                        ? "bg-blue-500/20" 
                        : "bg-purple-500/20"
                    }`}>
                      {address.label === "Home" ? (
                        <Home className={`h-4 w-4 ${
                          address.label === "Home" ? "text-emerald-400" : "text-slate-400"
                        }`} />
                      ) : address.label === "Work" ? (
                        <Building className="h-4 w-4 text-blue-400" />
                      ) : (
                        <MapPin className="h-4 w-4 text-purple-400" />
                      )}
                    </div>
                    <input
                      className="w-24 rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none sm:w-32"
                      placeholder="Label"
                      value={address.label || ""}
                      onChange={(e) => setAddresses((prev) => 
                        prev.map((a, i) => i === index ? { ...a, label: e.target.value } : a)
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(index)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-fuchsia-400/50 hover:text-white"
                      >
                        <Star className="h-3 w-3" />
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => removeAddress(index)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-500/20"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Address Fields Grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className="col-span-2 rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    placeholder="Street address / Line 1 *"
                    value={address.line1 || ""}
                    onChange={(e) => setAddresses((prev) => 
                      prev.map((a, i) => i === index ? { ...a, line1: e.target.value } : a)
                    )}
                  />
                  
                  <input
                    className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    placeholder="Line 2 (Optional)"
                    value={address.line2 || ""}
                    onChange={(e) => setAddresses((prev) => 
                      prev.map((a, i) => i === index ? { ...a, line2: e.target.value } : a)
                    )}
                  />
                  
                  <input
                    className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    placeholder="Landmark (Optional)"
                    value={address.landmark || ""}
                    onChange={(e) => setAddresses((prev) => 
                      prev.map((a, i) => i === index ? { ...a, landmark: e.target.value } : a)
                    )}
                  />
                  
                  <input
                    className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    placeholder="City *"
                    value={address.city || ""}
                    onChange={(e) => setAddresses((prev) => 
                      prev.map((a, i) => i === index ? { ...a, city: e.target.value } : a)
                    )}
                  />
                  
                  <input
                    className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    placeholder="State *"
                    value={address.state || ""}
                    onChange={(e) => setAddresses((prev) => 
                      prev.map((a, i) => i === index ? { ...a, state: e.target.value } : a)
                    )}
                  />
                  
                  <input
                    className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    placeholder="Pincode *"
                    value={address.pincode || ""}
                    onChange={(e) => setAddresses((prev) => 
                      prev.map((a, i) => i === index ? { ...a, pincode: e.target.value } : a)
                    )}
                  />
                </div>

                {/* Required Fields Hint */}
                <p className="mt-2 text-xs text-slate-500">
                  * Required fields (Line 1, City, Pincode)
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setAddresses((prev) => [...prev, { ...emptyAddress, isDefault: false }])}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-fuchsia-400/50 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>

          <button
            onClick={save}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
          >
            <Save className="h-4 w-4" />
            Save All Addresses
          </button>
        </div>

        {/* Info Note */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-800/50 p-3 text-xs text-slate-400">
          <AlertCircle className="h-4 w-4" />
          <p>Addresses marked with * are required. Incomplete addresses will not be saved.</p>
        </div>
      </div>
    </div>
  );
}