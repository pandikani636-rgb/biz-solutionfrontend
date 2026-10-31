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
    <footer className="bg-navy text-white pt-16 pb-10 border-t border-navy-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-light/40">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow">
                <Layers className="w-6 h-6 text-accent" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Biz<span className="text-accent">Zolution</span>
              </span>
            </Link>

            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              {settings.tagLine ||
                'BizZolution is the premier unified enterprise platform connecting modern consumers with digital toll recharges, corporate registration, vetted freight logistics, and curated travel experiences.'}
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span>{settings.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span>{settings.contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-accent">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/" className="hover:text-white transition-smooth">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-smooth">
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
                  Request Bulk RFQ
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-smooth">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-smooth">
                  Technical Support
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-smooth">
                  Customer Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Dynamic Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-accent">Top Services</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat._id}>
                  <Link
                    to={`/services?category=${cat._id}`}
                    className="hover:text-white transition-smooth"
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
            <p className="text-xs text-slate-300 leading-relaxed">
              Subscribe for exclusive service discounts, tax compliance alerts, and new portal features.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
                    className="w-full pl-3 pr-10 py-2.5 bg-navy-dark text-xs text-white rounded-xl border border-slate-700 focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-accent text-darkText hover:bg-accent-hover transition-smooth"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} BizZolution Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">ISO 9001:2015 Certified Solutions Provider</span>
            <Link to="/about" className="hover:text-white">
              Terms & Policies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
