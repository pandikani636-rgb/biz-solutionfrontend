import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Layers,
  Filter,
  CheckCircle2,
  Clock,
  CreditCard,
  Users,
  Camera,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';
import * as XLSX from 'xlsx';

export const AdminReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [reportResult, setReportResult] = useState(null);

  // Generate Report Selection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState('comprehensive');
  const [selectedModules, setSelectedModules] = useState([
    'orders',
    'payments',
    'quotations',
    'customers',
    'uploads',
  ]);
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exportFormat, setExportFormat] = useState('json');

  // Initial load
  useEffect(() => {
    handleRunReport('comprehensive', ['orders', 'payments', 'quotations', 'customers', 'uploads'], 'all', 'all');
  }, []);

  const handleModuleToggle = (mod) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const handleRunReport = async (type, mods, range, st) => {
    setLoading(true);
    try {
      const res = await api.post('/stats/dynamic-report', {
        reportType: type || reportType,
        modules: mods || selectedModules,
        dateRange: range || dateRange,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: st || statusFilter,
        format: 'json',
      });

      if (res.data?.success) {
        setReportResult(res.data.data);
      }
    } catch (err) {
      console.error('[Report Gen Error]', err);
      showErrorAlert('Report Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (exportFormat === 'excel') {
      // Download directly from backend Excel stream
      const queryParams = new URLSearchParams({
        reportType,
        dateRange,
        status: statusFilter,
      });

      try {
        const response = await api.post(
          '/stats/dynamic-report',
          {
            reportType,
            modules: selectedModules,
            dateRange,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            status: statusFilter,
            format: 'excel',
          },
          { responseType: 'blob' }
        );

        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Balumuni_Report_${reportType}_${Date.now()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        showSuccessAlert('Excel Generated', 'Your dynamic Excel report has been downloaded successfully.');
        setIsModalOpen(false);
      } catch (err) {
        showErrorAlert('Download Error', err.message);
      }
      return;
    }

    // JSON / Printable Report
    await handleRunReport(reportType, selectedModules, dateRange, statusFilter);
    setIsModalOpen(false);
    showToast('Report generated successfully');
  };

  const s = reportResult?.summary || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner with Generate Report Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <span>Dynamic Report Generation System</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Generate customized audit reports across all website modules: Orders, Payments, Quotations, Customer Rates, and Uploaded Images.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </Button>

          {/* Trigger Generate Report Selection Interface (Requirement 2) */}
          <Button
            variant="accent"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="font-black inline-flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Custom Report</span>
          </Button>
        </div>
      </div>

      {/* Verified Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <p className="text-xs font-bold text-secondaryText uppercase tracking-wider">Gross Bookings Volume</p>
          <p className="text-3xl font-black text-navy">{s.orders?.totalOrders || 0}</p>
          <p className="text-xs text-emerald-600 font-semibold">{s.orders?.confirmedOrders || 0} Confirmed / Settled</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <p className="text-xs font-bold text-secondaryText uppercase tracking-wider">Settled Net Revenue</p>
          <p className="text-3xl font-black text-navy">{formatCurrency(s.financial?.settledRevenue || 0)}</p>
          <p className="text-xs text-secondaryText">GST 18% Input credit invoices issued</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <p className="text-xs font-bold text-secondaryText uppercase tracking-wider">Customer Accounts & Rates</p>
          <p className="text-3xl font-black text-navy">{s.customers?.totalCustomers || 0}</p>
          <p className="text-xs text-amber-700 font-semibold">{s.customers?.newUsersOnboardingRate || 0} New User Rate Assigned</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <p className="text-xs font-bold text-secondaryText uppercase tracking-wider">Quotations & Inquiries</p>
          <p className="text-3xl font-black text-purple-700">{s.quotations?.totalRequests || 0}</p>
          <p className="text-xs text-purple-800 font-semibold">{s.quotations?.approvedQuotations || 0} Approved Quotations</p>
        </div>
      </div>

      {/* Generated Report Data Display */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : reportResult ? (
        <div className="space-y-8">
          
          {/* Printable Report Header */}
          <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4">
            <h1 className="text-2xl font-black uppercase text-[#0F3D68]">BALUMUNI AND ASSOCIATES</h1>
            <p className="text-xs font-bold">45B/16 Noorullah Mall, Srivilliputtur, Virudhunagar Dist, Tamilnadu - 626125</p>
            <p className="text-xs font-bold">Comprehensive Business & Financial Audit Report • {new Date().toLocaleDateString()}</p>
          </div>

          {/* 1. Orders Table (if included) */}
          {reportResult.orders?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-base text-navy flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span>Orders & Bookings Ledger ({reportResult.orders.length} Records)</span>
                </h3>
                <span className="text-xs font-black text-navy font-mono">
                  Gross: {formatCurrency(s.orders?.grossOrderValue || 0)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                    <tr>
                      <th className="py-2.5 px-3">Order Ref</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Part / Service</th>
                      <th className="py-2.5 px-3 text-right">Base Price</th>
                      <th className="py-2.5 px-3 text-right">GST (18%)</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {reportResult.orders.map((o, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">#{o.bookingNumber}</td>
                        <td className="py-2.5 px-3">{o.customerName}</td>
                        <td className="py-2.5 px-3 font-semibold">{o.serviceName}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(o.baseAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(o.taxAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-navy">{formatCurrency(o.totalAmount)}</td>
                        <td className="py-2.5 px-3 text-center uppercase font-bold text-[10px]">{o.status}</td>
                        <td className="py-2.5 px-3 text-slate-500">{o.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Quotations Table (if included) */}
          {reportResult.quotations?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-base text-navy flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-accent" />
                  <span>Quotations & RFQs Pipeline ({reportResult.quotations.length} Requests)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                    <tr>
                      <th className="py-2.5 px-3">Quotation #</th>
                      <th className="py-2.5 px-3">Client / Company</th>
                      <th className="py-2.5 px-3">Requested Parts</th>
                      <th className="py-2.5 px-3 text-right">Target Price</th>
                      <th className="py-2.5 px-3 text-right">Approved Price</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {reportResult.quotations.map((q, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{q.quotationNumber}</td>
                        <td className="py-2.5 px-3 font-bold">{q.clientName} ({q.companyName})</td>
                        <td className="py-2.5 px-3 font-semibold">{q.partNumbers} (Qty: {q.quantity})</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(q.targetPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700">
                          {q.approvedPrice > 0 ? formatCurrency(q.approvedPrice) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center uppercase font-bold text-[10px]">{q.status}</td>
                        <td className="py-2.5 px-3 text-slate-500">{q.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Customers & Assigned Rates Table (if included) */}
          {reportResult.customers?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-base text-navy flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Customer Directory & Assigned Pricing Rates ({reportResult.customers.length} Accounts)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                    <tr>
                      <th className="py-2.5 px-3">Customer Name</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">City</th>
                      <th className="py-2.5 px-3 text-center">Assigned Rate Tier</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {reportResult.customers.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-darkText">{c.name}</td>
                        <td className="py-2.5 px-3 text-secondaryText">{c.email}</td>
                        <td className="py-2.5 px-3">{c.city}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                            c.markupPercentage > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {c.assignedRateLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">{c.status}</td>
                        <td className="py-2.5 px-3 text-slate-500">{c.joinedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Uploaded Images Specs Table (if included) */}
          {reportResult.uploads?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-base text-navy flex items-center gap-2">
                  <Camera className="w-5 h-5 text-accent" />
                  <span>User Uploaded Part Specifications ({reportResult.uploads.length} Records)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                    <tr>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">City</th>
                      <th className="py-2.5 px-3">File / Image</th>
                      <th className="py-2.5 px-3">Resolution (MP)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3">Upload Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {reportResult.uploads.map((u, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold">{u.customerName}</td>
                        <td className="py-2.5 px-3">{u.city}</td>
                        <td className="py-2.5 px-3 text-secondaryText">{u.fileName}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{u.resolution}</td>
                        <td className="py-2.5 px-3 text-center uppercase font-bold text-[10px]">{u.status}</td>
                        <td className="py-2.5 px-3 text-slate-500">{u.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Printable Tamil Tagline at Report Footer */}
          <div className="p-4 rounded-2xl bg-slate-50 border text-center">
            <p className="text-sm font-black text-[#7D0038]">
              உங்கள் நம்பிக்கையில் எங்கள் பயணம்!
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Balumuni & Associates • Srivilliputtur, Virudhunagar Dist, Tamil Nadu
            </p>
          </div>
        </div>
      ) : null}

      {/* Generate Report Selection Interface Modal (Requirement 2) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Dynamic Report - Selection Interface"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6 text-xs text-darkText">
          {/* Report Category */}
          <div className="space-y-1.5">
            <label className="block font-bold text-navy uppercase text-[11px] tracking-wider">
              1. Select Report Category
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold bg-slate-50 text-navy"
            >
              <option value="comprehensive">Comprehensive Executive Audit (All Modules Combined)</option>
              <option value="orders">Orders & Bookings Ledger</option>
              <option value="financial">Financial & Revenue Ledger</option>
              <option value="quotations">Quotations & RFQs Pipeline</option>
              <option value="customers">Customer Directory & Assigned Rates</option>
              <option value="uploads">User Uploaded Images & Spec Tracker</option>
            </select>
          </div>

          {/* Module Checkboxes */}
          <div className="space-y-1.5">
            <label className="block font-bold text-navy uppercase text-[11px] tracking-wider">
              2. Include Modules
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border">
              {[
                { id: 'orders', label: 'Orders & Bookings' },
                { id: 'payments', label: 'Payments & Revenue' },
                { id: 'quotations', label: 'Quotations / RFQs' },
                { id: 'customers', label: 'Customers & Rates' },
                { id: 'uploads', label: 'Uploaded Images' },
              ].map((m) => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(m.id)}
                    onChange={() => handleModuleToggle(m.id)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range & Status Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-navy uppercase text-[11px] tracking-wider">
                3. Date Range Filter
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold bg-slate-50"
              >
                <option value="all">All Available Records</option>
                <option value="today">Today Only</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="thisMonth">Current Month</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-navy uppercase text-[11px] tracking-wider">
                4. Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold bg-slate-50"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed / Approved Only</option>
                <option value="pending">Pending Only</option>
                <option value="completed">Completed Only</option>
              </select>
            </div>
          </div>

          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-2xl border">
              <div>
                <label className="block text-[11px] font-bold text-slate-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Export Format (PDF vs Excel) */}
          <div className="space-y-1.5">
            <label className="block font-bold text-navy uppercase text-[11px] tracking-wider">
              5. Select Export Format
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-smooth ${
                  exportFormat === 'json' ? 'border-primary bg-lightBlue/50' : 'border-slate-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={() => setExportFormat('json')}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <p className="font-black text-navy text-xs">Printable / PDF Format</p>
                  <p className="text-[10px] text-secondaryText">Formatted view with Balumuni letterhead</p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-smooth ${
                  exportFormat === 'excel' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={() => setExportFormat('excel')}
                  className="text-emerald-600 focus:ring-emerald-600"
                />
                <div>
                  <p className="font-black text-emerald-900 text-xs">Excel Spreadsheet (.xlsx)</p>
                  <p className="text-[10px] text-secondaryText">Multi-sheet workbook with formulas</p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="accent"
              size="md"
              className="font-black inline-flex items-center gap-2 shadow-sm"
            >
              {exportFormat === 'excel' ? (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Excel Report (.xlsx)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Dynamic Report</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
