import PageLayout from "@/components/PageLayout";
import { 
  DocumentTextIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  UserGroupIcon,
  FlagIcon
} from "@heroicons/react/24/outline";

export default function DMCACompliancePage() {
  const dmcaSections = [
    {
      title: "DMCA Takedown Procedure",
      icon: DocumentTextIcon,
      description: "Our process for handling copyright infringement claims under the Digital Millennium Copyright Act.",
      steps: [
        {
          number: "01",
          title: "Infringement Notice",
          description: "Submit a proper DMCA takedown notice with all required information",
          time: "Within 24 hours",
          icon: PaperAirplaneIcon
        },
        {
          number: "02",
          title: "Review & Verification",
          description: "Our legal team reviews the notice for completeness and validity",
          time: "1-2 Business Days",
          icon: MagnifyingGlassIcon
        },
        {
          number: "03",
          title: "Content Removal",
          description: "If valid, infringing content is removed from our platform",
          time: "Immediately",
          icon: XCircleIcon
        },
        {
          number: "04",
          title: "Counter-Notice",
          description: "Content providers can submit a counter-notice if they believe the takedown was mistaken",
          time: "10-14 Business Days",
          icon: ShieldCheckIcon
        }
      ]
    },
    {
      title: "Legal Compliance Framework",
      icon: ScaleIcon,
      description: "Our comprehensive approach to legal and regulatory compliance across jurisdictions.",
      frameworks: [
        {
          name: "Content Moderation",
          status: "Active",
          coverage: "All user-generated content",
          icon: UserGroupIcon,
          color: "from-blue-500 to-cyan-500"
        },
        {
          name: "Age Verification",
          status: "Required",
          coverage: "All users and workers",
          icon: ShieldCheckIcon,
          color: "from-green-500 to-emerald-500"
        },
        {
          name: "Data Protection",
          status: "GDPR/CCPA Compliant",
          coverage: "Global user data",
          icon: GlobeAltIcon,
          color: "from-purple-500 to-pink-500"
        },
        {
          name: "Anti-Trafficking",
          status: "Zero Tolerance",
          coverage: "Full platform screening",
          icon: FlagIcon,
          color: "from-red-500 to-orange-500"
        }
      ]
    },
    {
      title: "Required Information",
      icon: ClipboardDocumentCheckIcon,
      description: "To process DMCA notices efficiently, please include all the following information:",
      requirements: [
        {
          category: "Identification",
          items: [
            "Physical or electronic signature of copyright owner or authorized agent",
            "Identification of the copyrighted work claimed to be infringed",
            "Identification of the infringing material and its location on our platform"
          ]
        },
        {
          category: "Contact Information",
          items: [
            "Your full name, address, telephone number, and email address",
            "Statement that you have a good faith belief the use is not authorized",
            "Statement that the information in the notification is accurate"
          ]
        },
        {
          category: "Legal Declarations",
          items: [
            "Statement under penalty of perjury that you are authorized to act",
            "Jurisdiction information if applicable",
            "Any relevant case numbers or legal references"
          ]
        }
      ]
    }
  ];

  const complianceMetrics = [
    { label: "DMCA Response Time", value: "24-48 Hours", change: "+95%", trend: "positive" },
    { label: "Compliance Rate", value: "99.8%", change: "+2.1%", trend: "positive" },
    { label: "Legal Resolutions", value: "2,154", change: "This Year", trend: "neutral" },
    { label: "Content Reviews", value: "15.7K", change: "+34%", trend: "positive" }
  ];

  const prohibitedContent = [
    "Copyrighted material without permission",
    "Child exploitation content",
    "Non-consensual intimate imagery",
    "Content promoting violence or harm",
    "Illegal or prohibited services",
    "Fraudulent or deceptive material"
  ];

  const contactChannels = [
    {
      method: "Email",
      address: "dmca@workerplatform.com",
      response: "Within 24 hours",
      priority: "High",
      icon: EnvelopeIcon
    },
    {
      method: "Legal Fax",
      address: "+1 (555) 789-0123",
      response: "Within 48 hours",
      priority: "Medium",
      icon: DocumentTextIcon
    },
    {
      method: "Registered Mail",
      address: "Legal Department, 123 Compliance St, Suite 500",
      response: "5-7 Business Days",
      priority: "Formal",
      icon: PaperAirplaneIcon
    }
  ];

  return (
    <PageLayout title="DMCA & Compliance">
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
        {/* Hero Section with Legal Document Theme */}
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-b border-gray-700">
          {/* Subtle legal document pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(90deg, transparent 79px, #374151 79px, #374151 81px, transparent 81px),
                               linear-gradient(#374151 1px, transparent 1px)`,
              backgroundSize: '100% 40px'
            }} />
          </div>
          
          <div className="container relative mx-auto px-4 py-16 max-w-6xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-amber-600/20 to-amber-700/20 rounded-2xl border border-amber-700/30">
                  <ScaleIcon className="h-10 w-10 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                    DMCA & Legal Compliance
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-green-900/30 rounded-full border border-green-800/30">
                      <span className="text-green-400 text-sm font-medium">COMPLIANT</span>
                    </div>
                    <p className="text-gray-300">
                      Upholding legal standards and protecting intellectual property rights
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <ClockIcon className="h-5 w-5 text-blue-400" />
                  <p className="text-white font-semibold">24-48 Hour Response</p>
                </div>
                <p className="text-sm text-gray-300">
                  Average DMCA takedown response time
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 relative">
              <div className="absolute -top-3 left-8 px-4 py-1 bg-amber-600 rounded-lg">
                <span className="text-white text-sm font-medium">OFFICIAL NOTICE</span>
              </div>
              <p className="text-xl text-gray-300 leading-relaxed">
                We take intellectual property rights and legal compliance seriously. Our platform 
                operates in strict adherence to the Digital Millennium Copyright Act (DMCA) and 
                other relevant regulations. We respond promptly to all legitimate legal requests.
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {complianceMetrics.map((metric, index) => (
              <div key={index} className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-5">
                <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
                    <div className={`flex items-center gap-1 ${
                      metric.trend === 'positive' ? 'text-green-400' : 
                      metric.trend === 'negative' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      <span className="text-sm">{metric.change}</span>
                      {metric.trend === 'positive' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    metric.trend === 'positive' ? 'bg-green-900/20' : 
                    metric.trend === 'negative' ? 'bg-red-900/20' : 'bg-blue-900/20'
                  }`}>
                    <CheckCircleIcon className={`h-5 w-5 ${
                      metric.trend === 'positive' ? 'text-green-400' : 
                      metric.trend === 'negative' ? 'text-red-400' : 'text-blue-400'
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - DMCA Process */}
            <div className="lg:col-span-2 space-y-8">
              {dmcaSections.map((section, index) => (
                <div 
                  key={index}
                  className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 md:p-8 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-start gap-4 mb-8">
                    <div className="p-3 bg-gradient-to-r from-amber-600/20 to-amber-700/20 rounded-xl">
                      <section.icon className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-3">
                        {section.title}
                      </h2>
                      <p className="text-gray-300">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  {/* DMCA Steps */}
                  {section.steps && (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-600 via-amber-500 to-amber-600" />
                      
                      <div className="space-y-6">
                        {section.steps.map((step, idx) => (
                          <div key={idx} className="relative flex items-start gap-6">
                            <div className="relative z-10 flex-shrink-0">
                              <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">{step.number}</span>
                              </div>
                            </div>
                            <div className="flex-1 bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                                <div className="flex items-center gap-2">
                                  <ClockIcon className="h-4 w-4 text-blue-400" />
                                  <span className="text-sm text-blue-400">{step.time}</span>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm mb-4">{step.description}</p>
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-amber-900/20 rounded-lg">
                                  <step.icon className="h-4 w-4 text-amber-400" />
                                </div>
                                <span className="text-sm text-gray-400">Step {idx + 1} of {section.steps.length}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compliance Frameworks */}
                  {section.frameworks && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.frameworks.map((framework, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 bg-gradient-to-r ${framework.color} rounded-lg`}>
                                <framework.icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{framework.name}</h4>
                                <p className="text-sm text-gray-400">{framework.coverage}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              framework.status === 'Active' ? 'bg-green-900/50 text-green-300' :
                              framework.status === 'Required' ? 'bg-blue-900/50 text-blue-300' :
                              framework.status === 'Zero Tolerance' ? 'bg-red-900/50 text-red-300' :
                              'bg-purple-900/50 text-purple-300'
                            }`}>
                              {framework.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* DMCA Requirements */}
                  {section.requirements && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {section.requirements.map((req, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                          <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
                            {req.category}
                          </h4>
                          <ul className="space-y-3">
                            {req.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Prohibited Content */}
              <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-2xl border border-red-800/30 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                  <h3 className="text-xl font-semibold text-white">Prohibited Content</h3>
                </div>
                <ul className="space-y-3">
                  {prohibitedContent.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <XCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 p-4 bg-red-900/30 rounded-lg border border-red-800/30">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">Note:</span> Violations will result in immediate content removal and potential account termination.
                  </p>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <PaperAirplaneIcon className="h-5 w-5 text-blue-400" />
                  Submit Notice
                </h3>
                <div className="space-y-4">
                  {contactChannels.map((channel, index) => (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-900/30 rounded-lg">
                          <channel.icon className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{channel.method}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              channel.priority === 'High' ? 'bg-green-900/50 text-green-300' :
                              channel.priority === 'Formal' ? 'bg-amber-900/50 text-amber-300' :
                              'bg-blue-900/50 text-blue-300'
                            }`}>
                              {channel.priority}
                            </span>
                            <span className="text-xs text-gray-400">Response: {channel.response}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm font-mono bg-gray-900/50 p-2 rounded">
                        {channel.address}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Legal Disclaimer</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      This page is for informational purposes only and does not constitute legal advice.
                      Consult with an attorney for legal guidance regarding DMCA or compliance matters.
                    </p>
                  </div>
                  <div className="p-4 bg-amber-900/20 rounded-lg border border-amber-800/30">
                    <p className="text-amber-300 text-sm">
                      <span className="font-semibold">Warning:</span> False DMCA claims may result in legal liability for damages.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Resources</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg transition-colors group">
                    <span className="text-gray-300 group-hover:text-white">DMCA Notice Template</span>
                    <DocumentTextIcon className="h-4 w-4 text-gray-400 group-hover:text-white" />
                  </a>
                  <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg transition-colors group">
                    <span className="text-gray-300 group-hover:text-white">Legal FAQ</span>
                    <ClipboardDocumentCheckIcon className="h-4 w-4 text-gray-400 group-hover:text-white" />
                  </a>
                  <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg transition-colors group">
                    <span className="text-gray-300 group-hover:text-white">Compliance Report</span>
                    <ScaleIcon className="h-4 w-4 text-gray-400 group-hover:text-white" />
                  </a>
                  <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg transition-colors group">
                    <span className="text-gray-300 group-hover:text-white">User Guidelines</span>
                    <ShieldCheckIcon className="h-4 w-4 text-gray-400 group-hover:text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Need Legal Assistance?</h3>
                <p className="text-gray-300 max-w-2xl">
                  Our legal team is available to assist with compliance matters and DMCA procedures. 
                  For urgent legal requests, please use our priority contact channels.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold rounded-lg transition-all duration-200">
                  Submit DMCA Notice
                </button>
                <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
                  Contact Legal Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}