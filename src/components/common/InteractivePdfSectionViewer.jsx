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
  AlertCircle,
  RotateCcw,
  UploadCloud,
  HelpCircle,
} from 'lucide-react';
import api, { getAssetUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/formatters';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';
import { contentService } from '../../services/contentService';
import pixBeltsData from '../../data/pixBeltsCatalogData.json';

// Authentic technical profile image map for every section in the PDF
const SECTION_IMAGE_MAP = {
  'section a': '/belts/pix-c-70.jpg',
  'section a (13 x 8 mm)': '/belts/pix-c-70.jpg',
  'section b': '/belts/PIX C 70 Classical V-Belt.jpg',
  'section b (17 x 11 mm)': '/belts/PIX C 70 Classical V-Belt.jpg',
  'section c': '/belts/PIX C 70 Classical V-Belt.jpg',
  'section c (22 x 14 mm)': '/belts/PIX C 70 Classical V-Belt.jpg',
  'section d': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  'section d (32 x 19 mm)': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  'section e': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  'section e (38 x 23 mm)': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  'fractional horsepower (fhp series)': '/belts/pix-c-70.jpg',
  'section aa': '/belts/PIX C 70 Classical V-Belt.jpg',
  'section aa (13 x 10 mm)': '/belts/PIX C 70 Classical V-Belt.jpg',
  'section bb': '/belts/PIX C 70 Classical V-Belt.jpg',
  'section bb (17 x 14 mm)': '/belts/PIX C 70 Classical V-Belt.jpg',
  'section cc': '/belts/PIX C 70 Classical V-Belt.jpg',
  'section cc (22 x 17 mm)': '/belts/PIX C 70 Classical V-Belt.jpg',
  'spz wedge profile (10 x 8 mm)': '/belts/PIX SPC 2360 Wedge Belt.jpg',
  'spa wedge profile (13 x 10 mm)': '/belts/PIX SPC 2360 Wedge Belt.jpg',
  'spb wedge profile (17 x 14 mm)': '/belts/PIX SPC 2360 Wedge Belt.jpg',
  'spc wedge profile (22 x 18 mm)': '/belts/PIX SPC PT 3150 Power Transmission.jpg',
  '3v section (9.7 x 8 mm)': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  '5v section (15.8 x 13.5 mm)': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  '8v section (25.4 x 23 mm)': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  'ax cogged section (13 x 8 mm)': '/belts/pix-c-70.jpg',
  'bx cogged section (17 x 11 mm)': '/belts/PIX C 70 Classical V-Belt.jpg',
  'cx cogged section (22 x 14 mm)': '/belts/PIX C 70 Classical V-Belt.jpg',
  'xpz / xpa / xpb / xpc cogged wedge': '/belts/PIX SPC PT 3150 Power Transmission.jpg',
  'deep groove ball bearings': '/bearings/img10.jpg',
  'taper roller bearings': '/bannerImages/nbcandTapper role.webp',
  'spherical roller bearings': '/bearings/img3.jpg',
  'angular contact bearings': '/bearings/img1.jpg',
  'heavy series & precision bearings': '/bearings/img3.jpg',
  'taper lock bush pulleys': '/bannerImages/img4.jpg',
  'electric motors': '/bannerImages/siemens.jpg',
  'industrial gears': '/bannerImages/santhiGears.jpg',
};

// Section specifications & pitch calculation rules
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
  'section e': {
    profile: '38mm Top Width × 23mm Thickness',
    angle: '40° V-Angle',
    pitchFactor: 'Pitch Length = Inside Length + 80mm',
    application: 'Massive Industrial Mill Drives, Stone Crushers, Marine Engines',
  },
  'section bb': {
    profile: '17mm Top Width × 14mm Thickness',
    angle: 'Hexagonal Double V Profile',
    pitchFactor: 'Effective Pitch at Mid-Plane Pitch Line',
    application: 'Serpentine Drives, Rice Mills, Textile Carding Machines',
  },
  'spz': {
    profile: '10mm Top Width × 8mm Thickness',
    angle: '38° Wedge Angle',
    pitchFactor: 'High-speed compact wedge drives',
    application: 'Automotive Auxiliaries, Compact High-Speed Drives',
  },
  'spa': {
    profile: '13mm Top Width × 10mm Thickness',
    angle: '38° Wedge Angle',
    pitchFactor: 'Medium high-torque narrow drives',
    application: 'Pumps, Generators, Industrial Fans',
  },
  'spb': {
    profile: '16mm Top Width × 13mm Thickness',
    angle: '38° Wedge Angle',
    pitchFactor: 'Heavy narrow wedge drives',
    application: 'Rock Crushers, Heavy Conveyors, Hammer Mills',
  },
  'spc': {
    profile: '22mm Top Width × 18mm Thickness',
    angle: '38° Wedge Angle',
    pitchFactor: 'Maximum power transmission wedge',
    application: 'Steel Mills, Heavy Mining, Ball Mills, Turbines',
  },
  '8v': {
    profile: '25mm Top Width × 23mm Thickness',
    angle: '38° Deep Wedge Angle',
    pitchFactor: 'Ultra heavy space-saver drive',
    application: 'Extrusion Presses, Oil Field Rigs, Heavy Crushers',
  },
};

