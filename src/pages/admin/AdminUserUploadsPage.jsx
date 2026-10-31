import React, { useState, useEffect } from 'react';
import {
  Camera,
  Search,
  MapPin,
  Calendar,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldCheck,
  FileImage,
  ExternalLink,
  Trash2,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';

export const AdminUserUploadsPage = () => {
  const [uploads, setUploads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);

  // Image Preview Lightbox Modal
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Status Update Modal
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [newStatus, setNewStatus] = useState('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [quotedAmount, setQuotedAmount] = useState(0);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchUploads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/user-uploads/admin', {
        params: {
          page,
          limit: 12,
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          city: cityFilter || undefined,
        },
      });
      if (res.data?.success) {
        setUploads(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('[Admin Uploads Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, [statusFilter, cityFilter, page]);

  const handleOpenStatusModal = (item) => {
    setSelectedUpload(item);
    setNewStatus(item.status);
    setAdminNotes(item.adminNotes || '');
    setQuotedAmount(item.quotedAmount || 0);
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.patch(`/user-uploads/admin/${selectedUpload._id}`, {
        status: newStatus,
        adminNotes,
        quotedAmount,
      });

      if (res.data?.success) {
        showSuccessAlert('Status Updated', `Upload review status transitioned to ${newStatus}.`);
        setIsStatusModalOpen(false);
        fetchUploads();
      }
    } catch (err) {
      showErrorAlert('Update Failed', err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirmDialog('Delete Image Record?', 'This will permanently delete this upload.');
    if (!confirmed) return;

    try {
      await api.delete(`/user-uploads/admin/${id}`);
      showToast('Upload record deleted');
      fetchUploads();
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'quoted':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'reviewed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <span>User Uploaded Part Specifications Tracking</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Track user uploaded components (up to 20 Megapixels), identify cities, verify specs, and coordinate RFQ quotes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-lightBlue text-primary font-bold px-3 py-1.5 rounded-xl border border-blue-200">
            Total Uploads: {pagination.total}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, city, or part notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUploads()}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
          />
          <Button variant="secondary" size="sm" onClick={fetchUploads}>
            Search
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="">All Review Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed & Identified</option>
            <option value="quoted">Quoted to Customer</option>
            <option value="completed">Completed / Ordered</option>
            <option value="rejected">Rejected / Unclear</option>
          </select>
        </div>
      </div>

      {/* Uploads Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : uploads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploads.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-smooth flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Image Preview with click to enlarge */}
                <div
                  onClick={() => {
                    setPreviewImage(item);
                    setIsPreviewOpen(true);
                  }}
                  className="relative h-48 bg-slate-900 rounded-2xl overflow-hidden cursor-pointer group flex items-center justify-center border border-slate-200"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.customerName}
                    className="w-full h-full object-contain group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>Click to Enlarge</span>
                  </div>

                  {/* Megapixels Tag */}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-black bg-black/70 text-amber-300 backdrop-blur-sm border border-white/20">
                    {item.dimensions?.megapixels > 0 ? `${item.dimensions.megapixels} MP` : 'Verified Image'}
                  </span>
                </div>

                {/* Customer Details & City */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-navy">{item.customerName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-secondaryText flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>City: <strong>{item.city || 'Not provided'}</strong></span>
                  </p>

                  <p className="text-[11px] text-slate-600">
                    Phone: {item.customerPhone || 'N/A'} {item.customerEmail ? `• ${item.customerEmail}` : ''}
                  </p>

                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Uploaded: {formatDateTime(item.createdAt)}</span>
                  </p>

                  {item.partNotes && (
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mt-2 line-clamp-2">
                      "{item.partNotes}"
                    </p>
                  )}

                  {item.quotedAmount > 0 && (
                    <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex justify-between items-center">
                      <span>Quoted Rate:</span>
                      <span className="text-sm font-black">{formatCurrency(item.quotedAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenStatusModal(item)}
                  className="w-full justify-center"
                >
                  Manage Status / Quote
                </Button>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-smooth"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-xs text-secondaryText bg-white rounded-3xl border border-slate-200">
          No uploaded images found matching your search.
        </div>
      )}

      {/* Lightbox Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Part Specification Image: ${previewImage?.customerName}`}
        maxWidth="max-w-4xl"
      >
        {previewImage && (
          <div className="space-y-4">
            <div className="bg-slate-950 rounded-2xl p-2 flex justify-center items-center max-h-[70vh] overflow-hidden">
              <img
                src={previewImage.imageUrl}
                alt={previewImage.customerName}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border text-xs">
              <div>
                <p className="font-bold text-navy">{previewImage.customerName} ({previewImage.city})</p>
                <p className="text-secondaryText">File: {previewImage.originalFileName}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Resolution: {previewImage.dimensions?.width}×{previewImage.dimensions?.height} ({previewImage.dimensions?.megapixels} MP)
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Status & Quoting Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Review Status & Customer Quote"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Review Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 text-darkText"
            >
              <option value="pending">Pending Review</option>
              <option value="reviewed">Reviewed & Identified</option>
              <option value="quoted">Quoted to Customer</option>
              <option value="completed">Completed / Ordered</option>
              <option value="rejected">Rejected / Unclear</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Quoted Rate (₹)</label>
            <input
              type="number"
              min="0"
              value={quotedAmount}
              onChange={(e) => setQuotedAmount(e.target.value)}
              placeholder="e.g. 1750"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-sm font-bold bg-slate-50"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Internal Engineering Notes</label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Verified NBC 6405ZZ C3 equivalent. Ready in stock for dispatch."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              isLoading={updating}
            >
              Save & Notify
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
