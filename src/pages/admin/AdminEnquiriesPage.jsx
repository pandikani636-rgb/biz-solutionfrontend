import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Mail, CheckCircle2, Send, Clock, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { formatDateTime, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';

export const AdminEnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await adminService.getEnquiries({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        limit: 50,
      });
      if (res.success) {
        setEnquiries(res.data || []);
      }
    } catch (err) {
      console.error('[Enquiries Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, typeFilter]);

  const handleOpenDetail = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setNewStatus(enquiry.status);
    setInternalNotes(enquiry.internalNotes || '');
    setReplyMessage('');
    setIsModalOpen(true);
  };

  const handleSaveEnquiry = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await adminService.updateEnquiryStatus(selectedEnquiry._id, {
        status: newStatus,
        internalNotes,
        replyMessage: replyMessage.trim() || undefined,
      });
      showSuccessAlert('Enquiry Updated', 'Status and response have been recorded.');
      setIsModalOpen(false);
      fetchEnquiries();
    } catch (err) {
      showErrorAlert('Error', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id, subject) => {
    const confirmed = await showConfirmDialog(`Delete enquiry "${subject}"?`, 'This cannot be undone.');
    if (!confirmed) return;

    try {
      await adminService.deleteEnquiry(id);
      showSuccessAlert('Deleted', 'Enquiry deleted.');
      fetchEnquiries();
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Customer Contact Enquiries</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Review incoming questions, update support resolution statuses, and dispatch email responses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-navy"
          >
            <option value="">All Types</option>
            <option value="ticket_booking">✈️/🚆 Travel Bookings</option>
            <option value="rfq">RFQ Quotations</option>
            <option value="general">General Enquiries</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <input
            type="text"
            placeholder="Search subject or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchEnquiries()}
            className="w-full sm:w-56 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : enquiries.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-navy font-bold">
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Subject &amp; Details</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.map((enq) => (
                <tr key={enq._id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-darkText">{enq.name}</p>
                      {enq.enquiryType === 'rfq' && (
                        <span className="bg-amber-100 text-amber-900 font-black text-[9px] px-1.5 py-0.2 rounded border border-amber-300">
                          RFQ
                        </span>
                      )}
                      {enq.enquiryType === 'ticket_booking' && (
                        <span className="bg-emerald-100 text-emerald-900 font-black text-[9px] px-1.5 py-0.2 rounded border border-emerald-300">
                          ✈️/🚆 Travel Booking
                        </span>
                      )}
                    </div>
                    <p className="text-secondaryText">{enq.email}</p>
                    {enq.companyName && <p className="text-primary font-semibold">{enq.companyName}</p>}
                    {enq.phone && <p className="text-slate-400">{enq.phone}</p>}
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-semibold text-navy line-clamp-1">{enq.subject}</p>
                    {enq.partNumber && (
                      <p className="text-xs font-mono font-bold text-emerald-700">
                        Parts: {enq.partNumber} ({enq.quantity || 1} pcs)
                      </p>
                    )}
                    <p className="text-secondaryText line-clamp-1 mt-0.5">{enq.message}</p>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                        enq.status
                      )}`}
                    >
                      {enq.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-secondaryText">{formatDate(enq.createdAt)}</td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleOpenDetail(enq)}>
                        Review & Reply
                      </Button>
                      <button
                        onClick={() => handleDelete(enq._id, enq.subject)}
                        className="p-1.5 text-slate-400 hover:text-danger rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-xs text-secondaryText">No enquiries found.</div>
        )}
      </div>

      {/* Detail / Reply Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Customer Enquiry Resolution"
        maxWidth="max-w-2xl"
      >
        {selectedEnquiry && (
          <form onSubmit={handleSaveEnquiry} className="space-y-4 text-xs text-darkText">
            <div className="p-3.5 bg-slate-50 rounded-2xl border space-y-1">
              <div className="flex justify-between font-bold text-navy text-sm">
                <span>{selectedEnquiry.subject}</span>
                <span className="text-xs text-secondaryText font-normal">
                  {formatDateTime(selectedEnquiry.createdAt)}
                </span>
              </div>
              <p className="text-secondaryText">
                From: <strong>{selectedEnquiry.name}</strong> ({selectedEnquiry.email}) • Phone: {selectedEnquiry.phone || 'N/A'}
              </p>
              <div className="pt-2 border-t mt-2 text-darkText leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap font-sans text-xs sm:text-sm shadow-inner">
                {selectedEnquiry.message}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-darkText">Workflow Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold capitalize"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-darkText">Internal Admin Note</label>
                <input
                  type="text"
                  placeholder="Private note for staff"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-darkText">Email Reply Message to Customer</label>
              <textarea
                rows={4}
                placeholder="Compose direct response that will be sent to the customer's email..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={modalLoading}>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>Save & Dispatch Reply</span>
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
