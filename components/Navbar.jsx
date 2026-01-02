"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Menu, X, Globe, User, Search, Filter, MapPin,
  ChevronDown, HelpCircle, Sparkles, CheckCircle,
  Home, Users, Briefcase, Video
} from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState("full");
  



  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const profileRef = useRef(null);
  const languageRef = useRef(null);

  const [user, setUser] = useState(null);
  const [workerStatus, setWorkerStatus] = useState(null);
useEffect(() => {
  if (!user || user.role !== "worker") return;

  fetch("/api/worker/status")
    .then((res) => res.json())
    .then((data) => {
      if (data?.ok) {
        setWorkerStatus(data.status); // draft | pending_payment | active | rejected
      }
    })
    .catch(() => {});
}, [user]);

  const mainLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Women", href: "/women", icon: Users },
    { label: "Men", href: "/men", icon: Users },
    { label: "Couple", href: "/couple", icon: Users },
    { label: "Companies", href: "/companies", icon: Briefcase },
    { label: "Videos", href: "/videos", icon: Video },
  ];

  const categories = ["BDSM", "Escort", "Massage", "Role Play", "Fetish"];
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "es", name: "Español", flag: "🇪🇸" },
  ];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll logic
 useEffect(() => {
  if (isMobile) return;

  const onScroll = () => {
    const y = window.scrollY;

    if (y <= 40) {
      setMode("full");
    } else {
      setMode("compact");
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, [isMobile]);


  // Close dropdowns
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(e.target)) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
  fetch("/api/auth/me")
    .then(res => res.json())
    .then(data => {
      if (data?.ok) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    })
    .catch(() => setUser(null));
}, []);


  // Compact bar
  const CompactBar = useCallback(() => (
    <div className="w-full px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-bold">
            V
          </div>
          <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Valentina's
                </span>
                <span className="text-xs text-white/60 tracking-[0.2em] uppercase hidden sm:block">
                  Premium Companions
                </span>
              </div>
        </Link> */}
        <BrandLogo/>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-1.5 w-48 bg-black/40 border border-white/20 rounded-lg text-sm focus:outline-none focus:border-pink-500"
              />
            </div>

            {user ? (
              <button className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <User className="h-4 w-4" />
              </button>
            ) : (
              <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/5 border border-white/10"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Login</span>
                  </Link>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  ), [searchQuery, user, menuOpen]);

  // Full navbar
  const FullNavbar = () => (
    <div className="w-full">
      {/* Row 1 */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-pink-500 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent"></div>
                <span className="text-lg md:text-xl font-bold tracking-tighter relative z-10">V</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Valentina's
                </span>
                <span className="text-xs text-white/60 tracking-[0.2em] uppercase hidden sm:block">
                  Premium Companions
                </span>
              </div>
            </Link> */}
            <BrandLogo/>

            <div className="hidden md:flex items-center gap-4">
              <Link 
                href="/support" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/5 border border-white/10"
              >
                <HelpCircle className="h-4 w-4 text-pink-400" />
                <span className="text-sm font-medium">Support</span>
              </Link>

              {user ? (
                <div ref={profileRef} className="relative">
                  {profileOpen && (
  <div className="absolute right-0 mt-3 w-48 rounded-2xl bg-black/90 border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden z-50">
    
    {user.role === "worker" ? (
      <button
        onClick={() => {
          setProfileOpen(false);
          window.location.href = "/worker/dashboard";
        }}
        className="w-full text-left px-4 py-3 text-sm hover:bg-white/5"
      >
        Dashboard
      </button>
    ) : (
      <button
        onClick={() => {
          setProfileOpen(false);
          window.location.href = "/profile";
        }}
        className="w-full text-left px-4 py-3 text-sm hover:bg-white/5"
      >
        My Profile
      </button>
    )}

    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        window.location.href = "/login";
      }}
      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
    >
      Logout
    </button>
  </div>
)}

                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/5 border border-white/10"
                  >
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-pink-500/50">
                      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-500/20"></div>
                    </div>
                    <div className="text-left">
                     <div className="text-sm font-semibold">
  {user?.fullName || user?.email}
</div>
<div className="text-xs text-white/60 capitalize">
  {user?.role}
</div>

                      <div className="text-xs text-white/60">Premium Member</div>
                    </div>
                    <ChevronDown className={`h-4 w-4 ${profileOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/5 border border-white/10"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Login</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-lg shadow-pink-500/30"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">Register</span>
                  </Link>
                </div>
              )}

              <div ref={languageRef} className="relative">
                <button
                  onClick={() => setLanguageOpen(!languageOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/5 border border-white/10"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">EN</span>
                  <ChevronDown className={`h-4 w-4 ${languageOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/5 border border-white/10"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="hidden md:block border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center justify-center gap-6">
            {mainLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative group px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-500/10"
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Row 3 */}
      <div className="hidden md:block border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30">
              <Sparkles className="h-3 w-3" />
              <span className="text-xs font-semibold">Categories</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-white/5 to-white/3 border border-white/10 hover:border-pink-500/50 hover:bg-white/10"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4 */}
      <div className="hidden md:block border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search premium companions, locations, services..."
              className="w-full pl-12 pr-36 py-3.5 bg-gradient-to-r from-black/40 to-black/30 border border-white/20 rounded-2xl text-sm placeholder-white/50 focus:outline-none focus:border-pink-500"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-xl text-sm font-semibold">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Row 5 */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/5 border border-white/10">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/5 border border-white/10">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Regions</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
  {user?.role === "worker" && workerStatus ? (
    <>
      <CheckCircle
        className={`h-4 w-4 ${
          workerStatus === "active"
            ? "text-emerald-400"
            : workerStatus === "pending_payment"
            ? "text-yellow-400"
            : workerStatus === "rejected"
            ? "text-red-400"
            : "text-white/40"
        }`}
      />
      <span
        className={`font-medium ${
          workerStatus === "active"
            ? "text-emerald-300"
            : workerStatus === "pending_payment"
            ? "text-yellow-300"
            : workerStatus === "rejected"
            ? "text-red-300"
            : "text-white/50"
        }`}
      >
        {workerStatus === "active" && "Premium Verified"}
        {workerStatus === "pending_payment" && "Verification Pending"}
        {workerStatus === "rejected" && "Verification Rejected"}
        {workerStatus === "draft" && "Profile Incomplete"}
      </span>
    </>
  ) : (
    <>
      <CheckCircle className="h-4 w-4 text-emerald-400" />
      <span className="text-white/60">Premium Verified</span>
    </>
  )}
</div>

          </div>
        </div>
      </div>
    </div>
  );

  // Mobile menu
  const MobileMenu = () => (
    <div className="md:hidden fixed inset-0 top-0 z-50 bg-black/95 backdrop-blur-xl pt-20">
      <div className="px-4 py-6 space-y-6 overflow-y-auto h-full">
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/10"
        >
          <X className="h-6 w-6" />
        </button>
        

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search companions..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm"
          />
        </div>

        <div className="space-y-2">
          {mainLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        <div>
          <div className="text-sm font-semibold mb-3 px-2">Categories</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 text-sm rounded-lg bg-white/5"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-3 px-2">Quick Actions</div>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5">
              <MapPin className="h-4 w-4" />
              <span>Regions</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-3">
          {!user && (
            <div className="grid grid-cols-2 gap-3">
             <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/5 border border-white/10"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Login</span>
                  </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-center"
              >
                Register
              </Link>
            </div>
          )}
          {user && (
  <div className="space-y-3">
    {user.role === "worker" ? (
      <Link
        href="/worker/dashboard"
        onClick={() => setMenuOpen(false)}
        className="block px-4 py-3 rounded-xl bg-white/5"
      >
        Dashboard
      </Link>
    ) : (
      <Link
        href="/profile"
        onClick={() => setMenuOpen(false)}
        className="block px-4 py-3 rounded-xl bg-white/5"
      >
        My Profile
      </Link>
    )}

    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        setMenuOpen(false);
        window.location.href = "/login";
      }}
      className="w-full px-4 py-3 rounded-xl bg-red-500/10 text-red-400"
    >
      Logout
    </button>
  </div>
)}

          <Link
            href="/support"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/5"
          >
            <HelpCircle className="h-5 w-5 text-pink-400" />
            <div>
              <div className="text-sm font-medium">24/7 Support</div>
              <div className="text-xs text-white/60">Customer Service</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header
        className={`fixed top-0 w-full z-40 bg-gradient-to-b from-black via-black/95 to-black/90 backdrop-blur-xl border-b border-white/10 text-white shadow-2xl shadow-purple-900/20 transition-all duration-300 ${
          mode === "compact" && !isMobile ? "py-0" : "py-0"
        }`}
      >
        {mode === "full" || isMobile ? <FullNavbar /> : <CompactBar />}
      </header>

      {menuOpen && <MobileMenu />}
      {menuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}