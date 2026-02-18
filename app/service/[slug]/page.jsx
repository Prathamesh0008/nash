"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [data, setData] = useState({ service: null, workers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      const sp = new URLSearchParams();
      if (city) sp.set("city", city);
      if (pincode) sp.set("pincode", pincode);
      const res = await fetch(`/api/services/${slug}?${sp.toString()}`);
      const json = await res.json();
      setData({ service: json.service, workers: json.workers || [] });
      setLoading(false);
    };
    load();
  }, [slug, city, pincode]);

  return (
    <section className="space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-semibold">All-Rounder Worker Visit</h1>
        <p className="text-sm text-slate-400">Choose worker by area, rating and availability for flexible support.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <input className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
          <Link href={`/booking/new?serviceId=${data.service?._id || ""}`} className="rounded bg-sky-700 px-3 py-2 text-center text-white hover:bg-sky-600">
            Continue Booking
          </Link>
        </div>
      </div>

      {loading && <p className="text-slate-400">Loading workers...</p>}

      <div className="grid-auto">
        {data.workers.map((worker) => (
          <article key={worker.id} className="panel space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{worker.name}</h2>
              {worker.featured && <span className="rounded bg-amber-600 px-2 py-1 text-xs">Featured</span>}
            </div>
            <p className="text-sm text-slate-400">Rating {Number(worker.ratingAvg || 0).toFixed(1)} | Jobs {worker.jobsCompleted}</p>
            <div className="grid grid-cols-2 gap-2">
              {(worker.galleryPhotos || []).slice(0, 4).map((photo, i) => (
                <div key={`${worker.id}-${i}`} className="relative h-24 overflow-hidden rounded border border-slate-700 bg-slate-900">
                  <Image src={photo} alt="worker" fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Link href={`/booking/new?serviceId=${data.service?._id}&workerId=${worker.id}`} className="rounded bg-sky-700 px-3 py-2 text-sm text-white hover:bg-sky-600">
                Book This Worker
              </Link>
              <Link href={`/workers/${worker.id}`} className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700">
                Profile
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
