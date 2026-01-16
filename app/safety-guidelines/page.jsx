import PageLayout from "@/components/PageLayout";

export default function SafetyGuidelinesPage() {
  const safetyGuidelines = [
    {
      id: 1,
      title: "Identity Verification",
      icon: "🔒",
      description: "All workers undergo a thorough identity verification process, including government ID checks and background screening.",
      details: [
        "Government-issued photo ID verification",
        "Background check clearance",
        "Professional certification validation",
        "Regular re-verification process"
      ]
    },
    {
      id: 2,
      title: "Secure Communication",
      icon: "💬",
      description: "Our platform provides encrypted messaging to protect your conversations and personal information.",
      details: [
        "End-to-end encrypted messaging",
        "Anonymous contact system",
        "No sharing of personal phone numbers",
        "Secure document sharing"
      ]
    },
    {
      id: 3,
      title: "Zero-Tolerance Policy",
      icon: "🚫",
      description: "We maintain a strict zero-tolerance policy against any form of harassment, discrimination, or abuse.",
      details: [
        "Immediate suspension for violations",
        "24/7 incident reporting system",
        "Confidential complaint investigation",
        "Permanent ban for serious offenses"
      ]
    },
    {
      id: 4,
      title: "Manual Moderation",
      icon: "👥",
      description: "Our dedicated moderation team reviews profiles, bookings, and interactions to ensure community safety.",
      details: [
        "24/7 moderation team",
        "Profile and review monitoring",
        "Booking pattern analysis",
        "User behavior tracking"
      ]
    },
    {
      id: 5,
      title: "Secure Payments",
      icon: "💳",
      description: "All transactions are processed through our secure payment system with fraud protection.",
      details: [
        "PCI-compliant payment processing",
        "Secure card tokenization",
        "Payment protection for bookings",
        "Transparent pricing with no hidden fees"
      ]
    },
    {
      id: 6,
      title: "Safety Training",
      icon: "🎓",
      description: "Workers receive comprehensive safety training and guidelines for professional conduct.",
      details: [
        "Safety protocol certification",
        "COVID-19 safety guidelines",
        "Professional conduct training",
        "Emergency response procedures"
      ]
    }
  ];

  const userTips = [
    "Always communicate through Valentina's secure messaging system",
    "Verify worker profiles by checking ratings and reviews",
    "Report any suspicious activity immediately through our app",
    "Use the in-app payment system for your protection"
  ];

  return (
    <PageLayout title="Safety Guidelines">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
             <span className="text-pink-600">Your Safety is Our Priority</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            At Valentina's, we've built a comprehensive safety framework to ensure secure and trustworthy 
            connections between clients and workers. Your peace of mind matters to us.
          </p>
        </div>

        {/* Main Safety Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {safetyGuidelines.map((guideline) => (
            <div 
              key={guideline.id} 
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-start mb-4">
                <div className="text-3xl mr-4">{guideline.icon}</div>
                <h3 className="text-xl font-bold text-gray-900">{guideline.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{guideline.description}</p>
              <ul className="space-y-2">
                {guideline.details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-pink-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Safety Tips Section */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 mb-12">
          <div className="flex items-center mb-6">
            <div className="bg-pink-100 p-3 rounded-full mr-4">
              <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Safety Tips for Users</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userTips.map((tip, index) => (
              <div key={index} className="flex items-start bg-white p-4 rounded-xl shadow-sm">
                <div className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-800">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Reporting Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Need Help or Want to Report an Issue?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">24/7 Safety Hotline</h3>
              <p className="text-gray-600">Call us anytime for immediate assistance</p>
              <p className="text-blue-600 font-semibold mt-2">1-800-VALENTINA</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600">Send us detailed reports for investigation</p>
              <p className="text-green-600 font-semibold mt-2">safety@valentinas.com</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">In-App Reporting</h3>
              <p className="text-gray-600">Report issues directly through the app</p>
              <p className="text-purple-600 font-semibold mt-2">Settings → Help & Support</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 shadow-md">
              View Complete Safety Documentation
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Valentina's is committed to providing a safe and trustworthy platform for all users.</p>
          <p className="mt-1">Our safety guidelines are regularly updated to adapt to new challenges and best practices.</p>
          <p className="mt-4 text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
    </PageLayout>
  );
}