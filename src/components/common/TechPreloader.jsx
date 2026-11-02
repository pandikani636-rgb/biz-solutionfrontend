import React, { useState, useEffect } from 'react';
import { GranderBeltPreloader } from './GranderBeltPreloader';

export const TechPreloader = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Prevent background scrolling while preloader is active
    document.body.style.overflow = 'hidden';

    // Smooth display duration (2.2 seconds) before auto-dismissing to reveal the page
    const totalDuration = 2200;

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsDismissed(true);
        if (onFinish) onFinish();
      }, 500);
    }, totalDuration);

    return () => {
      clearTimeout(exitTimer);
      document.body.style.overflow = '';
    };
  }, [onFinish]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsDismissed(true);
      if (onFinish) onFinish();
    }, 300);
  };

  if (isDismissed) return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-gradient-to-b from-[#F8FAFC] via-[#FFFFFF] to-[#EFF6FF] select-none transition-all duration-500 ease-out cursor-pointer ${
        isExiting ? 'opacity-0 scale-[0.98] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      title="Click to continue"
    >
      {/* Light subtle atmospheric background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ONLY the Grander Belt Drive Card as requested in user's uploaded image */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 bg-[#F0F6FF]/95 backdrop-blur-md border border-blue-100 shadow-[0_20px_50px_-12px_rgba(30,58,138,0.12)] rounded-3xl p-6 sm:p-9 flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.01]"
      >
        <GranderBeltPreloader size="xl" showLabel={true} />
      </div>
    </div>
  );
};
