import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { bookingService } from '../../services/bookingService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency, formatDateTime, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';
import { BalumuniInvoice } from '../../components/common/BalumuniInvoice';

export const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);

  // Status Workflow Transition Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [statusModalLoading, setStatusModalLoading] = useState(false);

  // Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeBookingDetail, setActiveBookingDetail] = useState(null);

  // Balumuni Invoice Modal
  const [invoiceData, setInvoiceData] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const handleViewBalumuniInvoice = async (bookingId) => {
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

  const handleQuickConfirm = async (booking) => {
    try {
      await adminService.updateBookingStatus(booking._id, {
        status: 'confirmed',
        note: 'Order reviewed and confirmed by administrator',
      });
      showSuccessAlert(
        'Order Confirmed!',
        `Order #${booking.bookingNumber} has been confirmed. The customer has received the notification: "Your order has been confirmed!"`
      );
      fetchBookings();
    } catch (err) {
      showErrorAlert('Confirmation Error', err.message);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllBookings({
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
      });

      if (res.success) {
        setBookings(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('[Admin Bookings Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, paymentFilter, page]);

  const handleOpenStatusModal = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setStatusNote('');
    setInternalNotes(booking.internalNotes || '');
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setStatusModalLoading(true);
    try {
      await adminService.updateBookingStatus(selectedBooking._id, {
        status: newStatus,
        note: statusNote,
        internalNotes,
      });
      showSuccessAlert('Workflow Updated', `Booking #${selectedBooking.bookingNumber} transitioned to ${newStatus}.`);
      setIsStatusModalOpen(false);
      fetchBookings();
    } catch (err) {
      showErrorAlert('Transition Error', err.message);
    } finally {
      setStatusModalLoading(false);
    }
  };

  const handleViewDetails = async (bookingId) => {
    try {
      const res = await bookingService.getBookingById(bookingId);
      if (res.success) {
        setActiveBookingDetail(res.data);
        setIsDetailsModalOpen(true);
      }
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/v1/stats/export-bookings', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" />
            <span>Customer Booking Management</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Track workflow statuses, verify payment milestones, and coordinate delivery.
          </p>
        </div>

        <Button variant="secondary" onClick={handleExportCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
          <span>Export Bookings to CSV</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by booking # or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
            className="w-full text-xs font-medium focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-darkText focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-darkText focus:outline-none"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <Button variant="secondary" size="sm" onClick={fetchBookings}>
            Filter
          </Button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-navy font-bold">
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Service & Package</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      #{b.bookingNumber}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-darkText">{b.customer?.name || 'Customer'}</p>
                      <p className="text-[11px] text-secondaryText">{b.customer?.email}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-darkText">{b.serviceSnapshot?.name}</p>
                      <p className="text-[11px] text-primary font-bold">{b.packageSnapshot?.name}</p>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-navy">
                      {formatCurrency(b.totalAmount)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                          b.paymentStatus
                        )}`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                          b.status
                        )}`}
                      >
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        {/* 1-Click Order Confirmation (Requirement 6) */}
                        {b.status === 'pending' && (
                          <button
                            onClick={() => handleQuickConfirm(b)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs inline-flex items-center gap-1 transition-smooth"
                            title="Confirm order & notify customer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleViewBalumuniInvoice(b._id)}
                          className="px-2 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-[11px] font-bold inline-flex items-center gap-1 transition-smooth"
                          title="View Balumuni Invoice"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          <span>Invoice</span>
                        </button>

                        <button
                          onClick={() => handleViewDetails(b._id)}
                          className="p-1.5 text-slate-500 hover:text-navy rounded-lg hover:bg-slate-100"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenStatusModal(b)}
                          className="px-2 py-1 rounded-lg bg-navy text-accent text-[11px] font-bold hover:bg-navy-dark transition-smooth"
                        >
                          Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-secondaryText">No bookings found.</div>
        )}
      </div>

      {/* Status Workflow Transition Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Status: #${selectedBooking?.bookingNumber}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div className="p-3 bg-lightBlue rounded-xl border border-blue-200">
            <p className="text-secondaryText">Current Status:</p>
            <p className="font-bold text-navy uppercase text-sm">{selectedBooking?.status}</p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Select New Workflow Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-bold capitalize"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Status Update Note (Visible to Customer)</label>
            <input
              type="text"
              placeholder="e.g. Assigned executive has verified documents"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Internal Admin Notes (Private)</label>
            <textarea
              rows={2}
              placeholder="Confidential operational notes"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={statusModalLoading}>
              Update Workflow
            </Button>
          </div>
        </form>
      </Modal>

      {/* Full Booking Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`Order Details: #${activeBookingDetail?.bookingNumber}`}
        maxWidth="max-w-3xl"
      >
        {activeBookingDetail && (
          <div className="space-y-6 text-xs text-darkText">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
              <div>
                <p className="font-bold text-navy">Customer Info:</p>
                <p>{activeBookingDetail.customer?.name}</p>
                <p>{activeBookingDetail.customer?.email}</p>
                <p>{activeBookingDetail.customer?.phone}</p>
              </div>
              <div>
                <p className="font-bold text-navy">Financial Breakdown:</p>
                <p>Base: {formatCurrency(activeBookingDetail.baseAmount)}</p>
                <p>Add-ons: {formatCurrency(activeBookingDetail.addOnsTotal)}</p>
                <p>Tax: {formatCurrency(activeBookingDetail.taxAmount)} ({activeBookingDetail.taxRate}%)</p>
                <p className="font-black text-sm text-navy pt-1">
                  Total: {formatCurrency(activeBookingDetail.totalAmount)}
                </p>
              </div>
            </div>

            {/* Dynamic Form Data */}
            <div className="space-y-2">
              <h4 className="font-bold text-navy uppercase text-[11px]">Dynamic Form Submissions:</h4>
              <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                {Object.entries(activeBookingDetail.dynamicFormData || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-secondaryText capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="space-y-2">
              <h4 className="font-bold text-navy uppercase text-[11px]">Status Transition Log:</h4>
              <div className="space-y-1">
                {activeBookingDetail.statusHistory?.map((h, i) => (
                  <div key={i} className="flex justify-between p-2 rounded bg-slate-50 text-[11px]">
                    <span className="font-bold capitalize">{h.status.replace('_', ' ')}</span>
                    <span className="text-secondaryText">{formatDateTime(h.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Balumuni & Associates Invoice Viewer Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setInvoiceData(null);
        }}
        title="Balumuni & Associates – Official Tax Invoice"
        maxWidth="max-w-4xl"
      >
        {invoiceLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : invoiceData ? (
          <div className="overflow-x-auto p-2 bg-slate-100 rounded-xl">
            <BalumuniInvoice invoice={invoiceData} />
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-secondaryText">
            No invoice data found for this order.
          </div>
        )}
      </Modal>
    </div>
  );
};
