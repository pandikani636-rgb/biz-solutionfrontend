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
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import { Spinner } from './Spinner';

// Image Fallback Handler for Industrial Components
const FALLBACK_IMAGE = 'https://cobrel.co.za/wp-content/uploads/2019/10/Classical-V-Belts-copy3.png';

export const PdfCatalogViewer = ({ initialSearch = '', initialCategory = 'ALL' }) => {
  const { isTamil, t } = useLanguage();
  const [catalogData, setCatalogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeBrand, setActiveBrand] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [openSubcategories, setOpenSubcategories] = useState({});
  const [expandedProductLimits, setExpandedProductLimits] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Sync props when parent updates
  useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== searchQuery) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory && initialCategory !== activeCategory) {
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
      [key]: count ? count : (prev[key] || 24) + 48,
    }));
  };

  // Available brands in the catalog
  const availableBrands = useMemo(() => {
    const brands = new Set();
    catalogData?.categories?.forEach((cat) => {
      cat.subcategories?.forEach((sub) => {
        sub.products?.forEach((p) => {
          if (p.brand) brands.add(p.brand);
        });
      });
    });
    return Array.from(brands);
  }, [catalogData]);

  // Filter categories and products with instant category matching
  const filteredCategories = useMemo(() => {
    if (!catalogData?.categories) return [];

    let list = catalogData.categories;

    // Filter by active category
    if (activeCategory !== 'ALL') {
      list = list.filter((c) =>
        c.name.toLowerCase() === activeCategory.toLowerCase() ||
        c.name.toLowerCase().includes(activeCategory.toLowerCase())
      );
    }

    // Instant client-side search across categories, subcategories, and part numbers
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list
        .map((cat) => {
          const catMatches = Boolean(cat.name && cat.name.toLowerCase().includes(q));

          const matchingSubs = (cat.subcategories || [])
            .map((sub) => {
              const subMatches = Boolean(sub.name && sub.name.toLowerCase().includes(q));

              const matchingProducts = (sub.products || []).filter((p) => {
                // If user typed this category or subcategory name, include all products under it
                if (catMatches || subMatches) return true;

                return (
                  (p.partNumber && p.partNumber.toLowerCase().includes(q)) ||
                  (p.name && p.name.toLowerCase().includes(q)) ||
                  (p.brand && p.brand.toLowerCase().includes(q)) ||
                  (p.specifications && p.specifications.toLowerCase().includes(q)) ||
                  ((p.categoryName || cat.name) && (p.categoryName || cat.name).toLowerCase().includes(q)) ||
                  ((p.subcategoryName || sub.name) && (p.subcategoryName || sub.name).toLowerCase().includes(q))
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

    return list;
  }, [catalogData, searchQuery, activeCategory, activeBrand]);

  // Calculate total visible products
  const totalVisibleProducts = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => {
      return (
        acc +
        (cat.subcategories?.reduce((subAcc, sub) => subAcc + (sub.products?.length || 0), 0) || 0)
      );
    }, 0);
  }, [filteredCategories]);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-blue-200/80 shadow-[0_16px_45px_-12px_rgba(37,99,235,0.12)] p-6 md:p-8 space-y-8 animate-fadeIn relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              {isTamil ? 'உறுதிப்படுத்தப்பட்ட தயாரிப்பு பட்டியல்' : 'Verified Industrial Product Catalog'}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>100% Genuine MTC</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              <Truck className="w-3 h-3 text-blue-600" />
              <span>Tracked Dispatch</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-navy mt-2 tracking-tight">
            {catalogData?.title || (isTamil ? 'தொழில்துறை முதன்மை அட்டவணை' : 'Industrial Power Transmission Catalog')}
          </h2>

          <p className="text-xs sm:text-sm text-secondaryText mt-1 max-w-3xl">
            {isTamil
              ? 'பதிவேற்றப்பட்ட PDF பட்டியலிலிருந்து துல்லியமாக பிரித்தெடுக்கப்பட்டு, இணையத்திலிருந்து உண்மையான படங்களுடன் வகை வாரியாக ஒழுங்கமைக்கப்பட்ட தயாரிப்புகள்.'
              : 'Accurately extracted and categorized industrial products from verified manufacturer catalogs with real product images and B2B wholesale rates.'}
          </p>
        </div>

        {/* Stats Pill Card */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">
              {isTamil ? 'வகைப்பாடுகள்' : 'Categories'}
            </span>
            <span className="text-lg font-black text-navy">
              {catalogData?.totalCategories || 0}
            </span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
            <span className="text-[11px] text-emerald-700 font-medium block">
              {isTamil ? 'மொத்த தயாரிப்புகள்' : 'Total Extracted Products'}
            </span>
            <span className="text-lg font-black text-emerald-900">
              {catalogData?.totalProducts || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar: Search, Category Tabs, Brand Filter, View Switcher (Sticky Freeze) */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md py-3 -mx-2 px-2 rounded-2xl border-y border-blue-100 shadow-xs space-y-4">
        {/* Search & Mode Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={
                  isTamil
                    ? 'பாகம் எண் (எ.கா. A 18, SPC 2360, 6204), பெயர் அல்லது பிராண்ட் மூலம் தேட...'
                    : 'Search part number (e.g. A 18, SPC 2360, 6204, 8V 1900), name, or specs...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/70"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-navy text-accent font-black text-xs hover:bg-navy-dark transition-smooth flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isTamil ? 'தேடுக' : 'Search'}</span>
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3.5 py-2.5 rounded-2xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-smooth"
                title="Reset search"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* View Mode & Brand Filter */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {availableBrands.length > 1 && (
              <select
                value={activeBrand}
                onChange={(e) => setActiveBrand(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-black bg-slate-50 text-navy focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">{isTamil ? 'அனைத்து பிராண்டுகளும்' : 'All Brands'}</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-smooth ${
                  viewMode === 'grid'
                    ? 'bg-white text-navy shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Card Grid View with Product Images"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">{isTamil ? 'கார்டுகள்' : 'Cards Grid'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-smooth ${
                  viewMode === 'table'
                    ? 'bg-white text-navy shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Detailed Engineering Spec Table View"
              >
                <TableIcon className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">{isTamil ? 'அட்டவணை' : 'Table View'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Horizontal Scrollable Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-smooth shrink-0 flex items-center gap-2 ${
              activeCategory === 'ALL'
                ? 'bg-navy text-accent shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{isTamil ? 'அனைத்து பிரிவுகளும்' : 'All Categories'}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeCategory === 'ALL' ? 'bg-white/20 text-accent' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {catalogData?.totalProducts || 0}
            </span>
          </button>

          {catalogData?.categories?.map((cat) => {
            const count = cat.subcategories?.reduce(
              (acc, sub) => acc + (sub.products?.length || 0),
              0
            );
            const isSelected = activeCategory === cat.name;

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-smooth shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Categories and Products */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-secondaryText font-medium">
            {isTamil ? 'தயாரிப்பு அட்டவணை தரவு ஏற்றப்படுகிறது...' : 'Loading verified PDF catalog hierarchy & images...'}
          </p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-16 text-center text-xs text-secondaryText bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-2">
          <Package className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-darkText">
            {isTamil ? 'பொருத்தமான தயாரிப்புகள் எதுவும் கிடைக்கவில்லை.' : 'No matching categories or products found.'}
          </p>
          <p className="text-[11px] text-slate-400">
            {isTamil ? 'தேடல் சொற்களை மாற்றி முயற்சிக்கவும்.' : 'Try adjusting your search query or category filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {filteredCategories.map((category, catIdx) => (
            <div
              key={category.name}
              className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs bg-white space-y-4"
            >
              {/* Category Header Banner with Category Image & Description */}
              <div className="bg-gradient-to-r from-navy via-navy-light to-navy text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                      <span className="p-1 rounded bg-white/10 text-accent">
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
                  <span className="bg-white/15 text-accent font-black px-3 py-1 rounded-xl text-xs border border-white/10">
                    {category.subcategories?.length || 0} {isTamil ? 'துணை வகைகள்' : 'Subcategories'}
                  </span>
                  <span className="bg-white/15 text-white font-black px-3 py-1 rounded-xl text-xs border border-white/10">
                    {category.subcategories?.reduce((a, s) => a + (s.products?.length || 0), 0)}{' '}
                    {isTamil ? 'தயாரிப்புகள்' : 'Parts'}
                  </span>
                </div>
              </div>

              {/* Subcategories Container */}
              <div className="p-4 sm:p-6 space-y-6">
                {category.subcategories?.map((subcategory, subIdx) => {
                  const key = `${catIdx}-${subIdx}`;
                  const isOpen = !!openSubcategories[key];
                  const products = subcategory.products || [];
                  const isFilterActive = Boolean(searchQuery.trim() || activeCategory !== 'ALL');
                  // When user searches or selects a category, display all products under it
                  const displayLimit = expandedProductLimits[key] || (isFilterActive ? products.length : 36);
                  const visibleProducts = products.slice(0, displayLimit);
                  const hasMore = products.length > displayLimit;

                  return (
                    <div
                      key={subcategory.name}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/40 overflow-hidden"
                    >
                      {/* Subcategory Accordion Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleSubcategory(key)}
                        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-smooth group"
                      >
                        <div className="flex items-center gap-3">
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-primary shrink-0 transition-transform" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-primary transition-transform" />
                          )}
                          {subcategory.image && (
                            <img
                              src={subcategory.image}
                              alt={subcategory.name}
                              className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = FALLBACK_IMAGE;
                              }}
                            />
                          )}
                          <div>
                            <span className="font-black text-xs sm:text-sm text-navy group-hover:text-primary transition-smooth">
                              {subcategory.name}
                            </span>
                            {subcategory.description && (
                              <p className="text-[11px] text-secondaryText">{subcategory.description}</p>
                            )}
                          </div>
                        </div>

                        <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-xl transition-smooth">
                          {products.length} {isTamil ? 'தயாரிப்புகள்' : 'Parts'}
                        </span>
                      </button>

                      {/* Products Content */}
                      {isOpen && (
                        <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80">
                          {products.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 italic text-center">
                              {isTamil ? 'இந்த துணை வகையில் தயாரிப்புகள் எதுவும் இல்லை.' : 'No products found under this section.'}
                            </p>
                          ) : viewMode === 'grid' ? (
                            /* ==================== CARD GRID VIEW WITH IMAGES ==================== */
                            <div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {visibleProducts.map((p, pIdx) => (
                                  <div
                                    key={p._id || `${key}-${pIdx}`}
                                    className="rounded-2xl border border-slate-200 bg-white hover:border-primary/50 hover:shadow-md transition-smooth flex flex-col justify-between overflow-hidden group"
                                  >
                                    {/* Product Image with Zoom & Badges - Clickable to Product Details */}
                                    <Link
                                      to={`/services/${encodeURIComponent(p.partNumber)}`}
                                      className="block relative h-44 bg-slate-50 p-4 flex items-center justify-center border-b border-slate-100 overflow-hidden cursor-pointer"
                                      title={`View ${p.name} Details`}
                                    >
                                      <img
                                        src={p.image || subcategory.image || FALLBACK_IMAGE}
                                        alt={p.name}
                                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = FALLBACK_IMAGE;
                                        }}
                                      />
                                      {/* Brand Badge */}
                                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-black bg-navy text-accent shadow-2xs pointer-events-none">
                                        {p.brand}
                                      </span>
                                      {/* Verified OEM Badge */}
                                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs pointer-events-none">
                                        Verified OEM
                                      </span>
                                    </Link>

                                    {/* Product Details */}
                                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                                      <div>
                                        <div className="flex items-center justify-between gap-1">
                                          <Link
                                            to={`/services/${encodeURIComponent(p.partNumber)}`}
                                            className="font-mono text-xs font-black text-primary hover:underline"
                                            title="View Product Page"
                                          >
                                            {p.partNumber}
                                          </Link>
                                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                            In Stock
                                          </span>
                                        </div>
                                        <Link to={`/services/${encodeURIComponent(p.partNumber)}`} className="block group/title">
                                          <h4 className="font-bold text-xs text-darkText group-hover/title:text-primary line-clamp-2 mt-1 transition-smooth cursor-pointer" title={p.name}>
                                            {p.name}
                                          </h4>
                                        </Link>
                                        {p.specifications && (
                                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                            {p.specifications}
                                          </p>
                                        )}
                                      </div>

                                      {/* Price Block & Action Button */}
                                      <div className="pt-2 border-t border-slate-100 space-y-2">
                                        <div className="flex items-baseline justify-between">
                                          <div>
                                            <span className="text-[10px] text-slate-400 line-through block">
                                              MRP: {formatCurrency(p.mrp)}
                                            </span>
                                            <span className="text-sm font-black text-navy">
                                              {formatCurrency(p.wholesalePrice)}
                                            </span>
                                          </div>
                                          <span className="text-[9px] text-slate-400 font-medium">
                                            + 18% GST Extra
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                          <Link
                                            to={`/services/${encodeURIComponent(p.partNumber)}`}
                                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-navy text-accent text-center text-[11px] font-black hover:bg-navy-dark transition-smooth flex items-center justify-center gap-1 shadow-2xs"
                                          >
                                            <span>{isTamil ? 'விவரங்கள்' : 'Details / Order'}</span>
                                            <ArrowRight className="w-3 h-3" />
                                          </Link>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedProduct(p)}
                                            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-navy hover:bg-slate-100 transition-smooth"
                                            title="Inspect Product Specifications"
                                          >
                                            <Eye className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Show More / Show All Products Button */}
                              {hasMore && (
                                <div className="mt-5 flex items-center justify-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => showMoreProducts(key)}
                                    className="px-5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs transition-smooth inline-flex items-center gap-2 border border-slate-200"
                                  >
                                    <span>
                                      {isTamil
                                        ? `மேலும் ${Math.min(48, products.length - displayLimit)} பொருட்களைக் காட்டு`
                                        : `Show Next +${Math.min(48, products.length - displayLimit)} items`}
                                    </span>
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => showMoreProducts(key, products.length)}
                                    className="px-5 py-2 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black text-xs transition-smooth inline-flex items-center gap-1.5 shadow-xs"
                                  >
                                    <span>
                                      {isTamil ? `அனைத்து ${products.length} பொருட்களையும் காட்டு` : `Show All (${products.length} Products)`}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* ==================== ENGINEERING SPEC TABLE VIEW ==================== */
                            <div className="space-y-4">
                              <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white">
                                <table className="w-full text-left text-xs">
                                  <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-sm text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 shadow-2xs">
                                    <tr>
                                      <th className="py-3 px-3">{isTamil ? 'படம்' : 'Image'}</th>
                                      <th className="py-3 px-3">{isTamil ? 'பிராண்ட்' : 'Brand'}</th>
                                      <th className="py-3 px-3">{isTamil ? 'பாகம் எண்' : 'Part Number'}</th>
                                      <th className="py-3 px-4">{isTamil ? 'தயாரிப்பு & குறிப்புகள்' : 'Product & Specs'}</th>
                                      <th className="py-3 px-3 text-right">{isTamil ? 'அசல் விலை (MRP)' : 'List MRP'}</th>
                                      <th className="py-3 px-3 text-right">{isTamil ? 'மொத்த விலை' : 'Wholesale Price'}</th>
                                      <th className="py-3 px-3 text-center">{isTamil ? 'போக்குவரத்து' : 'Freight'}</th>
                                      <th className="py-3 px-3 text-center">{isTamil ? 'செயல்' : 'Action'}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-medium">
                                    {visibleProducts.map((p, pIdx) => (
                                      <tr
                                        key={p._id || `${key}-${pIdx}`}
                                        onClick={() => setSelectedProduct(p)}
                                        className="hover:bg-blue-50/70 transition-smooth cursor-pointer group"
                                        title={`Click to view ${p.name} (${p.partNumber}) details`}
                                      >
                                        <td className="py-2 px-3">
                                          <div
                                            className="w-10 h-10 rounded-lg bg-slate-50 p-1 border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-primary transition-colors"
                                          >
                                            <img
                                              src={p.image || subcategory.image || FALLBACK_IMAGE}
                                              alt={p.name}
                                              className="w-full h-full object-contain"
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = FALLBACK_IMAGE;
                                              }}
                                            />
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-3 font-black text-navy">{p.brand}</td>
                                        <td className="py-2.5 px-3 font-mono font-bold text-primary">
                                          <span className="group-hover:underline">
                                            {p.partNumber}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-4 max-w-xs">
                                          <p className="font-bold text-darkText truncate group-hover:text-primary transition-colors" title={p.name}>
                                            {p.name}
                                          </p>
                                          {p.specifications && (
                                            <p className="text-[10px] text-slate-400 truncate">{p.specifications}</p>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-3 text-right line-through text-slate-400">
                                          {formatCurrency(p.mrp)}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-black text-navy text-xs">
                                          {formatCurrency(p.wholesalePrice)}
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                                            Standard Shipping
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                          <Link
                                            to={`/services/${encodeURIComponent(p.partNumber)}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-navy text-accent text-[11px] font-bold hover:bg-primary hover:text-white transition-smooth shadow-2xs"
                                          >
                                            <span>{isTamil ? 'விவரங்கள்' : 'Details'}</span>
                                            <ArrowRight className="w-3 h-3" />
                                          </Link>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {hasMore && (
                                <div className="flex items-center justify-center gap-3 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => showMoreProducts(key)}
                                    className="px-5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs transition-smooth inline-flex items-center gap-2 border border-slate-200"
                                  >
                                    <span>
                                      {isTamil
                                        ? `மேலும் ${Math.min(48, products.length - displayLimit)} பொருட்களைக் காட்டு`
                                        : `Show Next +${Math.min(48, products.length - displayLimit)} items`}
                                    </span>
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => showMoreProducts(key, products.length)}
                                    className="px-5 py-2 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black text-xs transition-smooth inline-flex items-center gap-1.5 shadow-xs"
                                  >
                                    <span>
                                      {isTamil ? `அனைத்து ${products.length} பொருட்களையும் காட்டு` : `Show All (${products.length} Products)`}
                                    </span>
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

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 relative animate-slideUp">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-navy transition-smooth"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Product Image */}
            <div className="w-full h-56 bg-slate-50 rounded-2xl p-6 border border-slate-200 flex items-center justify-center">
              <img
                src={selectedProduct.image || FALLBACK_IMAGE}
                alt={selectedProduct.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            {/* Product Meta */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-navy text-accent text-xs font-black">
                  {selectedProduct.brand}
                </span>
                <span className="font-mono text-xs font-black text-primary">
                  {selectedProduct.partNumber}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified Genuine
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-navy">{selectedProduct.name}</h3>
              {selectedProduct.specifications && (
                <p className="text-xs text-secondaryText">{selectedProduct.specifications}</p>
              )}
            </div>

            {/* Price Table Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Standard List MRP:</span>
                <span className="line-through">{formatCurrency(selectedProduct.mrp)}</span>
              </div>
              <div className="flex justify-between items-center text-blue-700 font-bold">
                <span>Contract Trade Status:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">Wholesale Direct</span>
              </div>
              <div className="flex justify-between items-center text-navy font-black text-sm pt-2 border-t border-slate-200">
                <span>Direct B2B Wholesale Rate:</span>
                <span>{formatCurrency(selectedProduct.wholesalePrice)}</span>
              </div>
              <p className="text-[10px] text-slate-400 text-right pt-0.5">
                + 18% GST Applicable
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <Link
                to={`/services/${encodeURIComponent(selectedProduct.partNumber)}`}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black text-xs transition-smooth flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>View Full Product &amp; Order</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={`/rfq?partNumber=${encodeURIComponent(selectedProduct.partNumber)}&brand=${encodeURIComponent(selectedProduct.brand)}&serviceName=${encodeURIComponent(selectedProduct.name)}`}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-navy text-accent font-black text-xs hover:bg-navy-dark transition-smooth flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Request Quotation</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100 transition-smooth cursor-pointer"
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
