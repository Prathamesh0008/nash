import PageLayout from "@/components/PageLayout"
import Link from "next/link"

export const generateMetadata = () => ({
  title: "Join Our Platform | Valentina's",
  description: "Join Valentina's platform as a skilled worker. Earn competitive rates, get verified, and grow your client base.",
  robots: {
    index: true,
    follow: true,
  },
});

export default function JoinPlatformPage() {
  return (
    <PageLayout
      title="Join Valentina's Platform"
      subtitle="Transform your skills into reliable income"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl md:rounded-2xl p-6 md:p-8 lg:p-12 text-white mb-8 md:mb-12 shadow-lg md:shadow-xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-center md:text-left">
            Earn Up to <span className="text-yellow-300">₹50,000/month</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl opacity-90 text-center md:text-left">
            Join 5,000+ skilled workers who are growing their business with Valentina's
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
          {/* Left Column - Benefits */}
          <div className="space-y-6 md:space-y-8">
            {/* Why Join Card */}
            <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">
                  ✨
                </span>
                Why Join Valentina's?
              </h3>
              
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 text-green-600 p-1.5 rounded-full mr-3 mt-0.5">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">
                    <strong className="text-gray-900">Guaranteed Bookings:</strong> Regular work opportunities
                  </span>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 text-green-600 p-1.5 rounded-full mr-3 mt-0.5">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">
                    <strong className="text-gray-900">Instant Payments:</strong> Get paid within 24 hours
                  </span>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 text-green-600 p-1.5 rounded-full mr-3 mt-0.5">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">
                    <strong className="text-gray-900">Insurance Coverage:</strong> Work with peace of mind
                  </span>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 text-green-600 p-1.5 rounded-full mr-3 mt-0.5">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">
                    <strong className="text-gray-900">Skill Training:</strong> Free workshops to upgrade skills
                  </span>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 text-green-600 p-1.5 rounded-full mr-3 mt-0.5">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base text-gray-700">
                    <strong className="text-gray-900">24/7 Support:</strong> Dedicated help whenever you need
                  </span>
                </li>
              </ul>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow border border-gray-100 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">5,000+</div>
                <div className="text-xs sm:text-sm text-gray-600">Active Workers</div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow border border-gray-100 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">4.8★</div>
                <div className="text-xs sm:text-sm text-gray-600">Avg. Rating</div>
              </div>
            </div>

            {/* Mobile Testimonial (Hidden on desktop) */}
            <div className="lg:hidden bg-white p-6 rounded-xl shadow border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mr-4">
                  RK
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Rajesh Kumar</h4>
                  <p className="text-sm text-gray-600">Electrician • 2 years</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                "Joined Valentina's last year. Now I get regular bookings and earn 40% more than before!"
              </p>
              <div className="flex text-yellow-400 mt-3">
                ★★★★★
              </div>
            </div>
          </div>

          {/* Right Column - Registration Form */}
          <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                📋
              </span>
              Apply in 5 Minutes
            </h3>

            <form className="space-y-4 md:space-y-6">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Select Your Service *
                </label>
                <select className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition">
                  <option value="">Choose your service</option>
                  <option value="plumber">Plumber</option>
                  <option value="electrician">Electrician</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="cleaner">House Cleaner</option>
                  <option value="painter">Painter</option>
                  <option value="mechanic">Mechanic</option>
                  <option value="beautician">Beautician</option>
                  <option value="cook">Cook/Chef</option>
                  <option value="other">Other Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Experience (Years) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="e.g., 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  City/Location *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Enter your city"
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 mr-3 w-4 h-4 sm:w-5 sm:h-5"
                />
                <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600">
                  I agree to Valentina's terms and conditions and understand that I'll be contacted for verification.
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 sm:py-3.5 px-6 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Apply Now - It's Free!
              </button>

              <p className="text-center text-xs sm:text-sm text-gray-500">
                Our team will contact you within 24 hours
              </p>
            </form>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-12 md:mt-16">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6 md:mb-8">
            What Our Workers Say
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow border border-gray-100 hidden lg:block">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mr-3 sm:mr-4">
                  RK
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">Rajesh Kumar</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Electrician • 2 years</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm sm:text-base">
                "Joined Valentina's last year. Now I get regular bookings and earn 40% more than before!"
              </p>
              <div className="flex text-yellow-400 mt-3 text-sm sm:text-base">
                ★★★★★
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-xl shadow border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold mr-3 sm:mr-4">
                  SP
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">Sunita Patel</h4>
                  <p className="text-xs sm:text-sm text-gray-600">House Cleaner • 1.5 years</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm sm:text-base">
                "The insurance and timely payments give me peace of mind. Best platform for women workers!"
              </p>
              <div className="flex text-yellow-400 mt-3 text-sm sm:text-base">
                ★★★★★
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-xl shadow border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 sm:mr-4">
                  AS
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">Amit Sharma</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Plumber • 3 years</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm sm:text-base">
                "Training workshops helped me learn new techniques. Now I handle more premium clients."
              </p>
              <div className="flex text-yellow-400 mt-3 text-sm sm:text-base">
                ★★★★★
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 md:mt-16 bg-gray-50 rounded-xl md:rounded-2xl p-6 md:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6 md:mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-3 md:space-y-4 max-w-3xl mx-auto">
            <div className="bg-white p-5 md:p-6 rounded-xl shadow">
              <h4 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg mb-1 md:mb-2">Is there any registration fee?</h4>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">No, joining Valentina's platform is completely free. We only take a small commission when you get paid for your services.</p>
            </div>
            
            <div className="bg-white p-5 md:p-6 rounded-xl shadow">
              <h4 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg mb-1 md:mb-2">How long does verification take?</h4>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">Usually 24-48 hours. We verify your skills, background, and documents to ensure safety for both workers and clients.</p>
            </div>
            
            <div className="bg-white p-5 md:p-6 rounded-xl shadow">
              <h4 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg mb-1 md:mb-2">When do I get paid?</h4>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">Payments are processed within 24 hours after job completion directly to your bank account.</p>
            </div>
          </div>
        </div>

        {/* CTA Bottom */}
        <div className="mt-8 md:mt-12 text-center">
          <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
            Still have questions? Call our support team:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <Link 
              href="tel:+911800123456"
              className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 font-semibold py-2.5 md:py-3 px-4 md:px-6 rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition w-full sm:w-auto text-sm md:text-base"
            >
              <span>📞</span> Call: +91 1800 123 456
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-gray-800 text-white font-semibold py-2.5 md:py-3 px-4 md:px-6 rounded-lg hover:bg-gray-900 transition w-full sm:w-auto text-sm md:text-base"
            >
              <span>💬</span> Live Chat Support
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}