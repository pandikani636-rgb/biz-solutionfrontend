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
import { LayoutGrid, FileText } from 'lucide-react';

const brands = [
  'PIX',
  'JK Fenner',
  'Diamond',
  'NBC',
  'SKF',
  'FAG',
  'TMB Ken',
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
  const { categories } = useSite();

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
    fetchServices();
  }, [selectedBrand, selectedCategory, selectedSection, selectedOrigin, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (search.trim()) {
      newParams.set('search', search.trim());
    } else {
      newParams.delete('search');
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
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80"
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
            Direct B2B wholesale prices on genuine PIX, NBC, HCH, Fenner, Timken, and SKF. Fast pan-India delivery, official GST invoices, and mill test certificates.
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

      {/* Brand ("Make") Selector Pills */}
      <div className="space-y-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-primary" /> Filter by Brand / Make:
          </span>
          {(selectedBrand || selectedSection || selectedOrigin || search) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:underline font-bold flex items-center gap-1"
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
            className={`px-4 py-2 rounded-xl text-xs font-black transition-smooth ${
              !selectedBrand
                ? 'bg-navy text-accent shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Brands (24+ Parts)
          </button>
          {brands.map((b) => {
            const isSkf = b === 'SKF';
            const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
            return (
              <button
                key={b}
                onClick={() => handleBrandChange(b)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-smooth flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{b}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isSkf
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {isSkf ? '10% OFF' : '46% OFF'}
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

      {/* Filter and Sorting Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Section / Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase mr-1">Section:</span>
          <button
            onClick={() => handleSectionChange('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-smooth ${
              !selectedSection ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Sections
          </button>
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => handleSectionChange(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-smooth ${
                selectedSection === sec
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec}s
            </button>
          ))}

          {/* SKF Origin Filter */}
          {selectedBrand === 'SKF' && (
            <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-3">
              <span className="text-xs font-bold text-blue-900 uppercase">Origin:</span>
              {['National', 'International'].map((orig) => (
                <button
                  key={orig}
                  onClick={() => setSelectedOrigin(selectedOrigin === orig ? '' : orig)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    selectedOrigin === orig
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                  }`}
                >
                  {orig}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-secondaryText" />
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-darkText focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="newest">Sort: Default Part Order</option>
            <option value="popularity">Sort: Most Demanded</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Part Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(selectedBrand || selectedSection || selectedOrigin || search) && (
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-lightBlue/50 p-3 rounded-xl border border-blue-100">
          <span className="font-bold text-primary">Active Filters:</span>
          {selectedBrand && (
            <span className="bg-white border px-2 py-0.5 rounded font-bold text-navy">
              Make: {selectedBrand}
            </span>
          )}
          {selectedSection && (
            <span className="bg-white border px-2 py-0.5 rounded font-bold text-navy">
              Section: {selectedSection}
            </span>
          )}
          {selectedOrigin && (
            <span className="bg-white border px-2 py-0.5 rounded font-bold text-navy">
              Origin: {selectedOrigin}
            </span>
          )}
          {search && (
            <span className="bg-white border px-2 py-0.5 rounded font-bold text-navy">
              Query: "{search}"
            </span>
          )}
          <span className="ml-auto font-bold text-slate-500">
            Showing {pagination.total} product(s)
          </span>
        </div>
      )}

      {/* Catalog View Mode Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-smooth ${
              viewMode === 'grid'
                ? 'bg-navy text-accent shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-accent" />
            <span>Standard Catalog Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('pdf')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-smooth ${
              viewMode === 'pdf'
                ? 'bg-navy text-accent shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-accent" />
            <span>PDF Extracted Hierarchy (Categories & Subcategories)</span>
          </button>
        </div>
      </div>

      {/* Content depending on viewMode */}
      {viewMode === 'pdf' ? (
        <PdfCatalogViewer />
      ) : (
        <>
          {/* Product Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <CardSkeleton key={n} />
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <p className="text-base font-bold text-darkText">No industrial parts matched your criteria</p>
              <p className="text-xs text-secondaryText max-w-md mx-auto">
                Can't find the exact part number or specification? Timken and SKF offer all bearing types on custom request.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Reset Filters
                </Button>
                <Link to="/rfq">
                  <Button variant="accent" size="sm">
                    Request Custom RFQ
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-secondaryText px-4">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
