import React from 'react';

/**
 * Custom Animated Grander Belt Preloader
 * Features a high-speed continuous industrial drive belt looping over two rotating pulleys
 * with dynamic cogged ribs and synchronized rotation.
 */
export const GranderBeltPreloader = ({ size = 'md', text = 'Synchronizing...', className = '' }) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  // Dimensions
  const width = isSmall ? 80 : isLarge ? 180 : 130;
  const height = isSmall ? 40 : isLarge ? 85 : 60;

  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 select-none ${className}`}>
      <style>{`
        @keyframes granderBeltMove {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -40; }
        }
        @keyframes granderPulleyCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes granderPulleyFast {
          from { transform: rotate(0deg); }
          to { transform: rotate(720deg); }
        }
        .animate-grander-belt {
          stroke-dasharray: 6, 4;
          animation: granderBeltMove 0.45s linear infinite;
        }
        .animate-grander-drive {
          transform-origin: 32px 30px;
          animation: granderPulleyCW 1.4s linear infinite;
        }
        .animate-grander-spindle {
          transform-origin: 104px 30px;
          animation: granderPulleyFast 1.4s linear infinite;
        }
      `}</style>

      <div className="relative inline-flex items-center justify-center filter drop-shadow-md">
        <svg
          width={width}
          height={height}
          viewBox="0 0 140 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* Defs for gradients & metal sheens */}
          <defs>
            <linearGradient id="pulleyMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <linearGradient id="beltRubber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <radialGradient id="sparks" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FACC15" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Belt Outer Path (Connecting Left Drive Pulley & Right Spindle Pulley) */}
          {/* Left pulley at (32, 30) r=20, Right pulley at (104, 30) r=12 */}
          <path
            d="M 32 10 
               L 104 18 
               A 12 12 0 0 1 104 42 
               L 32 50 
               A 20 20 0 0 1 32 10 Z"
            fill="none"
            stroke="#0F172A"
            strokeWidth={isSmall ? 4 : 5.5}
            strokeLinejoin="round"
          />

          {/* High-Visibility Animated Grander Belt Teeth / Ribs */}
          <path
            d="M 32 10 
               L 104 18 
               A 12 12 0 0 1 104 42 
               L 32 50 
               A 20 20 0 0 1 32 10 Z"
            fill="none"
            stroke="#FACC15"
            strokeWidth={isSmall ? 2 : 2.8}
            strokeLinecap="round"
            className="animate-grander-belt"
          />

          {/* Drive Pulley (Left, Larger Ø40mm) */}
          <g className="animate-grander-drive">
            {/* Outer Rim */}
            <circle cx="32" cy="30" r="19" fill="url(#pulleyMetal)" stroke="#1E293B" strokeWidth="2.5" />
            <circle cx="32" cy="30" r="14" fill="#1E3A8A" />
            {/* 4 Pulley Spokes */}
            <line x1="32" y1="11" x2="32" y2="49" stroke="#93C5FD" strokeWidth="2" />
            <line x1="13" y1="30" x2="51" y2="30" stroke="#93C5FD" strokeWidth="2" />
            {/* Center Bearing Hub */}
            <circle cx="32" cy="30" r="6" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.5" />
            <circle cx="32" cy="30" r="2.5" fill="#FACC15" />
          </g>

          {/* Grinder Spindle Pulley (Right, Smaller Ø24mm, High RPM) */}
          <g className="animate-grander-spindle">
            {/* Outer Rim */}
            <circle cx="104" cy="30" r="11" fill="url(#pulleyMetal)" stroke="#1E293B" strokeWidth="2" />
            <circle cx="104" cy="30" r="7.5" fill="#2563EB" />
            {/* 3 Cross Spokes */}
            <line x1="104" y1="19" x2="104" y2="41" stroke="#E2E8F0" strokeWidth="1.8" />
            <line x1="94" y1="30" x2="114" y2="30" stroke="#E2E8F0" strokeWidth="1.8" />
            {/* Center Shaft */}
            <circle cx="104" cy="30" r="4" fill="#0F172A" stroke="#FACC15" strokeWidth="1" />
          </g>

          {/* Grinder Contact Spark Glow at Spindle */}
          <circle cx="116" cy="30" r="7" fill="url(#sparks)" className="animate-ping opacity-60" />
        </svg>
      </div>

      {/* Descriptive Text for Large & Medium views */}
      {!isSmall && (
        <div className="text-center">
          <p className="text-[11px] font-black uppercase tracking-wider text-navy flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Grander Belt Drive
          </p>
          {isLarge && text && (
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{text}</p>
          )}
        </div>
      )}
    </div>
  );
};
