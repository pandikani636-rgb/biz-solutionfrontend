import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Star, Truck, ShieldCheck, Tag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { getProductImageUrl } from '../../utils/productImages';

const brandColors = {
  PIX: 'bg-amber-100 text-amber-900 border-amber-300',
  NBC: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  HCH: 'bg-sky-100 text-sky-900 border-sky-300',
  Fenner: 'bg-rose-100 text-rose-900 border-rose-300',
  Timken: 'bg-orange-100 text-orange-900 border-orange-300',
  SKF: 'bg-blue-100 text-blue-900 border-blue-300',
  General: 'bg-slate-100 text-slate-800 border-slate-300',
};

export const ServiceCard = ({ service }) => {
  const {
    name,
    slug,
    category,
    brand,
    partNumber,
    section,
    mrp,
    discountPercentage,
    deliveryIncluded = true,
    origin,
    shortDescription,
    mainImage,
    basePrice,
    discountPrice,
    processingTime,
    isFeatured,
  } = service;

  const productUrl = `/services/${slug || service._id}`;
  const displayPrice = discountPrice > 0 && discountPrice < basePrice ? discountPrice : basePrice;
  const cleanName = (name || '').replace(/authori[sz]ed\s*/gi, '');
  const cleanDescription = (shortDescription || '').replace(/authori[sz]ed\s*/gi, '');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-smooth flex flex-col group relative">
      {/* Top Image Container - Clickable to Product Details */}
      <Link to={productUrl} className="block relative h-48 w-full overflow-hidden bg-slate-900 cursor-pointer">
        <img
          src={getProductImageUrl(service)}
          alt={cleanName}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-500 opacity-95"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Brand Badge (Top-Left) */}
        {brand && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider border shadow-sm backdrop-blur-sm ${
                brandColors[brand] || brandColors.General
              }`}
            >
              {brand}
            </span>
          </div>
        )}

        {/* Feature Tag (Top-Right) */}
        {isFeatured && (
          <div className="absolute top-3 right-3 pointer-events-none">
            <span className="bg-navy/90 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> Top Demand
            </span>
          </div>
        )}

        {/* Section / Category Pill (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 pointer-events-none">
          {section && (
            <span className="bg-navy/90 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
              {section}
            </span>
          )}
          {origin && origin !== 'Standard' && (
            <span className="bg-emerald-600/90 text-white text-[10px] px-2 py-0.5 rounded font-semibold">
              {origin} Stock
            </span>
          )}
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link to={productUrl} className="block group/title">
            <h3 className="font-bold text-base md:text-lg text-darkText group-hover/title:text-primary transition-smooth line-clamp-1 cursor-pointer">
              {cleanName}
            </h3>
          </Link>

          <p className="text-secondaryText text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {cleanDescription}
          </p>
        </div>

        {/* Industrial Delivery & Genuine Stamp */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Truck className="w-3.5 h-3.5 text-primary" />
            <span>Express Dispatch</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine
          </div>
        </div>

        {/* Pricing Footer */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-600">Price:</span>
                <span className="text-xl font-black text-navy">
                  {formatCurrency(displayPrice)}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">+ GST</span>
              </div>
            </div>

            <Link
              to={productUrl}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-navy text-white hover:bg-primary font-bold text-xs shadow-xs transition-smooth"
            >
              <span>Order / Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
