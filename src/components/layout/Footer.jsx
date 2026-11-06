import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
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

  return (
    <footer className="relative z-30 bg-gradient-to-b from-blue-900 via-[#1b3b6f] to-[#12284c] text-white pt-16 pb-10 border-t border-blue-700/60 shadow-2xl opacity-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-blue-800/50">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="bg-white p-1 rounded-xl shadow-md">
                <img
                  src="/bm-logo.png"
                  alt="Balumuni and Associates BM Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-extrabold tracking-wide leading-tight block">
                  <span className="text-amber-400 font-black">Balumuni</span>{' '}
                  <span className="text-slate-100 font-bold">and Associates</span>
                </span>
              </div>
            </Link>

            <div className="text-[11px] font-semibold text-slate-300 space-y-0.5">
              <p><span className="text-slate-400">Proprietor:</span> <strong className="text-white">K. Karthick Kumar</strong></p>
              <p className="text-slate-300 text-xs leading-relaxed pt-1">
                Authorized industrial distributor for world-class mechanical transmission belts, bearings, taper pulleys, and industrial equipment.
              </p>
            </div>

            <div className="pt-2 space-y-2.5 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span className="leading-relaxed break-words">
                  45B/16 Noorullah Mall, Oothumalai Paradesimadam Street, Srivilliputtur, Virudhunagar Dist, Tamilnadu – 626125
                </span>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <a href="tel:+917418423238" className="hover:text-accent font-mono font-bold">
                  +91-74184 23238 / 98426 70320
                </a>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <a href="mailto:balumuniandassociates@gmail.com" className="hover:text-accent underline break-all">
                  balumuniandassociates@gmail.com
                </a>
              </div>
              <div className="inline-block mt-1 font-mono text-[10px] text-amber-300 font-bold bg-white/10 px-2.5 py-1 rounded border border-white/20 shadow-xs whitespace-nowrap">
                GSTIN: 33HONPK5547G2ZK
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-accent">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-200">
              <li>
                <Link to="/" className="hover:text-accent transition-smooth">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-accent transition-smooth">
                  Explore Products Catalog
                </Link>
              </li>
              <li>
                <Link to="/mrp-pricing" className="hover:text-white transition-smooth text-amber-300 font-bold">
                  MRP Price List & Discounts
                </Link>
              </li>
              <li>
                <Link to="/rfq" className="hover:text-white transition-smooth text-amber-300 font-bold">
                  Request Quotation
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent transition-smooth">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-accent transition-smooth">
                  Technical Support
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-accent transition-smooth">
                  Customer Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Dynamic Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-accent">Top Services</h4>
            <ul className="space-y-2 text-xs text-slate-200">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat._id}>
                  <Link
                    to={`/services?category=${cat._id}`}
                    className="hover:text-accent transition-smooth"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-accent">Stay Updated</h4>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              Subscribe for exclusive service discounts, tax compliance alerts, and new portal features.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>You're subscribed! Thank you.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-blue-950/60 text-xs text-white placeholder-blue-300/60 rounded-xl border border-blue-700/80 focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-accent text-slate-950 font-bold hover:bg-accent-hover transition-smooth"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 border-t border-blue-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-blue-200/80">
          <p>© {new Date().getFullYear()} Balumuni and Associates. All rights reserved.</p>
          <p className="font-semibold text-blue-200/90">
            Designed by{' '}
            <a
              href="https://anjanainfotech.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-white underline underline-offset-2 transition-smooth font-bold"
              title="Visit Anjana Infotech"
            >
              Anjana Infotech
            </a>
            , Rajapalayam
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-300">ISO 9001:2015 Certified Solutions Provider</span>
            <Link to="/about" className="hover:text-accent">
              Terms & Policies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
