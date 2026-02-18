"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  User,
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  CreditCard,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Truck,
  Wrench,
  Home,
  UserCheck,
  UserX,
  MessageSquare,
  FileText,
} from "lucide-react";

const statusTransitions = {
  confirmed: ["assigned", "cancelled"],
  assigned: ["onway", "cancelled"],
  onway: ["working", "cancelled"],
  working: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};
const autoReassignableStatuses = new Set(["confirmed", "assigned", "onway"]);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState({});
  const [assignNote, setAssignNote] = useState({});
  const [savingId, setSavingId] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    assignment: "",
    q: "",
  });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const load = async () => {
    const sp = new URLSearchParams();
    if (filters.status) sp.set("status", filters.status);
    if (filters.paymentStatus) sp.set("paymentStatus", filters.paymentStatus);
    if (filters.assignment) sp.set("assignment", filters.assignment);
    if (filters.q) sp.set("q", filters.q);

    const [ordersRes, workersRes] = await Promise.all([
      fetch(`/api/admin/orders?${sp.toString()}`, { credentials: "include" }),
      fetch("/api/admin/workers", { credentials: "include" }),
    ]);
    const [ordersData, workersData] = await Promise.all([ordersRes.json(), workersRes.json()]);
    setOrders(ordersData.orders || []);
    setSummary(ordersData.summary || null);
    setWorkers((workersData.workers || []).filter((w) => w.verificationStatus === "APPROVED"));
  };

  useEffect(() => {
    load();
  }, [filters.status, filters.paymentStatus, filters.assignment, filters.q]);

  const assign = async (orderId) => {
    const workerId = selectedWorker[orderId];
    if (!workerId) return;
    setSavingId(orderId);

    const res = await fetch(`/api/admin/orders/${orderId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        workerId,
        note: assignNote[orderId] || "",
      }),
    });

    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? "Order assigned successfully" : data.error || "Assign failed");
    if (data.ok) await load();
    setSavingId("");
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const updateStatus = async (orderId, nextStatus) => {
    setSavingId(orderId);
    const res = await fetch(`/api/bookings/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        status: nextStatus,
        note: `Updated by admin to ${nextStatus}`,
      }),
    });
    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? `Order status updated to ${nextStatus}` : data.error || "Status update failed");
    if (data.ok) await load();
    setSavingId("");
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const autoReassign = async (orderId) => {
    setSavingId(orderId);
    const res = await fetch(`/api/bookings/${orderId}/reassign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        reason: "admin_auto_reassign",
        note: assignNote[orderId] || "",
      }),
    });
    const data = await res.json().catch(() => ({}));
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? data.message || "Auto reassign completed" : data.error || "Auto reassign failed");
    if (data.ok) await load();
    setSavingId("");
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'assigned': return <UserCheck className="h-4 w-4" />;
      case 'onway': return <Truck className="h-4 w-4" />;
      case 'working': return <Wrench className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'assigned': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'onway': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'working': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'cancelled': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-emerald-500/20 text-emerald-400';
      case 'unpaid': return 'bg-amber-500/20 text-amber-400';
      case 'refunded': return 'bg-rose-500/20 text-rose-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const StatCard = ({ icon: Icon, label, value, color = "fuchsia" }) => (
    <div className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 sm:text-sm">{label}</p>
          <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
        </div>
        <div className={`rounded-lg bg-${color}-500/20 p-2 sm:p-2.5`}>
          <Icon className={`h-4 w-4 text-${color}-400 sm:h-5 sm:w-5`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
                <ShoppingBag className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Admin Orders</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Assign/reassign worker and manage order flow
                </p>
              </div>
            </div>
            <button
              onClick={() => load()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white sm:self-start"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          
          {/* Message Toast */}
          {msg && (
            <div className={`mt-4 rounded-lg p-3 text-sm ${
              msgType === "success" 
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
            }`}>
              <div className="flex items-center gap-2">
                {msgType === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {msg}
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatCard icon={ShoppingBag} label="Total Orders" value={summary?.totalOrders || 0} color="blue" />
          <StatCard icon={UserCheck} label="Assigned" value={summary?.byStatus?.assigned || 0} color="purple" />
          <StatCard icon={CheckCircle} label="Completed" value={summary?.byStatus?.completed || 0} color="emerald" />
          <StatCard icon={DollarSign} label="Gross (INR)" value={summary?.grossAmount || 0} color="amber" />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-base font-semibold text-white sm:text-lg">Filters</h2>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Status</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                value={filters.status} 
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                {["confirmed", "assigned", "onway", "working", "completed", "cancelled"].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Payment Status</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                value={filters.paymentStatus} 
                onChange={(e) => setFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))}
              >
                <option value="">All Payment Status</option>
                {["unpaid", "paid", "refunded"].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Assignment</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                value={filters.assignment} 
                onChange={(e) => setFilters((prev) => ({ ...prev, assignment: e.target.value }))}
              >
                <option value="">All Assignment</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input 
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="Search bookings..." 
                  value={filters.q} 
                  onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">No orders found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters</p>
            </div>
          ) : (
            orders.map((order) => (
              <div 
                key={order._id} 
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:p-6"
              >
                {/* Status Indicator Line */}
                <div className={`absolute left-0 top-0 h-full w-1 ${
                  order.status === 'cancelled' ? 'bg-gradient-to-b from-rose-500 to-rose-600' :
                  order.status === 'completed' ? 'bg-gradient-to-b from-emerald-500 to-emerald-600' :
                  'bg-gradient-to-b from-fuchsia-500 to-violet-500'
                }`} />

                <div className="pl-2 sm:pl-3">
                  {/* Header */}
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                        <CreditCard className="mr-1 h-3 w-3" />
                        {order.paymentStatus}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      ₹{order.priceBreakup?.total || 0}
                    </span>
                  </div>

                  {/* Service & Customer Info */}
                  <div className="mb-3 grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <Briefcase className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm min-w-0">
                        <p className="font-medium text-white truncate">{order.service?.title || "Service"}</p>
                        <p className="text-xs text-slate-400 truncate">ID: {order._id.slice(-6)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <User className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm min-w-0">
                        <p className="font-medium text-white truncate">{order.customer?.name || "N/A"}</p>
                        <p className="text-xs text-slate-400 truncate">{order.customer?.email || "No email"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Worker & Slot Info */}
                  <div className="mb-3 grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      {order.worker ? (
                        <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <UserX className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                      <div className="text-sm min-w-0">
                        <p className="font-medium text-white truncate">
                          {order.worker?.name || "Unassigned"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {order.worker ? order.worker.userId?.slice(-6) : "No worker assigned"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <Calendar className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm">
                        <p className="text-white">
                          {new Date(order.slotTime).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(order.slotTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {order.address?.city}, {order.address?.pincode}
                      {order.address?.line1 && ` • ${order.address.line1}`}
                    </span>
                  </div>

                  {/* Assignment Controls */}
                  <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <select 
                      className="rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                      value={selectedWorker[order._id] || ""} 
                      onChange={(e) => setSelectedWorker((prev) => ({ ...prev, [order._id]: e.target.value }))}
                    >
                      <option value="">Select worker</option>
                      {workers.map((worker) => (
                        <option key={worker.userId} value={worker.userId}>
                          {worker.user?.name || worker.userId}
                        </option>
                      ))}
                    </select>
                    
                    <input 
                      className="rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                      placeholder="Assign note (optional)" 
                      value={assignNote[order._id] || ""} 
                      onChange={(e) => setAssignNote((prev) => ({ ...prev, [order._id]: e.target.value }))}
                    />
                    
                    <button 
                      disabled={savingId === order._id} 
                      onClick={() => assign(order._id)} 
                      className="rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      {savingId === order._id ? 'Assigning...' : 'Assign'}
                    </button>
                    
                    <button
                      disabled={savingId === order._id || !autoReassignableStatuses.has(order.status)}
                      onClick={() => autoReassign(order._id)}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
                    >
                      {savingId === order._id ? 'Processing...' : 'Auto Reassign'}
                    </button>
                  </div>

                  {/* Status Transition Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {(statusTransitions[order.status] || []).map((nextStatus) => (
                      <button
                        key={`${order._id}-${nextStatus}`}
                        disabled={savingId === order._id}
                        onClick={() => updateStatus(order._id, nextStatus)}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${
                          nextStatus === 'cancelled'
                            ? 'border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                            : nextStatus === 'completed'
                            ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border border-white/10 bg-white/5 text-slate-300 hover:border-fuchsia-400/50 hover:text-white'
                        }`}
                      >
                        {getStatusIcon(nextStatus)}
                        Mark {nextStatus}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}