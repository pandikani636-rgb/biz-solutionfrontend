import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Search,
  FolderOpen,
  Package,
  BadgePercent,
  Truck,
  ArrowRight,
  Sparkles,
  FileText,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  X,
  SlidersHorizontal,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  UploadCloud,
  Printer,
  Download,
  Info,
  Check,
  Eye,
  FileSpreadsheet,
  MousePointerClick,
  CheckCircle,
} from 'lucide-react';
import api, { getAssetUrl } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import { useSite } from '../../context/SiteContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Spinner } from './Spinner';
import { Button } from './Button';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';
import { contentService } from '../../services/contentService';
import { BalumuniInvoice } from './BalumuniInvoice';
import { InteractivePdfDocumentViewer } from './InteractivePdfDocumentViewer';
import {
  FOURTEEN_OFFICIAL_MAKES,
  OFFICIAL_BRAND_PRODUCTS,
  INDUSTRIAL_CATEGORIES,
  getProductsForBrand,
  matchesSectionFilter,
} from '../../utils/officialBrandsData';

const FALLBACK_IMAGE = 'https://cobrel.co.za/wp-content/uploads/2019/10/Classical-V-Belts-copy3.png';

/**
 * Reusable text highlighter for search matches in the scrollable catalog table
 */
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !highlight.trim() || !text) {
    return <span>{text}</span>;
  }
  const escaped = highlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = String(text).split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-amber-300 text-slate-950 font-black px-1 py-0.5 rounded shadow-2xs"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export const PdfCatalogViewer = ({
  initialSearch = '',
  initialCategory = 'ALL',
  initialBrand = 'ALL',
  initialSection = 'ALL',
  onBrandSelect,
  onSearchChange,
  onSectionChange,
}) => {
  const { isTamil, t } = useLanguage();
  const { categories, settings } = useSite();
  const { user } = useAuth();
  const {
    cartItems,
    totalItemCount,
    cartSubtotal,
    cartTax,
    cartGrandTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    openCart,
  } = useCart();

  // Catalog data from backend
  const [catalogData, setCatalogData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter and search states
  const [activeBrand, setActiveBrand] = useState(initialBrand || 'ALL');
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'ALL');
  const [activeSection, setActiveSection] = useState(initialSection || 'ALL');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sheetSearch, setSheetSearch] = useState(initialSearch || '');

  // Right-side view mode: default to 'sheet' (Master PDF Catalog Sheet) so user directly sees the neat, scrollable table view!
  const [rightViewMode, setRightViewMode] = useState('sheet');

  // Selected product state for LEFT side display
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductQty, setSelectedProductQty] = useState(1);
  const [productLocalSearch, setProductLocalSearch] = useState('');

  // Quotation Submission states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderForm, setOrderForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    companyName: user?.companyName || '',
    deliveryLocation: user?.address?.city || '',
    gstin: user?.gstin || '',
    notes: '',
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [generatedQuotation, setGeneratedQuotation] = useState(null);
  const [isQuotationViewModalOpen, setIsQuotationViewModalOpen] = useState(false);

  // Sync props when parent updates
  useEffect(() => {
    if (initialBrand !== undefined && initialBrand !== activeBrand) {
      setActiveBrand(initialBrand);
    }
  }, [initialBrand]);

  useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== searchQuery) {
      setSearchQuery(initialSearch);
      setSheetSearch(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory !== undefined && initialCategory !== activeCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSection !== undefined && initialSection !== activeSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // Fetch PDF Catalogs from Backend API
  const fetchPdfCatalog = async (brand = '', category = '', query = '') => {
    setLoading(true);
    try {
      const params = {};
      if (brand && brand !== 'ALL') params.brand = brand;
      if (category && category !== 'ALL') params.category = category;
      if (query) params.search = query;

      const res = await api.get('/pdf-catalog', { params });
      const catalog = res?.data?.categories ? res.data : res?.data || res;
      if (catalog && (catalog.categories || catalog.totalCategories !== undefined)) {
        setCatalogData(catalog);
      }
    } catch (err) {
      console.warn('[PdfCatalogViewer Error fetching backend catalog]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfCatalog(activeBrand, activeCategory, searchQuery);
  }, [activeBrand, activeCategory]);

  // Determine current active brand rule
  const currentBrandRule = useMemo(() => {
    if (!activeBrand || activeBrand === 'ALL') {
      return FOURTEEN_OFFICIAL_MAKES[0];
    }
    const bLower = activeBrand.toLowerCase().trim();
    return (
      FOURTEEN_OFFICIAL_MAKES.find(
        (b) =>
          b.code.toLowerCase() === bLower ||
          b.name.toLowerCase() === bLower ||
          b.code.toLowerCase().includes(bLower) ||
          bLower.includes(b.code.toLowerCase())
      ) || FOURTEEN_OFFICIAL_MAKES[0]
    );
  }, [activeBrand]);

  // Determine which PDF URL to show on the right side
  const activePdfInfo = useMemo(() => {
    const allCatalogs = catalogData?.catalogs || [];

    // 1. If brand is selected, look for a catalog matching that brand
    if (activeBrand && activeBrand !== 'ALL') {
      const bLower = activeBrand.toLowerCase().trim();
      const matchedCat = allCatalogs.find((c) => {
        const cBrand = (c.brand || '').toLowerCase().trim();
        const cTitle = (c.title || '').toLowerCase().trim();
        return cBrand === bLower || cTitle.includes(bLower);
      });

      if (matchedCat && matchedCat.fileUrl) {
        return {
          url: matchedCat.fileUrl,
          title: matchedCat.title || `${activeBrand} Official Manufacturer Price List`,
          fileName: matchedCat.fileName || `${activeBrand.toLowerCase()}-catalog.pdf`,
          isBrandSpecific: true,
          catalogId: matchedCat._id,
        };
      }

      if (currentBrandRule && currentBrandRule.defaultPdfUrl) {
        return {
          url: currentBrandRule.defaultPdfUrl,
          title: `${currentBrandRule.name} Official Manufacturer Price List & Specifications`,
          fileName: `${(currentBrandRule.code || currentBrandRule.name).toLowerCase().replace(/\s+/g, '-')}-catalog.pdf`,
          isBrandSpecific: true,
        };
      }
    }

    // 2. If category is selected, look for catalog matching category
    if (activeCategory && activeCategory !== 'ALL') {
      const cLower = activeCategory.toLowerCase().trim();
      const matchedCat = allCatalogs.find((c) => {
        const cName = (c.categoryName || '').toLowerCase().trim();
        return cName.includes(cLower) || cLower.includes(cName);
      });
      if (matchedCat && matchedCat.fileUrl) {
        return {
          url: matchedCat.fileUrl,
          title: matchedCat.title,
          fileName: matchedCat.fileName,
          isBrandSpecific: true,
          catalogId: matchedCat._id,
        };
      }
    }

    // 3. Fallback for ALL: sample-catalog.pdf or catalogData?.fileUrl
    return {
      url: catalogData?.fileUrl || '/sample-catalog.pdf',
      title: catalogData?.title || 'Industrial Power Transmission Master Catalog',
      fileName: catalogData?.fileName || 'Master-Industrial-Catalog.pdf',
      isBrandSpecific: false,
    };
  }, [catalogData, activeBrand, activeCategory, currentBrandRule]);

  // Extract products for the left side and right side sheet
  const availableProducts = useMemo(() => {
    let prods = [];

    // 1. Get products for the active brand or category with section filter
    if (activeBrand && activeBrand !== 'ALL') {
      prods = getProductsForBrand(activeBrand, activeSection);
    } else if (activeCategory && activeCategory !== 'ALL') {
      prods = getProductsForBrand(activeCategory, activeSection);
    } else {
      prods = getProductsForBrand('ALL', activeSection);
    }

    // 2. Also check if catalogData from DB has extra products matching activeBrand
    if (catalogData?.categories) {
      const dbProds = [];
      catalogData.categories.forEach((cat) => {
        cat.subcategories?.forEach((sub) => {
          sub.products?.forEach((p) => {
            const matchesBrand =
              !activeBrand || activeBrand === 'ALL'
                ? true
                : (p.brand && p.brand.toLowerCase() === activeBrand.toLowerCase());

            const matchesCategory =
              !activeCategory || activeCategory === 'ALL'
                ? true
                : ((p.categoryName || cat.name).toLowerCase().includes(activeCategory.toLowerCase()));

            if (matchesBrand && matchesCategory) {
              dbProds.push({
                partNumber: p.partNumber,
                name: p.name,
                brand: p.brand || activeBrand || 'Industrial',
                categoryName: p.categoryName || cat.name,
                section: p.section || sub.name || '',
                dimensions: p.dimensions || '',
                mrp: Number(p.mrp) || 1200,
                discountPercentage: Number(p.discountPercentage) || currentBrandRule.discountPct || 48,
                wholesalePrice: Number(p.wholesalePrice) || Math.round((Number(p.mrp) || 1200) * (1 - (currentBrandRule.discountPct || 48) / 100)),
                image: p.image || currentBrandRule.image || FALLBACK_IMAGE,
                specifications: p.specifications || p.description || '',
              });
            }
          });
        });
      });

      // Merge unique by partNumber
      const existingPartNums = new Set(prods.map((p) => p.partNumber.toLowerCase()));
      dbProds.forEach((dp) => {
        if (!existingPartNums.has(dp.partNumber.toLowerCase())) {
          prods.push(dp);
          existingPartNums.add(dp.partNumber.toLowerCase());
        }
      });
    }

    // 3. Apply active section filter if selected
    if (activeSection && activeSection !== 'ALL' && activeSection !== 'All Sections') {
      const filteredBySection = prods.filter((p) => matchesSectionFilter(p, activeSection));
      if (filteredBySection.length > 0) {
        prods = filteredBySection;
      }
    }

    // 4. Apply product local search if typed
    if (productLocalSearch.trim()) {
      const q = productLocalSearch.trim().toLowerCase();
      prods = prods.filter(
        (p) =>
          p.partNumber.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.specifications && p.specifications.toLowerCase().includes(q))
      );
    }

    return prods;
  }, [catalogData, activeBrand, activeCategory, activeSection, currentBrandRule, productLocalSearch]);

  // Filtered products specifically for the Right-Side Master Sheet
  const sheetFilteredProducts = useMemo(() => {
    if (!sheetSearch.trim()) {
      return availableProducts;
    }
    const q = sheetSearch.trim().toLowerCase();
    return availableProducts.filter(
      (p) =>
        p.partNumber.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.specifications && p.specifications.toLowerCase().includes(q)) ||
        (p.dimensions && p.dimensions.toLowerCase().includes(q))
    );
  }, [availableProducts, sheetSearch]);

  // Set initial selected product when brand changes or list loads
  useEffect(() => {
    if (availableProducts.length > 0) {
      if (!selectedProduct || !availableProducts.some((p) => p.partNumber === selectedProduct.partNumber)) {
        setSelectedProduct(availableProducts[0]);
        setSelectedProductQty(1);
      }
    } else {
      setSelectedProduct(null);
    }
  }, [availableProducts]);

  // When a product is clicked/selected from left list OR right-side master sheet:
  const handleSelectProduct = (product) => {
    if (!product) return;
    setSelectedProduct(product);
    setSelectedProductQty(1);
    showToast(`Selected ${product.partNumber} — loaded on the left side`);
  };

  // Cart Add Handler - dispatches to global CartContext
  const handleAddToCart = (product, qty = 1) => {
    if (!product) return;
    addToCart(product, qty);
  };

  // Generate Quotation Modal submit
  const handleGenerateQuotationSubmit = async (e) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.phone) {
      showErrorAlert('Missing Information', 'Please provide your full name and contact phone number.');
      return;
    }

    let itemsToQuote = [];
    if (selectedProductForQuote) {
      const mrp = Number(selectedProductForQuote.mrp) || 1000;
      const disc = Number(selectedProductForQuote.discountPercentage) || 48;
      const rate = selectedProductForQuote.wholesalePrice || Math.round(mrp * (1 - disc / 100));
      const qty = orderQuantity || 1;
      itemsToQuote = [
        {
          category: selectedProductForQuote.categoryName || selectedProductForQuote.brand || 'Industrial Parts',
          partNumber: selectedProductForQuote.partNumber,
          name: selectedProductForQuote.name,
          description: selectedProductForQuote.specifications || selectedProductForQuote.name,
          hsn: '8482',
          quantity: qty,
          mrp,
          discountPercentage: disc,
          rate,
          amount: rate * qty,
        },
      ];
    } else if (cartItems.length > 0) {
      itemsToQuote = cartItems;
    } else if (selectedProduct) {
      const mrp = Number(selectedProduct.mrp) || 1000;
      const disc = Number(selectedProduct.discountPercentage) || 48;
      const rate = selectedProduct.wholesalePrice || Math.round(mrp * (1 - disc / 100));
      const qty = selectedProductQty || 1;
      itemsToQuote = [
        {
          category: selectedProduct.categoryName || selectedProduct.brand || 'Industrial Parts',
          partNumber: selectedProduct.partNumber,
          name: selectedProduct.name,
          description: selectedProduct.specifications || selectedProduct.name,
          hsn: '8482',
          quantity: qty,
          mrp,
          discountPercentage: disc,
          rate,
          amount: rate * qty,
        },
      ];
    }

    if (itemsToQuote.length === 0) {
      showErrorAlert('Empty Quotation', 'Please select a product or add items to your quotation cart.');
      return;
    }

    setOrderSubmitting(true);
    try {
      const subtotal = itemsToQuote.reduce((acc, it) => acc + (it.amount || 0), 0);
      const taxRate = 18;
      const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
      const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

      const payload = {
        name: orderForm.name,
        phone: orderForm.phone,
        email: orderForm.email || `${orderForm.phone.replace(/[^0-9]/g, '')}@balumuni-client.com`,
        subject: `Quotation Request: ${itemsToQuote.map((it) => it.partNumber).join(', ')}`,
        message: `Official B2B Quotation generated from PDF Price List.\nBrand: ${activeBrand}\nDelivery City: ${orderForm.deliveryLocation}\nNotes: ${orderForm.notes || 'None'}`,
        enquiryType: 'rfq',
        companyName: orderForm.companyName,
        deliveryLocation: orderForm.deliveryLocation,
        gstin: orderForm.gstin,
        brand: itemsToQuote[0]?.category || activeBrand || 'Industrial Spares',
        partNumber: itemsToQuote.map((it) => it.partNumber).join(', '),
        quantity: itemsToQuote.reduce((acc, it) => acc + (it.quantity || 1), 0),
        targetPrice: subtotal,
        approvedPrice: totalAmount,
        items: itemsToQuote,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        paymentTerms: '7 DAYS CREDIT',
        deliveryTerms: orderForm.deliveryLocation ? `DOORSTEP TO ${orderForm.deliveryLocation.toUpperCase()}` : 'SELF TO SRIVIL',
      };

      const res = await contentService.submitEnquiry(payload);
      if (res.success) {
        setIsOrderModalOpen(false);
        setGeneratedQuotation(res.data);
        setIsQuotationViewModalOpen(true);
        showToast(`Quotation #${res.data?.quotationNumber || 'Generated'} created successfully!`);
      }
    } catch (err) {
      showErrorAlert('Quotation Submission Failed', err.response?.data?.message || err.message);
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Price calculations for active selected product
  const mrp = Number(selectedProduct?.mrp) || 2000;
  const discountPct = Number(selectedProduct?.discountPercentage) || currentBrandRule.discountPct || 48;
  const discountAmount = Math.round((mrp * discountPct) / 100);
  const netWholesalePrice = selectedProduct?.wholesalePrice || Math.max(0, mrp - discountAmount);

  // Line item multiplication on quantity change:
  const lineSubtotal = Math.round(netWholesalePrice * selectedProductQty * 100) / 100;
  const lineTax = Math.round((lineSubtotal * 0.18) * 100) / 100;
  const lineGrandTotal = Math.round((lineSubtotal + lineTax) * 100) / 100;

  return (
    <div className="space-y-6">
      {/* 2-COLUMN MAIN LAYOUT:
          LEFT: Selected Product with "Add to Cart" Option + Category Products
          RIGHT: Master PDF Catalog Data Sheet / Canvas Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================
            LEFT COLUMN (5 cols on lg, approx 42% width):
            Selected Product Card + Add to Cart + Category Products
            ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. ACTIVE SELECTED PRODUCT CARD (User Requirement) */}
          {/* "Select Panaa Product pdf ku lefy side show Akanum Add to Cart Option Oda" */}
          <div className="bg-white rounded-3xl border border-blue-200/90 shadow-xl overflow-hidden space-y-0 transition-all">
            {/* Card Top Banner with Brand & Authenticity Tag */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-lg uppercase tracking-wider shadow-xs">
                  {selectedProduct?.brand || activeBrand}
                </span>
                <span className="text-xs font-bold text-blue-100 truncate">
                  {selectedProduct?.categoryName || 'Industrial Spares'}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Genuine</span>
              </span>
            </div>

            {/* Product Image & Main Details */}
            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                {/* Product Image */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-xs relative group">
                  <img
                    src={selectedProduct?.image || currentBrandRule.image || FALLBACK_IMAGE}
                    alt={selectedProduct?.name || 'Industrial Product'}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = currentBrandRule.image || FALLBACK_IMAGE;
                    }}
                  />
                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded">
                    {discountPct}% OFF
                  </span>
                </div>

                {/* Product Name, Part Number & Section */}
                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block">
                    Part #{selectedProduct?.partNumber || 'SELECT PRODUCT'}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-navy leading-snug">
                    {selectedProduct?.name || 'Select a product to view technical pricing'}
                  </h3>
                  <p className="text-xs text-secondaryText leading-relaxed">
                    {selectedProduct?.section || selectedProduct?.categoryName || 'Industrial Power Transmission Component'}
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ In Stock - Dispatches in 24h
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      🚚 Standard Insured Shipping
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-Time B2B Wholesale Pricing Breakdown with Quantity Multiplication */}
              {/* "admin Side Pdf La Ennaa Irukutho Antha Price Mattum tha Show Akanummm Athu badithan Show Akanum Inga User Ku varumpothu Ennaa Discount ohh Athu Calculate Aki Show Akanum USer Ku" */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Official Admin List MRP (from PDF):</span>
                  <span className="font-bold text-slate-800 line-through">
                    {formatCurrency(mrp)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-amber-700 flex items-center gap-1">
                    <BadgePercent className="w-3.5 h-3.5" />
                    Authorized Wholesale Discount ({discountPct}% OFF):
                  </span>
                  <span className="font-black text-amber-700">
                    - {formatCurrency(discountAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-600 font-bold">Unit Net Wholesale Rate:</span>
                  <span className="font-black text-slate-900 font-mono">
                    {formatCurrency(netWholesalePrice)} / Unit
                  </span>
                </div>

                {/* Real-Time Multiplied Order Total on Quantity Change */}
                <div className="pt-2 border-t-2 border-dashed border-blue-200 flex justify-between items-baseline bg-blue-50/60 p-2.5 rounded-xl">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wide text-blue-950 block">
                      Total for {selectedProductQty} {selectedProductQty > 1 ? 'Units' : 'Unit'}:
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Subtotal: {formatCurrency(lineSubtotal)} + 18% GST ({formatCurrency(lineTax)})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-blue-900 font-mono">
                      {formatCurrency(lineGrandTotal)}
                    </span>
                    <span className="text-[10px] text-emerald-700 block font-bold">
                      (All Taxes &amp; Freight Included)
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector & ADD TO CART Button (Requirement 4) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-3 bg-slate-100/80 p-2 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 pl-2">Order Quantity:</span>
                  <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-300 p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setSelectedProductQty((q) => Math.max(1, q - 1))}
                      className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-navy cursor-pointer transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={selectedProductQty}
                      onChange={(e) => setSelectedProductQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 text-center text-xs font-black text-navy bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedProductQty((q) => q + 1)}
                      className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-navy cursor-pointer transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Primary ADD TO CART & Instant Official RFQ Buttons side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(selectedProduct, selectedProductQty)}
                    disabled={!selectedProduct}
                    className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-blue-700 text-white font-black text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-300" />
                    <span>Add to Quotation Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductForQuote(selectedProduct);
                      setOrderQuantity(selectedProductQty);
                      setIsOrderModalOpen(true);
                    }}
                    disabled={!selectedProduct}
                    className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-slate-950" />
                    <span>Generate Quotation</span>
                  </button>
                </div>

                {/* Direct View Cart Button when cart has items */}
                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={openCart}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <span>View Quotation Cart ({totalItemCount} {totalItemCount > 1 ? 'Units' : 'Unit'})</span>
                  </button>
                )}
              </div>

              {/* Technical Specifications */}
              {selectedProduct?.specifications && (
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                    Technical Specifications:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    {selectedProduct.specifications}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2. CATEGORY PRODUCTS LIST (Allows selecting any product under this brand) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-black text-navy flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span>{activeBrand === 'ALL' ? 'All Verified Industrial Products' : `${activeBrand} Catalog Products`}</span>
                </h4>
                <p className="text-[11px] text-secondaryText">
                  {availableProducts.length} verified item{availableProducts.length !== 1 ? 's' : ''} available
                </p>
              </div>

              {/* Local Search inside brand products */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter part #..."
                  value={productLocalSearch}
                  onChange={(e) => setProductLocalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Scrollable list of products */}
            <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {availableProducts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No products found matching filter.
                </div>
              ) : (
                availableProducts.map((p) => {
                  const isSelected = selectedProduct?.partNumber === p.partNumber;
                  return (
                    <div
                      key={p.partNumber}
                      onClick={() => handleSelectProduct(p)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isSelected
                          ? 'border-primary bg-blue-50/70 shadow-sm ring-1 ring-primary/30'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden">
                          <img
                            src={p.image || currentBrandRule.image || FALLBACK_IMAGE}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_IMAGE;
                            }}
                          />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-navy group-hover:text-primary transition-colors">
                              {p.partNumber}
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                              {p.discountPercentage}% OFF
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{p.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="text-right mr-1">
                          <span className="text-xs font-black text-navy block font-mono">
                            {formatCurrency(p.wholesalePrice)}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatCurrency(p.mrp)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(p, 1);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-primary hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                          title="Add 1 to Cart"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Add</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(p);
                            setSelectedProductForQuote(p);
                            setOrderQuantity(1);
                            setIsOrderModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                          title="Generate Quotation for this item"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-950" />
                          <span className="hidden sm:inline">Quote</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. STICKY / FLOATING QUOTATION CART BAR */}
          {cartItems.length > 0 && (
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-4 sm:p-5 border border-amber-400/40 text-white shadow-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Quotation Cart ({totalItemCount} {totalItemCount > 1 ? 'Units' : 'Unit'} • {cartItems.length} {cartItems.length > 1 ? 'Items' : 'Item'})
                    </h4>
                    <span className="text-xs text-amber-300 font-bold font-mono">
                      Total: {formatCurrency(cartGrandTotal)} (incl. 18% GST)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openCart}
                    className="text-xs text-amber-300 hover:text-white font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    View Cart
                  </button>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-rose-400 hover:underline font-bold"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Compact Cart Items List with Quantity Multiplication in real time */}
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {cartItems.map((item) => (
                  <div
                    key={item.partNumber}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs"
                  >
                    <div className="truncate mr-2 flex-1">
                      <span className="font-extrabold text-amber-300">{item.partNumber}</span>
                      <span className="text-slate-400 text-[11px] block truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* Quantity Controls - multiplies in real-time */}
                      <div className="flex items-center gap-0.5 bg-white/10 rounded-lg p-0.5 border border-white/20">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.partNumber, item.quantity - 1)}
                          className="p-1 hover:bg-white/20 rounded text-slate-300 hover:text-white cursor-pointer"
                          title="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-white text-[11px]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.partNumber, item.quantity + 1)}
                          className="p-1 hover:bg-white/20 rounded text-slate-300 hover:text-white cursor-pointer"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Multiplied Total Price: rate * quantity */}
                      <span className="font-mono font-bold text-white min-w-[65px] text-right">
                        {formatCurrency(item.amount)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.partNumber)}
                        className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProductForQuote(null);
                    setIsOrderModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Generate Quotation</span>
                </button>

                <button
                  type="button"
                  onClick={openCart}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Open Cart Drawer</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            RIGHT COLUMN (7 cols on lg, approx 58% width):
            MASTER PDF CATALOG DATA SHEET & INTERACTIVE VIEWER
            ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Card Container - Clean Professional Light Theme */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col text-slate-900">
            
            {/* Top Navigation & View Switcher Bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-500/40">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full">
                      Official Manufacturer Catalog
                    </span>
                    {activeBrand && activeBrand !== 'ALL' && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                        {activeBrand}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5" title={activePdfInfo.title}>
                    {activePdfInfo.title}
                  </h3>
                  <p className="text-[11px] text-blue-100 font-mono truncate">{activePdfInfo.fileName}</p>
                </div>
              </div>

              {/* View Switcher Toggle & Actions */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <div className="flex items-center bg-white/10 rounded-xl border border-white/20 p-1">
                  <button
                    type="button"
                    onClick={() => setRightViewMode('sheet')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      rightViewMode === 'sheet'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-white hover:bg-white/15'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Data Sheet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightViewMode('canvas')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      rightViewMode === 'canvas'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-white hover:bg-white/15'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Original PDF</span>
                  </button>
                </div>

                <a
                  href={activePdfInfo.url}
                  target="_blank"
                  rel="noreferrer"
                  download={activePdfInfo.fileName}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
                  title="Download Catalog PDF"
                >
                  <Download className="w-4 h-4" />
                </a>

                <a
                  href={activePdfInfo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition-colors shadow-md"
                  title="Open PDF in Full Screen"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* In-Document Search Box (Light Theme with Search Highlighting) */}
            <div className="bg-slate-50 p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-primary absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={`Search in catalog data (e.g. ${activeBrand !== 'ALL' ? activeBrand : 'Diamond'}, 08B-1, 6405, 1LE7, C-98)...`}
                  value={sheetSearch}
                  onChange={(e) => {
                    setSheetSearch(e.target.value);
                    if (onSearchChange) onSearchChange(e.target.value);
                  }}
                  className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-xs"
                />
                {sheetSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setSheetSearch('');
                      if (onSearchChange) onSearchChange('');
                    }}
                    className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-700 font-mono bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
                  {sheetFilteredProducts.length} Product{sheetFilteredProducts.length !== 1 ? 's' : ''} in Catalog
                </span>
              </div>
            </div>

            {/* VIEW 1: MASTER PDF CATALOG DATA SHEET (Clean Light Theme with Highlighting) */}
            {rightViewMode === 'sheet' && (
              <div className="relative flex-1 flex flex-col overflow-hidden bg-white">
                {/* Information Header Banner */}
                <div className="bg-blue-50/90 p-2.5 px-4 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="font-extrabold text-blue-900 flex items-center gap-1.5">
                    <MousePointerClick className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
                    <span>Click ANY row to load on Left Side or click "+ Add" to add to cart:</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {activeSection && activeSection !== 'ALL' && activeSection !== 'All Sections' && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                        {activeSection}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      Official Engineering Schedule
                    </span>
                  </div>
                </div>

                {/* Full Scrollable Table in Light Theme */}
                <div
                  className="overflow-x-auto overflow-y-auto max-h-[720px] select-text bg-white"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #f1f5f9' }}
                >
                  <table className="w-full text-left border-collapse text-xs">
                    {/* Sticky Table Header */}
                    <thead className="sticky top-0 bg-slate-100 text-slate-700 uppercase text-[10px] font-black tracking-wider border-b border-slate-200 z-10 shadow-xs">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center">#</th>
                        <th className="py-3 px-4 min-w-[140px]">Part Number</th>
                        <th className="py-3 px-4 min-w-[220px]">Product &amp; Technical Specifications</th>
                        <th className="py-3 px-4 min-w-[130px] hidden md:table-cell">Dimensions / Series</th>
                        <th className="py-3 px-4 text-right min-w-[90px]">List MRP</th>
                        <th className="py-3 px-3 text-center min-w-[70px]">Discount</th>
                        <th className="py-3 px-4 text-right min-w-[100px]">Wholesale Rate</th>
                        <th className="py-3 px-3 text-center min-w-[100px]">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 font-sans bg-white">
                      {sheetFilteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-16 text-center text-slate-400">
                            No products match "{sheetSearch}". Try searching for another part number or brand.
                          </td>
                        </tr>
                      ) : (
                        sheetFilteredProducts.map((p, idx) => {
                          const isSelected = selectedProduct?.partNumber === p.partNumber;
                          return (
                            <tr
                              key={`sheet-row-${p.partNumber}-${idx}`}
                              onClick={() => handleSelectProduct(p)}
                              className={`group cursor-pointer transition-all duration-150 ${
                                isSelected
                                  ? 'bg-blue-50/90 text-navy font-semibold ring-2 ring-inset ring-primary/40 shadow-xs border-l-4 border-primary'
                                  : 'hover:bg-slate-50/80 text-slate-800'
                              }`}
                            >
                              {/* S.No */}
                              <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-400">
                                {idx + 1}
                              </td>

                              {/* Part Number with Search Highlight */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono font-black text-xs ${isSelected ? 'text-primary' : 'text-slate-900 group-hover:text-primary transition-colors'}`}>
                                    <HighlightText text={p.partNumber} highlight={sheetSearch} />
                                  </span>
                                  {isSelected && (
                                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-md shadow-2xs">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 block truncate">
                                  <HighlightText text={`${p.brand} • ${p.section || p.categoryName}`} highlight={sheetSearch} />
                                </span>
                              </td>

                              {/* Description & Specifications with Search Highlight */}
                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-900 text-xs leading-snug">
                                  <HighlightText text={p.name} highlight={sheetSearch} />
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono mt-0.5 line-clamp-2">
                                  <HighlightText text={p.specifications || p.description || 'Precision B2B Industrial Standard'} highlight={sheetSearch} />
                                </p>
                              </td>

                              {/* Dimensions / Series with Search Highlight */}
                              <td className="py-3 px-4 font-mono text-[11px] text-slate-600 hidden md:table-cell">
                                <HighlightText text={p.dimensions || p.section || '-'} highlight={sheetSearch} />
                              </td>

                              {/* Admin PDF List MRP */}
                              <td className="py-3 px-4 text-right font-mono text-slate-400 line-through">
                                {formatCurrency(p.mrp)}
                              </td>

                              {/* Authorized Discount */}
                              <td className="py-3 px-3 text-center">
                                <span className="bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full inline-block">
                                  {p.discountPercentage}% OFF
                                </span>
                              </td>

                              {/* Net Wholesale Rate */}
                              <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-xs sm:text-sm">
                                {formatCurrency(p.wholesalePrice)}
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                  {isSelected ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-1 rounded-xl shadow-2xs">
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Selected</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSelectProduct(p)}
                                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-400 hover:text-slate-950 text-slate-800 text-xs font-bold transition-all border border-slate-300 cursor-pointer shadow-2xs"
                                    >
                                      Select
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(p, 1)}
                                    className="px-2 py-1 rounded-xl bg-primary hover:bg-blue-700 text-white text-[11px] font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                    title="Add 1 to Cart"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Summary Bar in Light Theme */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Official Manufacturer B2B Wholesale Schedule • All Prices Subject to 18% GST</span>
                  </div>
                  <div className="font-mono text-primary font-bold">
                    Showing {sheetFilteredProducts.length} of {availableProducts.length} Items
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: ORIGINAL PDF DOCUMENT (CANVAS VIEWER) */}
            {rightViewMode === 'canvas' && (
              <InteractivePdfDocumentViewer
                pdfUrl={activePdfInfo.url}
                title={activePdfInfo.title}
                fileName={activePdfInfo.fileName}
                searchTerm={sheetSearch}
                onSearchChange={(term) => {
                  setSheetSearch(term);
                  if (onSearchChange) onSearchChange(term);
                }}
                brandName={activeBrand === 'ALL' ? '' : activeBrand}
                availableProducts={availableProducts}
                selectedProduct={selectedProduct}
                onSelectProduct={handleSelectProduct}
                discountPercentage={currentBrandRule?.discountPct || 48}
              />
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: Generate Official Quotation
          ======================================================== */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-navy">Generate Official B2B Quotation</h3>
                <p className="text-xs text-secondaryText">
                  Instant GST invoice quotation with factory discounts &amp; delivery terms
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-navy cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateQuotationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Senthil Kumar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Company / Firm Name
                  </label>
                  <input
                    type="text"
                    value={orderForm.companyName}
                    onChange={(e) => setOrderForm({ ...orderForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Sri Balaji Mills Ltd"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Delivery City / Destination
                  </label>
                  <input
                    type="text"
                    value={orderForm.deliveryLocation}
                    onChange={(e) => setOrderForm({ ...orderForm, deliveryLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Coimbatore / Chennai"
                  />
                </div>
              </div>

              {/* Items Summary preview */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  Quotation Line Item Details:
                </span>
                {selectedProductForQuote ? (
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>
                      {selectedProductForQuote.partNumber} x {orderQuantity} Units
                    </span>
                    <span className="font-mono text-primary">
                      {formatCurrency((selectedProductForQuote.wholesalePrice || 1000) * orderQuantity)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Quotation Cart ({cartItems.length} Products)</span>
                    <span className="font-mono text-primary">{formatCurrency(cartSubtotal)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-extrabold text-navy">
                  <span>Grand Total (incl. 18% GST):</span>
                  <span className="font-mono text-base text-primary">
                    {selectedProductForQuote
                      ? formatCurrency(
                          Math.round(
                            (selectedProductForQuote.wholesalePrice || 1000) * orderQuantity * 1.18 * 100
                          ) / 100
                        )
                      : formatCurrency(cartGrandTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderSubmitting}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {orderSubmitting ? (
                  <>
                    <Spinner size="xs" />
                    <span>Generating Official GST Invoice...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Confirm &amp; Generate Official Quotation</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: Official Balumuni Quotation Invoice Viewer
          ======================================================== */}
      {isQuotationViewModalOpen && generatedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 space-y-4 border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base sm:text-lg font-black text-navy">
                  Official B2B Quotation #{generatedQuotation.quotationNumber || 'BALU-Q-1001'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuotationViewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-navy cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Balumuni Invoice Component */}
            <BalumuniInvoice enquiry={generatedQuotation} />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsQuotationViewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
