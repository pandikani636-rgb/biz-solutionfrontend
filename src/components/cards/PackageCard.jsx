import React from 'react';
import { Check, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';

export const PackageCard = ({
  pkg,
  isSelected = false,
  onSelect,
  selectedAddOns = [],
  onToggleAddOn,
}) => {
  const { name, price, discountPrice, duration, features = [], addOns = [], isPopular } = pkg;
  const effectivePrice = discountPrice > 0 && discountPrice < price ? discountPrice : price;
  const hasDiscount = discountPrice > 0 && discountPrice < price;

  return (
    <div
      className={`relative rounded-2xl p-6 transition-smooth flex flex-col justify-between border-2 ${
        isSelected
          ? 'border-primary bg-blue-50/30 shadow-lg'
          : isPopular
          ? 'border-accent bg-white shadow-md hover:border-primary'
          : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-darkText text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Star className="w-3 h-3 fill-darkText text-darkText" /> Most Popular
          </span>
        </div>
      )}

      <div>
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-lg text-darkText">{name}</h4>
            <p className="text-xs text-secondaryText mt-0.5">{duration}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="my-5 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-navy">
            {formatCurrency(effectivePrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">
              {formatCurrency(price)}
            </span>
          )}
          <span className="text-xs text-secondaryText">/ package</span>
        </div>

        {/* Included Features */}
        <div className="space-y-2.5 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-darkText uppercase tracking-wider">
            Included in this package:
          </p>
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-darkText">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Optional Add-Ons */}
        {addOns && addOns.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <p className="text-xs font-semibold text-navy uppercase tracking-wider">
              Optional Add-Ons:
            </p>
            <div className="space-y-1.5">
              {addOns.map((addon) => {
                const isChecked = selectedAddOns.some((a) => a.name === addon.name);
                return (
                  <label
                    key={addon.name}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 cursor-pointer border border-slate-200/60 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleAddOn && onToggleAddOn(addon)}
                      className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <div className="flex-1 flex justify-between">
                      <span className="font-medium text-darkText">{addon.name}</span>
                      <span className="font-bold text-navy">+{formatCurrency(addon.price)}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Select CTA */}
      <div className="mt-6 pt-4">
        <Button
          variant={isSelected ? 'primary' : 'outline'}
          className="w-full justify-center"
          onClick={() => onSelect(pkg)}
        >
          {isSelected ? 'Selected' : 'Select Package'}
        </Button>
      </div>
    </div>
  );
};
