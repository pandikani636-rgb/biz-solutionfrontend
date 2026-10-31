import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm hover:shadow',
    accent: 'bg-accent text-darkText hover:bg-accent-hover focus:ring-accent font-bold shadow-sm hover:shadow',
    secondary: 'bg-slate-100 text-darkText hover:bg-slate-200 focus:ring-slate-300',
    outline: 'border border-primary text-primary hover:bg-lightBlue focus:ring-primary',
    danger: 'bg-danger text-white hover:bg-red-700 focus:ring-danger shadow-sm',
    ghost: 'text-darkText hover:bg-slate-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    xl: 'px-8 py-3.5 text-lg gap-3',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
};
