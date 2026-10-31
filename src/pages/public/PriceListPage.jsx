import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgePercent,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  Search,
  ArrowRight,
  FileSpreadsheet,
  Download,
  ExternalLink,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { PdfCatalogViewer } from '../../components/common/PdfCatalogViewer';

const discountMatrix = [
  {
    brand: 'PIX Transmissions Ltd',
    code: 'PIX',
    section: 'Industrial Belts (SPC, 8V, Classical C)',
    discount: '45% - 48% OFF MRP',
    discountPct: 46,
    freight: 'Included (Delhivery)',
    warranty: '100% Genuine Factory Warranty',
    notes: 'Includes high torque narrow wedge, deep wedge 8V, and classical wrapped belts.',
    color: 'border-amber-300 bg-amber-50/50',
    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    brand: 'NBC Bearings (NEI)',
    code: 'NBC',
    section: 'Industrial Bearings (6400 Heavy Series)',
    discount: '45% - 48% OFF MRP',
    discountPct: 46,
    freight: 'Included (Delhivery)',
    warranty: 'Factory Hologram & Traceability',
    notes: 'Heavy deep groove ball bearings with C3 clearance and ZZ shields.',
    color: 'border-emerald-300 bg-emerald-50/50',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    brand: 'HCH Bearings',
    code: 'HCH',
    section: 'Ball Bearings & Matched Sets (6200/6300)',
    discount: '45% - 48% OFF MRP',
    discountPct: 46,
    freight: 'Included (Delhivery)',
    warranty: 'Electric Motor Quality (EMQ)',
    notes: 'Open and ZZ shielded ball bearings, armature sets (6201_6202), and heavy sizes.',
    color: 'border-sky-300 bg-sky-50/50',
    tagColor: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  {
    brand: 'J.K. Fenner India',
    code: 'Fenner',
    section: 'Bush Pulleys & PB Belts (200 X 3C / C 70)',
    discount: '45% - 48% OFF MRP',
    discountPct: 46,
    freight: 'Included (Delhivery)',
    warranty: 'Precision Built (PB) Certification',
    notes: 'Taper Lock Pulleys (2517 bush), finished bore 60mm, and matched wedge/classical belts.',
    color: 'border-rose-300 bg-rose-50/50',
    tagColor: 'bg-rose-100 text-rose-900 border-rose-300',
  },
  {
    brand: 'The Timken Company',
    code: 'Timken',
    section: 'Industrial Bearings (All Types Available)',
    discount: '45% - 48% OFF MRP',
    discountPct: 46,
    freight: 'Included (Delhivery)',
    warranty: 'Timken Authenticity MTC',
    notes: 'Featured 6313 open type + full Timken range (tapered, spherical, ball) on demand.',
    color: 'border-orange-300 bg-orange-50/50',
    tagColor: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  {
    brand: 'SKF Group',
    code: 'SKF',
    section: 'Angular Contact & Deep Groove Bearings',
    discount: 'Strictly Flat 10% OFF MRP',
    discountPct: 10,
    freight: 'Included (Delhivery)',
    warranty: 'SKF Authenticate App QR Verified',
    notes: 'Stocked in both National (SKF India) and International (Imported European) batches.',
    color: 'border-blue-300 bg-blue-50/50',
    tagColor: 'bg-blue-100 text-blue-900 border-blue-300',
  },
];

export const PriceListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');

  // Calculator
  const [calcBrand, setCalcBrand] = useState('PIX');
  const [calcMrp, setCalcMrp] = useState(2500);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await contentService.getServices({ limit: 50 });
        if (res.success && res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('[Price List Catalog Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const selectedBrandRule = discountMatrix.find((d) => d.code === calcBrand) || discountMatrix[0];
  const parsedMrp = Math.max(0, Number(calcMrp) || 0);
  const discountAmount = Math.round((parsedMrp * selectedBrandRule.discountPct) / 100);
  const netWholesalePrice = Math.max(0, parsedMrp - discountAmount);
  const gstAmount = Math.round(((netWholesalePrice * 18) / 100) * 100) / 100;
  const grandTotal = Math.round((netWholesalePrice + gstAmount) * 100) / 100;

  const filteredProducts = products.filter((p) => {
    const matchesBrand = selectedBrand === 'ALL' || (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      (p.partNumber && p.partNumber.toLowerCase().includes(query)) ||
      (p.brand && p.brand.toLowerCase().includes(query));
    return matchesBrand && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy via-navy-light to-navy rounded-3xl p-8 md:p-12 text-white shadow-xl border border-blue-900/40">
        {/* Transparent background image blending smoothly with blue */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="w-full h-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Official B2B Discount Schedule
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 font-bold text-xs px-3 py-1 rounded-full border border-emerald-400/30">
            🚚 Delhivery Charges 100% Included
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
          MRP Price List & Wholesale Discounts
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Transparent wholesale pricing policy. We pass maximum distribution margins directly to plants and OEMs: 45% - 48% off MRP on standard lines with free freight, and strictly 10% on genuine SKF.
        </p>
        </div>
      </div>

      {/* Brand Discount Matrix Cards */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            Brand Terms & Discount Policy
          </span>
          <h2 className="text-2xl font-black text-navy mt-1">Authorized Make Discount Structure</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discountMatrix.map((item) => (
            <div
              key={item.code}
              className={`rounded-2xl p-6 border shadow-xs transition-smooth hover:shadow-md flex flex-col justify-between space-y-4 ${item.color}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase border ${item.tagColor}`}>
                    {item.code}
                  </span>
                  <span className="bg-slate-900 text-amber-300 font-extrabold text-xs px-2.5 py-1 rounded-md">
                    {item.discount}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-navy">{item.brand}</h3>
                  <p className="text-xs text-secondaryText mt-0.5">{item.section}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.notes}</p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500 font-medium">Freight:</span>
                  <span className="font-bold text-emerald-700">{item.freight}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500 font-medium">Verification:</span>
                  <span className="font-semibold">{item.warranty}</span>
                </div>
                <div className="pt-2">
                  <Link
                    to={`/services?brand=${item.code}`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View {item.code} Catalog Items</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Price Calculator Widget */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> Real-Time Rate Calculator
            </span>
            <h3 className="text-xl font-black text-navy mt-1">Calculate Your Net B2B Savings</h3>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
            Delhivery Shipping Included
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Brand / Category
              </label>
              <select
                value={calcBrand}
                onChange={(e) => setCalcBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm bg-slate-50"
              >
                {discountMatrix.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.brand} ({d.discount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Enter Official List MRP (₹)
              </label>
              <input
                type="number"
                min="1"
                value={calcMrp}
                onChange={(e) => setCalcMrp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-black text-navy text-base"
                placeholder="2500"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-secondaryText">Catalog List MRP:</span>
              <span className="font-bold line-through text-slate-400">{formatCurrency(parsedMrp)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-bold text-amber-700">Contract Discount ({selectedBrandRule.discountPct}%):</span>
              <span className="font-black text-amber-700">- {formatCurrency(discountAmount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-secondaryText">Delhivery Freight Freight:</span>
              <span className="font-bold text-emerald-700">₹0 (Free / Included)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-secondaryText">Applicable GST (18%):</span>
              <span className="font-bold text-slate-700">{formatCurrency(gstAmount)}</span>
            </div>

            <div className="h-px bg-slate-200 my-2" />

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-sm font-black text-navy">Net B2B Payable:</span>
                <p className="text-[10px] text-slate-400">Doorstep delivery via Delhivery</p>
              </div>
              <span className="text-2xl font-black text-emerald-700">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extracted PDF Catalog & Category Hierarchy (Requirement 3) */}
      <PdfCatalogViewer />

      {/* Complete Itemized Part Number Price List Table */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-navy">Itemized Product Catalog & Part Numbers</h3>
            <p className="text-xs text-secondaryText mt-0.5">
              Live price list of all stocked components from Karthick Kumar K’s inventory.
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by part or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
            >
              <option value="ALL">All Makes</option>
              <option value="PIX">PIX</option>
              <option value="NBC">NBC</option>
              <option value="HCH">HCH</option>
              <option value="Fenner">Fenner</option>
              <option value="Timken">Timken</option>
              <option value="SKF">SKF</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Make</th>
                <th className="py-3 px-4">Part / Code</th>
                <th className="py-3 px-4">Section / Description</th>
                <th className="py-3 px-4 text-right">List MRP</th>
                <th className="py-3 px-4 text-center">Discount</th>
                <th className="py-3 px-4 text-right">Net Wholesale</th>
                <th className="py-3 px-4 text-center">Delivery</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const officialMrp = p.mrp > 0 ? p.mrp : Math.round(p.basePrice / (1 - (p.discountPercentage || 46) / 100));
                const netPrice = p.discountPrice || p.basePrice;
                return (
                  <tr key={p._id} className="hover:bg-slate-50 transition-smooth">
                    <td className="py-3.5 px-4 font-black text-navy">{p.brand}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">{p.partNumber}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-darkText line-clamp-1">{p.name}</p>
                      <span className="text-[10px] text-slate-400">{p.section}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-400 line-through">
                      {formatCurrency(officialMrp)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                        p.brand === 'SKF' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {p.discountPercentage}% OFF
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-navy text-sm">
                      {formatCurrency(netPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Delhivery Free
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        to={`/services/${p.slug || p._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy text-white text-[11px] font-bold hover:bg-primary transition-smooth"
                      >
                        Order
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
