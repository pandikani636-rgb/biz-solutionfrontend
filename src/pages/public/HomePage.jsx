import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  ChevronRight,
  ChevronLeft,
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

const allFourteenBrands = [
  {
    id: 'pix',
    name: 'PIX',
    fullName: 'PIX Transmissions Ltd',
    logo: '/brands/individual/pix.png',
    category: 'Industrial V-Belts & Drives',
    badge: 'Authorised Dealer',
    discount: '45% - 48% OFF',
  },
  {
    id: 'jk-fenner',
    name: 'JK Fenner',
    fullName: 'J.K. Fenner (India) Limited',
    logo: '/brands/individual/jk-fenner.png',
    category: 'Belts, Pulleys & Couplings',
    badge: 'Authorised Stockist',
    discount: '45% - 48% OFF',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    fullName: 'Diamond Industrial Chains',
    logo: '/brands/individual/diamond.png',
    category: 'Roller Chains & Sprockets',
    badge: 'Industrial Stockist',
    discount: 'Wholesale Rates',
  },
  {
    id: 'nbc',
    name: 'NBC',
    fullName: 'NBC Bearings (NEI)',
    logo: '/brands/individual/nbc.png',
    category: 'Ball & Taper Roller Bearings',
    badge: 'Direct Stockist',
    discount: '45% - 48% OFF',
  },
  {
    id: 'shanthi-gears',
    name: 'Shanthi Gears',
    fullName: 'Shanthi Gears (Murugappa)',
    logo: '/brands/individual/shanthi-gears.png',
    category: 'Industrial Gearboxes & Spares',
    badge: 'Authorised Partner',
    discount: 'OEM Pricing',
  },
  {
    id: 'skf',
    name: 'SKF',
    fullName: 'SKF India Limited',
    logo: '/brands/individual/skf.png',
    category: 'Deep Groove & Roller Bearings',
    badge: 'Genuine Stockist',
    discount: 'Competitive Rates',
  },
  {
    id: 'fag',
    name: 'FAG',
    fullName: 'FAG Bearings (Schaeffler)',
    logo: '/brands/individual/fag.png',
    category: 'Spherical & Cylindrical Bearings',
    badge: 'Authorised Stockist',
    discount: 'Volume Discounts',
  },
  {
    id: 'timken',
    name: 'Timken',
    fullName: 'The Timken Company',
    logo: '/brands/individual/timken.png',
    category: 'Tapered Roller & Heavy Bearings',
    badge: 'Certified Partner',
    discount: '45% - 48% OFF',
  },
  {
    id: 'ntn',
    name: 'NTN',
    fullName: 'NTN Bearing Corporation',
    logo: '/brands/individual/ntn.png',
    category: 'High-Precision Machine Bearings',
    badge: 'Imported Genuine',
    discount: 'Best Market Rates',
  },
  {
    id: 'vignessh-gears',
    name: 'Vignessh Gears',
    fullName: 'Vignessh Gears & Transmission',
    logo: '/brands/individual/vignessh-gears.png',
    category: 'Industrial Pinions & Spur Gears',
    badge: 'Regional Partner',
    discount: 'Direct Factory',
  },
  {
    id: 'siemens',
    name: 'Siemens',
    fullName: 'Siemens Industrial Drives & Motors',
    logo: '/brands/individual/siemens.png',
    category: 'Energy Efficient IE2/IE3 Motors',
    badge: 'Authorised Channel',
    discount: 'Project Discounts',
  },
  {
    id: 'crompton',
    name: 'Crompton',
    fullName: 'Crompton Greaves Consumer & Ind.',
    logo: '/brands/individual/crompton.png',
    category: 'Heavy Duty Induction Motors',
    badge: 'Stockist & Dealer',
    discount: 'Wholesale B2B',
  },
  {
    id: 'abb-motors',
    name: 'ABB Motors',
    fullName: 'ABB India Limited',
    logo: '/brands/individual/abb-motors.png',
    category: 'High Efficiency IE3 / IE4 Motors',
    badge: 'Direct Supplier',
    discount: 'Industrial Rates',
  },
  {
    id: 'bharat-bijlee',
    name: 'Bharat Bijlee',
    fullName: 'Bharat Bijlee Limited',
    logo: '/brands/individual/bharat-bijlee.png',
    category: 'Heavy Duty AC Motors & Drives',
    badge: 'Authorised Partner',
    discount: 'Standard Pricing',
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

  // All 6 Industrial Banners featuring images from Banner folder
  const defaultBanners = [
    {
      title: "Grander's Belts & Power Transmission",
      badgeText: "GRANDER'S BELTS & V-BELTS",
      subtitle: 'High-tensile industrial Grander belts, angle grinder drive belts, and classical wedge belts. Oil, heat, and vibration resistant for heavy workshop and factory operations.',
      image: '/banners/img2.png',
      ctaText: "Browse Grander's Belts",
      ctaLink: '/services?brand=PIX',
      secondaryCtaText: 'Request Bulk RFQ',
      secondaryCtaLink: '/rfq',
    },
    {
      title: 'Fenner B 36 Wet Grinder Belts',
      badgeText: 'GENUINE FENNER GRINDER SERIES',
      subtitle: 'Original Fenner B 36 precision wet grinder drive belts. Engineered for whisper-quiet vibration damping and maximum drive efficiency.',
      image: '/banners/img5.jpg',
      ctaText: 'Explore Fenner Belts',
      ctaLink: '/services?brand=Fenner',
      secondaryCtaText: 'View Discount Matrix',
      secondaryCtaLink: '/mrp-pricing',
    },
    {
      title: 'Fenner A 48 Wet Grinder Belts',
      badgeText: 'INDUSTRIAL & COMMERCIAL DRIVES',
      subtitle: 'Heavy-duty Fenner A 48 wet grinder and machine transmission belts. Oil-resistant and heat-stable for rigorous wet grinding environments.',
      image: '/banners/img4.jpg',
      ctaText: 'Explore Wet Grinder Belts',
      ctaLink: '/services?brand=Fenner',
      secondaryCtaText: 'Download Price List',
      secondaryCtaLink: '/mrp-pricing',
    },
    {
      title: 'Veegrip Grind Power Industrial V-Belts',
      badgeText: 'IS 2494 HEAVY DUTY CERTIFIED',
      subtitle: 'Veegrip Grind Power transmission belts engineered to IS 2494 standards. Exceptional tensile cord reinforcement and minimal elongation under load.',
      image: '/banners/img3.jpg',
      ctaText: 'Browse Grind Power Belts',
      ctaLink: '/services?section=Belt',
      secondaryCtaText: 'Custom RFQ',
      secondaryCtaLink: '/rfq',
    },
    {
      title: 'Classical Industrial V-Belts — Section A & C',
      badgeText: 'HIGH-TORQUE DRIVE SOLUTIONS',
      subtitle: 'Complete range of industrial wrapped classical V-belts including A 951 Lp / A36A and C Section belts for industrial machinery and machine tools.',
      image: '/banners/img1.jpg',
      ctaText: 'Explore Classical Belts',
      ctaLink: '/services?section=Belt',
      secondaryCtaText: 'Technical Inquiry',
      secondaryCtaLink: '/contact',
    },
    {
      title: 'Veehold Domestic & Heavy Industrial Belts',
      badgeText: 'DOMESTIC & HEAVY PLANT LINEUP',
      subtitle: 'Veehold Domestic WG 341 and heavy-duty transmission belts for domestic machinery, mill drives, and workshop machinery.',
      image: '/banners/img6.jpg',
      ctaText: 'Browse Veehold Lineup',
      ctaLink: '/services?section=Belt',
      secondaryCtaText: 'Request Bulk Quote',
      secondaryCtaLink: '/rfq',
    },
  ];

  const activeBannersList = banners.length >= 5 ? banners : defaultBanners;
  const currentBanner = activeBannersList[activeBannerIdx % activeBannersList.length] || defaultBanners[0];

  // Banner autoplay
  useEffect(() => {
    if (activeBannersList.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % activeBannersList.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBannersList.length]);

  const handlePrevSlide = () => {
    setActiveBannerIdx((prev) => (prev - 1 + activeBannersList.length) % activeBannersList.length);
  };

  const handleNextSlide = () => {
    setActiveBannerIdx((prev) => (prev + 1) % activeBannersList.length);
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
      {/* Background image clearly visible across the entire Landing Page (stops before footer) */}
      <div className="absolute top-0 left-0 right-0 bottom-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={currentBanner.image}
          alt="Landing Background"
          className="w-full h-full object-cover object-center opacity-30 scale-100 transition-all duration-1000 ease-out"
          onError={(e) => {
            e.target.src = '/banners/img5.jpg';
          }}
        />
        {/* Very light blue transparent overlay across entire page */}
        <div className="absolute inset-0 bg-blue-950/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-sky-950/5 to-slate-900/15" />
      </div>

      {/* 1. Industrial Hero Banner Section with Grander's Belts & Prominent Image */}
      <section className="relative overflow-hidden text-white min-h-[520px] md:min-h-[580px] flex items-center z-10 group">
        {/* Dynamic ambient glowing light orbs */}
        <div className="absolute top-10 right-24 w-80 h-80 rounded-full bg-accent/20 blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute -bottom-10 left-12 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl animate-float pointer-events-none" />

        {/* Rotating technical gear silhouette watermark */}
        <div className="absolute -right-24 -top-24 w-96 h-96 border-2 border-dashed border-white/10 rounded-full animate-spin-slow pointer-events-none" />

        {/* Background image displayed prominently */}
        <div className="absolute inset-0 z-0">
          <img
            key={currentBanner.image}
            src={currentBanner.image}
            alt={currentBanner.badgeText || 'Hero Banner'}
            className="w-full h-full object-cover object-center opacity-95 scale-100 transition-all duration-1000 ease-out"
            onError={(e) => {
              e.target.src = '/banners/img5.jpg';
            }}
          />
          {/* Very light blue transparent overlay (significantly reduced opacity for maximum image visibility) */}
          <div className="absolute inset-0 bg-blue-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/45 via-blue-900/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/35 via-transparent to-transparent" />
        </div>

        {/* Previous / Next Slide Controls */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-md opacity-80 hover:opacity-100 transition-all duration-200"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-accent" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-md opacity-80 hover:opacity-100 transition-all duration-200"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-accent" />
        </button>

        <div className="relative z-10 max-w-7xl mx-auto px-10 sm:px-12 lg:px-14 py-12 sm:py-16 md:py-20 w-full">
          <div className="max-w-2xl space-y-5">
            {/* Badge */}
            {currentBanner.badgeText && (
              <div className="animate-fadeIn">
                <span className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-slate-950/75 border border-accent/60 text-amber-300 font-black text-xs uppercase tracking-wider backdrop-blur-md shadow-xl">
                  <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                  {currentBanner.badgeText}
                </span>
              </div>
            )}

            {/* Note: The giant headline words have been completely removed as requested in Requirement 1 for clean visual balance */}

            {/* Subtitle / Description Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/20 shadow-2xl max-w-xl animate-fadeIn">
              <p className="text-white text-xs sm:text-base leading-relaxed font-semibold drop-shadow-sm">
                {currentBanner.subtitle}
              </p>
            </div>

            {/* Quick Part Number Search Box with glassmorphism */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch gap-2 pt-1 max-w-xl animate-fadeIn"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Enter Part Number (e.g., 6204, SPC 2360, 7322, 2517)..."
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/95 backdrop-blur-md text-darkText rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent shadow-lg border border-white/40"
                />
              </div>
              <Button type="submit" variant="accent" size="md" className="font-bold whitespace-nowrap inline-flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-smooth">
                <Search className="w-4 h-4" />
                <span>Search Part</span>
              </Button>
            </form>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 animate-fadeIn">
              <Link to={currentBanner.ctaLink || '/services'} className="w-full sm:w-auto">
                <Button variant="accent" size="lg" className="w-full font-bold inline-flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-smooth group">
                  <span>{currentBanner.ctaText || 'Browse All Products'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
                </Button>
              </Link>
              <Link to={currentBanner.secondaryCtaLink || '/rfq'} className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full bg-slate-950/60 text-white hover:bg-slate-950/90 border border-white/25 backdrop-blur-md font-bold inline-flex items-center justify-center gap-2 hover:scale-[1.02] transition-smooth group shadow-lg">
                  <FileSpreadsheet className="w-4 h-4 text-accent group-hover:rotate-6 transition-smooth" />
                  <span>{currentBanner.secondaryCtaText || 'Request Bulk RFQ'}</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Banner navigation indicator dots (6 slides) */}
          <div className="flex items-center gap-2 mt-6 sm:mt-8">
            {activeBannersList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBannerIdx(idx)}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  idx === (activeBannerIdx % activeBannersList.length)
                    ? 'w-7 sm:w-9 bg-accent shadow-md'
                    : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Commercial Trust & Free Freight Bar (Translucent Glass Panel) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-center gap-4 border-b sm:border-b-0 lg:border-r border-slate-200/70 pb-4 sm:pb-0 lg:pr-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-smooth shadow-xs">
              <BadgePercent className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-darkText group-hover:text-primary transition-smooth">45% - 48% Off MRP</h4>
              <p className="text-xs text-secondaryText">On PIX, NBC, HCH, Fenner & Timken</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-b sm:border-b-0 lg:border-r border-slate-200/70 pb-4 sm:pb-0 lg:pr-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-smooth shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-darkText group-hover:text-primary transition-smooth">Free Delhivery Included</h4>
              <p className="text-xs text-secondaryText">No freight or handling surcharges</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-b sm:border-b-0 lg:border-r border-slate-200/70 pb-4 sm:pb-0 lg:pr-4 group">
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

      {/* 3. Official Industrial Equipments Partner Brands (All 14 Logos from First Image) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-slate-900 via-navy to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-slate-700/60 text-white relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Heading */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-700/80 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                INDUSTRIAL EQUIPMENTS • ALL 14 OFFICIAL MAKES
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Authorised Stockist & Dealer Network
              </h2>
              <p className="text-sm text-slate-300 mt-2 max-w-3xl">
                Balumuni and Associates is proud to supply 100% genuine products directly sourced from India's premier industrial equipment, bearing, belt, gear, and motor manufacturers.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">14 Trusted Industrial Brands</span>
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md hover:scale-105"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* All 14 Brand Logos Grid */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {allFourteenBrands.map((b) => (
              <Link
                key={b.id}
                to={`/services?search=${encodeURIComponent(b.name)}`}
                className="group bg-white rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary border border-slate-200/90"
              >
                <div className="w-full h-16 sm:h-18 flex items-center justify-center p-2 rounded-xl bg-slate-50 group-hover:bg-blue-50/50 transition-colors">
                  <img
                    src={b.logo}
                    alt={`${b.fullName} Logo`}
                    className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="mt-3 w-full">
                  <h4 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-primary transition-colors truncate">
                    {b.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5 leading-tight">
                    {b.category}
                  </p>
                </div>
                <span className="mt-2 text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 group-hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 w-full truncate">
                  {b.badge}
                </span>
              </Link>
            ))}
          </div>

          {/* Master Industrial Equipment Composite Banner */}
          <div className="relative z-10 mt-8 pt-6 border-t border-slate-700/80 flex flex-col lg:flex-row items-center justify-between gap-6 bg-slate-800/60 rounded-2xl p-4 sm:p-6 border border-slate-700">
            <div className="lg:max-w-md">
              <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Comprehensive Industrial Equipments Source
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                From high-speed bearings to extreme-torque belts, geared motors, and industrial transmission drives — all under one roof at Balumuni and Associates.
              </p>
            </div>
            <div className="w-full lg:max-w-xl bg-white p-2 rounded-xl shadow-md border border-slate-300 overflow-hidden">
              <img
                src="/brands/industrial-equipments-brands.png"
                alt="Balumuni and Associates - Industrial Equipments Brand Partners"
                className="w-full h-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3.1 Authorized Brands ("Make") Showcase with Discounts */}
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

      {/* 4. Interactive MRP Discount & Net Price Calculator - Light Blue Theme */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-blue-50/95 via-sky-50/90 to-blue-100/70 rounded-3xl p-8 md:p-12 text-slate-900 shadow-xl relative overflow-hidden border border-blue-200/80 backdrop-blur-md">
          {/* Subtle rotating gear silhouette and glowing ambient light backdrop */}
          <div className="absolute -right-20 -top-20 w-80 h-80 border-2 border-dashed border-blue-400/20 rounded-full animate-spin-slow pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

          {/* Clean transparent industrial background image */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1600&q=80"
              alt=""
              className="w-full h-full object-cover object-center opacity-15"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/95 via-sky-50/80 to-white/70" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Explainer */}
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-300/80 text-primary font-black text-xs shadow-xs">
                <Calculator className="w-3.5 h-3.5 text-primary animate-pulse" />
                Live Wholesale Pricing Engine
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-navy">
                Instant MRP Discount & Savings Calculator
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Test any official price list MRP across our brands. See your exact net B2B wholesale rate with our guaranteed 45% - 48% discount schedule (or flat 10% on SKF Genuine) and zero shipping fees.
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PIX, NBC, HCH, Fenner & Timken: <strong className="text-primary font-black">46% off MRP</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SKF Bearings: <strong className="text-primary font-black">Flat 10% off MRP</strong> (National & International)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pan-India <strong className="text-emerald-700 font-black">Delhivery Logistics 100% Free</strong></span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Widget */}
            <div className="lg:col-span-7 bg-white/95 backdrop-blur-md text-darkText rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-100/90 space-y-6">
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
              <div className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-5 border border-blue-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center shadow-xs">
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

      {/* 6. Special Spotlight: Timken All-Types & SKF Origin - Light Theme */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timken Spotlight - Light Amber/Gold & Slate Card */}
          <div className="bg-gradient-to-br from-amber-50/95 via-orange-50/70 to-white backdrop-blur-md rounded-3xl p-8 text-slate-900 relative overflow-hidden shadow-xl flex flex-col justify-between border border-amber-200/90 hover:border-amber-400 hover:shadow-2xl transition-all duration-300">
            {/* Subtle background industrial bearing graphic */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80"
                alt=""
                className="w-full h-full object-cover object-center opacity-15"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50/95 via-amber-50/80 to-transparent" />
            </div>

            <div className="space-y-4 relative z-10">
              <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider inline-block shadow-xs">
                Timken Make — All Types Available
              </span>
              <h3 className="text-2xl font-black text-slate-950">
                Featured 6313 Open Type & Full Timken Range
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
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
                <Button variant="secondary" size="sm" className="bg-white text-slate-800 hover:bg-amber-100 border border-amber-300 font-bold inline-flex items-center gap-1.5 shadow-xs hover:scale-[1.02] transition-smooth">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                  <span>Custom Timken RFQ</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* SKF Spotlight - Light Blue Theme Card */}
          <div className="bg-gradient-to-br from-blue-50/95 via-sky-50/70 to-white backdrop-blur-md rounded-3xl p-8 text-slate-900 relative overflow-hidden shadow-xl flex flex-col justify-between border border-blue-200/90 hover:border-primary/60 hover:shadow-2xl transition-all duration-300">
            {/* Transparent background image */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
                alt=""
                className="w-full h-full object-cover object-center opacity-15"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/95 via-sky-50/80 to-transparent" />
            </div>

            <div className="space-y-4 relative z-10">
              <span className="bg-blue-600 text-white font-black text-xs px-3 py-1 rounded-md uppercase tracking-wider inline-block shadow-xs">
                SKF Make — National & International Stock
              </span>
              <h3 className="text-2xl font-black text-navy">
                Genuine SKF 7322 & 7322 2X Angular Contact
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
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
                <Button variant="secondary" size="sm" className="bg-white text-slate-800 hover:bg-blue-100 border border-blue-300 font-bold inline-flex items-center gap-1.5 shadow-xs hover:scale-[1.02] transition-smooth">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
