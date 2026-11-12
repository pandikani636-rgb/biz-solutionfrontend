import React, { useState, useEffect } from 'react';
import {
  HardHat,
  Search,
  RefreshCw,
  Building2,
  Calendar,
  IndianRupee,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Users,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';

export const AdminLabourInsurancePage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('pending');
  const [editNotes, setEditNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await adminService.getLabourInsuranceInquiries({
        status: statusFilter,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setInquiries(res.data || []);
      }
    } catch (err) {
      console.error('[Labour Insurance Error]', err);
      showErrorAlert('Load Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInquiries();
  };

  const handleOpenEdit = (item) => {
    setSelectedInquiry(item);
    setEditStatus(item.status);
    setEditNotes(item.adminNotes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    setSavingStatus(true);
    try {
      await adminService.updateLabourInsuranceStatus(selectedInquiry._id, {
        status: editStatus,
        adminNotes: editNotes,
      });
      showSuccessAlert('Status Updated', `Inquiry ${selectedInquiry.inquiryNumber} updated.`);
      setIsEditModalOpen(false);
      fetchInquiries();
    } catch (err) {
      showErrorAlert('Update Failed', err.message);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDelete = async (id, inquiryNumber) => {
    const confirmed = await showConfirmDialog(
      'Delete Application?',
      `Are you sure you want to delete inquiry ${inquiryNumber}?`
    );
    if (!confirmed) return;

    try {
      await adminService.deleteLabourInsuranceInquiry(id);
      showToast('Inquiry record deleted');
      fetchInquiries();
    } catch (err) {
      showErrorAlert('Delete Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-500" />
            <span>Labour Insurance Applications Desk</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Review company workforce insurance inquiries, underwriting quotes, and statutory policy status.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchInquiries}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Company, GSTIN, Email, Contact, or Ref #..."
            className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="contacted">Underwriter Contacted</option>
          <option value="quoted">Official Quote Sent</option>
          <option value="approved">Policy Issued / Active</option>
          <option value="rejected">Rejected / Ineligible</option>
        </select>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-800">
            Labour Insurance Records ({inquiries.length})
          </h3>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            No labour insurance applications found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
                <tr>
                  <th className="py-3 px-3">Ref #</th>
                  <th className="py-3 px-4">Company &amp; GSTIN</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-3 text-center">Labours</th>
                  <th className="py-3 px-3 text-center">Period</th>
                  <th className="py-3 px-3 text-center">Coverage</th>
                  <th className="py-3 px-3 text-right">Est. Premium</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {item.inquiryNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.companyName}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 font-semibold">
                        GST: <span className="text-slate-800">{item.gstNumber}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {item.contactPersonRole}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{item.officialContactNumber}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {item.officialEmail}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-900">
                      <span className="inline-block bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full font-mono text-xs">
                        {item.numberOfLabours}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center text-slate-700 font-semibold whitespace-nowrap">
                      {item.workingPeriod}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="inline-block bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-bold text-[11px]">
                        {item.insuranceCoverage}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                      ₹{Number(item.estimatedPremium || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'quoted'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'contacted'
                            ? 'bg-purple-100 text-purple-800'
                            : item.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                          title="Manage Status"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.inquiryNumber)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Status Modal */}
      {selectedInquiry && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Update Status: ${selectedInquiry.inquiryNumber}`}
          size="md"
        >
          <form onSubmit={handleSaveStatus} className="space-y-4 text-xs text-darkText">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p><strong>Company:</strong> {selectedInquiry.companyName}</p>
              <p><strong>GST Number:</strong> {selectedInquiry.gstNumber}</p>
              <p><strong>Workforce:</strong> {selectedInquiry.numberOfLabours} Labours · {selectedInquiry.workingPeriod} · {selectedInquiry.insuranceCoverage}</p>
              <p><strong>Contact:</strong> {selectedInquiry.contactPersonRole} ({selectedInquiry.officialContactNumber})</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Application Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-bold bg-white text-slate-800"
              >
                <option value="pending">Pending Review</option>
                <option value="contacted">Underwriter Contacted</option>
                <option value="quoted">Official Quote Sent</option>
                <option value="approved">Policy Issued / Active</option>
                <option value="rejected">Rejected / Ineligible</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Admin Underwriting Notes</label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Record quote reference, policy certificate number, payment status..."
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="pt-4 border-t flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={savingStatus}>
                Update Application
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminLabourInsurancePage;
