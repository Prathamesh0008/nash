import PageLayout from "@/components/PageLayout";
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  EyeIcon, 
  TrashIcon,
  DocumentTextIcon,
  ServerIcon,
  UserCircleIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ChatBubbleBottomCenterTextIcon,
  ScaleIcon,
  PencilIcon,
  BellSlashIcon,
  ArrowRightCircleIcon,
  ShareIcon,
  ClockIcon,
  XCircleIcon,
  QrCodeIcon
} from "@heroicons/react/24/outline";

export const generateMetadata = () => ({
  title: "Privacy Policy | Worker Booking Platform",
  robots: { index: false, follow: false },
});

export default function PrivacyPage() {
  const privacySections = [
    {
      title: "Information We Collect",
      icon: ClipboardDocumentCheckIcon,
      description: "We collect information necessary to provide our worker booking services, ensure safety, and improve user experience.",
      categories: [
        {
          name: "Account Information",
          icon: UserCircleIcon,
          items: [
            "Full name and contact details",
            "Email address and phone number",
            "Profile information and preferences",
            "Verification documents (for workers)",
            "Payment information (encrypted)"
          ]
        },
        {
          name: "Service Data",
          icon: DocumentTextIcon,
          items: [
            "Booking history and preferences",
            "Service ratings and reviews",
            "Worker availability and schedules",
            "Location data (for service matching)",
            "Communication records"
          ]
        },
        {
          name: "Technical Data",
          icon: ServerIcon,
          items: [
            "Device information and IP address",
            "Browser type and version",
            "Usage patterns and interactions",
            "Session information",
            "Error logs and performance metrics"
          ]
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: EyeIcon,
      description: "Your data helps us provide, improve, and secure our booking platform.",
      purposes: [
        {
          title: "Service Delivery",
          description: "To facilitate bookings and connect you with workers",
          icon: CheckCircleIcon
        },
        {
          title: "Safety & Verification",
          description: "To verify identities and ensure platform safety",
          icon: ShieldCheckIcon
        },
        {
          title: "Payment Processing",
          description: "To securely process payments and refunds",
          icon: CreditCardIcon
        },
        {
          title: "Communication",
          description: "To send booking confirmations and updates",
          icon: ChatBubbleBottomCenterTextIcon
        },
        {
          title: "Platform Improvement",
          description: "To analyze usage and enhance features",
          icon: ArrowPathIcon
        },
        {
          title: "Legal Compliance",
          description: "To comply with legal obligations and regulations",
          icon: ScaleIcon
        }
      ]
    },
    {
      title: "Data Security & Protection",
      icon: LockClosedIcon,
      description: "We implement industry-standard security measures to protect your information.",
      securityMeasures: [
        {
          measure: "End-to-End Encryption",
          level: "High",
          description: "All sensitive data is encrypted in transit and at rest",
          icon: LockClosedIcon
        },
        {
          measure: "Access Controls",
          level: "High",
          description: "Strict role-based access to personal information",
          icon: ShieldCheckIcon
        },
        {
          measure: "Regular Audits",
          level: "Medium",
          description: "Security audits and vulnerability assessments",
          icon: ClipboardDocumentCheckIcon
        },
        {
          measure: "Data Minimization",
          level: "High",
          description: "We collect only what's necessary for service delivery",
          icon: TrashIcon
        }
      ]
    },
    {
      title: "Cookies & Tracking",
      icon: QrCodeIcon, // Using QrCodeIcon instead of CookieIcon
      description: "We use cookies and similar technologies to enhance your experience.",
      cookieTypes: [
        {
          type: "Essential",
          purpose: "Required for platform functionality and security",
          examples: ["Session management", "Authentication", "Security features"],
          necessary: true
        },
        {
          type: "Functional",
          purpose: "Remember preferences and improve experience",
          examples: ["Language settings", "Location preferences", "UI settings"],
          necessary: false
        },
        {
          type: "Analytical",
          purpose: "Understand usage patterns and improve services",
          examples: ["Visit analytics", "Feature usage", "Performance metrics"],
          necessary: false
        }
      ]
    },
    {
      title: "Your Rights & Choices",
      icon: UserCircleIcon,
      description: "You have control over your personal information.",
      rights: [
        {
          right: "Access & Portability",
          description: "Request access to your data in a readable format",
          icon: EyeIcon
        },
        {
          right: "Correction",
          description: "Update or correct inaccurate information",
          icon: PencilIcon
        },
        {
          right: "Deletion",
          description: "Request deletion of your personal data",
          icon: TrashIcon
        },
        {
          right: "Opt-Out",
          description: "Opt-out of marketing communications",
          icon: BellSlashIcon
        },
        {
          right: "Cookie Preferences",
          description: "Manage cookie settings in your browser",
          icon: QrCodeIcon
        },
        {
          right: "Data Portability",
          description: "Transfer your data to another service",
          icon: ArrowRightCircleIcon
        }
      ]
    },
    {
      title: "Data Sharing & Third Parties",
      icon: ShareIcon,
      description: "We only share information when necessary for service delivery.",
      sharingPartners: [
        {
          partner: "Service Workers",
          purpose: "To facilitate bookings and service delivery",
          dataShared: ["Contact information", "Service requirements", "Location data"],
          consentRequired: true
        },
        {
          partner: "Payment Processors",
          purpose: "To process transactions securely",
          dataShared: ["Payment information", "Transaction details"],
          consentRequired: true
        },
        {
          partner: "Legal Authorities",
          purpose: "When required by law or to protect rights",
          dataShared: ["As required by legal request"],
          consentRequired: false
        }
      ]
    }
  ];

  const dataRetention = {
    period: "36 months",
    criteria: "Active accounts are retained while active. Inactive accounts are deleted after 36 months of inactivity.",
    exceptions: [
      "Legal requirements may require longer retention",
      "Dispute resolution may require data retention",
      "Security incident investigation periods"
    ]
  };

  return (
    <PageLayout title="Privacy Policy">
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600/20 via-blue-600/20 to-purple-600/20 border-b border-gray-800">
          <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-600/20 rounded-xl">
                  <ShieldCheckIcon className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    Privacy Policy
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Protecting your data is our priority
                  </p>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <p className="text-sm text-gray-300">
                  <span className="text-white font-semibold">Last Updated:</span><br />
                  {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <p className="text-xl text-gray-300 leading-relaxed">
                At our worker booking platform, we are committed to protecting your privacy and 
                ensuring the security of your personal information. This policy explains how we 
                collect, use, and safeguard your data.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Navigation */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-green-400" />
                    Policy Sections
                  </h3>
                  <nav className="space-y-2">
                    {privacySections.map((section, index) => (
                      <a
                        key={index}
                        href={`#section-${index}`}
                        className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 transition-all text-gray-300 hover:text-white border-l-2 border-transparent hover:border-green-500"
                      >
                        <div className="flex items-center gap-3">
                          <section.icon className="h-4 w-4 text-green-400" />
                          <span className="text-sm">{section.title}</span>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Data Protection Badge */}
                <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-2xl border border-green-800/30 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheckIcon className="h-8 w-8 text-green-400" />
                    <div>
                      <h4 className="font-bold text-white">GDPR Compliant</h4>
                      <p className="text-sm text-gray-300">Data Protection</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">
                    We comply with global data protection regulations including GDPR, CCPA, and other privacy laws.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Content */}
            <div className="lg:col-span-3 space-y-8">
              {privacySections.map((section, index) => (
                <section 
                  key={index} 
                  id={`section-${index}`}
                  className="scroll-mt-24 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 md:p-8 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-start gap-4 mb-8">
                    <div className="p-3 bg-green-600/20 rounded-xl">
                      <section.icon className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-3">
                        {section.title}
                      </h2>
                      <p className="text-gray-300 text-lg">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  {/* Information Categories */}
                  {section.categories && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {section.categories.map((category, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                          <div className="flex items-center gap-3 mb-4">
                            <category.icon className="h-5 w-5 text-blue-400" />
                            <h4 className="text-lg font-semibold text-white">{category.name}</h4>
                          </div>
                          <ul className="space-y-2">
                            {category.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="text-gray-300 text-sm flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Purposes */}
                  {section.purposes && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.purposes.map((purpose, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-green-800/50 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-900/30 rounded-lg">
                              <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            </div>
                            <h4 className="font-semibold text-white">{purpose.title}</h4>
                          </div>
                          <p className="text-gray-300 text-sm">{purpose.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Security Measures */}
                  {section.securityMeasures && (
                    <div className="space-y-4">
                      {section.securityMeasures.map((measure, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                          <div className={`p-2 rounded-lg ${
                            measure.level === 'High' ? 'bg-green-900/30' : 
                            measure.level === 'Medium' ? 'bg-yellow-900/30' : 
                            'bg-blue-900/30'
                          }`}>
                            <measure.icon className={`h-5 w-5 ${
                              measure.level === 'High' ? 'text-green-400' : 
                              measure.level === 'Medium' ? 'text-yellow-400' : 
                              'text-blue-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-white">{measure.measure}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                measure.level === 'High' ? 'bg-green-900/50 text-green-300' : 
                                measure.level === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' : 
                                'bg-blue-900/50 text-blue-300'
                              }`}>
                                {measure.level} Protection
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm">{measure.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cookie Types */}
                  {section.cookieTypes && (
                    <div className="space-y-4">
                      {section.cookieTypes.map((cookie, idx) => (
                        <div key={idx} className="p-5 rounded-xl border border-gray-700 bg-gray-800/50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <QrCodeIcon className="h-5 w-5 text-yellow-400" />
                              <h4 className="font-semibold text-white">{cookie.type} Cookies</h4>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              cookie.necessary ? 'bg-green-900/50 text-green-300' : 'bg-blue-900/50 text-blue-300'
                            }`}>
                              {cookie.necessary ? 'Required' : 'Optional'}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">{cookie.purpose}</p>
                          <div className="flex flex-wrap gap-2">
                            {cookie.examples.map((example, exIdx) => (
                              <span key={exIdx} className="px-3 py-1 bg-gray-900/50 rounded-full text-xs text-gray-300">
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* User Rights */}
                  {section.rights && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.rights.map((right, idx) => (
                        <div key={idx} className="group bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-green-800/50 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-900/30 rounded-lg group-hover:bg-green-900/30 transition-colors">
                              <CheckCircleIcon className="h-5 w-5 text-blue-400 group-hover:text-green-400 transition-colors" />
                            </div>
                            <h4 className="font-semibold text-white">{right.right}</h4>
                          </div>
                          <p className="text-gray-300 text-sm">{right.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Data Sharing */}
                  {section.sharingPartners && (
                    <div className="space-y-4">
                      {section.sharingPartners.map((partner, idx) => (
                        <div key={idx} className="p-5 rounded-xl border border-gray-700 bg-gray-800/50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-white">{partner.partner}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              partner.consentRequired ? 'bg-green-900/50 text-green-300' : 'bg-gray-800 text-gray-300'
                            }`}>
                              {partner.consentRequired ? 'Consent Required' : 'Legal Requirement'}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-4">{partner.purpose}</p>
                          <div>
                            <h5 className="text-sm font-medium text-gray-400 mb-2">Data Shared:</h5>
                            <div className="flex flex-wrap gap-2">
                              {partner.dataShared.map((data, dataIdx) => (
                                <span key={dataIdx} className="px-3 py-1 bg-gray-900/50 rounded-full text-xs text-gray-300">
                                  {data}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}

              {/* Data Retention */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-600/20 rounded-xl">
                    <ClockIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Data Retention
                    </h2>
                    <p className="text-gray-300">
                      We retain your personal information only as long as necessary.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-900/10 rounded-xl p-5 border border-blue-800/30">
                    <h4 className="text-lg font-semibold text-white mb-3">Retention Period</h4>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-blue-400 mb-2">{dataRetention.period}</div>
                      <p className="text-sm text-gray-300">Standard retention period</p>
                    </div>
                    <p className="text-gray-300 text-sm">{dataRetention.criteria}</p>
                  </div>

                  <div className="bg-purple-900/10 rounded-xl p-5 border border-purple-800/30">
                    <h4 className="text-lg font-semibold text-white mb-3">Exceptions</h4>
                    <ul className="space-y-2">
                      {dataRetention.exceptions.map((exception, idx) => (
                        <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {exception}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact & Updates */}
              <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-2xl border border-green-800/50 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Questions & Updates
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Contact our Data Protection Officer for privacy-related inquiries or 
                      to exercise your rights.
                    </p>
                    <div className="space-y-2">
                      <p className="text-gray-300">
                        <span className="font-semibold text-white">Email:</span> privacy@workerplatform.com
                      </p>
                      <p className="text-gray-300">
                        <span className="font-semibold text-white">Phone:</span> +1 (555) 123-4567
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-700">
                    <h4 className="font-semibold text-white mb-3">Policy Updates</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      We may update this policy periodically. We'll notify you of significant changes.
                    </p>
                    <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                      View Update History
                    </button>
                  </div>
                </div>
              </div>

              {/* Acceptance */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  By using our platform, you acknowledge that you have read and understood this Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}