import React from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, User, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Spinner } from '../components/common/Spinner';

export const CustomerLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pageBg">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const tabs = [
    { label: 'User Dashboard', to: '/customer', icon: LayoutDashboard, end: true },
    { label: 'My Orders', to: '/customer/bookings', icon: Calendar },
    { label: 'Payment History', to: '/customer/payments', icon: CreditCard },
    { label: 'Account Profile', to: '/customer/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-pageBg">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Customer Header Banner */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-sm"
            />
            <div>
              <h1 className="text-2xl font-black text-navy">{user.name}</h1>
              <p className="text-sm text-secondaryText">{user.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Customer Account
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-smooth ${
                      isActive
                        ? 'bg-navy text-white shadow-sm'
                        : 'text-slate-600 hover:text-darkText hover:bg-slate-200/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-accent" />
                  <span>{tab.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Content Outlet with smooth page transition */}
        <div key={location.pathname} className="animate-fadeIn">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
};
