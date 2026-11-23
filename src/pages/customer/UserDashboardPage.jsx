import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  FileText,
  Printer,
  Eye,
  Bell,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Tag,
  Layers,
  ShoppingBag,
  Package,
  RotateCw,
  Ticket,
  TrainFront,
  Plane,
  Bus,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { bookingService } from '../../services/bookingService';
import { ticketBookingService } from '../../services/ticketBookingService';
import api from '../../services/api';
import { formatCurrency, formatDate, formatDateTime, getStatusBadgeClass } from '../../utils/formatters';
import { getProductImageUrl } from '../../utils/productImages';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Modal } from '../../components/common/Modal';
import { BalumuniInvoice } from '../../components/common/BalumuniInvoice';
import { showConfirmDialog, showSuccessAlert, showErrorAlert } from '../../utils/alerts';

export const UserDashboardPage = () => {
  const { user } = useAuth();
  const { isTamil, t } = useLanguage();

  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [ticketBookings, setTicketBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [invoiceData, setInvoiceData] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, notifRes, quotationsRes, ticketRes] = await Promise.all([
        bookingService.getMyBookings({ limit: 50 }),
        api.get('/notifications?limit=10').catch(() => ({ data: { success: true, data: [] } })),
        api.get('/enquiries/my-quotations').catch(() => ({ data: { success: true, data: [] } })),
        ticketBookingService.getMine().catch(() => ({ data: { success: true, data: [] } })),
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.data || []);
      if (notifRes.data?.success) setNotifications(notifRes.data.data || []);
      if (quotationsRes.data?.success) setQuotations(quotationsRes.data.data || []);
      if (ticketRes.data?.success) setTicketBookings(ticketRes.data.data || []);
    } catch (err) {
      console.error('[Dashboard Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute Dashboard Statistics & Product Totals
  const totalOrders = bookings.length;
  const pendingOrders = bookings.filter((b) => b.status === 'pending').length;
  const confirmedOrders = bookings.filter((b) => ['confirmed', 'in_progress', 'completed'].includes(b.status)).length;
  const totalAmountPaid = bookings
    .filter((b) => b.paymentStatus === 'paid' || ['confirmed', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Total individual product units ordered across all bookings & quotations
  const totalProductUnitsOrdered = useMemo(() => {
    const bookingUnits = bookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
    const quotationUnits = quotations.reduce((sum, q) => sum + (Number(q.quantity) || 1), 0);
    return bookingUnits + quotationUnits;
  }, [bookings, quotations]);

  // Extract previously ordered unique products
  const previouslyOrderedProducts = useMemo(() => {
    const map = new Map();

    bookings.forEach((b) => {
      const partKey = (
        b.serviceSnapshot?.partNumber ||
        b.serviceSnapshot?.name ||
        b._id
      ).toLowerCase().trim();

      if (!map.has(partKey)) {
        map.set(partKey, {
          id: b.serviceSnapshot?._id || b._id,
          name: b.serviceSnapshot?.name || 'Industrial Part',
          partNumber: b.serviceSnapshot?.partNumber || b.serviceSnapshot?.name || 'Industrial Part',
          brand: b.serviceSnapshot?.brand || 'PIX',
          category: b.serviceSnapshot?.category?.name || b.serviceSnapshot?.categoryName || 'Power Transmission',
          image: getProductImageUrl(b.serviceSnapshot),
          lastPrice: b.totalAmount,
          totalQuantity: b.quantity || 1,
          lastOrderedDate: b.createdAt,
          slug: b.serviceSnapshot?.slug || '',
          orderCount: 1,
          lastBookingNumber: b.bookingNumber,
        });
      } else {
        const existing = map.get(partKey);
        existing.totalQuantity += (b.quantity || 1);
        existing.orderCount += 1;
        if (new Date(b.createdAt) > new Date(existing.lastOrderedDate)) {
          existing.lastOrderedDate = b.createdAt;
          existing.lastPrice = b.totalAmount;
          existing.lastBookingNumber = b.bookingNumber;
        }
      }
    });

    // Also include from direct quotation / PDF orders
    quotations.forEach((q) => {
      if (q.partNumber) {
        const partKey = q.partNumber.toLowerCase().trim();
        if (!map.has(partKey)) {
          map.set(partKey, {
            id: q._id,
            name: q.partNumber,
            partNumber: q.partNumber,
            brand: q.brand || 'PIX',
            category: 'PDF Catalog Part',
            image: '/belts/PIX C 70 Classical V-Belt.jpg',
            lastPrice: q.targetPrice || 0,
            totalQuantity: Number(q.quantity) || 1,
            lastOrderedDate: q.createdAt,
            slug: q.partNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            orderCount: 1,
            lastBookingNumber: q.quotationNumber,
          });
        }
      }
    });

    return Array.from(map.values());
  }, [bookings, quotations]);

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = !statusFilter || b.status === statusFilter;
    const query = search.toLowerCase().trim();
    const matchesQuery =
      !query ||
      b.bookingNumber.toLowerCase().includes(query) ||
      (b.serviceSnapshot?.name && b.serviceSnapshot.name.toLowerCase().includes(query)) ||
      (b.packageSnapshot?.name && b.packageSnapshot.name.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  const handleOpenInvoice = async (bookingId) => {
    setIsInvoiceModalOpen(true);
    setInvoiceLoading(true);
    try {
      const res = await bookingService.getInvoiceByBookingId(bookingId);
      if (res.success && res.data) {
        setInvoiceData(res.data);
      }
    } catch (err) {
      showErrorAlert('Invoice Error', err.message);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleOpenDetail = (booking) => {
    setSelectedBookingDetail(booking);
    setIsDetailModalOpen(true);
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmed = await showConfirmDialog(
      'Cancel Order?',
      'Are you sure you want to cancel this order? This action cannot be reversed.'
    );
    if (!confirmed) return;

    try {
      const res = await bookingService.cancelBooking(bookingId, 'Customer cancelled via dashboard');
      if (res.success) {
        showSuccessAlert('Order Cancelled', 'Your order status has been updated.');
        fetchDashboardData();
      }
    } catch (err) {
      showErrorAlert('Cancellation Failed', err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isNewUserRate = Boolean(user?.isNewUser || user?.pricingTier === 'new_user');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Customer Welcome & Rate Tier Status Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-navy text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
              Customer Command Center
            </span>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full border ${
                isNewUserRate
                  ? 'bg-amber-500/30 text-amber-300 border-amber-400/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
              }`}
            >
              {isNewUserRate
                ? `New User Rate (+${user?.markupPercentage ?? 5}%)`
                : 'Standard Wholesale Rate (0% Surcharge)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome Back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor live order statuses, review Balumuni & Associates GST invoices, and track delivery milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/services">
            <Button variant="accent" size="sm" className="font-bold inline-flex items-center gap-1.5 shadow-sm">
              <Layers className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Button>
          </Link>
          <Link to="/rfq">
            <Button variant="secondary" size="sm" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-bold inline-flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-accent" />
              <span>Request RFQ</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Statistics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products Ordered */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2 hover:shadow-md transition-smooth">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondaryText uppercase tracking-wider">
              {isTamil ? 'மொத்த தயாரிப்புகள்' : 'Total Products Ordered'}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-primary">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-black text-navy">{totalProductUnitsOrdered}</p>
            <span className="text-xs font-bold text-slate-500">Units</span>
          </div>
          <p className="text-[11px] text-primary font-bold">
            {previouslyOrderedProducts.length} distinct product make(s)
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2 hover:shadow-md transition-smooth">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondaryText uppercase tracking-wider">
              {isTamil ? 'நிலுவையில் உள்ள ஆர்டர்கள்' : 'Pending Verification'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-amber-600">{pendingOrders}</p>
          <p className="text-[11px] text-amber-700 font-semibold">Under verification by engineering desk</p>
        </div>

        {/* Confirmed Orders */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2 hover:shadow-md transition-smooth">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondaryText uppercase tracking-wider">
              {isTamil ? 'உறுதி செய்யப்பட்ட ஆர்டர்கள்' : 'Confirmed Orders'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-600">{confirmedOrders}</p>
          <p className="text-[11px] text-emerald-700 font-semibold">Dispatched or active in transit</p>
        </div>

        {/* Total Amount Paid */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2 hover:shadow-md transition-smooth">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondaryText uppercase tracking-wider">
              {isTamil ? 'செலுத்தப்பட்ட மொத்த தொகை' : 'Total Amount Paid'}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-navy">{formatCurrency(totalAmountPaid)}</p>
          <p className="text-[11px] text-slate-500">Includes 18% GST tax invoices</p>
        </div>
      </div>

      {/* 2.5 Previously Ordered Products Showcase */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-200 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-primary text-[10px] font-black uppercase tracking-wider mb-1 border border-blue-200">
              <RotateCw className="w-3 h-3" />
              <span>Purchase History &amp; Re-Order Desk</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-navy">
              Previously Ordered Industrial Products ({previouslyOrderedProducts.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant access to every component you've purchased previously. Re-order with 1-click at your negotiated rate!
            </p>
          </div>
          <Link to="/services">
            <Button variant="accent" size="sm" className="font-bold inline-flex items-center gap-1.5 shadow-xs text-xs">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Browse Full Catalog</span>
            </Button>
          </Link>
        </div>

        {previouslyOrderedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previouslyOrderedProducts.map((prod) => (
              <div
                key={prod.partNumber}
                className="bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200 hover:border-primary/50 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Thumbnail */}
                  <div className="h-32 w-full rounded-xl overflow-hidden bg-white border border-slate-200/80 p-2 flex items-center justify-center">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/belts/PIX C 70 Classical V-Belt.jpg';
                      }}
                    />
                  </div>

                  {/* Badges */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                      {prod.brand}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-primary border border-blue-200 truncate max-w-[120px]">
                      {prod.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-navy group-hover:text-primary transition-colors line-clamp-1">
                      {prod.partNumber}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{prod.name}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-slate-200/70 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Total Purchased:</span>
                      <strong className="text-navy font-bold font-mono">{prod.totalQuantity} Units</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Order Frequency:</span>
                      <span className="font-semibold">{prod.orderCount} order{prod.orderCount > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>Last Order:</span>
                      <span>{formatDate(prod.lastOrderedDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center gap-2">
                  <Link
                    to={prod.slug ? `/services/${prod.slug}` : `/services?search=${encodeURIComponent(prod.partNumber)}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Re-Order Part</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-500 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Package className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700">No previous orders recorded yet</p>
            <p>Once you place your first order or quote from our PDF catalog, all ordered components will appear here for 1-click re-ordering.</p>
            <Link to="/services">
              <Button variant="primary" size="sm" className="mt-2 text-xs font-bold">
                Browse Products
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 3. Notifications & Recent Updates Bar */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent fill-accent" />
              <span>{isTamil ? 'அறிவிப்புகள் & ஆர்டர் புதுப்பிப்புகள்' : 'Recent Notifications & Order Confirmations'}</span>
            </h3>
            <span className="text-xs text-secondaryText">{notifications.length} updates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {notifications.slice(0, 3).map((n) => (
              <div
                key={n._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 hover:bg-lightBlue/30 transition-smooth"
              >
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-xs text-navy">{n.title}</p>
                  <span className="text-[10px] text-slate-400">{formatDate(n.createdAt)}</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Complete Order History Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>{isTamil ? 'ஆர்டர் வரலாறு மற்றும் கண்காணிப்பு' : 'Order History & Status Tracking'}</span>
            </h2>
            <p className="text-xs text-secondaryText mt-0.5">
              Access individual order details, monitor dispatch status, and download Balumuni & Associates invoices.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search order #, part..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Product / Part</th>
                  <th className="py-3 px-4 text-center">Qty / Units</th>
                  <th className="py-3 px-4">Date Placed</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const statusClass = getStatusBadgeClass(b.status);
                  const catName = b.serviceSnapshot?.category?.name || b.serviceSnapshot?.categoryName;
                  return (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition-smooth">
                      <td className="py-3 px-4 font-mono font-bold text-navy">
                        #{b.bookingNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImageUrl(b.serviceSnapshot)}
                            alt={b.serviceSnapshot?.name || 'Product'}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/belts/PIX C 70 Classical V-Belt.jpg';
                            }}
                          />
                          <div>
                            {catName && (
                              <span className="text-[9px] font-black uppercase text-primary bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                {catName}
                              </span>
                            )}
                            <p className="font-bold text-darkText line-clamp-1">{b.serviceSnapshot?.name}</p>
                            <p className="text-[11px] text-secondaryText">{b.packageSnapshot?.name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-black text-navy bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {b.quantity || 1} Unit{b.quantity > 1 ? 's' : ''}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-secondaryText">
                        {formatDate(b.createdAt)}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-navy text-sm font-mono">
                        {formatCurrency(b.totalAmount)}
                        {b.newUserSurcharge > 0 && (
                          <span className="block text-[10px] text-amber-700 font-semibold font-sans">
                            +{formatCurrency(b.newUserSurcharge)} New User Rate
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusClass}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          b.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {b.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        {/* Balumuni Invoice Viewer Button */}
                        <button
                          onClick={() => handleOpenInvoice(b._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 text-darkText font-bold text-[11px] hover:bg-slate-100 transition-smooth"
                          title="Official Balumuni Invoice"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          <span>Invoice</span>
                        </button>

                        <button
                          onClick={() => handleOpenDetail(b)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy text-white font-bold text-[11px] hover:bg-primary transition-smooth"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        {['pending'].includes(b.status) && (
                          <button
                            onClick={() => handleCancelBooking(b._id)}
                            className="px-2 py-1 text-danger hover:bg-rose-50 rounded-lg text-[11px] font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-secondaryText space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-darkText text-sm">No orders matching your criteria</p>
            <p className="max-w-xs mx-auto">Explore our catalog of bearings, pulleys, and belts to place your order.</p>
            <Link to="/services">
              <Button variant="accent" size="sm">
                Explore Catalog
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 4.5 Direct PDF Catalog Orders & Quotation Requests Section */}
      {quotations.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1 border border-emerald-200">
                <FileSpreadsheet className="w-3 h-3" />
                <span>PDF Catalog Direct Bookings</span>
              </div>
              <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <span>PDF Catalog Orders &amp; RFQs ({quotations.length})</span>
              </h2>
              <p className="text-xs text-secondaryText mt-0.5">
                Quotations and direct orders submitted through the interactive PDF section explorer.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Quotation Ref</th>
                  <th className="py-3 px-4">Component / Part #</th>
                  <th className="py-3 px-4">Make</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Target Price</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4 text-center">Desk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/70 transition-smooth">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      #{(q.quotationNumber || 'QT-DIRECT').replace('QTN', 'QT')}
                    </td>
                    <td className="py-3 px-4 font-bold text-navy">
                      {q.partNumber || q.subject}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                        {q.brand || 'PIX'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-navy">
                      {q.quantity || 1}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-navy">
                      {q.targetPrice > 0 ? formatCurrency(q.targetPrice) : 'Standard Wholesale'}
                    </td>
                    <td className="py-3 px-4 text-secondaryText">
                      {formatDate(q.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                        {q.status || 'Under Review'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4.6 Travel Ticket Bookings (Train, Flight, Bus) Section */}
      {ticketBookings.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-primary text-[10px] font-black uppercase tracking-wider mb-1 border border-blue-200">
                <Ticket className="w-3 h-3" />
                <span>Travel Desk Bookings</span>
              </div>
              <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <span>My Train &amp; Flight Ticket Reservations ({ticketBookings.length})</span>
              </h2>
            </div>
            <Link to="/customer/ticket-bookings">
              <Button variant="secondary" size="sm" className="text-xs font-bold">
                View All Travel Tickets →
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Transport Mode</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Travel Date</th>
                  <th className="py-3 px-4 text-right">Fare Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ticketBookings.slice(0, 5).map((tb) => (
                  <tr key={tb._id} className="hover:bg-slate-50/70 transition-smooth">
                    <td className="py-3 px-4 font-mono font-bold text-navy">
                      #{tb.bookingReference || tb._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-bold capitalize text-primary flex items-center gap-1.5">
                      {tb.transportType === 'flight' ? <Plane className="w-3.5 h-3.5" /> : <TrainFront className="w-3.5 h-3.5" />}
                      <span>{tb.transportType || 'Train'}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-darkText">
                      {tb.fromCity || tb.origin} → {tb.toCity || tb.destination}
                    </td>
                    <td className="py-3 px-4 text-secondaryText">
                      {formatDate(tb.travelDate || tb.departureDate)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-navy">
                      {formatCurrency(tb.totalFare || tb.amount || 0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {tb.status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Official Balumuni Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Official Balumuni & Associates Invoice"
        maxWidth="max-w-4xl"
      >
        {invoiceLoading ? (
          <div className="py-16 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : invoiceData ? (
          <BalumuniInvoice
            invoice={invoiceData}
            onPrint={() => window.print()}
            onClose={() => setIsInvoiceModalOpen(false)}
          />
        ) : (
          <div className="p-8 text-center text-xs text-secondaryText">No invoice found for this order.</div>
        )}
      </Modal>

      {/* 6. Individual Order Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Order Specifications: #${selectedBookingDetail?.bookingNumber}`}
        maxWidth="max-w-2xl"
      >
        {selectedBookingDetail && (
          <div className="space-y-6 text-xs text-darkText">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border">
              <div>
                <span className="font-mono font-bold text-primary text-sm">
                  #{selectedBookingDetail.bookingNumber}
                </span>
                <p className="font-extrabold text-sm text-navy mt-0.5">
                  {selectedBookingDetail.serviceSnapshot?.name}
                </p>
                <p className="text-secondaryText">
                  Package: {selectedBookingDetail.packageSnapshot?.name}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadgeClass(selectedBookingDetail.status)}`}>
                  {selectedBookingDetail.status}
                </span>
                <p className="text-base font-black text-navy mt-1">
                  {formatCurrency(selectedBookingDetail.totalAmount)}
                </p>
              </div>
            </div>

            {/* Workflow Milestones */}
            <div className="space-y-3">
              <h4 className="font-bold text-navy uppercase text-[11px] tracking-wider">
                Workflow Progress & History
              </h4>
              <div className="space-y-2 border-l-2 border-primary/30 pl-4">
                {selectedBookingDetail.statusHistory?.map((s, idx) => (
                  <div key={idx} className="relative">
                    <span className="font-bold capitalize text-darkText">
                      {s.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      {formatDateTime(s.timestamp)}
                    </span>
                    {s.note && <p className="text-secondaryText mt-0.5">{s.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenInvoice(selectedBookingDetail._id);
                }}
                className="px-4 py-2 rounded-xl bg-navy text-accent font-bold text-xs hover:bg-primary hover:text-white transition-smooth"
              >
                View Balumuni Invoice →
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
