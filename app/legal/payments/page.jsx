import PageLayout from "@/components/PageLayout";
import { 
  CreditCardIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  BanknotesIcon,
  WalletIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon,
  BellAlertIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function PaymentsPage() {
  const paymentMethods = [
    {
      name: "Credit & Debit Cards",
      icon: CreditCardIcon,
      description: "Secure card payments with instant processing",
      supported: ["Visa", "Mastercard", "American Express", "Discover"],
      processingTime: "Instant",
      security: "PCI-DSS Level 1 Certified",
      color: "from-blue-500 to-purple-600"
    },
    {
      name: "Digital Wallets",
      icon: WalletIcon,
      description: "Fast checkout with your favorite wallets",
      supported: ["Apple Pay", "Google Pay", "PayPal", "Venmo"],
      processingTime: "Instant",
      security: "Tokenized Transactions",
      color: "from-green-500 to-teal-600"
    },
    {
      name: "Bank Transfer",
      icon: BanknotesIcon,
      description: "Direct bank transfers for larger transactions",
      supported: ["ACH", "Wire Transfer", "SEPA", "Direct Debit"],
      processingTime: "1-3 Business Days",
      security: "Bank-Level Encryption",
      color: "from-emerald-500 to-green-600"
    },
    {
      name: "Cryptocurrency",
      icon: CurrencyDollarIcon,
      description: "Anonymous crypto payments",
      supported: ["Bitcoin", "Ethereum", "USDC", "Litecoin"],
      processingTime: "Within 1 Hour",
      security: "Blockchain Secured",
      color: "from-amber-500 to-orange-600"
    }
  ];

  const securityFeatures = [
    {
      title: "End-to-End Encryption",
      description: "All payment data is encrypted from start to finish",
      icon: LockClosedIcon
    },
    {
      title: "PCI-DSS Compliance",
      description: "Highest level of payment card security certification",
      icon: ShieldCheckIcon
    },
    {
      title: "Fraud Protection",
      description: "Advanced AI-powered fraud detection systems",
      icon: BellAlertIcon
    },
    {
      title: "3D Secure 2.0",
      description: "Enhanced authentication for card payments",
      icon: CheckCircleIcon
    }
  ];

  const paymentTips = [
    "All payments are processed securely and anonymously",
    "No sensitive payment data is stored on our servers",
    "Instant payment confirmation for most methods",
    "24/7 transaction monitoring and support",
    "Automatic currency conversion available",
    "Receipts emailed immediately after payment"
  ];

  const transactionLimits = {
    daily: "$10,000",
    weekly: "$50,000",
    monthly: "$200,000",
    perTransaction: "$5,000"
  };

  return (
    <PageLayout title="Payment Methods">
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border-b border-gray-800">
          <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <CreditCardIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    Secure Payments
                  </h1>
                  <p className="text-xl text-gray-300">
                    Multiple safe payment options for your convenience
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                <LockClosedIcon className="h-6 w-6 text-green-400" />
                <div>
                  <p className="text-white font-semibold">PCI-DSS Compliant</p>
                  <p className="text-sm text-gray-300">Level 1 Security</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <p className="text-xl text-gray-300 leading-relaxed">
                Choose from our wide range of secure, anonymous payment methods. All transactions 
                are protected with bank-level security and processed instantly for your convenience.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods Grid */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <WalletIcon className="h-8 w-8 text-blue-400" />
                  Available Payment Methods
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paymentMethods.map((method, index) => (
                    <div 
                      key={index}
                      className="group bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 hover:border-gray-600 transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 bg-gradient-to-r ${method.color} rounded-xl`}>
                            <method.icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{method.name}</h3>
                            <p className="text-sm text-gray-400">{method.description}</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-green-900/30 rounded-full">
                          <span className="text-green-400 text-sm font-medium">Available</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Supported Networks</h4>
                          <div className="flex flex-wrap gap-2">
                            {method.supported.map((network, idx) => (
                              <span 
                                key={idx}
                                className="px-3 py-1 bg-gray-800/50 rounded-full text-sm text-gray-300"
                              >
                                {network}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-sm text-gray-400">Processing Time</p>
                            <p className="text-white font-semibold">{method.processingTime}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-sm text-gray-400">Security</p>
                            <p className="text-white font-semibold">{method.security}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Security Features */}
              <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 md:p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <ShieldCheckIcon className="h-8 w-8 text-green-400" />
                  Security Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {securityFeatures.map((feature, index) => (
                    <div 
                      key={index}
                      className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-green-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-900/30 rounded-lg flex-shrink-0">
                          <feature.icon className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-gray-300 text-sm">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Info & Limits */}
            <div className="lg:col-span-1 space-y-8">
              {/* Transaction Limits */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                  Transaction Limits
                </h3>
                <div className="space-y-4">
                  {Object.entries(transactionLimits).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="text-white font-bold">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  Limits may vary based on verification level
                </p>
              </div>

              {/* Payment Tips */}
              <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-800/30 p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  Important Information
                </h3>
                <ul className="space-y-3">
                  {paymentTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                    <DevicePhoneMobileIcon className="h-5 w-5" />
                    Setup Auto-Pay
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
                    <QrCodeIcon className="h-5 w-5" />
                    View Payment QR
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
                    <ArrowPathIcon className="h-5 w-5" />
                    Payment History
                  </button>
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl border border-green-800/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-green-400" />
                  <div>
                    <h4 className="font-bold text-white">24/7 Support</h4>
                    <p className="text-sm text-gray-300">Payment Assistance</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Need help with payments? Our support team is available around the clock.
                </p>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <span className="font-semibold text-white">Email:</span> payments@workerplatform.com
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold text-white">Live Chat:</span> Available 24/7
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Process Section */}
          <div className="mt-12 bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              How Payments Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Select Service</h4>
                <p className="text-gray-300 text-sm">
                  Choose the worker and service you need
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Choose Payment</h4>
                <p className="text-gray-300 text-sm">
                  Select your preferred payment method
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Secure Payment</h4>
                <p className="text-gray-300 text-sm">
                  Complete payment with 256-bit encryption
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Confirmation</h4>
                <p className="text-gray-300 text-sm">
                  Instant booking confirmation and receipt
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 md:p-8">
            <h2 className="text-3xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="border-b border-gray-700 pb-4">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Is my payment information safe?
                </h4>
                <p className="text-gray-300">
                  Yes! We use PCI-DSS Level 1 certified encryption and never store your full payment details on our servers.
                </p>
              </div>
              <div className="border-b border-gray-700 pb-4">
                <h4 className="text-lg font-semibold text-white mb-2">
                  What payment methods are anonymous?
                </h4>
                <p className="text-gray-300">
                  Cryptocurrency payments offer the highest level of anonymity. Digital wallets also provide enhanced privacy features.
                </p>
              </div>
              <div className="border-b border-gray-700 pb-4">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Can I get a refund?
                </h4>
                <p className="text-gray-300">
                  Refunds are processed according to our cancellation policy. Contact support within 24 hours for assistance.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  How long do payments take to process?
                </h4>
                <p className="text-gray-300">
                  Most payments are instant. Bank transfers may take 1-3 business days. Cryptocurrency typically processes within an hour.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-800/50 p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Choose from our secure payment methods and book your worker instantly. 
              Your payment is protected with the highest security standards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105">
                Book a Worker Now
              </button>
              <button className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}