import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Search,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Package,
  BadgePercent,
  Truck,
  ArrowRight,
  Sparkles,
  FileText,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Eye,
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

// Image Fallback Handler for Industrial Components
const FALLBACK_IMAGE = 'https://cobrel.co.za/wp-content/uploads/2019/10/Classical-V-Belts-copy3.png';

export const PdfCatalogViewer = ({ initialSearch = '', initialCategory = 'ALL' }) => {
  const { isTamil, t } = useLanguage();
  const { categories, settings } = useSite();
  const { user } = useAuth();

  const [catalogData, setCatalogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeBrand, setActiveBrand] = useState('ALL');
  const [selectedCatalogId, setSelectedCatalogId] = useState('ALL');
  const [openSubcategories, setOpenSubcategories] = useState({});
  const [expandedProductLimits, setExpandedProductLimits] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Toggle viewing the official uploaded PDF document directly
  const [showOfficialPdfEmbed, setShowOfficialPdfEmbed] = useState(false);

  // Quotation Cart & Modal States (Requirement 3 & 5)
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
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const fetchPdfCatalog = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get('/pdf-catalog', {
        params: query ? { search: query } : {},
      });
      const catalog = res?.data?.categories ? res.data : (res?.data || res);
      if (catalog && (catalog.categories || catalog.totalCategories !== undefined)) {
        setCatalogData(catalog);
        // Expand all subcategories by default
        const initialOpen = {};
        catalog.categories?.forEach((cat, catIdx) => {
          cat.subcategories?.forEach((sub, subIdx) => {
            initialOpen[`${catIdx}-${subIdx}`] = true;
          });
        });
        setOpenSubcategories(initialOpen);
      }
    } catch (err) {
      console.error('[PdfCatalogViewer Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfCatalog();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPdfCatalog(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchPdfCatalog('');
  };

  const toggleSubcategory = (key) => {
    setOpenSubcategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const showMoreProducts = (key, count) => {
    setExpandedProductLimits((prev) => ({
      ...prev,
      [key]: count ? count : (prev[key] || 36) + 48,
    }));
  };

  // Cart Management Handlers (Requirement 3)
  const handleAddToCart = (product, qty = 1, categoryName = '') => {
    const mrp = Number(product.mrp) || 1000;
    const disc = Number(product.discountPercentage) || 48;
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
          category: categoryName || product.categoryName || product.brand || 'Industrial Spares',
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
    showToast(`Added ${product.partNumber} to Quotation Cart (${qty} unit)`);
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

  const handleQuotationImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setCustomerImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setCustomerImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveImage = (index) => {
    setCustomerImageFiles((prev) => prev.filter((_, idx) => idx !== index));
    setCustomerImagePreviews((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Generate Official Quotation Submit Handler (Requirement 5 & 8)
  const handleGenerateQuotationSubmit = async (e) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.phone) {
      showErrorAlert('Missing Information', 'Please provide your full name and contact phone number.');
      return;
    }

    let itemsToQuote = [];
    if (cartItems.length > 0) {
      itemsToQuote = cartItems;
    } else if (selectedProductForQuote) {
      const mrp = Number(selectedProductForQuote.mrp) || 1000;
      const disc = Number(selectedProductForQuote.discountPercentage) || 48;
      const rate = selectedProductForQuote.wholesalePrice || Math.round(mrp * (1 - disc / 100));
      itemsToQuote = [
        {
          category: selectedProductForQuote.categoryName || selectedProductForQuote.brand || 'Industrial Parts',
          partNumber: selectedProductForQuote.partNumber,
          name: selectedProductForQuote.name,
          description: selectedProductForQuote.specifications || selectedProductForQuote.name,
          hsn: '8482',
          quantity: orderQuantity,
          mrp,
          discountPercentage: disc,
          rate,
          amount: rate * orderQuantity,
        },
      ];
    } else {
      showErrorAlert('Empty Quotation', 'Please select a product or add items to your quotation cart.');
      return;
    }

    setOrderSubmitting(true);
    try {
      let uploadedCustomerImages = [];
      for (const file of customerImageFiles) {
        try {
          const imgFormData = new FormData();
          imgFormData.append('image', file);
          imgFormData.append('customerName', orderForm.name);
          imgFormData.append('contactPerson', orderForm.name);
          imgFormData.append('phone', orderForm.phone);
          imgFormData.append('email', orderForm.email);
          imgFormData.append('companyName', orderForm.companyName);
          imgFormData.append('city', orderForm.deliveryLocation);
          imgFormData.append('gstNumber', orderForm.gstin);
          const upRes = await api.post('/user-uploads', imgFormData);
          if (upRes.data?.success && upRes.data.data?.imageUrl) {
            uploadedCustomerImages.push({
              url: upRes.data.data.imageUrl,
              filename: file.name,
              uploadedAt: new Date(),
            });
          }
        } catch (imgErr) {
          console.warn('[Image upload warning]', imgErr.message);
        }
      }

      const subtotal = itemsToQuote.reduce((acc, it) => acc + (it.amount || 0), 0);
      const taxRate = 18;
      const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
      const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

      const payload = {
        name: orderForm.name,
        phone: orderForm.phone,
        email: orderForm.email || `${orderForm.phone.replace(/[^0-9]/g, '')}@balumuni-client.com`,
        subject: `Quotation Request: ${itemsToQuote.map((it) => it.partNumber).join(', ')}`,
        message: `Quotation generated from Admin Uploaded PDF Catalog.\nItems: ${itemsToQuote.length} line items.\nDelivery City: ${orderForm.deliveryLocation}\nNotes: ${orderForm.notes || 'None'}`,
        enquiryType: 'rfq',
        companyName: orderForm.companyName,
        deliveryLocation: orderForm.deliveryLocation,
        gstin: orderForm.gstin,
        brand: itemsToQuote[0]?.category || 'Industrial Spares',
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
        customerImages: uploadedCustomerImages,
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

  // Available brands in the catalog
  const availableBrands = useMemo(() => {
    const bSet = new Set();
    catalogData?.categories?.forEach((cat) => {
      cat.subcategories?.forEach((sub) => {
        sub.products?.forEach((p) => {
          if (p.brand) bSet.add(p.brand);
        });
      });
    });
    return Array.from(bSet);
  }, [catalogData]);

  // Filter categories and products
  const filteredCategories = useMemo(() => {
    if (!catalogData?.categories) return [];

    let list = catalogData.categories;

    // Filter by active category
    if (activeCategory && activeCategory !== 'ALL') {
      const matchCat = (categories || []).find(
        (c) => c._id === activeCategory || c.slug === activeCategory
      );
      const catQuery = (matchCat ? matchCat.name : activeCategory).toLowerCase().trim();
      const catQueryClean = catQuery.replace(/s\b/gi, '');

      list = list.filter((c) => {
        const cName = (c.name || '').toLowerCase();
        return (
          cName === catQuery ||
          cName.includes(catQuery) ||
          catQuery.includes(cName) ||
          cName.includes(catQueryClean) ||
          c._id?.toString() === activeCategory
        );
      });
    }

    // Instant client-side search across categories, subcategories, and part numbers
    const rawQ = searchQuery.trim().toLowerCase();
    if (rawQ) {
      const qClean = rawQ.replace(/s\b/gi, '');
      const tokens = rawQ.split(/\s+/).filter((t) => t.length > 2);

      list = list
        .map((cat) => {
          const catNameLower = (cat.name || '').toLowerCase();
          const catMatches = Boolean(
            catNameLower.includes(rawQ) ||
            catNameLower.includes(qClean) ||
            rawQ.includes(catNameLower) ||
            tokens.some((tok) => catNameLower.includes(tok))
          );

          const matchingSubs = (cat.subcategories || [])
            .map((sub) => {
              const subNameLower = (sub.name || '').toLowerCase();
              const subMatches = Boolean(
                subNameLower.includes(rawQ) ||
                subNameLower.includes(qClean) ||
                rawQ.includes(subNameLower) ||
                tokens.some((tok) => subNameLower.includes(tok))
              );

              const matchingProducts = (sub.products || []).filter((p) => {
                if (catMatches || subMatches) return true;

                const pPart = (p.partNumber || '').toLowerCase();
                const pName = (p.name || '').toLowerCase();
                const pBrand = (p.brand || '').toLowerCase();
                const pSpec = (p.specifications || '').toLowerCase();

                return (
                  pPart.includes(rawQ) ||
                  pPart.replace(/[\s\-_]+/g, '').includes(rawQ.replace(/[\s\-_]+/g, '')) ||
                  pName.includes(rawQ) ||
                  pName.includes(qClean) ||
                  pBrand.includes(rawQ) ||
                  pSpec.includes(rawQ) ||
                  tokens.every((t) => pName.includes(t) || pPart.includes(t) || pBrand.includes(t))
                );
              });

              return {
                ...sub,
                products: matchingProducts,
              };
            })
            .filter((sub) => sub.products.length > 0);

          return {
            ...cat,
            subcategories: matchingSubs,
          };
        })
        .filter((cat) => cat.subcategories.length > 0);
    }

    // Filter by brand
    if (activeBrand !== 'ALL') {
      list = list
        .map((cat) => ({
          ...cat,
          subcategories: cat.subcategories
            .map((sub) => ({
              ...sub,
              products: sub.products.filter((p) => p.brand === activeBrand),
            }))
            .filter((sub) => sub.products.length > 0),
        }))
        .filter((cat) => cat.subcategories.length > 0);
    }

    // Filter by specific uploaded PDF catalog if chosen
    if (selectedCatalogId !== 'ALL') {
      list = list
        .map((cat) => ({
          ...cat,
          subcategories: cat.subcategories
            .map((sub) => ({
              ...sub,
              products: sub.products.filter((p) => String(p.catalogId) === String(selectedCatalogId)),
            }))
            .filter((sub) => sub.products.length > 0),
        }))
        .filter((cat) => cat.subcategories.length > 0);
    }

    return list;
  }, [catalogData, searchQuery, activeCategory, activeBrand, selectedCatalogId]);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-blue-200/80 shadow-[0_16px_45px_-12px_rgba(37,99,235,0.12)] p-6 md:p-8 space-y-6 animate-fadeIn relative overflow-hidden">
      {/* Top Header: Title, PDF Document Scroll Toggle & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Official Manufacturer PDF Catalog
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>100% Genuine Certified</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              <Truck className="w-3 h-3 text-blue-600" />
              <span>Tracked Delhivery Dispatch</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-navy mt-2 tracking-tight">
            {catalogData?.title || 'Industrial Power Transmission & Bearing Price List'}
          </h2>

          <p className="text-xs sm:text-sm text-secondaryText mt-1 max-w-3xl">
            Direct wholesale prices extracted accurately from official manufacturer price lists uploaded by Balumuni & Associates.
          </p>

          {/* Toggle Button to Scroll / View the Uploaded PDF File directly */}
          {catalogData?.fileUrl && (
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setShowOfficialPdfEmbed(!showOfficialPdfEmbed)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{showOfficialPdfEmbed ? 'Close PDF Document Viewer' : 'Scroll Official Uploaded PDF Document'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Stats Pill Card */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Categories</span>
            <span className="text-lg font-black text-navy">{catalogData?.totalCategories || 0}</span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
            <span className="text-[11px] text-emerald-700 font-medium block">Verified Parts</span>
            <span className="text-lg font-black text-emerald-900">{catalogData?.totalProducts || 0}</span>
          </div>
        </div>
      </div>

      {/* Embedded PDF Document Viewer if toggled */}
      {showOfficialPdfEmbed && catalogData?.fileUrl && (
        <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">Official Uploaded Manufacturer PDF Document:</span>
              <span className="font-mono text-slate-400">{catalogData.fileName || 'Price List.pdf'}</span>
            </div>
            <a
              href={getAssetUrl(catalogData.fileUrl)}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </a>
          </div>
          <iframe
            src={getAssetUrl(catalogData.fileUrl)}
            title="Official Catalog PDF Viewer"
            className="w-full h-[650px] rounded-2xl border border-slate-800 bg-white"
          />
        </div>
      )}

      {/* Search & Brand Controls */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search part number (e.g. C-98, 6204, SPC 2360), section name, or specifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-navy text-accent font-black text-xs hover:bg-slate-800 transition-smooth flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-smooth cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {availableBrands.length > 1 && (
          <select
            value={activeBrand}
            onChange={(e) => setActiveBrand(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-black bg-white text-navy focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Brands ({availableBrands.length})</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main Extracted PDF Catalog Hierarchy with ONE Image per Section */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-secondaryText font-medium">
            Loading official PDF catalog data & verified technical specifications...
          </p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-16 text-center text-xs text-secondaryText bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-2">
          <Package className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-darkText">No matching categories or products found.</p>
          <p className="text-[11px] text-slate-400">Try adjusting your search query or category filters.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredCategories.map((category, catIdx) => (
            <div
              key={category.name}
              className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs bg-white space-y-4"
            >
              {/* Category Header */}
              <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {category.image && (
                    <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md shrink-0 overflow-hidden border border-white/20">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-white/10 text-amber-400">
                        <Layers className="w-4 h-4" />
                      </span>
                      <h3 className="font-black text-base sm:text-lg tracking-wide text-white">
                        {category.name}
                      </h3>
                    </div>
                    {category.description && (
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl">{category.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="bg-white/15 text-amber-400 font-black px-3 py-1 rounded-xl text-xs border border-white/10">
                    {category.subcategories?.length || 0} Sections
                  </span>
                  <span className="bg-white/15 text-white font-black px-3 py-1 rounded-xl text-xs border border-white/10">
                    {category.subcategories?.reduce((a, s) => a + (s.products?.length || 0), 0)} Verified Sizes
                  </span>
                </div>
              </div>

              {/* Subcategories (Sections) Container */}
              <div className="p-4 sm:p-6 space-y-6">
                {category.subcategories?.map((subcategory, subIdx) => {
                  const key = `${catIdx}-${subIdx}`;
                  const isOpen = !!openSubcategories[key];
                  const products = subcategory.products || [];
                  const displayLimit = expandedProductLimits[key] || 36;
                  const visibleProducts = products.slice(0, displayLimit);
                  const hasMore = products.length > displayLimit;

                  // Single section image (Oru Oru Section kum Oru Image Show Ana Pothum)
                  const sectionImage = subcategory.image || category.image || '/belts/pix-section-c.jpg';

                  return (
                    <div
                      key={subcategory.name}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden shadow-2xs"
                    >
                      {/* Section Accordion Header Banner displaying the ONE image for this section */}
                      <button
                        type="button"
                        onClick={() => toggleSubcategory(key)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/90 transition-smooth group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          {isOpen ? (
                            <ChevronDown className="w-5 h-5 text-primary shrink-0 transition-transform" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-primary transition-transform" />
                          )}

                          {/* ONE SECTION IMAGE (Requirement: Oru Oru Section kum Oru Image Show Ana Pothum) */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={sectionImage}
                              alt={subcategory.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = FALLBACK_IMAGE;
                              }}
                            />
                          </div>

                          <div>
                            <span className="font-black text-sm sm:text-base text-navy group-hover:text-primary transition-smooth block">
                              {subcategory.name}
                            </span>
                            {subcategory.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{subcategory.description}</p>
                            )}
                            <span className="text-[11px] font-mono text-slate-400 block mt-1">
                              Section Profile Image & Technical Size Specifications
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-black text-primary bg-primary/10 px-3.5 py-1.5 rounded-xl transition-smooth shrink-0">
                          {products.length} Sizes Verified
                        </span>
                      </button>

                      {/* Products Table (Clean Engineering Spec Table without redundant per-item images) */}
                      {isOpen && (
                        <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
                          {products.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 italic text-center">
                              No products found under this section.
                            </p>
                          ) : (
                            <div className="space-y-4">
                              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                    <tr>
                                      <th className="py-3 px-3 text-center w-12">#</th>
                                      <th className="py-3 px-4">Part Number</th>
                                      <th className="py-3 px-4">Product Name & Specifications</th>
                                      <th className="py-3 px-3">Brand</th>
                                      <th className="py-3 px-4 text-right">MRP (₹)</th>
                                      <th className="py-3 px-3 text-center">Discount</th>
                                      <th className="py-3 px-4 text-right">Rate (₹)</th>
                                      <th className="py-3 px-4 text-center w-36">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-medium">
                                    {visibleProducts.map((p, pIdx) => {
                                      const mrp = Number(p.mrp) || 1000;
                                      const disc = Number(p.discountPercentage) || 48;
                                      const rate = p.wholesalePrice || Math.round(mrp * (1 - disc / 100));

                                      return (
                                        <tr
                                          key={p._id || `${key}-${pIdx}`}
                                          className="hover:bg-blue-50/50 transition-colors"
                                        >
                                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono font-bold">
                                            {pIdx + 1}
                                          </td>
                                          <td className="py-2.5 px-4 font-mono font-black text-navy text-xs sm:text-sm">
                                            {p.partNumber}
                                          </td>
                                          <td className="py-2.5 px-4 max-w-sm">
                                            <p className="font-bold text-darkText" title={p.name}>
                                              {p.name}
                                            </p>
                                            {p.specifications && (
                                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                                {p.specifications}
                                              </p>
                                            )}
                                          </td>
                                          <td className="py-2.5 px-3 font-bold text-slate-700">
                                            {p.brand || 'PIX'}
                                          </td>
                                          <td className="py-2.5 px-4 text-right font-mono text-slate-400 line-through text-xs">
                                            {formatCurrency(mrp)}
                                          </td>
                                          <td className="py-2.5 px-3 text-center">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                              -{disc}%
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-4 text-right font-mono font-black text-navy text-sm">
                                            {formatCurrency(rate)}
                                          </td>
                                          <td className="py-2.5 px-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">
                                              <button
                                                type="button"
                                                onClick={() => handleAddToCart(p, 1, category.name)}
                                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1"
                                                title="Add to quotation cart"
                                              >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Add</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setSelectedProductForQuote({
                                                    ...p,
                                                    categoryName: category.name,
                                                  });
                                                  setIsOrderModalOpen(true);
                                                }}
                                                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-black cursor-pointer shadow-2xs transition-all active:scale-95"
                                                title="Generate official quotation for this item"
                                              >
                                                Quote
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {hasMore && (
                                <div className="flex items-center justify-center gap-3 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => showMoreProducts(key)}
                                    className="px-5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs transition-smooth inline-flex items-center gap-2 border border-slate-200 cursor-pointer"
                                  >
                                    <span>Show Next +{Math.min(48, products.length - displayLimit)} sizes</span>
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => showMoreProducts(key, products.length)}
                                    className="px-5 py-2 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black text-xs transition-smooth inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                                  >
                                    <span>Show All ({products.length} Sizes)</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quotation Cart Section Below the PDF Content (Requirement 3) */}
      {cartItems.length > 0 && (
        <div className="mt-8 bg-white rounded-3xl border-2 border-primary/20 shadow-xl overflow-hidden animate-fadeIn">
          {/* Cart Header */}
          <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-wide uppercase">
                    Quotation Cart
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                    {cartItems.length} {cartItems.length === 1 ? 'Product' : 'Products'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Products selected from official manufacturer PDF catalog for quotation download.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleClearCart}
                className="px-3 py-1.5 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-lg active:scale-95"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                <span>Generate Quotation</span>
              </button>
            </div>
          </div>

          {/* Cart Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Category / Brand</th>
                  <th className="py-3 px-4 text-right">MRP</th>
                  <th className="py-3 px-4 text-center">Discount</th>
                  <th className="py-3 px-4 text-right">Rate</th>
                  <th className="py-3 px-4 text-center w-32">Quantity</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cartItems.map((item, idx) => (
                  <tr key={`${item.partNumber}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-black text-navy block text-sm">
                        {item.partNumber}
                      </span>
                      <span className="text-slate-600 font-medium line-clamp-1">
                        {item.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                        {item.category || 'Standard'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400 line-through">
                      {formatCurrency(item.mrp)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        -{item.discountPercentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-navy">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(idx, -1)}
                          className="w-7 h-7 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-mono font-black text-navy text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(idx, 1)}
                          className="w-7 h-7 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-primary text-sm">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cart Summary & Grand Total (Requirement 3) */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xs text-slate-500 space-y-1 max-w-md">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All prices are backed by Balumuni & Associates Official Dealer Warranty.</span>
              </div>
              <p>
                Click "Generate Quotation" to enter delivery address, attach photos, and download an official PDF quotation.
              </p>
            </div>

            <div className="w-full md:w-auto bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 min-w-[300px]">
              {(() => {
                const sub = cartItems.reduce((acc, it) => acc + (it.amount || 0), 0);
                const tax = Math.round(sub * 0.18 * 100) / 100;
                const grand = Math.round((sub + tax) * 100) / 100;
                return (
                  <>
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>Subtotal (Excl. Tax):</span>
                      <span className="font-mono font-bold">{formatCurrency(sub)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>Applicable GST (18%):</span>
                      <span className="font-mono font-bold text-slate-700">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>Logistics / Delhivery:</span>
                      <span className="font-bold text-emerald-700">INCLUDED / TO-PAY</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                      <span className="text-sm font-black text-navy uppercase">Grand Total:</span>
                      <span className="text-xl font-mono font-black text-amber-500">
                        {formatCurrency(grand)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOrderModalOpen(true)}
                      className="mt-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg active:scale-95"
                    >
                      <FileText className="w-4 h-4 text-slate-950" />
                      <span>Generate Quotation (PDF)</span>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Official B2B Quotation Generation Modal */}
      {isOrderModalOpen && (selectedProductForQuote || cartItems.length > 0) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                  Balumuni and Associates • Quotation Request
                </span>
                <h3 className="text-xl font-black text-navy mt-1">
                  Generate Official B2B Quotation
                </h3>
                <p className="text-xs text-slate-500">
                  Sequential ENQ No will be assigned with current month & year.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Products Summary in Modal */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                Quotation Items Summary:
              </span>
              {cartItems.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {cartItems.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-0">
                      <div>
                        <span className="font-mono font-bold text-navy">{it.partNumber}</span>
                        <span className="text-slate-500 text-[11px] block">{it.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-700">{it.quantity} x {formatCurrency(it.rate)}</span>
                        <span className="block font-mono font-black text-primary text-xs">{formatCurrency(it.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedProductForQuote ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-navy">{selectedProductForQuote.partNumber}</span>
                    <span className="text-slate-500 text-[11px] block">{selectedProductForQuote.name}</span>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded inline-block mt-0.5">
                      -{selectedProductForQuote.discountPercentage || 48}% Wholesale Discount
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Unit Rate:</span>
                    <span className="font-mono font-black text-primary text-sm">
                      {formatCurrency(selectedProductForQuote.wholesalePrice || selectedProductForQuote.mrp)}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Quotation Form */}
            <form onSubmit={handleGenerateQuotationSubmit} className="space-y-3.5 text-xs">
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
                <label className="font-bold text-slate-700">Email Address (For PDF Quotation Delivery)</label>
                <input
                  type="email"
                  value={orderForm.email}
                  onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                  placeholder="e.g. procurement@balajimills.com"
                />
              </div>

              {/* Customer Image Upload (Requirement 5 & 8) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Upload Reference Images / Part Nameplates (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">PNG, JPG up to 5MB</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-3 text-center hover:border-primary/50 transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleQuotationImageUpload}
                    id="pdf-quotation-image-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="pdf-quotation-image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-primary"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-bold">Click to attach photos</span>
                    <span className="text-[10px] text-slate-400">Photos will be included in quotation & visible to Admin</span>
                  </label>
                </div>

                {customerImagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {customerImagePreviews.map((preview, pIdx) => (
                      <div key={pIdx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(pIdx)}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {orderSubmitting ? <Spinner size="sm" /> : <FileText className="w-4 h-4 text-slate-950" />}
                  <span>Generate Official Quotation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Quotation View Modal with Print & PDF Download (Requirement 5 & 6) */}
      {isQuotationViewModalOpen && generatedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl my-auto">
            <BalumuniInvoice
              data={generatedQuotation}
              mode="quotation"
              onClose={() => setIsQuotationViewModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
