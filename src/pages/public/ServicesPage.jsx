import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  Sparkles,
  Tag,
  Truck,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { Button } from '../../components/common/Button';
import { BackButton } from '../../components/common/BackButton';
import { PdfCatalogViewer } from '../../components/common/PdfCatalogViewer';
import {
  FOURTEEN_OFFICIAL_MAKES,
  INDUSTRIAL_CATEGORIES,
} from '../../utils/officialBrandsData';

export const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, settings } = useSite();

  // Search and selection states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');

  // Sync state if URL query params change
  useEffect(() => {
    if (searchParams.get('brand')) setSelectedBrand(searchParams.get('brand'));
    if (searchParams.get('search')) setSearch(searchParams.get('search'));
    if (searchParams.get('category')) setSelectedCategory(searchParams.get('category'));
  }, [searchParams]);

  // When user searches for a brand or category, automatically select it
  useEffect(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return;

    // Check if search matches any category
    const matchedCategory = INDUSTRIAL_CATEGORIES.find(
      (cat) =>
        cat.id !== 'ALL' &&
        (cat.id.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q) ||
          q.includes(cat.id.toLowerCase()))
    );

    if (matchedCategory && selectedCategory !== matchedCategory.id) {
      setSelectedCategory(matchedCategory.id);
      setSelectedBrand(matchedCategory.defaultBrand);
      return;
    }

    // Check if search matches any of the 14 brands
    const matchedMake = FOURTEEN_OFFICIAL_MAKES.find(
      (m) =>
        m.code !== 'ALL' &&
        (m.code.toLowerCase().includes(q) ||
          q.includes(m.code.toLowerCase()) ||
          m.name.toLowerCase().includes(q) ||
          q.includes(m.name.toLowerCase()))
    );

    if (matchedMake && selectedBrand !== matchedMake.code) {
      setSelectedBrand(matchedMake.code);
      if (matchedMake.categoryId && selectedCategory !== matchedMake.categoryId) {
        setSelectedCategory(matchedMake.categoryId);
      }
    }
  }, [search]);

  // Filter brand pills based on active category
  const visibleMakes = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'ALL') {
      return FOURTEEN_OFFICIAL_MAKES;
    }
    const currentCatObj = INDUSTRIAL_CATEGORIES.find((c) => c.id === selectedCategory);
    if (!currentCatObj) return FOURTEEN_OFFICIAL_MAKES;

    return FOURTEEN_OFFICIAL_MAKES.filter(
      (m) => m.code === 'ALL' || currentCatObj.brands.includes(m.code)
    );
  }, [selectedCategory]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    const catObj = INDUSTRIAL_CATEGORIES.find((c) => c.id === catId);
    if (catObj) {
      setSelectedBrand(catObj.defaultBrand);
    } else {
      setSelectedBrand('ALL');
    }
  };

  const handleBrandSelect = (brandCode) => {
    setSelectedBrand(brandCode);
    if (brandCode !== 'ALL') {
      const makeObj = FOURTEEN_OFFICIAL_MAKES.find((m) => m.code === brandCode);
      if (makeObj && makeObj.categoryId && makeObj.categoryId !== 'ALL') {
        setSelectedCategory(makeObj.categoryId);
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedBrand('ALL');
    setSelectedCategory('ALL');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
      {/* 1. TOP NAVIGATION: Back to Home */}
      <div className="flex items-center justify-between">
        <BackButton inline label="Back to Home" fallbackPath="/" />
      </div>

      {/* 2. HERO BANNER: Royal Blue Gradient with Search inside */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl border border-blue-400/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Left Side: Badges, Title, Subtitle */}
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest bg-amber-400/20 px-3.5 py-1 rounded-full border border-amber-400/30">
              45% - 48% OFF MRP LIST
            </span>
            <span className="text-xs font-bold text-white bg-white/15 px-3.5 py-1 rounded-full border border-white/20">
              🚚 Free Delivery Included
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Industrial Bearings, Belts &amp; Motors
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-xl">
            Direct B2B wholesale prices on genuine Diamond, Fenner, NBC, SKF, Timken, Siemens, ABB, and Shanthi Gears. Fast pan-India delivery, official GST invoices, and 100% manufacturer warranty.
          </p>
        </div>

        {/* Right Side: Search Input with Blue Search Button */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full md:w-96 relative flex items-center bg-white rounded-full p-1.5 shadow-xl border border-white/80"
        >
          <Search className="w-4 h-4 text-slate-400 ml-3 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search category, part #, size (e.g. Diamond, C-98, 6204)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 bg-transparent text-slate-900 text-xs sm:text-sm font-bold focus:outline-none placeholder:text-slate-400 pr-20"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-24 text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* 3. DUAL FILTER CONTAINER: CATEGORY TABS + 14 BRAND PILLS */}
      <div className="bg-[#1a2d5e] rounded-3xl p-5 sm:p-6 border border-blue-900/60 shadow-xl space-y-4">
        {/* Header & Reset Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>1. SELECT INDUSTRIAL CATEGORY:</span>
            </span>
          </div>

          {(selectedBrand !== 'ALL' || selectedCategory !== 'ALL' || search) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-amber-300 hover:text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* 1. CATEGORY FILTER TABS (Solves "Nan Mela Entha Cetogory Click Pannalumm PIX pdf la Ullathuthan Show akuthu") */}
        <div className="flex flex-wrap items-center gap-2">
          {INDUSTRIAL_CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  isCatActive
                    ? 'bg-amber-400 text-slate-950 shadow-lg ring-2 ring-amber-300 scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                <span>{cat.name}</span>
                {isCatActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
              </button>
            );
          })}
        </div>

        {/* 2. BRAND PILLS SECTION */}
        <div className="pt-2 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-300" />
              <span>2. AUTHORIZED MAKES &amp; BRANDS ({visibleMakes.length - (visibleMakes.some(m => m.code === 'ALL') ? 1 : 0)} Available):</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {visibleMakes.map((make) => {
              const isSelected = selectedBrand.toLowerCase() === make.code.toLowerCase();
              const isAll = make.code === 'ALL';

              if (isAll) {
                return (
                  <button
                    key="ALL"
                    type="button"
                    onClick={() => handleBrandSelect('ALL')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    }`}
                  >
                    All {selectedCategory !== 'ALL' ? 'Category Makes' : 'Makes (14 Brands)'}
                  </button>
                );
              }

              return (
                <button
                  key={make.code}
                  type="button"
                  onClick={() => handleBrandSelect(make.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-lg ring-2 ring-amber-300'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  <span>{make.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                      isSelected
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-amber-400/20 text-amber-300'
                    }`}
                  >
                    {make.discountPct}% OFF
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. 2-COLUMN PDF & PRODUCT CATALOG ENGINE
          LEFT: Selected Product with "Add to Cart" Option
          RIGHT: Master PDF Catalog Data Sheet & Interactive PDF Viewer */}
      <PdfCatalogViewer
        initialSearch={search}
        initialBrand={selectedBrand}
        initialCategory={selectedCategory}
        onBrandSelect={(b) => handleBrandSelect(b)}
        onSearchChange={(s) => setSearch(s)}
      />

      {/* 5. DIRECT BULK INQUIRIES & CUSTOM RFQ FOOTER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-900/40 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black text-white">
            Need a Specific Part Number or Custom Size?
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            We supply complete industrial ranges from Diamond, Fenner, SKF, Timken, NBC, Siemens, ABB, and Shanthi Gears with mill test certificates, OEM warranty, and factory pricing.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/rfq">
            <Button
              variant="accent"
              size="md"
              className="font-black text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-500 shadow-md"
            >
              Submit Custom RFQ
            </Button>
          </Link>
          <Link to="/contact">
            <Button
              variant="secondary"
              size="md"
              className="font-bold text-xs bg-white/10 text-white hover:bg-white/20 border border-white/20"
            >
              Contact Sales Desk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
