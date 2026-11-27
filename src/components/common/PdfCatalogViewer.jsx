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
} from 'lucide-react';
import api, { getAssetUrl } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import { useSite } from '../../context/SiteContext';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from './Spinner';
import { Button } from './Button';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';
import { contentService } from '../../services/contentService';
import { BalumuniInvoice } from './BalumuniInvoice';
import { InteractivePdfDocumentViewer } from './InteractivePdfDocumentViewer';
import {
  FOURTEEN_OFFICIAL_MAKES,
  OFFICIAL_BRAND_PRODUCTS,
  getProductsForBrand,
} from '../../utils/officialBrandsData';

const FALLBACK_IMAGE = 'https://cobrel.co.za/wp-content/uploads/2019/10/Classical-V-Belts-copy3.png';

export const PdfCatalogViewer = ({
  initialSearch = '',
  initialCategory = 'ALL',
  initialBrand = 'ALL',
  onBrandSelect,
  onSearchChange,
}) => {
  const { isTamil, t } = useLanguage();
  const { categories, settings } = useSite();
  const { user } = useAuth();

  // Catalog data from backend
  const [catalogData, setCatalogData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter and search states
  const [activeBrand, setActiveBrand] = useState(initialBrand || 'ALL');
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'ALL');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [pdfInDocSearch, setPdfInDocSearch] = useState(initialSearch || '');

  // Selected product state for LEFT side display
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductQty, setSelectedProductQty] = useState(1);
  const [productLocalSearch, setProductLocalSearch] = useState('');

  // Quotation Cart states
  const [cartItems, setCartItems] = useState([]);
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
  const [customerImageFiles, setCustomerImageFiles] = useState([]);
  const [customerImagePreviews, setCustomerImagePreviews] = useState([]);
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
      setPdfInDocSearch(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory !== undefined && initialCategory !== activeCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  // Fetch PDF Catalogs from Backend API
  const fetchPdfCatalog = async (query = '', brand = '') => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.search = query;
      if (brand && brand !== 'ALL') params.brand = brand;

      const res = await api.get('/pdf-catalog', { params });
      const catalog = res?.data?.categories ? res.data : res?.data || res;
      if (catalog && (catalog.categories || catalog.totalCategories !== undefined)) {
        setCatalogData(catalog);
      }
    } catch (err) {
      console.error('[PdfCatalogViewer Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfCatalog(searchQuery, activeBrand);
  }, []);

  // Determine current active brand rule
  const currentBrandRule = useMemo(() => {
    if (!activeBrand || activeBrand === 'ALL') {
      return FOURTEEN_OFFICIAL_MAKES[0];
    }
    return (
      FOURTEEN_OFFICIAL_MAKES.find(
        (b) => b.code.toLowerCase() === activeBrand.toLowerCase() || b.name.toLowerCase() === activeBrand.toLowerCase()
      ) || FOURTEEN_OFFICIAL_MAKES[0]
    );
  }, [activeBrand]);

  // Determine which PDF URL to show on the right side
  // Looks for Admin-uploaded PDF corresponding to selected brand / category
  const activePdfInfo = useMemo(() => {
    if (!catalogData) {
      return {
        url: '/sample-catalog.pdf',
        title: 'Industrial Belts & Bearings Master Catalog',
        fileName: 'PIX-Industrial-Belts-Price-List.pdf',
        isBrandSpecific: false,
      };
    }

    const allCatalogs = catalogData.catalogs || [];

    // 1. If brand is selected, look for a catalog matching that brand
    if (activeBrand && activeBrand !== 'ALL') {
      const bLower = activeBrand.toLowerCase().trim();
      const matchedCat = allCatalogs.find((c) => {
        const cBrand = (c.brand || '').toLowerCase().trim();
        const cName = (c.categoryName || '').toLowerCase().trim();
        const cTitle = (c.title || '').toLowerCase().trim();
        const cFile = (c.fileName || '').toLowerCase().trim();
        return (
          cBrand === bLower ||
          cBrand.includes(bLower) ||
          cName.includes(bLower) ||
          cTitle.includes(bLower) ||
          cFile.includes(bLower)
        );
      });

      if (matchedCat && matchedCat.fileUrl) {
        return {
          url: matchedCat.fileUrl,
          title: matchedCat.title || `${activeBrand} Official Manufacturer Price List`,
          fileName: matchedCat.fileName || `${activeBrand}-Price-List.pdf`,
          isBrandSpecific: true,
          catalogId: matchedCat._id,
        };
      }
    }

    // 2. If category is selected, look for catalog matching category
    if (activeCategory && activeCategory !== 'ALL') {
      const cLower = activeCategory.toLowerCase().trim();
      const matchedCat = allCatalogs.find((c) => {
        const cName = (c.categoryName || '').toLowerCase().trim();
        const cTitle = (c.title || '').toLowerCase().trim();
        return cName.includes(cLower) || cTitle.includes(cLower);
      });
      if (matchedCat && matchedCat.fileUrl) {
        return {
          url: matchedCat.fileUrl,
          title: matchedCat.title || `${activeCategory} Official Price List`,
          fileName: matchedCat.fileName || 'Category-Price-List.pdf',
          isBrandSpecific: true,
          catalogId: matchedCat._id,
        };
      }
    }

    // 3. Fallback to primary catalog or /sample-catalog.pdf
    return {
      url: catalogData.fileUrl || '/sample-catalog.pdf',
      title: catalogData.title || 'Industrial Belts & Bearings Master Catalog',
      fileName: catalogData.fileName || 'PIX-Industrial-Belts-Price-List.pdf',
      isBrandSpecific: false,
      catalogId: catalogData._id,
    };
  }, [catalogData, activeBrand, activeCategory]);

  // Extract products for the left side
  const availableProducts = useMemo(() => {
    let prods = [];

    // 1. Collect from database extracted catalog categories if present
    if (catalogData?.categories) {
      catalogData.categories.forEach((cat) => {
        cat.subcategories?.forEach((sub) => {
          sub.products?.forEach((p) => {
            const matchesBrand =
              !activeBrand ||
              activeBrand === 'ALL' ||
              (p.brand && p.brand.toLowerCase() === activeBrand.toLowerCase()) ||
              (p.categoryName && p.categoryName.toLowerCase().includes(activeBrand.toLowerCase()));

            if (matchesBrand) {
              prods.push({
                partNumber: p.partNumber,
                name: p.name,
                brand: p.brand || activeBrand || 'General',
                categoryName: p.categoryName || cat.name,
                section: p.section || sub.name || '',
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
    }

    // 2. Combine with official predefined verified products for that brand
    const staticProds = getProductsForBrand(activeBrand);
    if (prods.length === 0) {
      prods = staticProds;
    } else {
      // Merge unique by partNumber
      const existingPartNums = new Set(prods.map((p) => p.partNumber.toLowerCase()));
      staticProds.forEach((sp) => {
        if (!existingPartNums.has(sp.partNumber.toLowerCase())) {
          prods.push(sp);
        }
      });
    }

    // 3. Apply product local search if user typed in left search box
    if (productLocalSearch.trim()) {
      const q = productLocalSearch.trim().toLowerCase();
      prods = prods.filter(
        (p) =>
          p.partNumber.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.specifications && p.specifications.toLowerCase().includes(q))
      );
    }

    return prods;
  }, [catalogData, activeBrand, currentBrandRule, productLocalSearch]);

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

  // When a product is clicked/selected from left side:
  // Updates selected product AND syncs search term to highlight & scroll right-side PDF!
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSelectedProductQty(1);

    // Sync part number into PDF in-document search so it highlights in the PDF!
    const searchTarget = product.partNumber || product.name;
    setPdfInDocSearch(searchTarget);
    if (onSearchChange) {
      onSearchChange(searchTarget);
    }
    showToast(`Selected ${product.partNumber} — highlighting in PDF document`);
  };

  // Cart Add Handler
  const handleAddToCart = (product, qty = 1) => {
    if (!product) return;
    const mrp = Number(product.mrp) || 1000;
    const disc = Number(product.discountPercentage) || currentBrandRule.discountPct || 48;
    const rate = product.wholesalePrice || Math.round(mrp * (1 - disc / 100));
    const amount = rate * qty;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.partNumber === product.partNumber);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          amount: updated[existingIdx].rate * newQty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          category: product.categoryName || product.brand || 'Industrial Spares',
          partNumber: product.partNumber,
          name: product.name,
          description: product.specifications || product.name,
          hsn: '8482',
          quantity: qty,
          mrp,
          discountPercentage: disc,
          rate,
          amount,
        },
      ];
    });

    showToast(`✓ Added ${product.partNumber} (${qty} ${qty > 1 ? 'units' : 'unit'}) to Quotation Cart!`);
  };

  const handleUpdateCartQty = (index, delta) => {
    setCartItems((prev) => {
      const updated = [...prev];
      if (!updated[index]) return prev;
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, idx) => idx !== index);
      }
      updated[index] = {
        ...updated[index],
        quantity: newQty,
        amount: updated[index].rate * newQty,
      };
      return updated;
    });
  };

  const handleRemoveFromCart = (index) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Generate Quotation Modal submit
  const handleGenerateQuotationSubmit = async (e) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.phone) {
      showErrorAlert('Missing Information', 'Please provide your full name and contact phone number.');
      return;
    }

    let itemsToQuote = cartItems;
    if (itemsToQuote.length === 0 && selectedProduct) {
      const mrp = Number(selectedProduct.mrp) || 1000;
      const disc = Number(selectedProduct.discountPercentage) || 48;
      const rate = selectedProduct.wholesalePrice || Math.round(mrp * (1 - disc / 100));
      itemsToQuote = [
        {
          category: selectedProduct.categoryName || selectedProduct.brand || 'Industrial Parts',
          partNumber: selectedProduct.partNumber,
          name: selectedProduct.name,
          description: selectedProduct.specifications || selectedProduct.name,
          hsn: '8482',
          quantity: selectedProductQty || 1,
          mrp,
          discountPercentage: disc,
          rate,
          amount: rate * (selectedProductQty || 1),
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
        quantity: itemsToQuote.reduce((acc, it) => acc + it.quantity, 0),
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
        setCartItems([]);
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
  const gstAmount = Math.round(((netWholesalePrice * 18) / 100) * 100) / 100;
  const grandTotalPerUnit = Math.round((netWholesalePrice + gstAmount) * 100) / 100;
  const grandTotalOrder = Math.round(grandTotalPerUnit * selectedProductQty * 100) / 100;

  // Cart total sum
  const cartSubtotal = cartItems.reduce((acc, it) => acc + (it.amount || 0), 0);
  const cartTotalWithTax = Math.round((cartSubtotal * 1.18) * 100) / 100;

  return (
    <div className="space-y-6">
      {/* 2-COLUMN MAIN LAYOUT:
          LEFT: Selected Product with "Add to Cart" + Category Products
          RIGHT: Full Scrollable PDF Document Viewer with Search & Text Highlighting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================
            LEFT COLUMN (5 cols on lg, approx 42% width):
            Selected Product Card + Add to Cart + Category Products
            ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. ACTIVE SELECTED PRODUCT CARD (Requirement 4) */}
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

              {/* Real-Time B2B Wholesale Pricing Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Official Manufacturer MRP:</span>
                  <span className="font-bold text-slate-800 line-through">
                    {formatCurrency(mrp)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-amber-700 flex items-center gap-1">
                    <BadgePercent className="w-3.5 h-3.5" />
                    B2B Wholesale Discount ({discountPct}% OFF):
                  </span>
                  <span className="font-black text-amber-700">
                    - {formatCurrency(discountAmount)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wide text-navy block">
                      Net Wholesale Rate:
                    </span>
                    <span className="text-[10px] text-slate-500">+18% GST Applicable</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-navy">
                      {formatCurrency(netWholesalePrice)}
                    </span>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      Total with GST: {formatCurrency(grandTotalPerUnit)}
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

                {/* Primary ADD TO CART Button */}
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
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Instant Official RFQ</span>
                  </button>
                </div>
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
            <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
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

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-black text-navy block">
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
                          className="p-1.5 rounded-xl bg-primary hover:bg-blue-700 text-white transition-colors shadow-2xs"
                          title="Add 1 to Cart"
                        >
                          <Plus className="w-3.5 h-3.5" />
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
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-5 border border-amber-400/30 text-white shadow-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Quotation Cart ({cartItems.length} {cartItems.length > 1 ? 'Items' : 'Item'})
                    </h4>
                    <span className="text-[11px] text-slate-300">
                      Total: {formatCurrency(cartTotalWithTax)} (incl. 18% GST)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-[11px] text-rose-400 hover:underline font-bold"
                >
                  Clear
                </button>
              </div>

              {/* Compact Cart Items List */}
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {cartItems.map((item, idx) => (
                  <div
                    key={`${item.partNumber}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs"
                  >
                    <div className="truncate mr-2">
                      <span className="font-extrabold text-amber-300">{item.partNumber}</span>
                      <span className="text-slate-400 text-[11px] ml-1">× {item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-white">{formatCurrency(item.amount)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(idx)}
                        className="text-slate-400 hover:text-rose-400"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsOrderModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Review Cart &amp; Generate Official Quotation</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            RIGHT COLUMN (7 cols on lg, approx 58% width):
            Interactive PDF Document Viewer with Search & Text Highlighting
            (Requirement 2 & Requirement 3)
            ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          <InteractivePdfDocumentViewer
            pdfUrl={activePdfInfo.url}
            title={activePdfInfo.title}
            fileName={activePdfInfo.fileName}
            searchTerm={pdfInDocSearch}
            onSearchChange={(term) => {
              setPdfInDocSearch(term);
              if (onSearchChange) onSearchChange(term);
            }}
            brandName={activeBrand === 'ALL' ? '' : activeBrand}
          />
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
                className="p-1 rounded-lg text-slate-400 hover:text-navy"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={orderForm.companyName}
                    onChange={(e) => setOrderForm({ ...orderForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Sri Balaji Mills Pvt Ltd"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Coimbatore, Tamil Nadu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  GSTIN (For Official Input Tax Credit)
                </label>
                <input
                  type="text"
                  value={orderForm.gstin}
                  onChange={(e) => setOrderForm({ ...orderForm, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="33AAACB1234F1Z5"
                />
              </div>

              {/* Items Summary */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <span className="font-extrabold text-navy block">
                  Items to Quote ({cartItems.length > 0 ? cartItems.length : 1} items):
                </span>
                <p className="text-slate-600 truncate">
                  {cartItems.length > 0
                    ? cartItems.map((it) => `${it.partNumber} (${it.quantity})`).join(', ')
                    : `${selectedProduct?.partNumber} (${selectedProductQty} units)`}
                </p>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-navy">
                  <span>Estimated Total (incl. 18% GST):</span>
                  <span>{formatCurrency(cartItems.length > 0 ? cartTotalWithTax : grandTotalOrder)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="px-6 py-2 rounded-xl bg-primary hover:bg-blue-700 text-white font-black text-xs shadow flex items-center gap-2 disabled:opacity-50"
                >
                  {orderSubmitting ? <Spinner size="xs" /> : <Printer className="w-4 h-4" />}
                  <span>{orderSubmitting ? 'Generating Quotation...' : 'Generate & Download PDF Quotation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: Official Balumuni Quotation Invoice Viewer
          ======================================================== */}
      {isQuotationViewModalOpen && generatedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-navy">Official Quotation Generated</h3>
                <p className="text-xs text-secondaryText">Quotation #{generatedQuotation.quotationNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuotationViewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <BalumuniInvoice quotation={generatedQuotation} />
          </div>
        </div>
      )}
    </div>
  );
};
