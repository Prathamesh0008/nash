"use client"; // Add this directive at the top

import PageLayout from "@/components/PageLayout";
import { useState } from "react";
import { 
  FaQuestionCircle, 
  FaPhone, 
  FaEnvelope, 
  FaClock, 
  FaChevronDown,
  FaUser,
  FaCalendarAlt,
  FaCreditCard,
  FaShieldAlt,
  FaStar,
  FaWhatsapp,
  FaFire,
  FaRocket,
  FaHeadset,
  FaBolt,
  FaCrown
} from "react-icons/fa";

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I book a worker on Valentina's?",
      answer: "Booking a worker is simple! Just browse our available workers, select the service you need, choose your preferred date and time, and proceed to payment. You'll receive a confirmation email with all the details.",
      icon: <FaUser className="text-2xl" />,
      category: "Booking",
      gradient: "from-blue-500 to-cyan-500",
      badge: "Popular"
    },
    {
      question: "What services do your workers provide?",
      answer: "Our workers provide a wide range of services including cleaning, plumbing, electrical work, carpentry, gardening, moving assistance, painting, and home maintenance. You can filter workers by their specific skills on our website.",
      icon: <FaCalendarAlt className="text-2xl" />,
      category: "Services",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      question: "How does payment work?",
      answer: "We accept all major credit/debit cards, PayPal, and digital wallets. Payment is processed securely through our platform. For some services, you can pay a deposit upfront and the remainder after the job is completed to your satisfaction.",
      icon: <FaCreditCard className="text-2xl" />,
      category: "Payment",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      question: "Can I cancel or reschedule a booking?",
      answer: "Yes! You can cancel or reschedule up to 24 hours before the scheduled appointment without any charges. For cancellations within 24 hours, a small fee may apply. You can manage your bookings from your account dashboard.",
      icon: <FaRocket className="text-2xl" />,
      category: "Booking",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      question: "Are your workers verified and insured?",
      answer: "Absolutely! All workers on Valentina's go through a rigorous verification process including background checks, skill assessments, and identity verification. We also provide insurance coverage for your peace of mind.",
      icon: <FaShieldAlt className="text-2xl" />,
      category: "Safety",
      gradient: "from-red-500 to-rose-500",
      badge: "Verified"
    },
    {
      question: "How are workers rated and reviewed?",
      answer: "After each completed job, customers are encouraged to rate and review their worker. These ratings help maintain quality standards and help other customers make informed decisions. Our top-rated workers receive special badges.",
      icon: <FaStar className="text-2xl" />,
      category: "Reviews",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "Customer satisfaction is our priority. If you're not happy with the service, please contact our support team within 48 hours. We'll work to resolve the issue, which may include a partial refund or sending another worker to complete the job.",
      icon: <FaHeadset className="text-2xl" />,
      category: "Support",
      gradient: "from-teal-500 to-cyan-500"
    },
    {
      question: "Do I need to provide equipment or materials?",
      answer: "It depends on the service. For most jobs, workers bring their own basic tools. However, for specific materials or specialized equipment, we recommend discussing this with the worker before the booking. Details are provided in the service description.",
      icon: <FaBolt className="text-2xl" />,
      category: "Services",
      gradient: "from-indigo-500 to-blue-500"
    }
  ];

  const supportOptions = [
    {
      title: "Phone Support",
      description: "Immediate assistance for urgent queries",
      contact: "+1 (555) 123-4567",
      icon: <FaPhone className="text-4xl" />,
      availability: "Mon-Sun: 7AM-10PM",
      actionText: "Call Now",
      gradient: "from-blue-600 to-cyan-600",
      features: ["Instant connection", "24/7 emergency", "Quick resolution"]
    },
    {
      title: "Email Support",
      description: "Detailed queries with thorough responses",
      contact: "support@valentinas.com",
      icon: <FaEnvelope className="text-4xl" />,
      availability: "24/7",
      actionText: "Send Email",
      gradient: "from-emerald-600 to-green-600",
      features: ["Document attachment", "Priority handling", "Detailed replies"]
    },
    {
      title: "Live Chat",
      description: "Real-time conversation with experts",
      contact: "Chat with us now",
      icon: <FaWhatsapp className="text-4xl" />,
      availability: "Mon-Fri: 9AM-6PM",
      actionText: "Start Chat",
      gradient: "from-violet-600 to-purple-600",
      features: ["Instant replies", "Screen sharing", "File sharing"]
    }
  ];

  const categories = ["All", "Booking", "Services", "Payment", "Safety", "Support"];

  return (
    <PageLayout title="FAQ & Support">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white">
        {/* Hero Section with Glass Effect */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
          <div className="relative bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-950/80 backdrop-blur-xl py-16 px-4 border-b border-white/10">
            <div className="max-w-6xl mx-auto text-center">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center border border-white/10">
                    <FaQuestionCircle className="text-4xl text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text" />
                  </div>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                How Can We Help You?
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
                Find instant answers or connect with our expert support team. Your satisfaction is our priority.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl hover:shadow-3xl flex items-center gap-3 border border-white/20">
                  <FaFire className="group-hover:rotate-12 transition-transform duration-300" />
                  Browse Popular Questions
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 group">
                  <span className="flex items-center gap-3">
                    <FaCrown className="group-hover:text-yellow-400 transition-colors duration-300" />
                    Premium Support
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          {/* Support Options - Modern Cards */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Expert Support Channels
                </h2>
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              </div>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Choose your preferred way to connect with our dedicated support team
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {supportOptions.map((option, index) => (
                <div key={index} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                  <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
                    <div className={`inline-flex p-4 bg-gradient-to-br ${option.gradient} rounded-2xl mb-6 shadow-lg`}>
                      {option.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{option.title}</h3>
                    <p className="text-gray-400 mb-6">{option.description}</p>
                    
                    <div className="mb-8">
                      <p className="text-xl font-bold text-white mb-3">{option.contact}</p>
                      <div className="flex items-center text-gray-500">
                        <FaClock className="mr-3" />
                        <span>{option.availability}</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-sm text-gray-400 mb-3">Features:</div>
                      <ul className="space-y-2">
                        {option.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-gray-300">
                            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-3"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button className={`w-full py-4 bg-gradient-to-r ${option.gradient} text-white font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-[1.02]`}>
                      {option.actionText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Emergency Support */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-600/20 to-red-600/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-r from-red-900/30 via-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-2xl border border-red-500/30 p-10 text-center hover:border-red-400/50 transition-all duration-500">
                <div className="absolute top-4 right-4">
                  <FaFire className="text-2xl text-red-400 animate-pulse" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">24/7 Emergency Support</h3>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  For critical issues requiring immediate attention
                </p>
                <div className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-8">
                  +1 (555) 987-6543
                </div>
                <button className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-full hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 transform hover:-translate-y-1">
                  Emergency Hotline
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Section - Modern Design */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Frequently Asked Questions
                </h2>
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              </div>
              <p className="text-gray-400 text-xl max-w-3xl mx-auto">
                Everything you need to know about Valentina's services
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-gray-800/60 text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQ Grid - Modern Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
              {faqs
                .filter(faq => activeCategory === "All" || faq.category === activeCategory)
                .map((faq, index) => (
                <div key={index} className="group">
                  <div className="relative h-full">
                    {/* Gradient Border Effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${faq.gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                    
                    <div className="relative h-full bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-500">
                      <button
                        className="w-full text-left"
                        onClick={() => toggleFaq(index)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 bg-gradient-to-br ${faq.gradient} rounded-xl`}>
                              {faq.icon}
                            </div>
                            <div>
                              {faq.badge && (
                                <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
                                  {faq.badge}
                                </span>
                              )}
                              <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs font-semibold rounded-full ml-2">
                                {faq.category}
                              </span>
                            </div>
                          </div>
                          <div className={`p-2 rounded-full transition-all duration-300 ${
                            openFaq === index 
                              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 rotate-180' 
                              : 'bg-gray-800 text-gray-400 group-hover:text-white'
                          }`}>
                            <FaChevronDown />
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-3 pr-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300">
                          {faq.question}
                        </h3>
                      </button>
                      
                      <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          openFaq === index ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="pl-16">
                          <div className="h-px w-full bg-gradient-to-r from-blue-500/30 to-transparent mb-4"></div>
                          <p className="text-gray-300 leading-relaxed">
                            {faq.answer}
                          </p>
                          <div className="mt-6 flex items-center text-sm text-gray-500">
                            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-2"></div>
                            Updated recently
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover indicator */}
                      <div className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">98%</div>
                <p className="text-gray-400">Satisfaction Rate</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">24/7</div>
                <p className="text-gray-400">Support Availability</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">2min</div>
                <p className="text-gray-400">Average Response Time</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center">
                <h3 className="text-4xl font-bold text-white mb-6">Need More Help?</h3>
                <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our expert team is ready to assist you personally.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button className="group px-10 py-5 bg-white text-gray-900 font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3">
                    <FaHeadset className="group-hover:rotate-12 transition-transform duration-300" />
                    Live Chat Now
                  </button>
                  <button className="px-10 py-5 bg-transparent border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300">
                    Schedule a Call
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div>
            <h3 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Helpful Resources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Booking Guide",
                  items: [
                    "How to choose the right worker",
                    "Peak hours and best times",
                    "Cancellation policies explained"
                  ],
                  gradient: "from-blue-500 to-cyan-500",
                  icon: "📖"
                },
                {
                  title: "Safety & Security",
                  items: [
                    "Worker verification process",
                    "Payment security measures",
                    "Insurance coverage details"
                  ],
                  gradient: "from-green-500 to-emerald-500",
                  icon: "🛡️"
                },
                {
                  title: "Community",
                  items: [
                    "Customer success stories",
                    "Worker training programs",
                    "Community guidelines"
                  ],
                  gradient: "from-purple-500 to-pink-500",
                  icon: "👥"
                }
              ].map((section, index) => (
                <div key={index} className="group relative">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${section.gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                  <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all duration-500">
                    <div className="text-3xl mb-4">{section.icon}</div>
                    <h4 className="text-2xl font-bold text-white mb-6">{section.title}</h4>
                    <ul className="space-y-4">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-center text-gray-300 group-hover:text-white transition-colors duration-300">
                          <div className={`w-2 h-2 bg-gradient-to-r ${section.gradient} rounded-full mr-4`}></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button className="mt-8 w-full py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </PageLayout>
  );
}



// "use client"; // Add this directive at the top

// import PageLayout from "@/components/PageLayout";
// import { useState } from "react";
// import { 
//   FaQuestionCircle, 
//   FaPhone, 
//   FaEnvelope, 
//   FaClock, 
//   FaChevronDown,
//   FaUser,
//   FaCalendarAlt,
//   FaCreditCard,
//   FaShieldAlt,
//   FaStar,
//   FaWhatsapp
// } from "react-icons/fa";

// export default function FAQPage() {
//   const [openFaq, setOpenFaq] = useState(null);

//   const toggleFaq = (index) => {
//     setOpenFaq(openFaq === index ? null : index);
//   };

//   const faqs = [
//     {
//       question: "How do I book a worker on Valentina's?",
//       answer: "Booking a worker is simple! Just browse our available workers, select the service you need, choose your preferred date and time, and proceed to payment. You'll receive a confirmation email with all the details.",
//       icon: <FaUser className="text-blue-400" />
//     },
//     {
//       question: "What services do your workers provide?",
//       answer: "Our workers provide a wide range of services including cleaning, plumbing, electrical work, carpentry, gardening, moving assistance, painting, and home maintenance. You can filter workers by their specific skills on our website.",
//       icon: <FaCalendarAlt className="text-green-400" />
//     },
//     {
//       question: "How does payment work?",
//       answer: "We accept all major credit/debit cards, PayPal, and digital wallets. Payment is processed securely through our platform. For some services, you can pay a deposit upfront and the remainder after the job is completed to your satisfaction.",
//       icon: <FaCreditCard className="text-purple-400" />
//     },
//     {
//       question: "Can I cancel or reschedule a booking?",
//       answer: "Yes! You can cancel or reschedule up to 24 hours before the scheduled appointment without any charges. For cancellations within 24 hours, a small fee may apply. You can manage your bookings from your account dashboard.",
//       icon: <FaCalendarAlt className="text-orange-400" />
//     },
//     {
//       question: "Are your workers verified and insured?",
//       answer: "Absolutely! All workers on Valentina's go through a rigorous verification process including background checks, skill assessments, and identity verification. We also provide insurance coverage for your peace of mind.",
//       icon: <FaShieldAlt className="text-red-400" />
//     },
//     {
//       question: "How are workers rated and reviewed?",
//       answer: "After each completed job, customers are encouraged to rate and review their worker. These ratings help maintain quality standards and help other customers make informed decisions. Our top-rated workers receive special badges.",
//       icon: <FaStar className="text-yellow-400" />
//     },
//     {
//       question: "What if I'm not satisfied with the service?",
//       answer: "Customer satisfaction is our priority. If you're not happy with the service, please contact our support team within 48 hours. We'll work to resolve the issue, which may include a partial refund or sending another worker to complete the job.",
//       icon: <FaQuestionCircle className="text-teal-400" />
//     },
//     {
//       question: "Do I need to provide equipment or materials?",
//       answer: "It depends on the service. For most jobs, workers bring their own basic tools. However, for specific materials or specialized equipment, we recommend discussing this with the worker before the booking. Details are provided in the service description.",
//       icon: <FaUser className="text-indigo-400" />
//     }
//   ];

//   const supportOptions = [
//     {
//       title: "Phone Support",
//       description: "Call us for immediate assistance",
//       contact: "+1 (555) 123-4567",
//       icon: <FaPhone className="text-3xl text-blue-400" />,
//       availability: "Mon-Sun: 7AM-10PM",
//       actionText: "Call Now"
//     },
//     {
//       title: "Email Support",
//       description: "Send us an email and we'll respond within 24 hours",
//       contact: "support@valentinas.com",
//       icon: <FaEnvelope className="text-3xl text-green-400" />,
//       availability: "24/7",
//       actionText: "Send Email"
//     },
//     {
//       title: "Live Chat",
//       description: "Chat with our support team in real-time",
//       contact: "Available on website",
//       icon: <FaWhatsapp className="text-3xl text-green-400" />,
//       availability: "Mon-Fri: 9AM-6PM",
//       actionText: "Start Chat"
//     }
//   ];

//   return (
//     <PageLayout title="FAQ & Support">
//       <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
//         {/* Hero Section */}
//         <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-gray-900 text-white py-12 px-4">
//           <div className="max-w-6xl mx-auto text-center">
//             <h1 className="text-4xl md:text-5xl font-bold mb-4">How Can We Help You?</h1>
//             <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
//               Find answers to common questions or contact support anytime. We're here to make your experience with Valentina's seamless.
//             </p>
//           </div>
//         </div>

//         <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
//           {/* Support Options Section */}
//           <div className="mb-16">
//             <h2 className="text-3xl font-bold text-white mb-8 text-center">Get In Touch With Our Support Team</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
//               {supportOptions.map((option, index) => (
//                 <div key={index} className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 hover:shadow-xl hover:border-gray-600 transition-all duration-300">
//                   <div className="flex items-center mb-4">
//                     <div className="mr-4">{option.icon}</div>
//                     <h3 className="text-xl font-bold text-white">{option.title}</h3>
//                   </div>
//                   <p className="text-gray-400 mb-4">{option.description}</p>
//                   <div className="mb-4">
//                     <p className="text-lg font-semibold text-white">{option.contact}</p>
//                     <div className="flex items-center text-gray-500 mt-1">
//                       <FaClock className="mr-2" />
//                       <span>{option.availability}</span>
//                     </div>
//                   </div>
//                   <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 transform hover:-translate-y-1">
//                     {option.actionText}
//                   </button>
//                 </div>
//               ))}
//             </div>
            
//             <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-center border border-gray-700">
//               <h3 className="text-2xl font-bold text-white mb-4">Emergency Support Available 24/7</h3>
//               <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
//                 For urgent issues with ongoing bookings, call our emergency line at <span className="font-bold text-blue-400">+1 (555) 987-6543</span>. Available round the clock for your peace of mind.
//               </p>
//               <button className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 shadow-lg hover:shadow-xl">
//                 Emergency Contact
//               </button>
//             </div>
//           </div>

//           {/* FAQ Section */}
//           <div>
//             <div className="text-center mb-10">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/30 rounded-full mb-4">
//                 <FaQuestionCircle className="text-3xl text-blue-400" />
//               </div>
//               <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
//               <p className="text-gray-400 text-lg max-w-3xl mx-auto">
//                 Browse through our most commonly asked questions about booking workers, payments, cancellations, and more.
//               </p>
//             </div>

//             {/* FAQ Items - Dark version without white background */}
//             <div className="space-y-4 mb-16">
//               {faqs.map((faq, index) => (
//                 <div 
//                   key={index} 
//                   className="bg-gray-800/50 rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-lg hover:border-gray-600 transition-all duration-300 backdrop-blur-sm"
//                 >
//                   <button
//                     className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
//                     onClick={() => toggleFaq(index)}
//                   >
//                     <div className="flex items-center">
//                       <div className="mr-4">{faq.icon}</div>
//                       <h3 className="text-lg md:text-xl font-semibold text-white">{faq.question}</h3>
//                     </div>
//                     <FaChevronDown 
//                       className={`text-gray-400 transition-transform duration-300 ${openFaq === index ? 'transform rotate-180' : ''}`}
//                     />
//                   </button>
//                   <div 
//                     className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
//                       openFaq === index ? 'pb-5 max-h-96' : 'max-h-0'
//                     }`}
//                   >
//                     <div className="pl-10 border-l-2 border-blue-600/50">
//                       <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Still Have Questions Section */}
//             <div className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 rounded-2xl p-8 md:p-10 text-white text-center backdrop-blur-sm border border-gray-700">
//               <h3 className="text-2xl md:text-3xl font-bold mb-4">Still Have Questions?</h3>
//               <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
//                 Can't find the answer you're looking for? Our dedicated support team is ready to help you with any questions or concerns.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                 <button className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:-translate-y-1">
//                   Contact Support Now
//                 </button>
//                 <button className="px-8 py-3 bg-transparent border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300">
//                   Visit Help Center
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Additional Info */}
//           <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-gray-800/50 p-6 rounded-xl shadow-md border border-gray-700 backdrop-blur-sm">
//               <h4 className="text-xl font-bold text-white mb-3">Booking Tips</h4>
//               <ul className="text-gray-300 space-y-2">
//                 <li className="flex items-start">
//                   <span className="text-blue-400 mr-2">•</span>
//                   <span>Book in advance for popular time slots</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-blue-400 mr-2">•</span>
//                   <span>Check worker ratings and reviews</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-blue-400 mr-2">•</span>
//                   <span>Be specific about your requirements</span>
//                 </li>
//               </ul>
//             </div>
            
//             <div className="bg-gray-800/50 p-6 rounded-xl shadow-md border border-gray-700 backdrop-blur-sm">
//               <h4 className="text-xl font-bold text-white mb-3">Worker Safety</h4>
//               <ul className="text-gray-300 space-y-2">
//                 <li className="flex items-start">
//                   <span className="text-green-400 mr-2">•</span>
//                   <span>All workers are background-checked</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-green-400 mr-2">•</span>
//                   <span>Insurance coverage for your protection</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-green-400 mr-2">•</span>
//                   <span>Secure payment system</span>
//                 </li>
//               </ul>
//             </div>
            
//             <div className="bg-gray-800/50 p-6 rounded-xl shadow-md border border-gray-700 backdrop-blur-sm">
//               <h4 className="text-xl font-bold text-white mb-3">Quick Links</h4>
//               <ul className="text-gray-300 space-y-2">
//                 <li className="flex items-start">
//                   <span className="text-purple-400 mr-2">•</span>
//                   <a href="#" className="hover:text-blue-400 hover:underline transition-colors">Terms of Service</a>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-purple-400 mr-2">•</span>
//                   <a href="#" className="hover:text-blue-400 hover:underline transition-colors">Privacy Policy</a>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-purple-400 mr-2">•</span>
//                   <a href="#" className="hover:text-blue-400 hover:underline transition-colors">Worker Application</a>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </PageLayout>
//   );
// }





// "use client"; // Add this directive at the top

// import PageLayout from "@/components/PageLayout";
// import { useState } from "react";
// import { 
//   FaQuestionCircle, 
//   FaPhone, 
//   FaEnvelope, 
//   FaClock, 
//   FaChevronDown,
//   FaUser,
//   FaCalendarAlt,
//   FaCreditCard,
//   FaShieldAlt,
//   FaStar,
//   FaWhatsapp
// } from "react-icons/fa";

// export default function FAQPage() {
//   const [openFaq, setOpenFaq] = useState(null);

//   const toggleFaq = (index) => {
//     setOpenFaq(openFaq === index ? null : index);
//   };

//   const faqs = [
//     {
//       question: "How do I book a worker on Valentina's?",
//       answer: "Booking a worker is simple! Just browse our available workers, select the service you need, choose your preferred date and time, and proceed to payment. You'll receive a confirmation email with all the details.",
//       icon: <FaUser className="text-blue-500" />
//     },
//     {
//       question: "What services do your workers provide?",
//       answer: "Our workers provide a wide range of services including cleaning, plumbing, electrical work, carpentry, gardening, moving assistance, painting, and home maintenance. You can filter workers by their specific skills on our website.",
//       icon: <FaCalendarAlt className="text-green-500" />
//     },
//     {
//       question: "How does payment work?",
//       answer: "We accept all major credit/debit cards, PayPal, and digital wallets. Payment is processed securely through our platform. For some services, you can pay a deposit upfront and the remainder after the job is completed to your satisfaction.",
//       icon: <FaCreditCard className="text-purple-500" />
//     },
//     {
//       question: "Can I cancel or reschedule a booking?",
//       answer: "Yes! You can cancel or reschedule up to 24 hours before the scheduled appointment without any charges. For cancellations within 24 hours, a small fee may apply. You can manage your bookings from your account dashboard.",
//       icon: <FaCalendarAlt className="text-orange-500" />
//     },
//     {
//       question: "Are your workers verified and insured?",
//       answer: "Absolutely! All workers on Valentina's go through a rigorous verification process including background checks, skill assessments, and identity verification. We also provide insurance coverage for your peace of mind.",
//       icon: <FaShieldAlt className="text-red-500" />
//     },
//     {
//       question: "How are workers rated and reviewed?",
//       answer: "After each completed job, customers are encouraged to rate and review their worker. These ratings help maintain quality standards and help other customers make informed decisions. Our top-rated workers receive special badges.",
//       icon: <FaStar className="text-yellow-500" />
//     },
//     {
//       question: "What if I'm not satisfied with the service?",
//       answer: "Customer satisfaction is our priority. If you're not happy with the service, please contact our support team within 48 hours. We'll work to resolve the issue, which may include a partial refund or sending another worker to complete the job.",
//       icon: <FaQuestionCircle className="text-teal-500" />
//     },
//     {
//       question: "Do I need to provide equipment or materials?",
//       answer: "It depends on the service. For most jobs, workers bring their own basic tools. However, for specific materials or specialized equipment, we recommend discussing this with the worker before the booking. Details are provided in the service description.",
//       icon: <FaUser className="text-indigo-500" />
//     }
//   ];

//   const supportOptions = [
//     {
//       title: "Phone Support",
//       description: "Call us for immediate assistance",
//       contact: "+1 (555) 123-4567",
//       icon: <FaPhone className="text-3xl text-blue-600" />,
//       availability: "Mon-Sun: 7AM-10PM",
//       actionText: "Call Now"
//     },
//     {
//       title: "Email Support",
//       description: "Send us an email and we'll respond within 24 hours",
//       contact: "support@valentinas.com",
//       icon: <FaEnvelope className="text-3xl text-green-600" />,
//       availability: "24/7",
//       actionText: "Send Email"
//     },
//     {
//       title: "Live Chat",
//       description: "Chat with our support team in real-time",
//       contact: "Available on website",
//       icon: <FaWhatsapp className="text-3xl text-green-500" />,
//       availability: "Mon-Fri: 9AM-6PM",
//       actionText: "Start Chat"
//     }
//   ];

//   return (
//     <PageLayout title="FAQ & Support">
//       <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
//         {/* Hero Section */}
//         <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12 px-4">
//           <div className="max-w-6xl mx-auto text-center">
//             <h1 className="text-4xl md:text-5xl font-bold mb-4">How Can We Help You?</h1>
//             <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
//               Find answers to common questions or contact support anytime. We're here to make your experience with Valentina's seamless.
//             </p>
//           </div>
//         </div>

//         <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
//           {/* Support Options Section */}
//           <div className="mb-16">
//             <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Get In Touch With Our Support Team</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
//               {supportOptions.map((option, index) => (
//                 <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
//                   <div className="flex items-center mb-4">
//                     <div className="mr-4">{option.icon}</div>
//                     <h3 className="text-xl font-bold text-gray-800">{option.title}</h3>
//                   </div>
//                   <p className="text-gray-600 mb-4">{option.description}</p>
//                   <div className="mb-4">
//                     <p className="text-lg font-semibold text-gray-800">{option.contact}</p>
//                     <div className="flex items-center text-gray-500 mt-1">
//                       <FaClock className="mr-2" />
//                       <span>{option.availability}</span>
//                     </div>
//                   </div>
//                   <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1">
//                     {option.actionText}
//                   </button>
//                 </div>
//               ))}
//             </div>
            
//             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-200">
//               <h3 className="text-2xl font-bold text-gray-800 mb-4">Emergency Support Available 24/7</h3>
//               <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
//                 For urgent issues with ongoing bookings, call our emergency line at <span className="font-bold text-blue-700">+1 (555) 987-6543</span>. Available round the clock for your peace of mind.
//               </p>
//               <button className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-full hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl">
//                 Emergency Contact
//               </button>
//             </div>
//           </div>

//           {/* FAQ Section */}
//           <div>
//             <div className="text-center mb-10">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
//                 <FaQuestionCircle className="text-3xl text-blue-600" />
//               </div>
//               <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
//               <p className="text-gray-600 text-lg max-w-3xl mx-auto">
//                 Browse through our most commonly asked questions about booking workers, payments, cancellations, and more.
//               </p>
//             </div>

//             <div className="space-y-4 mb-16">
//               {faqs.map((faq, index) => (
//                 <div 
//                   key={index} 
//                   className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
//                 >
//                   <button
//                     className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
//                     onClick={() => toggleFaq(index)}
//                   >
//                     <div className="flex items-center">
//                       <div className="mr-4">{faq.icon}</div>
//                       <h3 className="text-lg md:text-xl font-semibold text-gray-800">{faq.question}</h3>
//                     </div>
//                     <FaChevronDown 
//                       className={`text-gray-500 transition-transform duration-300 ${openFaq === index ? 'transform rotate-180' : ''}`}
//                     />
//                   </button>
//                   <div 
//                     className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
//                       openFaq === index ? 'pb-5 max-h-96' : 'max-h-0'
//                     }`}
//                   >
//                     <div className="pl-10 border-l-2 border-blue-200">
//                       <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Still Have Questions Section */}
//             <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-10 text-white text-center">
//               <h3 className="text-2xl md:text-3xl font-bold mb-4">Still Have Questions?</h3>
//               <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
//                 Can't find the answer you're looking for? Our dedicated support team is ready to help you with any questions or concerns.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                 <button className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1">
//                   Contact Support Now
//                 </button>
//                 <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-700 transition-all duration-300">
//                   Visit Help Center
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Additional Info */}
//           <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
//               <h4 className="text-xl font-bold text-gray-800 mb-3">Booking Tips</h4>
//               <ul className="text-gray-700 space-y-2">
//                 <li className="flex items-start">
//                   <span className="text-blue-500 mr-2">•</span>
//                   <span>Book in advance for popular time slots</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-blue-500 mr-2">•</span>
//                   <span>Check worker ratings and reviews</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-blue-500 mr-2">•</span>
//                   <span>Be specific about your requirements</span>
//                 </li>
//               </ul>
//             </div>
            
//             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
//               <h4 className="text-xl font-bold text-gray-800 mb-3">Worker Safety</h4>
//               <ul className="text-gray-700 space-y-2">
//                 <li className="flex items-start">
//                   <span className="text-green-500 mr-2">•</span>
//                   <span>All workers are background-checked</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-green-500 mr-2">•</span>
//                   <span>Insurance coverage for your protection</span>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-green-500 mr-2">•</span>
//                   <span>Secure payment system</span>
//                 </li>
//               </ul>
//             </div>
            
//             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
//               <h4 className="text-xl font-bold text-gray-800 mb-3">Quick Links</h4>
//               <ul className="text-gray-700 space-y-2">
//                 <li className="flex items-start">
//                   <span className="text-purple-500 mr-2">•</span>
//                   <a href="#" className="hover:text-blue-600 hover:underline">Terms of Service</a>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-purple-500 mr-2">•</span>
//                   <a href="#" className="hover:text-blue-600 hover:underline">Privacy Policy</a>
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-purple-500 mr-2">•</span>
//                   <a href="#" className="hover:text-blue-600 hover:underline">Worker Application</a>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </PageLayout>
//   );
// }