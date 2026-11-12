import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Wrench,
  Cog,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

// 4 Authenticated Industrial Equipment Images for the About Us smooth slider
const industrialSlides = [
  {
    image: '/banners/img2.png',
    title: 'High-Tensile Industrial V-Belts',
    make: 'PIX & Fenner Authorized Stockist',
    desc: 'Classical A/B/C and narrow wedge SPC/8V belts with precision-matched factory tolerance.',
  },
  {
    image: '/banners/img5.jpg',
    title: 'Precision Chrome Ball Bearings',
    make: 'NBC & HCH Heavy Series',
    desc: 'Electric Motor Quality (EMQ) deep groove ball bearings with 2RS/ZZ high-speed seals.',
  },
  {
    image: '/banners/img4.jpg',
    title: 'Dual Duty Taper Lock Pulleys',
    make: 'Fenner & Transmission Gears',
    desc: 'Precision balanced taper bush pulleys, finished bore 60mm and industrial couplings.',
  },
  {
    image: '/banners/img3.jpg',
    title: 'Heavy Duty Tapered Roller Bearings',
    make: 'Timken & SKF Authentic Lineup',
    desc: 'High-capacity industrial bearings designed for crushing, cement, textile & paper mills.',
  },
];

export const AboutPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = industrialSlides.length;

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  return (
    <div className="space-y-12 py-6 pb-16 animate-fadeIn">
      {/* 1. Hero Header - Clean, Light Blue Professional Theme */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-xl border border-blue-400/30">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1600&q=80"
            alt="Industrial mechanical gears"
            className="w-full h-full object-cover object-center opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-blue-700/60" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 py-12 sm:py-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>18+ Years Authorized Industrial Stockist &amp; Distributor</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
            Powering Indian Manufacturing With Genuine Power Transmission &amp; Bearings
          </h1>

          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed max-w-3xl font-medium">
            Balumuni and Associates is an authorized distributor and stockist specializing in mechanical power transmission products: Industrial V-Belts, Deep Groove Ball Bearings, Tapered Roller Bearings, and Pulleys. Direct factory supply for PIX, NBC, HCH, Fenner, Timken, SKF, Siemens, and ABB.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/services">
              <Button variant="accent" size="md" className="font-bold text-xs inline-flex items-center gap-2 shadow-md">
                <span>Browse Products Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="md" className="bg-white/15 text-white hover:bg-white/25 border border-white/30 font-bold text-xs inline-flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-300" />
                <span>Contact Engineering Desk</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Key Figures & Wholesale Milestones */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-blue-100 shadow-md grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="space-y-1 text-center p-2 border-r border-slate-100">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-700">18+</p>
            <p className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">Years of Legacy</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500">Plant maintenance &amp; OEM supply</p>
          </div>

          <div className="space-y-1 text-center p-2 lg:border-r border-slate-100">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-700">12,500+</p>
            <p className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">Factories Supplied</p>
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

      {/* 3. Heritage & Story Section with Animated 4-Image Industrial Equipment Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-primary uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Our Story &amp; Provenance
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight pt-1">
                Eliminating Plant Downtime with Certified Mechanical Components
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
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
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-blue-100 shadow-2xs hover:border-primary/40 transition-colors">
                  <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
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

          {/* Right: Smooth Animated Industrial Equipment 4-Image Slider */}
          <div className="lg:col-span-5 space-y-4">
            <div
              className="relative rounded-3xl overflow-hidden border border-blue-200/90 shadow-xl bg-slate-900 aspect-[4/3] group select-none"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Slides Track with Smooth Transition */}
              <div
                className="flex h-full w-full transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {industrialSlides.map((slide, idx) => (
                  <div key={idx} className="w-full h-full shrink-0 relative bg-slate-900">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.target.src = '/banners/img6.jpg';
                      }}
                    />
                    {/* Clean Gradient Overlay for Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                    {/* Industrial Equipment Caption Card */}
                    <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-lg text-slate-900 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {slide.make}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {idx + 1} / {totalSlides}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-slate-950 line-clamp-1">
                        {slide.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 line-clamp-1">
                        {slide.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Prev / Next Slider Controls */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-all hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-all hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Slider Dots */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                {industrialSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'w-5 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Industrial Trust Badges Below Slider */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-white p-3.5 rounded-2xl border border-blue-200 shadow-2xs space-y-1 flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-blue-100 text-primary shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-black text-xs text-blue-950 uppercase tracking-wider">100% Genuine MTC</h5>
                  <p className="text-[10px] text-slate-500 leading-tight">Batch mill test certified</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs space-y-1 flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-black text-xs text-amber-950 uppercase tracking-wider">Fast Logistics</h5>
                  <p className="text-[10px] text-slate-500 leading-tight">Nationwide insured dispatch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Strategic Make Lineup Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
          <span className="text-xs font-bold text-primary uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Authorized Brand Portfolio
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">Partners in Engineering Excellence</h2>
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
              className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all text-center space-y-1.5"
            >
              <span className="text-base font-black text-slate-900 block font-serif tracking-tight">{item.name}</span>
              <p className="text-[11px] text-slate-500">{item.desc}</p>
              <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Brand Promise Banner - Clean Lighter Blue Theme */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-400/30 text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold text-amber-300 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Our Guiding Brand Motto
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            In Your Trust Lies Our Journey
          </h2>
          <p className="text-xs text-blue-100 max-w-xl mx-auto leading-relaxed font-medium">
            Printed on every official GST invoice as our daily commitment to engineering honesty, genuine products, and customer reliability.
          </p>

          <div className="pt-2 flex justify-center items-center">
            <Link to="/contact">
              <Button variant="accent" size="sm" className="font-bold text-xs inline-flex items-center gap-2 shadow-md">
                <Phone className="w-3.5 h-3.5" />
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
