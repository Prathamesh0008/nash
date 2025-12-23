"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Menu, X, Globe, User, Search, Filter, MapPin,
  ChevronDown, HelpCircle, Sparkles, CheckCircle,
  Home, Users, Briefcase, Video, MessageCircle, Settings,
  LogOut, Bell, Heart, Shield, Crown
} from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState("full");
  const [activeLink, setActiveLink] = useState("");

  const lastScrollY = useRef(0);
  const profileRef = useRef(null);
  const languageRef = useRef(null);

  const user = null;

  const mainLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Women", href: "/women", icon: Users },
    { label: "Men", href: "/men", icon: Users },
    { label: "Couple", href: "/couple", icon: Users },
    { label: "Videos", href: "/videos", icon: Video },
  ];

  const categories = ["BDSM", "Escort", "Massage", "Role Play", "Fetish"];
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "es", name: "Español", flag: "🇪🇸" },
  ];

  const userMenuItems = [
    { label: "Profile", icon: User, href: "/profile" },
    { label: "Messages", icon: MessageCircle, href: "/messages" },
    { label: "Notifications", icon: Bell, href: "/notifications" },
    { label: "Favorites", icon: Heart, href: "/favorites" },
    { label: "Settings", icon: Settings, href: "/settings" },
    { label: "Logout", icon: LogOut, href: "/logout" },
  ];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
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

  // Close menu when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.mobile-menu-content')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  // Compact bar for desktop when scrolled
  const CompactBar = () => (
    <div className="w-full px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and quick nav */}
        <div className="flex items-center gap-4">
          <BrandLogo compact={true} />
          
          {/* Quick nav icons - desktop only */}
          <div className="hidden lg:flex items-center gap-1">
            {mainLinks.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                  activeLink === item.label ? 'bg-white/10' : ''
                }`}
                title={item.label}
              >
                <item.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right side - search and user */}
        <div className="flex items-center gap-3">
          {/* Search - desktop only */}
          <div className="hidden lg:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-10 pr-4 py-1.5 w-48 bg-black/40 border border-white/20 rounded-lg text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Login/Register - desktop only */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 hover:border-pink-500/50"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 font-semibold hover:from-pink-500 hover:to-purple-500"
            >
              Register
            </Link>
          </div>

          {/* Hamburger for mobile/tablet */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden relative h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 transition"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                menuOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              }`}
            >
              <Menu className="h-5 w-5" />
            </span>
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
              }`}
            >
              <X className="h-5 w-5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  // Full navbar for desktop
  const FullNavbar = () => (
    <div className="w-full">
      {/* Row 1 - Logo & Top Actions */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            
            {/* Left: Logo & Status */}
            <div className="flex items-center gap-4">
              <BrandLogo />
              
              <div className="hidden lg:flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] rounded-full bg-gradient-to-r from-pink-600 to-purple-600 font-semibold">
                  Premium
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verified
                </span>
              </div>
            </div>

            {/* Right: Auth & Language - Desktop only */}
            <div className="hidden lg:flex items-center gap-3">
              <Link 
                className="px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors"
                href="/support"
              >
                Support
              </Link>

              {user ? (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/5 border border-white/10"
                  >
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-pink-500/50">
                      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-500/20"></div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">{user?.name || "Account"}</div>
                      <div className="text-xs text-white/60">Premium Member</div>
                    </div>
                    <ChevronDown className={`h-4 w-4 ${profileOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    className="px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors"
                    href="/login"
                  >
                    Login
                  </Link>
                  <Link
                    className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-semibold transition-all hover:scale-105"
                    href="/register"
                  >
                    Register
                  </Link>
                </>
              )}

              <div ref={languageRef} className="relative">
                <button
                  onClick={() => setLanguageOpen(!languageOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">EN</span>
                  <ChevronDown className={`h-4 w-4 ${languageOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {/* Hamburger for mobile/tablet */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden relative h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 transition"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  menuOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                }`}
              >
                <Menu className="h-5 w-5" />
              </span>
              <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                }`}
              >
                <X className="h-5 w-5" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 - Navigation & Categories */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="hidden lg:flex items-center justify-between">
            
            {/* Navigation Links */}
            <nav className="flex items-center gap-1">
              {mainLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setActiveLink(item.label)}
                  className={`px-3 py-1.5 rounded-xl text-[13px] flex items-center gap-2 transition-colors ${
                    activeLink === item.label
                      ? "bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/40"
                      : "hover:bg-white/5"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Categories */}
            <div className="flex items-center gap-2">
              {categories.slice(0, 3).map((category) => (
                <button
                  key={category}
                  className="px-3 py-1.5 text-[13px] rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/40"
                >
                  {category}
                </button>
              ))}
              <button className="px-3 py-1.5 text-[13px] rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/40">
                More...
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 - Search & Filters */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium companions, locations, services..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm bg-black/40 border border-white/20 focus:border-pink-500 focus:outline-none placeholder:text-white/50"
              />
            </div>

            {/* Filters & Actions */}
            <div className="flex items-center gap-2">
               <button className="px-5 py-2.5 text-sm rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-semibold transition-all hover:scale-105">
                Search
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/40 transition-colors">
                <Filter className="h-4 w-4" />
                Filters
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/40 transition-colors">
                <MapPin className="h-4 w-4" />
                Regions
              </button>
              
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile menu - Everything goes here
  const MobileMenu = () => (
    <div
      className={`
        lg:hidden fixed inset-0 z-50
        bg-black/95 backdrop-blur-xl
        transform transition-all duration-300 ease-out
        ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"}
      `}
    >
      <div className="mobile-menu-content px-4 pt-20 pb-8 space-y-6 overflow-y-auto h-full">
        
        {/* Close button */}
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>

        {/* User Profile Section */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
           <BrandLogo />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search companions, services..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Main Navigation */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white/60 px-2">Navigation</p>
          {mainLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setMenuOpen(false);
                setActiveLink(item.label);
              }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${
                activeLink === item.label 
                  ? "bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30" 
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Categories Grid */}
        <div>
          <p className="text-sm font-semibold text-white/60 mb-3 px-2">Categories</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-sm font-semibold text-white/60 mb-3 px-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <button 
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10"
            >
              <MapPin className="h-4 w-4" />
              <span>Regions</span>
            </button>
            <button 
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Support</span>
            </button>
            <button 
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10"
            >
              <Shield className="h-4 w-4" />
              <span>Safety</span>
            </button>
          </div>
        </div>

        {/* Premium Features */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-600/10 to-purple-600/10 border border-pink-500/20">
          <div className="flex items-center gap-3 mb-3">
            <Crown className="h-5 w-5 text-pink-400" />
            <p className="font-semibold">Premium Features</p>
          </div>
          <p className="text-sm text-white/60 mb-4">Get exclusive access to verified companions and premium services</p>
          <Link
            href="/premium"
            onClick={() => setMenuOpen(false)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-center font-semibold hover:opacity-90 transition-opacity"
          >
            Upgrade to Premium
          </Link>
        </div>

        {/* Auth & Settings */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          {!user ? (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-center font-semibold hover:opacity-90"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {userMenuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
          
          {/* Language Selector */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-white/60" />
              <span className="text-sm">Language</span>
            </div>
            <select className="bg-transparent border-none text-sm focus:outline-none">
              <option value="en">🇺🇸 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="es">🇪🇸 Español</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header
        className={`fixed top-0 w-full z-40 bg-gradient-to-b from-black via-black/95 to-black/90 backdrop-blur-xl border-b border-white/10 text-white shadow-2xl shadow-purple-900/20 transition-all duration-300 ${
          mode === "compact" && !isMobile ? 'py-0' : 'py-0'
        }`}
      >
        {/* On mobile (1024px and below): Clean navbar with just logo and hamburger */}
        {isMobile ? (
          <div className="w-full px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <BrandLogo compact={true} />
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 transition"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    menuOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                  }`}
                >
                  <Menu className="h-5 w-5" />
                </span>
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                  }`}
                >
                  <X className="h-5 w-5" />
                </span>
              </button>
            </div>
          </div>
        ) : (
          // On desktop: Show either full or compact navbar based on scroll
          mode === "full" ? <FullNavbar /> : <CompactBar />
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && <MobileMenu />}
    </>
  );
}