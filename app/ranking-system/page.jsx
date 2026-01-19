"use client";

import PageLayout from "@/components/PageLayout";
import { useState, useEffect } from "react";
import { 
  Star, 
  Trophy, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Filter,
  Search,
  MapPin,
  Users,
  ChevronUp,
  ChevronDown,
  Minus,
  Shield,
  Zap,
  DollarSign,
  MessageSquare,
  Bookmark,
  Sparkles,
  Target
} from "lucide-react";

// Professional worker data
const professionalWorkers = [
  {
    id: 1,
    name: "Elena Rodriguez",
    title: "Premium Cleaning Specialist",
    rating: 4.98,
    totalJobs: 342,
    responseRate: 98,
    avgResponseTime: "8 min",
    rank: 1,
    rankChange: "+2",
    badges: ["Top Rated", "Fast Responder", "Verified"],
    location: "Manhattan, NY",
    experience: "8+ Years",
    hourlyRate: "$65/hr",
    availability: "Available Now",
    description: "Specializes in luxury home cleaning with eco-friendly products.",
    featured: true,
    accentColor: "border-purple-500/30"
  },
  {
    id: 2,
    name: "James Wilson",
    title: "Master Plumber",
    rating: 4.95,
    totalJobs: 287,
    responseRate: 97,
    avgResponseTime: "12 min",
    rank: 2,
    rankChange: "+1",
    badges: ["Certified", "Emergency Service"],
    location: "Brooklyn, NY",
    experience: "12+ Years",
    hourlyRate: "$85/hr",
    availability: "Available Today",
    description: "Licensed master plumber with emergency response certification.",
    featured: true,
    accentColor: "border-blue-500/30"
  },
  {
    id: 3,
    name: "Sarah Chen",
    title: "Electrical Engineer",
    rating: 4.93,
    totalJobs: 231,
    responseRate: 99,
    avgResponseTime: "15 min",
    rank: 3,
    rankChange: "-1",
    badges: ["Licensed", "Smart Home"],
    location: "Queens, NY",
    experience: "9+ Years",
    hourlyRate: "$95/hr",
    availability: "Tomorrow",
    description: "Electrical engineer specializing in modern smart home installations.",
    featured: false,
    accentColor: "border-green-500/30"
  },
  {
    id: 4,
    name: "David Martinez",
    title: "Custom Carpenter",
    rating: 4.90,
    totalJobs: 198,
    responseRate: 96,
    avgResponseTime: "20 min",
    rank: 4,
    rankChange: "+3",
    badges: ["Custom Work"],
    location: "Bronx, NY",
    experience: "7+ Years",
    hourlyRate: "$75/hr",
    availability: "This Week",
    description: "Artisan carpenter creating bespoke furniture and custom woodwork.",
    featured: false,
    accentColor: "border-orange-500/30"
  },
  {
    id: 5,
    name: "Lisa Thompson",
    title: "Landscape Architect",
    rating: 4.88,
    totalJobs: 187,
    responseRate: 98,
    avgResponseTime: "25 min",
    rank: 5,
    rankChange: "+1",
    badges: ["Design Expert", "Eco-Friendly"],
    location: "Staten Island, NY",
    experience: "10+ Years",
    hourlyRate: "$90/hr",
    availability: "Next Week",
    description: "Creating sustainable and beautiful outdoor living spaces.",
    featured: false,
    accentColor: "border-pink-500/30"
  },
  {
    id: 6,
    name: "Michael Brown",
    title: "HVAC Specialist",
    rating: 4.85,
    totalJobs: 173,
    responseRate: 97,
    avgResponseTime: "18 min",
    rank: 6,
    rankChange: "-2",
    badges: ["Certified", "Energy Efficient"],
    location: "Westchester, NY",
    experience: "11+ Years",
    hourlyRate: "$80/hr",
    availability: "Available Today",
    description: "HVAC specialist focused on energy-efficient solutions.",
    featured: false,
    accentColor: "border-cyan-500/30"
  },
  {
    id: 7,
    name: "Alex Johnson",
    title: "Cleaner",
    rating: 4.82,
    totalJobs: 156,
    responseRate: 95,
    rank: 7,
    rankChange: "+1",
    badges: ["Fast Service"],
    location: "Long Island, NY",
    experience: "6+ Years",
    hourlyRate: "$55/hr",
    availability: "Available Now",
    description: "Quick and efficient cleaning services with attention to detail.",
    featured: false,
    accentColor: "border-indigo-500/30"
  },
  {
    id: 8,
    name: "Maria Garcia",
    title: "Electrician",
    rating: 4.80,
    totalJobs: 142,
    responseRate: 94,
    rank: 8,
    rankChange: "+2",
    badges: ["Reliable"],
    location: "New Jersey",
    experience: "8+ Years",
    hourlyRate: "$70/hr",
    availability: "Tomorrow",
    description: "Reliable electrical services for residential and commercial properties.",
    featured: false,
    accentColor: "border-emerald-500/30"
  },
  {
    id: 9,
    name: "Robert Lee",
    title: "Plumber",
    rating: 4.78,
    totalJobs: 128,
    responseRate: 96,
    rank: 9,
    rankChange: "-1",
    badges: ["Emergency"],
    location: "Connecticut",
    experience: "9+ Years",
    hourlyRate: "$65/hr",
    availability: "Available Today",
    description: "Emergency plumbing services with quick response times.",
    featured: false,
    accentColor: "border-red-500/30"
  }
];

