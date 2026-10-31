import React from 'react';

export const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-primary border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-secondaryText uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-extrabold text-navy">{value}</p>
        {trend && (
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span>↑</span> {trend}
          </p>
        )}
      </div>

      {Icon && (
        <div className={`p-3.5 rounded-xl border ${colors[color] || colors.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};
