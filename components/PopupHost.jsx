"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

function toneClass(type) {
  if (type === "error") return "border-rose-500/40 bg-rose-500/15 text-rose-100";
  if (type === "success") return "border-emerald-500/40 bg-emerald-500/15 text-emerald-100";
  if (type === "warning") return "border-amber-500/40 bg-amber-500/15 text-amber-100";
  return "border-sky-500/40 bg-sky-500/15 text-sky-100";
}

function ToneIcon({ type }) {
  if (type === "error") return <AlertCircle className="h-4 w-4" />;
  if (type === "success") return <CheckCircle2 className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
}

export default function PopupHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let nextId = 1;
    const onPopup = (event) => {
      const detail = event?.detail || {};
      const message = String(detail.message || "").trim();
      if (!message) return;
      const type = detail.type || "info";
      const id = nextId;
      nextId += 1;
      setItems((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 3200);
    };

    window.addEventListener("app-popup", onPopup);
    return () => window.removeEventListener("app-popup", onPopup);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto w-full max-w-xl rounded-lg border px-4 py-3 text-sm shadow-xl backdrop-blur ${toneClass(item.type)}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-2">
            <ToneIcon type={item.type} />
            <p className="leading-5">{item.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
