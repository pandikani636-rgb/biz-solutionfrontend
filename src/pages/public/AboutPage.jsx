import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Target,
  Award,
  Users,
  CheckCircle2,
  Truck,
  Sparkles,
  ArrowRight,
  Phone,
  Building2,
  Check,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AboutPage = () => {
  return (
    <div className="space-y-12 py-6 pb-16 animate-fadeIn">
      {/* 1. Hero Header - Clean, Well-Proportioned, Stable */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-2xl mx-4 sm:mx-6 lg:mx-8 shadow-xl border border-slate-800">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80"
            alt="Industrial bearings manufacturing"
            className="w-full h-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 py-12 sm:py-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>18+ Years Authorized Industrial Stockist &amp; Distributor</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
            Powering Indian Manufacturing With Genuine Power Transmission &amp; Bearings
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Balumuni and Associates is an authorized distributor and stockist specializing in mechanical power transmission products: Industrial V-Belts, Deep Groove Ball Bearings, Tapered Roller Bearings, and Pulleys. Direct factory supply for PIX, NBC, HCH, Fenner, Timken, SKF, Siemens, and ABB.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/services">
              <Button variant="primary" size="md" className="font-bold text-xs inline-flex items-center gap-2 bg-primary hover:bg-primary-dark">
                <span>Browse Products Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="md" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-bold text-xs inline-flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Contact Engineering Desk</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Key Figures & Wholesale Milestones */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="space-y-1 text-center p-2 border-r border-slate-100">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">18+</p>
            <p className="text-[11px] sm:text-xs font-bold text-primary uppercase tracking-wider">Years of Legacy</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500">Plant maintenance &amp; OEM supply</p>
          </div>

          <div className="space-y-1 text-center p-2 lg:border-r border-slate-100">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">12,500+</p>
            <p className="text-[11px] sm:text-xs font-bold text-primary uppercase tracking-wider">Factories Supplied</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500">Textile, cement, paper &amp; mills</p>
          </div>

          <div className="space-y-1 text-center p-2 border-r border-slate-100">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-600">45%-48%</p>
            <p className="text-[11px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider">Wholesale MRP Off</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500">Direct volume discount tiers</p>
          </div>

          <div className="space-y-1 text-center p-2">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600">100% Free</p>
            <p className="text-[11px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider">Logistics Included</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500">Insured door delivery nationwide</p>
          </div>
        </div>
      </section>

      {/* 3. Heritage & Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Our Story &amp; Provenance
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Eliminating Plant Downtime with Certified Mechanical Components
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Headquartered in Srivilliputtur, Tamil Nadu, <strong>Balumuni and Associates</strong> provides industrial maintenance engineers with genuine, traceable components at transparent wholesale prices. Over nearly two decades, we have evolved into an indispensable partner for heavy manufacturing across Tamil Nadu and all of India.
            </p>

            <div className="space-y-2.5 pt-1">
              {[
                {
                  title: '100% Guaranteed Genuine Provenance',
                  desc: 'Zero tolerance for counterfeit components. Every bearing and belt is sourced directly from manufacturers with batch holograms and Mill Test Certificates (MTC).',
                },
                {
                  title: 'Matched Sets and Precision Balance',
                  desc: 'All PIX and Fenner belts are supplied in factory precision-matched sets to eliminate multi-groove vibration and extend machine life.',
                },
                {
                  title: 'Transparent Wholesale Pricing & GST Invoices',
                  desc: 'Direct wholesale distribution discounts with 18% GST input tax credit on every order.',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="p-1 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Cards & Visuals - Clean, Compact, Fixed Proportions */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            <div className="space-y-3.5">
              <div className="rounded-2xl shadow-sm overflow-hidden h-44 sm:h-48 border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80"
                  alt="Precision bearings"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>

              {/* MTC Certified Card - Compact, Non-Expanding */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1.5 border border-slate-800 shadow-sm max-w-full">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300">MTC Certified</h4>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Every batch carries mill test metallurgical certification.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-4">
              {/* Delivery Card */}
              <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl space-y-1.5 shadow-sm max-w-full">
                <Truck className="w-5 h-5 text-slate-950" />
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-950">Free Delivery</h4>
                <p className="text-[11px] font-semibold leading-snug">
                  Pan-India insured door delivery included on standard lines.
                </p>
              </div>

              <div className="rounded-2xl shadow-sm overflow-hidden h-44 sm:h-48 border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                  alt="Industrial power transmission"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Strategic Make Lineup Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Authorized Brand Portfolio
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Partners in Engineering Excellence</h2>
          <p className="text-xs text-slate-500">Direct distribution agreements guaranteeing factory authenticity</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-colors text-center space-y-1.5"
            >
              <span className="text-base font-black text-slate-900 block font-serif tracking-tight">{item.name}</span>
              <p className="text-[11px] text-slate-500">{item.desc}</p>
              <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Brand Promise Banner - Controlled, Neat, Compact Proportions, No Tamil Text */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            Our Guiding Brand Motto
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            In Your Trust Lies Our Journey
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
            Printed on every official GST invoice as our daily commitment to engineering honesty, genuine products, and customer reliability.
          </p>

          <div className="pt-2 flex justify-center items-center">
            <Link to="/contact">
              <Button variant="primary" size="sm" className="font-bold text-xs inline-flex items-center gap-2 bg-primary hover:bg-primary-dark">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Contact Srivilliputtur Headquarters</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
