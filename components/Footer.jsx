"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart,
  Sparkles,
  MessageCircle,
  Users,
  Shield,
  Star,
  Instagram,
  Twitter,
  Github,
  Globe,
  ChevronRight,
  LayoutDashboard,
  ClipboardList,
  Wallet,
  FileWarning,
  UserCog,
  BadgeDollarSign,
} from "lucide-react";

const userLinkSections = [
  {
    title: "Discover",
    icon: Sparkles,
    links: [
      { href: "/services", label: "All Services", badge: "Hot" },
      { href: "/workers", label: "Find Workers" },
      { href: "/search", label: "Search Providers", badge: "New" },
      { href: "/booking/new", label: "Book a Service" },
    ],
  },
  {
    title: "Connect",
    icon: MessageCircle,
    links: [
      { href: "/chat", label: "Live Chat" },
      { href: "/notifications", label: "Notifications" },
      { href: "/orders", label: "Your Orders" },
      { href: "/wallet", label: "Wallet" },
      { href: "/membership", label: "Membership", badge: "New" },
      { href: "/family-pass", label: "Family Pass", badge: "New" },
      { href: "/referrals", label: "Referrals", badge: "New" },
    ],
  },
  {
    title: "Community",
    icon: Users,
    links: [
      { href: "/worker/onboarding", label: "Become a Worker" },
      { href: "/worker/jobs", label: "Worker Jobs" },
      { href: "/support", label: "Support" },
      { href: "/admin/dashboard", label: "Admin Dashboard" },
    ],
  },
  {
    title: "Legal",
    icon: Shield,
    links: [
      { href: "/legal/terms", label: "Terms of Use" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/cookies", label: "Cookie Policy" },
      { href: "/legal/payments", label: "Payment Policy" },
    ],
  },
];

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Github, href: "https://github.com", label: "Github" },
];

const appFeatures = [
  { icon: Heart, text: "Trusted by Local Customers" },
  { icon: Star, text: "Top Rated Service Platform" },
  { icon: Shield, text: "Verified Worker Profiles" },
];

const adminLinkSections = [
  {
    title: "Admin Core",
    icon: LayoutDashboard,
    links: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/workers", label: "Workers" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/orders", label: "Orders" },
    ],
  },
  {
    title: "Financial",
    icon: BadgeDollarSign,
    links: [
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/payouts", label: "Payouts" },
      { href: "/admin/promos", label: "Promos" },
      { href: "/admin/boost-plans", label: "Boost Plans" },
    ],
  },
  {
    title: "Operations",
    icon: FileWarning,
    links: [
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/cms", label: "CMS" },
      { href: "/admin/crm-templates", label: "CRM Templates" },
      { href: "/admin/reschedule-policy", label: "Reschedule Policy" },
    ],
  },
  {
    title: "Legal",
    icon: Shield,
    links: [
      { href: "/legal/terms", label: "Terms of Use" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/cookies", label: "Cookie Policy" },
      { href: "/support", label: "Support" },
    ],
  },
];

