import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-7xl mx-auto bg-brand-card border border-brand-border shadow-2xl rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
            <button 
              onClick={handleReject}
              className="absolute top-4 right-4 text-brand-muted hover:text-brand-text sm:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex-1 pr-8 sm:pr-0">
              <h3 className="text-lg font-serif font-bold text-brand-text mb-2">We value your privacy</h3>
              <p className="text-sm text-brand-muted">
                We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={handleReject}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-brand-border text-brand-text font-medium hover:bg-brand-bg transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-brand-text text-brand-bg font-medium hover:bg-brand-muted transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
