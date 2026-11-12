import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  Package,
  CalendarCheck,
  Users,
  CreditCard,
  Image as ImageIcon,
  TicketPercent,
  MessageSquare,
  HelpCircle,
  Settings,
  ExternalLink,
  LogOut,
  FileSpreadsheet,
  Camera,
  FileUp,
  FileCheck,
  Languages,
  ShieldCheck,
  ChevronRight,
  ShoppingBag,
  Ticket,
  TrendingUp,
  Sparkles,
  HardHat,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const AdminSidebar = ({ isCollapsed, isMobileOpen, onCloseMobile, onToggle }) => {
  const { logout, user } = useAuth();
  const { isTamil, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      groupTitle: 'Operations & Orders',
      items: [
        { label: t('admin_dashboard') || 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
        { label: 'Labour Insurance', to: '/admin/labour-insurance', icon: HardHat },
        { label: 'Ticket Bookings', to: '/admin/ticket-bookings', icon: Ticket },
        { label: 'Material Purchases', to: '/admin/purchases', icon: ShoppingBag },
        { label: t('admin_quotations') || 'Quotations & RFQs', to: '/admin/quotations', icon: FileCheck },
        { label: t('admin_orders') || 'Orders & Invoices', to: '/admin/bookings', icon: CalendarCheck },
        { label: 'Transactions', to: '/admin/payments', icon: CreditCard },
        { label: t('admin_customers') || 'Customers & Rates', to: '/admin/customers', icon: Users },
      ],
    },
    {
      groupTitle: 'Catalog & Inventory',
      items: [
        { label: 'Scrap Price Table', to: '/admin/scrap-prices', icon: TrendingUp },
        { label: 'Products & Bearings', to: '/admin/services', icon: Briefcase },
        { label: 'Categories', to: '/admin/categories', icon: Layers },
        { label: 'Packages & Tiers', to: '/admin/packages', icon: Package },
        { label: t('admin_pdf_catalog') || 'PDF Catalog Import', to: '/admin/pdf-catalog', icon: FileUp },
        { label: t('admin_user_uploads') || 'Part Photo Uploads', to: '/admin/user-uploads', icon: Camera },
      ],
    },
    {
      groupTitle: 'Growth & System',
      items: [
        { label: 'Popup Advertisements', to: '/admin/advertisements', icon: Sparkles },
        { label: 'Hero Banners', to: '/admin/banners', icon: ImageIcon },
        { label: 'Coupons & Deals', to: '/admin/coupons', icon: TicketPercent },
        { label: 'Enquiries & Leads', to: '/admin/enquiries', icon: MessageSquare },
        { label: t('admin_reports') || 'Reports & Exports', to: '/admin/reports', icon: FileSpreadsheet },
        { label: 'FAQs & Content', to: '/admin/content', icon: HelpCircle },
        { label: 'Platform Settings', to: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col h-full transition-all duration-300 z-40 select-none ${
        isMobileOpen
          ? 'fixed inset-y-0 left-0 w-64 shadow-2xl translate-x-0'
          : 'fixed inset-y-0 left-0 w-64 -translate-x-full md:relative md:translate-x-0'
      } ${
        isCollapsed ? 'md:w-20' : 'md:w-64'
      }`}
    >
      {/* Brand & Workspace Area */}
      <div className="h-20 flex items-center px-4 border-b border-slate-800/80 shrink-0">
        {!isCollapsed ? (
          <Link to="/admin" className="flex items-center gap-3 group min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shrink-0">
              <img src="/bm-logo.png" alt="BM Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-black text-sm tracking-tight leading-none block truncate">
                <span className="text-amber-400">Balumuni</span>{' '}
                <span className="text-white">and</span>{' '}
                <span className="text-amber-400">Associates</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block mt-1">
                Admin Console
              </span>
            </div>
          </Link>
        ) : (
          <Link to="/admin" className="mx-auto" title="Balumuni and Associates Admin">
            <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
              <img src="/bm-logo.png" alt="BM Logo" className="w-full h-full object-contain" />
            </div>
          </Link>
        )}
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {group.groupTitle}
              </p>
            )}
            {isCollapsed && groupIdx > 0 && (
              <div className="w-8 h-px bg-slate-800 mx-auto my-2" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/20 font-bold border-l-4 border-accent'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      } ${isCollapsed ? 'justify-center px-0 h-10' : ''}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-accent group-hover:scale-110 transition-transform" />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Area: Public Link, Language Toggle, and Log Out */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-1.5 shrink-0">
        <button
          onClick={toggleLanguage}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-accent bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 transition-smooth ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Toggle Tamil / English"
        >
          <div className="flex items-center gap-2.5">
            <Languages className="w-4 h-4 text-accent shrink-0" />
            {!isCollapsed && <span>{isTamil ? 'தமிழ் இடைமுகம்' : 'Tamil View'}</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent uppercase font-black">
              {isTamil ? 'தமிழ்' : 'EN'}
            </span>
          )}
        </button>

        <Link
          to="/"
          target="_blank"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-smooth ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'View Public Site' : undefined}
        >
          <ExternalLink className="w-4 h-4 text-accent shrink-0" />
          {!isCollapsed && <span>View Storefront</span>}
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/50 hover:border-rose-900 border border-transparent transition-smooth ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'Log Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};
