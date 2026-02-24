"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      const res = await fetch(`/api/services?${params.toString()}`);
      const data = await res.json();
      setServices(data.services || []);
      setLoading(false);
    };

    load();
  }, [query]);

  return (
    <section className="space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">Wellness Service Catalog</h1>
        <p className="mt-1 text-sm text-slate-400">Choose massage, spa, and wellness services available for home visits.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="p-2.5 text-sm"
            placeholder="Search wellness service"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Link href="/booking/new" className="app-btn-primary rounded-lg px-3 py-2 text-center text-sm font-semibold">
            New Booking
          </Link>
        </div>
      </div>

      {loading && <p className="text-slate-400">Loading services...</p>}

      <div className="grid-auto">
        {services.map((service, idx) => (
          <article key={service._id} className="panel space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{service.title || `Service ${idx + 1}`}</h2>
            </div>
            <p className="text-sm text-slate-400">{service.description || "Verified therapist home service."}</p>
            <p className="text-sm">Base: INR {service.basePrice} | Visit: INR {service.visitFee}</p>
            <div className="flex gap-2">
              <Link href={`/service/${service.slug}`} className="app-btn-secondary rounded-lg px-3 py-2 text-sm font-medium">
                View Workers
              </Link>
              <Link href={`/booking/new?serviceId=${service._id}`} className="app-btn-primary rounded-lg px-3 py-2 text-sm font-semibold">
                Book Now
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
