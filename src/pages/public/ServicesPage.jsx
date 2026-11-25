import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { useSite } from '../../context/SiteContext';
import { ServiceCard } from '../../components/cards/ServiceCard';
import { BackButton } from '../../components/common/BackButton';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Button } from '../../components/common/Button';
import { PdfCatalogViewer } from '../../components/common/PdfCatalogViewer';
import { InteractivePdfSectionViewer } from '../../components/common/InteractivePdfSectionViewer';
import { LayoutGrid, FileText } from 'lucide-react';

const brands = [
  'PIX',
  'JK Fenner',
  'Diamond',
  'NBC',
  'FAG',
  'SKF',
  'Timken',
  'NTN',
  'Siemens',
  'Crompton',
  'ABB',
  'Bharat Bijlee',
  'Shanthi Gears',
  'Vignesh Gears',
];
const sections = ['Bearing', 'Belt', 'Bush Pulley'];

export const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, settings } = useSite();

  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || '');
  const [selectedOrigin, setSelectedOrigin] = useState(searchParams.get('origin') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [viewMode, setViewMode] = useState(searchParams.get('tab') === 'pdf' ? 'pdf' : 'grid');

  // Sync state if URL query params change
  useEffect(() => {
    if (searchParams.get('brand')) setSelectedBrand(searchParams.get('brand'));
    if (searchParams.get('search')) setSearch(searchParams.get('search'));
    if (searchParams.get('category')) setSelectedCategory(searchParams.get('category'));
  }, [searchParams]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: search.trim() || undefined,
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        section: selectedSection || undefined,
        origin: selectedOrigin || undefined,
        sort: sortBy,
      };

      const res = await contentService.getServices(params);
      if (res.success) {
        setServices(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('[Services Page Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedBrand, selectedCategory, selectedSection, selectedOrigin, sortBy, page]);

  // Auto-detect category matching search query
  useEffect(() => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchCat = categories?.find(
        (c) => c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase()) || c.slug.includes(q)
      );
      if (matchCat && selectedCategory !== matchCat._id) {
        setSelectedCategory(matchCat._id);
      }
    }
  }, [search, categories]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    // When searching for a product, clear brand/category locks to search across all categories
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedSection('');
    const newParams = new URLSearchParams();
    if (search.trim()) {
      newParams.set('search', search.trim());
    }
    setSearchParams(newParams);
    fetchServices();
  };

  const handleBrandChange = (brandName) => {
    setSelectedBrand(selectedBrand === brandName ? '' : brandName);
    setPage(1);
  };

  const handleSectionChange = (sectionName) => {
    setSelectedSection(selectedSection === sectionName ? '' : sectionName);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedSection('');
    setSelectedOrigin('');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton inline label="Back to Home" fallbackPath="/" />
      </div>

      {/* Title & Industrial Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy via-navy-light to-navy rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl border border-blue-900/40">
        {/* Transparent background image blending smoothly with blue */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/banners/img3.jpg"
            alt=""
            className="w-full h-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
              45% - 48% Off MRP List
            </span>
            <span className="text-xs font-bold text-slate-300 bg-white/10 px-3 py-1 rounded-full">
              🚚 Free Delhivery Included
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Industrial Bearings, Belts & Pulleys
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Direct B2B wholesale prices on genuine PIX, Fenner, NBC, HCH, Timken, and SKF. Fast pan-India delivery, official GST invoices, and 100% genuine products.
          </p>
        </div>

        {/* Global Part Number Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full md:w-88 relative flex items-center shadow-lg"
        >
          <input
            type="text"
            placeholder="Search part #, make, size (e.g. 6204, SPC 2360)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-3.5 bg-white text-darkText rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent shadow"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <button
            type="submit"
            className="absolute right-2 px-3.5 py-1.5 rounded-xl bg-navy text-accent text-xs font-extrabold hover:bg-primary hover:text-white transition-smooth"
          >
            Search
          </button>
        </form>
      </div>

      {/* Brand ("Make") Selector Pills - Blue Colour Card in Home Page Order */}
      <div className="space-y-3 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-3xl p-5 sm:p-6 border border-blue-700 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-300" /> Authorized Industrial Makes &amp; Brands (14 Official Makes):
          </span>
          {(selectedBrand || selectedSection || selectedOrigin || search) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-amber-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedBrand('');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-smooth cursor-pointer ${
              !selectedBrand
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            All Brands (14 Makes)
          </button>
          {brands.map((b) => {
            const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
            const brandDiscounts = settings?.brandDiscounts || {};
            const brandDiscount = brandDiscounts[b] ?? (b === 'SKF' ? 10 : (b === 'JK Fenner' ? 25 : 48));
            return (
              <button
                key={b}
                onClick={() => handleBrandChange(b)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-smooth flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                <span>{b}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                    isSelected
                      ? 'bg-slate-900 text-amber-300'
                      : b === 'SKF'
                      ? 'bg-blue-400/30 text-blue-200'
                      : 'bg-amber-400/20 text-amber-300'
                  }`}
                >
                  {brandDiscount}% OFF
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Selector Pills */}
      <div className="space-y-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-primary" /> Filter by Category:
          </span>
          {selectedCategory && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setPage(1);
              }}
              className="text-xs text-rose-600 hover:underline font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear Category
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-smooth ${
              !selectedCategory
                ? 'bg-navy text-accent shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories?.map((cat) => {
            const isSelected = selectedCategory === cat._id || selectedCategory === cat.name;
            return (
              <button
                key={cat._id}
                onClick={() => {
                  setSelectedCategory(isSelected ? '' : cat._id);
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-smooth flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive PDF Catalog Section Explorer & Ordering Engine */}
      <InteractivePdfSectionViewer
        initialSearch={search}
        selectedBrand={selectedBrand}
        onSelectBrand={(b) => setSelectedBrand(b)}
        selectedCategory={selectedCategory}
        categories={categories}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        onCategoryDetected={(catName) => {
          const matched = categories?.find(
            (c) => c.name.toLowerCase() === catName.toLowerCase() || catName.toLowerCase().includes(c.name.toLowerCase())
          );
          if (matched && selectedCategory !== matched._id) {
            setSelectedCategory(matched._id);
          }
        }}
      />

      {/* Direct Bulk Inquiries & Custom RFQ Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-900/40 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black text-white">
            Need a Specific Part Number Not Listed Above?
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            We supply complete industrial ranges from PIX, SKF, Timken, NBC, Fenner, Siemens, ABB, and Shanthi Gears with custom manufacturing and direct factory pricing.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/rfq">
            <Button variant="accent" size="md" className="font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 shadow-md">
              Submit Custom RFQ
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="secondary" size="md" className="font-bold text-xs bg-white/10 text-white hover:bg-white/20 border border-white/20">
              Contact Sales Desk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
