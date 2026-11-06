import React from 'react';

/**
 * Custom Animated Grander Belt Preloader
 * Features a continuous industrial drive belt looping over two rotating pulleys
 * Clockwise rotation: drives smoothly from the smallest wheel to the largest wheel.
 */
export const GranderBeltPreloader = ({ 
  size = 'md', 
  text = '', 
  className = '',
  showLabel = true 
}) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';
  const isXLarge = size === 'xl';

  // Dimensions
  const width = isSmall ? 90 : isXLarge ? 300 : isLarge ? 240 : 150;
  const height = isSmall ? 45 : isXLarge ? 128 : isLarge ? 104 : 65;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 select-none ${className}`}>
      <style>{`
        @keyframes granderBeltMoveCW {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -40; }
        }
        @keyframes granderPulleyCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes granderPulleyFastCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(720deg); }
        }
        .animate-grander-belt {
          stroke-dasharray: 6, 4;
          animation: granderBeltMoveCW 0.45s linear infinite;
        }
        .animate-grander-small-wheel {
          transform-origin: 36px 30px;
          animation: granderPulleyFastCW 1.4s linear infinite;
        }
        .animate-grander-large-wheel {
          transform-origin: 104px 30px;
          animation: granderPulleyCW 1.4s linear infinite;
        }
      `}</style>

      <div className="relative inline-flex items-center justify-center filter drop-shadow-md">
        <svg
          width={width}
          height={height}
          viewBox="0 0 140 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible max-w-full h-auto"
        >
          {/* Defs for gradients & metal sheens */}
          <defs>
            <linearGradient id="pulleyMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <linearGradient id="beltRubber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <radialGradient id="sparks" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FACC15" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Belt Outer Path (Connecting Small Left Spindle & Large Right Driven Wheel) */}
          {/* Small pulley at (36, 30) r=11, Large pulley at (104, 30) r=19 */}
          <path
            d="M 36 19 
               L 104 11 
               A 19 19 0 0 1 104 49 
               L 36 41 
               A 11 11 0 0 1 36 19 Z"
            fill="none"
            stroke="#0F172A"
            strokeWidth={isSmall ? 4 : isXLarge ? 6 : 5.5}
            strokeLinejoin="round"
          />

          {/* High-Visibility Animated Grander Belt Teeth / Ribs (Moving Clockwise Small -> Large) */}
          <path
            d="M 36 19 
               L 104 11 
               A 19 19 0 0 1 104 49 
               L 36 41 
               A 11 11 0 0 1 36 19 Z"
            fill="none"
            stroke="#FACC15"
            strokeWidth={isSmall ? 2 : isXLarge ? 3.2 : 2.8}
            strokeLinecap="round"
            className="animate-grander-belt"
          />

          {/* Small Wheel (Left, Ø22mm, High RPM Spindle - Clockwise) */}
          <g className="animate-grander-small-wheel">
            {/* Outer Rim */}
            <circle cx="36" cy="30" r="11" fill="url(#pulleyMetal)" stroke="#1E293B" strokeWidth="2" />
            <circle cx="36" cy="30" r="7.5" fill="#2563EB" />
            {/* 4 Cross Spokes */}
            <line x1="36" y1="19" x2="36" y2="41" stroke="#E2E8F0" strokeWidth="1.8" />
            <line x1="26" y1="30" x2="46" y2="30" stroke="#E2E8F0" strokeWidth="1.8" />
            {/* Center Shaft */}
            <circle cx="36" cy="30" r="4" fill="#0F172A" stroke="#FACC15" strokeWidth="1" />
          </g>

          {/* Large Wheel (Right, Ø38mm Driven Wheel - Clockwise) */}
          <g className="animate-grander-large-wheel">
            {/* Outer Rim */}
            <circle cx="104" cy="30" r="19" fill="url(#pulleyMetal)" stroke="#1E293B" strokeWidth="2.5" />
            <circle cx="104" cy="30" r="14" fill="#1D4ED8" />
            {/* 4 Pulley Spokes */}
            <line x1="104" y1="11" x2="104" y2="49" stroke="#93C5FD" strokeWidth="2" />
            <line x1="85" y1="30" x2="123" y2="30" stroke="#93C5FD" strokeWidth="2" />
            {/* Center Bearing Hub */}
            <circle cx="104" cy="30" r="6" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.5" />
            <circle cx="104" cy="30" r="2.5" fill="#FACC15" />
          </g>

          {/* Contact Spark Glow at Spindle */}
          <circle cx="26" cy="30" r="6" fill="url(#sparks)" className="animate-ping opacity-60" />
        </svg>
      </div>

      {/* Descriptive Text */}
      {!isSmall && showLabel && (
        <div className="text-center">
          <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-primary flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            GRANDER BELT DRIVE
          </p>
          {(isLarge || isXLarge) && text && (
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{text}</p>
          )}
        </div>
      )}
    </div>
  );
};
