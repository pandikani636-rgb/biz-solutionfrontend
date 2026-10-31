import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/cards/StatCard';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';

const PIE_COLORS = ['#2563EB', '#FACC15', '#16A34A', '#DC2626', '#8B5CF6', '#EC4899'];

export const AdminDashboardOverview = () => {
  const [overview, setOverview] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [overviewRes, chartsRes] = await Promise.all([
          adminService.getOverview(),
          adminService.getCharts(),
        ]);

        if (overviewRes.success) setOverview(overviewRes.data);
        if (chartsRes.success) setCharts(chartsRes.data);
      } catch (err) {
        console.error('[Dashboard Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const summary = overview?.summary || {};

  return (
    <div className="space-y-8">
      {/* 1. Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Net Revenue"
          value={formatCurrency(summary.totalRevenue || 0)}
          icon={CreditCard}
          color="green"
          trend="Real DB Settled Revenue"
        />
        <StatCard
          title="Total Service Bookings"
          value={summary.totalBookings || 0}
          icon={CalendarCheck}
          color="blue"
          trend={`${summary.confirmedBookings || 0} Confirmed / Active`}
        />
        <StatCard
          title="Active Services"
          value={`${summary.activeServices || 0} / ${summary.totalServices || 0}`}
          icon={Briefcase}
          color="yellow"
        />
        <StatCard
          title="Registered Customers"
          value={summary.totalCustomers || 0}
          icon={Users}
          color="purple"
        />
      </div>

      {/* 2. Secondary Metrics Microbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        <div className="p-2">
          <span className="text-secondaryText">Pending Orders:</span>
          <p className="font-extrabold text-amber-600 text-lg">{summary.pendingBookings || 0}</p>
        </div>
        <div className="p-2">
          <span className="text-secondaryText">Completed Orders:</span>
          <p className="font-extrabold text-emerald-600 text-lg">{summary.completedBookings || 0}</p>
        </div>
        <div className="p-2">
          <span className="text-secondaryText">Cancelled / Refunded:</span>
          <p className="font-extrabold text-rose-600 text-lg">
            {summary.cancelledBookings || 0} ({formatCurrency(summary.totalRefunds || 0)})
          </p>
        </div>
        <div className="p-2">
          <span className="text-secondaryText">Customer Enquiries:</span>
          <p className="font-extrabold text-navy text-lg">{summary.totalEnquiries || 0}</p>
        </div>
      </div>

      {/* 3. Recharts Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Growth Trend Area Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-navy">Revenue Trend (Last 6 Months)</h3>
              <p className="text-xs text-secondaryText">Aggregated from verified payment transactions</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-lightBlue text-primary text-xs font-bold">
              Database Aggregate
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            {charts?.monthlyRevenue && charts.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Revenue']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-secondaryText">
                Insufficient monthly transaction history for chart rendering.
              </div>
            )}
          </div>
        </div>

        {/* Category & Service Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-navy">Top Services Share</h3>
          <p className="text-xs text-secondaryText">Distribution by order volume</p>

          <div className="h-64 w-full">
            {charts?.serviceDistribution && charts.serviceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.serviceDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    fontSize={10}
                  >
                    {charts.serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} bookings`, name]}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-secondaryText">
                No booking share recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Recent Bookings & Registered Customers Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Bookings */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-navy">Recent Customer Bookings</h3>
            <Link to="/admin/bookings" className="text-xs font-bold text-primary hover:underline">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-navy font-bold">
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview?.recentBookings?.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-primary">
                      #{b.bookingNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-darkText">
                      {b.customer?.name || 'Guest'}
                    </td>
                    <td className="py-2.5 px-3 text-secondaryText">
                      {b.serviceSnapshot?.name || 'Service'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-navy">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                          b.status
                        )}`}
                      >
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-navy">Recent Customers</h3>
            <Link to="/admin/customers" className="text-xs font-bold text-primary hover:underline">
              Manage →
            </Link>
          </div>

          <div className="space-y-3">
            {overview?.recentCustomers?.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-darkText">{c.name}</p>
                    <p className="text-[11px] text-secondaryText">{c.email}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
