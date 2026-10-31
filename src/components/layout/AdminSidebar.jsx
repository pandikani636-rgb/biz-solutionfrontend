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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const AdminSidebar = ({ isCollapsed, onToggle }) => {
  const { logout, user } = useAuth();
  const { isTamil, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: t('admin_dashboard') || 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: t('admin_quotations') || 'Quotations & RFQs', to: '/admin/quotations', icon: FileCheck },
    { label: t('admin_orders') || 'Orders & Invoices', to: '/admin/bookings', icon: CalendarCheck },
    { label: t('admin_customers') || 'Customers & Rates', to: '/admin/customers', icon: Users },
    { label: t('admin_user_uploads') || 'User Uploaded Images', to: '/admin/user-uploads', icon: Camera },
    { label: t('admin_pdf_catalog') || 'PDF Catalog Import', to: '/admin/pdf-catalog', icon: FileUp },
    { label: t('admin_reports') || 'Reports & Export', to: '/admin/reports', icon: FileSpreadsheet },
    { label: 'Products & Services', to: '/admin/services', icon: Briefcase },
    { label: 'Categories', to: '/admin/categories', icon: Layers },
    { label: 'Packages', to: '/admin/packages', icon: Package },
    { label: 'Transactions', to: '/admin/payments', icon: CreditCard },
    { label: 'Hero Banners', to: '/admin/banners', icon: ImageIcon },
    { label: 'Coupons & Offers', to: '/admin/coupons', icon: TicketPercent },
    { label: 'Enquiries', to: '/admin/enquiries', icon: MessageSquare },
    { label: 'FAQs & Reviews', to: '/admin/content', icon: HelpCircle },
    { label: 'Platform Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <aside
      className={`bg-navy text-white flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Area */}
        <div className="h-20 flex items-center px-6 border-b border-navy-light/40 justify-between">
          {!isCollapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <Layers className="w-5 h-5 text-accent" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Biz<span className="text-accent">Admin</span>
              </span>
            </Link>
          )}

          {isCollapsed && (
            <div className="mx-auto w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Layers className="w-6 h-6 text-accent" />
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-smooth ${
                    isActive
                      ? 'bg-primary text-white shadow-md border-l-4 border-accent'
                      : 'text-slate-300 hover:bg-navy-light/40 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 text-accent" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: User Profile & Public Site Shortcut */}
      <div className="p-3 border-t border-navy-light/40 space-y-2">
        <button
          onClick={toggleLanguage}
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-accent bg-navy-light/60 hover:bg-navy-light transition-smooth ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Toggle Tamil / English Language"
        >
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-accent shrink-0" />
            {!isCollapsed && <span>{isTamil ? 'தமிழ் இடைமுகம்' : 'Tamil Mode'}</span>}
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
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-navy-light/40 transition-smooth"
        >
          <ExternalLink className="w-4 h-4 text-accent" />
          {!isCollapsed && <span>View Public Site</span>}
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/40 transition-smooth"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};
