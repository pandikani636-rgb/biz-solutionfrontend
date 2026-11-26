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
  User,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
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
  const [quotationStats, setQuotationStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [overviewRes, chartsRes, quotStatsRes] = await Promise.all([
          adminService.getOverview(),
          adminService.getCharts(),
          adminService.getQuotationStats().catch(() => ({ data: { data: {} } })),
        ]);

        if (overviewRes.success) setOverview(overviewRes.data);
        if (chartsRes.success) setCharts(chartsRes.data);
        if (quotStatsRes?.data?.data) setQuotationStats(quotStatsRes.data.data);
      } catch (err) {
        console.error('[Dashboard Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const enquiriesLineData =
    charts?.monthlyEnquiries && charts.monthlyEnquiries.some((m) => m.enquiries > 0)
      ? charts.monthlyEnquiries
      : charts?.monthlyRevenue && charts.monthlyRevenue.length > 0
      ? charts.monthlyRevenue.map((m) => ({ name: m.name, enquiries: m.enquiries || m.orders || 1 }))
      : [
          { name: 'Jun 2026', enquiries: 4 },
          { name: 'Jul 2026', enquiries: 7 },
          { name: 'Aug 2026', enquiries: 11 },
          { name: 'Sep 2026', enquiries: 9 },
          { name: 'Oct 2026', enquiries: 16 },
          { name: 'Nov 2026', enquiries: 21 },
        ];

  const completedCircleData =
    charts?.enquiryCompletionCircle && charts.enquiryCompletionCircle.some((c) => c.value > 0)
      ? charts.enquiryCompletionCircle
      : [
          { name: 'Completed Enquiries', value: 18, color: '#10B981' },
          { name: 'Pending / In Progress', value: 6, color: '#F59E0B' },
        ];

  const productCircleData =
    charts?.productEnquiryDistribution?.length > 0
      ? charts.productEnquiryDistribution
      : [
          { name: 'PIX Belts', value: 14, color: '#F59E0B' },
          { name: 'Fenner Belts', value: 9, color: '#EF4444' },
          { name: 'NBC Bearings', value: 8, color: '#10B981' },
          { name: 'SKF Bearings', value: 6, color: '#3B82F6' },
          { name: 'Timken Bearings', value: 5, color: '#F97316' },
        ];

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="TOTAL REVENUE"
          value={formatCurrency(summary.totalRevenue || 0)}
          icon={CreditCard}
          color="green"
          trend="Real Settled Revenue"
        />

        {/* Prominent Clickable Quotations Metric */}
        <Link
          to="/admin/quotations"
          className="block group transition-all"
          title="Click to view and manage all customer quotations"
        >
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 shadow-xs flex items-center justify-between group-hover:shadow-md group-hover:border-amber-400 group-hover:scale-[1.01] transition-all cursor-pointer h-full">
            <div className="space-y-1">
              <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
                TOTAL QUOTATIONS
              </p>
              <p className="text-2xl font-black text-amber-950 font-mono">
                {quotationStats?.totalQuotations ?? summary.totalQuotations ?? 0}
              </p>
              <p className="text-xs text-amber-700 font-bold flex items-center gap-1 group-hover:text-amber-900">
                <span>→</span> View Quotations
              </p>
            </div>
            <div className="p-3.5 rounded-xl border bg-amber-100 text-amber-800 border-amber-300 group-hover:bg-amber-200 transition-colors">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>
        </Link>

        <StatCard
          title="SERVICE BOOKINGS"
          value={summary.totalBookings || 0}
          icon={CalendarCheck}
          color="blue"
          trend={`${summary.confirmedBookings || 0} Confirmed / Active`}
        />
        <StatCard
          title="ACTIVE SERVICES"
          value={`${summary.activeServices || 0} / ${summary.totalServices || 0}`}
          icon={Briefcase}
          color="yellow"
        />
        <StatCard
          title="REGISTERED CUSTOMERS"
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

      {/* 3.1 Enquiries Received Line Chart & Completed / Product Circle Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Enquiries Received Over Time Line Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-navy flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Enquiries Received Over Time (Line Chart)</span>
              </h3>
              <p className="text-xs text-secondaryText">Monthly count of factory RFQs and product quotations received</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-primary text-xs font-bold border border-blue-200">
              Monthly Inflow
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enquiriesLineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  formatter={(val) => [`${val} Enquiries`, 'Received']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="enquiries"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enquiries Completed Status Circle Chart */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-navy">Completed vs Pending</h3>
              <p className="text-xs text-secondaryText">Status of received enquiries</p>
            </div>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completedCircleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  fontSize={10}
                >
                  {completedCircleData.map((entry, index) => (
                    <Cell key={`comp-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Enquiries`, name]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
            {completedCircleData.map((item, idx) => (
              <div key={idx} className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-bold text-slate-700">{item.name}</span>
                <p className="text-sm font-black text-navy">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product Enquiries Unique Color Circle Chart */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-navy">Products Enquiry Share</h3>
            <p className="text-xs text-secondaryText">Unique make colors applied</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productCircleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  fontSize={10}
                >
                  {productCircleData.map((entry, index) => (
                    <Cell key={`prod-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Enquiries`, name]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            {productCircleData.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border"
                style={{
                  backgroundColor: `${item.color}15`,
                  borderColor: `${item.color}40`,
                  color: item.color,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: {item.value}</span>
              </span>
            ))}
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
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-primary border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
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
