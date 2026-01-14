import PageLayout from "@/components/PageLayout";
import { CheckCircleIcon, XCircleIcon, ShieldCheckIcon, ExclamationTriangleIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export const generateMetadata = () => ({
  title: "Terms of Service | Professional Worker Booking Platform",
  robots: { index: false, follow: false },
});

export default function TermsPage() {
  const termsSections = [
    {
      title: "Acceptance of Terms",
      icon: CheckCircleIcon,
      content: "By accessing and using our worker booking platform, you confirm that you are at least 18 years old and legally permitted to use our services in your jurisdiction. Your continued use constitutes acceptance of these terms.",
      points: [
        "You agree to abide by all applicable laws",
        "You acknowledge understanding of our service model",
        "You accept our booking and payment policies"
      ]
    },
    {
      title: "Account & Registration",
      icon: ShieldCheckIcon,
      content: "To book workers through our platform, you must create a verified account with accurate information.",
      rules: [
        { text: "One account per individual", allowed: true },
        { text: "Accurate personal and contact information", allowed: true },
        { text: "Impersonation or false identity", allowed: false },
        { text: "Account sharing or transfer", allowed: false },
        { text: "Multiple accounts for same individual", allowed: false }
      ]
    },
    {
      title: "Booking & Payment Terms",
      icon: DocumentTextIcon,
      content: "All bookings are subject to availability and confirmation from the worker. Payments are processed securely through our platform.",
      points: [
        "Bookings require upfront payment confirmation",
        "Cancellations must be made 24 hours in advance for full refund",
        "Late cancellations (less than 24 hours) incur 50% charge",
        "No-shows result in full charge and potential account suspension",
        "Disputes must be filed within 7 days of service"
      ]
    },
    {
      title: "Service Conduct & Safety",
      icon: ShieldCheckIcon,
      content: "We prioritize safety and professionalism for both workers and clients. All interactions must maintain respect and professionalism.",
      guidelines: [
        "Both parties must respect agreed-upon service boundaries",
        "Professional conduct is required at all times",
        "Harassment or inappropriate behavior will result in immediate ban",
        "Safety protocols must be followed during service delivery",
        "Any unsafe conditions should be reported immediately"
      ]
    },
    {
      title: "Worker & Client Responsibilities",
      icon: ExclamationTriangleIcon,
      content: "Clear expectations for both service providers and clients to ensure smooth transactions.",
      responsibilities: {
        workers: [
          "Arrive on time for scheduled appointments",
          "Provide services as described in profile",
          "Maintain professional equipment and appearance",
          "Report any client issues to platform immediately"
        ],
        clients: [
          "Provide accurate service requirements",
          "Maintain safe and accessible work environment",
          "Have necessary materials/tools ready",
          "Respect worker's time and expertise"
        ]
      }
    },
    {
      title: "Content & Platform Usage",
      icon: DocumentTextIcon,
      content: "All content shared on our platform must comply with community standards and applicable laws.",
      restrictions: [
        "No illegal or prohibited content",
        "No false or misleading information",
        "No spam or promotional content without permission",
        "No collection of others' personal information",
        "No interference with platform operations"
      ]
    }
  ];

  const legalInfo = {
    liability: "Our platform acts as an intermediary connecting workers with clients. We are not responsible for the quality of services provided by independent workers, though we facilitate dispute resolution.",
    modifications: "We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance.",
    termination: "Violations may result in immediate account termination, legal action, and permanent ban from the platform.",
    contact: "For questions about these terms, contact our legal team at legal@workerplatform.com"
  };

  return (
    <PageLayout title="Terms of Service">
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border-b border-gray-800">
          <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <DocumentTextIcon className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Terms of Service
                </h1>
                <p className="text-gray-300 text-lg">
                  Last updated: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <p className="text-gray-300 text-lg max-w-3xl">
              Welcome to our professional worker booking platform. These terms govern your use of our services. 
              Please read them carefully before booking any services.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Quick Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                  Quick Navigation
                </h3>
                <nav className="space-y-2">
                  {termsSections.map((section, index) => (
                    <a
                      key={index}
                      href={`#section-${index}`}
                      className="block p-3 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-300 hover:text-white border-l-2 border-transparent hover:border-blue-500"
                    >
                      <div className="flex items-center gap-3">
                        <section.icon className="h-4 w-4 text-blue-400" />
                        <span>{section.title}</span>
                      </div>
                    </a>
                  ))}
                </nav>
                
                <div className="mt-8 p-4 bg-blue-900/20 rounded-xl border border-blue-800/30">
                  <h4 className="font-semibold text-white mb-2">Important Note</h4>
                  <p className="text-sm text-gray-300">
                    By using our platform, you agree to these terms. Violations may result in account termination.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms Content */}
            <div className="lg:col-span-2 space-y-8">
              {termsSections.map((section, index) => (
                <section 
                  key={index} 
                  id={`section-${index}`}
                  className="scroll-mt-24 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 md:p-8 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-blue-600/20 rounded-xl">
                      <section.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {section.title}
                      </h2>
                      <p className="text-gray-300">
                        {section.content}
                      </p>
                    </div>
                  </div>

                  {/* Render different content based on section type */}
                  {section.points && (
                    <ul className="space-y-3 ml-4">
                      {section.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                          <span className="text-gray-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.rules && (
                    <div className="space-y-3">
                      {section.rules.map((rule, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-3 p-3 rounded-lg ${rule.allowed ? 'bg-green-900/20 border border-green-800/30' : 'bg-red-900/20 border border-red-800/30'}`}
                        >
                          {rule.allowed ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                          )}
                          <span className="text-gray-300">{rule.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.guidelines && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.guidelines.map((guideline, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheckIcon className="h-4 w-4 text-blue-400" />
                            <span className="text-white font-medium">Guideline {idx + 1}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{guideline}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.responsibilities && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-900/10 rounded-xl p-5 border border-blue-800/30">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <CheckCircleIcon className="h-5 w-5 text-blue-400" />
                          Worker Responsibilities
                        </h4>
                        <ul className="space-y-2">
                          {section.responsibilities.workers.map((item, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-purple-900/10 rounded-xl p-5 border border-purple-800/30">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <CheckCircleIcon className="h-5 w-5 text-purple-400" />
                          Client Responsibilities
                        </h4>
                        <ul className="space-y-2">
                          {section.responsibilities.clients.map((item, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {section.restrictions && (
                    <div className="bg-gray-900/50 rounded-xl p-5">
                      <h4 className="text-lg font-semibold text-white mb-4">Platform Restrictions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.restrictions.map((restriction, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
                            <XCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-sm">{restriction}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              ))}

              {/* Legal Information */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 md:p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Legal Information</h3>
                
                <div className="space-y-6">
                  {Object.entries(legalInfo).map(([key, value]) => (
                    <div key={key} className="border-l-2 border-blue-500 pl-4">
                      <h4 className="text-lg font-semibold text-white mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </h4>
                      <p className="text-gray-300">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                    <h4 className="text-lg font-semibold text-white">Disclaimer</h4>
                  </div>
                  <p className="text-gray-300">
                    Our platform connects independent workers with clients. We conduct background checks and 
                    verification processes, but we do not employ the workers directly. Users are responsible 
                    for conducting their own due diligence when engaging with service providers.
                  </p>
                </div>
              </div>

              {/* Acceptance Section */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-800/50 p-6 md:p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Agreement Acceptance
                </h3>
                <p className="text-gray-300 mb-6">
                  By using our worker booking services, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms of Service.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200">
                    I Accept Terms
                  </button>
                  <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200">
                    Download Terms (PDF)
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-4">
                  Need help? Contact our support team at support@workerplatform.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}