const workerLinkSections = [
  {
    title: "Worker Core",
    icon: LayoutDashboard,
    links: [
      { href: "/worker/dashboard", label: "Dashboard" },
      { href: "/worker/jobs", label: "Jobs" },
      { href: "/chat", label: "Inbox" },
      { href: "/worker/profile/edit", label: "Profile" },
    ],
  },
  {
    title: "Income",
    icon: Wallet,
    links: [
      { href: "/worker/wallet", label: "Wallet" },
      { href: "/worker/payouts", label: "Payouts" },
      { href: "/worker/boost", label: "Boost" },
      { href: "/worker/dashboard/reviews", label: "Reviews" },
    ],
  },
  {
    title: "Support",
    icon: ClipboardList,
    links: [
      { href: "/worker/onboarding", label: "Onboarding" },
      { href: "/worker/reports", label: "Reports" },
      { href: "/support", label: "Support" },
      { href: "/notifications", label: "Notifications" },
    ],
  },
  {
    title: "Legal",
    icon: Shield,
    links: [
      { href: "/legal/terms", label: "Terms of Use" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/cookies", label: "Cookie Policy" },
      { href: "/legal/payments", label: "Payment Policy" },
    ],
  },
];

function FooterLinks({ title, links, icon: Icon }) {
  return (
    <div className="group min-w-0">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-pink-400 group-hover:text-pink-300 transition-colors" />
        <h3 className="text-sm font-semibold tracking-wide text-white/90">{title}</h3>
      </div>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group/link flex w-full items-center justify-between gap-2 text-sm text-white/60 transition-all duration-300 hover:text-white"
            >
              <span className="relative min-w-0 break-words">
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-pink-400 to-purple-400 group-hover/link:w-full transition-all duration-300" />
              </span>
              <span className="ml-auto inline-flex items-center gap-1">
                {link.badge && (
                  <span
                    className={`
                    px-1.5 py-0.5 text-[10px] font-medium rounded-full
                    ${link.badge === "New"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-pink-500/20 text-pink-300"}
                  `}
                  >
                    {link.badge}
                  </span>
                )}
                <ChevronRight className="h-3 w-3 shrink-0 opacity-0 -translate-x-2 transition-all group-hover/link:translate-x-0 group-hover/link:opacity-100" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const role = user?.role || "guest";
  const linkSections = useMemo(() => {
    if (role === "admin") return adminLinkSections;
    if (role === "worker") return workerLinkSections;
    return userLinkSections;
  }, [role]);
  const roleSummary = role === "admin" ? "Admin operations and moderation tools" : role === "worker" ? "Worker jobs, earnings, and profile tools" : "Customer booking and service discovery";
  const rolePrimaryCta = role === "admin"
    ? { href: "/admin/dashboard", label: "Open Admin Dashboard", icon: UserCog }
    : role === "worker"
      ? { href: "/worker/dashboard", label: "Open Worker Dashboard", icon: LayoutDashboard }
      : { href: "/services", label: "Explore Services", icon: Heart };
  const roleSecondaryCta = role === "admin"
    ? { href: "/admin/workers", label: "Review Workers", icon: Users }
    : role === "worker"
      ? { href: "/worker/jobs", label: "View Jobs", icon: ClipboardList }
      : { href: "/worker/onboarding", label: "Become a Worker", icon: Globe };
  const PrimaryCtaIcon = rolePrimaryCta.icon;
  const SecondaryCtaIcon = roleSecondaryCta.icon;

  if (role === "admin" || role === "worker") {
    return (
      <footer className="mt-8 border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto flex w-full max-w-[92rem] flex-col items-center justify-between gap-3 px-4 py-4 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
          <p>{"\u00A9"} {year} Nash Workforce</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end">
            <Link href="/support" className="hover:text-slate-200">Support</Link>
            <Link href="/referrals" className="hover:text-slate-200">Referrals</Link>
            <Link href="/legal/privacy" className="hover:text-slate-200">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-slate-200">Terms</Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative mt-16 border-t border-white/5 bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950 sm:mt-20">
      {/* Animated background elements */}
      <div className=" absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.1),_transparent_70%)]" />

        {/* Floating hearts */}
        <div className="absolute top-20 left-1/4 animate-float-slow">
          <Heart className="w-4 h-4 text-pink-500/20" />
        </div>
        <div className="absolute bottom-20 right-1/4 animate-float">
          <Heart className="w-6 h-6 text-purple-500/20" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
        {/* Main footer content */}
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Brand section - larger */}
          <div className="lg:col-span-4 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-medium text-white/80">Book Trusted Home Services</span>
            </div>

            <div>
              <h2 className="mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                Nash Workforce
              </h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                {roleSummary}
              </p>
            </div>

            {/* App features */}
            <div className="flex flex-wrap gap-3">
              {appFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <feature.icon className="w-3.5 h-3.5 text-pink-400" />
                  <span className="text-xs text-white/70">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={rolePrimaryCta.href}
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
              >
                <span className="relative z-10">{rolePrimaryCta.label}</span>
                <PrimaryCtaIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link
                href={roleSecondaryCta.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <SecondaryCtaIcon className="w-4 h-4" />
                {roleSecondaryCta.label}
              </Link>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-pink-400 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links sections */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-4">
              {linkSections.map((section) => (
                <FooterLinks
                  key={section.title}
                  title={section.title}
                  links={section.links}
                  icon={section.icon}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative pt-8 mt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="order-2 text-center text-sm text-white/40 md:order-1 md:text-left">
              {"\u00A9"} {year} Nash Workforce. Built with <Heart className="w-3.5 h-3.5 inline-block text-pink-400 mx-0.5" /> for reliable services
            </p>

            <div className="order-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:order-2 md:justify-end md:gap-6">
              <Link href="/legal/terms" className="text-sm text-white/40 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="text-sm text-white/40 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/legal/cookies" className="text-sm text-white/40 hover:text-white transition-colors">
                Cookies
              </Link>
              <Link href="/membership" className="text-sm text-white/40 hover:text-white transition-colors">
                Membership
              </Link>
              <Link href="/family-pass" className="text-sm text-white/40 hover:text-white transition-colors">
                Family Pass
              </Link>
              <Link href="/support" className="text-sm text-white/40 hover:text-white transition-colors">
                Support
              </Link>
              <Link href="/referrals" className="text-sm text-white/40 hover:text-white transition-colors">
                Referrals
              </Link>
            </div>
          </div>

          {/* Decorative gradient line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
}

