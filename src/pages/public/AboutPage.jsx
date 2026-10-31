import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Target,
  Award,
  Users,
  CheckCircle2,
  Truck,
  Layers,
  BadgePercent,
  Cpu,
  Clock,
  Sparkles,
  ArrowRight,
  MapPin,
  Phone,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/common/Button';

export const AboutPage = () => {
  const { isTamil, tagline } = useLanguage();
  const [activeTab, setActiveTab] = useState('mission');

  return (
    <div className="space-y-16 py-8 pb-20 animate-fadeIn">
      {/* 1. Hero Header with High-Resolution Industrial Backdrop */}
      <section className="relative overflow-hidden bg-navy text-white min-h-[440px] flex items-center rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-2xl border border-blue-900/40">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80"
            alt="Industrial bearings manufacturing"
            className="w-full h-full object-cover object-center opacity-30 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider animate-stagger-1">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>18+ Years Authorized Industrial Stockist & Distributor</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight max-w-3xl animate-stagger-2">
            Empowering Indian Manufacturing With Genuine Power Transmission & Bearings
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl animate-stagger-3">
            Balumuni and Associates (BizZolution) is an authorized distributor and stockist specializing in mechanical power transmission products: Industrial V-Belts, Deep Groove Ball Bearings, Angular Contact Bearings, and Taper Lock Bush Pulleys. Direct factory supply on PIX, NBC, HCH, Fenner, Timken, and SKF.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 animate-stagger-4">
            <Link to="/services">
              <Button variant="accent" size="lg" className="font-bold inline-flex items-center gap-2">
                <span>Browse Products Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="lg" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-bold inline-flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                <span>Contact Engineering Desk</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Interactive Key Figures & Wholesale Milestones */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-1 text-center border-r border-slate-100 last:border-none">
            <p className="text-4xl sm:text-5xl font-black text-navy">18+</p>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Years of Legacy</p>
            <p className="text-[11px] text-secondaryText">Serving OEM and plant maintenance</p>
          </div>

          <div className="space-y-1 text-center border-r border-slate-100 last:border-none">
            <p className="text-4xl sm:text-5xl font-black text-navy">12,500+</p>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Factories Supplied</p>
            <p className="text-[11px] text-secondaryText">Textile, sugar, cement & power plants</p>
          </div>

          <div className="space-y-1 text-center border-r border-slate-100 last:border-none">
            <p className="text-4xl sm:text-5xl font-black text-amber-600">45%-48%</p>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Wholesale MRP Off</p>
            <p className="text-[11px] text-secondaryText">Direct distribution wholesale tiers</p>
          </div>

          <div className="space-y-1 text-center">
            <p className="text-4xl sm:text-5xl font-black text-emerald-600">100% Free</p>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Delhivery Logistics</p>
            <p className="text-[11px] text-secondaryText">Zero handling or freight surcharges</p>
          </div>
        </div>
      </section>

      {/* 3. Heritage & Story Section with Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-lightBlue px-3 py-1 rounded-full">
                Our Story & Quality Provenance
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-navy leading-tight">
                Eliminating Plant Downtime with Certified Mechanical Components
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Founded at Srivilliputtur, Tamil Nadu, <strong>Balumuni and Associates</strong> was created with a single mission: to provide Indian industrial maintenance engineers with genuine, traceable components at transparent wholesale prices. Over nearly two decades, we have evolved into an indispensable partner for heavy industries across Tamil Nadu and all of India.
            </p>

            <div className="space-y-3 pt-2">
              {[
                {
                  title: '100% Guaranteed Genuine Provenance',
                  desc: 'Zero tolerance for counterfeit components. Every bearing and belt is sourced directly from manufacturer warehouses with factory batch holograms and Mill Test Certificates (MTC).',
                },
                {
                  title: 'Matched Sets and Precision Balance',
                  desc: 'All PIX and Fenner belts are supplied in factory precision-matched batches to eliminate multi-groove vibration and extend machine life.',
                },
                {
                  title: 'Transparent Wholesale Pricing & GST Invoices',
                  desc: 'We pass top-tier wholesale distribution discounts directly to customers with 18% GST input tax credit on every order.',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-lightBlue/30 transition-smooth">
                  <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-navy">{item.title}</h4>
                    <p className="text-[11px] text-secondaryText leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80"
                alt="Precision bearings"
                className="rounded-3xl shadow-lg object-cover h-48 sm:h-56 w-full border border-slate-200"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="bg-navy text-white p-5 rounded-3xl space-y-2 border border-blue-900 shadow-md">
                <ShieldCheck className="w-6 h-6 text-accent" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300">MTC Certified</h4>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Every batch carries mill test metallurgical certification.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 p-5 rounded-3xl space-y-2 shadow-md">
                <Truck className="w-6 h-6 text-navy" />
                <h4 className="font-black text-xs uppercase tracking-wider text-navy">Delhivery Free</h4>
                <p className="text-[11px] font-medium leading-snug">
                  Pan-India insured door delivery included on standard lines.
                </p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                alt="Industrial power transmission"
                className="rounded-3xl shadow-lg object-cover h-48 sm:h-56 w-full border border-slate-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Strategic Make Lineup Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-lightBlue px-3 py-1 rounded-full">
            Authorized Brand Portfolio
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-navy">Partners in Engineering Excellence</h2>
          <p className="text-xs text-secondaryText">Direct distribution agreements guaranteeing factory authenticity</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'PIX', desc: 'Industrial Belts', tag: '46% OFF MRP' },
            { name: 'NBC', desc: 'Heavy Bearings', tag: '46% OFF MRP' },
            { name: 'HCH', desc: 'EMQ Ball Bearings', tag: '46% OFF MRP' },
            { name: 'Fenner', desc: 'Pulleys & Belts', tag: '46% OFF MRP' },
            { name: 'Timken', desc: 'All Bearing Types', tag: '46% OFF MRP' },
            { name: 'SKF', desc: 'Precision Sets', tag: '10% OFF MRP' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-smooth text-center space-y-2"
            >
              <span className="text-lg font-black text-navy block font-serif tracking-tight">{item.name}</span>
              <p className="text-[11px] text-secondaryText">{item.desc}</p>
              <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Brand Promise Banner with the Tamil Tagline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy via-navy-light to-navy text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-900/60 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest bg-amber-400/20 px-3.5 py-1 rounded-full border border-amber-400/30">
              Our Guiding Brand Motto
            </span>

            {/* Tamil Tagline Displayed Prominently */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wide pt-2">
              உங்கள் நம்பிக்கையில் எங்கள் பயணம்!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 italic">
              "In Your Trust Lies Our Journey" – Printed on every official GST invoice as our daily commitment to engineering honesty and customer reliability.
            </p>

            <div className="pt-4 flex justify-center items-center gap-4">
              <Link to="/contact">
                <Button variant="accent" size="md" className="font-bold inline-flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Contact Srivilliputtur Headquarters</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
