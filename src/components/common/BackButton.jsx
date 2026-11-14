import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Universal Back Button component for all pages
 * - Can be used inline: <BackButton inline /> or <BackButton inline label="Back to Products" fallbackPath="/services" />
 * - Can be used as a persistent floating button on all non-home pages
 */
export const BackButton = ({
  inline = false,
  label = 'Back',
  fallbackPath = '/',
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = (e) => {
    e.preventDefault();
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  // If used inline inside a page header/banner
  if (inline) {
    return (
      <button
        type="button"
        onClick={handleBack}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 hover:text-primary font-black text-xs shadow-sm border border-slate-200 transition-all hover:shadow hover:scale-[1.02] active:scale-95 cursor-pointer select-none group ${className}`}
        title="Go back to previous page"
      >
        <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
        <span>{label}</span>
      </button>
    );
  }

  // Floating Back Button: Appears on every page except home ('/')
  if (location.pathname === '/') {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 select-none print:hidden">
      <button
        type="button"
        onClick={handleBack}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 hover:bg-blue-700 text-white font-black text-xs shadow-2xl border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer group ${className}`}
        title="Go back to previous page"
        aria-label="Go back to previous page"
      >
        <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 text-amber-300 group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span className="tracking-wide">Back</span>
      </button>
    </div>
  );
};

export default BackButton;
