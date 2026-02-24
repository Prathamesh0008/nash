"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  Send,
  Plus,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Eye,
  Code,
  Zap,
} from "lucide-react";

const initialForm = {
  key: "",
  channel: "email",
  title: "",
  subject: "",
  body: "",
  active: true,
};

export default function AdminCrmTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [sendForm, setSendForm] = useState({
    templateKey: "",
    channel: "email",
    recipient: "",
    userId: "",
  });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const load = async () => {
    const res = await fetch("/api/admin/crm-templates", { credentials: "include" });
    const data = await res.json();
    setTemplates(data.templates || []);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/admin/crm-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? "Template saved successfully" : data.error || "Failed to save template");
    if (data.ok) {
      setForm(initialForm);
      load();
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const sendTest = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/admin/crm-templates/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(sendForm),
    });
    const data = await res.json();
    setMsgType(data.ok ? "success" : "error");
    setMsg(data.ok ? "Test message sent successfully" : data.error || "Failed to send test");
    
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  };

  const fillTemplateForm = (template) => {
    setForm({
      key: template.key,
      channel: template.channel,
      title: template.title || "",
      subject: template.subject || "",
      body: template.body,
      active: template.active,
    });
  };

  const getChannelIcon = (channel) => {
    switch(channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel) => {
    switch(channel) {
      case 'email': return 'text-blue-400 bg-blue-500/20';
      case 'sms': return 'text-green-400 bg-green-500/20';
      case 'whatsapp': return 'text-emerald-400 bg-emerald-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 sm:h-14 sm:w-14">
              <FileText className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">CRM Templates</h1>
              <p className="text-xs text-slate-400 sm:text-sm">
                Email/SMS/WhatsApp template management and test sending
              </p>
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
                <XCircle className="h-4 w-4" />
              )}
              {msg}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Create Template Form */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-lg font-semibold text-white">Create / Edit Template</h2>
            </div>

            <form onSubmit={save} className="space-y-4">
              {/* Template Key & Channel Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Template Key</label>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    placeholder="e.g. booking_created_user"
                    value={form.key}
                    onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Channel</label>
                  <select
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                    value={form.channel}
                    onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}
                  >
                    <option value="email">📧 Email</option>
                    <option value="sms">📱 SMS</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                  </select>
                </div>
              </div>

              {/* Title & Subject Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Title</label>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    placeholder="Template title"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Subject (for email)</label>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    placeholder="Email subject line"
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  />
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Body Template <span className="text-fuchsia-400">(use {"{{name}}"}, {"{{bookingId}}"}, {"{{service}}"}, {"{{slotTime}}"})</span>
                </label>
                <textarea
                  className="min-h-[120px] w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  rows={4}
                  placeholder="Your message template here..."
                  value={form.body}
                  onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                  required
                />
              </div>

              {/* Active Checkbox */}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-slate-900/50 p-3 transition hover:border-fuchsia-500/30">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-fuchsia-500 focus:ring-fuchsia-500/20"
                />
                <span className="text-sm text-slate-300">Active (template available for use)</span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Save className="h-4 w-4" />
                Save Template
              </button>
            </form>
          </div>

          {/* Send Test Form */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Send className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-lg font-semibold text-white">Send Test Message</h2>
            </div>

            <form onSubmit={sendTest} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Template Key</label>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                    placeholder="Enter template key"
                    value={sendForm.templateKey}
                    onChange={(e) => setSendForm((p) => ({ ...p, templateKey: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Channel</label>
                  <select
                    className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-fuchsia-500/50 focus:outline-none"
                    value={sendForm.channel}
                    onChange={(e) => setSendForm((p) => ({ ...p, channel: e.target.value }))}
                  >
                    <option value="email">📧 Email</option>
                    <option value="sms">📱 SMS</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Recipient (email/phone)</label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="user@example.com or +1234567890"
                  value={sendForm.recipient}
                  onChange={(e) => setSendForm((p) => ({ ...p, recipient: e.target.value }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Or User ID</label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none"
                  placeholder="User ID from database"
                  value={sendForm.userId}
                  onChange={(e) => setSendForm((p) => ({ ...p, userId: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Zap className="h-4 w-4" />
                Send Test Message
              </button>

              <p className="text-xs text-slate-500">
                * Provide either recipient or userId. If both provided, recipient takes precedence.
              </p>
            </form>
          </div>
        </div>

        {/* Templates List */}
        <div className="mt-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mt-8 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-lg font-semibold text-white">Existing Templates</h2>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {templates.length} {templates.length === 1 ? 'Template' : 'Templates'}
            </span>
          </div>

          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-slate-600" />
              <p className="mt-2 text-sm text-slate-400">No templates created yet</p>
              <p className="text-xs text-slate-500">Create your first template using the form</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((item) => (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-lg border border-white/10 bg-slate-900/40 p-4 transition hover:border-fuchsia-500/30"
                >
                  {/* Status Indicator */}
                  <div className={`absolute left-0 top-0 h-full w-1 ${
                    item.active 
                      ? "bg-gradient-to-b from-emerald-500 to-emerald-600"
                      : "bg-gradient-to-b from-slate-500 to-slate-600"
                  }`} />

                  <div className="pl-2">
                    {/* Header */}
                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-lg p-1.5 ${getChannelColor(item.channel)}`}>
                          {getChannelIcon(item.channel)}
                        </span>
                        <h3 className="font-semibold text-white text-sm truncate max-w-[120px]">
                          {item.key}
                        </h3>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        item.active 
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-500/20 text-slate-400"
                      }`}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Subject (if email) */}
                    {item.subject && (
                      <p className="mt-1 text-xs text-slate-400 truncate">
                        📧 {item.subject}
                      </p>
                    )}

                    {/* Body Preview */}
                    <p className="mt-2 text-xs text-slate-300 line-clamp-2">
                      {item.body}
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => fillTemplateForm(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-300 transition hover:border-fuchsia-400/50 hover:text-white"
                      >
                        <Copy className="h-3 w-3" />
                        Use
                      </button>
                      <button
                        onClick={() => {
                          setSendForm(prev => ({
                            ...prev,
                            templateKey: item.key,
                            channel: item.channel
                          }));
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-500/20"
                      >
                        <Send className="h-3 w-3" />
                        Test
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Variables Info */}
        <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/30 p-3 text-xs text-slate-400">
          <p className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span>Available variables: {"{{name}}"}, {"{{email}}"}, {"{{bookingId}}"}, {"{{service}}"}, {"{{slotTime}}"}, {"{{workerName}}"}, {"{{amount}}"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