// Flexible Part Number & Size Matcher: handles b25 -> B 25, bb60 -> BB 60, spc2360 -> SPC 2360, 6204, etc.
export const matchPartNumber = (partNumber, query) => {
  if (!partNumber || !query) return false;

  const pRaw = partNumber.trim().toLowerCase();
  const qRaw = query.trim().toLowerCase();

  // 1. Direct substring match
  if (pRaw.includes(qRaw)) return true;

  // 2. Whitespace & hyphen stripped exact / inclusion match
  const pClean = pRaw.replace(/[\s\-_./]+/g, '');
  const qClean = qRaw.replace(/[\s\-_./]+/g, '');

  if (pClean === qClean || pClean.includes(qClean) || qClean.includes(pClean)) {
    return true;
  }

  // 3. Number only matching (e.g. typing "25" matches "B 25", "2360" matches "SPC 2360")
  const qNums = qRaw.match(/\d+/g);
  const pNums = pRaw.match(/\d+/g);
  if (qNums && pNums && qNums.join('') === pNums.join('')) {
    return true;
  }

  return false;
};

export const InteractivePdfSectionViewer = ({
  initialSearch = '',
  selectedCategory = '',
  categories = [],
  onSelectCategory,
  onCategoryDetected,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { isTamil, t } = useLanguage();

  const [serverCatalogs, setServerCatalogs] = useState([]);
  const [activeCatalog, setActiveCatalog] = useState(null);
  const [sectionsList, setSectionsList] = useState([]);
  const [activeSectionName, setActiveSectionName] = useState('');

  // Search input state: User types in searchInput; search executes on Enter or clicking Search button
  const [searchInputValue, setSearchInputValue] = useState(initialSearch);
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState(initialSearch);

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

  // Determine active category details from selectedCategory prop
  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return (
      categories?.find(
        (c) => c._id === selectedCategory || c.name === selectedCategory || c.slug === selectedCategory
      ) || null
    );
  }, [selectedCategory, categories]);

  const activeCategoryName = activeCategoryObj?.name || (typeof selectedCategory === 'string' ? selectedCategory : '');

  // Sync external search prop if parent updates it
  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchInputValue(initialSearch);
      setSubmittedSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  // Load PDF Catalogs from backend API
  useEffect(() => {
    const loadCatalogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/pdf-catalog');
        const raw = res?.data?.data || res?.data || res;
        const catalogList = raw?.catalogs || (raw?.categories ? [raw] : []);
        setServerCatalogs(catalogList);
      } catch (err) {
        console.error('[InteractivePdfSectionViewer Error]', err);
      } finally {
        setLoading(false);
      }
    };

    loadCatalogs();
  }, []);

  // =========================================================================
  // REQUIREMENT: Category-Specific PDF & Section Resolution
  // 1. "Power Transmission Belts" (or Belts) -> Uses the PIX Belts PDF & 1290 extracted products
  // 2. "Industrial Bearings" -> Check if admin uploaded a Bearings PDF. If NOT, show "PDF Not Uploaded"!
  // 3. "Bush Pulleys" -> Check if admin uploaded a Pulley PDF. If NOT, show "PDF Not Uploaded"!
  // 4. Any other category -> Check if uploaded. If NOT, show "PDF Not Uploaded"!
  // =========================================================================
  const { hasUploadedPdf, categorySections, effectiveCatalog } = useMemo(() => {
    const catNameLower = activeCategoryName.toLowerCase().trim();
    const catId = activeCategoryObj?._id || selectedCategory;

    // Check if user selected "All Categories" (empty selectedCategory)
    const isAllCategories = !selectedCategory;

    // Is this a Belts category?
    const isBeltsCategory =
      isAllCategories ||
      catNameLower.includes('belt') ||
      catNameLower.includes('v-belt') ||
      catNameLower.includes('power transmission');

    // Is this a Bearings category?
    const isBearingsCategory = catNameLower.includes('bearing');

    // Is this a Pulleys category?
    const isPulleysCategory = catNameLower.includes('pulley') || catNameLower.includes('bush');

    // 1. Check if admin uploaded an explicit catalog for this category in serverCatalogs
    const uploadedForCategory = serverCatalogs.find((c) => {
      if (!c.isActive) return false;
      const titleLower = (c.title || '').toLowerCase();
      const fileLower = (c.fileName || '').toLowerCase();
      const cName = (c.categoryName || '').toLowerCase();

      if (catId && c.categoryId && c.categoryId.toString() === catId.toString()) return true;
      if (cName && cName === catNameLower) return true;

      if (isBearingsCategory && (titleLower.includes('bearing') || fileLower.includes('bearing'))) return true;
      if (isPulleysCategory && (titleLower.includes('pulley') || fileLower.includes('pulley'))) return true;
      if (catNameLower && (titleLower.includes(catNameLower) || fileLower.includes(catNameLower))) return true;

      return false;
    });

    if (uploadedForCategory) {
      // Build sections from uploaded catalog
      const extracted = [];
      (uploadedForCategory.categories || []).forEach((cat) => {
        (cat.subcategories || []).forEach((sub) => {
          extracted.push({
            name: sub.name,
            categoryName: cat.name,
            image: sub.image || SECTION_IMAGE_MAP[sub.name.toLowerCase()] || '/belts/PIX C 70 Classical V-Belt.jpg',
            description: sub.description || '',
            products: sub.products || [],
          });
        });
      });

      return {
        hasUploadedPdf: true,
        categorySections: extracted,
        effectiveCatalog: uploadedForCategory,
      };
    }

    // 2. If Belts category (or All Categories default), load the verified PIX Master Catalog (all 1290 parts)
    if (isBeltsCategory) {
      const extractedBelts = [];
      (pixBeltsData.categories || []).forEach((cat) => {
        (cat.subcategories || []).forEach((sub) => {
          extractedBelts.push({
            name: sub.name,
            categoryName: cat.name,
            image: sub.image || SECTION_IMAGE_MAP[sub.name.toLowerCase()] || '/belts/PIX C 70 Classical V-Belt.jpg',
            description: sub.description || '',
            products: sub.products || [],
          });
        });
      });

      return {
        hasUploadedPdf: true,
        categorySections: extractedBelts,
        effectiveCatalog: {
          title: pixBeltsData.title || 'PIX Industrial Belts Master Price List',
          fileName: pixBeltsData.fileName || 'PIX-Industrial-Belts-Price-List.pdf',
          fileUrl: pixBeltsData.fileUrl || '/sample-catalog.pdf',
        },
      };
    }

    // 3. For any other category (e.g. Industrial Bearings, Bush Pulleys, Motors, Gears) without an uploaded PDF:
    // Display "PDF Not Uploaded" - NEVER display the Belts PDF or unrelated products!
    return {
      hasUploadedPdf: false,
      categorySections: [],
      effectiveCatalog: null,
    };
  }, [selectedCategory, activeCategoryName, activeCategoryObj, serverCatalogs]);

  // Sync sections and catalog state
  useEffect(() => {
    setSectionsList(categorySections);
    setSelectedCatalog(effectiveCatalog);

    if (categorySections.length > 0) {
      const exists = categorySections.some((s) => s.name === activeSectionName);
      if (!exists) {
        setActiveSectionName(categorySections[0].name);
        setSelectedProduct(categorySections[0].products?.[0] || null);
      }
    } else {
      setActiveSectionName('');
      setSelectedProduct(null);
    }
  }, [categorySections, effectiveCatalog]);

  // Current active section
  const currentSection = useMemo(() => {
    if (sectionsList.length === 0) return null;
    return (
      sectionsList.find((s) => s.name === activeSectionName) ||
      sectionsList[0] ||
      null
    );
  }, [sectionsList, activeSectionName]);

  // Handle Search Submission (triggers on Enter or clicking the Search button)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchInputValue.trim();
    setSubmittedSearchQuery(query);

    if (!query) return;

    // Check if searched part is in the current section
    const inCurrent = (currentSection?.products || []).find((p) =>
      matchPartNumber(p.partNumber, query) || matchPartNumber(p.name, query)
    );

    if (inCurrent) {
      setSelectedProduct(inCurrent);
      return;
    }

    // If not in current section, check other sections in this PDF and auto-switch!
    for (const sec of sectionsList) {
      const found = (sec.products || []).find((p) =>
        matchPartNumber(p.partNumber, query) || matchPartNumber(p.name, query)
      );
      if (found) {
        setActiveSectionName(sec.name);
        setSelectedProduct(found);
        break;
      }
    }
  };

  // Filtered products list based on SUBMITTED search query
  const filteredProducts = useMemo(() => {
    if (!currentSection) return [];
    const q = submittedSearchQuery.trim();
    if (!q) return currentSection.products || [];

    // Search in current section
    const inCurrent = (currentSection.products || []).filter(
      (p) => matchPartNumber(p.partNumber, q) || matchPartNumber(p.name, q)
    );

    if (inCurrent.length > 0) return inCurrent;

    // Search across ALL sections in this category/PDF
    for (const sec of sectionsList) {
      const found = (sec.products || []).filter(
        (p) => matchPartNumber(p.partNumber, q) || matchPartNumber(p.name, q)
      );
      if (found.length > 0) {
        return found;
      }
    }

    return [];
  }, [currentSection, submittedSearchQuery, sectionsList]);

  // Update selectedProduct when filteredProducts changes
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const exists = filteredProducts.some(
        (p) => (p.partNumber || '').toLowerCase() === (selectedProduct?.partNumber || '').toLowerCase()
      );
      if (!exists) {
        setSelectedProduct(filteredProducts[0]);
      }
    }
  }, [filteredProducts]);

  // Pricing calculations
  const pricingDetails = useMemo(() => {
    if (!selectedProduct) return null;

    const mrp = Number(selectedProduct.mrp) || 0;
    const isSkf = (selectedProduct.brand || '').toUpperCase().includes('SKF');
    const defaultDiscount = isSkf ? 10 : (selectedProduct.discountPercentage || 46);

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

    const wholesaleUnitPrice =
      mrp > 0 ? Math.round(mrp * (1 - finalDiscount / 100)) : (selectedProduct.wholesalePrice || 0);

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

  // Section specifications
  const sectionSpec = useMemo(() => {
    if (!currentSection) return null;
    const key = currentSection.name.toLowerCase();

    // Match section profile keys
    for (const [k, spec] of Object.entries(SECTION_SPEC_MAP)) {
      if (key.includes(k) || k.includes(key)) {
        return spec;
      }
    }

    return {
      profile: 'Standard Industrial Profile',
      angle: 'IS/BS/DIN Standard Compliant',
      pitchFactor: 'High-torque power transmission design',
      application: 'Continuous Factory Operations, Motors & Reduction Drives',
    };
  }, [currentSection]);

  // Section profile image
  const allocatedImage = useMemo(() => {
    if (!currentSection) return '/belts/PIX C 70 Classical V-Belt.jpg';
    const key = currentSection.name.toLowerCase();

    for (const [k, img] of Object.entries(SECTION_IMAGE_MAP)) {
      if (key.includes(k) || k.includes(key)) {
        return img;
      }
    }

    return currentSection.image || '/belts/PIX C 70 Classical V-Belt.jpg';
  }, [currentSection]);

  // Place Order Submit
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

  // =========================================================================
  // REQUIREMENT: If no PDF has been uploaded for the selected category,
  // display "PDF Not Uploaded" instead of showing unrelated belts or fake data!
  // =========================================================================
  if (!hasUploadedPdf) {
    return (
      <div className="bg-white rounded-3xl border-2 border-dashed border-amber-300 shadow-xl p-8 sm:p-12 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-inner">
          <FileText className="w-10 h-10" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <span className="inline-block text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
            Catalog Status: Not Available
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
            PDF Not Uploaded
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Official manufacturer PDF catalog has not been uploaded for{' '}
            <strong className="text-navy font-bold">{activeCategoryName || 'this category'}</strong>{' '}
            yet.
          </p>
          <p className="text-xs text-slate-400">
            You can submit a custom RFQ for factory pricing, contact our sales desk directly, or browse other categories with active PDF catalogs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to={`/rfq?category=${encodeURIComponent(activeCategoryName)}`}>
            <button
              type="button"
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Submit RFQ for {activeCategoryName || 'Products'}</span>
            </button>
          </Link>

          <Link to="/contact">
            <button
              type="button"
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-all flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Contact Sales Desk</span>
            </button>
          </Link>

          {onSelectCategory && (
            <button
              type="button"
              onClick={() => onSelectCategory('')}
              className="px-5 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Explore Available Catalogs</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin/pdf-catalog">
              <button
                type="button"
                className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-sm transition-all flex items-center gap-2 cursor-pointer border border-amber-500"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload PDF for {activeCategoryName} in Admin</span>
              </button>
            </Link>
          )}
        </div>
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
            {activeCategoryName ? `${activeCategoryName} Catalog` : selectedCatalog?.title || 'Manufacturer Price List & Catalog Explorer'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Choose any section below to see its allocated technical profile. Search any size from the PDF (e.g. B 25, BB 60, A 18, SPC 2360) and buy directly with your wholesale rate!
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

      {/* 2. Interactive Section Pills (Section A, B, C, D, E, BB, SPZ, SPA, SPB, SPC, 8V...) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Select PDF Section:</span>
          </span>
          <span className="text-[11px] text-slate-400 font-semibold">
            {sectionsList.length} Sections Available ({sectionsList.reduce((acc, s) => acc + (s.products?.length || 0), 0)} Verified Sizes)
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
                  // Reset search when user clicks a section pill to show full section
                  setSubmittedSearchQuery('');
                  setSearchInputValue('');
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

      {/* 3. Main Split Workspace: Left Column (Allocated Image + Specs + Price + Place Order), Right Column (Search Bar + PDF Viewer / Product Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* ===================== LEFT COLUMN (5 Cols): Allocated Section Image + Product Details + Price + Order Option ===================== */}
        <div className="lg:col-span-5 space-y-5 bg-slate-50 p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          {/* Header of Section */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                {currentSection?.categoryName || activeCategoryName || 'Power Transmission Belts'}
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
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-black cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-mono font-bold text-navy">{orderQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setOrderQuantity(orderQuantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-black cursor-pointer"
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
              Select or search any part number to view assigned price &amp; order.
            </div>
          )}
        </div>

        {/* ===================== RIGHT COLUMN (7 Cols): Search Bar + PDF Viewer / Product Details ===================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Search Bar over the PDF Data */}
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-primary" />
                <span>Search Product Code or Number in this PDF:</span>
              </span>
              {submittedSearchQuery ? (
                <span className="text-xs font-bold text-primary bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {filteredProducts.length} Match{filteredProducts.length !== 1 ? 'es' : ''} Found
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400">
                  {currentSection?.products?.length || 0} sizes in this section
                </span>
              )}
            </div>

            {/* Search Input with Search Icon and Search Button */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Enter part / size (e.g. b25, B 25, BB 60, A 18, SPC 2360) and press Enter or Search..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-2xs"
                />
                {searchInputValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInputValue('');
                      setSubmittedSearchQuery('');
                    }}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dedicated Search Button */}
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>

            {/* Toggle PDF Document Embed vs Data View */}
            {selectedCatalog?.fileUrl && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500 font-medium">Original Manufacturer PDF:</span>
                <button
                  type="button"
                  onClick={() => setShowPdfDocEmbed(!showPdfDocEmbed)}
                  className="text-primary hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showPdfDocEmbed ? 'Switch to Data View' : 'Scroll Official PDF Document'}</span>
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
            /* =========================================================================
                REQUIREMENT: When a product/size is searched, show ONLY that product's details below with Price & Buy button!
               ========================================================================= */
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-1">
              {/* Header Bar */}
              <div className="p-3.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                    {submittedSearchQuery
                      ? `Search Result: ${filteredProducts.length} Matching Part${filteredProducts.length !== 1 ? 's' : ''}`
                      : `Detailed Products List — ${currentSection?.name}`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {submittedSearchQuery
                      ? `Showing exact verified details for "${submittedSearchQuery}" from the PDF catalog.`
                      : `Showing ${filteredProducts.length} verified sizes. Click any size to view specs & order.`}
                  </span>
                </div>

                {submittedSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedSearchQuery('');
                      setSearchInputValue('');
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>View All Sizes</span>
                  </button>
                )}
              </div>

              {/* SEARCH RESULT: When searched number does not exist in this PDF */}
              {submittedSearchQuery && filteredProducts.length === 0 ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-800">
                      Size / Part # "{submittedSearchQuery}" not found in this PDF catalog.
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      This number does not exist in the active catalog for {activeCategoryName || currentSection?.name}. Please verify the size code (e.g. B 25, BB 60, A 18, SPC 2360) or request a custom quotation below.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Link to={`/rfq?partNumber=${encodeURIComponent(submittedSearchQuery)}`}>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Submit RFQ for "{submittedSearchQuery}"
                      </button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedSearchQuery('');
                        setSearchInputValue('');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              ) : submittedSearchQuery && filteredProducts.length === 1 ? (
                /* EXACT SINGLE MATCH: Show ONLY that product's detailed order card with Price & Buy button */
                <div className="p-5 space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-primary bg-white px-2 py-0.5 rounded border border-blue-200">
                            {filteredProducts[0].brand || 'PIX'}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            Exact Match Found in PDF
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-navy mt-1">
                          {filteredProducts[0].partNumber}
                        </h3>
                        <p className="text-xs font-bold text-slate-700">
                          {filteredProducts[0].name}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-slate-700">
                        {filteredProducts[0].subcategoryName || currentSection?.name}
                      </span>
                    </div>

                    {/* Specifications */}
                    {filteredProducts[0].specifications && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                        <strong>Spec / Range:</strong> {filteredProducts[0].specifications}
                      </p>
                    )}

                    {/* Price & Buy Action */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Official Catalog MRP:</span>
                          <span className="line-through text-slate-400 font-mono font-bold">
                            {formatCurrency(filteredProducts[0].mrp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-amber-700 font-bold">Wholesale Discount:</span>
                          <span className="font-black text-amber-600">
                            {pricingDetails?.finalDiscount || filteredProducts[0].discountPercentage || 46}% OFF
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm pt-1 border-t border-slate-100 font-black">
                          <span className="text-navy">Net Wholesale Price:</span>
                          <span className="text-primary font-mono text-base">
                            {formatCurrency(pricingDetails?.wholesaleUnitPrice || Math.round(filteredProducts[0].mrp * 0.54))}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Order Quantity:</span>
                          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                              className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-black cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-0.5 font-mono text-navy font-bold">{orderQuantity}</span>
                            <button
                              type="button"
                              onClick={() => setOrderQuantity(orderQuantity + 1)}
                              className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-black cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(filteredProducts[0]);
                            setIsOrderModalOpen(true);
                          }}
                          className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Buy Now / Place Order for {filteredProducts[0].partNumber}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* TABLE VIEW: Displays sizes (either all sizes in section, or multiple search matches) */
                <div className="max-h-[460px] overflow-y-auto scrollbar-thin">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-50 text-slate-700 font-black uppercase tracking-wider border-b border-slate-200 shadow-2xs z-10">
                      <tr>
                        <th className="py-2.5 px-3">Part #</th>
                        <th className="py-2.5 px-3">Make</th>
                        <th className="py-2.5 px-3">Description / Spec</th>
                        <th className="py-2.5 px-3 text-right">MRP</th>
                        <th className="py-2.5 px-3 text-right">Wholesale Price</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((p) => {
                        const isSelected = selectedProduct?.partNumber === p.partNumber;
                        const isSkf = (p.brand || '').toUpperCase().includes('SKF');
                        const disc = isSkf ? 10 : (p.discountPercentage || 46);
                        const wsPrice = p.mrp > 0 ? Math.round(p.mrp * (1 - disc / 100)) : (p.wholesalePrice || 0);

                        return (
                          <tr
                            key={p.partNumber}
                            onClick={() => setSelectedProduct(p)}
                            className={`transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/90 font-bold'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono font-black text-navy whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                                <span>{p.partNumber}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {p.brand || 'PIX'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 max-w-[220px] truncate">
                              {p.name || p.specifications || currentSection?.name}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-400 line-through whitespace-nowrap">
                              {formatCurrency(p.mrp)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-primary whitespace-nowrap">
                              {formatCurrency(wsPrice)}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(p);
                                  setIsOrderModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-dark text-white text-[11px] font-black cursor-pointer shadow-2xs transition-all"
                              >
                                Buy
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Order Modal */}
      {isOrderModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Direct Factory Wholesale Booking
                </span>
                <h3 className="text-xl font-black text-navy mt-0.5">
                  Order Part: {selectedProduct.partNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">SELECTED ITEM:</span>
                <span className="font-bold text-navy">{selectedProduct.name}</span>
                <span className="block text-[11px] text-slate-500 font-mono">
                  Make: {selectedProduct.brand} • Section: {currentSection?.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">TOTAL ESTIMATE:</span>
                <span className="text-base font-black text-primary font-mono">
                  {formatCurrency(pricingDetails?.totalWithGst || 0)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ({orderQuantity} Units incl. 18% GST)
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePlaceOrderSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Company / Factory Name</label>
                  <input
                    type="text"
                    value={orderForm.companyName}
                    onChange={(e) => setOrderForm({ ...orderForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                    placeholder="e.g. Sri Balaji Mills Pvt Ltd"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Delivery City / Hub</label>
                  <input
                    type="text"
                    value={orderForm.deliveryLocation}
                    onChange={(e) => setOrderForm({ ...orderForm, deliveryLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                    placeholder="e.g. Madurai, Coimbatore, Chennai"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Special Notes / Urgent Dispatch Request</label>
                <textarea
                  rows={2}
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none font-medium text-xs"
                  placeholder="Need immediate Delhivery dispatch or specific brand clearance certificate..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {orderSubmitting ? <Spinner size="sm" /> : <ShoppingBag className="w-4 h-4" />}
                  <span>Confirm Order Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
