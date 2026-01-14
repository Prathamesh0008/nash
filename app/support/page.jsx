import PageLayout from "@/components/PageLayout";
import { 
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

export const generateMetadata = () => ({
  title: "Contact Support",
  robots: { index: false, follow: false },
});

export default function SupportPage() {
  const supportChannels = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Live Chat",
      description: "Instant support from our team",
      availability: "24/7",
      responseTime: "Under 2 minutes",
      color: "from-blue-500 to-cyan-500",
      features: ["Instant response", "Screen sharing available", "File sharing"],
      action: "Start Chat"
    },
    {
      icon: EnvelopeIcon,
      title: "Email Support",
      description: "Detailed support via email",
      availability: "24/7",
      responseTime: "Under 24 hours",
      color: "from-purple-500 to-pink-500",
      features: ["Detailed responses", "Attachment support", "Ticket tracking"],
      action: "Send Email"
    },
    {
      icon: PhoneIcon,
      title: "Priority Callback",
      description: "Schedule a call with our experts",
      availability: "9 AM - 9 PM EST",
      responseTime: "Under 4 hours",
      color: "from-green-500 to-emerald-500",
      features: ["Voice support", "Technical consultation", "Follow-up calls"],
      action: "Request Call"
    }
  ];

  const supportCategories = [
    {
      icon: UserGroupIcon,
      title: "Account Issues",
      issues: ["Login problems", "Account recovery", "Verification", "Profile updates"],
      priority: "Medium",
      color: "bg-blue-500/10 text-blue-400"
    },
    {
      icon: ShieldCheckIcon,
      title: "Safety & Security",
      issues: ["Safety concerns", "Privacy issues", "Content violations", "Blocking users"],
      priority: "High",
      color: "bg-red-500/10 text-red-400"
    },
    {
      icon: WrenchScrewdriverIcon,
      title: "Technical Support",
      issues: ["App issues", "Payment problems", "Connection errors", "Feature bugs"],
      priority: "High",
      color: "bg-amber-500/10 text-amber-400"
    },
    {
      icon: DocumentCheckIcon,
      title: "Billing & Payments",
      issues: ["Refund requests", "Payment failures", "Invoice issues", "Subscription"],
      priority: "Medium",
      color: "bg-green-500/10 text-green-400"
    }
  ];

  const escalationLevels = [
    {
      level: "Level 1",
      title: "Initial Support",
      description: "Basic troubleshooting and information",
      resolution: "75% of cases",
      time: "Within 2 hours"
    },
    {
      level: "Level 2",
      title: "Technical Support",
      description: "Advanced technical assistance",
      resolution: "20% of cases",
      time: "Within 4 hours"
    },
    {
      level: "Level 3",
      title: "Expert Support",
      description: "Specialist and management escalation",
      resolution: "5% of cases",
      time: "Within 8 hours"
    }
  ];

  return (
    <PageLayout
      title="Contact Support"
      subtitle="24/7 confidential assistance"
    >
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-blue-600/10 border-b border-gray-800">
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl mb-6">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                We're Here to Help
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Our dedicated support team provides confidential, professional assistance 
                24/7 for all your needs.
              </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-600/20 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">24/7</p>
                    <p className="text-gray-400 text-sm">Support Availability</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">98%</p>
                    <p className="text-gray-400 text-sm">Satisfaction Rate</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-600/20 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">Under 24h</p>
                    <p className="text-gray-400 text-sm">Average Resolution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Single Column Layout */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Contact Channels */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Choose Your Support Channel
            </h2>
            <div className="space-y-6">
              {supportChannels.map((channel, index) => (
                <div 
                  key={index}
                  className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 hover:border-gray-600 transition-all"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                    <div className={`p-4 bg-gradient-to-r ${channel.color} rounded-xl flex-shrink-0`}>
                      <channel.icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            {channel.title}
                          </h3>
                          <p className="text-gray-300">{channel.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-400">Response Time</p>
                            <p className="text-lg font-semibold text-white">{channel.responseTime}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-400">Availability</p>
                            <p className="text-lg font-semibold text-white">{channel.availability}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {channel.features.map((feature, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-gray-800/50 rounded-full text-sm text-gray-300"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                        <button className={`px-6 py-3 bg-gradient-to-r ${channel.color} hover:opacity-90 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2`}>
                          {channel.action}
                          <ArrowRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Support Categories */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Common Support Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportCategories.map((category, index) => (
                <div 
                  key={index}
                  className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-gray-800/50">
                      <category.icon className="h-6 w-6 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                          {category.priority} Priority
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {category.issues.map((issue, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Support Process */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Our Support Process
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-600 via-cyan-600 to-blue-600 hidden md:block" />
              
              <div className="space-y-8">
                {escalationLevels.map((level, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-6`}
                  >
                    <div className="md:w-1/2 flex justify-center md:justify-end">
                      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6 w-full max-w-md">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                            <span className="text-white font-bold">{level.level}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-white">{level.title}</h3>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">{level.description}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-sm text-gray-400">Resolution Rate</p>
                            <p className="text-white font-semibold">{level.resolution}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-sm text-gray-400">Response Time</p>
                            <p className="text-white font-semibold">{level.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center md:w-8">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                    </div>
                    
                    <div className="md:w-1/2" /> {/* Empty space for alignment */}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h4 className="text-lg font-semibold text-white mb-3">
                  What information should I provide when contacting support?
                </h4>
                <p className="text-gray-300">
                  Please include your username, email address, and a detailed description of the issue. 
                  For technical problems, include device type, browser/app version, and any error messages.
                </p>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h4 className="text-lg font-semibold text-white mb-3">
                  How confidential is my support request?
                </h4>
                <p className="text-gray-300">
                  All support communications are encrypted and confidential. Our team is trained 
                  to handle sensitive information with discretion. Your privacy is our priority.
                </p>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h4 className="text-lg font-semibold text-white mb-3">
                  What if I need urgent assistance?
                </h4>
                <p className="text-gray-300">
                  For urgent safety issues, use Live Chat and mention "URGENT" in your message. 
                  Our team will prioritize your request and respond immediately.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                Send a Message
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="">Select a category</option>
                    <option value="account">Account Issues</option>
                    <option value="safety">Safety & Security</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Describe your issue in detail..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="urgent" className="rounded border-gray-700 bg-gray-800 text-blue-500" />
                  <label htmlFor="urgent" className="text-sm text-gray-300">
                    Mark as urgent (for safety or critical issues)
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>
          </section>

          {/* Emergency Contact */}
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-2xl border border-red-800/30 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600/20 rounded-xl">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Emergency Safety Concern?</h3>
                  <p className="text-gray-300">
                    For immediate safety emergencies, contact local authorities first.
                  </p>
                </div>
              </div>
              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap">
                Emergency Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}