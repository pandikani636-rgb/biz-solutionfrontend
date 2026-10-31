import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  ShieldAlert,
  Calendar,
  Layers,
  Phone,
  Truck,
  FileSpreadsheet,
  FileText,
  BadgePercent,
  CheckCircle2,
  Globe,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../common/Button';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { settings, categories } = useSite();
  const { language, isTamil, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Scroll behavior: Hide top bar on scroll down, keep secondary bar sticky without shaking
  const [isTopBarHidden, setIsTopBarHidden] = useState(false);
  const lastScrollY = useRef(0);
  const isTicking = useRef(false);

  useEffect(() => {
    const scrollThreshold = 25; // Minimum scroll delta before toggling to avoid shaking

    const handleScroll = () => {
      if (!isTicking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY.current;

          if (currentScrollY <= 35) {
            // Near top of page: always reveal top bar
            setIsTopBarHidden(false);
            lastScrollY.current = currentScrollY;
          } else if (delta > scrollThreshold && currentScrollY > 70) {
            // Significant downward scroll: hide top bar smoothly
            setIsTopBarHidden(true);
            lastScrollY.current = currentScrollY;
          } else if (delta < -scrollThreshold) {
            // Significant upward scroll: reveal top bar smoothly
            setIsTopBarHidden(false);
            lastScrollY.current = currentScrollY;
          }

          isTicking.current = false;
        });
        isTicking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 text-sm font-semibold transition-smooth hover:text-primary ${
      isActive ? 'text-primary font-bold' : 'text-slate-700'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transform-gpu will-change-transform">
      {/* Top micro-bar: Hides smoothly on scroll down without layout jitter */}
      <div
        className={`bg-navy text-white text-xs hidden md:block overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          isTopBarHidden ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-12 opacity-100'
        }`}
      >
        <div className="py-2 px-4 max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-accent" /> Sales & RFQ: {settings.contactPhone || '+91 74184 23238'}
            </span>
            <span>✉️ {settings.contactEmail || 'balumuniandassociates@gmail.com'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-300 font-bold inline-flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> {t('nav_free_shipping')}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t('nav_genuine_mtc')}
            </span>

            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-accent text-navy hover:bg-yellow-400 transition-smooth shadow-xs"
              title="Change Language (English / தமிழ்)"
            >
              <Globe className="w-3 h-3" />
              <span>{isTamil ? 'English' : 'தமிழ்'}</span>
            </button>

            {isAdmin && (
              <Link to="/admin" className="text-accent hover:underline font-bold inline-flex items-center gap-1 ml-2">
                <ShieldAlert className="w-3.5 h-3.5" /> {t('nav_admin')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Secondary navigation (Sticky) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-smooth">
            <Layers className="w-6 h-6 text-accent" />
          </div>
          <div>
            <span className="text-2xl font-black text-navy tracking-tight">
              Biz<span className="text-primary">Zolution</span>
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-secondaryText -mt-1">
              Balumuni & Associates Hub
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={navLinkClass}>
            {t('nav_home')}
          </NavLink>

          {/* Products Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsCategoryDropdownOpen(true)}
            onMouseLeave={() => setIsCategoryDropdownOpen(false)}
          >
            <NavLink to="/services" className={({ isActive }) => `${navLinkClass({ isActive })}`}>
              <span>{t('nav_products')}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </NavLink>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full -left-4 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn">
                <Link
                  to="/services"
                  className="block px-4 py-2.5 text-xs font-bold text-primary hover:bg-lightBlue rounded-xl transition-smooth"
                >
                  View All Products & Parts →
                </Link>
                <div className="h-px bg-slate-100 my-1" />
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/services?category=${cat._id}`}
                    className="inline-flex items-center gap-3 w-full px-4 py-2 text-xs font-medium text-darkText hover:bg-slate-50 rounded-xl transition-smooth"
                  >
                    <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/mrp-pricing" className={navLinkClass}>
            <BadgePercent className="w-4 h-4 text-emerald-600" />
            <span>{t('nav_mrp_discounts')}</span>
          </NavLink>

          <NavLink to="/rfq" className={navLinkClass}>
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            <span>{t('nav_rfq')}</span>
          </NavLink>

          <NavLink to="/about" className={navLinkClass}>
            {t('nav_about')}
          </NavLink>

          <NavLink to="/contact" className={navLinkClass}>
            {t('nav_contact')}
          </NavLink>
        </nav>

        {/* Auth & Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/rfq">
            <Button variant="accent" size="sm" className="shadow-xs font-bold inline-flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t('nav_quick_quote')}</span>
            </Button>
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="inline-flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 transition-smooth bg-slate-50"
              >
                <span className="text-xs font-bold text-darkText max-w-[120px] truncate">
                  {user.name}
                </span>
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-primary/20"
                />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-darkText">{user.name}</p>
                    <p className="text-[11px] text-secondaryText truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {user.isNewUser || user.pricingTier === 'new_user' ? 'New User Rate' : 'Standard Wholesale'}
                    </span>
                  </div>

                  <Link
                    to="/customer"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="inline-flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-navy hover:bg-slate-50 rounded-xl mt-1 transition-smooth"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span>{t('nav_dashboard')}</span>
                  </Link>

                  <Link
                    to="/customer/bookings"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="inline-flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-darkText hover:bg-slate-50 rounded-xl transition-smooth"
                  >
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{t('nav_my_orders')}</span>
                  </Link>

                  <Link
                    to="/customer/profile"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="inline-flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-darkText hover:bg-slate-50 rounded-xl transition-smooth"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{t('nav_profile')}</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="inline-flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-accent hover:bg-navy hover:text-white rounded-xl transition-smooth mt-1"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>{t('nav_admin')}</span>
                    </Link>
                  )}

                  <div className="h-px bg-slate-100 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-danger hover:bg-rose-50 rounded-xl transition-smooth"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav_logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  {t('nav_login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="sm">
                  {t('nav_register')}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 rounded-lg text-xs font-black bg-accent text-navy"
          >
            {isTamil ? 'EN' : 'தமிழ்'}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-navy" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <NavLink
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-semibold py-2 text-darkText hover:text-primary"
          >
            {t('nav_home')}
          </NavLink>
          <NavLink
            to="/services"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-semibold py-2 text-darkText hover:text-primary"
          >
            {t('nav_products')}
          </NavLink>
          <NavLink
            to="/mrp-pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-semibold py-2 text-emerald-700 font-bold"
          >
            {t('nav_mrp_discounts')}
          </NavLink>
          <NavLink
            to="/rfq"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-semibold py-2 text-primary font-bold"
          >
            {t('nav_rfq')}
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-semibold py-2 text-darkText hover:text-primary"
          >
            {t('nav_about')}
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-semibold py-2 text-darkText hover:text-primary"
          >
            {t('nav_contact')}
          </NavLink>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-darkText">{user.name}</p>
                    <p className="text-xs text-secondaryText">{user.email}</p>
                  </div>
                </div>

                <Link
                  to="/customer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center rounded-xl bg-navy text-accent font-bold text-sm"
                >
                  {t('nav_dashboard')}
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-2 text-center rounded-xl bg-slate-100 text-darkText font-semibold text-sm"
                  >
                    {t('nav_admin')}
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full py-2 text-center rounded-xl bg-rose-50 text-danger font-semibold text-sm"
                >
                  {t('nav_logout')}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    {t('nav_login')}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="accent" className="w-full">
                    {t('nav_register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
