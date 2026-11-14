import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ExternalLink,
  Navigation,
  ShieldCheck,
  Compass,
  HardHat,
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { showToast } from '../../utils/alerts';

export const Footer = () => {
  const { settings, categories } = useSite();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Subscribed to newsletter successfully!');
    setNewsletterEmail('');
  };

  const mapQuery = settings?.googleMapsLocation || settings?.address || '45B/16 Noorullah Mall, Oothumalai Paradesimadam Street, Srivilliputtur, Virudhunagar Dist, Tamilnadu - 626125';
  const googleMapsIframeSrc =
    settings?.googleMapsEmbedUrl ||
    `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <footer className="relative z-30 bg-gradient-to-b from-blue-950 via-[#0f2444] to-[#0a182d] text-white pt-16 pb-10 border-t border-blue-800/60 shadow-2xl select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Top Grid: 4 Columns (Brand & Contact, Quick Links, Products, Google Maps) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-blue-800/50">
          
          {/* Col 1: Brand Info & Contact (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="bg-white p-2 rounded-2xl shadow-md border border-white/20 shrink-0">
                <img
                  src={settings?.logo || '/bm-logo.png'}
                  alt={settings?.siteName || 'Balumuni and Associates'}
                  className="h-14 sm:h-16 w-auto object-contain"
                  onError={(e) => {
                    e.target.src = '/bm-logo.png';
                  }}
                />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight leading-tight flex items-center text-yellow-400">
                  Balumuni and Associates
                </span>
                <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
                  Industrial Power Transmission &amp; Bearings
                </span>
              </div>
            </Link>

            <div className="text-[11px] font-semibold text-slate-300 space-y-1">
              <p>
                <span className="text-slate-400">Proprietor:</span>{' '}
                <strong className="text-white">{settings?.proprietorName || 'K. Karthick Kumar'}</strong>
              </p>
              <p className="text-slate-300 text-xs leading-relaxed">
                {settings?.footerDescription ||
                  'Authorized industrial distributor for world-class mechanical transmission belts, bearings, taper pulleys, and industrial equipment.'}
              </p>
            </div>

            <div className="pt-2 space-y-2 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed break-words text-slate-200 font-medium">
                  {settings?.address ||
                    '45B/16 Noorullah Mall, Oothumalai Paradesimadam Street, Srivilliputtur, Virudhunagar Dist, Tamilnadu – 626125'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${(settings?.contactPhone || '+917418423238').replace(/[^0-9+]/g, '')}`}
                  className="hover:text-amber-300 font-mono font-bold"
                >
                  {settings?.contactPhone || '+91 74184 23238'}
                </a>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`mailto:${settings?.contactEmail || 'balumuniandassociates@gmail.com'}`}
                  className="hover:text-amber-300 underline break-all font-medium"
                >
                  {settings?.contactEmail || 'balumuniandassociates@gmail.com'}
                </a>
              </div>
              <div className="inline-block mt-1 font-mono text-[10px] text-amber-300 font-bold bg-white/10 px-2.5 py-1 rounded-md border border-white/20 shadow-xs whitespace-nowrap">
                GSTIN: {settings?.gstin || '33HONPK5547G2ZK'}
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-200 font-medium">
              <li>
                <Link to="/" className="hover:text-amber-300 transition-colors">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-300 transition-colors">
                  Explore Products
                </Link>
              </li>
              <li>
                <Link to="/ticket-booking" className="hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 text-white font-bold">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Travel Desk (Train/Flight)</span>
                </Link>
              </li>
              <li>
                <Link to="/labour-insurance" className="hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 text-amber-300 font-bold">
                  <HardHat className="w-3.5 h-3.5 text-amber-400" />
                  <span>Labour Insurance</span>
                </Link>
              </li>
              <li>
                <Link to="/mrp-pricing" className="hover:text-white transition-colors text-amber-300 font-bold">
                  MRP Price List &amp; Discounts
                </Link>
              </li>
              <li>
                <Link to="/rfq" className="hover:text-white transition-colors text-amber-300 font-bold">
                  Request RFQ
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-300 transition-colors">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-300 transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Dynamic Categories (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">Categories</h4>
            <ul className="space-y-2 text-xs text-slate-200 font-medium">
              {(categories || []).slice(0, 6).map((cat) => (
                <li key={cat._id}>
                  <Link
                    to={`/services?category=${cat._id}`}
                    className="hover:text-amber-300 transition-colors block truncate"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Google Maps Location Embed (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Our Location (Google Maps)</span>
              </h4>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-blue-200 hover:text-white inline-flex items-center gap-1 transition-colors"
                title="Open in Google Maps"
              >
                <span>Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Google Map Embedded Iframe */}
            <div className="w-full h-44 rounded-2xl overflow-hidden border border-blue-700/80 shadow-xl bg-slate-900 relative">
              <iframe
                title="Company Google Maps Location"
                src={googleMapsIframeSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full filter saturate-125"
              />
            </div>
            
            <p className="text-[11px] text-blue-200 leading-tight">
              Located at Noorullah Mall, Srivilliputtur. Visitors and industrial client consultations welcome during working hours.
            </p>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-blue-200/80">
          <p>© {new Date().getFullYear()} {settings?.siteName || 'Balumuni and Associates'}. All rights reserved.</p>
          <p className="font-semibold text-blue-200/90">
            Designed by{' '}
            <a
              href="https://anjanainfotech.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-white underline underline-offset-2 transition-colors font-bold"
              title="Visit Anjana Infotech"
            >
              Anjana Infotech
            </a>
            , Rajapalayam
          </p>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">ISO 9001:2015 Certified Solutions Provider</span>
            <Link to="/about" className="hover:text-amber-300">
              Terms &amp; Policies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
