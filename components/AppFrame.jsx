"use client";

import { usePathname } from "next/navigation";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";

const HIDE_CHROME_PATHS = new Set([
  "/login",
  "/auth/login",
  "/admin/login",
  "/signup",
  "/auth/signup",
  "/register",
]);

export default function AppFrame({ children }) {
  const pathname = usePathname();
  const hideChrome = HIDE_CHROME_PATHS.has(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {!hideChrome && <MainNav />}
      <main className="page w-full flex-1">{children}</main>
      {!hideChrome && <Footer />}
    </div>
  );
}
