import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  Sparkles,
  Tag,
  Truck,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { Button } from '../../components/common/Button';
import { InteractivePdfSectionViewer } from '../../components/common/InteractivePdfSectionViewer';

const brands = ['PIX', 'NBC', 'HCH', 'Fenner', 'Timken', 'SKF'];

export const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, settings } = useSite();

  // Search and selection states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  // Sync state if URL query params change
  useEffect(() => {
    if (searchParams.get('brand')) setSelectedBrand(searchParams.get('brand'));
    if (searchParams.get('search')) setSearch(searchParams.get('search'));
    if (searchParams.get('category')) setSelectedCategory(searchParams.get('category'));
  }, [searchParams]);

  // Dynamic Category Auto-Selection based on search input (Requirement 2)
  // When user searches for a category, it dynamically auto-selects and highlights the category pill in the blue box
  useEffect(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return;

    // 1. Check if query matches a known brand
    const matchedBrand = brands.find((b) => q.includes(b.toLowerCase()) || b.toLowerCase().includes(q));
    if (matchedBrand) {
      setSelectedBrand(matchedBrand);
    }

    // 2. Check if query matches a category name or slug
    if (categories?.length > 0) {
      const matchedCat = categories.find(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          q.includes(c.name?.toLowerCase()) ||
          c.slug?.toLowerCase().includes(q)
      );
      if (matchedCat) {
        setSelectedCategory(matchedCat._id);
      }
    }
  }, [search, categories]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedBrand('');
    setSelectedCategory('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Industrial Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy via-navy-light to-navy rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl border border-blue-900/40">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
              45% - 48% Off MRP Price List
            </span>
            <span className="text-xs font-bold text-slate-300 bg-white/10 px-3 py-1 rounded-full">
              🚚 Free Delhivery Included
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Industrial Bearings, Belts & Pulleys
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Direct factory wholesale pricing on genuine PIX, NBC, Fenner, Timken, and SKF. Search any part number or section below to view technical specs and generate official quotations.
          </p>
        </div>

        {/* Global Part Number & Category Search Bar (Requirement 2) */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full md:w-96 relative flex items-center shadow-lg"
        >
          <input
            type="text"
            placeholder="Search category, part #, size (e.g. Diamond, C-98, 6204)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-24 py-3.5 bg-white text-darkText rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 shadow"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-14 text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 px-3 py-1.5 rounded-xl bg-navy text-amber-400 text-xs font-extrabold hover:bg-slate-800 transition-smooth"
          >
            Search
          </button>
        </form>
      </div>

      {/* Blue Category & Brand Selection Box Below Search Bar (Requirement 2 & Image 1) */}
      <div className="bg-gradient-to-r from-navy via-slate-900 to-navy rounded-3xl p-5 sm:p-6 border border-blue-900/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Product Category & Brand Selection:</span>
          </span>
          {(selectedCategory || selectedBrand || search) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-amber-400 hover:text-amber-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Selection</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* All Categories Pill */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('');
              setSelectedBrand('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              !selectedCategory && !selectedBrand
                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
            }`}
          >
            All Categories
          </button>

          {/* Dynamic Category Pills */}
          {(categories || []).map((cat) => {
            const isSelected = selectedCategory === cat._id || selectedCategory === cat.name;
            const catDiscount = cat.discountPercentage || 48;
            return (
              <button
                key={cat._id}
                type="button"
                onClick={() => {
                  setSelectedCategory(isSelected ? '' : cat._id);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                    isSelected
                      ? 'bg-slate-950 text-amber-400'
                      : 'bg-amber-400/20 text-amber-300'
                  }`}
                >
                  {catDiscount}% OFF
                </span>
              </button>
            );
          })}

          {/* Quick Brand Selector Pills */}
          {brands.map((b) => {
            const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
            return (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setSelectedBrand(isSelected ? '' : b);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                    : 'bg-white/5 text-slate-300 hover:bg-white/15 border border-white/10'
                }`}
              >
                <span>{b}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive PDF Catalog Section Viewer & Quotation Engine (PDF View) */}
      <InteractivePdfSectionViewer
        initialSearch={search}
        selectedBrand={selectedBrand}
        onSelectBrand={(b) => setSelectedBrand(b)}
        selectedCategory={selectedCategory}
        categories={categories}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        onCategoryDetected={(catName) => {
          const matched = categories?.find(
            (c) =>
              c.name.toLowerCase() === catName.toLowerCase() ||
              catName.toLowerCase().includes(c.name.toLowerCase())
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
            Need a Specific Part Number or Custom Size?
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            We supply complete industrial ranges from PIX, SKF, Timken, NBC, Fenner, and Shanthi Gears with mill test certificates, OEM warranty, and factory pricing.
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
