"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { 
  Share2, 
  Copy, 
  Wallet, 
  Users, 
  Award, 
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  MessageCircle,
  Instagram,
  Twitter,
  Gift,
  TrendingUp
} from "lucide-react";

// Utility functions
function toReadableDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  });
}

function statusLabel(status = "") {
  const map = {
    signed_up: "Signed Up",
    discount_applied: "Discount Applied",
    reward_credited: "Reward Credited",
    cancelled: "Cancelled",
  };
  return map[status] || status || "-";
}

function getStatusConfig(status = "") {
  const configs = {
    reward_credited: {
      bg: "bg-gradient-to-r from-emerald-500/20 to-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      icon: CheckCircle,
      label: "Reward Credited"
    },
    discount_applied: {
      bg: "bg-gradient-to-r from-sky-500/20 to-sky-500/10",
      text: "text-sky-400",
      border: "border-sky-500/30",
      icon: Gift,
      label: "Discount Applied"
    },
    signed_up: {
      bg: "bg-gradient-to-r from-purple-500/20 to-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/30",
      icon: Users,
      label: "Signed Up"
    },
    cancelled: {
      bg: "bg-gradient-to-r from-rose-500/20 to-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/30",
      icon: XCircle,
      label: "Cancelled"
    }
  };
  return configs[status] || {
    bg: "bg-gradient-to-r from-slate-500/20 to-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/30",
    icon: Clock,
    label: status || "Unknown"
  };
}

// Reusable Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, label, value, subValue, trend }) => (
  <Card className="relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
      </div>
      <div className="p-3 bg-slate-800/80 rounded-xl group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
    </div>
    {trend && (
      <div className="mt-3 flex items-center gap-1 text-xs">
        <TrendingUp className="w-3 h-3 text-emerald-400" />
        <span className="text-emerald-400">{trend}</span>
        <span className="text-slate-500">vs last month</span>
      </div>
    )}
  </Card>
);

const StatusBadge = ({ status }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

const ReferralCard = ({ referral, type = "outgoing" }) => {
  const statusConfig = getStatusConfig(referral.status);
  const StatusIcon = statusConfig.icon;
  
  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5 hover:border-slate-600/50 transition-all duration-300">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h4 className="font-medium text-white">
              {type === "outgoing" 
                ? (referral.referee?.name || referral.refereeId || "User")
                : (referral.referrer?.name || referral.referrerId || "Referrer")
              }
            </h4>
            <p className="text-sm text-slate-400">
              {type === "outgoing" 
                ? (referral.referee?.email || "-")
                : (referral.referrer?.email || "-")
              }
            </p>
          </div>
        </div>
        <StatusBadge status={referral.status} />
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Discount</p>
          <p className="text-sm font-semibold text-green-400">
            ₹{referral.referralDiscount || 0}
          </p>
        </div>
        {type === "outgoing" && (
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Your Reward</p>
            <p className="text-sm font-semibold text-emerald-400">
              ₹{referral.rewardAmount || 0}
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <Clock className="w-3.5 h-3.5" />
        <span>Created: {toReadableDate(referral.createdAt)}</span>
      </div>
    </div>
  );
};

const MilestoneProgress = ({ milestone }) => (
  <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium text-white">{milestone.label}</h4>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        milestone.done 
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          : "bg-slate-700/50 text-slate-300 border border-slate-600/30"
      }`}>
        {milestone.done ? "Completed" : `${milestone.progress}%`}
      </span>
    </div>
    
    <p className="text-sm text-slate-400 mb-3">
      {milestone.targetReferrals} referrals • ₹{milestone.targetRewards} rewards
    </p>
    
    <div className="relative">
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${milestone.progress}%` }}
        />
      </div>
      <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-slate-500">
        <span>0</span>
        <span>{milestone.targetReferrals}</span>
      </div>
    </div>
  </div>
);

