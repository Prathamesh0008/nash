"use client";

import { useState, useEffect, useCallback } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include", // IMPORTANT
      });
      const data = await res.json();

      if (data?.ok) {
        setUser(data.user); // 👈 DO NOT rename fields
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, refreshUser: fetchUser };
}
