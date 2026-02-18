"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Ban,
  UserCog,
  Download,
  Eye,
  MoreVertical,
} from "lucide-react";

const USER_STAT_COLORS = {
  blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  rose: { bg: "bg-rose-500/20", text: "text-rose-400" },
  amber: { bg: "bg-amber-500/20", text: "text-amber-400" },
  purple: { bg: "bg-purple-500/20", text: "text-purple-400" },
  cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
};

function StatCard({ icon: Icon, label, value, color = "blue" }) {
  const palette = USER_STAT_COLORS[color] || USER_STAT_COLORS.blue;

  return (
    <div className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 sm:text-sm">{label}</p>
          <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{value}</p>
        </div>
        <div className={`rounded-lg p-2 sm:p-2.5 ${palette.bg}`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${palette.text}`} />
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users", { credentials: "include" });
    const data = await res.json();
    setUsers(data.users || []);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    return filtered;
  }, [users, searchTerm, statusFilter, roleFilter]);

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? `User marked as ${status}` : data.error || "Failed to update user");
    if (data.ok) await load();
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <UserCheck className="h-4 w-4" />;
      case 'blocked': return <UserX className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'blocked': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-500/20 text-purple-400';
      case 'worker': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    blocked: users.filter(u => u.status === 'blocked').length,
    pending: users.filter(u => u.status === 'pending').length,
    admins: users.filter(u => u.role === 'admin').length,
    workers: users.filter(u => u.role === 'worker').length,
    customers: users.filter(u => u.role === 'user' || !u.role).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
                <Users className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">User Management</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Manage user accounts and statuses
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

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          <StatCard icon={Users} label="Total Users" value={stats.total} color="blue" />
          <StatCard icon={UserCheck} label="Active" value={stats.active} color="emerald" />
          <StatCard icon={UserX} label="Blocked" value={stats.blocked} color="rose" />
          <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
          <StatCard icon={Shield} label="Admins" value={stats.admins} color="purple" />
          <StatCard icon={UserCog} label="Workers" value={stats.workers} color="cyan" />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-base font-semibold text-white sm:text-lg">Filters</h2>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input 
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="Search by name, email, phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Status</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">🟢 Active</option>
                <option value="blocked">🔴 Blocked</option>
                <option value="pending">🟡 Pending</option>
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-xs text-slate-400">Role</label>
              <select 
                className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">👤 Admin</option>
                <option value="worker">👥 Worker</option>
                <option value="user">👥 Customer</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setRoleFilter("");
                }}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 text-center">
              <Users className="h-12 w-12 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">No users found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div 
                key={user._id} 
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* User Info */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20">
                      <UserCog className="h-6 w-6 text-fuchsia-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-white sm:text-lg">
                          {user.name || 'Unnamed User'}
                        </h3>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${getStatusColor(user.status)}`}>
                          {getStatusIcon(user.status)}
                          {user.status}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${getRoleColor(user.role)}`}>
                          {user.role || 'user'}
                        </span>
                      </div>
                      
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="truncate">{user.email || 'No email'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{user.phone || 'No phone'}</span>
                        </div>
                        
                        {user.createdAt && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    {user.status !== 'active' && (
                      <button 
                        onClick={() => updateStatus(user._id, "active")} 
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20 sm:text-sm"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Activate</span>
                      </button>
                    )}
                    
                    {user.status !== 'blocked' && (
                      <button 
                        onClick={() => updateStatus(user._id, "blocked")} 
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/20 sm:text-sm"
                      >
                        <Ban className="h-4 w-4" />
                        <span className="hidden sm:inline">Block</span>
                      </button>
                    )}
                    
                    {user.status !== 'pending' && (
                      <button 
                        onClick={() => updateStatus(user._id, "pending")} 
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20 sm:text-sm"
                      >
                        <Clock className="h-4 w-4" />
                        <span className="hidden sm:inline">Pending</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* User ID */}
                <div className="mt-3 text-xs text-slate-600">
                  ID: {user._id}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results Summary */}
        {filteredUsers.length > 0 && (
          <div className="mt-4 text-xs text-slate-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>
    </div>
  );
}
