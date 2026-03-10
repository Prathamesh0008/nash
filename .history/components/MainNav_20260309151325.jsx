"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  Globe,
  Home,
  MapPin,
  Search,
  SlidersHorizontal,
  UserRound,
  Users,
  Video,
  Wrench,
  MessageCircle,
  LogOut,
  Mars,
  Venus,
  ShieldCheck,
  ClipboardList,
  Wallet,
  FileWarning,
  LayoutDashboard,
  Settings,
  BadgeDollarSign,
  UserCog,
  Megaphone,
  Menu,
  X,
} from "lucide-react";

function TopPillLink({ href, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white lg:px-5 lg:py-2 lg:text-sm"
    >
      {label}
    </Link>
  );
}

function MainTab({ href, label, icon: Icon, pathname, isScrolled, onClick }) {
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs transition-all lg:gap-2 lg:px-4 lg:text-sm xl:px-5 ${
        active
          ? "bg-gradient-to-r from-fuchsia-600 via-pink-600 to-violet-600 text-white shadow-[0_0_18px_rgba(217,70,239,0.35)]"
          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
      } ${isScrolled ? "lg:py-1.5" : "lg:py-2"}`}
    >
      <Icon className={`${isScrolled ? "h-3.5 w-3.5" : "h-4 w-4"} lg:h-4 lg:w-4`} />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function getRoleConfig(role) {
  // ... (keep your existing roleConfig function exactly as is)
  if (role === "admin") {
    return {
      brandHref: "/admin/dashboard",
      badge: "Admin Panel",
      topLinks: [
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/workers", label: "Escorts" },
        { href: "/admin/orders", label: "Orders" },
      ],
      tabs: [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/workers", label: "Escorts", icon: UserCog },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/orders", label: "Orders", icon: ClipboardList },
        { href: "/admin/payments", label: "Payments", icon: BadgeDollarSign },
        { href: "/admin/payouts", label: "Payouts", icon: Wallet },
        { href: "/admin/reports", label: "Reports", icon: FileWarning },
        { href: "/admin/fraud", label: "Fraud", icon: ShieldCheck },
        { href: "/admin/support", label: "Support", icon: MessageCircle },
        { href: "/admin/cms", label: "CMS", icon: Settings },
      ],
      quickTags: [
        { href: "/admin/promos", label: "Promos" },
        { href: "/admin/boost-plans", label: "Boost Plans" },
        { href: "/admin/reschedule-policy", label: "Reschedule Policy" },
        { href: "/admin/crm-templates", label: "CRM" },
        { href: "/admin/support", label: "Support Desk" },
        { href: "/contact-us", label: "Contact Us" },
        { href: "/faq", label: "FAQ" },
        { href: "/admin/fraud", label: "Fraud Queue" },
      ],
      showSearch: false,
      searchHint: "Manage platform operations",
      regionsHref: "/admin/workers",
      filtersHref: "/admin/orders",
      showSupport: true,
    };
  }

  if (role === "worker") {
    return {
      brandHref: "/worker/dashboard",
      badge: "Escort Panel",
      topLinks: [
        { href: "/worker/dashboard", label: "Dashboard" },
        { href: "/worker/jobs", label: "Jobs" },
        { href: "/worker/payouts", label: "Payouts" },
      ],
      tabs: [
        { href: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/worker/jobs", label: "Jobs", icon: ClipboardList },
        { href: "/chat", label: "Inbox", icon: MessageCircle },
        { href: "/worker/wallet", label: "Wallet", icon: Wallet },
        { href: "/worker/reports", label: "Reports", icon: FileWarning },
        { href: "/worker/boost", label: "Boost", icon: Megaphone },
        { href: "/worker/profile/edit", label: "Profile", icon: UserRound },
      ],
      quickTags: [
        { href: "/worker/onboarding", label: "Onboarding" },
        { href: "/worker/dashboard/reviews", label: "Reviews" },
        { href: "/contact-us", label: "Contact Us" },
        { href: "/faq", label: "FAQ" },
        { href: "/worker/inbox", label: "Legacy Inbox" },
      ],
      showSearch: false,
      searchHint: "Manage your escort activity",
      regionsHref: "/worker/jobs",
      filtersHref: "/worker/dashboard",
      showSupport: true,
    };
  }

  return {
    brandHref: "/",
    badge: "Premium",
      topLinks: [{ href: "/workers", label: "Escorts" }],
      tabs: [
        { href: "/", label: "Home", icon: Home },
        { href: "/womens", label: "Womens", icon: Venus },
        { href: "/mens", label: "Mens", icon: Mars },
        { href: "/services", label: "Services", icon: BriefcaseBusiness },
        { href: "/workers", label: "Escorts", icon: Users },
        { href: "/orders", label: "Orders", icon: Wrench },
        { href: "/chat", label: "Chat", icon: Video },
      ],
      quickTags: [
        { href: "/workers", label: "Verified Escorts" },
        { href: "/workers?sort=rating", label: "Top Rated" },
        { href: "/booking/new", label: "Quick Booking" },
        { href: "/membership", label: "Membership" },
        { href: "/family-pass", label: "VIP Pass" },
        { href: "/favorites", label: "Favorites" },
        { href: "/contact-us", label: "Contact Us" },
        { href: "/faq", label: "FAQ" },
        { href: "/landing", label: "City Pages" },
        { href: "/search", label: "More..." },
      ],
    showSearch: true,
    searchHint: "Search escorts, companionship services, locations...",
    regionsHref: "/workers",
    filtersHref: "/services",
    showSupport: true,
  };
}

export default function MainNav() {
  const SCROLL_DOWN_THRESHOLD = 120;
  const SCROLL_UP_THRESHOLD = 48;
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCompactSearch, setShowCompactSearch] = useState(false);
  const profileMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const roleConfig = useMemo(() => getRoleConfig(user?.role), [user?.role]);
  const roleTitle = !user?.role
    ? "Guest"
    : user.role === "worker"
      ? "Verified Escort"
      : user.role === "admin"
        ? "Admin"
        : "Customer";

  // Scroll effect with hysteresis + rAF throttle to avoid sticky header flicker.
  useEffect(() => {
    let ticking = false;
    const updateByScroll = () => {
      const scrollPosition = window.scrollY;

      setIsScrolled((prev) => {
        if (prev) {
          return scrollPosition > SCROLL_UP_THRESHOLD;
        }
        return scrollPosition > SCROLL_DOWN_THRESHOLD;
      });

      if (scrollPosition > SCROLL_DOWN_THRESHOLD) {
        setShowCompactSearch((prev) => (prev ? false : prev));
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateByScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    updateByScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Focus search input when compact search opens
  useEffect(() => {
    if (showCompactSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showCompactSearch]);

  const profileMenuItems = useMemo(() => {
    if (user?.role === "admin") {
      return [
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/workers", label: "Escorts" },
        { href: "/admin/orders", label: "Orders" },
        { href: "/admin/payments", label: "Payments" },
      ];
    }
    if (user?.role === "worker") {
      return [
        { href: "/worker/dashboard", label: "Dashboard" },
        { href: "/worker/jobs", label: "Jobs" },
        { href: "/worker/wallet", label: "Wallet" },
        { href: "/worker/payouts", label: "Payouts" },
      ];
    }
    return [
      { href: "/profile", label: "Profile" },
      { href: "/orders", label: "Orders" },
      { href: "/wallet", label: "Wallet" },
      { href: "/favorites", label: "Favorites" },
      { href: "/membership", label: "Membership" },
    ];
  }, [user?.role]);

  const onSearch = (e) => {
    e.preventDefault();
    const value = query.trim();
    if (value) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    } else {
      router.push("/search");
    }
    setShowCompactSearch(false);
    setMobileMenuOpen(false);
  };

  const handleCompactSearchClick = () => {
    setShowCompactSearch((prev) => !prev);
  };

  // Close menus on route change
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
      setShowCompactSearch(false);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [pathname]);

  // Click outside handler for profile menu
  useEffect(() => {
    if (!profileMenuOpen) return;
    const onClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [profileMenuOpen]);

  return (
    <header className={`sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl transition-all duration-300 ${
      isScrolled ? "" : ""
    }`}>
      {/* Main Top Bar */}
      <div className={`transition-all duration-300 ${
        isScrolled ? "py-1" : "py-2 md:py-3"
      }`}>
        <div className="mx-auto flex max-w-[92rem] items-center justify-between px-3 md:px-4">
          {/* Logo Section */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link href={roleConfig.brandHref} className="flex items-center gap-2 md:gap-3">
              <span className={`grid place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-600 font-bold text-white shadow-[0_10px_30px_rgba(168,85,247,0.45)] transition-all duration-300 ${
                isScrolled ? "h-8 w-8 text-base md:h-9 md:w-9" : "h-10 w-10 text-xl md:h-12 md:w-12 md:text-2xl"
              }`}>
                N
              </span>
              <div className="flex flex-col">
                <p className={`font-bold tracking-tight text-fuchsia-300 transition-all duration-300 ${
                  isScrolled ? "text-sm md:text-base" : "text-base md:text-xl lg:text-2xl"
                }`}>
                  Nash Elite Escorts
                </p>
                <p className={`text-[8px] tracking-[0.2em] text-slate-400 transition-all duration-300 md:text-[10px] md:tracking-[0.3em] ${
                  isScrolled ? "hidden md:hidden lg:block" : "block"
                }`}>
                  {user?.role === "admin" ? "ADMIN OPERATIONS" : user?.role === "worker" ? "ESCORT OPERATIONS" : "PRIVATE COMPANION SERVICES"}
                </p>
              </div>
            </Link>
            <span className={`rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-2 py-0.5 text-[9px] font-semibold text-white transition-all md:px-3 md:text-[10px] lg:px-4 lg:py-1 lg:text-[11px] ${
              isScrolled ? "opacity-90" : ""
            }`}>
              {roleConfig.badge}
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 md:gap-2 lg:gap-3">
            {/* Notifications */}
            <Link 
              href="/notifications" 
              className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:border-fuchsia-400/50 hover:text-white md:rounded-2xl"
            >
              <Bell className={`transition-all duration-300 ${
                isScrolled ? "h-4 w-4" : "h-4 w-4 md:h-5 md:w-5"
              }`} />
            </Link>

            {/* Desktop Support Links */}
            <div className="hidden items-center gap-1 lg:flex">
              {roleConfig.showSupport && (
                <>
                  <TopPillLink href="/support" label="Support" />
                  <TopPillLink href="/contact-us" label="Contact Us" />
                </>
              )}
              {roleConfig.topLinks.map((item) => (
                <TopPillLink key={item.href} href={item.href} label={item.label} />
              ))}
            </div>

            {/* Auth Buttons */}
            {!loading && !user && (
              <div className="hidden items-center gap-1 md:flex">
                <TopPillLink href="/auth/login" label="Login" />
                <Link
                  href="/auth/signup"
                  className={`rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 md:rounded-2xl md:px-4 md:py-2 md:text-sm ${
                    isScrolled ? "md:py-1.5" : ""
                  }`}
                >
                  Signup
                </Link>
              </div>
            )}

            {/* User Profile */}
            {!loading && user && (
              <div ref={profileMenuRef} className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1 transition hover:border-fuchsia-400/50 md:rounded-2xl md:px-3 ${
                    isScrolled ? "md:py-1" : "md:py-1.5"
                  }`}
                >
                  <span className={`grid place-items-center rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300 transition-all ${
                    isScrolled ? "h-7 w-7" : "h-8 w-8 md:h-9 md:w-9"
                  }`}>
                    <UserRound className={`${isScrolled ? "h-3.5 w-3.5" : "h-4 w-4 md:h-5 md:w-5"}`} />
                  </span>
                  <span className="hidden min-w-0 flex-1 lg:block">
                    <span className="block truncate text-xs font-semibold text-white">
                      {user.name || user.email || "User"}
                    </span>
                    <span className="block truncate text-[10px] text-slate-400">
                      {roleTitle}
                    </span>
                  </span>
                  <ChevronDown className={`hidden h-3 w-3 text-slate-400 transition-transform lg:block ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`} />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 rounded-xl border border-white/10 bg-slate-950/95 p-2 shadow-xl backdrop-blur md:w-56">
                    <div className="mb-1 border-b border-white/10 px-2 pb-2 text-[10px] uppercase tracking-wide text-slate-400">
                      Quick Menu
                    </div>
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-xs text-slate-200 hover:bg-white/10 hover:text-white md:text-sm"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={async () => {
                        setProfileMenuOpen(false);
                        await logout();
                        router.push("/auth/login");
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-200 hover:bg-rose-500/20 md:text-sm"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Language Selector */}
            <button className={`hidden items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white md:inline-flex lg:rounded-2xl lg:px-3 lg:text-sm ${
              isScrolled ? "md:py-1" : ""
            }`}>
              <Globe className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
              <span className="hidden lg:inline">EN</span>
              <ChevronDown className="hidden h-3 w-3 lg:inline" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-200 transition hover:border-fuchsia-400/50 md:h-9 md:w-9 lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-4 w-4 md:h-5 md:w-5" /> : <Menu className="h-4 w-4 md:h-5 md:w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation - Only shows when not scrolled */}
      {!isScrolled && (
        <div className="hidden border-t border-white/10 md:block">
          <div className="mx-auto max-w-[92rem] px-4">
            {/* Main Tabs */}
            <div className="flex items-center justify-between gap-4 py-2">
              <nav className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto lg:gap-2">
                {roleConfig.tabs.map((tab) => (
                  <MainTab 
                    key={tab.href} 
                    href={tab.href} 
                    label={tab.label} 
                    icon={tab.icon} 
                    pathname={pathname} 
                    isScrolled={isScrolled}
                  />
                ))}
              </nav>
            </div>

            {/* Quick Tags */}
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-2">
              {roleConfig.quickTags.map((tag) => (
                <Link
                  key={tag.label}
                  href={tag.href}
                  className="whitespace-nowrap rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white lg:text-sm"
                >
                  {tag.label}
                </Link>
              ))}
            </div>

            {/* Search Section */}
            {roleConfig.showSearch && (
              <div className="py-3">
                <form onSubmit={onSearch} className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fuchsia-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      type="search"
                      placeholder={roleConfig.searchHint}
                      className="h-12 w-full rounded-2xl border border-white/15 bg-black/60 pl-12 pr-4 text-base text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-fuchsia-500/60"
                    />
                  </div>

                  <button
                    type="submit"
                    className="h-12 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-6 text-base font-semibold text-white transition hover:opacity-90"
                  >
                    Search
                  </button>

                  <Link
                    href={roleConfig.filtersHref}
                    className="flex h-12 items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] px-4 text-base font-medium text-slate-100 transition hover:border-fuchsia-400/50"
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                    <span className="hidden lg:inline">Filters</span>
                  </Link>

                  <Link
                    href={roleConfig.regionsHref}
                    className="flex h-12 items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] px-4 text-base font-medium text-slate-100 transition hover:border-fuchsia-400/50"
                  >
                    <MapPin className="h-5 w-5" />
                    <span className="hidden lg:inline">Regions</span>
                  </Link>
                </form>

                {/* Trust Badges */}
                <div className="mt-2 flex items-center gap-3 px-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1">
                    <MessageCircle className="h-3 w-3" />
                    Private booking support
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1">
                    Verified escorts
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1">
                    Secure online payments
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compact Scrolled Navigation */}
      {isScrolled && (
        <div className="hidden border-t border-white/10 md:block">
          <div className="mx-auto max-w-[92rem] px-4">
            <div className="flex items-center justify-between gap-4 py-1.5">
              {/* Compact Tabs */}
              <nav className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto">
                {roleConfig.tabs.slice(0, 5).map((tab) => (
                  <MainTab 
                    key={tab.href} 
                    href={tab.href} 
                    label={tab.label} 
                    icon={tab.icon} 
                    pathname={pathname} 
                    isScrolled={isScrolled}
                  />
                ))}
              </nav>

              {/* Compact Search */}
              <div className="relative">
                {showCompactSearch ? (
                  <form onSubmit={onSearch} className="flex items-center">
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search..."
                      className="h-8 w-48 rounded-l-xl border border-white/15 bg-black/60 px-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-fuchsia-500/60"
                    />
                    <button
                      type="submit"
                      className="h-8 rounded-r-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-3 text-xs font-semibold text-white"
                    >
                      Go
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={handleCompactSearchClick}
                    className="flex h-8 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs text-slate-200 transition hover:border-fuchsia-400/50"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Search</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 md:hidden">
          <div className="mx-auto max-w-[92rem] space-y-4 px-3 py-4">
            {/* Mobile Tabs */}
            <div className="grid grid-cols-2 gap-2">
              {roleConfig.tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    pathname === tab.href
                      ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white"
                      : "border border-white/10 bg-white/[0.03] text-slate-200"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            {/* Mobile Quick Tags */}
            <div className="flex flex-wrap gap-2">
              {roleConfig.quickTags.slice(0, 6).map((tag) => (
                <Link
                  key={tag.label}
                  href={tag.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
                >
                  {tag.label}
                </Link>
              ))}
            </div>

            {/* Mobile Auth */}
            {!loading && !user && (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-sm text-slate-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  Signup
                </Link>
              </div>
            )}

            {/* Mobile Support Links */}
            <div className="flex flex-wrap gap-2">
              {roleConfig.showSupport && (
                <>
                  <TopPillLink href="/support" label="Support" onClick={() => setMobileMenuOpen(false)} />
                  <TopPillLink href="/contact-us" label="Contact Us" onClick={() => setMobileMenuOpen(false)} />
                </>
              )}
              {roleConfig.topLinks.map((item) => (
                <TopPillLink key={item.href} href={item.href} label={item.label} onClick={() => setMobileMenuOpen(false)} />
              ))}
            </div>

            {/* Mobile Search */}
            {roleConfig.showSearch && (
              <form onSubmit={onSearch} className="space-y-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="search"
                    placeholder={roleConfig.searchHint}
                    className="h-10 w-full rounded-xl border border-white/15 bg-black/60 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="submit"
                    className="rounded-xl cursor-pointer bg-gradient-to-r from-fuchsia-600  to-pink-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Search
                  </button>
                  <Link
                    href={roleConfig.filtersHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-sm text-slate-100"
                  >
                    Filters
                  </Link>
                  <Link
                    href={roleConfig.regionsHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-sm text-slate-100"
                  >
                    Regions
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
