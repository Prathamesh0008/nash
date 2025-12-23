// components/AgeVerificationPopup.jsx
"use client";

import { useState, useEffect } from 'react';
import { X, Shield, AlertCircle, Check, Lock, ChevronDown } from 'lucide-react';

export default function AgeVerificationPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('age-verified');
    
    if (!hasAccepted) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsLoading(false);
        document.body.style.overflow = 'hidden';
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleAcceptToggle = () => {
    setIsAccepted(!isAccepted);
  };

 // In AgeVerificationPopup.jsx, modify the handleConfirmEnter function:
const handleConfirmEnter = () => {
  if (!isAccepted) return;
  
  setShowSuccess(true);
  setTimeout(() => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem('age-verified', 'true');
      setIsVisible(false);
      document.body.style.overflow = 'auto';
      
      // Force page refresh to clear blur
      window.location.reload();
      
      setTimeout(() => {
        setShowScrollHint(true);
        setTimeout(() => setShowScrollHint(false), 5000);
      }, 1000);
    }, 500);
  }, 1000);
};

  const handleDecline = () => {
    setIsExiting(true);
    setTimeout(() => {
      window.location.href = 'https://www.google.com';
    }, 400);
  };

  useEffect(() => {
    if (showScrollHint) {
      const handleScroll = () => setShowScrollHint(false);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [showScrollHint]);

  if (isLoading || !isVisible) return null;

  return (
    <>
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-500 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/30 to-pink-950/20" />
        
        {/* Modal */}
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-pink-600/20 to-purple-600/20 border border-pink-500/30">
                    <Shield className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                      Age Verification
                    </h2>
                    <p className="text-sm text-white/60">Required Entry</p>
                  </div>
                </div>
                <button
                  onClick={handleDecline}
                  className="p-2 rounded-xl hover:bg-white/10 transition-all duration-300"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white/70 hover:text-white hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Age Badge */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 mb-3">
                  <span className="text-3xl font-bold text-white">18+</span>
                  <div className="absolute -top-2 -right-2">
                    <div className="p-1 rounded-full bg-red-500 border-2 border-black">
                      <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <Lock className="w-3 h-3 text-white/60" />
                  <span className="text-sm text-white/80">Restricted Access</span>
                </div>
              </div>

              {/* Acceptance Switch - Simplified */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
                      isAccepted ? 'bg-gradient-to-r from-emerald-500 to-green-500 justify-end' : 'bg-gray-700 justify-start'
                    }`}
                    onClick={handleAcceptToggle}>
                      <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-300 ${
                        isAccepted ? 'translate-x-0' : 'translate-x-0'
                      }`} />
                    </div>
                    <span className="text-white/90 font-medium">I am 18+</span>
                  </div>
                  <Check className={`w-5 h-5 transition-all duration-300 ${
                    isAccepted ? 'text-emerald-400 opacity-100' : 'text-white/20 opacity-0'
                  }`} />
                </div>

                {/* Terms Confirmation */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <button
                    onClick={handleAcceptToggle}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 mt-0.5 ${
                      isAccepted 
                        ? 'bg-gradient-to-br from-pink-600 to-purple-600 border-transparent' 
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    {isAccepted && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className="text-sm text-white/80">
                    I confirm I'm 18+ and accept the <button className="text-pink-400 hover:text-pink-300">Terms</button> & <button className="text-pink-400 hover:text-pink-300">Privacy Policy</button>
                  </span>
                </div>
              </div>

              {/* Success State */}
              {showSuccess ? (
                <div className="text-center py-4 animate-pulse">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-1">Access Granted!</h3>
                  <p className="text-white/70 text-sm">Welcome, enter at your own discretion</p>
                </div>
              ) : (
                /* Action Buttons */
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDecline}
                    className="p-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    <span className="text-white/90">I Decline</span>
                  </button>
                  
                  <button
                    onClick={handleConfirmEnter}
                    disabled={!isAccepted}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      isAccepted 
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500' 
                        : 'bg-white/5 border border-white/20 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-white font-medium">
                      {isAccepted ? 'Enter Site' : 'Accept First'}
                    </span>
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-white/40 text-center">
                  Your choice will be remembered via cookies
                </p>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-xs">
            <Shield className="w-3 h-3" />
            <span>Secure • Encrypted</span>
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      {showScrollHint && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[10000] animate-bounce">
          <div className="flex flex-col items-center gap-1">
            <div className="text-white/60 text-xs">Scroll to explore</div>
            <ChevronDown className="w-4 h-4 text-white/40 animate-pulse" />
          </div>
        </div>
      )}
    </>
  );
}