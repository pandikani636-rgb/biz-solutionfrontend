import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Truck,
  FileSpreadsheet,
  BadgePercent,
  Calculator,
  Search,
  ExternalLink,
  CircleDot,
  RotateCw,
  Cog,
  Briefcase,
  Layers,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { ServiceCard } from '../../components/cards/ServiceCard';
import { TestimonialCard } from '../../components/cards/TestimonialCard';
import { Button } from '../../components/common/Button';
import { CardSkeleton } from '../../components/common/Skeleton';
import { formatCurrency } from '../../utils/formatters';
import { ImageUploadSection } from '../../components/common/ImageUploadSection';
import { useLanguage } from '../../context/LanguageContext';

const iconMap = {
  CircleDot,
  RotateCw,
  Cog,
  Briefcase,
  Layers,
};

const brandsList = [
  {
    name: 'PIX',
    title: 'PIX Transmissions Ltd',
    section: 'Industrial Belts',
    discount: '45% - 48% OFF',
    discountNum: 46,
    delivery: 'Free Delhivery',
    popularParts: ['SPC 2360', '8V-1900', 'SPC PT 3150', 'C 70'],
    color: 'from-amber-500/20 to-amber-600/10 border-amber-300',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    name: 'NBC',
    title: 'NBC Bearings (NEI)',
    section: 'Deep Groove Bearings',
    discount: '45% - 48% OFF',
    discountNum: 46,
    delivery: 'Free Delhivery',
    popularParts: ['6405ZZ C3'],
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-300',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    name: 'HCH',
    title: 'HCH Bearings',
    section: 'Ball Bearings & Sets',
    discount: '45% - 48% OFF',
    discountNum: 46,
    delivery: 'Free Delhivery',
    popularParts: ['6203', '6204', '6205', '6305', '6201_6202 set', '6203ZZ', '6307'],
    color: 'from-sky-500/20 to-sky-600/10 border-sky-300',
    tagColor: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  {
    name: 'Fenner',
    title: 'J.K. Fenner India',
    section: 'Bush Pulleys & Belts',
    discount: '45% - 48% OFF',
    discountNum: 46,
    delivery: 'Free Delhivery',
    popularParts: ['200 X 3C (2517)', 'C 70', 'SPC PT 3150'],
    color: 'from-rose-500/20 to-rose-600/10 border-rose-300',
    tagColor: 'bg-rose-100 text-rose-900 border-rose-300',
  },
  {
    name: 'Timken',
    title: 'The Timken Company',
    section: 'Bearings (All Types)',
    discount: '45% - 48% OFF',
    discountNum: 46,
    delivery: 'Free Delhivery',
    popularParts: ['6313 Open Type', 'All Types on RFQ'],
    color: 'from-orange-500/20 to-orange-600/10 border-orange-300',
    tagColor: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  {
    name: 'SKF',
    title: 'SKF Group Genuine',
    section: 'Angular Contact & Sets',
    discount: 'Flat 10% OFF',
    discountNum: 10,
    delivery: 'Insured Delivery',
    popularParts: ['7322 2X', '7322', 'National & Intl.'],
    color: 'from-blue-500/20 to-blue-600/10 border-blue-300',
    tagColor: 'bg-blue-100 text-blue-900 border-blue-300',
  },
];

export const HomePage = () => {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Part Search State
  const [partSearch, setPartSearch] = useState('');

  // Discount Calculator State
  const [calcBrand, setCalcBrand] = useState('PIX');
  const [calcMrp, setCalcMrp] = useState(2000);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [bannersRes, categoriesRes, servicesRes, testimonialsRes, faqsRes] =
          await Promise.all([
            contentService.getActiveBanners(),
            contentService.getCategories(),
            contentService.getServices({ limit: 12 }),
            contentService.getTestimonials(),
            contentService.getFAQs(),
          ]);

        if (bannersRes.success) setBanners(bannersRes.data || []);
        if (categoriesRes.success) setCategories(categoriesRes.data || []);
        if (servicesRes.success) setFeaturedServices(servicesRes.data || []);
        if (testimonialsRes.success) setTestimonials(testimonialsRes.data || []);
        if (faqsRes.success) setFaqs(faqsRes.data || []);
      } catch (err) {
        console.error('[Home Data Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Banner autoplay
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const currentBanner = banners[activeBannerIdx] || {
    title: 'India’s Trusted Power Transmission & Bearings Distributor',
    subtitle: 'Authorized dealer of PIX, NBC, HCH, Fenner, Timken, and SKF. Direct wholesale pricing with fast pan-India delivery.',
    badgeText: '45% - 48% OFF MRP LIST',
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1920&q=80',
    ctaText: 'Explore Catalog',
    ctaLink: '/services',
    secondaryCtaText: 'Request Bulk Quote (RFQ)',
    secondaryCtaLink: '/rfq',
  };

  // Calculator computation
  const selectedBrandObj = brandsList.find((b) => b.name === calcBrand) || brandsList[0];
  const discountPercent = selectedBrandObj.discountNum;
  const parsedMrp = Math.max(0, Number(calcMrp) || 0);
  const discountAmount = Math.round((parsedMrp * discountPercent) / 100);
  const netPrice = Math.max(0, parsedMrp - discountAmount);
  const gstAmount = Math.round(((netPrice * 18) / 100) * 100) / 100;
  const totalPrice = Math.round((netPrice + gstAmount) * 100) / 100;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (partSearch.trim()) {
      navigate(`/services?search=${encodeURIComponent(partSearch.trim())}`);
    }
  };

  return (
    <div className="relative min-h-screen space-y-16 pb-20">
      {/* Background image clearly visible across the entire Landing Page */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={currentBanner.image}
          alt="Landing Background"
          className="w-full h-full object-cover object-center opacity-40 scale-100 transition-all duration-1000 ease-out"
        />
        {/* Very light blue transparent overlay across entire page */}
        <div className="absolute inset-0 bg-blue-950/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-sky-950/10 to-slate-900/20" />
      </div>

      {/* 1. Industrial Hero Banner Section */}
      <section className="relative overflow-hidden text-white min-h-[560px] md:min-h-[640px] flex items-center z-10">
        {/* Dynamic ambient glowing light orbs */}
        <div className="absolute top-10 right-24 w-80 h-80 rounded-full bg-accent/20 blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute -bottom-10 left-12 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl animate-float pointer-events-none" />

        {/* Rotating technical gear silhouette watermark */}
        <div className="absolute -right-24 -top-24 w-96 h-96 border-2 border-dashed border-white/10 rounded-full animate-spin-slow pointer-events-none" />

        {/* Background image displayed prominently */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentBanner.image}
            alt={currentBanner.title}
            className="w-full h-full object-cover object-center opacity-95 scale-100 transition-all duration-1000 ease-out"
          />
          {/* Very light blue transparent overlay (significantly reduced opacity for maximum image visibility) */}
          <div className="absolute inset-0 bg-blue-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/45 via-blue-900/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/35 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl space-y-6">
            {currentBanner.badgeText && (
              <div className="animate-stagger-1">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/70 border border-accent/60 text-amber-300 font-extrabold text-xs uppercase tracking-wider backdrop-blur-md shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                  {currentBanner.badgeText}
                </span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight animate-stagger-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
              {currentBanner.title}
            </h1>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/15 shadow-xl max-w-2xl animate-stagger-3">
              <p className="text-white text-base md:text-lg leading-relaxed font-medium drop-shadow-sm">
                {currentBanner.subtitle}
              </p>
            </div>

            {/* Quick Part Number Search Box with glassmorphism */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch gap-2 pt-2 max-w-xl animate-stagger-4"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Enter Part Number (e.g., 6204, SPC 2360, 7322, 2517)..."
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/95 backdrop-blur-md text-darkText rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent shadow-lg border border-white/40"
                />
              </div>
              <Button type="submit" variant="accent" size="md" className="font-bold whitespace-nowrap inline-flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-smooth">
                <Search className="w-4 h-4" />
                <span>Search Part</span>
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-4 pt-2 animate-stagger-4">
              <Link to={currentBanner.ctaLink || '/services'}>
                <Button variant="accent" size="lg" className="font-bold inline-flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-smooth group">
                  <span>{currentBanner.ctaText || 'Browse All Products'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
                </Button>
              </Link>
              <Link to={currentBanner.secondaryCtaLink || '/rfq'}>
                <Button variant="secondary" size="lg" className="bg-white/10 text-white hover:bg-white/20 border border-white/25 backdrop-blur-md font-bold inline-flex items-center gap-2 hover:scale-[1.02] transition-smooth group">
                  <FileSpreadsheet className="w-4 h-4 text-accent group-hover:rotate-6 transition-smooth" />
                  <span>{currentBanner.secondaryCtaText || 'Request Bulk RFQ'}</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Banner navigation dots */}
          {banners.length > 1 && (
            <div className="flex items-center gap-2 mt-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBannerIdx(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === activeBannerIdx ? 'w-8 bg-accent' : 'w-2.5 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. Commercial Trust & Free Freight Bar (Translucent Glass Panel) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-4 gap-6 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-200/70 pb-4 md:pb-0 md:pr-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-smooth shadow-xs">
              <BadgePercent className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-darkText group-hover:text-primary transition-smooth">45% - 48% Off MRP</h4>
              <p className="text-xs text-secondaryText">On PIX, NBC, HCH, Fenner & Timken</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-200/70 pb-4 md:pb-0 md:pr-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-smooth shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-darkText group-hover:text-primary transition-smooth">Free Delhivery Included</h4>
              <p className="text-xs text-secondaryText">No freight or handling surcharges</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-200/70 pb-4 md:pb-0 md:pr-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-smooth shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-darkText group-hover:text-primary transition-smooth">100% Genuine Guaranteed</h4>
              <p className="text-xs text-secondaryText">MTC & factory serial verification</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-smooth shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-darkText group-hover:text-primary transition-smooth">B2B GST Tax Invoices</h4>
              <p className="text-xs text-secondaryText">18% Input credit on all orders</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Home Page Component Photo Upload (Max 20 Megapixels) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ImageUploadSection />
      </section>

      {/* 3. Authorized Brands ("Make") Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Authorized Stockist & Distributors
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-navy mt-1">
              Shop by Brand / Make
            </h2>
          </div>
          <Link
            to="/mrp-pricing"
            className="text-xs font-bold text-primary hover:text-primary-dark mt-2 md:mt-0 flex items-center gap-1"
          >
            View Complete Discount Matrix <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandsList.map((brand) => (
            <div
              key={brand.name}
              className={`bg-white/90 backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:bg-white relative flex flex-col justify-between group overflow-hidden ${brand.color}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border shadow-xs ${brand.tagColor}`}>
                    {brand.name}
                  </span>
                  <span className="bg-slate-900 text-amber-300 font-extrabold text-xs px-2.5 py-1 rounded-md shadow-xs">
                    {brand.discount}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-darkText group-hover:text-primary transition-smooth">{brand.title}</h3>
                  <p className="text-xs text-secondaryText font-medium mt-0.5">{brand.section}</p>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Popular Part Numbers:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {brand.popularParts.map((part) => (
                      <Link
                        key={part}
                        to={`/services?search=${encodeURIComponent(part)}`}
                        className="bg-slate-100 hover:bg-primary hover:text-white px-2 py-0.5 rounded text-[11px] font-mono font-semibold text-slate-700 transition-smooth shadow-xs"
                      >
                        {part}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {brand.delivery}
                </span>
                <Link
                  to={`/services?brand=${brand.name}`}
                  className="text-xs font-bold text-primary hover:text-navy inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-smooth"
                >
                  <span>Explore {brand.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Interactive MRP Discount & Net Price Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-navy via-navy-light to-navy rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-blue-900/40">
          {/* Subtle rotating gear silhouette and glowing ambient backdrop */}
          <div className="absolute -right-20 -top-20 w-80 h-80 border-2 border-dashed border-white/5 rounded-full animate-spin-slow pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

          {/* Subtle transparent background image blending into blue */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=80"
              alt=""
              className="w-full h-full object-cover object-center opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy/70 via-navy/50 to-navy/30" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Explainer */}
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-amber-300 font-bold text-xs backdrop-blur-sm">
                <Calculator className="w-3.5 h-3.5 text-accent animate-pulse" />
                Live Wholesale Pricing Engine
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Instant MRP Discount & Savings Calculator
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Test any official price list MRP across our brands. See your exact net B2B wholesale rate with our guaranteed 45% - 48% discount schedule (or flat 10% on SKF Genuine) and zero shipping fees.
              </p>

              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>PIX, NBC, HCH, Fenner & Timken: <strong>46% off MRP</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>SKF Bearings: <strong>Flat 10% off MRP</strong> (National & International)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pan-India <strong>Delhivery Logistics 100% Free</strong></span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Widget with Glassmorphism */}
            <div className="lg:col-span-7 bg-white/95 backdrop-blur-md text-darkText rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    1. Select Brand / Make
                  </label>
                  <select
                    value={calcBrand}
                    onChange={(e) => setCalcBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-bold text-darkText focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {brandsList.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name} — {b.discount}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MRP Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    2. Enter Official List MRP (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={calcMrp}
                    onChange={(e) => setCalcMrp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-black text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. 2000"
                  />
                </div>
              </div>

              {/* Live Price Calculation Display */}
              <div className="bg-slate-50/90 backdrop-blur-sm rounded-2xl p-5 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center shadow-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">List MRP</span>
                  <p className="text-base font-extrabold text-slate-500 line-through">
                    {formatCurrency(parsedMrp)}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-amber-600 uppercase">Discount ({discountPercent}%)</span>
                  <p className="text-base font-black text-amber-600">
                    - {formatCurrency(discountAmount)}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">Net B2B Rate</span>
                  <p className="text-xl font-black text-emerald-700">
                    {formatCurrency(netPrice)}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-navy uppercase">Total + 18% GST</span>
                  <p className="text-xl font-black text-navy">
                    {formatCurrency(totalPrice)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <strong>Zero Freight:</strong> Delhivery shipping charges included!
                </span>

                <Link to={`/services?brand=${calcBrand}`}>
                  <Button variant="accent" size="sm" className="font-bold w-full sm:w-auto inline-flex items-center gap-1.5 shadow-sm hover:scale-[1.02] transition-smooth">
                    <span>View {calcBrand} Products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Product Categories (Sections) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Core Product Sections
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-navy mt-1">
              Industrial Components & Transmission
            </h2>
          </div>
          <Link
            to="/services"
            className="text-xs font-bold text-primary hover:text-primary-dark mt-2 md:mt-0 flex items-center gap-1"
          >
            Browse Full Catalog <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Briefcase;
            return (
              <Link
                key={cat._id}
                to={`/services?category=${cat._id}`}
                className="group bg-white/90 backdrop-blur-md rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-lightBlue group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-smooth shadow-xs group-hover:scale-110 group-hover:rotate-6">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-darkText group-hover:text-primary transition-smooth">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-secondaryText mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary">
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-smooth" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. Special Spotlight: Timken All-Types & SKF Origin */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timken Spotlight */}
          <div className="bg-gradient-to-br from-amber-950/90 via-slate-900/95 to-slate-950 backdrop-blur-md rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between border border-amber-500/25 hover:border-amber-500/50 transition-all duration-300">
            <div className="space-y-4 relative z-10">
              <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider inline-block shadow-sm">
                Timken Make — All Types Available
              </span>
              <h3 className="text-2xl font-black">
                Featured 6313 Open Type & Full Timken Range
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                Need tapered roller bearings, spherical roller bearings, or heavy duty pillow blocks? We supply <strong>all types of Timken bearings</strong> at 45% - 48% off MRP with free insured delivery.
              </p>
            </div>

            <div className="pt-6 relative z-10 flex items-center gap-3">
              <Link to="/services?brand=Timken">
                <Button variant="accent" size="sm" className="font-bold inline-flex items-center gap-1.5 shadow-sm hover:scale-[1.02] transition-smooth">
                  <span>Browse Timken Stock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link to="/rfq">
                <Button variant="secondary" size="sm" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-bold inline-flex items-center gap-1.5 hover:scale-[1.02] transition-smooth">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-accent" />
                  <span>Custom Timken RFQ</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* SKF Spotlight */}
          <div className="bg-gradient-to-br from-blue-950/90 via-navy/95 to-slate-950 backdrop-blur-md rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300">
            {/* Transparent background image */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"
                alt=""
                className="w-full h-full object-cover object-center opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/70 via-navy/50 to-blue-900/40" />
            </div>
            <div className="space-y-4 relative z-10">
              <span className="bg-blue-400 text-slate-950 font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider inline-block shadow-sm">
                SKF Make — National & International Stock
              </span>
              <h3 className="text-2xl font-black">
                Genuine SKF 7322 & 7322 2X Angular Contact
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                Choose between <strong>National (SKF India)</strong> and <strong>International (Imported European)</strong> inventory. Strict 10% discount from official SKF MRP with full QR certificate verification.
              </p>
            </div>

            <div className="pt-6 relative z-10 flex items-center gap-3">
              <Link to="/services?brand=SKF">
                <Button variant="accent" size="sm" className="font-bold inline-flex items-center gap-1.5 shadow-sm hover:scale-[1.02] transition-smooth">
                  <span>View SKF Bearings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="sm" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-bold inline-flex items-center gap-1.5 hover:scale-[1.02] transition-smooth">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verify Authenticity</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Featured Industrial Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Immediate Dispatch Inventory
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-navy mt-1">
              Featured Bearings, Belts & Pulleys
            </h2>
          </div>
          <Link
            to="/services"
            className="text-xs font-bold text-primary hover:text-primary-dark mt-2 md:mt-0 flex items-center gap-1"
          >
            View All {featuredServices.length}+ Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.slice(0, 9).map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/services">
            <Button variant="outline" size="lg" className="font-bold inline-flex items-center gap-2 shadow-sm hover:scale-[1.02] transition-smooth">
              <span>Explore Complete 24+ Parts Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 8. FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            Common Questions
          </span>
          <h2 className="text-3xl font-black text-navy">Industrial Buying & Delivery FAQ</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={faq._id || idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-darkText hover:text-primary transition-smooth"
              >
                <span>{faq.question}</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    activeFaq === idx ? 'rotate-90 text-primary' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-secondaryText leading-relaxed border-t border-slate-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. Testimonials */}
      <section className="bg-white/80 backdrop-blur-md py-16 border-y border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Client Testimonials
            </span>
            <h2 className="text-3xl font-black text-navy mt-1">
              Trusted by Maintenance Heads & Plants
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t._id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
