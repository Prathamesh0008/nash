"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu, X, Globe, User, Search, Filter, MapPin,
  ChevronDown, HelpCircle, CheckCircle,
  Users, MessageCircle, Settings,
  LogOut, Bell, Heart, Shield, Crown,
  Clock, AlertCircle, XCircle
} from "lucide-react";
import { FaHome, FaMale, FaFemale, FaVideo } from 'react-icons/fa';
import BrandLogo from "./BrandLogo";
import { SEARCH_INDEX } from "@/data/searchIndex";
import FilterDrawer from "./FilterDrawer";
import { useAuth } from "@/contexts/AuthContext"; // Import the auth context
import StatusBadge from "./StatusBadge"; // Import your StatusBadge component

const SearchInput = memo(({
  value,
  onChange,
  onKeyDown,
  placeholder,
  className = "",
  iconColor = "text-pink-400",
  iconSize = "h-4 w-4",
  suggestions = [],
  showSuggestions = false,
  onSuggestionClick
}) => (
  <div className="relative" data-search-container>
    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconSize} ${iconColor}`} />
    <input
      key="search-input"
      type="search"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/20 focus:border-pink-500 focus:outline-none placeholder:text-white/50 ${className}`}
    />

    {showSuggestions && suggestions.length > 0 && (
      <ul className="absolute z-50 top-full left-0 right-0 mt-1 w-full max-h-60 overflow-y-auto bg-black/95 border border-white/10 rounded-xl shadow-2xl shadow-purple-900/20 backdrop-blur-sm">
        {suggestions.map((item, index) => (
          <li
            key={item.href || item.label || index}
            onClick={() => onSuggestionClick?.(item)}
            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-purple-600/20 border-b border-white/5 last:border-b-0 transition-all flex items-center gap-3 first:rounded-t-xl last:rounded-b-xl"
          >
            <Search className="h-3.5 w-3.5 text-pink-400 flex-shrink-0 opacity-70" />
            <div className="flex flex-col truncate">
              <span className="font-medium">{item.label || item}</span>
              {item.type === "provider" && (
                <span className="text-xs text-white/50">Profile</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
));

SearchInput.displayName = 'SearchInput';

const WorkerStatusBadge = ({ status }) => {
  if (!status) return null;

  const map = {
    active: {
      label: "Verified",
      color: "text-emerald-400",
      icon: CheckCircle,
    },
    pending_payment: {
      label: "Payment Pending",
      color: "text-yellow-400",
      icon: Clock,
    },
    draft: {
      label: "Profile Incomplete",
      color: "text-orange-400",
      icon: AlertCircle,
    },
    rejected: {
      label: "Rejected",
      color: "text-red-400",
      icon: XCircle,
    },
  };

  const Item = map[status];
  if (!Item) return null;

  const Icon = Item.icon;

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${Item.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {Item.label}
    </span>
  );
};

const UserDropdown = memo(({ user, profileOpen, onLogout }) => (
  <div className={`absolute right-0 mt-2 w-64 bg-black/95 border border-white/10 rounded-xl shadow-2xl shadow-purple-900/30 backdrop-blur-xl overflow-hidden transition-all duration-200 transform origin-top-right ${
    profileOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
  }`}>
    <div className="p-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-pink-500/60 bg-gradient-to-br from-pink-500/30 to-purple-500/30">
          {user?.image ? (
            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-pink-600/50 to-purple-600/50">
              <User className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{user?.name || user?.email?.split("@")[0] || "User"}</p>
          <p className="text-xs text-white/60 truncate">{user?.email || user?.username || ""}</p>
          <div className="flex items-center gap-1 mt-1">
            <Crown className="h-3 w-3 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Premium Member</span>
          </div>
        </div>
      </div>
    </div>

    <div className="py-2">
      {user.role === "worker" ? (
        <>
          <Link
            href="/worker/dashboard"
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm">Dashboard</span>
          </Link>
          
          <Link
            href="/worker/inbox"
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">Inbox</span>
          </Link>
          
          {/* Show status badge in dropdown for workers */}
          <div className="px-4 py-3">
            <StatusBadge status={user.workerStatus} />
          </div>
        </>
      ) : user.role === "admin" ? (
        <Link
          href="/admin"
          className="flex items-center gap-3 px-4 py-3 hover:bg-white/10"
        >
          <Shield className="h-4 w-4" />
          <span className="text-sm">Admin Panel</span>
        </Link>
      ) : (
        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-3 hover:bg-white/10"
        >
          <User className="h-4 w-4" />
          <span className="text-sm">My Profile</span>
        </Link>
      )}
      
      {user.role !== "worker" && (
        <Link href="/user/inbox" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-all">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">Inbox</span>
        </Link>
      )}
      
      <Link href="/messages" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-all">
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm">Messages</span>
        <span className="ml-auto px-2 py-0.5 text-xs bg-pink-600 rounded-full">3</span>
      </Link>
      
      <Link href="/favorites" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-all">
        <Heart className="h-4 w-4" />
        <span className="text-sm">Favorites</span>
      </Link>
      
      <Link href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-all">
        <Settings className="h-4 w-4" />
        <span className="text-sm">Settings</span>
      </Link>
      
      <div className="border-t border-white/10 my-2"></div>
      
      <button
        onClick={onLogout}
        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all"
      >
        <LogOut className="h-4 w-4" />
        <span className="text-sm">Logout</span>
      </button>
    </div>
  </div>
));

UserDropdown.displayName = 'UserDropdown';

const CompactBar = memo(({
  searchQuery,
  onSearchChange,
  handleSearch,
  showSuggestions,
  suggestions,
  mainLinks,
  activeLink,
  setActiveLink,
  setMenuOpen,
  onFilterClick,
  onRegionClick,
  user,
  profileOpen,
  setProfileOpen,
  profileRef,
  handleLogout
}) => (
  <div className="w-full px-4 py-3">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4">
        <BrandLogo compact={true} />
        <div className="hidden lg:flex items-center gap-1">
          {mainLinks.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setActiveLink(item.label)}
              className={`p-2 rounded-lg hover:bg-white/10 transition-all duration-200 ${
                activeLink === item.label ? 'bg-gradient-to-r from-pink-600/40 to-purple-600/40 ring-2 ring-pink-500/50 shadow-lg' : ''
              }`}
              title={item.label}
            >
              <item.icon className={`h-4 w-4 transition-all ${activeLink === item.label ? 'text-pink-400 drop-shadow-lg' : ''}`} />
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:block relative">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
            placeholder="Search..."
            className="py-1.5 w-48 bg-black/40 rounded-lg"
            iconColor="text-white/50"
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            onSuggestionClick={handleSearch}
          />
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors"
              >
                <div className="relative h-6 w-6 rounded-full overflow-hidden border border-pink-500/50">
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-500/20"></div>
                  {user?.image ? (
                    <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-3 w-3 absolute inset-0 m-auto" />
                  )}
                </div>
                <span className="font-medium">{user.name || user.email?.split("@")[0] || 'User'}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              
              {profileOpen && (
                <UserDropdown user={user} profileOpen={profileOpen} onLogout={handleLogout} />
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors">
                Login
              </Link>
              <Link href="/register" className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 font-semibold hover:from-pink-500 hover:to-purple-500">
                Register
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          className="lg:hidden relative h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 transition"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 absolute inset-0 m-auto" />
        </button>
      </div>
    </div>
  </div>
));

CompactBar.displayName = 'CompactBar';

const FullNavbar = memo(({
  searchQuery,
  onSearchChange,
  workerStatus,
  handleSearch,
  showSuggestions,
  suggestions,
  mainLinks,
  activeLink,
  setActiveLink,
  categories,
  user,
  profileOpen,
  setProfileOpen,
  languageOpen,
  setLanguageOpen,
  profileRef,
  languageRef,
  setMenuOpen,
  onFilterClick,
  onRegionClick,
  handleLogout
}) => (
  <div className="w-full">
    <div className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo />
            <div className="hidden lg:flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] rounded-full bg-gradient-to-r from-pink-600 to-purple-600 font-semibold">
                Premium
              </span>
              {user?.role === "worker" && (
                <WorkerStatusBadge status={workerStatus} />
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/support" className="px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors">
              Support
            </Link>

            <Link href="/workers" className="px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors">
              Workers
            </Link>

            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/5 border border-white/10 transition-all duration-200"
                >
                  <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-pink-500/50">
                    {user?.image ? (
                      <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{user?.name || user?.email?.split("@")[0] || "Account"}</div>
                    <div className="text-xs text-white/60">Premium Member</div>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                
                {profileOpen && (
                  <UserDropdown user={user} profileOpen={profileOpen} onLogout={handleLogout} />
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-semibold">
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
                <ChevronDown className={`h-4 w-4 transition-transform ${languageOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden relative h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 transition"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 absolute inset-0 m-auto" />
          </button>
        </div>
      </div>
    </div>

    <div className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="hidden lg:flex items-center justify-between">
          <nav className="flex items-center gap-1">
            {mainLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveLink(item.label)}
                className={`group px-3 py-1.5 rounded-xl text-[13px] flex items-center gap-2 transition-all duration-200 border border-transparent ${
                  activeLink === item.label
                    ? "bg-gradient-to-r from-pink-600/50 to-purple-600/50 border-2 border-pink-500/60 shadow-xl shadow-pink-500/30 text-white font-bold scale-105"
                    : "hover:bg-white/10 hover:border-white/30 text-white/80 hover:text-white"
                }`}
              >
                <item.icon className={`h-4 w-4 transition-all ${activeLink === item.label ? 'text-pink-300 drop-shadow-2xl shadow-pink-500/50' : 'group-hover:text-pink-400'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category}
                href={`/${category.toLowerCase()}`}
                className="px-3 py-1.5 text-[13px] rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-white/10 transition-all"
              >
                {category}
              </Link>
            ))}
            <button className="px-3 py-1.5 text-[13px] rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-white/10">
              More...
            </button>
          </div>
        </div>
      </div>
    </div>

    <div className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="hidden lg:flex items-center gap-3">
          <div className="relative flex-1">
            <SearchInput
              value={searchQuery}
              onChange={onSearchChange}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
              placeholder="Search premium companions, locations, services..."
              suggestions={suggestions}
              showSuggestions={showSuggestions}
              onSuggestionClick={handleSearch}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSearch(searchQuery)}
              className="px-5 py-2.5 text-sm rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Search
            </button>
            <button 
              onClick={onFilterClick}
              className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-white/10 transition-all shadow-md hover:shadow-lg"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button 
              onClick={onRegionClick}
              className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-white/10 transition-all shadow-md hover:shadow-lg"
            >
              <MapPin className="h-4 w-4" />
              Regions
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
));

FullNavbar.displayName = 'FullNavbar';

const MobileMenu = memo(({
  menuOpen,
  setMenuOpen,
  searchQuery,
  onSearchChange,
  handleSearch,
  showSuggestions,
  suggestions,
  mainLinks,
  activeLink,
  setActiveLink,
  categories,
  user,
  userMenuItems,
  onFilterClick,
  onRegionClick,
  handleLogout
}) => (
  <div className={`lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-xl transform transition-all duration-300 ease-out ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}>
    <div className="mobile-menu-content px-4 pt-20 pb-8 space-y-6 overflow-y-auto h-full">
      <button
        onClick={() => setMenuOpen(false)}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
        aria-label="Close menu"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
        <BrandLogo />
      </div>

      {user && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-pink-500/60">
              {user?.image ? (
                <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-pink-600/50 to-purple-600/50">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold">{user.name || user.email?.split("@")[0] || "User"}</p>
              <p className="text-sm text-white/60">Premium Member</p>
              {user.role === "worker" && (
                <div className="mt-1">
                  <StatusBadge status={user.workerStatus} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
        placeholder="Search companions, services..."
        className="py-3.5 bg-white/5 border-white/10 rounded-xl"
        iconSize="h-5 w-5"
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSuggestionClick={handleSearch}
      />

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
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 border border-transparent ${
              activeLink === item.label
                ? "bg-gradient-to-r from-pink-600/40 to-purple-600/40 border-2 border-pink-500/50 shadow-xl shadow-pink-500/30 text-white font-bold scale-[1.02]"
                : "bg-white/5 hover:bg-white/15 hover:border-white/30 text-white/80 hover:text-white"
            }`}
          >
            <item.icon className={`h-5 w-5 transition-all ${activeLink === item.label ? 'text-pink-300 drop-shadow-2xl shadow-pink-500/50' : 'hover:text-pink-400'}`} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
        
        {/* Add Workers link to mobile menu */}
        <Link
          href="/workers"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/15 hover:border-white/30 text-white/80 hover:text-white transition-all duration-200 border border-transparent"
        >
          <Users className="h-5 w-5" />
          <span className="text-sm font-medium">Workers</span>
        </Link>
      </div>

      <div>
        <p className="text-sm font-semibold text-white/60 mb-3 px-2">Categories</p>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/${category.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 text-sm rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-pink-500/50 transition-all text-center"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-white/60 mb-3 px-2">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              setMenuOpen(false);
              onFilterClick();
            }}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-pink-500/50 transition-all shadow-md hover:shadow-lg"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button 
            onClick={() => {
              setMenuOpen(false);
              onRegionClick();
            }}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-pink-500/50 transition-all shadow-md hover:shadow-lg"
          >
            <MapPin className="h-4 w-4" />
            <span>Regions</span>
          </button>
          <Link href="/support" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-pink-500/50 transition-all shadow-md hover:shadow-lg">
            <HelpCircle className="h-4 w-4" />
            <span>Support</span>
          </Link>
          <Link href="/safety" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-pink-500/50 transition-all shadow-md hover:shadow-lg">
            <Shield className="h-4 w-4" />
            <span>Safety</span>
          </Link>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-600/10 to-purple-600/10 border border-pink-500/20">
        <div className="flex items-center gap-3 mb-3">
          <Crown className="h-5 w-5 text-pink-400" />
          <p className="font-semibold">Premium Features</p>
        </div>
        <p className="text-sm text-white/60 mb-4">Get exclusive access to verified companions and premium services</p>
        <Link
          href="/premium"
          onClick={() => setMenuOpen(false)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-center font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl block"
        >
          Upgrade to Premium
        </Link>
      </div>

      <div className="pt-6 border-t border-white/10 space-y-3">
        {!user ? (
          <div className="grid grid-cols-2 gap-3">
            <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all">
              <User className="h-4 w-4" />
              <span>Login</span>
            </Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} className="px-4 py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-center font-semibold hover:opacity-90 shadow-lg hover:shadow-xl transition-all">
              Register
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Dashboard links based on role */}
            {user.role === "worker" && (
              <>
                <Link
                  href="/worker/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all"
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-sm">Worker Dashboard</span>
                </Link>
                <Link
                  href="/worker/inbox"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">Inbox</span>
                </Link>
              </>
            )}
            
            {user.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all"
              >
                <Shield className="h-5 w-5" />
                <span className="text-sm">Admin Panel</span>
              </Link>
            )}
            
            {user.role === "user" && (
              <Link
                href="/user/inbox"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">Inbox</span>
              </Link>
            )}
            
            {userMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  setMenuOpen(false);
                  if (item.label === "Logout") {
                    handleLogout();
                  }
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
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
));

MobileMenu.displayName = 'MobileMenu';

export default function Navbar() {
  // Use the auth context instead of managing user state manually
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  // ALL HOOKS DECLARED UNCONDITIONALLY
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState("full");
  const [activeLink, setActiveLink] = useState("Home");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: [],
    country: "",
    price: 1000
  });
  const [workerStatus, setWorkerStatus] = useState(null);

  const pathname = usePathname();
  const profileRef = useRef(null);
  const languageRef = useRef(null);

  // Handle logout using the auth context
  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/login");
    setProfileOpen(false);
    setMenuOpen(false);
  }, [logout, router]);

  // Update worker status when user changes
  useEffect(() => {
    if (user?.role === "worker" && user.workerStatus) {
      setWorkerStatus(user.workerStatus);
    }
  }, [user]);

  const mainLinks = [
    { label: "Home", href: "/", icon: FaHome },
    { label: "Women", href: "/women", icon: FaFemale },
    { label: "Men", href: "/men", icon: FaMale },
    { label: "Couple", href: "/couple", icon: Users },
    { label: "Videos", href: "/videos", icon: FaVideo },
  ];

  const categories = ["BDSM", "Escort", "Massage", "Role Play", "Fetish"];
  const userMenuItems = [
    { label: "Profile", icon: User, href: "/profile" },
    { label: "Messages", icon: MessageCircle, href: "/messages" },
    { label: "Notifications", icon: Bell, href: "/notifications" },
    { label: "Favorites", icon: Heart, href: "/favorites" },
    { label: "Settings", icon: Settings, href: "/settings" },
    { label: "Logout", icon: LogOut, href: "#" },
  ];

  const onSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const q = value.toLowerCase();
    const results = SEARCH_INDEX.filter(item =>
      item.label?.toLowerCase().includes(q) ||
      item.keywords?.some(k => k.toLowerCase().includes(q))
    ).slice(0, 8);

    setSuggestions(results);
    setShowSuggestions(true);
  }, []);

  const handleSearch = useCallback((itemOrQuery) => {
    if (itemOrQuery && typeof itemOrQuery === 'object' && itemOrQuery.href) {
      router.push(itemOrQuery.href);
    } else {
      const query = typeof itemOrQuery === 'string' ? itemOrQuery : searchQuery;
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }

    setShowSuggestions(false);
    setSuggestions([]);
    setSearchQuery("");
    setMenuOpen(false);
  }, [searchQuery, router]);

  const handleFilterClick = () => {
    setFilterOpen(true);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filters.category.length)
      params.set("category", filters.category.join(","));

    if (filters.country)
      params.set("country", filters.country);

    if (filters.price)
      params.set("price", filters.price);

    router.push(`/search?${params.toString()}`);
    setFilterOpen(false);
  };

  const handleRegionClick = useCallback(() => {
    console.log("Regions clicked - Navigate to /regions");
    router.push("/regions");
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.mobile-menu-content')) {
        setMenuOpen(false);
      }
      if (!e.target.closest('[data-search-container]')) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(e.target)) {
        setLanguageOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  useEffect(() => {
    if (pathname === "/") {
      setActiveLink("Home");
    } else if (pathname === "/women" || pathname.startsWith("/women/")) {
      setActiveLink("Women");
    } else if (pathname === "/men" || pathname.startsWith("/men/")) {
      setActiveLink("Men");
    } else if (pathname === "/couple" || pathname.startsWith("/couple/")) {
      setActiveLink("Couple");
    } else if (pathname === "/videos" || pathname.startsWith("/videos/")) {
      setActiveLink("Videos");
    }
  }, [pathname]);

  // Show loading state while auth is loading
  if (loading) {
    return (
      <header className="fixed top-0 w-full z-40 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <BrandLogo />
          <div className="h-8 w-24 rounded-lg bg-white/10 animate-pulse" />
        </div>
      </header>
    );
  }

  // FINAL RETURN - only one return statement
  return (
    <>
      <header className={`fixed top-0 w-full z-40 bg-gradient-to-b from-black via-black/95 to-black/90 backdrop-blur-xl border-b border-white/10 text-white shadow-2xl shadow-purple-900/20 transition-all duration-300 ${mode === "compact" && !isMobile ? 'py-0' : ''}`}>
        {isMobile ? (
          <div className="w-full px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <BrandLogo compact={true} />
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${menuOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}>
                  <Menu className="h-5 w-5" />
                </span>
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}>
                  <X className="h-5 w-5" />
                </span>
              </button>
            </div>
          </div>
        ) : mode === "full" ? (
          <FullNavbar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            workerStatus={workerStatus}
            handleSearch={handleSearch}
            showSuggestions={showSuggestions}
            suggestions={suggestions}
            mainLinks={mainLinks}
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            categories={categories}
            user={user} // Pass user from auth context
            profileOpen={profileOpen}
            setProfileOpen={setProfileOpen}
            languageOpen={languageOpen}
            setLanguageOpen={setLanguageOpen}
            profileRef={profileRef}
            languageRef={languageRef}
            setMenuOpen={setMenuOpen}
            onFilterClick={handleFilterClick}
            onRegionClick={handleRegionClick}
            handleLogout={handleLogout}
          />
        ) : (
          <CompactBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            handleSearch={handleSearch}
            showSuggestions={showSuggestions}
            suggestions={suggestions}
            mainLinks={mainLinks}
            activeLink={activeLink}
            setActiveLink={setActiveLink}
            setMenuOpen={setMenuOpen}
            onFilterClick={handleFilterClick}
            onRegionClick={handleRegionClick}
            user={user} // Pass user from auth context
            profileOpen={profileOpen}
            setProfileOpen={setProfileOpen}
            profileRef={profileRef}
            handleLogout={handleLogout}
          />
        )}
      </header>

      {menuOpen && (
        <MobileMenu
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          handleSearch={handleSearch}
          showSuggestions={showSuggestions}
          suggestions={suggestions}
          mainLinks={mainLinks}
          activeLink={activeLink}
          setActiveLink={setActiveLink}
          categories={categories}
          user={user} // Pass user from auth context
          userMenuItems={userMenuItems}
          onFilterClick={handleFilterClick}
          onRegionClick={handleRegionClick}
          handleLogout={handleLogout}
        />
      )}
      
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={applyFilters}
      />
    </>
  );
}