import React, { useState, useEffect } from 'react';
import { Layers, RefreshCw, TrendingUp } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_ROWS = [
  { _id: '1', name: 'Paper', quantityUnit: '1 KG', price: 15 },
  { _id: '2', name: 'Cardboard', quantityUnit: '1 KG', price: 12 },
  { _id: '3', name: 'Plastic (Cans, Covers)', quantityUnit: '1 KG', price: 20 },
  { _id: '4', name: 'Steel', quantityUnit: '1 KG', price: 42 },
  { _id: '5', name: 'Aluminium', quantityUnit: '1 KG', price: 145 },
  { _id: '6', name: 'Brass', quantityUnit: '1 KG', price: 340 },
  { _id: '7', name: 'GI Materials', quantityUnit: '1 KG', price: 48 },
  { _id: '8', name: 'Oil', quantityUnit: '1 Litre', price: 65 },
  { _id: '9', name: 'Copper Wire & Cables', quantityUnit: '1 KG', price: 620 },
  { _id: '10', name: 'Cast Iron Heavy Scrap', quantityUnit: '1 KG', price: 32 },
];

export const ScrapPriceTable = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    try {
      const res = await contentService.getScrapPrices();
      if (res.success && res.data && res.data.length > 0) {
        setItems(res.data);
      } else {
        setItems(DEFAULT_ROWS);
      }
    } catch (err) {
      console.warn('[Scrap Prices Error]', err);
      setItems(DEFAULT_ROWS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  // Ensure exactly 10 rows are displayed (or pads with blanks if fewer)
  const displayRows = [...(items.length > 0 ? items : DEFAULT_ROWS)];
  while (displayRows.length < 10) {
    const idx = displayRows.length + 1;
    displayRows.push({
      _id: `pad-${idx}`,
      name: `Material Slot #${idx}`,
      quantityUnit: '1 KG',
      price: 0,
    });
  }
  const topTenRows = displayRows.slice(0, 10);

  return (
    <div className="w-full max-w-[480px] ml-auto bg-slate-950/70 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-3.5 shadow-xl text-white select-none transition-all">
      {/* Table Header / Badge - Compact */}
      <div className="flex items-center justify-between pb-2 border-b border-white/15 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-tight flex items-center gap-1.5">
              <span>Today's Scrap Rate Card</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live Pricing" />
            </h3>
            <p className="text-[9px] sm:text-[10px] text-blue-200/80">
              10-Material Daily Scrap Index
            </p>
          </div>
        </div>
        <span className="text-[9px] font-extrabold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full">
          Live Rates
        </span>
      </div>

      {/* 3 Columns & 10 Rows Transparent Table - Compact */}
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/15 text-[10px] font-extrabold uppercase tracking-wider text-amber-300/90">
              <th className="py-1 px-2">Material</th>
              <th className="py-1 px-2 text-center">Unit</th>
              <th className="py-1 px-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {topTenRows.map((row, index) => (
              <tr
                key={row._id || index}
                className="hover:bg-white/10 transition-colors group"
              >
                {/* Column 1: Material Name */}
                <td className="py-1 px-2 font-bold text-white group-hover:text-amber-200 truncate max-w-[130px] sm:max-w-[150px] text-[11px]">
                  <span className="text-[9px] font-mono text-slate-400 mr-1">{index + 1}.</span>
                  <span>{row.name}</span>
                </td>

                {/* Column 2: Quantity (KG + Litres) */}
                <td className="py-1 px-2 text-center text-blue-100 font-medium whitespace-nowrap text-[10px]">
                  <span className="inline-block bg-white/10 px-1.5 py-0.2 rounded border border-white/10 font-mono">
                    {row.quantityUnit || '1 KG'}
                  </span>
                </td>

                {/* Column 3: Scrap Price */}
                <td className="py-1 px-2 text-right font-black text-amber-400 whitespace-nowrap text-[11px] sm:text-[12px] font-mono">
                  {row.price > 0 ? (
                    `₹${Number(row.price).toLocaleString('en-IN')}`
                  ) : (
                    <span className="text-slate-400 text-[9px]">On Request</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-300">
        <span>*Rates subject to market fluctuations</span>
        <span className="text-amber-300 font-semibold">Updated daily</span>
      </div>
    </div>
  );
};

export default ScrapPriceTable;
