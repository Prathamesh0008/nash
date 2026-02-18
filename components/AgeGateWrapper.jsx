// components/AgeGateWrapper.jsx
"use client";

import { useState, useEffect } from 'react';
import AgeVerificationPopup from './AgeVerificationPopup';

export default function AgeGateWrapper({ children }) {
  const [isVerified, setIsVerified] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasAccepted = localStorage.getItem('age-verified');
      setIsVerified(!!hasAccepted);
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleVerified = () => {
    setIsVerified(true);
  };

  // Show loading state
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Show popup if not verified */}
      {!isVerified && <AgeVerificationPopup onVerified={handleVerified} />}
      
      {/* Main content - remove blur when verified */}
      <div className={`transition-all duration-500 ${!isVerified ? "blur-sm opacity-50 pointer-events-none" : "blur-0 opacity-100"}`}>
        {children}
      </div>
      
      {/* Optional overlay to prevent interaction when not verified */}
      {!isVerified && (
        <div className="fixed inset-0 z-[9998] bg-black/20 pointer-events-none" />
      )}
    </>
  );
}
