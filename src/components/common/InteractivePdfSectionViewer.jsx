import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Layers,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  BadgePercent,
  Check,
  X,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import api, { getAssetUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatters';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';
import { contentService } from '../../services/contentService';

// Default authentic section images from local repository assets
const SECTION_IMAGE_MAP = {
  'section a': '/belts/pix-c-70.jpg',
  'section b': '/belts/PIX C 70 Classical V-Belt.jpg',
  'section c': '/belts/PIX C 70 Classical V-Belt.jpg',
  'section d': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  'section spz': '/belts/PIX SPC 2360 Wedge Belt.jpg',
  'section spa': '/belts/PIX SPC 2360 Wedge Belt.jpg',
  'section spb': '/belts/PIX SPC 2360 Wedge Belt.jpg',
  'section spc': '/belts/PIX SPC PT 3150 Power Transmission.jpg',
  'section 8v': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  'deep groove ball bearings': '/bearings/img10.jpg',
  'taper roller bearings': '/bannerImages/nbcandTapper role.webp',
  'spherical roller bearings': '/bearings/img3.jpg',
  'angular contact bearings': '/bearings/img1.jpg',
  'electric motors': '/bannerImages/siemens.jpg',
  'industrial gears': '/bannerImages/santhiGears.jpg',
};

const SECTION_SPEC_MAP = {
  'section a': {
    profile: '13mm Top Width × 8mm Thickness',
    angle: '40° V-Angle',
    pitchFactor: 'Pitch Length = Inside Length + 30mm',
    application: 'Industrial Machinery, Compressors, Lathes, Textile Mills',
  },
  'section b': {
    profile: '17mm Top Width × 11mm Thickness',
    angle: '40° V-Angle',
    pitchFactor: 'Pitch Length = Inside Length + 43mm',
    application: 'Heavy Crushers, Industrial Blowers, Machine Tools',
  },
  'section c': {
    profile: '22mm Top Width × 14mm Thickness',
    angle: '40° V-Angle',
    pitchFactor: 'Pitch Length = Inside Length + 58mm',
    application: 'Heavy Duty Power Transmission, Mining, Cement Mills',
  },
  'section d': {
    profile: '32mm Top Width × 19mm Thickness',
    angle: '40° V-Angle',
    pitchFactor: 'Pitch Length = Inside Length + 75mm',
    application: 'Severe Shock Loads, Marine Drives, Sugar Plant Crushers',
  },
  'section spz': {
    profile: '10mm Top Width × 8mm Thickness',
    angle: '38° Wedge Angle',
    pitchFactor: 'High-speed compact wedge drives',
    application: 'Automotive Auxiliaries, Compact High-Speed Drives',
  },
  'section spa': {
    profile: '13mm Top Width × 10mm Thickness',
    angle: '38° Wedge Angle',
    pitchFactor: 'Medium high-torque narrow drives',
    application: 'Pumps, Generators, Industrial Fans',
  },
  'section spb': {
    profile: '16mm Top Width × 13mm Thickness',
    angle: '38° Wedge Angle',
    pitchFactor: 'Heavy narrow wedge drives',
    application: 'Rock Crushers, Heavy Conveyors, Hammer Mills',
  },
  'section spc': {
    profile: '22mm Top Width × 18mm Thickness',
    angle: '38° Wedge Angle',
    pitchFactor: 'Maximum power transmission wedge',
    application: 'Steel Mills, Heavy Mining, Ball Mills, Turbines',
  },
  'section 8v': {
    profile: '25mm Top Width × 23mm Thickness',
    angle: '38° Deep Wedge Angle',
    pitchFactor: 'Ultra heavy space-saver drive',
    application: 'Extrusion Presses, Oil Field Rigs, Heavy Crushers',
  },
};

export const InteractivePdfSectionViewer = ({ initialSearch = '', onCategoryDetected }) => {
  const { user, isAuthenticated } = useAuth();
  const { isTamil, t } = useLanguage();

  const [catalogs, setCatalogs] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [sectionsList, setSectionsList] = useState([]);
  const [activeSectionName, setActiveSectionName] = useState('');
  const [rightSearchQuery, setRightSearchQuery] = useState(initialSearch);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // View PDF embed vs Table
  const [showPdfDocEmbed, setShowPdfDocEmbed] = useState(false);

  // Quick Order Modal
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderForm, setOrderForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    companyName: user?.companyName || '',
    deliveryLocation: user?.address?.city || '',
    notes: '',
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (initialSearch) {
      setRightSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  // Load PDF Catalog from backend
  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const res = await api.get('/pdf-catalog');
        const raw = res?.data?.data || res?.data || res;
        const catalogList = raw?.catalogs || (raw?.categories ? [raw] : []);

        setCatalogs(catalogList);
        const current = catalogList[0] || raw;
        setSelectedCatalog(current);

        // Gather all sections (subcategories or sections)
        const extractedSections = [];
        const seen = new Set();

        (current?.categories || []).forEach((cat) => {
          (cat?.subcategories || []).forEach((sub) => {
            const cleanName = sub.name.trim();
            if (!seen.has(cleanName.toLowerCase())) {
              seen.add(cleanName.toLowerCase());
              extractedSections.push({
                name: cleanName,
                categoryName: cat.name,
                image: sub.image || SECTION_IMAGE_MAP[cleanName.toLowerCase()] || '/belts/PIX C 70 Classical V-Belt.jpg',
                description: sub.description || '',
                products: sub.products || [],
              });
            }
          });
        });

        // If no sections found from DB yet, supply realistic default sections
        if (extractedSections.length === 0) {
          const defaults = [
            {
              name: 'Section A',
              categoryName: 'Classical V-Belts',
              image: '/belts/pix-c-70.jpg',
              description: 'Standard Classical 13x8mm V-Belt profile for general plant machinery.',
              products: [
                { partNumber: 'A 18', name: 'PIX Classical V-Belt A 18', brand: 'PIX', mrp: 185, discountPercentage: 46 },
                { partNumber: 'A 24', name: 'PIX Classical V-Belt A 24', brand: 'PIX', mrp: 215, discountPercentage: 46 },
                { partNumber: 'A 32', name: 'PIX Classical V-Belt A 32', brand: 'PIX', mrp: 260, discountPercentage: 46 },
                { partNumber: 'A 42', name: 'PIX Classical V-Belt A 42', brand: 'PIX', mrp: 310, discountPercentage: 46 },
                { partNumber: 'A 50', name: 'PIX Classical V-Belt A 50', brand: 'PIX', mrp: 380, discountPercentage: 46 },
                { partNumber: 'A 68', name: 'PIX Classical V-Belt A 68', brand: 'PIX', mrp: 490, discountPercentage: 46 },
              ],
            },
            {
              name: 'Section B',
              categoryName: 'Classical V-Belts',
              image: '/belts/PIX C 70 Classical V-Belt.jpg',
              description: 'Standard Classical 17x11mm V-Belt profile for compressors & crushers.',
              products: [
                { partNumber: 'B 38', name: 'PIX Classical V-Belt B 38', brand: 'PIX', mrp: 390, discountPercentage: 46 },
                { partNumber: 'B 42', name: 'PIX Classical V-Belt B 42', brand: 'PIX', mrp: 420, discountPercentage: 46 },
                { partNumber: 'B 55', name: 'PIX Classical V-Belt B 55', brand: 'PIX', mrp: 510, discountPercentage: 46 },
                { partNumber: 'B 68', name: 'PIX Classical V-Belt B 68', brand: 'PIX', mrp: 640, discountPercentage: 46 },
                { partNumber: 'B 75', name: 'PIX Classical V-Belt B 75', brand: 'PIX', mrp: 720, discountPercentage: 46 },
              ],
            },
            {
              name: 'Section C',
              categoryName: 'Classical V-Belts',
              image: '/belts/PIX C 70 Classical V-Belt.jpg',
              description: 'Heavy duty Classical 22x14mm V-Belt profile for high torque transmissions.',
              products: [
                { partNumber: 'C 70', name: 'PIX Classical V-Belt C 70', brand: 'PIX', mrp: 980, discountPercentage: 46 },
                { partNumber: 'C 84', name: 'PIX Classical V-Belt C 84', brand: 'PIX', mrp: 1150, discountPercentage: 46 },
                { partNumber: 'C 96', name: 'PIX Classical V-Belt C 96', brand: 'PIX', mrp: 1320, discountPercentage: 46 },
                { partNumber: 'C 120', name: 'PIX Classical V-Belt C 120', brand: 'PIX', mrp: 1650, discountPercentage: 46 },
              ],
            },
            {
              name: 'Section D',
              categoryName: 'Classical V-Belts',
              image: '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
              description: 'Heavy industrial 32x19mm V-Belt profile for mining and severe shock drives.',
              products: [
                { partNumber: 'D 120', name: 'PIX Heavy Duty V-Belt D 120', brand: 'PIX', mrp: 2850, discountPercentage: 46 },
                { partNumber: 'D 144', name: 'PIX Heavy Duty V-Belt D 144', brand: 'PIX', mrp: 3400, discountPercentage: 46 },
                { partNumber: 'D 180', name: 'PIX Heavy Duty V-Belt D 180', brand: 'PIX', mrp: 4200, discountPercentage: 46 },
              ],
            },
            {
              name: 'Section SPC',
              categoryName: 'Space Saver Wedge Belts',
              image: '/belts/PIX SPC PT 3150 Power Transmission.jpg',
              description: 'Narrow wedge 22x18mm high power transmission belt.',
              products: [
                { partNumber: 'SPC 2360', name: 'PIX Narrow Wedge Belt SPC 2360', brand: 'PIX', mrp: 1850, discountPercentage: 46 },
                { partNumber: 'SPC PT 3150', name: 'PIX Power Transmission SPC PT 3150', brand: 'PIX', mrp: 2450, discountPercentage: 46 },
                { partNumber: 'SPC 4000', name: 'PIX Narrow Wedge Belt SPC 4000', brand: 'PIX', mrp: 3100, discountPercentage: 46 },
              ],
            },
            {
              name: 'Section 8V',
              categoryName: 'Heavy Industrial Wedge Belts',
              image: '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
              description: 'Extreme torque narrow deep wedge profile 25x23mm.',
              products: [
                { partNumber: '8V-1900', name: 'PIX Heavy Duty 8V-1900 Wedge Belt', brand: 'PIX', mrp: 2600, discountPercentage: 46 },
                { partNumber: '8V-2500', name: 'PIX Heavy Duty 8V-2500 Wedge Belt', brand: 'PIX', mrp: 3400, discountPercentage: 46 },
              ],
            },
            {
              name: 'Deep Groove Ball Bearings',
              categoryName: 'Industrial Bearings',
              image: '/bearings/img10.jpg',
              description: 'Standard high-RPM radial ball bearings for electric motors and plant spindles.',
              products: [
                { partNumber: '6204', name: 'Deep Groove Ball Bearing 6204', brand: 'NBC', mrp: 240, discountPercentage: 46 },
                { partNumber: '6205', name: 'Deep Groove Ball Bearing 6205', brand: 'NBC', mrp: 310, discountPercentage: 46 },
                { partNumber: '6308', name: 'Deep Groove Ball Bearing 6308', brand: 'NBC', mrp: 780, discountPercentage: 46 },
                { partNumber: '7322 2X', name: 'Angular Contact Bearing 7322 2X', brand: 'SKF', mrp: 6500, discountPercentage: 10 },
                { partNumber: '6313', name: 'Heavy Duty Open Type 6313', brand: 'Timken', mrp: 2100, discountPercentage: 46 },
              ],
            },
          ];
          setSectionsList(defaults);
          setActiveSectionName(defaults[0].name);
          setSelectedProduct(defaults[0].products[0]);
        } else {
          setSectionsList(extractedSections);
          setActiveSectionName(extractedSections[0].name);
          setSelectedProduct(extractedSections[0].products[0] || null);
        }
      } catch (err) {
        console.error('[InteractivePdfSectionViewer Error]', err);
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, []);

  // Current active section
  const currentSection = useMemo(() => {
    return sectionsList.find((s) => s.name === activeSectionName) || sectionsList[0] || null;
  }, [sectionsList, activeSectionName]);

  // When right search changes, filter products in active section or across all sections
  const filteredProducts = useMemo(() => {
    if (!currentSection) return [];
    const q = rightSearchQuery.trim().toLowerCase();
    if (!q) return currentSection.products || [];

    // Search in current section
    const inCurrent = (currentSection.products || []).filter((p) => {
      const part = (p.partNumber || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      return part.includes(q) || name.includes(q) || brand.includes(q);
    });

    if (inCurrent.length > 0) return inCurrent;

    // Search across ALL sections to locate product's section automatically
    for (const sec of sectionsList) {
      const found = (sec.products || []).filter((p) => {
        const part = (p.partNumber || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        return part.includes(q) || name.includes(q) || brand.includes(q);
      });
      if (found.length > 0) {
        // Auto-switch to matching section!
        setActiveSectionName(sec.name);
        if (onCategoryDetected && sec.categoryName) {
          onCategoryDetected(sec.categoryName);
        }
        return found;
      }
    }

    return inCurrent;
  }, [currentSection, rightSearchQuery, sectionsList, onCategoryDetected]);

  // Keep selected product updated if search filters product
  useEffect(() => {
    if (filteredProducts.length > 0) {
      // If selectedProduct is not in filtered list, pick the first
      const exists = filteredProducts.some(
        (p) => (p.partNumber || '').toLowerCase() === (selectedProduct?.partNumber || '').toLowerCase()
      );
      if (!exists) {
        setSelectedProduct(filteredProducts[0]);
      }
    }
  }, [filteredProducts]);

  // Calculate pricing & offers based on user type (Normal user vs Admin-assigned user)
  const pricingDetails = useMemo(() => {
    if (!selectedProduct) return null;

    const mrp = Number(selectedProduct.mrp) || 0;
    const isSkf = (selectedProduct.brand || '').toUpperCase().includes('SKF');
    const defaultDiscount = isSkf ? 10 : (selectedProduct.discountPercentage || 46);

    // Check if logged-in user has an Admin-assigned custom rate
    let finalDiscount = defaultDiscount;
    let isUserCustomRate = false;
    let rateLabel = isSkf ? 'Flat 10% OFF Official MRP' : '46% OFF Wholesale Standard Rate';

    if (user) {
      if (user.customDiscountPercentage > 0) {
        finalDiscount = user.customDiscountPercentage;
        isUserCustomRate = true;
        rateLabel = `${user.customDiscountPercentage}% OFF Admin Assigned Custom Rate`;
      } else if (user.pricingTier === 'vip_custom') {
        finalDiscount = 50;
        isUserCustomRate = true;
        rateLabel = '50% OFF VIP Client Rate';
      } else if (user.isNewUser || user.pricingTier === 'new_user') {
        const surcharge = user.markupPercentage || 5;
        finalDiscount = Math.max(0, defaultDiscount - surcharge);
        rateLabel = `${finalDiscount}% OFF New User Tier (+${surcharge}% Surcharge)`;
      }
    }

    const wholesaleUnitPrice = mrp > 0
      ? Math.round(mrp * (1 - finalDiscount / 100))
      : (selectedProduct.wholesalePrice || 0);

    const subtotal = wholesaleUnitPrice * orderQuantity;
    const gstAmount = Math.round(subtotal * 0.18);
    const totalWithGst = subtotal + gstAmount;

    return {
      mrp,
      finalDiscount,
      isUserCustomRate,
      rateLabel,
      wholesaleUnitPrice,
      subtotal,
      gstAmount,
      totalWithGst,
    };
  }, [selectedProduct, user, orderQuantity]);

  // Section details
  const sectionSpec = useMemo(() => {
    if (!currentSection) return null;
    const key = currentSection.name.toLowerCase();
    return SECTION_SPEC_MAP[key] || {
      profile: 'Standard Industrial Profile',
      angle: 'IS/BS/DIN Standard Compliant',
      pitchFactor: 'High-torque power transmission design',
      application: 'Continuous Factory Operations, Motors & Reduction Drives',
    };
  }, [currentSection]);

  const allocatedImage = useMemo(() => {
    if (!currentSection) return '/belts/PIX C 70 Classical V-Belt.jpg';
    const key = currentSection.name.toLowerCase();
    return currentSection.image || SECTION_IMAGE_MAP[key] || '/belts/PIX C 70 Classical V-Belt.jpg';
  }, [currentSection]);

  // Handle Order Placement
  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!orderForm.name || !orderForm.phone) {
      showErrorAlert('Missing Information', 'Please provide your full name and contact phone number.');
      return;
    }

    setOrderSubmitting(true);
    try {
      const payload = {
        name: orderForm.name,
        phone: orderForm.phone,
        email: orderForm.email || `${orderForm.phone.replace(/[^0-9]/g, '')}@balumuni-client.com`,
        subject: `Order Booking: ${selectedProduct.partNumber} (${orderQuantity} Units)`,
        message: `Order booking request placed from PDF Section Explorer.\n\nProduct: ${selectedProduct.name} (${selectedProduct.partNumber})\nBrand: ${selectedProduct.brand}\nSection: ${currentSection?.name}\nQuantity: ${orderQuantity} Units\nMRP: ₹${pricingDetails?.mrp}\nOffer: ${pricingDetails?.rateLabel}\nUnit Wholesale Price: ₹${pricingDetails?.wholesaleUnitPrice}\nTotal Amount (+18% GST): ₹${pricingDetails?.totalWithGst}\nDelivery City: ${orderForm.deliveryLocation}\nNotes: ${orderForm.notes || 'None'}`,
        enquiryType: 'bulk_order',
        companyName: orderForm.companyName,
        deliveryLocation: orderForm.deliveryLocation,
        brand: selectedProduct.brand,
        partNumber: selectedProduct.partNumber,
        quantity: orderQuantity,
        targetPrice: pricingDetails?.wholesaleUnitPrice,
      };

      const res = await contentService.submitEnquiry(payload);
      if (res.success) {
        setIsOrderModalOpen(false);
        await showSuccessAlert(
          'Order Request Submitted!',
          `Your order for ${orderQuantity}x ${selectedProduct.partNumber} has been received. Quotation #${res.data?.quotationNumber || 'QTN-LIVE'} is generated. Sales desk will call you shortly.`
        );
      }
    } catch (err) {
      showErrorAlert('Order Failed', err.message || 'Unable to submit order request');
    } finally {
      setOrderSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200">
        <Spinner size="lg" />
        <p className="text-xs font-bold text-slate-500">Loading verified PDF Catalog Sections &amp; Data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-blue-200 shadow-xl p-6 sm:p-8 space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-blue-100 text-primary">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-blue-700">
              Interactive Manufacturer PDF Catalog &amp; Section Explorer
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-navy mt-1 tracking-tight">
            Select Section, View PDF Data &amp; Place Order
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Choose any section below to see its allocated engineering image and technical specs. Browse the live PDF database on the right, search any product code, and order with your assigned discount!
          </p>
        </div>

        {/* Pricing Tier Banner Indicator */}
        <div className="shrink-0 flex items-center gap-2">
          {isAuthenticated && user?.customDiscountPercentage > 0 ? (
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-400 text-slate-950 border border-amber-500 shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assigned Rate: {user.customDiscountPercentage}% OFF</span>
            </span>
          ) : isAuthenticated ? (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              Logged in as {user.name}
            </span>
          ) : (
            <Link to="/login" className="text-xs font-bold text-primary hover:underline">
              Sign in for custom B2B rates →
            </Link>
          )}
        </div>
      </div>

      {/* 2. Interactive Section Pills (Section A, B, C, D, SPZ, SPA, SPB, SPC, 8V, Bearings...) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Select PDF Section:</span>
          </span>
          <span className="text-[11px] text-slate-400 font-semibold">
            {sectionsList.length} Sections Available
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {sectionsList.map((sec) => {
            const isSelected = sec.name === activeSectionName;
            return (
              <button
                key={sec.name}
                type="button"
                onClick={() => {
                  setActiveSectionName(sec.name);
                  if (onCategoryDetected && sec.categoryName) {
                    onCategoryDetected(sec.categoryName);
                  }
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-md ring-2 ring-blue-500/40 scale-[1.02]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{sec.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {sec.products?.length || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Split Workspace: Left Column (Image + Specs + Pricing + Place Order), Right Column (Search + PDF Viewer / Data Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        
        {/* ===================== LEFT COLUMN (5 Cols): Allocated Section Image + Product Details + Price + Order Option ===================== */}
        <div className="lg:col-span-5 space-y-5 bg-slate-50 p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          {/* Header of Section */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                {currentSection?.categoryName || 'Industrial Components'}
              </span>
              <h3 className="text-xl font-black text-navy">{currentSection?.name}</h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
              Allocated Profile
            </span>
          </div>

          {/* Allocated Section Image */}
          <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-xs p-4 flex items-center justify-center group">
            <img
              src={allocatedImage}
              alt={currentSection?.name || 'Section Profile Image'}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/belts/PIX C 70 Classical V-Belt.jpg';
              }}
            />
            <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
              Official Technical Profile
            </span>
          </div>

          {/* Section Details & Specs */}
          {sectionSpec && (
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
                Section Specifications:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Profile:</span>
                  <span className="font-bold text-darkText">{sectionSpec.profile}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">V-Angle:</span>
                  <span className="font-bold text-darkText">{sectionSpec.angle}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Calculation Factor:</span>
                  <span className="font-mono font-bold text-primary">{sectionSpec.pitchFactor}</span>
                </div>
              </div>
            </div>
          )}

          {/* Selected Product Pricing Card from PDF */}
          {selectedProduct ? (
            <div className="p-4 rounded-2xl bg-white border-2 border-primary/30 shadow-md space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {selectedProduct.brand || 'PIX'}
                  </span>
                  <h4 className="text-lg font-black text-navy mt-1">
                    {selectedProduct.partNumber}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{selectedProduct.name}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                  In Stock
                </span>
              </div>

              {/* Price Breakdown */}
              {pricingDetails && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Official Catalog MRP:</span>
                    <span className="line-through text-slate-400 font-mono font-medium">
                      {formatCurrency(pricingDetails.mrp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-700 font-bold">Applied Offer:</span>
                    <span className="font-black text-amber-600">
                      {pricingDetails.finalDiscount}% OFF
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-1 border-t border-slate-200 font-black">
                    <span className="text-navy">Net Wholesale Price:</span>
                    <span className="text-primary font-mono text-base">
                      {formatCurrency(pricingDetails.wholesaleUnitPrice)}
                    </span>
                  </div>

                  {pricingDetails.isUserCustomRate && (
                    <span className="inline-block text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded mt-1">
                      ★ {pricingDetails.rateLabel}
                    </span>
                  )}
                </div>
              )}

              {/* Quantity Selector & Place Order Button */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Order Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-black"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-mono font-bold text-navy">{orderQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setOrderQuantity(orderQuantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-black"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Place Order for {selectedProduct.partNumber}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
              Select any part number from the right table to view assigned price &amp; order.
            </div>
          )}
        </div>

        {/* ===================== RIGHT COLUMN (7 Cols): Search Bar + Scrollable PDF / Data Table ===================== */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Top Search Bar over the PDF Data */}
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-primary" />
                <span>Search Product Code or Name in this PDF:</span>
              </span>
              <span className="text-xs font-bold text-primary">
                {filteredProducts.length} Match{filteredProducts.length !== 1 ? 'es' : ''}
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search part # (e.g. 2360, A 18, 6204, C 70, SPC)..."
                value={rightSearchQuery}
                onChange={(e) => setRightSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-2xs"
              />
              {rightSearchQuery && (
                <button
                  type="button"
                  onClick={() => setRightSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Toggle PDF Document Embed vs Data Table */}
            {selectedCatalog?.fileUrl && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500 font-medium">Original Manufacturer PDF:</span>
                <button
                  type="button"
                  onClick={() => setShowPdfDocEmbed(!showPdfDocEmbed)}
                  className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showPdfDocEmbed ? 'Switch to Data Table' : 'Scroll Official PDF Document'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Embedded PDF Document Viewer if toggled */}
          {showPdfDocEmbed && selectedCatalog?.fileUrl ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-3 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-700">Official PDF Document Viewer:</span>
                <a
                  href={getAssetUrl(selectedCatalog.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline font-bold inline-flex items-center gap-1"
                >
                  <span>Open in Fullscreen</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="w-full h-96 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <iframe
                  src={getAssetUrl(selectedCatalog.fileUrl)}
                  title="PDF Catalog Viewer"
                  width="100%"
                  height="100%"
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            /* Scrollable Extracted PDF Products Table */
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-1">
              <div className="p-3.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  PDF Extracted Products Table (Scrollable)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Click row to select product &amp; order</span>
              </div>

              <div className="max-h-96 overflow-y-auto scrollbar-thin">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 shadow-2xs">
                    <tr>
                      <th className="py-2.5 px-3">Part #</th>
                      <th className="py-2.5 px-3">Make</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">MRP</th>
                      <th className="py-2.5 px-3 text-right">Wholesale Price</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p, idx) => {
                      const isSelected =
                        (selectedProduct?.partNumber || '').toLowerCase() === (p.partNumber || '').toLowerCase();
                      const mrp = Number(p.mrp) || 0;
                      const isSkf = (p.brand || '').toUpperCase().includes('SKF');
                      const disc = user?.customDiscountPercentage > 0
                        ? user.customDiscountPercentage
                        : isSkf ? 10 : (p.discountPercentage || 46);
                      const unitPrice = mrp > 0 ? Math.round(mrp * (1 - disc / 100)) : (p.wholesalePrice || 0);

                      return (
                        <tr
                          key={`${p.partNumber}-${idx}`}
                          onClick={() => setSelectedProduct(p)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 font-bold text-primary border-l-4 border-primary'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-black text-primary">
                            {p.partNumber}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-navy">
                            {p.brand || 'PIX'}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-600 truncate max-w-[140px]">
                            {p.name}
                          </td>
                          <td className="py-2.5 px-3 text-right line-through text-slate-400 font-mono">
                            {formatCurrency(mrp)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-navy font-mono">
                            {formatCurrency(unitPrice)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(p);
                                setIsOrderModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-navy text-accent hover:bg-primary hover:text-white font-extrabold text-[10px] transition-smooth cursor-pointer"
                            >
                              Order
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 4. Quick Order Confirmation Modal */}
      {isOrderModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-slideUp relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Order Placement Form
                </span>
                <h3 className="text-xl font-black text-navy">
                  Confirm Order for {selectedProduct.partNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Component:</span>
                <span className="font-bold text-navy">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Brand / Make:</span>
                <span className="font-bold text-darkText">{selectedProduct.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity:</span>
                <span className="font-black text-primary">{orderQuantity} Unit(s)</span>
              </div>
              <div className="flex justify-between font-black pt-1 border-t border-slate-200">
                <span className="text-navy">Total (+18% GST):</span>
                <span className="font-mono text-primary text-sm">
                  {formatCurrency(pricingDetails?.totalWithGst || 0)}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handlePlaceOrderSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={orderForm.name}
                  onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Mill Name</label>
                  <input
                    type="text"
                    value={orderForm.companyName}
                    onChange={(e) => setOrderForm({ ...orderForm, companyName: e.target.value })}
                    placeholder="e.g. Sri Balaji Mills"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery City / Address</label>
                <input
                  type="text"
                  value={orderForm.deliveryLocation}
                  onChange={(e) => setOrderForm({ ...orderForm, deliveryLocation: e.target.value })}
                  placeholder="e.g. Srivilliputtur, Rajapalayam, Madurai..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="w-1/2 font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={orderSubmitting}
                  className="w-1/2 font-black text-xs bg-primary hover:bg-primary-dark"
                >
                  {orderSubmitting ? 'Submitting...' : 'Confirm Order'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractivePdfSectionViewer;
