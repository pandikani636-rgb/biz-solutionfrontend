import React from 'react';
import { Star, Quote, User } from 'lucide-react';

export const TestimonialCard = ({ testimonial }) => {
  const { customerName, customerRole, rating, content } = testimonial;

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
        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-primary font-bold shadow-2xs shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-darkText">{customerName}</h4>
          <p className="text-xs text-secondaryText">{customerRole}</p>
        </div>
      </div>
    </div>
  );
};
