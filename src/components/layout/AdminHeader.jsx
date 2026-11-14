import React from 'react';
import { Menu, Bell, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BackButton } from '../common/BackButton';

export const AdminHeader = ({ title = 'Dashboard Overview', subtitle, onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-smooth"
        >
          <Menu className="w-5 h-5" />
        </button>
        <BackButton inline label="Back" fallbackPath="/admin" />
        <div>
          <h1 className="text-xl font-bold text-navy">{title}</h1>
          {subtitle && <p className="text-xs text-secondaryText">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-lightBlue border border-blue-200 text-xs font-semibold text-primary">
          <Shield className="w-3.5 h-3.5" />
          <span>Admin Authorization Active</span>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={user?.name}
            className="w-9 h-9 rounded-full object-cover border border-primary/30"
          />
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-darkText leading-tight">{user?.name}</p>
            <p className="text-[10px] uppercase font-bold text-accent-hover tracking-wider">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
