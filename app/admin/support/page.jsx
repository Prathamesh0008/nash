"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Ticket,
  MessageSquare,
  User,
  Briefcase,
  Calendar,
  Paperclip,
  Send,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  Flag,
  Mail,
  Phone,
  Inbox,
  Archive,
  Star,
  Download,
  Eye,
} from "lucide-react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [replyDraft, setReplyDraft] = useState({});
  const [statusDraft, setStatusDraft] = useState({});
  const [expandedTickets, setExpandedTickets] = useState({});

  const load = useCallback(async (statusFilter = status) => {
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/support/tickets${qs}`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    setTickets(data.tickets || []);
  }, [status]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const reply = async (ticket) => {
    const message = String(replyDraft[ticket._id] || "").trim();
    if (!message) {
      setMsgType("error");
      setMsg("Reply cannot be empty");
      setTimeout(() => {
        setMsg("");
        setMsgType("");
      }, 3000);
      return;
    }
    const res = await fetch(`/api/support/tickets/${ticket._id}/reply`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message,
        status: statusDraft[ticket._id] || ticket.status,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? "Reply sent successfully" : data.error || "Failed to send reply");
    if (data.ok) {
      setReplyDraft((prev) => ({ ...prev, [ticket._id]: "" }));
      await load();
    }
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const getPriorityIcon = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <Flag className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'text-rose-400 bg-rose-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/20';
      case 'low': return 'text-emerald-400 bg-emerald-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'open': return <Inbox className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <Archive className="h-4 w-4" />;
      default: return <Ticket className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'in_progress': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'closed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const toggleExpand = (ticketId) => {
    setExpandedTickets(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
                <Ticket className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Support Tickets</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Review and resolve customer/worker support tickets
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

        {/* Filter */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-base font-semibold text-white sm:text-lg">Filter by Status</h2>
          </div>
          
          <div className="max-w-xs">
            <select
              className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="open">🟢 Open</option>
              <option value="in_progress">🟡 In Progress</option>
              <option value="resolved">🔵 Resolved</option>
              <option value="closed">⚪ Closed</option>
            </select>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12 text-center">
              <Inbox className="h-12 w-12 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">No tickets found</p>
              <p className="text-xs text-slate-500">Try adjusting your status filter</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <article 
                key={ticket._id} 
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition hover:border-fuchsia-500/30 sm:p-6"
              >
                {/* Header */}
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status === 'in_progress' ? 'In Progress' : ticket.status}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${getPriorityColor(ticket.priority)}`}>
                      {getPriorityIcon(ticket.priority)}
                      {ticket.priority}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {ticket.ticketNo}
                  </span>
                </div>

                {/* Subject */}
                <h3 className="mb-2 text-base font-semibold text-white sm:text-lg">
                  {ticket.subject}
                </h3>

                {/* Details Grid */}
                <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                    <User className="h-4 w-4 text-fuchsia-400 shrink-0" />
                    <div className="text-sm min-w-0">
                      <p className="text-white truncate">{ticket.user?.name || 'User'}</p>
                      <p className="text-xs text-slate-400 truncate">{ticket.userRole}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                    <Briefcase className="h-4 w-4 text-fuchsia-400 shrink-0" />
                    <div className="text-sm min-w-0">
                      <p className="text-white truncate">{ticket.category}</p>
                      <p className="text-xs text-slate-400 truncate">Category</p>
                    </div>
                  </div>
                  
                  {ticket.bookingId && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <Calendar className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm">
                        <p className="text-white">Booking #{String(ticket.bookingId).slice(-6)}</p>
                        <p className="text-xs text-slate-400">ID</p>
                      </div>
                    </div>
                  )}
                  
                  {(ticket.attachments || []).length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 p-2">
                      <Paperclip className="h-4 w-4 text-fuchsia-400 shrink-0" />
                      <div className="text-sm">
                        <p className="text-white">{ticket.attachments.length} attachments</p>
                        <p className="text-xs text-slate-400">Files</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="mb-3 rounded-lg bg-slate-900/40 p-3">
                  <p className="text-sm text-white">{ticket.message}</p>
                </div>

                {/* Replies Section */}
                <div className="mb-3 rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <button
                    onClick={() => toggleExpand(ticket._id)}
                    className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {ticket.replies?.length || 0} Replies
                    <span className="ml-auto">{expandedTickets[ticket._id] ? '▼' : '▶'}</span>
                  </button>
                  
                  {(expandedTickets[ticket._id] || ticket.replies?.length === 0) && (
                    <div className="space-y-2">
                      {(ticket.replies || []).length === 0 ? (
                        <p className="text-xs text-slate-500">No replies yet.</p>
                      ) : (
                        ticket.replies.map((reply, index) => (
                          <div key={`${ticket._id}_reply_${index}`} className="rounded-lg bg-slate-800/50 p-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`font-semibold ${
                                reply.actorRole === 'admin' ? 'text-fuchsia-400' : 'text-emerald-400'
                              }`}>
                                {reply.actorRole === 'admin' ? '👤 Admin' : '👥 User'}
                              </span>
                              <span className="text-slate-500">
                                {new Date(reply.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-300">{reply.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <textarea
                      rows={2}
                      className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                      placeholder="Write your reply..."
                      value={replyDraft[ticket._id] || ""}
                      onChange={(e) => setReplyDraft((prev) => ({ ...prev, [ticket._id]: e.target.value }))}
                    />
                    <select
                      className="rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none sm:w-40"
                      value={statusDraft[ticket._id] || ticket.status}
                      onChange={(e) => setStatusDraft((prev) => ({ ...prev, [ticket._id]: e.target.value }))}
                    >
                      <option value="open">🟢 Open</option>
                      <option value="in_progress">🟡 In Progress</option>
                      <option value="resolved">🔵 Resolved</option>
                      <option value="closed">⚪ Closed</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={() => reply(ticket)} 
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                    Reply and Update
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Stats Summary */}
        {tickets.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-900/40 p-3 text-center">
              <p className="text-xs text-slate-400">Open</p>
              <p className="text-lg font-semibold text-rose-400">
                {tickets.filter(t => t.status === 'open').length}
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/40 p-3 text-center">
              <p className="text-xs text-slate-400">In Progress</p>
              <p className="text-lg font-semibold text-amber-400">
                {tickets.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/40 p-3 text-center">
              <p className="text-xs text-slate-400">Resolved</p>
              <p className="text-lg font-semibold text-emerald-400">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/40 p-3 text-center">
              <p className="text-xs text-slate-400">Closed</p>
              <p className="text-lg font-semibold text-slate-400">
                {tickets.filter(t => t.status === 'closed').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
