"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import {
  CheckCircle2,
  Clock3,
  LifeBuoy,
  MessageSquareText,
  ShieldAlert,
  UploadCloud,
} from "lucide-react";

const ticketCategories = [
  { value: "booking", label: "Booking" },
  { value: "payment", label: "Payment" },
  { value: "payout", label: "Payout" },
  { value: "account", label: "Account" },
  { value: "technical", label: "Technical" },
  { value: "other", label: "Other" },
];

const ticketPriorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const quickChannels = [
  {
    title: "Support Ticket",
    description: "Best for booking issues, payment help, profile/account problems, and operational escalations.",
    href: "/support",
    cta: "Open Support Center",
    icon: LifeBuoy,
  },
  {
    title: "In-App Chat",
    description: "Best for active order coordination, quick updates, and real-time communication.",
    href: "/chat",
    cta: "Open Live Chat",
    icon: MessageSquareText,
  },
  {
    title: "Safety Concern",
    description: "If there is immediate physical risk, contact local emergency services first, then raise support.",
    href: "/support",
    cta: "Report Safety Issue",
    icon: ShieldAlert,
  },
];

export default function ContactUsPage() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    subject: "",
    category: "booking",
    priority: "medium",
    bookingId: "",
    message: "",
    attachmentUrls: "",
  });
  const [uploadedAttachments, setUploadedAttachments] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ tone: "", text: "" });

  useEffect(() => {
    if (!user || loading) return;
    let mounted = true;

    const loadBookings = async () => {
      setLoadingBookings(true);
      const res = await fetch("/api/bookings/me", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!mounted) return;
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      setLoadingBookings(false);
    };

    loadBookings();
    return () => {
      mounted = false;
    };
  }, [user, loading]);

  const uploadAttachments = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setStatus({ tone: "info", text: "Uploading attachments..." });
    try {
      const urls = [];
      for (const file of Array.from(files).slice(0, 5)) {
        const url = await uploadToCloudinary(file, { folder: "nash/support" });
        urls.push(url);
      }
      setUploadedAttachments((prev) => [...prev, ...urls]);
      setStatus({ tone: "success", text: "Attachments uploaded" });
    } catch (error) {
      setStatus({ tone: "error", text: error.message || "Attachment upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    if (!user) {
      setStatus({ tone: "error", text: "Please login to create a support ticket." });
      return;
    }

    const typedUrls = form.attachmentUrls
      .split(",")
      .map((row) => row.trim())
      .filter(Boolean);
    const attachments = [...new Set([...typedUrls, ...uploadedAttachments])];

    setSubmitting(true);
    setStatus({ tone: "", text: "" });

    const res = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        subject: form.subject.trim(),
        category: form.category,
        priority: form.priority,
        bookingId: form.bookingId || undefined,
        message: form.message.trim(),
        attachments,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok || !data.ok) {
      setStatus({ tone: "error", text: data.error || "Unable to create support ticket right now." });
      return;
    }

    const ticketNo = data.ticket?.ticketNo ? ` (${data.ticket.ticketNo})` : "";
    setStatus({ tone: "success", text: `Ticket created successfully${ticketNo}` });
    setForm({
      subject: "",
      category: "booking",
      priority: "medium",
      bookingId: "",
      message: "",
      attachmentUrls: "",
    });
    setUploadedAttachments([]);
  };

  return (
    <section className="mx-auto max-w-6xl space-y-4">
      <div className="panel space-y-2">
        <h1 className="text-2xl font-semibold">Contact Us</h1>
        <p className="text-sm text-slate-300">
          Reach Nash Wellness support for booking, payment, account, worker, and technical help.
        </p>
        <p className="text-xs text-slate-500">
          Logged-in users can raise tickets directly. For immediate emergencies, contact local emergency services first.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {quickChannels.map((channel) => (
          <article key={channel.title} className="panel flex h-full flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-100">
              <channel.icon className="h-4 w-4 text-fuchsia-300" />
              <h2 className="text-sm font-semibold">{channel.title}</h2>
            </div>
            <p className="text-xs text-slate-400">{channel.description}</p>
            <Link
              href={channel.href}
              className="mt-auto inline-flex w-fit rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:border-fuchsia-400/50 hover:bg-white/10"
            >
              {channel.cta}
            </Link>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <form onSubmit={submitTicket} className="panel space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">Create A Support Ticket</h2>
          {!loading && !user && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2.5 text-xs text-amber-200">
              Login required for ticket creation.{" "}
              <Link href="/auth/login" className="font-semibold text-amber-100 underline">
                Go to Login
              </Link>
            </div>
          )}

          <input
            className="w-full p-2.5 text-sm"
            placeholder="Subject"
            minLength={3}
            maxLength={120}
            value={form.subject}
            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            disabled={!user || loading || submitting}
            required
          />

          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="w-full p-2.5 text-sm"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              disabled={!user || loading || submitting}
            >
              {ticketCategories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              className="w-full p-2.5 text-sm"
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
              disabled={!user || loading || submitting}
            >
              {ticketPriorities.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <select
            className="w-full p-2.5 text-sm"
            value={form.bookingId}
            onChange={(e) => setForm((prev) => ({ ...prev, bookingId: e.target.value }))}
            disabled={!user || loading || submitting || loadingBookings}
          >
            <option value="">No booking attached</option>
            {bookings.map((booking) => (
              <option key={booking._id} value={booking._id}>
                {(booking.service?.title || booking._id)} ({booking.status || "status-unknown"})
              </option>
            ))}
          </select>

          <textarea
            className="w-full p-2.5 text-sm"
            rows={5}
            minLength={10}
            placeholder="Write full issue details so support team can resolve quickly."
            value={form.message}
            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            disabled={!user || loading || submitting}
            required
          />

          <input
            className="w-full p-2.5 text-sm"
            placeholder="Attachment URLs (optional, comma separated)"
            value={form.attachmentUrls}
            onChange={(e) => setForm((prev) => ({ ...prev, attachmentUrls: e.target.value }))}
            disabled={!user || loading || submitting}
          />

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-200 hover:border-fuchsia-400/50">
            <UploadCloud className="h-4 w-4 text-fuchsia-300" />
            Upload image attachments
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => uploadAttachments(e.target.files)}
              disabled={!user || loading || submitting || uploading}
            />
          </label>
          {uploadedAttachments.length > 0 && (
            <p className="text-xs text-slate-400">{uploadedAttachments.length} file(s) uploaded</p>
          )}

          <button
            type="submit"
            disabled={!user || loading || submitting || uploading}
            className="app-btn-primary rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : uploading ? "Uploading..." : "Submit Ticket"}
          </button>

          {status.text && (
            <p
              className={`text-sm ${
                status.tone === "error"
                  ? "text-rose-300"
                  : status.tone === "success"
                    ? "text-emerald-300"
                    : "text-slate-300"
              }`}
            >
              {status.text}
            </p>
          )}
        </form>

        <aside className="space-y-4">
          <div className="panel space-y-2">
            <h3 className="text-sm font-semibold text-slate-100">Response Windows</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5 text-fuchsia-300" />
                High priority: target first response in 15-60 minutes.
              </p>
              <p className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5 text-fuchsia-300" />
                Medium priority: target first response in 2-6 hours.
              </p>
              <p className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5 text-fuchsia-300" />
                Low priority: target first response in 12-24 hours.
              </p>
            </div>
          </div>

          <div className="panel space-y-2">
            <h3 className="text-sm font-semibold text-slate-100">Before You Submit</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                Include exact issue timeline and expected resolution.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                Attach screenshots or proofs for faster verification.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                If this relates to a booking, link the booking from the dropdown.
              </li>
            </ul>
          </div>

          <div className="panel space-y-2 text-xs text-slate-300">
            <p>
              Need quick answers first? Check{" "}
              <Link href="/faq" className="font-semibold text-fuchsia-300 hover:text-fuchsia-200">
                FAQ
              </Link>{" "}
              or open the{" "}
              <Link href="/support" className="font-semibold text-fuchsia-300 hover:text-fuchsia-200">
                Support Center
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
