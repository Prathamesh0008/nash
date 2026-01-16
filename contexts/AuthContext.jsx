"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔐 load user once
  async function refreshMe() {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (res.status === 401) {
        setUser(null);
        return;
      }

      if (!res.ok) throw new Error("Auth failed");

      const data = await res.json();
      setUser(data.user || null);
    } catch (err) {
      console.error("Auth error:", err);
      setUser(null);
    }
  }

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, []);

  // 🚪 logout
  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshMe, // ✅ NOW AVAILABLE
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
