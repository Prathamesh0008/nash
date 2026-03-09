"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

const TRACKING_ENABLED = ["1", "true", "yes", "on"].includes(
  String(process.env.NEXT_PUBLIC_LIVE_LOCATION_TRACKING_ENABLED || "true").trim().toLowerCase()
);
const MIN_INTERVAL_MS = Math.max(5000, Number(process.env.NEXT_PUBLIC_LIVE_LOCATION_INTERVAL_MS || 15000));
const MIN_MOVE_METERS = Math.max(5, Number(process.env.NEXT_PUBLIC_LIVE_LOCATION_MIN_MOVE_METERS || 25));
const ENABLE_HIGH_ACCURACY = ["1", "true", "yes", "on"].includes(
  String(process.env.NEXT_PUBLIC_LIVE_LOCATION_HIGH_ACCURACY || "").trim().toLowerCase()
);

function haversineMeters(from, to) {
  const lat1 = Number(from?.lat);
  const lng1 = Number(from?.lng);
  const lat2 = Number(to?.lat);
  const lng2 = Number(to?.lng);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function shouldSend(previousLocation, nextLocation, lastSentAtMs) {
  if (!previousLocation) return true;
  const now = Date.now();
  const elapsed = now - Number(lastSentAtMs || 0);
  if (elapsed >= MIN_INTERVAL_MS) return true;
  const distance = haversineMeters(previousLocation, nextLocation);
  if (distance === null) return true;
  return distance >= MIN_MOVE_METERS;
}

export default function LiveLocationTracker() {
  const { user, loading } = useAuth();
  const watchIdRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const lastLocationRef = useRef(null);
  const inflightRef = useRef(false);

  useEffect(() => {
    if (!TRACKING_ENABLED) return undefined;
    if (loading) return undefined;
    if (!user || !["user", "worker"].includes(String(user.role || ""))) return undefined;
    if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.geolocation) return undefined;
    if (!window.isSecureContext && window.location.hostname !== "localhost") return undefined;

    let cancelled = false;

    const sendLocation = async (location) => {
      if (inflightRef.current) return;
      inflightRef.current = true;
      try {
        await fetch("/api/location/live", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          keepalive: true,
          body: JSON.stringify(location),
        });
      } catch {
        // Ignore network errors; next position update will retry.
      } finally {
        inflightRef.current = false;
      }
    };

    const onSuccess = (position) => {
      const location = {
        lat: Number(position.coords.latitude),
        lng: Number(position.coords.longitude),
        accuracy: Number.isFinite(position.coords.accuracy) ? Number(position.coords.accuracy) : null,
        speed: Number.isFinite(position.coords.speed) ? Number(position.coords.speed) : null,
        heading: Number.isFinite(position.coords.heading) ? Number(position.coords.heading) : null,
        recordedAt: new Date(position.timestamp || Date.now()).toISOString(),
      };
      if (!shouldSend(lastLocationRef.current, location, lastSentAtRef.current)) return;
      lastLocationRef.current = location;
      lastSentAtRef.current = Date.now();
      sendLocation(location);
    };

    const startWatch = () => {
      if (cancelled) return;
      watchIdRef.current = navigator.geolocation.watchPosition(
        onSuccess,
        () => {
          // Permission denied / timeout / unavailable: silently ignore here.
        },
        {
          enableHighAccuracy: ENABLE_HIGH_ACCURACY,
          maximumAge: 10000,
          timeout: 20000,
        }
      );
    };

    const maybeStart = async () => {
      if (!navigator.permissions?.query) {
        startWatch();
        return;
      }
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (permission.state === "denied") return;
      } catch {
        // Continue to watchPosition flow.
      }
      startWatch();
    };

    maybeStart();

    return () => {
      cancelled = true;
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      lastLocationRef.current = null;
      lastSentAtRef.current = 0;
      inflightRef.current = false;
    };
  }, [loading, user]);

  return null;
}
