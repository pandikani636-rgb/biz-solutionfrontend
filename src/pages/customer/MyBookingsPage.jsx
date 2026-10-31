import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Eye,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Modal } from '../../components/common/Modal';
import { showConfirmDialog, showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings({
        status: filterStatus || undefined,
      });
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      console.error('[Bookings Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const handleCancelBooking = async (bookingId) => {
    const confirmed = await showConfirmDialog(
      'Cancel Booking?',
      'Are you sure you want to cancel this booking? Cancellations are subject to terms.'
    );
    if (!confirmed) return;

    try {
      const res = await bookingService.cancelBooking(bookingId, 'Customer requested cancellation via portal');
      if (res.success) {
        showSuccessAlert('Booking Cancelled', 'Your booking status has been updated to cancelled.');
        fetchBookings();
      }
    } catch (err) {
      showErrorAlert('Cancellation Failed', err.message);
    }
  };

  const handleViewInvoice = async (bookingId) => {
    setIsInvoiceModalOpen(true);
    setInvoiceLoading(true);
    try {
      const res = await bookingService.getInvoiceByBookingId(bookingId);
      if (res.success) {
        setInvoiceData(res.data);
      }
    } catch (err) {
      showErrorAlert('Invoice Error', err.message);
    } finally {
      setInvoiceLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {['', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-smooth ${
                filterStatus === st
                  ? 'bg-navy text-accent shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st ? st.replace('_', ' ') : 'All Orders'}
            </button>
          ))}
        </div>

        <Link to="/services">
          <Button variant="accent" size="sm">
            + Book New Service
          </Button>
        </Link>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusClass = getStatusBadgeClass(booking.status);
            return (
              <div
                key={booking._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-smooth flex flex-col md:flex-row justify-between gap-6 items-start md:items-center"
              >
                {/* Left: Service details */}
                <div className="flex items-start gap-4">
                  <img
                    src={
                      booking.serviceSnapshot?.mainImage ||
                      booking.service?.mainImage ||
                      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={booking.serviceSnapshot?.name}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-navy bg-lightBlue px-2 py-0.5 rounded">
                        #{booking.bookingNumber}
                      </span>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusClass}`}
                      >
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-base md:text-lg text-darkText">
                      {booking.serviceSnapshot?.name}
                    </h3>
                    <p className="text-xs text-secondaryText">
                      Package: <strong>{booking.packageSnapshot?.name}</strong> • Booked on {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Right: Pricing & Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 gap-4">
                  <div>
                    <p className="text-xs text-secondaryText text-right hidden md:block">
                      Total Paid Amount
                    </p>
                    <p className="text-xl font-black text-navy text-right">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewInvoice(booking._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-darkText transition-smooth"
                    >
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>Invoice</span>
                    </button>

                    <Link to={`/customer/bookings/${booking._id}`}>
                      <Button variant="secondary" size="sm">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>Tracking</span>
                      </Button>
                    </Link>

                    {['pending', 'confirmed'].includes(booking.status) && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-danger hover:bg-rose-50 transition-smooth"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-darkText">No Bookings Found</h3>
          <p className="text-xs text-secondaryText max-w-sm mx-auto">
            You don't have any bookings matching this status. Explore our catalog to book your first service!
          </p>
          <Link to="/services">
            <Button variant="accent">Explore Services</Button>
          </Link>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Official GST Tax Invoice"
        maxWidth="max-w-3xl"
      >
        {invoiceLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : invoiceData ? (
          <div className="space-y-6 text-darkText p-2 print:p-0">
            {/* Invoice Header */}
            <div className="flex justify-between items-start pb-6 border-b border-slate-200">
              <div>
                <span className="text-2xl font-black text-navy">
                  Biz<span className="text-primary">Zolution</span>
                </span>
                <p className="text-xs text-secondaryText mt-1">
                  Tax Invoice • GSTIN: 29AABCU9603R1ZM
                </p>
                <p className="text-xs text-secondaryText">Tech Innovation Park, Bangalore</p>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-lg font-mono font-black text-navy">
                  {invoiceData.invoiceNumber}
                </span>
                <p className="text-xs text-secondaryText">Date: {formatDate(invoiceData.issuedDate)}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {invoiceData.paymentStatus}
                </span>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-navy uppercase text-[10px] tracking-wider">Billed To:</p>
                <p className="font-bold text-darkText mt-1">{invoiceData.customer?.name}</p>
                <p className="text-secondaryText">{invoiceData.customer?.email}</p>
                <p className="text-secondaryText">{invoiceData.customer?.phone}</p>
              </div>
              <div>
                <p className="font-bold text-navy uppercase text-[10px] tracking-wider">Payment Method:</p>
                <p className="font-semibold text-darkText mt-1">{invoiceData.paymentMethod}</p>
                <p className="text-secondaryText">Status: Verified & Settled</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-navy font-bold">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoiceData.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium">{item.description}</td>
                      <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-bold">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-secondaryText">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-darkText">{formatCurrency(invoiceData.subtotal)}</span>
                </div>
                {invoiceData.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span>-{formatCurrency(invoiceData.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-secondaryText">
                  <span>GST ({invoiceData.taxRate}%):</span>
                  <span className="font-semibold text-darkText">{formatCurrency(invoiceData.taxAmount)}</span>
                </div>
                <div className="h-px bg-slate-200 my-1" />
                <div className="flex justify-between text-sm font-black text-navy pt-1">
                  <span>Total Paid:</span>
                  <span>{formatCurrency(invoiceData.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Print button */}
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                🖨️ Print Invoice
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
