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
  Plus,
  Edit,
  Printer,
  Download,
  Image as ImageIcon,
  User,
  Trash2,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  FileText,
  DollarSign,
  X,
  Maximize2,
} from 'lucide-react';
import api, { getAssetUrl } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { BalumuniInvoice } from '../../components/common/BalumuniInvoice';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';

export const AdminQuotationsPage = () => {
  const [activeTab, setActiveTab] = useState('quotations'); // 'quotations' | 'customer_images'
  const [quotations, setQuotations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [thisMonthCount, setThisMonthCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Customer Uploaded Images State (Requirement 8)
  const [customerUploads, setCustomerUploads] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [imageSearch, setImageSearch] = useState('');
  const [zoomedImage, setZoomedImage] = useState(null);

  // View / Print / PDF Modal with BalumuniInvoice (Requirement 6 & 10)
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const [viewMode, setViewMode] = useState('quotation'); // 'quotation' | 'invoice'

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

  // Edit Quotation Modal (Requirement 6)
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    deliveryLocation: '',
    gstin: '',
    status: 'new',
    paymentTerms: '7 DAYS CREDIT',
    deliveryTerms: 'DOORSTEP TO MADURAI',
    items: [],
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Admin Manual Create Quotation Modal (Requirement 11)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [existingCustomers, setExistingCustomers] = useState([]);
  const [createFormData, setCreateFormData] = useState({
    customerType: 'new', // 'existing' | 'new'
    customerId: '',
    name: '',
    phone: '',
    email: '',
    companyName: '',
    deliveryLocation: '',
    gstin: '',
    paymentTerms: '7 DAYS CREDIT',
    deliveryTerms: 'DOORSTEP TO CLIENT',
    sendEmailAfterCreate: false,
    items: [
      {
        category: 'PIX V-Belt',
        partNumber: '',
        name: '',
        hsn: '8482',
        quantity: 1,
        mrp: 1000,
        discountPercentage: 48,
        rate: 520,
        amount: 520,
      },
    ],
  });
  const [creatingQuotation, setCreatingQuotation] = useState(false);

  // Fetch Quotations
  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/enquiries', {
        params: {
          type: 'rfq',
          page,
          limit: 25,
          search: search.trim() || undefined,
          status: statusFilter || undefined,
        },
      });

      if (res.data?.success) {
        setQuotations(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
        if (res.data.thisMonthTotal !== undefined) {
          setThisMonthCount(res.data.thisMonthTotal);
        } else {
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const count = (res.data.data || []).filter((q) => {
            const d = new Date(q.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          }).length;
          setThisMonthCount(count);
        }
      }
    } catch (err) {
      console.error('[Quotations Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Customer Uploaded Images (Requirement 8)
  const fetchCustomerUploads = async () => {
    setUploadsLoading(true);
    try {
      const res = await api.get('/user-uploads', {
        params: {
          limit: 50,
          search: imageSearch.trim() || undefined,
        },
      });
      if (res.data?.success) {
        setCustomerUploads(res.data.data || []);
      }
    } catch (err) {
      console.error('[Uploads Fetch Error]', err);
    } finally {
      setUploadsLoading(false);
    }
  };

  // Fetch Customers for manual creation dropdown
  const fetchExistingCustomers = async () => {
    try {
      const res = await api.get('/users/customers?limit=100');
      if (res.data?.success) {
        setExistingCustomers(res.data.data || []);
      }
    } catch (err) {
      console.warn('[Customers list load error]', err);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter, page]);

  useEffect(() => {
    if (activeTab === 'customer_images') {
      fetchCustomerUploads();
    }
  }, [activeTab]);

  // Format Sequential Quotation Number (Requirement 5 & 6)
  // Format: ENQ No: [Sequential Number]/[Month]/[Year]
  const formatQuotationNumber = (q) => {
    if (!q) return 'ENQ No: 1/11/26';
    if (q.quotationNumber && q.quotationNumber.startsWith('ENQ')) {
      return q.quotationNumber;
    }
    const seq = q.monthlySequence || 1;
    const d = q.createdAt ? new Date(q.createdAt) : new Date();
    const month = d.getMonth() + 1;
    const year = String(d.getFullYear()).slice(-2);
    return `ENQ No: ${seq}/${month}/${year}`;
  };

  // Open BalumuniInvoice Viewer Modal
  const handleOpenViewModal = (q, mode = 'quotation') => {
    setViewingQuotation(q);
    setViewMode(mode);
  };

  // Generate Invoice from Existing Quotation (Requirement 10)
  const handleGenerateInvoice = async (quotationId) => {
    try {
      const res = await api.post(`/enquiries/${quotationId}/generate-invoice`);
      if (res.data?.success) {
        showSuccessAlert(
          'Tax Invoice Generated!',
          `Invoice ${res.data.data?.invoiceNumber || ''} generated successfully from Quotation.`
        );
        setViewingQuotation(res.data.data);
        setViewMode('invoice');
        fetchQuotations();
      }
    } catch (err) {
      showErrorAlert('Invoice Generation Failed', err.response?.data?.message || err.message);
    }
  };

  // Email Quotation to Customer (Requirement 11)
  const handleSendEmail = async (quotation) => {
    const targetEmail = quotation.email || prompt('Enter recipient email address:');
    if (!targetEmail) return;

    try {
      showToast('Dispatching official quotation PDF via email...');
      const res = await api.post(`/enquiries/${quotation._id}/send-email`, {
        recipientEmail: targetEmail,
      });
      if (res.data?.success) {
        showSuccessAlert(
          'Quotation Emailed!',
          `Quotation ${formatQuotationNumber(quotation)} has been successfully dispatched to ${targetEmail} from balumuniandassociates@gmail.com.`
        );
      }
    } catch (err) {
      showErrorAlert('Email Dispatch Failed', err.response?.data?.message || err.message);
    }
  };

  // Approval Handlers
  const handleOpenApproveModal = (q) => {
    setSelectedQuotation(q);
    setApprovedPrice(q.approvedPrice || q.targetPrice || q.totalAmount || 0);
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
          'The customer has been notified: "Your quotation has been approved!" and status has been updated.'
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

  // Rejection Handlers
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

  // Edit Quotation Modal (Requirement 6)
  const handleOpenEditModal = (q) => {
    setEditingQuotation(q);
    const existingItems = Array.isArray(q.items) && q.items.length > 0 ? q.items : [
      {
        category: q.brand || 'Industrial Parts',
        partNumber: q.partNumber || 'PART-001',
        name: q.subject || 'Standard Industrial Product',
        description: q.message || '',
        hsn: '8482',
        quantity: q.quantity || 1,
        mrp: q.targetPrice || 1000,
        discountPercentage: 48,
        rate: Math.round((q.targetPrice || 1000) * 0.52),
        amount: Math.round((q.targetPrice || 1000) * 0.52) * (q.quantity || 1),
      },
    ];

    setEditFormData({
      name: q.name || '',
      phone: q.phone || '',
      email: q.email || '',
      companyName: q.companyName || '',
      deliveryLocation: q.deliveryLocation || '',
      gstin: q.gstin || '',
      status: q.status || 'new',
      paymentTerms: q.paymentTerms || '7 DAYS CREDIT',
      deliveryTerms: q.deliveryTerms || 'DOORSTEP TO CLIENT',
      items: existingItems,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateEditItem = (index, field, value) => {
    const updated = [...editFormData.items];
    updated[index] = { ...updated[index], [field]: value };

    // Recompute rate and amount if mrp, discount, or qty changed
    if (field === 'mrp' || field === 'discountPercentage' || field === 'quantity') {
      const mrp = Number(field === 'mrp' ? value : updated[index].mrp) || 0;
      const disc = Number(field === 'discountPercentage' ? value : updated[index].discountPercentage) || 0;
      const qty = Number(field === 'quantity' ? value : updated[index].quantity) || 1;
      const rate = Math.round(mrp * (1 - disc / 100));
      updated[index].rate = rate;
      updated[index].amount = rate * qty;
    }
    setEditFormData({ ...editFormData, items: updated });
  };

  const handleAddEditItem = () => {
    setEditFormData({
      ...editFormData,
      items: [
        ...editFormData.items,
        {
          category: 'PIX V-Belt',
          partNumber: '',
          name: '',
          hsn: '8482',
          quantity: 1,
          mrp: 1000,
          discountPercentage: 48,
          rate: 520,
          amount: 520,
        },
      ],
    });
  };

  const handleRemoveEditItem = (index) => {
    setEditFormData({
      ...editFormData,
      items: editFormData.items.filter((_, idx) => idx !== index),
    });
  };

  const handleSaveEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const subtotal = editFormData.items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
      const taxRate = 18;
      const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
      const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

      const payload = {
        name: editFormData.name,
        phone: editFormData.phone,
        email: editFormData.email,
        companyName: editFormData.companyName,
        deliveryLocation: editFormData.deliveryLocation,
        gstin: editFormData.gstin,
        status: editFormData.status,
        paymentTerms: editFormData.paymentTerms,
        deliveryTerms: editFormData.deliveryTerms,
        items: editFormData.items,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        approvedPrice: totalAmount,
      };

      const res = await api.put(`/enquiries/${editingQuotation._id}`, payload);
      if (res.data?.success) {
        showSuccessAlert('Quotation Updated!', 'Quotation details and pricing have been updated.');
        setIsEditModalOpen(false);
        fetchQuotations();
      }
    } catch (err) {
      showErrorAlert('Update Failed', err.response?.data?.message || err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Admin Manual Create Quotation (Requirement 11)
  const handleOpenCreateModal = () => {
    fetchExistingCustomers();
    setCreateFormData({
      customerType: 'new',
      customerId: '',
      name: '',
      phone: '',
      email: '',
      companyName: '',
      deliveryLocation: '',
      gstin: '',
      paymentTerms: '7 DAYS CREDIT',
      deliveryTerms: 'DOORSTEP TO CLIENT',
      sendEmailAfterCreate: false,
      items: [
        {
          category: 'PIX V-Belt',
          partNumber: 'C-98',
          name: 'PIX Heavy Duty Wrapped V-Belt',
          hsn: '8482',
          quantity: 2,
          mrp: 1250,
          discountPercentage: 48,
          rate: 650,
          amount: 1300,
        },
      ],
    });
    setIsCreateModalOpen(true);
  };

  const handleSelectCustomerForCreate = (customerId) => {
    const cust = existingCustomers.find((c) => c._id === customerId);
    if (cust) {
      setCreateFormData((prev) => ({
        ...prev,
        customerId,
        name: cust.name || '',
        phone: cust.phone || '',
        email: cust.email || '',
        companyName: cust.companyName || '',
        deliveryLocation: cust.address?.city || '',
        gstin: cust.gstin || '',
      }));
    }
  };

  const handleUpdateCreateItem = (index, field, value) => {
    const updated = [...createFormData.items];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'mrp' || field === 'discountPercentage' || field === 'quantity') {
      const mrp = Number(field === 'mrp' ? value : updated[index].mrp) || 0;
      const disc = Number(field === 'discountPercentage' ? value : updated[index].discountPercentage) || 0;
      const qty = Number(field === 'quantity' ? value : updated[index].quantity) || 1;
      const rate = Math.round(mrp * (1 - disc / 100));
      updated[index].rate = rate;
      updated[index].amount = rate * qty;
    }
    setCreateFormData({ ...createFormData, items: updated });
  };

  const handleAddCreateItem = () => {
    setCreateFormData({
      ...createFormData,
      items: [
        ...createFormData.items,
        {
          category: 'NBC Bearing',
          partNumber: '',
          name: '',
          hsn: '8482',
          quantity: 1,
          mrp: 1000,
          discountPercentage: 48,
          rate: 520,
          amount: 520,
        },
      ],
    });
  };

  const handleRemoveCreateItem = (index) => {
    setCreateFormData({
      ...createFormData,
      items: createFormData.items.filter((_, idx) => idx !== index),
    });
  };

  const handleCreateQuotationSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.name || !createFormData.phone) {
      showErrorAlert('Missing Information', 'Customer name and phone number are required.');
      return;
    }

    setCreatingQuotation(true);
    try {
      const subtotal = createFormData.items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
      const taxRate = 18;
      const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
      const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

      const payload = {
        name: createFormData.name,
        phone: createFormData.phone,
        email: createFormData.email,
        companyName: createFormData.companyName,
        deliveryLocation: createFormData.deliveryLocation,
        gstin: createFormData.gstin,
        paymentTerms: createFormData.paymentTerms,
        deliveryTerms: createFormData.deliveryTerms,
        items: createFormData.items,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        sendEmail: createFormData.sendEmailAfterCreate,
      };

      const res = await api.post('/enquiries/admin-create', payload);
      if (res.data?.success) {
        showSuccessAlert(
          'Quotation Created Successfully!',
          `Quotation ${formatQuotationNumber(res.data.data)} has been generated sequentially.${
            createFormData.sendEmailAfterCreate ? ' An email with the official PDF has been dispatched.' : ''
          }`
        );
        setIsCreateModalOpen(false);
        fetchQuotations();
        // Immediately open the newly created quotation in view modal
        setViewingQuotation(res.data.data);
        setViewMode('quotation');
      }
    } catch (err) {
      showErrorAlert('Creation Error', err.response?.data?.message || err.message);
    } finally {
      setCreatingQuotation(false);
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
      {/* Top Banner with Uppercase Headings (Requirement 14) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              BALUMUNI AND ASSOCIATES • QUOTATION SYSTEM
            </span>
          </div>
          <h2 className="text-xl font-black text-navy uppercase tracking-wide mt-1 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <span>CUSTOMER QUOTATION & RFQ MANAGEMENT CENTER</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Review customer quotations, assign sequential ENQ numbers, edit quotation details, inspect customer images, and generate official GST invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 px-3.5 py-1.5 rounded-xl shadow-xs">
            THIS MONTH QUOTATIONS: <strong className="font-mono text-sm ml-1 text-amber-950">{thisMonthCount}</strong>
          </span>
          <span className="text-xs font-bold bg-lightBlue text-primary px-3.5 py-1.5 rounded-xl border border-blue-200">
            TOTAL OVERALL: {pagination.total}
          </span>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-lg active:scale-95 uppercase tracking-wide"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE QUOTATION</span>
          </button>
        </div>
      </div>

      {/* Tabs: Quotations vs Customer Uploaded Images (Requirement 8) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('quotations')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
            activeTab === 'quotations'
              ? 'bg-navy text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ALL QUOTATIONS ({pagination.total})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customer_images')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
            activeTab === 'customer_images'
              ? 'bg-navy text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-amber-500" />
          <span>CUSTOMER UPLOADED IMAGES</span>
        </button>
      </div>

      {/* TAB 1: ALL QUOTATIONS */}
      {activeTab === 'quotations' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ENQ #, part #, company, or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchQuotations()}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
              />
              <Button variant="secondary" size="sm" onClick={fetchQuotations}>
                Search
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="">ALL STATUSES</option>
                <option value="new">PENDING REVIEW (NEW)</option>
                <option value="approved">APPROVED</option>
                <option value="rejected">REJECTED</option>
                <option value="in_progress">IN PROGRESS</option>
              </select>

              <button
                type="button"
                onClick={fetchQuotations}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Refresh Quotations"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
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
                  <thead className="bg-slate-50 text-navy font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">QUOTATION NO</th>
                      <th className="py-3.5 px-4">CLIENT / COMPANY</th>
                      <th className="py-3.5 px-4">PRODUCTS & IMAGES</th>
                      <th className="py-3.5 px-4 text-right">TOTAL AMOUNT</th>
                      <th className="py-3.5 px-4 text-center">STATUS</th>
                      <th className="py-3.5 px-4 text-center">INVOICE</th>
                      <th className="py-3.5 px-4">DATE</th>
                      <th className="py-3.5 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotations.map((q) => {
                      const formattedEnq = formatQuotationNumber(q);
                      const hasImages = Array.isArray(q.customerImages) && q.customerImages.length > 0;
                      const itemsCount = Array.isArray(q.items) && q.items.length > 0 ? q.items.length : 1;
                      const totalAmt = q.totalAmount || q.approvedPrice || q.targetPrice || 0;

                      return (
                        <tr key={q._id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Sequential Quotation Number */}
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <span className="text-sm font-black text-primary block">
                              {formattedEnq}
                            </span>
                            <span className="inline-block mt-0.5 text-[10px] font-sans font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              #{q.monthlySequence || 1} this month
                            </span>
                          </td>

                          {/* Client / Company */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-darkText text-sm">{q.name}</p>
                            <p className="text-[11px] text-secondaryText">
                              {q.companyName ? `${q.companyName} • ` : ''}{q.phone || q.email}
                            </p>
                            {q.deliveryLocation && (
                              <span className="text-[10px] text-slate-400 block font-medium">
                                Hub: {q.deliveryLocation}
                              </span>
                            )}
                          </td>

                          {/* Products & Images */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-navy text-xs">
                                {q.partNumber || q.subject || `${itemsCount} Line Item(s)`}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            {hasImages && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-primary font-bold">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>{q.customerImages.length} Attached Photo(s)</span>
                              </div>
                            )}
                          </td>

                          {/* Total Amount */}
                          <td className="py-3.5 px-4 text-right font-mono font-black text-navy text-sm">
                            {totalAmt > 0 ? formatCurrency(totalAmt) : 'Best Wholesale'}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(q.status)}`}>
                              {q.status}
                            </span>
                          </td>

                          {/* Invoice Status (Requirement 10) */}
                          <td className="py-3.5 px-4 text-center">
                            {q.invoiceGenerated ? (
                              <button
                                type="button"
                                onClick={() => handleOpenViewModal(q, 'invoice')}
                                className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition-colors cursor-pointer"
                                title="Click to view generated invoice"
                              >
                                {q.invoiceNumber || 'INVOICE READY'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleGenerateInvoice(q._id)}
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 hover:bg-amber-100 hover:text-amber-900 transition-colors cursor-pointer"
                                title="Generate official invoice from this quotation"
                              >
                                + Generate Invoice
                              </button>
                            )}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-secondaryText text-[11px]">
                            {formatDate(q.createdAt)}
                          </td>

                          {/* Action Buttons: View, Edit, Email (Requirement 6 & 11) */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Official Quotation Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenViewModal(q, 'quotation')}
                                className="px-2.5 py-1.5 rounded-xl bg-navy hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                title="View official quotation with print & PDF download"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>

                              {/* Edit Quotation Button (Requirement 6) */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(q)}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                                title="Edit quotation products, pricing, and details"
                              >
                                <Edit className="w-3.5 h-3.5 text-slate-600" />
                                <span>Edit</span>
                              </button>

                              {/* Send Email Button */}
                              <button
                                type="button"
                                onClick={() => handleSendEmail(q)}
                                className="p-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-primary transition-all cursor-pointer"
                                title="Send quotation PDF via email"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>

                              {/* Quick Approve Button if not approved */}
                              {q.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenApproveModal(q)}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                                  title="Approve Quotation"
                                >
                                  Approve
                                </button>
                              )}

                              {/* Quick Reject Button if not rejected */}
                              {q.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenRejectModal(q)}
                                  className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all cursor-pointer"
                                  title="Reject Quotation"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-secondaryText">
                No quotation requests found matching criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER UPLOADED IMAGES SUBSECTION (Requirement 8) */}
      {activeTab === 'customer_images' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-navy uppercase tracking-wide">
                Customer Uploaded Technical Specification Photos
              </h3>
              <p className="text-xs text-slate-500">
                All part nameplates, sample photos, and custom specifications uploaded by customers during RFQ/Quotation generation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by customer name, city, phone..."
                value={imageSearch}
                onChange={(e) => setImageSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCustomerUploads()}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none w-64"
              />
              <Button variant="secondary" size="sm" onClick={fetchCustomerUploads}>
                Filter
              </Button>
            </div>
          </div>

          {uploadsLoading ? (
            <div className="py-20 flex justify-center bg-white rounded-3xl border border-slate-200">
              <Spinner size="lg" />
            </div>
          ) : customerUploads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {customerUploads.map((up) => {
                const imgUrl = getAssetUrl(up.imageUrl);
                return (
                  <div
                    key={up._id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Image Thumbnail with zoom trigger */}
                    <div
                      className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer"
                      onClick={() => setZoomedImage(imgUrl)}
                    >
                      <img
                        src={imgUrl}
                        alt={up.originalFileName || 'Customer uploaded part'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/bannerImages/nbcandTapper role.webp';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-bold text-xs">
                        <Maximize2 className="w-4 h-4" />
                        <span>Click to Enlarge</span>
                      </div>
                      <span className="absolute top-2 left-2 bg-navy/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {up.city || 'Hub'}
                      </span>
                    </div>

                    {/* Metadata Card */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-darkText text-sm block">
                            {up.customerName || up.contactPerson || 'Customer'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(up.createdAt)}
                          </span>
                        </div>
                        {up.companyName && (
                          <span className="text-slate-500 font-medium block text-[11px]">
                            {up.companyName}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-primary" />
                          <span>{up.customerPhone || 'N/A'}</span>
                        </div>
                        {up.partNotes && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic line-clamp-2">
                            "{up.partNotes}"
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download High-Res</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setSearch(up.customerName || up.customerPhone || '');
                            setActiveTab('quotations');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition-colors"
                        >
                          Find Quotation
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-xs text-secondaryText">
              No customer uploaded images found.
            </div>
          )}
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black shadow-2xl p-2">
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed customer specification"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* VIEW MODAL: BALUMUNI INVOICE & QUOTATION (Requirement 6 & 10) */}
      {viewingQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl my-auto">
            {/* View Mode Switcher Header */}
            <div className="bg-slate-900 text-white px-6 py-3 rounded-t-3xl flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  DOCUMENT VIEWER:
                </span>
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('quotation')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                      viewMode === 'quotation'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    QUOTATION
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!viewingQuotation.invoiceGenerated) {
                        handleGenerateInvoice(viewingQuotation._id);
                      } else {
                        setViewMode('invoice');
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                      viewMode === 'invoice'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    INVOICE (FROM / TO)
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingQuotation(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Master BalumuniInvoice Component */}
            <BalumuniInvoice
              data={viewingQuotation}
              mode={viewMode}
              onClose={() => setViewingQuotation(null)}
              onGenerateInvoice={() => handleGenerateInvoice(viewingQuotation._id)}
              onSendEmail={() => handleSendEmail(viewingQuotation)}
            />
          </div>
        </div>
      )}

      {/* EDIT QUOTATION MODAL (Requirement 6) */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`EDIT QUOTATION: ${formatQuotationNumber(editingQuotation)}`}
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleSaveEditSubmit} className="space-y-4 text-xs">
            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={editFormData.companyName}
                  onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Delivery City / Hub</label>
                <input
                  type="text"
                  value={editFormData.deliveryLocation}
                  onChange={(e) => setEditFormData({ ...editFormData, deliveryLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">GSTIN Number</label>
                <input
                  type="text"
                  value={editFormData.gstin}
                  onChange={(e) => setEditFormData({ ...editFormData, gstin: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Quotation Status Selector (Requirement 6) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Quotation Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                >
                  <option value="new">Pending Review (New)</option>
                  <option value="in_progress">In Progress</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed / Fulfilled</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Payment Terms</label>
                <input
                  type="text"
                  value={editFormData.paymentTerms}
                  onChange={(e) => setEditFormData({ ...editFormData, paymentTerms: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Delivery Terms</label>
                <input
                  type="text"
                  value={editFormData.deliveryTerms}
                  onChange={(e) => setEditFormData({ ...editFormData, deliveryTerms: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
              </div>
            </div>

            {/* Line Items Adder / Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-navy uppercase tracking-wider text-xs">
                  Line Items & Pricing Configuration
                </span>
                <button
                  type="button"
                  onClick={handleAddEditItem}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {editFormData.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <label className="text-[10px] text-slate-500 font-bold block">Part #</label>
                      <input
                        type="text"
                        value={item.partNumber}
                        onChange={(e) => handleUpdateEditItem(idx, 'partNumber', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] text-slate-500 font-bold block">Description</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateEditItem(idx, 'name', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-500 font-bold block">MRP (₹)</label>
                      <input
                        type="number"
                        value={item.mrp}
                        onChange={(e) => handleUpdateEditItem(idx, 'mrp', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] text-slate-500 font-bold block">Disc%</label>
                      <input
                        type="number"
                        value={item.discountPercentage}
                        onChange={(e) => handleUpdateEditItem(idx, 'discountPercentage', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] text-slate-500 font-bold block">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateEditItem(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <label className="text-[10px] text-slate-500 font-bold block">Amount</label>
                      <span className="font-mono font-bold text-xs text-navy">₹{item.amount}</span>
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveEditItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grand Total Summary */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                Total Line Items: {editFormData.items.length}
              </span>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Grand Total with 18% GST:</span>
                <span className="text-base font-black font-mono text-primary">
                  {formatCurrency(
                    Math.round(
                      editFormData.items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0) * 1.18 * 100
                    ) / 100
                  )}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="sm"
                isLoading={savingEdit}
                className="bg-navy hover:bg-slate-800 text-white font-black"
              >
                Save Quotation Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADMIN MANUAL CREATE QUOTATION MODAL (Requirement 11) */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="CREATE OFFICIAL B2B QUOTATION (ADMIN MANUAL)"
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleCreateQuotationSubmit} className="space-y-4 text-xs">
            {/* Customer Type Selector */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="radio"
                  name="custType"
                  value="new"
                  checked={createFormData.customerType === 'new'}
                  onChange={() => setCreateFormData({ ...createFormData, customerType: 'new' })}
                />
                <span>New / Unregistered Customer</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="radio"
                  name="custType"
                  value="existing"
                  checked={createFormData.customerType === 'existing'}
                  onChange={() => setCreateFormData({ ...createFormData, customerType: 'existing' })}
                />
                <span>Select from Customer Directory</span>
              </label>
            </div>

            {/* Existing Customer Dropdown */}
            {createFormData.customerType === 'existing' && (
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Select Registered Customer</label>
                <select
                  value={createFormData.customerId}
                  onChange={(e) => handleSelectCustomerForCreate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="">-- Choose Customer --</option>
                  {existingCustomers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.phone}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Customer Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={createFormData.phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address (For PDF dispatch)</label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  placeholder="e.g. client@balajimills.com"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={createFormData.companyName}
                  onChange={(e) => setCreateFormData({ ...createFormData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  placeholder="e.g. Balaji Mills Pvt Ltd"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Delivery City / Hub</label>
                <input
                  type="text"
                  value={createFormData.deliveryLocation}
                  onChange={(e) => setCreateFormData({ ...createFormData, deliveryLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  placeholder="e.g. Madurai"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Customer GSTIN</label>
                <input
                  type="text"
                  value={createFormData.gstin}
                  onChange={(e) => setCreateFormData({ ...createFormData, gstin: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  placeholder="33AAAAA0000A1Z5"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-navy uppercase tracking-wider text-xs">
                  Products to Quote
                </span>
                <button
                  type="button"
                  onClick={handleAddCreateItem}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {createFormData.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <label className="text-[10px] text-slate-500 font-bold block">Part #</label>
                      <input
                        type="text"
                        required
                        value={item.partNumber}
                        onChange={(e) => handleUpdateCreateItem(idx, 'partNumber', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                        placeholder="e.g. C-98"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] text-slate-500 font-bold block">Description</label>
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => handleUpdateCreateItem(idx, 'name', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                        placeholder="e.g. PIX V-Belt"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-500 font-bold block">MRP (₹)</label>
                      <input
                        type="number"
                        value={item.mrp}
                        onChange={(e) => handleUpdateCreateItem(idx, 'mrp', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] text-slate-500 font-bold block">Disc%</label>
                      <input
                        type="number"
                        value={item.discountPercentage}
                        onChange={(e) => handleUpdateCreateItem(idx, 'discountPercentage', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] text-slate-500 font-bold block">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateCreateItem(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <label className="text-[10px] text-slate-500 font-bold block">Amount</label>
                      <span className="font-mono font-bold text-xs text-navy">₹{item.amount}</span>
                    </div>
                    <div className="col-span-1 text-center">
                      {createFormData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCreateItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Dispatch Checkbox (Requirement 11) */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950">
                <input
                  type="checkbox"
                  checked={createFormData.sendEmailAfterCreate}
                  onChange={(e) => setCreateFormData({ ...createFormData, sendEmailAfterCreate: e.target.checked })}
                  className="rounded text-amber-600"
                />
                <span>Attach quotation as PDF and email directly to customer upon creation</span>
              </label>
              <span className="text-[10px] text-amber-800 font-semibold">
                Sent from balumuniandassociates@gmail.com
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="sm"
                isLoading={creatingQuotation}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md"
              >
                Create Official Quotation
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* APPROVE MODAL */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title={`APPROVE QUOTATION: ${formatQuotationNumber(selectedQuotation)}`}
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

      {/* REJECT MODAL */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="REJECT QUOTATION REQUEST"
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
