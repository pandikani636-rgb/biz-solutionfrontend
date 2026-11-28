import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  ShieldAlert,
  Calendar,
  Phone,
  Mail,
  FileSpreadsheet,
  CheckCircle2,
  LayoutDashboard,
  ArrowRight,
  Layers,
  Ticket,
  HardHat,
  TrainFront,
  LogIn,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { Button } from '../common/Button';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { settings, categories, showPreloader } = useSite();
  const { openCart, totalItemCount } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const categoryDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Monitor scroll to enhance sticky styling when top bar scrolls out of view
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-1.5 lg:px-1.5 xl:px-2.5 2xl:px-3 py-1 lg:py-1 xl:py-2 rounded-xl text-xs xl:text-[13px] 2xl:text-sm font-bold tracking-tight transition-all inline-flex items-center gap-1 xl:gap-1.5 flex-nowrap whitespace-nowrap shrink-0 ${
      isActive
        ? 'text-primary bg-blue-50/90 font-black shadow-xs ring-1 ring-primary/20'
        : 'text-slate-800 hover:text-primary hover:bg-slate-100/90'
    }`;

  return (
    <>
      {/* 1. Top Utility Info Bar (Desktop) - Increased Height & Perfectly Matched Phone & GST Typography */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white min-h-[52px] sm:min-h-[56px] hidden md:block border-b border-blue-500/40 select-none animate-fadeIn font-extrabold shadow-sm overflow-hidden">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between flex-nowrap whitespace-nowrap gap-4">
          {/* Left: Hotline & Email */}
          <div className="flex items-center gap-3 lg:gap-4 flex-nowrap whitespace-nowrap shrink-0">
            <span className="text-white font-black tracking-wide text-xs lg:text-sm whitespace-nowrap drop-shadow-sm hidden xl:inline">
              Industrial Power Transmission &amp; Bearings
            </span>

            <span className="text-blue-300 font-normal hidden xl:inline">|</span>

            {/* Phone Number - Exact Same Size as GSTIN */}
            <a
              href="tel:+917418423238"
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-yellow-200 font-black text-sm lg:text-[15px] font-mono tracking-wide transition-colors whitespace-nowrap drop-shadow-sm"
              title="Official Sales Hotline"
            >
              <Phone className="w-4 h-4 text-amber-300 shrink-0" />
              <span>+91 74184 23238</span>
            </a>

            <span className="text-blue-300 font-normal">|</span>

            <a
              href="mailto:balumuniandassociates@gmail.com"
              className="inline-flex items-center gap-1.5 text-white hover:text-amber-200 transition-colors whitespace-nowrap font-bold text-xs lg:text-sm drop-shadow-sm"
              title="Official Business Email"
            >
              <Mail className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="hidden sm:inline">balumuniandassociates@gmail.com</span>
              <span className="sm:hidden">Email Us</span>
            </a>
          </div>

          {/* Right Info: GSTIN (Exact Same Size as Phone) & Admin / Client Portal */}
          <div className="flex items-center gap-3 lg:gap-4 flex-nowrap whitespace-nowrap shrink-0">
            <span className="inline-flex items-center gap-1.5 text-amber-300 font-black text-sm lg:text-[15px] font-mono tracking-wide whitespace-nowrap drop-shadow-sm">
              <span>GSTIN:</span>
              <span className="font-mono">33HONPK5547G2ZK</span>
            </span>

            <span className="text-blue-300 font-normal">|</span>

            {isAdmin ? (
              <Link
                to="/admin"
                className="text-amber-300 hover:text-yellow-200 font-black text-xs lg:text-sm inline-flex items-center gap-1.5 transition-colors whitespace-nowrap drop-shadow-sm"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Admin Console</span>
              </Link>
            ) : isAuthenticated ? (
              <Link
                to="/customer"
                className="text-amber-300 hover:text-yellow-200 font-black text-xs lg:text-sm inline-flex items-center gap-1.5 transition-colors whitespace-nowrap drop-shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Customer Portal</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-amber-300 hover:text-yellow-200 font-black text-xs lg:text-sm inline-flex items-center gap-1.5 transition-colors whitespace-nowrap drop-shadow-sm"
                title="Client Portal Login"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>Client Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>



      {/* 2. Main Navigation Bar - STICKY top-0: Increased Height & Balanced Layout */}
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-200 select-none animate-fadeIn ${
          isScrolled
            ? 'shadow-md border-slate-300/90'
            : 'shadow-xs border-slate-200/90'
        }`}
      >
        {/* Main Navigation Bar - Balanced layout fitting all viewports without pushing Login off */}
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-6 xl:px-8 h-20 lg:h-[84px] xl:h-[92px] flex items-center justify-between gap-3 lg:gap-4 relative">
          {/* Brand Lockup: BM Logo + Balumuni and Associates (Responsive, never overflows) */}
          <Link
            to="/"
            className="flex items-center gap-2 group shrink-0 min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs group-hover:border-primary/40 group-hover:shadow-md transition-all shrink-0">
              <img
                src={settings?.logo || '/bm-logo.png'}
                alt={settings?.siteName || 'Balumuni and Associates Logo'}
                className="w-full h-full object-contain drop-shadow-2xs"
                onError={(e) => {
                  e.target.src = '/bm-logo.png';
                }}
              />
            </div>
            <span className="font-cinzel text-blue-700 hover:text-blue-800 text-sm sm:text-base md:text-lg lg:text-[15px] xl:text-lg 2xl:text-xl font-black tracking-wide leading-tight transition-colors flex items-center select-none drop-shadow-xs truncate uppercase">
              <span className="truncate">BALUMUNI</span>
              <span className="hidden xl:inline whitespace-nowrap ml-1 font-black">AND ASSOCIATES</span>
            </span>
          </Link>

          {/* Center Navigation Links: Home -> About Us (User requested Home ku aprom About Us) -> Products -> Travel -> Insurance -> Discounts -> Contact */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 flex-nowrap whitespace-nowrap shrink-0">
            {/* 1. Home */}
            <NavLink to="/" className={navLinkClass}>
              <span>{t('nav_home') || 'Home'}</span>
            </NavLink>

            {/* 2. About Us - Immediately after Home */}
            <NavLink to="/about" className={navLinkClass}>
              <span>{t('nav_about') || 'About Us'}</span>
            </NavLink>

            {/* 3. Products Catalog with Clickable & Hoverable Dropdown */}
            <div
              ref={categoryDropdownRef}
              className="relative shrink-0 whitespace-nowrap"
              onMouseEnter={() => setIsCategoryDropdownOpen(true)}
              onMouseLeave={() => setIsCategoryDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCategoryDropdownOpen((prev) => !prev);
                }}
                className={`px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 py-1.5 lg:py-2 rounded-xl text-xs xl:text-[13px] 2xl:text-sm font-bold tracking-tight transition-all inline-flex items-center gap-1 xl:gap-1.5 flex-nowrap whitespace-nowrap shrink-0 cursor-pointer ${
                  isCategoryDropdownOpen
                    ? 'bg-blue-50/90 text-primary font-black shadow-xs ring-1 ring-primary/20'
                    : 'text-slate-800 hover:text-primary hover:bg-slate-100/90'
                }`}
                aria-expanded={isCategoryDropdownOpen}
                aria-haspopup="true"
              >
                <span>{t('nav_products') || 'Products'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                    isCategoryDropdownOpen ? 'rotate-180 text-primary' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Dropdown Menu - Floating with high z-index & smooth shadow */}
              {isCategoryDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fadeIn whitespace-normal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    to="/services"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-primary hover:bg-blue-50/80 rounded-xl transition-colors"
                  >
                    <span>Explore Complete Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <div className="h-px bg-slate-100 my-1" />
                  <div className="max-h-64 overflow-y-auto space-y-0.5">
                    {(categories || []).length > 0 ? (
                      categories.map((cat) => (
                        <Link
                          key={cat._id}
                          to={`/services?category=${cat._id}`}
                          onClick={() => setIsCategoryDropdownOpen(false)}
                          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span className="truncate">{cat.name}</span>
                        </Link>
                      ))
                    ) : (
                      <>
                        <Link
                          to="/services?search=Bearing"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span>Bearings</span>
                        </Link>
                        <Link
                          to="/services?search=Belt"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span>Belts &amp; Transmission</span>
                        </Link>
                        <Link
                          to="/services?search=Motor"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span>Electric Motors</span>
                        </Link>
                        <Link
                          to="/services?search=Gear"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span>Gears &amp; Drives</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Travel Booking Desk (Train & Flight) */}
            <NavLink to="/ticket-booking" className={navLinkClass}>
              <TrainFront className="h-3.5 w-3.5 text-emerald-600 hidden 2xl:inline-block shrink-0" />
              <span className="hidden xl:inline">Travel Desk</span>
              <span className="xl:hidden">Travel</span>
            </NavLink>

            {/* 5. Labour Insurance Section */}
            <NavLink to="/labour-insurance" className={navLinkClass}>
              <HardHat className="h-3.5 w-3.5 text-amber-500 hidden 2xl:inline-block shrink-0" />
              <span className="hidden xl:inline">Labour Insurance</span>
              <span className="xl:hidden">Insurance</span>
            </NavLink>

            {/* 6. MRP Discounts */}
            <NavLink to="/mrp-pricing" className={navLinkClass}>
              <span className="hidden xl:inline">{t('nav_mrp_discounts') || 'MRP Discounts'}</span>
              <span className="xl:hidden">Discounts</span>
            </NavLink>

            {/* 7. Contact */}
            <NavLink to="/contact" className={navLinkClass}>
              <span>{t('nav_contact') || 'Contact'}</span>
            </NavLink>
          </nav>

          {/* Desktop Right Action Cluster - Always 100% visible, non-clipping across all laptop & desktop screens */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0 flex-nowrap whitespace-nowrap pl-1">
            {/* Global Cart Button (Desktop) */}
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 xl:px-3.5 xl:py-2.5 rounded-xl text-xs xl:text-sm font-black bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 shadow-xs hover:shadow transition-all cursor-pointer select-none shrink-0"
              title="View Quotation Cart"
            >
              <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
              <span>Cart</span>
              {totalItemCount > 0 && (
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {totalItemCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div ref={userDropdownRef} className="relative shrink-0 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="inline-flex items-center gap-1.5 p-1 pl-2 xl:pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50 hover:bg-white whitespace-nowrap cursor-pointer shadow-xs"
                >
                  <span className="text-xs font-bold text-slate-800 max-w-[80px] xl:max-w-[120px] truncate whitespace-nowrap">
                    {user.name}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-primary border border-blue-200 flex items-center justify-center font-bold shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn whitespace-normal">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {user.pricingTier === 'new_user' ? 'Wholesale Tier' : 'B2B Client'}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        to="/customer"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="inline-flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-800 hover:text-primary hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        <span>{t('nav_dashboard') || 'Dashboard'}</span>
                      </Link>

                      <Link
                        to="/customer/bookings"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="inline-flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{t('nav_my_orders') || 'Orders & Invoices'}</span>
                      </Link>

                      <Link
                        to="/customer/ticket-bookings"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="inline-flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-slate-400" />
                        <span>My Ticket Bookings</span>
                      </Link>

                      <Link
                        to="/customer/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="inline-flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{t('nav_profile') || 'Company Profile'}</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="inline-flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-primary" />
                          <span>{t('nav_admin') || 'Admin Console'}</span>
                        </Link>
                      )}
                    </div>

                    <div className="h-px bg-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav_logout') || 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 lg:gap-2 shrink-0 whitespace-nowrap">
                <Link to="/login" className="shrink-0 whitespace-nowrap">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 xl:px-4 xl:py-2.5 rounded-xl text-xs xl:text-sm font-black bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer select-none"
                    title="Sign In to Account"
                  >
                    <User className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                    <span>{t('nav_login') || 'Login'}</span>
                  </button>
                </Link>
                <Link to="/register" className="shrink-0 whitespace-nowrap inline-flex">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3.5 py-2 xl:px-4 xl:py-2.5 rounded-xl text-xs xl:text-sm font-black bg-blue-700 hover:bg-blue-800 text-white border border-blue-800 shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer select-none"
                  >
                    <span>{t('nav_signup') || t('nav_register') || 'Sign Up'}</span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Actions: Prominent Cart + Login + Sign Up ALWAYS visible + Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Cart Button */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 cursor-pointer shrink-0"
              title="View Quotation Cart"
            >
              <ShoppingBag className="w-4 h-4 text-primary" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[9px] min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <Link
                to="/customer"
                className="flex items-center gap-1.5 p-1 px-2.5 rounded-full border border-blue-200 bg-blue-50 shrink-0 text-xs font-bold text-blue-900"
                title="My Dashboard"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 text-primary border border-blue-200 flex items-center justify-center font-bold shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:inline font-bold">Dashboard</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <Link to="/login" className="shrink-0 whitespace-nowrap">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 shadow-xs cursor-pointer active:scale-95 transition-all"
                    title="Sign In"
                  >
                    <User className="w-3 h-3 text-slate-950 shrink-0" />
                    <span>Login</span>
                  </button>
                </Link>
                {/* Sign Up is explicitly visible on all screen sizes, never hidden */}
                <Link to="/register" className="inline-flex shrink-0 whitespace-nowrap">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-black bg-blue-700 hover:bg-blue-800 text-white border border-blue-800 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <span>Sign Up</span>
                  </button>
                </Link>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

      {/* 3. Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-8 space-y-3 animate-fadeIn shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain">
          {/* Mobile Login / Sign Up Quick Bar */}
          {!isAuthenticated ? (
            <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-xl text-xs font-black bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors"
              >
                <span>Sign Up</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-primary border border-blue-200 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <Link
                to="/customer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-2.5 py-1 text-xs font-bold bg-primary text-white rounded-lg"
              >
                Portal
              </Link>
            </div>
          )}

          <div className="space-y-1">
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-blue-50 text-primary font-bold' : 'text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              {t('nav_home') || 'Home'}
            </NavLink>

            <NavLink
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-blue-50 text-primary font-bold' : 'text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              {t('nav_about') || 'About Us'}
            </NavLink>

            {/* Mobile Products with Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <span>{t('nav_products') || 'Products Catalog'}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isCategoryDropdownOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              {isCategoryDropdownOpen && (
                <div className="pl-4 pr-2 py-1 space-y-1 bg-slate-50 rounded-xl mt-1">
                  <Link
                    to="/services"
                    onClick={() => {
                      setIsCategoryDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block py-1.5 text-xs font-bold text-primary"
                  >
                    View All Products →
                  </Link>
                  {(categories || []).map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/services?category=${cat._id}`}
                      onClick={() => {
                        setIsCategoryDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block py-1 text-xs text-slate-600 hover:text-primary"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink
              to="/mrp-pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-blue-50 text-primary font-bold' : 'text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              {t('nav_mrp_discounts') || 'MRP Discounts'}
            </NavLink>

            <NavLink
              to="/rfq"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-blue-50 text-primary font-bold' : 'text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              {t('nav_rfq') || 'Request RFQ'}
            </NavLink>

            <NavLink
              to="/ticket-booking"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-blue-50 text-primary font-bold' : 'text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              Travel Desk (Train &amp; Flight)
            </NavLink>

            <NavLink
              to="/labour-insurance"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              Labour Insurance
            </NavLink>

            <NavLink
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-blue-50 text-primary font-bold' : 'text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              {t('nav_contact') || 'Contact Us'}
            </NavLink>
          </div>

          {/* Quick Call & Email */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <a
              href="tel:+917418423238"
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 rounded-xl text-primary font-bold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Sales</span>
            </a>
            <a
              href="mailto:balumuniandassociates@gmail.com"
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 rounded-xl text-slate-800 font-bold truncate"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Desk</span>
            </a>
          </div>

          {/* Auth */}
          <div className="pt-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-primary border border-blue-200 flex items-center justify-center font-bold shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/customer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 text-center rounded-xl bg-slate-900 text-white font-bold text-xs"
                  >
                    {t('nav_dashboard') || 'Dashboard'}
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-2 text-center rounded-xl bg-rose-50 text-rose-700 font-bold text-xs"
                  >
                    {t('nav_logout') || 'Sign Out'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-500 shadow-xs flex items-center justify-center gap-1.5 py-2.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{t('nav_login') || 'Login'}</span>
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full text-xs font-black bg-primary hover:bg-primary-dark shadow-xs flex items-center justify-center gap-1.5 py-2.5">
                    <span>{t('nav_signup') || t('nav_register') || 'Sign Up'}</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  </>
);
};

export default Navbar;