// Categories
const categories = [
  { id: "all", label: "All Professionals" },
  { id: "cleaning", label: "Cleaning" },
  { id: "plumbing", label: "Plumbing" },
  { id: "electrical", label: "Electrical" },
  { id: "carpentry", label: "Carpentry" },
  { id: "gardening", label: "Gardening" },
  { id: "hvac", label: "HVAC" }
];

export default function RankingSystemPage() {
  const [workers, setWorkers] = useState(professionalWorkers);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rank");

  // Filter and sort workers
  useEffect(() => {
    let filtered = [...professionalWorkers];
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(worker => 
        worker.title.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    if (searchQuery) {
      filtered = filtered.filter(worker => 
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort workers
    filtered.sort((a, b) => {
      switch(sortBy) {
        case "rating": return b.rating - a.rating;
        case "jobs": return b.totalJobs - a.totalJobs;
        case "rate": return parseFloat(b.hourlyRate.replace("$", "")) - parseFloat(a.hourlyRate.replace("$", ""));
        default: return a.rank - b.rank;
      }
    });
    
    setWorkers(filtered);
  }, [selectedCategory, searchQuery, sortBy]);

  const getRankChangeIcon = (change) => {
    if (change.startsWith("+")) return <ChevronUp className="h-4 w-4 text-green-500" />;
    if (change.startsWith("-")) return <ChevronDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <PageLayout title="Professional Rankings">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/20 via-gray-900 to-purple-900/20">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Valentina's Elite Professionals
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                Discover top-rated professionals ranked by performance, reliability, and client satisfaction
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">4.9+</div>
                  <div className="text-gray-400">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">99%</div>
                  <div className="text-gray-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">15m</div>
                  <div className="text-gray-400">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">1.5k+</div>
                  <div className="text-gray-400">Jobs Done</div>
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search elite professionals by name, service, or location..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-gray-400">
              Showing <span className="text-white font-bold">{workers.length}</span> professionals
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Sort by:</span>
              <select
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rank">Rank Position</option>
                <option value="rating">Highest Rating</option>
                <option value="jobs">Most Jobs</option>
                <option value="rate">Hourly Rate</option>
              </select>
            </div>
          </div>

          {/* 3 Boxes Per Line with Rank Ribbons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className={`group relative rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] bg-gray-800/30 backdrop-blur-lg border ${worker.accentColor} hover:shadow-2xl hover:shadow-blue-500/10`}
              >
                {/* Rank Ribbon - Exactly like before */}
                <div className={`absolute -right-12 top-6 w-48 h-10 transform rotate-45 flex items-center justify-center ${
                  worker.rank === 1 ? 'bg-gradient-to-r from-yellow-500 to-amber-600' :
                  worker.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                  worker.rank === 3 ? 'bg-gradient-to-r from-amber-700 to-orange-600' :
                  'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}>
                  <div className="flex items-center space-x-1 text-white font-bold text-sm">
                    <Trophy className="h-4 w-4" />
                    <span>#{worker.rank} RANKED</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      {/* Performance Score */}
                      <div className="absolute -top-3 -left-3 z-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">98.7</span>
                        </div>
                      </div>
                      
                      {/* Avatar */}
                      <div className={`h-16 w-16 rounded-xl ${
                        worker.accentColor === "border-purple-500/30" ? "border-purple-500" :
                        worker.accentColor === "border-blue-500/30" ? "border-blue-500" :
                        worker.accentColor === "border-green-500/30" ? "border-green-500" :
                        worker.accentColor === "border-orange-500/30" ? "border-orange-500" :
                        worker.accentColor === "border-pink-500/30" ? "border-pink-500" :
                        worker.accentColor === "border-cyan-500/30" ? "border-cyan-500" :
                        worker.accentColor === "border-indigo-500/30" ? "border-indigo-500" :
                        worker.accentColor === "border-emerald-500/30" ? "border-emerald-500" :
                        "border-red-500"
                      } border-2 bg-gray-900 flex items-center justify-center`}>
                        <span className="text-xl font-bold text-white">
                          {worker.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white truncate">{worker.name}</h3>
                          <p className="text-gray-400 text-sm truncate">{worker.title}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getRankChangeIcon(worker.rankChange)}
                          <span className={`text-xs ${
                            worker.rankChange.startsWith("+") ? "text-green-500" :
                            worker.rankChange.startsWith("-") ? "text-red-500" :
                            "text-gray-400"
                          }`}>
                            {worker.rankChange}
                          </span>
                        </div>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(worker.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-700"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 font-bold text-white text-sm">{worker.rating}</span>
                        <span className="mx-2 text-gray-600">•</span>
                        <span className="text-xs text-gray-400">{worker.totalJobs} jobs</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {worker.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-900/50 text-gray-300"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4">{worker.description}</p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Location</span>
                      </div>
                      <div className="font-bold text-white text-sm">{worker.location}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Rate</span>
                      </div>
                      <div className="font-bold text-white text-sm">{worker.hourlyRate}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Response</span>
                      </div>
                      <div className="font-bold text-white text-sm">{worker.avgResponseTime}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Success</span>
                      </div>
                      <div className="font-bold text-white text-sm">{worker.responseRate}%</div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Available:</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        worker.availability.includes("Now") ? "bg-green-900/30 text-green-400" :
                        worker.availability.includes("Today") ? "bg-blue-900/30 text-blue-400" :
                        "bg-gray-900/50 text-gray-400"
                      }`}>
                        {worker.availability}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-gradient-to-r from-blue-700 to-purple-800 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </button>
                    <button className="flex-1 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-medium py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg">
                      Book Now
                    </button>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"></div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {workers.length === 0 && (
            <div className="text-center py-16 bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-700">
              <div className="mx-auto w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No professionals found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
              <button 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all duration-300 font-medium"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                  setSortBy("rank");
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* How We Rank Professionals Section */}
          <div className="mt-12 bg-gray-800/30 backdrop-blur-lg rounded-xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              How We Rank Professionals
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Criteria */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-900/30 to-blue-700/30 border border-blue-700/30 flex items-center justify-center">
                      <Star className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Client Ratings</h3>
                    <p className="text-gray-400">
                      Based on average star ratings and detailed feedback from completed jobs.
                      We analyze review patterns and client satisfaction scores.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-900/30 to-green-700/30 border border-green-700/30 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Response Time</h3>
                    <p className="text-gray-400">
                      Average time to respond and confirm bookings. Faster response times
                      indicate better service availability and professionalism.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-900/30 to-purple-700/30 border border-purple-700/30 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Job Completion</h3>
                    <p className="text-gray-400">
                      Success rate and quality of completed work. We track on-time completion,
                      work quality assessments, and post-job satisfaction surveys.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-amber-900/30 to-amber-700/30 border border-amber-700/30 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Consistency</h3>
                    <p className="text-gray-400">
                      Reliable performance over time and seasons. Consistent high performance
                      across multiple jobs indicates reliability and professionalism.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Info Box */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-4">Our Ranking Methodology</h3>
                <p className="text-gray-400 mb-6">
                  Our proprietary ranking algorithm evaluates professionals across multiple 
                  dimensions to ensure you're connected with the best talent for your needs.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <div className="font-bold text-white">Real-time Updates</div>
                      <div className="text-sm text-gray-400">Rankings update daily based on recent performance</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <div className="font-bold text-white">Minimum Threshold</div>
                      <div className="text-sm text-gray-400">At least 10 completed jobs required for ranking</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <div className="font-bold text-white">Quality Assurance</div>
                      <div className="text-sm text-gray-400">All professionals undergo background checks</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    Rankings are recalculated every Monday at 9:00 AM to reflect the most
                    current performance data and client feedback.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}