import React from 'react';
import { Star, Quote } from 'lucide-react';

export const TestimonialCard = ({ testimonial }) => {
  const { customerName, customerRole, avatar, rating, content } = testimonial;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-smooth flex flex-col justify-between relative">
      <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-100" />
      <div>
        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating ? 'text-accent fill-accent' : 'text-slate-200 fill-slate-200'
              }`}
            />
          ))}
        </div>

        <p className="text-secondaryText text-sm leading-relaxed italic relative z-10">
          "{content}"
        </p>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
        <img
          src={avatar}
          alt={customerName}
          className="w-11 h-11 rounded-full object-cover border border-slate-200"
        />
        <div>
          <h4 className="font-bold text-sm text-darkText">{customerName}</h4>
          <p className="text-xs text-secondaryText">{customerRole}</p>
        </div>
      </div>
    </div>
  );
};
