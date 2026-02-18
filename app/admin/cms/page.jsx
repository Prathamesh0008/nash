"use client";

import { useEffect, useState } from "react";
import {
  Layout,
  Save,
  FileJson,
  AlertCircle,
  CheckCircle,
  XCircle,
  Code,
  RefreshCw,
  Eye,
  Edit,
} from "lucide-react";

export default function AdminCmsPage() {
  const [jsonText, setJsonText] = useState('{"banners":[],"servicesHighlights":[]}');
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [parsedJson, setParsedJson] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/cms", { credentials: "include" });
      const data = await res.json();
      if (data.ok) {
        const prettyJson = JSON.stringify(data.content || {}, null, 2);
        setJsonText(prettyJson);
        try {
          setParsedJson(data.content || {});
          setIsValid(true);
        } catch {
          setIsValid(false);
        }
      }
    };
    load();
  }, []);

  // Validate JSON on change
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setIsValid(true);
      setParsedJson(parsed);
    } catch {
      setIsValid(false);
      setParsedJson(null);
    }
  }, [jsonText]);

  const save = async () => {
    try {
      const parsed = JSON.parse(jsonText);
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      setMsgType(data.ok ? "success" : "error");
      setMsg(data.ok ? "CMS content saved successfully" : data.error || "Save failed");
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMsg("");
        setMsgType("");
      }, 3000);
    } catch {
      setMsgType("error");
      setMsg("Invalid JSON - cannot save");
      
      setTimeout(() => {
        setMsg("");
        setMsgType("");
      }, 3000);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setMsgType("success");
      setMsg("JSON formatted successfully");
      
      setTimeout(() => {
        setMsg("");
        setMsgType("");
      }, 2000);
    } catch {
      setMsgType("error");
      setMsg("Cannot format invalid JSON");
      
      setTimeout(() => {
        setMsg("");
        setMsgType("");
      }, 2000);
    }
  };

  const resetToTemplate = () => {
    const template = {
      banners: [
        {
          id: "banner1",
          title: "Welcome Banner",
          imageUrl: "/images/banner1.jpg",
          link: "/promo",
          active: true
        }
      ],
      servicesHighlights: [
        {
          id: "service1",
          title: "Premium Service",
          description: "Best in class service",
          icon: "star",
          order: 1
        }
      ]
    };
    setJsonText(JSON.stringify(template, null, 2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 sm:h-14 sm:w-14">
                <Layout className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">CMS Editor</h1>
                <p className="text-xs text-slate-400 sm:text-sm">
                  Manage banners, services highlights, and site content
                </p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition sm:px-4 sm:text-sm ${
                  previewMode
                    ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:border-fuchsia-400/50"
                }`}
              >
                {previewMode ? (
                  <>
                    <Code className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span> Mode
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Preview</span> Mode
                  </>
                )}
              </button>
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

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Editor Panel */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className={`h-5 w-5 ${isValid ? 'text-emerald-400' : 'text-rose-400'}`} />
                <h2 className="text-lg font-semibold text-white">JSON Editor</h2>
              </div>
              
              {/* Status Badge */}
              <span className={`rounded-full px-3 py-1 text-xs ${
                isValid 
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/20 text-rose-400"
              }`}>
                {isValid ? 'Valid JSON' : 'Invalid JSON'}
              </span>
            </div>

            {/* Editor Textarea */}
            <textarea
              className="min-h-[400px] w-full rounded-lg border border-white/10 bg-slate-900 p-4 font-mono text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-500/50 focus:outline-none sm:min-h-[500px]"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{"banners": [], "servicesHighlights": []}'
              spellCheck={false}
            />

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={formatJson}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white"
              >
                <Code className="h-4 w-4" />
                Format JSON
              </button>
              
              <button
                onClick={resetToTemplate}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Template
              </button>
              
              <button
                onClick={save}
                disabled={!isValid}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 sm:ml-auto"
              >
                <Save className="h-4 w-4" />
                Save CMS
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-lg font-semibold text-white">Preview</h2>
            </div>

            {!isValid ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 p-8 text-center">
                <AlertCircle className="h-12 w-12 text-rose-400" />
                <p className="mt-2 text-sm text-rose-400">Invalid JSON - cannot preview</p>
                <p className="mt-1 text-xs text-rose-400/70">Fix the syntax errors to see preview</p>
              </div>
            ) : !parsedJson ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileJson className="h-12 w-12 text-slate-600" />
                <p className="mt-2 text-sm text-slate-400">No content to preview</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Banners Preview */}
                {parsedJson.banners && parsedJson.banners.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-white">Banners ({parsedJson.banners.length})</h3>
                    <div className="space-y-3">
                      {parsedJson.banners.map((banner, idx) => (
                        <div key={banner.id || idx} className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-white">{banner.title || 'Untitled Banner'}</p>
                            <span className={`rounded-full px-2 py-0.5 text-xs ${
                              banner.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                            }`}>
                              {banner.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">Image: {banner.imageUrl || 'Not set'}</p>
                          {banner.link && (
                            <p className="mt-1 text-xs text-fuchsia-400">Link: {banner.link}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Highlights Preview */}
                {parsedJson.servicesHighlights && parsedJson.servicesHighlights.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-white">Services Highlights ({parsedJson.servicesHighlights.length})</h3>
                    <div className="space-y-3">
                      {parsedJson.servicesHighlights.map((service, idx) => (
                        <div key={service.id || idx} className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-white">{service.title || 'Untitled Service'}</p>
                            <span className="text-xs text-slate-500">Order: {service.order || 0}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">{service.description || 'No description'}</p>
                          <p className="mt-1 text-xs text-fuchsia-400">Icon: {service.icon || 'default'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw JSON Preview */}
                <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/20 p-3">
                  <p className="mb-2 text-xs font-medium text-slate-400">Raw Structure</p>
                  <pre className="max-h-40 overflow-auto text-xs text-slate-500">
                    {JSON.stringify(parsedJson, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-6 rounded-lg border border-white/10 bg-slate-900/30 p-4 text-xs text-slate-400">
          <p className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Expected structure: {"{ banners: array, servicesHighlights: array }"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}