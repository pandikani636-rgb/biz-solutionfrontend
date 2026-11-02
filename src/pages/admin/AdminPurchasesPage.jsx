import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  FileSpreadsheet,
  Building2,
  Receipt,
  TrendingUp,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Trash2,
  Edit,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import purchaseService from '../../services/purchaseService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';
import { generatePurchaseInvoicePdf } from '../../utils/generatePurchasePdf';

export const AdminPurchasesPage = () => {
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'suppliers' | 'reports'
  const [loading, setLoading] = useState(true);

  // Invoices State
  const [invoices, setInvoices] = useState([]);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('');
  const [invoicePaymentFilter, setInvoicePaymentFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Suppliers State
  const [suppliers, setSuppliers] = useState([]);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierCategoryFilter, setSupplierCategoryFilter] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Reports State
  const [reportsData, setReportsData] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [invRes, supRes] = await Promise.all([
        purchaseService.getPurchaseInvoices(),
        purchaseService.getSuppliers(),
      ]);
      setInvoices(invRes.data || []);
      setSuppliers(supRes.data || []);
    } catch (err) {
      console.error('[Purchases Load Error]', err);
      showErrorAlert('Failed to load purchase data', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setReportsLoading(true);
    try {
      const res = await purchaseService.getPurchaseReports();
      setReportsData(res.data);
    } catch (err) {
      console.error('[Reports Error]', err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab]);

  // Overall Financial Metrics from loaded invoices
  const metrics = useMemo(() => {
    const totalPurchases = invoices.reduce((acc, i) => acc + (i.grandTotal || 0), 0);
    const totalPaid = invoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0);
    const totalBalance = Math.max(0, totalPurchases - totalPaid);
    const activeSuppliersCount = suppliers.filter((s) => s.status === 'Active').length;
    return { totalPurchases, totalPaid, totalBalance, activeSuppliersCount, count: invoices.length };
  }, [invoices, suppliers]);

  // ==========================================
  // INVOICE FORM STATE & HANDLERS
  // ==========================================
  const emptyItem = {
    itemName: '',
    partNumber: '',
    category: 'Bearings',
    hsnCode: '8482',
    quantity: 1,
    unit: 'PCS',
    unitPrice: 0,
    taxRate: 18,
    taxAmount: 0,
    totalAmount: 0,
  };

  const emptyInvoiceForm = {
    supplier: '',
    vendorInvoiceNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ ...emptyItem }],
    shippingCharges: 0,
    discount: 0,
    status: 'Received',
    warehouseLocation: 'Main Godown Srivilliputtur',
    notes: '',
  };

  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm);
  const [formSaving, setFormSaving] = useState(false);

  // Auto-calculate line items & invoice grand total
  const calculatedInvoiceTotals = useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;

    const items = (invoiceForm.items || []).map((item) => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.unitPrice) || 0;
      const taxRate = Number(item.taxRate) || 0;
      const base = qty * rate;
      const tax = (base * taxRate) / 100;
      const total = base + tax;

      subtotal += base;
      taxTotal += tax;
      return { ...item, taxAmount: tax, totalAmount: total };
    });

    const shipping = Number(invoiceForm.shippingCharges) || 0;
    const discount = Number(invoiceForm.discount) || 0;
    const grandTotal = Math.max(0, subtotal + taxTotal + shipping - discount);

    return {
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      taxTotal: Math.round(taxTotal * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  }, [invoiceForm.items, invoiceForm.shippingCharges, invoiceForm.discount]);

  const handleItemChange = (index, field, value) => {
    const updated = [...invoiceForm.items];
    updated[index] = { ...updated[index], [field]: value };
    setInvoiceForm((prev) => ({ ...prev, items: updated }));
  };

  const handleAddItemRow = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...emptyItem }],
    }));
  };

  const handleRemoveItemRow = (index) => {
    if (invoiceForm.items.length <= 1) {
      showToast('At least one item is required in the invoice', 'warning');
      return;
    }
    const updated = invoiceForm.items.filter((_, idx) => idx !== index);
    setInvoiceForm((prev) => ({ ...prev, items: updated }));
  };

  const handleOpenCreateInvoiceModal = () => {
    setInvoiceForm(emptyInvoiceForm);
    setSelectedInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.supplier) {
      showToast('Please select a supplier', 'warning');
      return;
    }
    if (invoiceForm.items.some((i) => !i.itemName.trim() || Number(i.quantity) <= 0)) {
      showToast('Please provide valid description and quantity for all items', 'warning');
      return;
    }

    setFormSaving(true);
    try {
      const payload = {
        ...invoiceForm,
        items: calculatedInvoiceTotals.items,
        subtotal: calculatedInvoiceTotals.subtotal,
        taxTotal: calculatedInvoiceTotals.taxTotal,
        shippingCharges: Number(invoiceForm.shippingCharges) || 0,
        discount: Number(invoiceForm.discount) || 0,
        grandTotal: calculatedInvoiceTotals.grandTotal,
      };

      if (selectedInvoice?._id) {
        await purchaseService.updatePurchaseInvoice(selectedInvoice._id, payload);
        showSuccessAlert('Invoice Updated', 'Purchase invoice record updated successfully.');
      } else {
        await purchaseService.createPurchaseInvoice(payload);
        showSuccessAlert('Invoice Created', 'Purchase invoice recorded and added to stock.');
      }

      setIsInvoiceModalOpen(false);
      fetchInitialData();
    } catch (err) {
      showErrorAlert('Failed to save purchase invoice', err.message);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteInvoice = async (inv) => {
    const confirmed = await showConfirmDialog(
      'Delete Purchase Invoice?',
      `Are you sure you want to permanently delete purchase invoice ${inv.invoiceNumber}? This will also adjust the supplier balance.`
    );
    if (!confirmed) return;

    try {
      await purchaseService.deletePurchaseInvoice(inv._id);
      showToast('Purchase invoice deleted', 'success');
      fetchInitialData();
    } catch (err) {
      showErrorAlert('Delete Failed', err.message);
    }
  };

  // ==========================================
  // PAYMENT RECORDING
  // ==========================================
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'NEFT/RTGS',
    referenceNumber: '',
    notes: '',
  });

  const handleOpenPaymentModal = (inv) => {
    setSelectedInvoice(inv);
    setPaymentForm({
      amount: inv.balanceDue || 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'NEFT/RTGS',
      referenceNumber: '',
      notes: '',
    });
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice?._id) return;
    if (Number(paymentForm.amount) <= 0) {
      showToast('Payment amount must be greater than 0', 'warning');
      return;
    }

    try {
      await purchaseService.recordPayment(selectedInvoice._id, paymentForm);
      showSuccessAlert('Payment Recorded', `Payment of Rs. ${paymentForm.amount} applied to ${selectedInvoice.invoiceNumber}.`);
      setIsPaymentModalOpen(false);
      fetchInitialData();
    } catch (err) {
      showErrorAlert('Payment Failed', err.message);
    }
  };

  // ==========================================
  // SUPPLIER FORM STATE & HANDLERS
  // ==========================================
  const emptySupplierForm = {
    name: '',
    supplierCode: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: '',
    category: 'Bearings',
    paymentTerms: 'Net 30',
    status: 'Active',
    address: { street: '', city: '', state: 'Tamil Nadu', pincode: '', country: 'India' },
    bankDetails: { bankName: '', accountNumber: '', ifscCode: '', branch: '' },
    notes: '',
  };

  const [supplierForm, setSupplierForm] = useState(emptySupplierForm);

  const handleOpenAddSupplier = () => {
    setSelectedSupplier(null);
    setSupplierForm(emptySupplierForm);
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (sup) => {
    setSelectedSupplier(sup);
    setSupplierForm({
      ...sup,
      address: { ...emptySupplierForm.address, ...(sup.address || {}) },
      bankDetails: { ...emptySupplierForm.bankDetails, ...(sup.bankDetails || {}) },
    });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    if (!supplierForm.name.trim() || !supplierForm.phone.trim()) {
      showToast('Supplier business name and phone are required', 'warning');
      return;
    }

    setFormSaving(true);
    try {
      if (selectedSupplier?._id) {
        await purchaseService.updateSupplier(selectedSupplier._id, supplierForm);
        showSuccessAlert('Supplier Updated', 'Supplier details saved successfully.');
      } else {
        await purchaseService.createSupplier(supplierForm);
        showSuccessAlert('Supplier Added', 'New supplier profile added to vendor directory.');
      }
      setIsSupplierModalOpen(false);
      fetchInitialData();
    } catch (err) {
      showErrorAlert('Failed to save supplier', err.message);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteSupplier = async (sup) => {
    const confirmed = await showConfirmDialog(
      'Delete Supplier?',
      `Are you sure you want to delete ${sup.name}? This will fail if active purchase invoices are linked.`
    );
    if (!confirmed) return;

    try {
      await purchaseService.deleteSupplier(sup._id);
      showToast('Supplier deleted', 'success');
      fetchInitialData();
    } catch (err) {
      showErrorAlert('Delete Failed', err.message);
    }
  };

  // ==========================================
  // EXCEL REPORT EXPORT
  // ==========================================
  const handleExportExcel = () => {
    try {
      // Invoices Worksheet
      const invData = invoices.map((i, idx) => ({
        '#': idx + 1,
        'Voucher No': i.invoiceNumber,
        'Vendor Bill No': i.vendorInvoiceNumber || 'N/A',
        'Supplier Name': i.supplierName || i.supplier?.name || 'N/A',
        'Purchase Date': formatDate(i.purchaseDate),
        'Due Date': formatDate(i.dueDate),
        'Subtotal (INR)': i.subtotal,
        'GST Total (INR)': i.taxTotal,
        'Freight (INR)': i.shippingCharges || 0,
        'Discount (INR)': i.discount || 0,
        'Grand Total (INR)': i.grandTotal,
        'Paid Amount (INR)': i.paidAmount,
        'Balance Due (INR)': i.balanceDue,
        'Payment Status': i.paymentStatus,
        'Inward Status': i.status,
        'Storage Godown': i.warehouseLocation || 'Main Godown',
      }));

      // Suppliers Worksheet
      const supData = suppliers.map((s, idx) => ({
        '#': idx + 1,
        'Supplier Code': s.supplierCode || 'N/A',
        'Company Name': s.name,
        Category: s.category,
        'Contact Person': s.contactPerson || 'N/A',
        Phone: s.phone,
        Email: s.email || 'N/A',
        GSTIN: s.gstin || 'N/A',
        'Payment Terms': s.paymentTerms,
        'Total Purchases (INR)': s.totalPurchases,
        'Total Paid (INR)': s.totalPaid,
        'Balance Due (INR)': s.balanceDue,
        'Invoices Count': s.invoiceCount,
        Status: s.status,
      }));

      const wb = XLSX.utils.book_new();
      const wsInv = XLSX.utils.json_to_sheet(invData);
      const wsSup = XLSX.utils.json_to_sheet(supData);

      XLSX.utils.book_append_sheet(wb, wsInv, 'Purchase Invoices');
      XLSX.utils.book_append_sheet(wb, wsSup, 'Suppliers Directory');

      const fileName = `Balumuni_Purchase_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast('Excel report generated and downloaded', 'success');
    } catch (err) {
      console.error('[Export Excel Error]', err);
      showErrorAlert('Export Failed', err.message);
    }
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      const matchSearch =
        !invoiceSearch ||
        i.invoiceNumber?.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        i.vendorInvoiceNumber?.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        i.supplierName?.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        (i.items || []).some((item) =>
          item.itemName?.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
          item.partNumber?.toLowerCase().includes(invoiceSearch.toLowerCase())
        );

      const matchStatus = !invoiceStatusFilter || i.status === invoiceStatusFilter;
      const matchPayment = !invoicePaymentFilter || i.paymentStatus === invoicePaymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [invoices, invoiceSearch, invoiceStatusFilter, invoicePaymentFilter]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        !supplierSearch ||
        s.name?.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        s.supplierCode?.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        s.contactPerson?.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        s.phone?.toLowerCase().includes(supplierSearch.toLowerCase());

      const matchCategory = !supplierCategoryFilter || s.category === supplierCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [suppliers, supplierSearch, supplierCategoryFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 font-semibold">Loading Material Purchases &amp; Vendors...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-primary border border-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            Balumuni and Associates • Material Procurement
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Material Purchase Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage material suppliers, record purchase invoices, generate PDF inward vouchers, and track expenses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Report (Excel)</span>
          </Button>

          {activeTab === 'suppliers' ? (
            <Button
              variant="primary"
              onClick={handleOpenAddSupplier}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleOpenCreateInvoiceModal}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Purchase Invoice</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Real-time Procurement KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Purchases</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(metrics.totalPurchases)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{metrics.count} total purchase vouchers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Settled / Paid</p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              {formatCurrency(metrics.totalPaid)}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">Cleared supplier remittances</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Balance Due / Outstanding</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
              {formatCurrency(metrics.totalBalance)}
            </h3>
            <p className="text-xs text-amber-700 font-semibold mt-0.5">Pending vendor payouts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Suppliers</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {metrics.activeSuppliersCount} <span className="text-sm font-normal text-slate-500">/ {suppliers.length}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Verified industrial vendors</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Purchase Invoices &amp; Inward Orders</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
            {invoices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'suppliers'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Suppliers &amp; Vendors</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
            {suppliers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Reports &amp; Expense Analytics</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PURCHASE INVOICES */}
      {/* ======================================================== */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by voucher #, vendor bill #, supplier, or material..."
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="">All Inward Status</option>
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={invoicePaymentFilter}
                onChange={(e) => setInvoicePaymentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="">All Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>

              {(invoiceSearch || invoiceStatusFilter || invoicePaymentFilter) && (
                <button
                  onClick={() => {
                    setInvoiceSearch('');
                    setInvoiceStatusFilter('');
                    setInvoicePaymentFilter('');
                  }}
                  className="px-3 py-2 text-xs text-rose-600 hover:text-rose-700 font-bold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Voucher / Bill</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Items / Description</th>
                    <th className="py-3 px-4">Inward Status</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold">No purchase invoices found matching your criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-black text-slate-900 block">{inv.invoiceNumber}</span>
                          <span className="text-[10px] text-slate-500">Bill: {inv.vendorInvoiceNumber || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block truncate max-w-[160px]">
                            {inv.supplierName || inv.supplier?.name || 'Vendor'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {inv.supplier?.category || 'Bearings & Belts'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(inv.purchaseDate)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 block truncate max-w-[180px]">
                            {inv.items?.[0]?.itemName || 'Materials'}
                          </span>
                          {inv.items?.length > 1 && (
                            <span className="text-[10px] text-primary font-semibold">
                              +{inv.items.length - 1} more items
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                              inv.status === 'Received'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : inv.status === 'In Transit'
                                ? 'bg-blue-50 text-primary border border-blue-200'
                                : inv.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                              inv.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.paymentStatus === 'Partially Paid'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          {formatCurrency(inv.grandTotal)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-bold ${inv.balanceDue > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                            {formatCurrency(inv.balanceDue)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsViewInvoiceModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                              title="View Invoice Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => generatePurchaseInvoicePdf(inv, true)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Download PDF Invoice"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {inv.balanceDue > 0 && (
                              <button
                                onClick={() => handleOpenPaymentModal(inv)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Record Payment"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteInvoice(inv)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SUPPLIERS / VENDORS DIRECTORY */}
      {/* ======================================================== */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search suppliers by name, code, contact person, or phone..."
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={supplierCategoryFilter}
                onChange={(e) => setSupplierCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="">All Categories</option>
                <option value="Bearings">Bearings</option>
                <option value="Belts & Transmission">Belts &amp; Transmission</option>
                <option value="Electric Motors & Drives">Electric Motors &amp; Drives</option>
                <option value="Industrial Gears">Industrial Gears</option>
                <option value="Industrial Lubricants">Industrial Lubricants</option>
                <option value="General Hardware">General Hardware</option>
              </select>
            </div>
          </div>

          {/* Suppliers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="font-semibold">No suppliers found matching your query</p>
              </div>
            ) : (
              filteredSuppliers.map((sup) => (
                <div
                  key={sup._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          {sup.supplierCode || 'SUP-XXX'}
                        </span>
                        <h3 className="text-base font-black text-slate-900 leading-snug">{sup.name}</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-primary border border-blue-200">
                        {sup.category}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      {sup.contactPerson && (
                        <p className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">Contact:</span> {sup.contactPerson}
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">Phone:</span> {sup.phone}
                      </p>
                      {sup.email && (
                        <p className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-slate-800">Email:</span> {sup.email}
                        </p>
                      )}
                      {sup.gstin && (
                        <p className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">GSTIN:</span> {sup.gstin}
                        </p>
                      )}
                      {sup.paymentTerms && (
                        <p className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">Terms:</span> {sup.paymentTerms}
                        </p>
                      )}
                    </div>

                    {/* Financial Summary Box */}
                    <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Purchases</span>
                        <span className="font-black text-slate-900">{formatCurrency(sup.totalPurchases || 0)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Outstanding Due</span>
                        <span className={`font-black ${sup.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {formatCurrency(sup.balanceDue || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {sup.invoiceCount || 0} Invoices
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditSupplier(sup)}
                        className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Supplier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(sup)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: REPORTS & EXPENSE ANALYTICS */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {reportsLoading || !reportsData ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-2xl border border-slate-200">
              <Spinner size="md" />
              <p className="text-xs text-slate-500 font-semibold">Compiling procurement analytics...</p>
            </div>
          ) : (
            <>
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Monthly Expenses Bar Chart */}
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Monthly Purchase Expenditure</h3>
                      <p className="text-xs text-slate-500">Procurement spend breakdown over recent billing months</p>
                    </div>
                    <span className="text-xs font-bold text-primary px-3 py-1 bg-blue-50 rounded-lg">
                      FY 2025 - 2026
                    </span>
                  </div>

                  <div className="h-64 sm:h-72 w-full">
                    {reportsData.monthlyExpenses?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportsData.monthlyExpenses}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Expenditure']}
                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                          />
                          <Bar dataKey="amount" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        No monthly purchase records yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Suppliers By Spend */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 mb-1">Top Suppliers by Spend</h3>
                    <p className="text-xs text-slate-500 mb-4">Leading industrial vendor allocations</p>

                    <div className="space-y-3">
                      {(reportsData.supplierRankings || []).slice(0, 5).map((sup, idx) => (
                        <div key={sup.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 truncate max-w-[170px]">
                              {idx + 1}. {sup.name}
                            </span>
                            <span className="font-black text-slate-900">{formatCurrency(sup.amount)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (sup.amount / (reportsData.summary?.totalPurchases || 1)) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      onClick={handleExportExcel}
                      className="w-full text-xs font-bold py-2 flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Full Detailed Audit</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Category Spend Distribution Cards */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-base font-black text-slate-900 mb-1">Procurement Category Breakdown</h3>
                <p className="text-xs text-slate-500 mb-4">Total purchase capital allocated by material classification</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(reportsData.categorySpend || []).map((cat) => (
                    <div key={cat.category} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                        {cat.category}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">{formatCurrency(cat.amount)}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT PURCHASE INVOICE */}
      {/* ======================================================== */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title={selectedInvoice ? 'Edit Purchase Invoice' : 'New Material Purchase Invoice'}
        size="2xl"
      >
        <form onSubmit={handleSaveInvoice} className="space-y-5 max-h-[75vh] overflow-y-auto px-1">
          {/* Top Row: Supplier & Bill Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supplier / Vendor *
              </label>
              <select
                value={invoiceForm.supplier}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, supplier: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vendor Bill / Invoice #
              </label>
              <input
                type="text"
                placeholder="e.g. SKF/2026/0491"
                value={invoiceForm.vendorInvoiceNumber}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, vendorInvoiceNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Inward Status
              </label>
              <select
                value={invoiceForm.status}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Received">Received (In Stock)</option>
                <option value="In Transit">In Transit</option>
                <option value="Pending">Pending Confirmation</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Second Row: Dates & Storage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Purchase / Invoice Date
              </label>
              <input
                type="date"
                value={invoiceForm.purchaseDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, purchaseDate: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Warehouse / Godown
              </label>
              <input
                type="text"
                placeholder="e.g. Srivilliputtur Godown - Rack B2"
                value={invoiceForm.warehouseLocation}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, warehouseLocation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Dynamic Line Items Section */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Material Line Items ({invoiceForm.items.length})
              </label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="space-y-3">
              {invoiceForm.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-12 sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Material / Item Description *"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Part # / Code"
                      value={item.partNumber}
                      onChange={(e) => handleItemChange(idx, 'partNumber', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <select
                      value={item.category}
                      onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                    >
                      <option value="Bearings">Bearings</option>
                      <option value="Belts & Transmission">Belts</option>
                      <option value="Electric Motors & Drives">Motors</option>
                      <option value="Industrial Gears">Gears</option>
                      <option value="Industrial Lubricants">Lubricants</option>
                      <option value="General Hardware">Hardware</option>
                    </select>
                  </div>

                  <div className="col-span-3 sm:col-span-1">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="0.1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      required
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-center"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-1">
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-1 py-1.5 rounded-lg border border-slate-300 text-xs text-center"
                    >
                      <option value="PCS">PCS</option>
                      <option value="NOS">NOS</option>
                      <option value="SETS">SETS</option>
                      <option value="METERS">MTR</option>
                      <option value="BOXES">BOX</option>
                    </select>
                  </div>

                  <div className="col-span-4 sm:col-span-1">
                    <input
                      type="number"
                      placeholder="Rate ₹"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      required
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-right font-mono"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Charges & Financials Summary Box */}
          <div className="bg-slate-100/80 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-6 space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase">
                  Internal Purchase Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Carrier / LR number, warehouse notes..."
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs resize-none"
                />
              </div>
            </div>

            <div className="sm:col-span-6 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-mono font-bold">{formatCurrency(calculatedInvoiceTotals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total GST (18% avg):</span>
                <span className="font-mono font-bold">{formatCurrency(calculatedInvoiceTotals.taxTotal)}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-600">Freight / Shipping (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={invoiceForm.shippingCharges}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, shippingCharges: e.target.value })}
                  className="w-24 px-2 py-0.5 rounded border border-slate-300 text-right font-mono text-xs"
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-600">Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={invoiceForm.discount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: e.target.value })}
                  className="w-24 px-2 py-0.5 rounded border border-slate-300 text-right font-mono text-xs"
                />
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-300 font-black text-sm text-slate-900">
                <span>Grand Total:</span>
                <span className="font-mono text-primary">
                  {formatCurrency(calculatedInvoiceTotals.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={formSaving}>
              {formSaving ? 'Saving...' : 'Save & Record Invoice'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: VIEW INVOICE DETAILS */}
      {/* ======================================================== */}
      <Modal
        isOpen={isViewInvoiceModalOpen}
        onClose={() => setIsViewInvoiceModalOpen(false)}
        title={selectedInvoice ? `Purchase Voucher: ${selectedInvoice.invoiceNumber}` : 'Invoice Details'}
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Supplier</span>
                <h4 className="font-black text-sm text-slate-900">{selectedInvoice.supplierName}</h4>
                <p className="text-slate-600">{selectedInvoice.supplier?.contactPerson}</p>
                <p className="text-slate-500">{selectedInvoice.supplier?.phone}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Voucher Details</span>
                <p><span className="font-bold">Vendor Bill:</span> {selectedInvoice.vendorInvoiceNumber || 'N/A'}</p>
                <p><span className="font-bold">Date:</span> {formatDate(selectedInvoice.purchaseDate)}</p>
                <p><span className="font-bold">Due Date:</span> {formatDate(selectedInvoice.dueDate)}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Financials</span>
                <p className="font-black text-sm text-slate-900">{formatCurrency(selectedInvoice.grandTotal)}</p>
                <p className="text-emerald-700 font-bold">Paid: {formatCurrency(selectedInvoice.paidAmount)}</p>
                <p className="text-amber-700 font-bold">Due: {formatCurrency(selectedInvoice.balanceDue)}</p>
              </div>
            </div>

            {/* Line items table with touch horizontal scroll */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-500">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Material</th>
                    <th className="p-2">Category</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Unit Rate</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedInvoice.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-900">{it.itemName}</td>
                      <td className="p-2 text-slate-600">{it.category}</td>
                      <td className="p-2 text-center">{it.quantity} {it.unit}</td>
                      <td className="p-2 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                      <td className="p-2 text-right font-mono font-bold">{formatCurrency(it.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => generatePurchaseInvoicePdf(selectedInvoice, true)}
                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Voucher</span>
              </Button>

              <div className="flex items-center gap-2">
                {selectedInvoice.balanceDue > 0 && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsViewInvoiceModalOpen(false);
                      handleOpenPaymentModal(selectedInvoice);
                    }}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Record Payment</span>
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsViewInvoiceModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: RECORD PAYMENT */}
      {/* ======================================================== */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Record Payment for ${selectedInvoice?.invoiceNumber || 'Invoice'}`}
        size="md"
      >
        <form onSubmit={handleSavePayment} className="space-y-4">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs">
            <span className="font-bold text-amber-900">Current Balance Due:</span>{' '}
            <span className="font-black text-amber-950 font-mono text-sm">
              {formatCurrency(selectedInvoice?.balanceDue || 0)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              max={selectedInvoice?.balanceDue || undefined}
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Date
            </label>
            <input
              type="date"
              value={paymentForm.paymentDate}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              <option value="NEFT/RTGS">NEFT / RTGS</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Direct Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              UTR / Reference / Cheque Number
            </label>
            <input
              type="text"
              placeholder="e.g. UTR12345678"
              value={paymentForm.referenceNumber}
              onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Remarks
            </label>
            <textarea
              rows="2"
              placeholder="Bank account, installment note..."
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Confirm Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT SUPPLIER */}
      {/* ======================================================== */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title={selectedSupplier ? 'Edit Supplier' : 'Add New Material Supplier'}
        size="lg"
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Business / Company Name *
              </label>
              <input
                type="text"
                placeholder="e.g. SKF India Ltd"
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supplier Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SUP-007"
                value={supplierForm.supplierCode}
                onChange={(e) => setSupplierForm({ ...supplierForm, supplierCode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Material Category
              </label>
              <select
                value={supplierForm.category}
                onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              >
                <option value="Bearings">Bearings</option>
                <option value="Belts & Transmission">Belts &amp; Transmission</option>
                <option value="Electric Motors & Drives">Electric Motors &amp; Drives</option>
                <option value="Industrial Gears">Industrial Gears</option>
                <option value="Industrial Lubricants">Industrial Lubricants</option>
                <option value="General Hardware">General Hardware</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="Manager name"
                value={supplierForm.contactPerson}
                onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                placeholder="+91..."
                value={supplierForm.phone}
                onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="orders@vendor.com"
                value={supplierForm.email}
                onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                placeholder="33AAAAA0000A1Z5"
                value={supplierForm.gstin}
                onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Terms
              </label>
              <select
                value={supplierForm.paymentTerms}
                onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              >
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 45">Net 45 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="Advance">100% Advance</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Supplier Location &amp; Address
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Street / Industrial Area"
                  value={supplierForm.address?.street || ''}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      address: { ...supplierForm.address, street: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="City"
                  value={supplierForm.address?.city || ''}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      address: { ...supplierForm.address, city: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Pincode"
                  value={supplierForm.address?.pincode || ''}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      address: { ...supplierForm.address, pincode: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Bank Details for Remittance (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={supplierForm.bankDetails?.bankName || ''}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      bankDetails: { ...supplierForm.bankDetails, bankName: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Account Number"
                  value={supplierForm.bankDetails?.accountNumber || ''}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      bankDetails: { ...supplierForm.bankDetails, accountNumber: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="IFSC Code"
                  value={supplierForm.bankDetails?.ifscCode || ''}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      bankDetails: { ...supplierForm.bankDetails, ifscCode: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs uppercase"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsSupplierModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={formSaving}>
              {formSaving ? 'Saving...' : 'Save Supplier'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPurchasesPage;
