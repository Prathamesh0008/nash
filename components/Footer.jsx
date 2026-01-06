// components/Footer.jsx
"use client"
import { Shield, Lock, CreditCard, Heart, Diamond } from 'lucide-react'

export default function Footer() {
  // Simple Upgrade Button Component
  const UpgradeButton = () => (
    <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition duration-300">
      <Diamond className="h-5 w-5" />
      <span>Upgrade Now</span>
    </button>
  )

  // Clean Security Features Component
  const SecurityFeatures = () => (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { icon: Shield, title: "Secure", desc: "Military-grade encryption", color: "green" },
        { icon: Lock, title: "Private", desc: "Zero-knowledge protocol", color: "blue" },
        { icon: CreditCard, title: "Safe", desc: "PCI-DSS compliant", color: "purple" }
      ].map((feature) => (
        <div key={feature.title} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className={`p-3 rounded-full bg-${feature.color}-900/30 border border-${feature.color}-700`}>
              <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
            </div>
            <div>
              <h4 className={`font-semibold text-${feature.color}-300`}>{feature.title}</h4>
              <p className="text-sm text-gray-400 mt-1">{feature.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Footer Links Section
  const FooterLinks = ({ title, links, gradient = "from-pink-500 to-blue-500" }) => (
    <div>
      <h3 className="font-semibold text-lg mb-4 text-white">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link}>
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors duration-200 block py-1"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Company Info & Security Features */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
            <div className="space-y-4 max-w-md">
              <div className="text-2xl font-bold text-white">
                Elite Companions
              </div>
              <p className="text-gray-400 leading-relaxed">
                Premium adult entertainment platform connecting verified models with users worldwide.
              </p>
            </div>
            <div className="md:text-right">
              <UpgradeButton />
            </div>
          </div>
          
          <SecurityFeatures />
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <FooterLinks
            title="Quick Links"
            links={['Home', 'Models Directory', 'Top Ranking', 'New Models', 'Online Now']}
          />
          
          <FooterLinks
            title="For Models"
            links={['Join Our Platform', 'Ranking System', 'Earning Calculator', 'Safety Guidelines', 'FAQ & Support']}
            gradient="from-purple-500 to-pink-500"
          />
          
          <FooterLinks
            title="Legal & Support"
            links={['Terms of Service', 'Privacy Policy', 'Payment Methods', 'Contact Support', 'DMCA & Compliance']}
            gradient="from-blue-500 to-purple-500"
          />
          
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Contact</h3>
            <div className="space-y-3 text-gray-400">
              <p>support@elitecompanions.com</p>
              <p>24/7 Customer Support</p>
              <div className="pt-2">
                <span className="text-red-400 text-sm bg-red-400/10 px-3 py-1 rounded-full inline-flex items-center">
                  <Heart className="h-3 w-3 mr-2" /> 
                  18+ ADULTS ONLY
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © 2024 Elite Companions. All rights reserved.
            </div>
            
            <div className="text-sm text-gray-500 text-center">
              <p>Strictly for adults 18+. All models are 18+ and verified.</p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}