// Main Component
export default function ReferralsPage() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      setShareSupported(typeof navigator !== "undefined" && typeof navigator.share === "function");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/referrals/me", { credentials: "include" });
        const json = await res.json();
        
        if (!res.ok || !json.ok) {
          setMessage({ type: "error", text: json.error || "Failed to load referrals" });
          return;
        }
        
        setData(json.referral || null);
      } catch (error) {
        setMessage({ type: "error", text: "Network error. Please try again." });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const referralCode = data?.code || "";
  
  const shareText = useMemo(() => {
    if (!referralCode) return "";
    const inviteUrl = origin ? `${origin}/auth/signup?ref=${encodeURIComponent(referralCode)}` : "";
    return `✨ Join me on Nash Workforce! Use my referral code ${referralCode} to get started.${inviteUrl ? `\n\n👉 Sign up here: ${inviteUrl}` : ""}`;
  }, [referralCode, origin]);

  const stats = useMemo(() => {
    const referrals = data?.referrals || [];
    return {
      total: referrals.length,
      credited: referrals.filter(r => r.status === "reward_credited").length,
      pending: referrals.filter(r => ["signed_up", "discount_applied"].includes(r.status)).length,
      cancelled: referrals.filter(r => r.status === "cancelled").length,
      totalRewards: data?.stats?.totalRewards || 0,
      walletBalance: data?.walletBalance || 0
    };
  }, [data]);

  const copyToClipboard = async (text, successMessage = "Copied!") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setMessage({ type: "success", text: successMessage });
      setTimeout(() => {
        setCopied(false);
        setMessage({ type: "", text: "" });
      }, 2000);
    } catch {
      setMessage({ type: "error", text: "Could not copy. Please try manually." });
    }
  };

  const handleShare = async () => {
    if (!shareSupported) return;
    try {
      await navigator.share({
        title: "Join Nash Workforce",
        text: shareText,
      });
    } catch (error) {
      // User cancelled share
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-rose-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">No Referral Data Found</h2>
              <p className="text-slate-400 max-w-md">
                {message.text || "Please login to access your referral information."}
              </p>
              <Link 
                href="/auth/login" 
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
              >
                Login to Continue
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Referral Program
            </h1>
            <p className="text-slate-400 mt-2">
              Share your code, earn rewards, and grow your network
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 bg-slate-800/30 p-1 rounded-xl border border-slate-700/50">
            {["overview", "referrals", "milestones", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div className={`p-4 rounded-xl border ${
            message.type === "error" 
              ? "bg-rose-500/20 border-rose-500/30 text-rose-400"
              : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
          }`}>
            {message.text}
          </div>
        )}

        {/* Overview Section */}
        {activeTab === "overview" && (
          <>
            {/* Referral Code & Wallet */}
            <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Your Referral Code</p>
                    <div className="flex items-center gap-3">
                      <code className="text-2xl font-mono font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                        {referralCode}
                      </code>
                      <button
                        onClick={() => copyToClipboard(referralCode, "Code copied!")}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group"
                      >
                        <Copy className={`w-4 h-4 ${copied ? "text-emerald-400" : "text-slate-400 group-hover:text-white"}`} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl">
                    <Award className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                  Earn rewards when your friends complete their first paid booking
                </p>

                {/* Share Buttons */}
                <div className="flex flex-wrap gap-2">
                  {shareSupported && (
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  )}
                  
                  <button
                    onClick={() => copyToClipboard(shareText, "Invite copied!")}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Invite
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Wallet Balance</p>
                    <p className="text-4xl font-bold text-white">₹{stats.walletBalance}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </div>
                <Link 
                  href="/wallet"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View Wallet Details
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={Users}
                label="Total Referrals"
                value={stats.total}
                subValue={`${stats.credited} rewarded`}
              />
              <StatCard 
                icon={Award}
                label="Total Rewards"
                value={`₹${stats.totalRewards}`}
                trend="+12%"
              />
              <StatCard 
                icon={CheckCircle}
                label="Completed"
                value={stats.credited}
                subValue={`${((stats.credited/stats.total) * 100 || 0).toFixed(1)}% success rate`}
              />
              <StatCard 
                icon={Clock}
                label="Pending"
                value={stats.pending}
                subValue={`${stats.cancelled} cancelled`}
              />
            </div>

            {/* Next Milestone */}
            {data.tracker?.nextMilestone && (
              <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-amber-400 mb-2">Next Milestone</p>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {data.tracker.nextMilestone.label}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {data.tracker.nextMilestone.targetReferrals - (data.tracker?.currentReferrals || 0)} more referrals needed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {data.tracker?.currentReferrals || 0}/{data.tracker.nextMilestone.targetReferrals}
                    </p>
                    <p className="text-sm text-slate-400">referrals</p>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${((data.tracker?.currentReferrals || 0) / data.tracker.nextMilestone.targetReferrals) * 100}%` }}
                  />
                </div>
              </Card>
            )}
          </>
        )}

        {/* Referrals List */}
        {activeTab === "referrals" && (
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6">People You Referred</h2>
            <div className="space-y-4">
              {(data.referrals || []).length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No referrals yet. Start sharing your code!</p>
                </div>
              ) : (
                (data.referrals || []).map((referral) => (
                  <ReferralCard key={referral._id} referral={referral} type="outgoing" />
                ))
              )}
            </div>
          </Card>
        )}

        {/* Milestones */}
        {activeTab === "milestones" && (
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6">Your Progress Milestones</h2>
            <div className="space-y-4">
              {(data.tracker?.milestones || []).length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No milestones available</p>
                </div>
              ) : (
                (data.tracker?.milestones || []).map((milestone) => (
                  <MilestoneProgress key={milestone.key} milestone={milestone} />
                ))
              )}
            </div>
          </Card>
        )}

        {/* Referral History */}
        {activeTab === "history" && (
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6">Who Referred You</h2>
            <div className="space-y-4">
              {(data.referredMe || []).length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No referral used on your account</p>
                </div>
              ) : (
                (data.referredMe || []).map((referral) => (
                  <ReferralCard key={referral._id} referral={referral} type="incoming" />
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}