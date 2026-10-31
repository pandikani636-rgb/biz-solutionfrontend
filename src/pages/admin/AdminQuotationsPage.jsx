import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  Building2,
  Mail,
  Phone,
  Send,
  AlertCircle,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';

export const AdminQuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Approval Modal
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [approvedPrice, setApprovedPrice] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  // Rejection Modal
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/enquiries', {
        params: {
          type: 'rfq',
          page,
          limit: 15,
          search: search.trim() || undefined,
          status: statusFilter || undefined,
        },
      });

      if (res.data?.success) {
        setQuotations(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('[Quotations Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter, page]);

  const handleOpenApproveModal = (q) => {
    setSelectedQuotation(q);
    setApprovedPrice(q.approvedPrice || q.targetPrice || 0);
    setAdminNotes(q.internalNotes || '');
    setReplyMessage(
      `We have approved your quotation for ${q.partNumber || 'requested items'}. Official GST tax invoice and Delhivery dispatch will proceed upon confirmation.`
    );
    setIsApproveModalOpen(true);
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setApproving(true);
    try {
      const res = await api.patch(`/enquiries/${selectedQuotation._id}/approve`, {
        approvedPrice,
        adminNotes,
        replyMessage,
      });

      if (res.data?.success) {
        showSuccessAlert(
          'Quotation Approved!',
          'The customer has been notified: "Your quotation has been approved!" and an email notification has been dispatched.'
        );
        setIsApproveModalOpen(false);
        fetchQuotations();
      }
    } catch (err) {
      showErrorAlert('Approval Error', err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleOpenRejectModal = (q) => {
    setSelectedQuotation(q);
    setRejectionReason('Requested part or specifications currently out of stock / discontinued by OEM.');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setRejecting(true);
    try {
      const res = await api.patch(`/enquiries/${selectedQuotation._id}/reject`, {
        reason: rejectionReason,
        adminNotes,
      });

      if (res.data?.success) {
        showSuccessAlert('Quotation Rejected', 'Customer has been notified of the status update.');
        setIsRejectModalOpen(false);
        fetchQuotations();
      }
    } catch (err) {
      showErrorAlert('Rejection Error', err.message);
    } finally {
      setRejecting(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'in_progress':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <span>Customer Quotation & RFQ Approval Center</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Review customer quotation submissions, set approved wholesale pricing, and dispatch automated status notifications.
          </p>
        </div>

        <span className="text-xs font-bold bg-lightBlue text-primary px-3 py-1.5 rounded-xl border border-blue-200">
          Total Quotations: {pagination.total}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search quotation #, part #, company, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchQuotations()}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
          />
          <Button variant="secondary" size="sm" onClick={fetchQuotations}>
            Search
          </Button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="new">Pending Review (New)</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="in_progress">In Progress</option>
        </select>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : quotations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-navy font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Quotation Ref</th>
                  <th className="py-3 px-4">Client / Company</th>
                  <th className="py-3 px-4">Part # & Quantity</th>
                  <th className="py-3 px-4 text-right">Target Price</th>
                  <th className="py-3 px-4 text-right">Approved Price</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/70 transition-smooth">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {q.quotationNumber || `QTN-${formatDate(q.createdAt).slice(-4)}`}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-darkText">{q.name}</p>
                      <p className="text-[11px] text-secondaryText">
                        {q.companyName ? `${q.companyName} • ` : ''}{q.phone || q.email}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-navy">{q.partNumber || q.subject}</p>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Qty: {q.quantity || 1} Units ({q.brand || 'Multi-brand'})
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {q.targetPrice > 0 ? formatCurrency(q.targetPrice) : 'Best Wholesale'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-black text-navy text-sm">
                      {q.approvedPrice > 0 ? formatCurrency(q.approvedPrice) : '—'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(q.status)}`}>
                        {q.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-secondaryText">
                      {formatDate(q.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {q.status !== 'approved' && (
                        <button
                          onClick={() => handleOpenApproveModal(q)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-smooth shadow-xs"
                          title="Approve Quotation"
                        >
                          Approve
                        </button>
                      )}

                      {q.status !== 'rejected' && (
                        <button
                          onClick={() => handleOpenRejectModal(q)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition-smooth"
                          title="Reject Quotation"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-secondaryText">
            No quotation requests found matching criteria.
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title={`Approve Customer Quotation: ${selectedQuotation?.quotationNumber || selectedQuotation?.partNumber}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleApproveSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
            <p className="font-bold text-navy">{selectedQuotation?.name} ({selectedQuotation?.companyName || 'Individual'})</p>
            <p className="text-secondaryText">Part: {selectedQuotation?.partNumber} • Qty: {selectedQuotation?.quantity} Units</p>
            <p className="text-secondaryText">Target Price Submitted: ₹{selectedQuotation?.targetPrice || 'Market Best'}</p>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Official Approved Unit Price (₹)</label>
            <input
              type="number"
              min="1"
              required
              value={approvedPrice}
              onChange={(e) => setApprovedPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-base font-black text-navy bg-slate-50"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Message to Customer (included in email & notification)</label>
            <textarea
              rows={3}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-slate-50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              isLoading={approving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Confirm Approval & Notify Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Quotation Request"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Rejection Reason</label>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-slate-50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={rejecting}
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
