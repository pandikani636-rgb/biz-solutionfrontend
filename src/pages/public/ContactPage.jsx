import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  Truck,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { useSite } from '../../context/SiteContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/common/Button';
import { showSuccessAlert, showErrorAlert } from '../../utils/alerts';

export const ContactPage = () => {
  const { settings } = useSite();
  const { isTamil, t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showErrorAlert('Incomplete Form', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await contentService.submitEnquiry(formData);
      if (res.success) {
        setSubmitted(true);
        await showSuccessAlert(
          isTamil ? 'செய்தி அனுப்பப்பட்டது!' : 'Message Submitted Successfully!',
          isTamil
            ? 'நன்றி! உங்கள் செய்தி ஸ்ரீவில்லிபுத்தூர் தொழில்நுட்பக் குழுவிடம் சமர்ப்பிக்கப்பட்டது. விரைவில் பதிலளிக்கப்படும்.'
            : 'Thank you! Your inquiry has been routed to our technical engineering desk in Srivilliputtur. An engineer will respond shortly.'
        );
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (err) {
      showErrorAlert('Submission Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const phoneNumbers = '7418423238 / 9842670320';
  const emailAddress = 'balumuniandassociates@gmail.com';
  const officeAddress = '45B/16 Noorullah Mall, Oothumalai Paradesimadam Street, Srivilliputtur, Virudhunagar Dist, Tamilnadu – 626125';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-xl border border-blue-400/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/banners/img3.jpg"
            alt="Industrial Engineering Desk"
            className="w-full h-full object-cover object-center opacity-25 mix-blend-overlay"
            onError={(e) => {
              e.target.src = '/banners/img4.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-indigo-900/60" />
        </div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Industrial Technical Assistance Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Get in Touch with Our Engineering Desk
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Have questions regarding bearing tolerances, belt pitch lengths, taper lock bush sizing, or bulk dispatch tracking? Speak with our sales engineers in Srivilliputtur.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Link to="/rfq">
            <Button variant="accent" size="md" className="font-bold inline-flex items-center gap-2 shadow-md">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Bulk RFQ Desk (1-Hour Quote)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Main Grid: Left Contact Cards, Right Form matching Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Contact Channels & Location Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white rounded-3xl p-8 shadow-xl space-y-7 border border-blue-500/40">
            {/* Header with Official BM Logo */}
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <div className="bg-white p-2 rounded-2xl shadow-md shrink-0">
                <img
                  src="/bm-logo.png"
                  alt="Balumuni and Associates BM Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div>
                <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest block">
                  Industrial Power Transmission &amp; Bearings
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Balumuni and Associates
                </h2>
              </div>
            </div>

            {/* Proprietor Badge */}
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-300 block tracking-wider">
                  Proprietor
                </span>
                <span className="text-base font-black text-amber-300">
                  K. Karthick Kumar
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2.5 py-1 rounded-md shadow-xs self-start sm:self-auto whitespace-nowrap">
                GSTIN: 33HONPK5547G2ZK
              </span>
            </div>

            <div className="space-y-6 text-xs text-slate-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-navy-light/80 rounded-2xl text-accent shrink-0 shadow-xs border border-white/10">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Official Registered Address</p>
                  <p className="mt-0.5 leading-relaxed text-slate-300 break-words">{officeAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-navy-light/80 rounded-2xl text-accent shrink-0 shadow-xs border border-white/10">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Direct Phone / WhatsApp</p>
                  <a href="tel:+917418423238" className="mt-0.5 block font-bold text-base text-amber-300 font-mono hover:underline">
                    +91-74184 23238
                  </a>
                  <a href="tel:+919842670320" className="block font-semibold text-xs text-slate-300 font-mono hover:underline">
                    Alt: +91 98426 70320
                  </a>
                  <p className="text-[10px] text-slate-400 mt-1">Available Mon-Sat 9:00 AM - 7:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-navy-light/80 rounded-2xl text-accent shrink-0 shadow-xs border border-white/10">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Official Email Enquiries</p>
                  <a href="mailto:balumuniandassociates@gmail.com" className="mt-0.5 block font-semibold text-white hover:text-accent underline break-all">
                    {emailAddress}
                  </a>
                  <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Direct sales desk</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-navy-light/80 rounded-2xl text-accent shrink-0 shadow-xs border border-white/10">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Business Hours</p>
                  <p className="mt-0.5 text-slate-300">Monday – Saturday: 9:00 AM – 7:00 PM</p>
                  <p className="text-[10px] text-slate-400">Sunday: Closed for maintenance</p>
                </div>
              </div>
            </div>

            {/* Corporate Commitment Card */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-center space-y-1">
              <p className="text-sm font-black text-amber-300">
                Powering Industrial Excellence Across India
              </p>
              <p className="text-[10px] text-slate-300">
                Quality • Integrity • Fast Delhivery Logistics
              </p>
            </div>
          </div>

          {/* Business Card Display */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
              Official Corporate Business Card
            </h3>
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-50">
              <img
                src="/balumuni-visiting-card.png"
                alt="Balumuni and Associates Corporate Card"
                className="w-full h-auto object-contain hover:scale-105 transition-smooth duration-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form matching Image 2 style */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-navy">Send Us a Direct Message</h2>
            <p className="text-xs text-secondaryText mt-1">
              All messages are routed directly to our industrial support engineers and tracked in our admin portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-darkText">
                  Your Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-darkText">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>
            </div>

            {/* Inputs matching Image 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-darkText">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-darkText">
                  Subject <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="e.g. Enterprise FASTag query"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-darkText">
                Your Message / Inquiry Details <span className="text-danger">*</span>
              </label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="Please describe how we can assist you..."
                value={formData.message}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
              />
            </div>

            {/* Submit Button styled identically to Image 2 with gold color and Send icon */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
