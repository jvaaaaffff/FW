import React, { useEffect, useState } from 'react';

const OfflineLoader: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-45 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3 bg-white rounded-lg p-5 shadow-xl">
        <div className="relative w-14 h-14 rounded-lg">
          <div className="absolute w-1 h-3 bg-gray-500 rounded-full left-1/2 top-1/4 opacity-0 shadow-sm animate-pulse"
            style={{ transform: 'rotate(0deg) translate(0, -130%)', animationDelay: '0s' }} />
          <div className="absolute w-1 h-3 bg-gray-500 rounded-full left-1/2 top-1/4 opacity-0 shadow-sm animate-pulse"
            style={{ transform: 'rotate(30deg) translate(0, -130%)', animationDelay: '-1.1s' }} />
          <div className="absolute w-1 h-3 bg-gray-500 rounded-full left-1/2 top-1/4 opacity-0 shadow-sm animate-pulse"
            style={{ transform: 'rotate(60deg) translate(0, -130%)', animationDelay: '-1s' }} />
          <div className="absolute w-1 h-3 bg-gray-500 rounded-full left-1/2 top-1/4 opacity-0 shadow-sm animate-pulse"
            style={{ transform: 'rotate(90deg) translate(0, -130%)', animationDelay: '-0.9s' }} />
          <div className="absolute w-1 h-3 bg-gray-500 rounded-full left-1/2 top-1/4 opacity-0 shadow-sm animate-pulse"
            style={{ transform: 'rotate(120deg) translate(0, -130%)', animationDelay: '-0.8s' }} />
          <div className="absolute w-1 h-3 bg-gray-500 rounded-full left-1/2 top-1/4 opacity-0 shadow-sm animate-pulse"
            style={{ transform: 'rotate(150deg) translate(0, -130%)', animationDelay: '-0.7s' }} />
          <div className="absolute w-1 h-3 bg-gray-500 rounded-full left-1/2 top-1/4 opacity-0 shadow-sm animate-pulse"
            style={{ transform: 'rotate(180deg) translate(0, -130%)', animationDelay: '-0.6s' }} />
          <div className="absolute w-1 h-3 bg-gray-500 rounded-full left-1/2 top-1/4 opacity-0 shadow-sm animate-pulse"
            style={{ transform: 'rotate(210deg) translate(0, -130%)', animationDelay: '-0.5s' }} />
          <div className="absolute w-1 h-3 bg-gray-500 rounded-full left-1/2 top-1/4 opacity-0 shadow-sm animate-pulse"
            style={{ transform: 'rotate(240deg) translate(0, -130%)', animationDelay: '-0.4s' }} />
          <div className="absolute w-1 h-3 bg-gray-500 rounded-full left-1/2 top-1/4 opacity-0 shadow-sm animate-pulse"
            style={{ transform: 'rotate(270deg) translate(0, -130%)', animationDelay: '-0.3s' }} />
          <div className="absolute w-1 h-3 bg-gray-500 rounded-full left-1/2 top-1/4 opacity-0 shadow-sm animate-pulse"
            style={{ transform: 'rotate(300deg) translate(0, -130%)', animationDelay: '-0.2s' }} />
          <div className="absolute w-1 h-3 bg-gray-500 rounded-full left-1/2 top-1/4 opacity-0 shadow-sm animate-pulse"
            style={{ transform: 'rotate(330deg) translate(0, -130%)', animationDelay: '-0.1s' }} />
        </div>
        <div className="text-sm font-semibold text-gray-700">
          Connection lost. Trying to reconnect...
        </div>
      </div>
    </div>
  );
};

export { OfflineLoader };
