import React, { useState, useEffect, useRef } from 'react';
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
  HardHat,
  TrainFront,
  Plane,
  Bus,
  X,
  RotateCcw,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { ScrapPriceTable } from '../../components/common/ScrapPriceTable';
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
    section: 'Industrial V-Belts & Drives',
    discount: '48% OFF MRP',
    discountNum: 48,
    delivery: 'Insured Logistics',
    popularParts: ['SPC 2360', '8V-1900', 'SPC PT 3150', 'C 70'],
    color: 'from-amber-500/20 to-amber-600/10 border-amber-300',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    name: 'JK Fenner',
    title: 'J.K. Fenner (India) Limited',
    section: 'Belts, Pulleys & Couplings',
    discount: '25% - 48% OFF',
    discountNum: 25,
    delivery: 'Insured Logistics',
    popularParts: ['200 X 3C (2517)', 'C 70', 'SPC PT 3150', 'Fenner PB Belts'],
    color: 'from-rose-500/20 to-rose-600/10 border-rose-300',
    tagColor: 'bg-rose-100 text-rose-900 border-rose-300',
  },
  {
    name: 'Diamond',
    title: 'Diamond Industrial Chains',
    section: 'Roller Chains & Sprockets',
    discount: 'Wholesale Rates',
    discountNum: 40,
    delivery: 'Insured Logistics',
    popularParts: ['Single Strand', 'Double Strand', 'Simplex/Duplex', 'Industrial Sprockets'],
    color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-300',
    tagColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  },
  {
    name: 'NBC',
    title: 'NBC Bearings (NEI)',
    section: 'Ball & Taper Roller Bearings',
    discount: '48% OFF MRP',
    discountNum: 48,
    delivery: 'Insured Logistics',
    popularParts: ['6405ZZ C3', '6205', '6308', 'Tapered Roller Sets'],
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-300',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    name: 'FAG',
    title: 'FAG Bearings (Schaeffler)',
    section: 'Spherical & Cylindrical Bearings',
    discount: '48% OFF MRP',
    discountNum: 48,
    delivery: 'Insured Logistics',
    popularParts: ['Spherical Roller', 'Plummer Block', 'Cylindrical Roller', 'Heavy Industrial'],
    color: 'from-teal-500/20 to-teal-600/10 border-teal-300',
    tagColor: 'bg-teal-100 text-teal-900 border-teal-300',
  },
  {
    name: 'SKF',
    title: 'SKF India Limited',
    section: 'Deep Groove & Roller Bearings',
    discount: 'Flat 10% OFF',
    discountNum: 10,
    delivery: 'Insured Delivery',
    popularParts: ['7322 2X', '7322', 'Deep Groove Ball', 'Plummer Units'],
    color: 'from-blue-500/20 to-blue-600/10 border-blue-300',
    tagColor: 'bg-blue-100 text-blue-900 border-blue-300',
  },
  {
    name: 'Timken',
    title: 'The Timken Company',
    section: 'Tapered Roller & Heavy Bearings',
    discount: '48% OFF MRP',
    discountNum: 48,
    delivery: 'Insured Logistics',
    popularParts: ['6313 Open Type', 'Tapered Sets', 'Crusher Duty', 'Heavy Thrust'],
    color: 'from-orange-500/20 to-orange-600/10 border-orange-300',
    tagColor: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  {
    name: 'NTN',
    title: 'NTN Bearing Corporation',
    section: 'High-Precision Machine Bearings',
    discount: 'Best Market Rates',
    discountNum: 42,
    delivery: 'Insured Logistics',
    popularParts: ['Precision Ball', 'Needle Roller', 'Pillow Blocks', 'High-RPM Series'],
    color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-300',
    tagColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  },
  {
    name: 'Siemens',
    title: 'Siemens Industrial Drives & Motors',
    section: 'Energy Efficient IE2/IE3 Motors',
    discount: 'Project Discounts',
    discountNum: 35,
    delivery: 'Direct Transport',
    popularParts: ['IE2 3-Phase', 'IE3 Induction', 'Cast Iron Frames', 'Foot & Flange'],
    color: 'from-emerald-600/20 to-emerald-700/10 border-emerald-400',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    name: 'Crompton',
    title: 'Crompton Greaves Consumer & Ind.',
    section: 'Heavy Duty Induction Motors',
    discount: 'Wholesale B2B',
    discountNum: 35,
    delivery: 'Direct Transport',
    popularParts: ['Crane Duty', 'Flameproof Motors', 'Foot Mounted', 'Flange Mounted'],
    color: 'from-sky-500/20 to-sky-600/10 border-sky-300',
    tagColor: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  {
    name: 'ABB',
    title: 'ABB India Limited',
    section: 'High Efficiency IE3 / IE4 Motors',
    discount: 'Industrial Rates',
    discountNum: 35,
    delivery: 'Direct Transport',
    popularParts: ['Process Performance', 'General Machinery', 'IP55 Protection', 'Low Voltage AC'],
    color: 'from-red-500/20 to-red-600/10 border-red-300',
    tagColor: 'bg-red-100 text-red-900 border-red-300',
  },
  {
    name: 'Bharat Bijlee',
    title: 'Bharat Bijlee Limited',
    section: 'Heavy Duty AC Motors & Drives',
    discount: 'Standard Pricing',
    discountNum: 35,
    delivery: 'Direct Transport',
    popularParts: ['Synchro-Drives', 'Dual Insulation', 'Heavy AC Motors', 'Plant Machinery'],
    color: 'from-amber-600/20 to-amber-700/10 border-amber-400',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    name: 'Shanthi Gears',
    title: 'Shanthi Gears (Murugappa)',
    section: 'Industrial Gearboxes & Spares',
    discount: 'OEM Pricing',
    discountNum: 30,
    delivery: 'Insured Logistics',
    popularParts: ['Helical Reducers', 'Worm Gearboxes', 'Bevel Gearboxes', 'Custom Drive Spares'],
    color: 'from-violet-500/20 to-violet-600/10 border-violet-300',
    tagColor: 'bg-violet-100 text-violet-900 border-violet-300',
  },
  {
    name: 'Vignesh Gears',
    title: 'Vignesh Gears & Transmission',
    section: 'Industrial Pinions & Spur Gears',
    discount: 'Direct Factory',
    discountNum: 30,
    delivery: 'Insured Logistics',
    popularParts: ['Spur Gears', 'Internal Ring Gears', 'Planetary Pinions', 'Precision Cut Gears'],
    color: 'from-slate-500/20 to-slate-600/10 border-slate-300',
    tagColor: 'bg-slate-100 text-slate-900 border-slate-300',
  },
];

const allFourteenBrands = [
  {
    id: 'pix',
    name: 'PIX',
    fullName: 'PIX Transmissions Ltd',
    logo: '/brands/individual/pix.png',
    category: 'Industrial V-Belts & Drives',
    badge: 'Industrial Dealer',
    discount: '45% - 48% OFF',
  },
  {
    id: 'jk-fenner',
    name: 'JK Fenner',
    fullName: 'J.K. Fenner (India) Limited',
    logo: '/brands/individual/jk-fenner.png',
    category: 'Belts, Pulleys & Couplings',
    badge: 'Industrial Stockist',
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
    id: 'fag',
    name: 'FAG',
    fullName: 'FAG Bearings (Schaeffler)',
    logo: '/brands/individual/fag.png',
    category: 'Spherical & Cylindrical Bearings',
    badge: 'Industrial Stockist',
    discount: 'Volume Discounts',
  },
  {
    id: 'skf',
    name: 'SKF',
    fullName: 'SKF India Limited',
    logo: '/brands/individual/skf.png',
    category: 'Deep Groove & Roller Bearings',
    badge: 'Genuine Stockist',
    discount: 'Flat 10% OFF',
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
    id: 'siemens',
    name: 'Siemens',
    fullName: 'Siemens Industrial Drives & Motors',
    logo: '/brands/individual/siemens.png',
    category: 'Energy Efficient IE2/IE3 Motors',
    badge: 'Channel Partner',
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
    id: 'abb',
    name: 'ABB',
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
    badge: 'Industrial Partner',
    discount: 'Standard Pricing',
  },
  {
    id: 'shanthi-gears',
    name: 'Shanthi Gears',
    fullName: 'Shanthi Gears (Murugappa)',
    logo: '/brands/individual/shanthi-gears.png',
    category: 'Industrial Gearboxes & Spares',
    badge: 'Industrial Partner',
    discount: 'OEM Pricing',
  },
  {
    id: 'vignesh-gears',
    name: 'Vignesh Gears',
    fullName: 'Vignesh Gears & Transmission',
    logo: '/brands/individual/vignessh-gears.png',
    category: 'Industrial Pinions & Spur Gears',
    badge: 'Regional Partner',
    discount: 'Direct Factory',
  },
];

const travelSlides = [
  {
    id: 'gst',
    type: 'GST Invoicing Desk',
    badge: 'Official GSTIN: 33HONPK5547G2ZK',
    title: 'B2B GST Tax Invoicing & Compliance',
    subtitle: 'Official 18% Input Tax Credit (ITC) tax invoices for all industrial equipment purchases, vendor filings, and company tax compliance.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
    fallbackImage: '/balumuni-visiting-card.png',
    icon: FileSpreadsheet,
    route: '/rfq?service=gst',
    highlights: ['18% Full ITC Benefit', 'Instant GST E-Way Bills', 'Corporate Compliance'],
    btnText: 'Inquire GST Invoicing',
    gradient: 'from-amber-900 via-amber-950 to-slate-950',
    tagColor: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  },
  {
    id: 'train',
    type: 'Train Ticket Booking',
    badge: 'IRCTC Indian Railways Desk',
    title: 'Indian Railways Train Bookings',
    subtitle: 'Confirmed reservations for 1A, 2A, 3A, and Sleeper berths across all trains with Tatkal and Ladies quota support.',
    image: 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&w=1000&q=80',
    fallbackImage: '/banners/img4.jpg',
    icon: TrainFront,
    route: '/ticket-booking/train',
    highlights: ['Tatkal & General Quota', 'All Class AC & Sleeper', 'Instant PNR Updates'],
    btnText: 'Book Train Tickets',
    gradient: 'from-emerald-900 via-teal-950 to-slate-950',
    tagColor: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
  },
  {
    id: 'flight',
    type: 'Flight Ticket Booking',
    badge: 'Domestic & International Flights',
    title: 'Air Ticket Booking Desk',
    subtitle: 'Corporate & personal flight reservations on Indigo, Air India, Vistara, and international carriers at competitive rates.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80',
    fallbackImage: '/banners/img2.png',
    icon: Plane,
    route: '/ticket-booking/flight',
    highlights: ['Economy & Business Class', 'GST Invoice for ITC Claim', 'Direct & Connecting Flights'],
    btnText: 'Book Flights Now',
    gradient: 'from-blue-900 via-sky-950 to-slate-950',
    tagColor: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  },
  {
    id: 'bus',
    type: 'Bus Ticket Booking',
    badge: 'Intercity AC Sleeper & Volvo',
    title: 'Intercity Bus Ticket Booking',
    subtitle: 'Comfortable overnight Volvo Multi-Axle, Scania and luxury AC Sleeper coaches connecting major cities nationwide.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
    fallbackImage: '/banners/img3.jpg',
    icon: Bus,
    route: '/ticket-booking',
    highlights: ['Multi-Axle Volvo & AC Sleeper', 'Convenient Pick-up Points', '24/7 Helpline Support'],
    btnText: 'Book Bus Tickets',
    gradient: 'from-indigo-900 via-purple-950 to-slate-950',
    tagColor: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  },
];

const defaultProductCategories = [
  {
    id: 'bearings',
    name: 'Industrial Bearings',
    subtitle: 'Deep Groove, Angular Contact & Roller Bearings',
    brands: 'SKF • NBC • TIMKEN • FAG',
    image: '/bearings/img10.jpg',
    badge: '100% Genuine Certified',
    discount: '45% - 48% OFF (SKF 10% OFF)',
    popularSizes: ['7322', '7322 2X', '6313', '6405ZZ', '6205'],
    link: '/services?category=bearings',
    searchKey: 'bearing',
  },
  {
    id: 'belts',
    name: 'Power Transmission Belts',
    subtitle: 'High-Torque Classical, Metric Wedge & 8V Series',
    brands: 'PIX TRANSMISSIONS • JK FENNER',
    image: '/belts/PIX SPC PT 3150 Power Transmission.jpg',
    badge: 'High Endurance Rubber',
    discount: '45% - 48% OFF MRP',
    popularSizes: ['SPC 2360', '8V-1900', 'C 70', 'SPC PT 3150', 'SPB'],
    link: '/services?category=belts',
    searchKey: 'belt',
  },
  {
    id: 'bush-pulleys',
    name: 'Bush Pulleys & Couplings',
    subtitle: 'Dynamically Balanced Taper Lock Grooved Pulleys',
    brands: 'JK FENNER • PRECISION BUILT',
    image: '/bannerImages/diamondRollerChain.jpg',
    badge: 'Precision Dynamic Balance',
    discount: '45% - 48% OFF MRP',
    popularSizes: ['200 X 3C (2517)', '2517 Bush', 'Taper Bore', 'PB Pulleys'],
    link: '/services?category=bush-pulleys',
    searchKey: 'pulley',
  },
];

export const HomePage = () => {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [travelSlideIdx, setTravelSlideIdx] = useState(0);
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  // Products Section Category Search States
  const [productSearchInput, setProductSearchInput] = useState('');
  const [submittedProductSearch, setSubmittedProductSearch] = useState('');

  const handleProductSearch = (e) => {
    if (e) e.preventDefault();
    setSubmittedProductSearch(productSearchInput.trim());
  };

  const handleClearProductSearch = () => {
    setProductSearchInput('');
    setSubmittedProductSearch('');
  };

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

  // All 14 Authentic Industrial Banners directly mapped to images from bannerImages folder
  const industrialBannerSlides = [
    {
      id: 'pix',
      image: '/bannerImages/pix.jpg',
      badgeText: 'PIX TRANSMISSIONS • INDUSTRIAL BELT SPECIALIST',
      title: 'PIX Heavy Duty Wrapped & Narrow Wedge V-Belts',
      subtitle: 'Comprehensive range of PIX Classical (A, B, C, D, E), Space-Saver Wedge (SPZ, SPA, SPB, SPC), and Molded Cogged belts. Oil, heat, and flame-retardant with maximum tensile cord endurance.',
      ctaText: 'Explore PIX Belts',
      ctaLink: '/services?search=PIX',
      secondaryCtaText: 'Request Bulk RFQ',
      secondaryCtaLink: '/rfq?brand=PIX',
    },
    {
      id: 'jkFenner',
      image: '/bannerImages/jkFenner.webp',
      badgeText: 'JK FENNER • POWER TRANSMISSION & DRIVES',
      title: 'JK Fenner Industrial Belts & Precision Pulleys',
      subtitle: 'Official JK Fenner high-torque wrapped belts, raw-edge molded cogged belts, and taper-lock bush pulleys. Engineered for zero slip, whisper-quiet dampening, and heavy manufacturing uptime.',
      ctaText: 'Explore JK Fenner',
      ctaLink: '/services?search=Fenner',
      secondaryCtaText: 'Wholesale Price List',
      secondaryCtaLink: '/mrp-pricing',
    },
    {
      id: 'diamond',
      image: '/bannerImages/diamondRollerChain.jpg',
      badgeText: 'DIAMOND CHAINS • INDUSTRIAL TRANSMISSION',
      title: 'Diamond Precision Roller Chains & Conveyor Sprockets',
      subtitle: 'Original TII Diamond industrial roller chains manufactured to BS & ANSI standards. Shot-peened pins and bushings deliver exceptional wear resistance under continuous plant operating loads.',
      ctaText: 'Browse Diamond Chains',
      ctaLink: '/services?search=Diamond',
      secondaryCtaText: 'Request Quotation',
      secondaryCtaLink: '/rfq?brand=Diamond',
    },
    {
      id: 'nbc',
      image: '/bannerImages/nbcandTapper role.webp',
      badgeText: 'NBC BEARINGS • TAPERED ROLLER & BALL BEARINGS',
      title: 'NBC Deep Groove & Heavy Tapered Roller Bearings',
      subtitle: 'National Engineering Industries (NBC) premium ball bearings, cylindrical rollers, and heavy tapered roller sets. Designed for heavy radial shock loads in cement, steel, and textile machinery.',
      ctaText: 'Explore NBC Bearings',
      ctaLink: '/services?search=NBC',
      secondaryCtaText: 'View B2B Discounts',
      secondaryCtaLink: '/mrp-pricing',
    },
    {
      id: 'fag',
      image: '/bannerImages/fagSperhical.jpg',
      badgeText: 'FAG SCHAEFFLER • PRECISION SPHERICAL BEARINGS',
      title: 'FAG Spherical Roller Bearings & Plummer Blocks',
      subtitle: 'German-engineered FAG spherical roller bearings with symmetrical barrel rollers and brass cages. Built to accommodate heavy shaft deflection and continuous high-temperature manufacturing.',
      ctaText: 'Explore FAG Lineup',
      ctaLink: '/services?search=FAG',
      secondaryCtaText: 'Download Catalog',
      secondaryCtaLink: '/services',
    },
    {
      id: 'skf',
      image: '/bannerImages/skf.jpg',
      badgeText: 'SKF AUTHENTIC PROVENANCE • FLAT 10% OFF',
      title: 'SKF Premium Industrial Bearings & Units',
      subtitle: 'World-benchmark SKF deep groove ball bearings, angular contact bearings, and plummer block units. Direct supply with original laser markings, security holograms, and 100% genuine guaranteed.',
      ctaText: 'Explore SKF Bearings',
      ctaLink: '/services?search=SKF',
      secondaryCtaText: 'Get Official Quote',
      secondaryCtaLink: '/rfq?brand=SKF',
    },
    {
      id: 'timken',
      image: '/bannerImages/timken.jpg',
      badgeText: 'TIMKEN USA • HEAVY DUTY TAPERED ROLLERS',
      title: 'Timken High-Load Tapered Roller Bearings',
      subtitle: 'Genuine Timken tapered roller bearings for stone crushers, rolling mills, mining equipment, and gearboxes. Maximum dynamic load ratings and extended operating life under extreme thrust.',
      ctaText: 'Explore Timken',
      ctaLink: '/services?search=Timken',
      secondaryCtaText: 'Request B2B RFQ',
      secondaryCtaLink: '/rfq?brand=Timken',
    },
    {
      id: 'ntn',
      image: '/bannerImages/NTN.jpg',
      badgeText: 'NTN JAPAN • HIGH-SPEED PRECISION BEARINGS',
      title: 'NTN Premium Ball, Roller & Flange Bearing Units',
      subtitle: 'Ultra-precision NTN deep groove ball bearings, needle roller bearings, and pillow block units. Engineered with micro-finished raceways for whisper-quiet high-RPM performance.',
      ctaText: 'Explore NTN Bearings',
      ctaLink: '/services?search=NTN',
      secondaryCtaText: 'Check Price List',
      secondaryCtaLink: '/mrp-pricing',
    },
    {
      id: 'siemens',
      image: '/bannerImages/siemens.jpg',
      badgeText: 'SIEMENS • IE2 / IE3 ENERGY EFFICIENT MOTORS',
      title: 'Siemens 3-Phase Industrial Induction Motors',
      subtitle: 'Siemens premium energy-efficient electric motors conforming to IS/IEC standards. Rugged cast-iron construction, high starting torque, and continuous duty reliability for factory automation.',
      ctaText: 'Explore Siemens Motors',
      ctaLink: '/services?search=Siemens',
      secondaryCtaText: 'Request Motor RFQ',
      secondaryCtaLink: '/rfq?brand=Siemens',
    },
    {
      id: 'crompton',
      image: '/bannerImages/crompton.jpg',
      badgeText: 'CROMPTON GREAVES • INDUSTRIAL ELECTRIC MOTORS',
      title: 'Crompton Greaves Foot & Flange Mounted Motors',
      subtitle: 'Crompton Greaves high-efficiency 3-phase induction motors, crane-duty drives, and flameproof motors. Superior copper windings and thermal protection for challenging plant conditions.',
      ctaText: 'Explore Crompton',
      ctaLink: '/services?search=Crompton',
      secondaryCtaText: 'Bulk Enquiry',
      secondaryCtaLink: '/rfq?brand=Crompton',
    },
    {
      id: 'abb',
      image: '/bannerImages/ABB.jpg',
      badgeText: 'ABB DRIVES • HIGH EFFICIENCY ELECTRIC MOTORS',
      title: 'ABB Process Performance & General Machinery Motors',
      subtitle: 'High reliability ABB low-voltage induction motors with IP55 ingress protection. Designed for exceptional energy savings, low vibration, and extended maintenance-free operation.',
      ctaText: 'Explore ABB Motors',
      ctaLink: '/services?search=ABB',
      secondaryCtaText: 'Request Quotation',
      secondaryCtaLink: '/rfq?brand=ABB',
    },
    {
      id: 'bharatBijlee',
      image: '/bannerImages/bharath Bijili.jpg',
      badgeText: 'BHARAT BIJLEE • TRUSTED POWER TRANSMISSION',
      title: 'Bharat Bijlee Robust Industrial Electric Motors',
      subtitle: 'Bharat Bijlee heavy industrial 3-phase motors and synchro-drives. Heavy cast-iron frames, dual insulation, and precision-balanced rotors for heavy textile, steel, and paper plant machinery.',
      ctaText: 'View Bharat Bijlee',
      ctaLink: '/services?search=Bharat+Bijlee',
      secondaryCtaText: 'Get B2B Quote',
      secondaryCtaLink: '/rfq',
    },
    {
      id: 'shanthiGears',
      image: '/bannerImages/santhiGears.jpg',
      badgeText: 'SHANTHI GEARS (TII GROUP) • HEAVY SPEED REDUCERS',
      title: 'Shanthi Gears Helical, Bevel & Worm Reduction Gearboxes',
      subtitle: 'Precision case-carburized and ground helical and worm speed reducers from Shanthi Gears. Engineered for continuous high-torque speed reduction in heavy industrial drives.',
      ctaText: 'Explore Shanthi Gears',
      ctaLink: '/services?search=Shanthi',
      secondaryCtaText: 'Custom Gearbox RFQ',
      secondaryCtaLink: '/rfq?brand=Shanthi',
    },
    {
      id: 'vigneshGears',
      image: '/bannerImages/vignesh Gears.jpg',
      badgeText: 'VIGNESH GEARS • PRECISION INDUSTRIAL TRANSMISSION',
      title: 'Vignesh Gears Custom Spur, Helical & Bevel Gears',
      subtitle: 'Custom precision-cut spur gears, helical drive gears, internal ring gears, and planetary pinions manufactured to exact mill tolerances for heavy machinery drives.',
      ctaText: 'Explore Vignesh Gears',
      ctaLink: '/services?search=Vignesh',
      secondaryCtaText: 'Submit Gear Specs',
      secondaryCtaLink: '/rfq?brand=Vignesh',
    },
  ];

  const activeBannersList = industrialBannerSlides;
  const currentBanner = activeBannersList[activeBannerIdx % activeBannersList.length] || industrialBannerSlides[0];

  // Banner autoplay
  useEffect(() => {
    if (activeBannersList.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % activeBannersList.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [activeBannersList.length]);

  // Auto-scroll travel slides (Train, Flight, Bus) every 4.5 seconds
  useEffect(() => {
    const travelTimer = setInterval(() => {
      setTravelSlideIdx((prev) => (prev + 1) % travelSlides.length);
    }, 4500);
    return () => clearInterval(travelTimer);
  }, []);

  // Synchronize category card and image while scrolling
  const lastScrollPos = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentPos = window.scrollY;
      // Cycle category based on scroll position inside hero banner area (0 - 600px)
      if (currentPos < 650 && Math.abs(currentPos - lastScrollPos.current) > 100) {
        const index = Math.floor(currentPos / 100) % activeBannersList.length;
        setActiveBannerIdx(index);
        lastScrollPos.current = currentPos;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeBannersList.length]);

  const handlePrevSlide = () => {
    setActiveBannerIdx((prev) => (prev - 1 + activeBannersList.length) % activeBannersList.length);
  };

  const handleNextSlide = () => {
    setActiveBannerIdx((prev) => (prev + 1) % activeBannersList.length);
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
            e.target.src = '/bannerImages/pix.jpg';
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
            alt={currentBanner.title || currentBanner.badgeText || 'Hero Banner'}
            className="w-full h-full object-cover object-center opacity-95 scale-100 transition-all duration-1000 ease-out"
            onError={(e) => {
              e.target.src = '/bannerImages/pix.jpg';
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
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-blue-900/60 hover:bg-blue-900/90 text-white flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-md opacity-80 hover:opacity-100 transition-all duration-200"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-accent" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-blue-900/60 hover:bg-blue-900/90 text-white flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-md opacity-80 hover:opacity-100 transition-all duration-200"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-accent" />
        </button>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8 md:py-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Dynamic Category-Based Card synced with Image Slider - Compact with Reduced Unwanted Space */}
            <div key={activeBannerIdx} className="lg:col-span-6 space-y-3 sm:space-y-3.5 max-w-lg animate-fadeIn transition-all duration-500">
              {/* Badge */}
              {currentBanner.badgeText && (
                <div className="animate-fadeIn">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/85 border border-blue-400/40 text-amber-300 font-black text-xs uppercase tracking-wider backdrop-blur-md shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                    {currentBanner.badgeText}
                  </span>
                </div>
              )}

              {/* Title Directly Linked to Displayed Image */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-snug drop-shadow-md">
                {currentBanner.title}
              </h1>

              {/* Subtitle / Description Card - Compact & Reduced Unwanted Space */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-blue-950/75 backdrop-blur-md border border-white/20 shadow-lg max-w-md animate-fadeIn">
                <p className="text-white text-xs sm:text-[13px] leading-relaxed font-semibold drop-shadow-xs line-clamp-3">
                  {currentBanner.subtitle}
                </p>
              </div>

              {/* Action Buttons - Request Quotation */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-0.5 animate-fadeIn">
                <Link to={currentBanner.ctaLink || '/services'} className="w-full sm:w-auto">
                  <Button variant="accent" size="md" className="w-full font-bold inline-flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] transition-smooth text-xs">
                    <span>{currentBanner.ctaText || 'Browse All Products'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link to={currentBanner.secondaryCtaLink || '/rfq'} className="w-full sm:w-auto">
                  <Button variant="secondary" size="md" className="w-full bg-blue-950/75 text-white hover:bg-blue-950/95 border border-white/25 backdrop-blur-md font-bold inline-flex items-center justify-center gap-1.5 text-xs shadow-md">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-accent" />
                    <span>{currentBanner.secondaryCtaText || 'Request Quotation'}</span>
                  </Button>
                </Link>
              </div>

              {/* Banner navigation indicator dots & slide counter */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-black text-amber-300 bg-blue-950/85 px-2.5 py-0.5 rounded-full border border-blue-400/30 shrink-0">
                  Slide {((activeBannerIdx % activeBannersList.length) + 1).toString().padStart(2, '0')} / {activeBannersList.length}
                </span>
                <div className="flex items-center gap-1 overflow-x-auto max-w-xs scrollbar-none py-0.5">
                  {activeBannersList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBannerIdx(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 shrink-0 ${
                        idx === (activeBannerIdx % activeBannersList.length)
                          ? 'w-5 bg-accent shadow-sm'
                          : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Transparent 3 Columns x 10 Rows Scrap Material Price Table */}
            <div className="lg:col-span-6 animate-fadeIn">
              <ScrapPriceTable />
            </div>

          </div>
        </div>
      </section>

      {/* 2. Commercial Trust Bar (Translucent Glass Panel) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-center gap-4 border-b sm:border-b-0 lg:border-r border-slate-200/70 pb-4 sm:pb-0 lg:pr-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-smooth shadow-xs">
              <BadgePercent className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-darkText group-hover:text-primary transition-smooth">45% - 48% Off MRP</h4>
              <p className="text-xs text-secondaryText">On PIX, Fenner, NBC, HCH & Timken</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-b sm:border-b-0 lg:border-r border-slate-200/70 pb-4 sm:pb-0 lg:pr-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-smooth shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-darkText group-hover:text-primary transition-smooth">Fast Logistics Dispatch</h4>
              <p className="text-xs text-secondaryText">Insured nationwide express courier</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-b sm:border-b-0 lg:border-r border-slate-200/70 pb-4 sm:pb-0 lg:pr-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-smooth shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-darkText group-hover:text-primary transition-smooth">100% Genuine Products</h4>
              <p className="text-xs text-secondaryText">Factory serial verification</p>
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
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-blue-400/40 text-white relative overflow-hidden">
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
                Stockist & Dealer Network
              </h2>
              <p className="text-sm text-slate-300 mt-2 max-w-3xl">
                <span className="text-yellow-400 font-bold">Balumuni and Associates</span> is proud to supply 100% genuine products directly sourced from India's premier industrial equipment, bearing, belt, gear, and motor manufacturers.
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

          {/* Master Industrial Equipment Section & Direct Travel Navigation */}
          <div className="relative z-10 mt-8 pt-6 border-t border-slate-700/80 flex flex-col lg:flex-row items-center justify-between gap-6 bg-slate-800/60 rounded-2xl p-4 sm:p-6 border border-slate-700">
            <div className="lg:max-w-md space-y-3">
              <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Comprehensive Industrial Equipments Source
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                From high-speed bearings to extreme-torque belts, geared motors, and industrial transmission drives — all under one roof at <span className="text-yellow-400 font-bold">Balumuni and Associates</span>.
              </p>

              {/* Navigation Option to Access Travels Section */}
              <div className="pt-1">
                <Link
                  to="/ticket-booking"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md group cursor-pointer"
                >
                  <TrainFront className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                  <span>Looking for Travel Desk? Book Flights & Trains</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="w-full lg:max-w-xl bg-white p-3.5 rounded-2xl shadow-xl border border-slate-200">
              <div className="text-center font-black text-[11px] text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1 flex items-center justify-center gap-1.5">
                <span>INDUSTRIAL EQUIPMENTS • 14 AUTHORIZED MAKES</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {allFourteenBrands.map((b) => (
                  <Link
                    key={b.id}
                    to={`/services?search=${encodeURIComponent(b.name)}`}
                    className="h-11 p-1 flex items-center justify-center bg-slate-50 hover:bg-blue-50/80 rounded-xl border border-slate-200/60 transition-all hover:scale-105"
                    title={b.fullName}
                  >
                    <img src={b.logo} alt={b.name} className="max-h-full max-w-full object-contain" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.1 Authorized Brands ("Make") Showcase with Discounts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Stockist & Distributors
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

      {/* 4.5 Dual Card Section: Travel Booking Carousel + Quick Service Portal (GST, Train, Bus, Flight) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Card 1 (Left Division): Interactive Booking Slide Carousel with Prominent Related Images */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-5 sm:p-7 border border-blue-800/60 shadow-2xl text-white relative overflow-hidden flex flex-col justify-between group">
            <div className="space-y-4">
              {/* Prominent High-Resolution Image Preview of Current Booking Service */}
              <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-white/20 shadow-md bg-slate-950 group/img">
                <img
                  key={travelSlides[travelSlideIdx].image}
                  src={travelSlides[travelSlideIdx].image}
                  alt={travelSlides[travelSlideIdx].title}
                  className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover/img:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = travelSlides[travelSlideIdx].fallbackImage || '/banners/img4.jpg';
                  }}
                />
                {/* Light gradient vignette to keep image clear and text legible */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                {/* Overlaid Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-md backdrop-blur-md ${travelSlides[travelSlideIdx].tagColor}`}>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>{travelSlides[travelSlideIdx].badge}</span>
                  </span>
                </div>

                {/* Overlaid Previous / Next Slide Controls */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTravelSlideIdx((prev) => (prev - 1 + travelSlides.length) % travelSlides.length)}
                    className="w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 border border-white/30 flex items-center justify-center text-white transition-colors cursor-pointer backdrop-blur-md"
                    aria-label="Previous Travel Mode"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTravelSlideIdx((prev) => (prev + 1) % travelSlides.length)}
                    className="w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 border border-white/30 flex items-center justify-center text-white transition-colors cursor-pointer backdrop-blur-md"
                    aria-label="Next Travel Mode"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Overlaid Category Pill at bottom of image */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-amber-400 text-slate-950 font-black shadow-md">
                    {React.createElement(travelSlides[travelSlideIdx].icon, { className: 'w-4 h-4' })}
                  </div>
                  <span className="text-xs font-black text-white drop-shadow-md">
                    {travelSlides[travelSlideIdx].type}
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
                  Official Service Desk Preview
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {travelSlides[travelSlideIdx].title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed font-medium min-h-[40px]">
                  {travelSlides[travelSlideIdx].subtitle}
                </p>
              </div>

              {/* Key Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {travelSlides[travelSlideIdx].highlights.map((h, i) => (
                  <div key={i} className="p-2 rounded-xl bg-white/10 border border-white/10 text-center">
                    <span className="text-[11px] font-bold text-white block leading-tight">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action & Tabs */}
            <div className="pt-4 mt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Slide Tabs: GST, Train, Bus, Flight */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {travelSlides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setTravelSlideIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                      idx === travelSlideIdx
                        ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {s.id.toUpperCase()}
                  </button>
                ))}
              </div>

              <Link to={travelSlides[travelSlideIdx].route} className="shrink-0">
                <Button
                  variant="accent"
                  size="md"
                  className="w-full sm:w-auto font-black text-xs px-4 py-2 shadow-md flex items-center justify-center gap-1.5 text-slate-950 bg-amber-400 hover:bg-amber-300 border border-amber-500"
                >
                  <span>{travelSlides[travelSlideIdx].btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2 (Right Division): Exact Order -> 1. GST, 2. Train, 3. Flight, 4. Bus */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 rounded-3xl p-5 sm:p-7 border border-blue-700/60 shadow-2xl text-white flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/15 gap-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Priority Booking &amp; Business Services
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                    Booking &amp; Services Portal
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full whitespace-nowrap">
                  Live Desk
                </span>
              </div>

              {/* 4 Items in EXACT Requested Order: 1. gst, 2. train, 3. flight, 4. bus */}
              <div className="space-y-2.5 mt-3.5">
                
                {/* 1. GST Service */}
                <div
                  onClick={() => setTravelSlideIdx(0)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    travelSlideIdx === 0
                      ? 'bg-white/15 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-white truncate">GST Invoicing &amp; Tax Desk</h4>
                        <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          18% ITC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">
                        GSTIN: 33HONPK5547G2ZK • Official B2B invoices &amp; vendor tax returns
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/rfq?service=gst"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-xs inline-flex items-center gap-1"
                  >
                    <span>Inquire</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 2. Train Ticket Booking */}
                <div
                  onClick={() => setTravelSlideIdx(1)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    travelSlideIdx === 1
                      ? 'bg-white/15 border-emerald-400 shadow-md ring-1 ring-emerald-400/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs">
                      <TrainFront className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-white truncate">Train Ticket Booking</h4>
                        <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                          IRCTC Desk
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">
                        1A, 2A, 3A &amp; Sleeper classes • Tatkal &amp; Ladies quota confirmed reservations
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/ticket-booking/train"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black transition-all shadow-xs inline-flex items-center gap-1"
                  >
                    <span>Book Train</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 3. Flight Ticket Booking */}
                <div
                  onClick={() => setTravelSlideIdx(2)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    travelSlideIdx === 2
                      ? 'bg-white/15 border-sky-400 shadow-md ring-1 ring-sky-400/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-white truncate">Flight Ticket Booking</h4>
                        <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded bg-sky-400/20 text-sky-200 border border-sky-400/30">
                          Air Desk
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">
                        Indigo, Air India, Vistara &amp; international carriers with corporate ITC invoice
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/ticket-booking/flight"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-black transition-all shadow-xs inline-flex items-center gap-1"
                  >
                    <span>Book Flight</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 4. Bus Ticket Booking */}
                <div
                  onClick={() => setTravelSlideIdx(3)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    travelSlideIdx === 3
                      ? 'bg-white/15 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-white truncate">Bus Ticket Booking</h4>
                        <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          Volvo &amp; AC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">
                        Intercity AC Volvo Multi-Axle, Scania and luxury Sleeper coaches nationwide
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/ticket-booking"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-xs inline-flex items-center gap-1"
                  >
                    <span>Book Bus</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            </div>

            {/* Bottom Support Link for Labour Insurance */}
            <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Looking for Labour Insurance?</span>
              <Link
                to="/labour-insurance"
                className="text-amber-300 hover:text-yellow-200 font-bold inline-flex items-center gap-1"
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>Statutory Policy Desk →</span>
              </Link>
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
                src="/bannerImages/timken.jpg"
                alt="Timken Bearings"
                className="w-full h-full object-cover object-center opacity-15"
                onError={(e) => {
                  e.target.src = '/bearings/img3.jpg';
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
                src="/banners/img1.jpg"
                alt="SKF industrial bearings"
                className="w-full h-full object-cover object-center opacity-20"
                onError={(e) => {
                  e.target.src = '/bearings/img1.jpg';
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

      {/* 7. Featured Industrial Products & Category Explorer (With Search & Freeze Effect Container) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-white/95 via-sky-50/70 to-blue-50/60 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-blue-200/80 shadow-[0_16px_45px_-12px_rgba(37,99,235,0.12)] relative overflow-hidden">
          {/* Subtle ice / freeze ambient accent */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-300/20 via-sky-200/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-sky-300/20 via-blue-200/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/90 border border-blue-200 text-blue-800 text-[11px] font-extrabold uppercase tracking-widest mb-2 shadow-2xs backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Verified Product Catalog &amp; Freeze Dispatch Inventory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-navy mt-1">
                Featured Bearings, Belts &amp; Pulleys
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Search by part number, size, or select a category below to explore its allocated profile &amp; verified inventory.
              </p>
            </div>
            <Link
              to="/services"
              className="text-xs font-bold text-primary hover:text-primary-dark mt-2 md:mt-0 flex items-center gap-1"
            >
              View Full 24+ Parts Catalog <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Dedicated Products & Category Search Bar with explicit Search Button */}
          <form
            onSubmit={handleProductSearch}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl mb-8 relative z-10"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search part #, make, size or category (e.g. 7322, SPC 2360, 6204, Belts, Bearings)..."
                value={productSearchInput}
                onChange={(e) => setProductSearchInput(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-blue-200 text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              />
              {productSearchInput && (
                <button
                  type="button"
                  onClick={handleClearProductSearch}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            {submittedProductSearch && (
              <button
                type="button"
                onClick={handleClearProductSearch}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </form>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {[1, 2, 3].map((n) => (
                <CardSkeleton key={n} />
              ))}
            </div>
          ) : submittedProductSearch ? (
            /* SEARCH ACTIVE VIEW: Show Matching Category Image Card + Matching Products */
            <div className="space-y-6 relative z-10">
              {(() => {
                const q = submittedProductSearch.toLowerCase().trim();
                const matchedCats = defaultProductCategories.filter(
                  (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.subtitle.toLowerCase().includes(q) ||
                    c.brands.toLowerCase().includes(q) ||
                    c.searchKey.toLowerCase().includes(q) ||
                    c.popularSizes.some((s) => s.toLowerCase().includes(q) || q.includes(s.toLowerCase()))
                );

                const matchedProducts = featuredServices.filter((s) => {
                  const nameMatch = (s.name || '').toLowerCase().includes(q);
                  const partMatch = (s.partNumber || '').toLowerCase().includes(q);
                  const brandMatch = (s.brand || '').toLowerCase().includes(q);
                  const catMatch = (s.category?.name || s.section || '').toLowerCase().includes(q);
                  return nameMatch || partMatch || brandMatch || catMatch;
                });

                if (matchedCats.length === 0 && matchedProducts.length === 0) {
                  return (
                    <div className="bg-white/80 rounded-2xl p-8 border border-slate-200 text-center space-y-3">
                      <p className="font-black text-slate-800 text-sm">
                        No products or categories matching "{submittedProductSearch}"
                      </p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Please check the part number or size code (e.g. 7322, SPC 2360, 6204), or explore our full catalog.
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleClearProductSearch}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-300 cursor-pointer"
                        >
                          Clear Search
                        </button>
                        <Link to={`/rfq?partNumber=${encodeURIComponent(submittedProductSearch)}`}>
                          <Button variant="accent" size="sm" className="font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950">
                            Submit RFQ for "{submittedProductSearch}"
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {/* Show matched category images */}
                    {matchedCats.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matchedCats.map((cat) => (
                          <div
                            key={cat.id}
                            className="bg-white rounded-3xl p-5 border border-blue-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                          >
                            <div className="space-y-3">
                              <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-3">
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/banners/img4.jpg';
                                  }}
                                />
                                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary text-white shadow-xs">
                                  {cat.badge}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mb-1">
                                  {cat.discount}
                                </span>
                                <h3 className="font-black text-lg text-navy group-hover:text-primary transition-colors">
                                  {cat.name}
                                </h3>
                                <p className="text-xs text-secondaryText mt-0.5 font-medium leading-relaxed">
                                  {cat.subtitle}
                                </p>
                              </div>
                              <div className="pt-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                  Popular Sizes &amp; Parts:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {cat.popularSizes.map((size) => (
                                    <span
                                      key={size}
                                      onClick={() => {
                                        setProductSearchInput(size);
                                        setSubmittedProductSearch(size);
                                      }}
                                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-primary hover:text-white text-[11px] font-mono font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs"
                                    >
                                      {size}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500">{cat.brands}</span>
                              <Link
                                to={cat.link}
                                className="inline-flex items-center gap-1 text-xs font-black text-primary hover:text-navy transition-colors"
                              >
                                <span>Explore Category</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show matching product cards if specific part was searched */}
                    {matchedProducts.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                          Matching Parts ({matchedProducts.length} items):
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {matchedProducts.slice(0, 6).map((service) => (
                            <ServiceCard key={service._id} service={service} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            /* DEFAULT VIEW: Show Category Image Cards Only (Category Images like in Category Search, not all raw products) */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {defaultProductCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl p-5 border border-blue-200/90 shadow-md hover:shadow-2xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Category Image Profile */}
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-3 group-hover:bg-blue-50/30 transition-colors">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/banners/img4.jpg';
                        }}
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary text-white shadow-xs">
                        {cat.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mb-1">
                        {cat.discount}
                      </span>
                      <h3 className="font-black text-lg text-navy group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-secondaryText mt-0.5 font-medium leading-relaxed">
                        {cat.subtitle}
                      </p>
                    </div>

                    {/* Popular Sizes / Parts under this Category */}
                    <div className="pt-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        Popular Section Sizes:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.popularSizes.map((size) => (
                          <span
                            key={size}
                            onClick={() => {
                              setProductSearchInput(size);
                              setSubmittedProductSearch(size);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-primary hover:text-white text-[11px] font-mono font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs"
                            title={`Search ${size}`}
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">{cat.brands}</span>
                    <Link
                      to={cat.link}
                      className="inline-flex items-center gap-1 text-xs font-black text-primary hover:text-navy transition-colors group-hover:translate-x-0.5"
                    >
                      <span>Explore Category</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10 relative z-10">
            <Link to="/services">
              <Button variant="outline" size="lg" className="font-bold inline-flex items-center gap-2 shadow-sm hover:scale-[1.02] transition-smooth bg-white/90 border-blue-300 hover:bg-blue-50 text-blue-900">
                <span>Explore Complete 24+ Parts Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
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
