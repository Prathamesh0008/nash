// components/Footer.jsx
"use client"
import { Shield, Lock, CreditCard, Heart, Diamond } from 'lucide-react'

export default function Footer() {
  // Enhanced Upgrade Button Component
  const UpgradeButton = () => (
    <div className="p-0.5 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 shadow-lg hover:shadow-xl transition duration-300 hover:scale-105 active:scale-95">
      <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-dark-100 text-white font-semibold rounded-full hover:bg-dark-50 transition duration-300 w-full">
        <Diamond className="h-5 w-5 text-pink-400" />
        <span>Upgrade Now</span>
      </button>
    </div>
  )

  const SecurityFeatures = () => (
    <div className="relative pt-8">
      {/* Floating particles background */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              i % 3 === 0 ? 'bg-pink-500/30' : i % 3 === 1 ? 'bg-blue-500/30' : 'bg-purple-500/30'
            }`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main container with sci-fi effect */}
      <div className="relative grid grid-cols-3 gap-3 md:gap-6">
        {/* Secure Feature */}
        <div className="group relative">
          {/* Outer glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-700"></div>
          
          {/* Main card */}
          <div className="relative bg-gradient-to-br from-dark-200/90 to-dark-300/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-green-500/20 group-hover:border-green-400/40 transition-all duration-500 overflow-hidden">
            
            {/* Animated circuit lines */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-green-400"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-green-400"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-green-400"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-green-400"></div>
              <div className="absolute top-1/2 left-2 w-8 h-px bg-gradient-to-r from-green-400 to-transparent"></div>
              <div className="absolute top-1/2 right-2 w-8 h-px bg-gradient-to-l from-green-400 to-transparent"></div>
            </div>

            {/* Icon hologram effect */}
            <div className="relative flex justify-center mb-4 md:mb-6">
              <div className="relative">
                {/* Hologram base */}
                <div className="absolute -inset-4 bg-gradient-to-b from-green-500/20 to-transparent rounded-full blur-xl"></div>
                {/* Hologram rings */}
                <div className="absolute -inset-3 border-2 border-green-400/30 rounded-full animate-ping"></div>
                <div className="absolute -inset-2 border-2 border-emerald-400/20 rounded-full animate-ping animation-delay-700"></div>
                
                {/* Main icon with glow */}
                <div className="relative bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-3 md:p-4 rounded-full border border-green-500/30 shadow-2xl shadow-green-500/20 group-hover:shadow-green-400/30 transition-all duration-500">
                  <Shield className="h-6 w-6 md:h-8 md:w-8 text-green-300 drop-shadow-lg" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative text-center space-y-2">
              <div className="relative inline-block">
                <h4 className="text-lg md:text-xl font-bold bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                  Secure
                </h4>
                {/* Underline effect */}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 group-hover:w-full transition-all duration-500"></div>
              </div>
              <p className="text-xs md:text-sm text-gray-300 font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                Military-grade encryption
              </p>
            </div>

            {/* Tech badge */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <span className="text-[10px] font-mono text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                AES-256
              </span>
            </div>
          </div>
        </div>

        {/* Private Feature */}
        <div className="group relative">
          {/* Outer glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-700"></div>
          
          {/* Main card */}
          <div className="relative bg-gradient-to-br from-dark-200/90 to-dark-300/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-blue-500/20 group-hover:border-blue-400/40 transition-all duration-500 overflow-hidden">
            
            {/* Digital rain effect */}
            <div className="absolute inset-0 opacity-[0.03] overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-4 w-px bg-gradient-to-b from-blue-400 to-transparent"
                  style={{
                    left: `${(i / 20) * 100}%`,
                    top: `-${Math.random() * 20}px`,
                    animation: `rain ${1 + Math.random()}s linear infinite`,
                    animationDelay: `${Math.random()}s`
                  }}
                />
              ))}
            </div>

            {/* Icon with morphing effect */}
            <div className="relative flex justify-center mb-4 md:mb-6">
              <div className="relative group-hover:animate-pulse">
                {/* Hologram base */}
                <div className="absolute -inset-4 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-xl"></div>
                
                {/* Main icon with floating effect */}
                <div className="relative bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-3 md:p-4 rounded-full border border-blue-500/30 shadow-2xl shadow-blue-500/20 group-hover:shadow-blue-400/30 transition-all duration-500 group-hover:-translate-y-1">
                  <Lock className="h-6 w-6 md:h-8 md:w-8 text-blue-300 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative text-center space-y-2">
              <div className="relative inline-block">
                <h4 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                  Private
                </h4>
                {/* Underline effect */}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 group-hover:w-full transition-all duration-500"></div>
              </div>
              <p className="text-xs md:text-sm text-gray-300 font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                Zero-knowledge protocol
              </p>
            </div>

            {/* Tech badge */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <span className="text-[10px] font-mono text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full">
                E2EE
              </span>
            </div>
          </div>
        </div>

        {/* Safe Feature */}
        <div className="group relative">
          {/* Outer glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-700"></div>
          
          {/* Main card */}
          <div className="relative bg-gradient-to-br from-dark-200/90 to-dark-300/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-purple-500/20 group-hover:border-purple-400/40 transition-all duration-500 overflow-hidden">
            
            {/* Particle wave effect */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-purple-400"
                  style={{
                    left: `${(i / 8) * 100}%`,
                    top: '50%',
                    animation: `wave 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`
                  }}
                />
              ))}
            </div>

            {/* Icon with rotation effect */}
            <div className="relative flex justify-center mb-4 md:mb-6">
              <div className="relative">
                {/* Hologram base */}
                <div className="absolute -inset-4 bg-gradient-to-b from-purple-500/20 to-transparent rounded-full blur-xl"></div>
                
                {/* Main icon with orbiting effect */}
                <div className="relative bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-3 md:p-4 rounded-full border border-purple-500/30 shadow-2xl shadow-purple-500/20 group-hover:shadow-purple-400/30 transition-all duration-500">
                  <div className="relative group-hover:rotate-180 transition-transform duration-700">
                    <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-purple-300 drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Orbiting dots */}
                <div className="absolute -inset-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-pink-400"
                      style={{
                        transform: `rotate(${i * 60}deg) translateX(12px)`,
                        animation: `orbit 3s linear infinite`,
                        animationDelay: `${i * 0.5}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative text-center space-y-2">
              <div className="relative inline-block">
                <h4 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                  Safe
                </h4>
                {/* Underline effect */}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 group-hover:w-full transition-all duration-500"></div>
              </div>
              <p className="text-xs md:text-sm text-gray-300 font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                PCI-DSS compliant
              </p>
            </div>

            {/* Tech badge */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <span className="text-[10px] font-mono text-purple-400 bg-purple-900/30 px-2 py-1 rounded-full">
                PCI-DSS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
       @keyframes float {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25% { transform: translateY(-3px) translateX(2px); }
  50% { transform: translateY(-5px) translateX(-2px); }
  75% { transform: translateY(-2px) translateX(1px); }
}

@keyframes rain {
  0% { transform: translateY(-20px); opacity: 1; }
  100% { transform: translateY(100px); opacity: 0; }
}

@keyframes wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes orbit {
  0% { transform: rotate(0deg) translateX(12px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(12px) rotate(-360deg); }
}

.animation-delay-700 {
  animation-delay: 700ms;
}
      `}</style>
    </div>
  )

  return (
    <footer className="bg-dark-100 border-t border-white/10 relative overflow-hidden">
      {/* Background gradient accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-blue-500 opacity-80"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-pink-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Upgrade CTA Section */}
        

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                Elite Companions
              </div>
              <p className="text-gray-400 leading-relaxed">
                Premium adult entertainment platform connecting verified models with users worldwide.
              </p>
            </div>
            
            <SecurityFeatures />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 pb-3 border-b border-white/10 text-white flex items-center">
              <span className="h-1 w-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full mr-3"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {['Home', 'Models Directory', 'Top Ranking', 'New Models', 'Online Now'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:pl-3 group flex items-center"
                  >
                    <span className="h-1 w-1 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 mr-2 transition-opacity"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Models */}
          <div>
            <h3 className="font-bold text-lg mb-6 pb-3 border-b border-white/10 text-white flex items-center">
              <span className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></span>
              For Models
            </h3>
            <ul className="space-y-3">
              {[
                'Join Our Platform',
                'Ranking System', 
                'Earning Calculator',
                'Safety Guidelines',
                'FAQ & Support'
              ].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:pl-3 group flex items-center"
                  >
                    <span className="h-1 w-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 mr-2 transition-opacity"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="font-bold text-lg mb-6 pb-3 border-b border-white/10 text-white flex items-center">
              <span className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></span>
              Legal & Support
            </h3>
            <ul className="space-y-3">
              {[
                'Terms of Service',
                'Privacy Policy', 
                'Payment Methods',
                'Contact Support',
                'DMCA & Compliance'
              ].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:pl-3 group flex items-center"
                  >
                    <span className="h-1 w-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 mr-2 transition-opacity"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="text-gray-400 text-sm flex items-center">
                © 2024 Elite Companions
                <span className="mx-3 hidden sm:inline">•</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-red-400 flex items-center text-sm bg-red-400/10 px-3 py-1 rounded-full">
                  <Heart className="h-3 w-3 mr-2" /> 
                  18+ ADULTS ONLY
                </span>
                <span className="text-gray-400 text-sm hidden sm:block">
                  All rights reserved
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-400 text-center lg:text-right">
                Strictly for adults 18+. All models are 18+ and verified.
              </div>
              <div className="hidden lg:block">
                <UpgradeButton />
              </div>
            </div>
          </div>
          
          {/* Mobile Upgrade Button */}
          <div className="mt-8 lg:hidden">
            <UpgradeButton />
          </div>
        </div>
      </div>
    </footer>
  )
}