import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { contentService } from '../../services/contentService';

export const AdvertisementModal = () => {
  const [ad, setAd] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAd = async () => {
      try {
        const res = await contentService.getActiveAdvertisement();
        if (isMounted && res.success && res.data && res.data.isActive) {
          setAd(res.data);
          // Show popup automatically after a smooth 1-second delay when website opens
          const timer = setTimeout(() => {
            if (isMounted) setIsOpen(true);
          }, 1000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.warn('[Ad Popup Load Notice]', err?.message || err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAd();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen || !ad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg overflow-hidden bg-white border border-slate-200/80 rounded-3xl shadow-2xl animate-scaleUp text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition-all shadow-md focus:outline-none"
          aria-label="Close advertisement"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ad Image Header */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-900 overflow-hidden">
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              e.target.src = '/banners/img2.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          {/* Badge */}
          {ad.badgeText && (
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                {ad.badgeText}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-4">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {ad.title}
          </h3>

          {ad.content && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {ad.content}
            </p>
          )}

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              to={ad.linkUrl || '/services'}
              onClick={handleClose}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg hover:shadow-primary/30 transition-all group"
            >
              <span>{ad.ctaText || 'Claim Offer'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs transition-colors"
            >
              Remind Me Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementModal;
