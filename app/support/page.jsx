"use client";

import { useEffect, useState } from "react";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

const categories = ["misbehavior", "no-show", "fraud", "payment", "safety", "other"];
const ticketCategories = ["booking", "payment", "payout", "account", "technical", "other"];
const ticketPriorities = ["low", "medium", "high"];

export default function SupportPage() {
  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ bookingId: "", category: "misbehavior", message: "", evidence: "" });
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [ticketForm, setTicketForm] = useState({
    bookingId: "",
    subject: "",
    category: "booking",
    priority: "medium",
    message: "",
    attachments: "",
  });
  const [disputeInputs, setDisputeInputs] = useState({});
  const [ticketReplyInputs, setTicketReplyInputs] = useState({});
  const [disputingId, setDisputingId] = useState("");
  const [replyingTicketId, setReplyingTicketId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const [ordersRes, reportsRes, ticketsRes] = await Promise.all([
      fetch("/api/bookings/me", { credentials: "include" }),
      fetch("/api/reports/me", { credentials: "include" }),
      fetch("/api/support/tickets", { credentials: "include" }),
    ]);
    const [ordersData, reportsData, ticketsData] = await Promise.all([
      ordersRes.json(),
      reportsRes.json(),
      ticketsRes.json().catch(() => ({})),
    ]);
    setBookings(ordersData.bookings || []);
    setReports(reportsData.reports || []);
    setTickets(ticketsData.tickets || []);
  };

  useEffect(() => {
    load();
  }, []);

  const uploadEvidence = async (files) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      setMsg("Uploading evidence...");
      const urls = [];
      for (const file of Array.from(files).slice(0, 5)) {
        const url = await uploadToCloudinary(file, { folder: "nash/reports" });
        urls.push(url);
      }
      setEvidenceUrls((prev) => [...prev, ...urls]);
      setForm((prev) => ({
        ...prev,
        evidence: [...(prev.evidence ? prev.evidence.split(",").map((x) => x.trim()).filter(Boolean) : []), ...urls].join(","),
      }));
      setMsg("Evidence uploaded");
    } catch (error) {
      setMsg(error.message || "Evidence upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        bookingId: form.bookingId,
        category: form.category,
        message: form.message,
        evidence: form.evidence ? form.evidence.split(",").map((s) => s.trim()).filter(Boolean) : [],
      }),
    });
    const data = await res.json();
    setMsg(data.ok ? "Report submitted" : data.error || "Report failed");
    if (data.ok) {
      setForm({ bookingId: "", category: "misbehavior", message: "", evidence: "" });
      setEvidenceUrls([]);
      load();
    }
  };

  const raiseDispute = async (reportId) => {
    const message = String(disputeInputs[reportId] || "").trim();
    if (!message) {
      setMsg("Dispute reason required");
      return;
    }
    setDisputingId(reportId);
    const res = await fetch(`/api/reports/${reportId}/dispute`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    setMsg(data.ok ? "Dispute raised" : data.error || "Failed to raise dispute");
    setDisputingId("");
    if (data.ok) {
      setDisputeInputs((prev) => ({ ...prev, [reportId]: "" }));
      load();
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    const payload = {
      bookingId: ticketForm.bookingId || undefined,
      subject: ticketForm.subject,
      category: ticketForm.category,
      priority: ticketForm.priority,
      message: ticketForm.message,
      attachments: ticketForm.attachments
        ? ticketForm.attachments.split(",").map((row) => row.trim()).filter(Boolean)
        : [],
    };
    const res = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(data.ok ? "Support ticket created" : data.error || "Failed to create ticket");
    if (data.ok) {
      setTicketForm({
        bookingId: "",
        subject: "",
        category: "booking",
        priority: "medium",
        message: "",
        attachments: "",
      });
      load();
    }
  };

  const replyTicket = async (ticketId) => {
    const message = String(ticketReplyInputs[ticketId] || "").trim();
    if (!message) {
      setMsg("Ticket reply cannot be empty");
      return;
    }
    setReplyingTicketId(ticketId);
    const res = await fetch(`/api/support/tickets/${ticketId}/reply`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message }),
    });
    const data = await res.json().catch(() => ({}));
    setReplyingTicketId("");
    setMsg(data.ok ? "Ticket reply sent" : data.error || "Failed to send reply");
    if (data.ok) {
      setTicketReplyInputs((prev) => ({ ...prev, [ticketId]: "" }));
      load();
    }
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={submit} className="panel space-y-3">
          <h1 className="text-2xl font-semibold">Support / Reports</h1>
          <p className="text-sm text-slate-400">User and worker both can report with evidence links.</p>

          <select className="w-full p-2.5 text-sm" value={form.bookingId} onChange={(e) => setForm({ ...form, bookingId: e.target.value })} required>
            <option value="">Select booking</option>
            {bookings.map((booking) => (
              <option key={booking._id} value={booking._id}>{booking.service?.title || booking._id} ({booking.status})</option>
            ))}
          </select>

          <select className="w-full p-2.5 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <textarea className="w-full p-2.5 text-sm" rows={4} placeholder="Describe issue" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <input className="w-full p-2.5 text-sm" placeholder="Evidence URLs comma separated" value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} />
          <input type="file" multiple accept="image/*,.pdf" onChange={(e) => uploadEvidence(e.target.files)} />
          {evidenceUrls.length > 0 && (
            <p className="text-xs text-slate-400">Uploaded: {evidenceUrls.length} file(s)</p>
          )}

          <button disabled={uploading} className="app-btn-primary rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {uploading ? "Uploading..." : "Submit Report"}
          </button>
          {msg && <p className="text-sm text-slate-300">{msg}</p>}
        </form>

        <div className="panel">
          <h2 className="mb-2 text-lg font-semibold">My Reports</h2>
          <div className="space-y-2">
            {reports.map((report) => (
              <div key={report._id} className="rounded-lg border border-white/15 bg-slate-900/30 p-2 text-sm">
                <p>Booking: {report.bookingId?.slice(-6)} | {report.category}</p>
                <p>Status: {report.status} | Dispute: {report.disputeStatus || "none"}</p>
                <p className="text-slate-400">{report.message}</p>
                {report.slaDueAt && <p className="text-xs text-amber-300">SLA Due: {new Date(report.slaDueAt).toLocaleString()}</p>}
                {["resolved", "closed"].includes(report.status) && !["raised", "reviewing"].includes(report.disputeStatus) && (
                  <div className="mt-2 space-y-2">
                    <textarea
                      className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-xs"
                      rows={2}
                      placeholder="Why do you want to dispute this decision?"
                      value={disputeInputs[report._id] || ""}
                      onChange={(e) => setDisputeInputs((prev) => ({ ...prev, [report._id]: e.target.value }))}
                    />
                    <button
                      onClick={() => raiseDispute(report._id)}
                      disabled={disputingId === report._id}
                      className="rounded bg-amber-700 px-3 py-1 text-xs text-white hover:bg-amber-600 disabled:opacity-60"
                    >
                      {disputingId === report._id ? "Submitting..." : "Raise Dispute"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={createTicket} className="panel space-y-3">
          <h2 className="text-lg font-semibold">Create Support Ticket</h2>
          <input
            className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-sm"
            placeholder="Subject"
            value={ticketForm.subject}
            onChange={(e) => setTicketForm((prev) => ({ ...prev, subject: e.target.value }))}
            required
          />
          <select
            className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-sm"
            value={ticketForm.bookingId}
            onChange={(e) => setTicketForm((prev) => ({ ...prev, bookingId: e.target.value }))}
          >
            <option value="">No booking attached</option>
            {bookings.map((booking) => (
              <option key={`ticket_${booking._id}`} value={booking._id}>
                {booking.service?.title || booking._id} ({booking.status})
              </option>
            ))}
          </select>
          <div className="grid gap-2 md:grid-cols-2">
            <select
              className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-sm"
              value={ticketForm.category}
              onChange={(e) => setTicketForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              {ticketCategories.map((row) => (
                <option key={row} value={row}>{row}</option>
              ))}
            </select>
            <select
              className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-sm"
              value={ticketForm.priority}
              onChange={(e) => setTicketForm((prev) => ({ ...prev, priority: e.target.value }))}
            >
              {ticketPriorities.map((row) => (
                <option key={row} value={row}>{row}</option>
              ))}
            </select>
          </div>
          <textarea
            className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-sm"
            rows={4}
            placeholder="Describe your issue in detail"
            value={ticketForm.message}
            onChange={(e) => setTicketForm((prev) => ({ ...prev, message: e.target.value }))}
            required
          />
          <input
            className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-sm"
            placeholder="Attachment URLs comma separated"
            value={ticketForm.attachments}
            onChange={(e) => setTicketForm((prev) => ({ ...prev, attachments: e.target.value }))}
          />
          <button className="rounded bg-sky-700 px-3 py-2 text-white hover:bg-sky-600">Create Ticket</button>
        </form>

        <div className="panel">
          <h2 className="mb-2 text-lg font-semibold">My Support Tickets</h2>
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="rounded-lg border border-white/15 bg-slate-900/30 p-2 text-sm">
                <p className="font-semibold">{ticket.ticketNo} | {ticket.subject}</p>
                <p>Status: {ticket.status} | Priority: {ticket.priority}</p>
                <p className="text-slate-400">{ticket.message}</p>
                <div className="mt-2 space-y-1 rounded border border-slate-700 bg-slate-900/40 p-2">
                  {(ticket.replies || []).length === 0 && <p className="text-xs text-slate-500">No replies yet.</p>}
                  {(ticket.replies || []).map((reply, index) => (
                    <p key={`${ticket._id}_reply_${index}`} className="text-xs">
                      <span className="font-semibold uppercase">{reply.actorRole}</span>: {reply.message}
                    </p>
                  ))}
                </div>
                <div className="mt-2 space-y-2">
                  <textarea
                    className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-xs"
                    rows={2}
                    placeholder="Reply on ticket"
                    value={ticketReplyInputs[ticket._id] || ""}
                    onChange={(e) => setTicketReplyInputs((prev) => ({ ...prev, [ticket._id]: e.target.value }))}
                  />
                  <button
                    onClick={() => replyTicket(ticket._id)}
                    disabled={replyingTicketId === ticket._id}
                    className="rounded bg-slate-800 px-3 py-1 text-xs hover:bg-slate-700 disabled:opacity-60"
                  >
                    {replyingTicketId === ticket._id ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
