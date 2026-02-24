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

function TopPillLink({ href, label }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white md:text-base"
    >
      {label}
    </Link>
  );
}

function MainTab({ href, label, icon: Icon, pathname }) {
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm transition md:text-base ${
        active
          ? "bg-gradient-to-r from-fuchsia-600 via-pink-600 to-violet-600 text-white shadow-[0_0_18px_rgba(217,70,239,0.35)]"
          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function getRoleConfig(role) {
  if (role === "admin") {
    return {
      brandHref: "/admin/dashboard",
      badge: "Admin Panel",
      topLinks: [
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/workers", label: "Workers" },
        { href: "/admin/orders", label: "Orders" },
      ],
      tabs: [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/workers", label: "Workers", icon: UserCog },
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
      badge: "Worker Panel",
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
      searchHint: "Manage your work activity",
      regionsHref: "/worker/jobs",
      filtersHref: "/worker/dashboard",
      showSupport: true,
    };
  }

  return {
    brandHref: "/",
    badge: "Premium",
    topLinks: [{ href: "/workers", label: "Therapists" }],
    tabs: [
      { href: "/", label: "Home", icon: Home },
      { href: "/womens", label: "Womens", icon: Venus },
      { href: "/mens", label: "Mens", icon: Mars },
      { href: "/services", label: "Wellness", icon: BriefcaseBusiness },
      { href: "/workers", label: "Therapists", icon: Users },
      { href: "/orders", label: "Orders", icon: Wrench },
      { href: "/chat", label: "Chat", icon: Video },
    ],
      quickTags: [
        { href: "/workers", label: "Massage Pros" },
        { href: "/workers?sort=rating", label: "Top Rated" },
        { href: "/booking/new", label: "Quick Booking" },
        { href: "/membership", label: "Membership" },
        { href: "/family-pass", label: "Family Pass" },
        { href: "/favorites", label: "Favorites" },
        { href: "/contact-us", label: "Contact Us" },
        { href: "/faq", label: "FAQ" },
        { href: "/landing", label: "City Pages" },
        { href: "/search", label: "More..." },
      ],
    showSearch: true,
    searchHint: "Search therapists, spa services, locations...",
    regionsHref: "/workers",
    filtersHref: "/services",
    showSupport: true,
  };
}

export default function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const roleConfig = useMemo(() => getRoleConfig(user?.role), [user?.role]);
  const roleTitle = !user?.role
    ? "Guest"
    : user.role === "worker"
      ? "Verified Worker"
      : user.role === "admin"
        ? "Admin"
        : "Customer";

  const profileHref = user?.role === "worker" ? "/worker/dashboard" : user?.role === "admin" ? "/admin/dashboard" : "/profile";
  const profileMenuItems = useMemo(() => {
    if (user?.role === "admin") {
      return [
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/workers", label: "Workers" },
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
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  };

  useEffect(() => {
    if (!profileMenuOpen) return;
    const onClickOutside = (event) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    const onEsc = (event) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
    }, 0);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-[92rem] flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href={roleConfig.brandHref} className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-600 text-2xl font-bold text-white shadow-[0_10px_30px_rgba(168,85,247,0.45)]">
                N
              </span>
              <div>
                <p className="text-xl font-bold tracking-tight text-fuchsia-300 md:text-3xl">Nash Wellness</p>
                <p className="text-xs tracking-[0.4em] text-slate-400">{user?.role === "admin" ? "ADMIN OPERATIONS" : user?.role === "worker" ? "THERAPIST OPERATIONS" : "SPA HOME SERVICES"}</p>
              </div>
            </Link>
            <span className="ml-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-1 text-[11px] font-semibold text-white">
              {roleConfig.badge}
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/notifications" className="rounded-2xl border border-white/10 p-3 text-slate-300 transition hover:border-fuchsia-400/50 hover:text-white">
              <Bell className="h-5 w-5" />
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              {roleConfig.showSupport && <TopPillLink href="/support" label="Support" />}
              {roleConfig.showSupport && <TopPillLink href="/contact-us" label="Contact Us" />}
              {roleConfig.topLinks.map((item) => (
                <TopPillLink key={item.href} href={item.href} label={item.label} />
              ))}
            </div>

            {!loading && !user && (
              <div className="hidden md:flex items-center gap-2">
                <TopPillLink href="/auth/login" label="Login" />
                <Link
                  href="/auth/signup"
                  className="rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-2.5 text-lg font-semibold text-white transition hover:opacity-90"
                >
                  Signup
                </Link>
              </div>
            )}

            {!loading && user && (
              <>
                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="flex min-w-[13rem] sm:min-w-[17rem] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-fuchsia-400/50"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white">{user.name || user.email || "User"}</span>
                      <span className="block truncate text-xs text-slate-400">{roleTitle}</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-xl border border-white/10 bg-slate-950/95 p-2 shadow-xl backdrop-blur">
                      <div className="mb-1 border-b border-white/10 px-2 pb-2 text-[11px] uppercase tracking-wide text-slate-400">
                        Quick Menu
                      </div>
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10 hover:text-white"
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
                        className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-200 hover:bg-rose-500/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <button className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white md:text-base">
              <Globe className="h-4 w-4" />
              EN
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-200 transition hover:border-fuchsia-400/50 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-white/10 md:block">
        <div className="mx-auto flex w-full max-w-[92rem] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav className="no-scrollbar flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto">
            {roleConfig.tabs.map((tab) => (
              <MainTab key={tab.href} href={tab.href} label={tab.label} icon={tab.icon} pathname={pathname} />
            ))}
          </nav>

          <div className="no-scrollbar flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto">
            {roleConfig.quickTags.map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-fuchsia-400/50 hover:text-white md:text-sm"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="mx-auto w-full max-w-[92rem] px-4 py-4">
          {roleConfig.showSearch ? (
            <>
              <form onSubmit={onSearch} className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[16rem] flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fuchsia-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="search"
                    placeholder={roleConfig.searchHint}
                    className="h-14 w-full rounded-2xl border border-white/15 bg-black/60 pl-12 pr-4 text-base text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-fuchsia-500/60"
                  />
                </div>

                <button
                  type="submit"
                  className="h-14 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-8 text-base font-semibold text-white transition hover:opacity-90"
                >
                  Search
                </button>

                <Link
                  href={roleConfig.filtersHref}
                  className="inline-flex h-14 items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] px-6 text-base font-medium text-slate-100 transition hover:border-fuchsia-400/50"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </Link>

                <Link
                  href={roleConfig.regionsHref}
                  className="inline-flex h-14 items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] px-6 text-base font-medium text-slate-100 transition hover:border-fuchsia-400/50"
                >
                  <MapPin className="h-5 w-5" />
                  Regions
                </Link>
              </form>

              <div className="mt-2 flex flex-wrap items-center gap-3 px-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1">
                  <MessageCircle className="h-3 w-3" />
                  Fast booking support
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1">
                  Verified workers
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1">
                  Secure online payments
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-fuchsia-400" />
                {roleConfig.searchHint}
              </span>
              <span className="text-xs text-slate-400">
                {user?.role === "admin" ? "Admin focused navigation active" : "Worker focused navigation active"}
              </span>
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 md:hidden">
          <div className="mx-auto w-full max-w-[92rem] space-y-3 px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {roleConfig.tabs.map((tab) => {
                const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-xl px-3 py-2 text-sm ${
                      active
                        ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white"
                        : "border border-white/10 bg-white/[0.03] text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {roleConfig.quickTags.map((tag) => (
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

            <div className="flex flex-wrap gap-2">
              {roleConfig.showSupport && (
                <TopPillLink href="/support" label="Support" />
              )}
              {roleConfig.showSupport && (
                <TopPillLink href="/contact-us" label="Contact Us" />
              )}
              {roleConfig.topLinks.map((item) => (
                <TopPillLink key={item.href} href={item.href} label={item.label} />
              ))}
            </div>

            {roleConfig.showSearch ? (
              <form onSubmit={onSearch} className="space-y-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="search"
                    placeholder={roleConfig.searchHint}
                    className="h-11 w-full rounded-xl border border-white/15 bg-black/60 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-3 py-2 text-sm font-semibold text-white"
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
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
                {roleConfig.searchHint}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
