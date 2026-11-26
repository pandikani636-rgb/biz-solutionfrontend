import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  ShieldAlert,
  Tag,
  Percent,
  Edit3,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  FileSpreadsheet,
  Check,
  X,
  Sliders,
  DollarSign,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { formatDate, formatCurrency, formatDateTime } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';
import { getProductImageUrl } from '../../utils/productImages';

export const AdminCustomersPage = () => {
  // Tabs: 'directory' | 'pricing_rates' (Requirement 13)
  const [activeTab, setActiveTab] = useState('directory');

  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Customer Directory Details Modal
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalLoading, setDetailModalLoading] = useState(false);

  // Assigned Pricing Rates Modal
  const [selectedPricingCustomer, setSelectedPricingCustomer] = useState(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('existing_standard');
  const [customMarkup, setCustomMarkup] = useState(0);
  const [customDiscount, setCustomDiscount] = useState(0);
  const [pricingSaving, setPricingSaving] = useState(false);

  // Fetch Customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllCustomers({
        search: search.trim() || undefined,
        limit: 100,
      });
      if (res.success) {
        setCustomers(res.data || []);
      }
    } catch (err) {
      console.error('[Customers Error]', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Categories to display category-based assigned pricing rates
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.warn('[Categories Fetch Error]', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchCategories();
  }, []);

  // Toggle Account Active / Deactivated
  const handleToggleStatus = async (customer) => {
    try {
      const res = await adminService.toggleCustomerStatus(customer._id);
      if (res.success) {
        showToast(`Customer account ${res.data.isActive ? 'activated' : 'deactivated'}`);
        fetchCustomers();
      }
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  // Quick Toggle User Status: Existing vs New User
  const handleToggleUserType = async (customer) => {
    try {
      const willBeNewUser = !Boolean(customer.isNewUser);
      await api.patch(`/users/customers/${customer._id}/rate`, {
        isNewUser: willBeNewUser,
        pricingTier: willBeNewUser ? 'new_user' : 'existing_standard',
      });
      showToast(`${customer.name} marked as ${willBeNewUser ? 'New User' : 'Existing User'}`);
      fetchCustomers();
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  // Open Full Customer Directory Details Modal (Requirement 13)
  const handleViewCustomerDirectory = async (customer) => {
    setIsDetailModalOpen(true);
    setDetailModalLoading(true);
    try {
      const res = await adminService.getCustomerDetails(customer._id);
      if (res.success) {
        setSelectedCustomerDetail(res.data);
      }
    } catch (err) {
      showErrorAlert('Error', err.message);
    } finally {
      setDetailModalLoading(false);
    }
  };

  // Open Assigned Pricing Rates Modal (Requirement 13)
  const handleOpenPricingRates = (customer) => {
    setSelectedPricingCustomer(customer);
    const isNew = Boolean(customer.isNewUser || customer.pricingTier === 'new_user');
    setSelectedTier(isNew ? 'new_user' : 'existing_standard');
    setCustomMarkup(isNew ? (customer.markupPercentage ?? 5) : 0);
    setCustomDiscount(customer.customDiscountPercentage || 0);
    setIsPricingModalOpen(true);
  };

  // Save Assigned Pricing Rates
  const handleSavePricingRates = async (e) => {
    e.preventDefault();
    setPricingSaving(true);
    try {
      const isNewUser = selectedTier === 'new_user';
      const markupPercentage = isNewUser ? Number(customMarkup) || 5 : 0;
      const customDiscountPercentage = Number(customDiscount) || 0;

      await api.patch(`/users/customers/${selectedPricingCustomer._id}/rate`, {
        isNewUser,
        pricingTier: selectedTier,
        markupPercentage,
        customDiscountPercentage,
      });

      showSuccessAlert(
        'Assigned Pricing Rate Updated!',
        `Assigned ${isNewUser ? 'New User (Guest Offer)' : 'Existing User (Account Offer)'} with ${
          customDiscountPercentage > 0 ? `${customDiscountPercentage}% Custom Discount` : 'Category Default Rates'
        } to ${selectedPricingCustomer.name}.`
      );
      setIsPricingModalOpen(false);
      fetchCustomers();
    } catch (err) {
      showErrorAlert('Update Failed', err.message);
    } finally {
      setPricingSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner with Uppercase Headings (Requirement 14) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
            BALUMUNI AND ASSOCIATES • CLIENT ACCOUNTS & PRICING
          </span>
          <h2 className="text-xl font-black text-navy uppercase tracking-wide mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>CUSTOMER DIRECTORY & ASSIGNED PRICING RATES</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Browse complete customer profiles, manage wholesale pricing tiers, and configure assigned percentage rates per customer.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-72">
          <input
            type="text"
            placeholder="Search name, email, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
          />
          <Button variant="secondary" size="sm" onClick={fetchCustomers}>
            Search
          </Button>
        </div>
      </div>

      {/* Tabs: Customer Directory vs Assigned Pricing Rates (Requirement 13) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
            activeTab === 'directory'
              ? 'bg-navy text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>CUSTOMER DIRECTORY ({customers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pricing_rates')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
            activeTab === 'pricing_rates'
              ? 'bg-navy text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Tag className="w-4 h-4 text-amber-400" />
          <span>ASSIGNED PRICING RATES</span>
        </button>
      </div>

      {/* TAB 1: CUSTOMER DIRECTORY (Requirement 13) */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-navy uppercase tracking-wider">
              Registered Clients & Customer Directory
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Click any customer row to inspect complete customer profile & order history.
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-navy font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">CUSTOMER</th>
                    <th className="py-3.5 px-4">PHONE</th>
                    <th className="py-3.5 px-4">CITY / STATE</th>
                    <th className="py-3.5 px-4 text-center">USER STATUS (EXISTING VS NEW)</th>
                    <th className="py-3.5 px-4 text-center">ACCOUNT STATUS</th>
                    <th className="py-3.5 px-4">JOINED DATE</th>
                    <th className="py-3.5 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => {
                    const isNew = Boolean(c.isNewUser || c.pricingTier === 'new_user');
                    return (
                      <tr
                        key={c._id}
                        onClick={() => handleViewCustomerDirectory(c)}
                        className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      >
                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-primary border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-darkText text-sm">{c.name}</p>
                              <p className="text-[11px] text-secondaryText">
                                {c.companyName ? `${c.companyName} • ` : ''}{c.email}
                              </p>
                              {c.gstin && (
                                <span className="text-[10px] font-mono font-bold text-slate-500">
                                  GST: {c.gstin}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 text-secondaryText font-mono font-bold">
                          {c.phone || 'N/A'}
                        </td>

                        {/* City / State */}
                        <td className="py-3.5 px-4 text-secondaryText">
                          {c.address?.city ? `${c.address.city}, ${c.address.state || 'Tamil Nadu'}` : 'Not provided'}
                        </td>

                        {/* User Status */}
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleUserType(c)}
                              title="Click to toggle between Existing User and New User"
                              className={`px-2.5 py-1 rounded-full text-[11px] font-black border transition-smooth cursor-pointer ${
                                isNew
                                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                              }`}
                            >
                              {isNew ? 'New User (Guest Offer)' : 'Existing User (Account Offer)'}
                            </button>
                            {c.customDiscountPercentage > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200">
                                {c.customDiscountPercentage}% Custom
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Account Status */}
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(c)}
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-smooth cursor-pointer ${
                              c.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {c.isActive ? 'Active' : 'Deactivated'}
                          </button>
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4 text-secondaryText text-[11px]">
                          {formatDate(c.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleViewCustomerDirectory(c)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-navy font-bold text-xs transition-all flex items-center gap-1 ml-auto cursor-pointer"
                            title="View Complete Customer Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-secondaryText">No customers found.</div>
          )}
        </div>
      )}

      {/* TAB 2: ASSIGNED PRICING RATES (Requirement 13) */}
      {activeTab === 'pricing_rates' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                Assigned Wholesale Pricing Rates Directory
              </h3>
              <p className="text-amber-800 mt-0.5">
                Displays the configured discount percentage and markup assigned to every customer. Click "Edit Rate" to customize pricing overrides.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 font-bold text-amber-900 text-xs">
                Default Belts Rate: <strong>48% OFF</strong>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 font-bold text-amber-900 text-xs">
                Bearings: <strong>48% OFF</strong>
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-20 flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : customers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-navy font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">CUSTOMER & COMPANY</th>
                      <th className="py-3.5 px-4 text-center">PRICING CLASSIFICATION</th>
                      <th className="py-3.5 px-4 text-center">BASE MARKUP (%)</th>
                      <th className="py-3.5 px-4 text-center">CUSTOM DISCOUNT (%)</th>
                      <th className="py-3.5 px-4">EFFECTIVE CATEGORY RATES</th>
                      <th className="py-3.5 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((c) => {
                      const isNew = Boolean(c.isNewUser || c.pricingTier === 'new_user');
                      const markup = isNew ? (c.markupPercentage ?? 5) : 0;
                      const customDisc = c.customDiscountPercentage || 0;

                      return (
                        <tr
                          key={c._id}
                          onClick={() => handleOpenPricingRates(c)}
                          className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                        >
                          {/* Customer & Company */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-darkText text-sm">{c.name}</p>
                            <p className="text-[11px] text-secondaryText">
                              {c.companyName ? `${c.companyName} • ` : ''}{c.phone}
                            </p>
                          </td>

                          {/* Pricing Classification */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleToggleUserType(c)}
                              className={`px-3 py-1 rounded-full text-xs font-black border transition-smooth cursor-pointer ${
                                isNew
                                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                              }`}
                            >
                              {isNew ? 'New User (Guest Offer)' : 'Existing User (Account Offer)'}
                            </button>
                          </td>

                          {/* Base Markup % */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold">
                            {markup > 0 ? (
                              <span className="text-rose-600 font-black">+{markup}% Markup</span>
                            ) : (
                              <span className="text-slate-500">0% (Direct Factory)</span>
                            )}
                          </td>

                          {/* Custom Discount % */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold">
                            {customDisc > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 font-black text-xs">
                                {customDisc}% OFF (Custom)
                              </span>
                            ) : (
                              <span className="text-slate-400">Category Default</span>
                            )}
                          </td>

                          {/* Effective Category Rates */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                                PIX: {customDisc > 0 ? `${customDisc}%` : '48%'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                                NBC: {customDisc > 0 ? `${customDisc}%` : '48%'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                                SKF: {customDisc > 0 ? `${customDisc}%` : '10%'}
                              </span>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenPricingRates(c)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition-all flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Pricing Rate</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-secondaryText">No customers found.</div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: CUSTOMER DIRECTORY FULL DETAILS MODAL (Requirement 13) */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="CUSTOMER DIRECTORY — COMPLETE PROFILE & DETAILS"
        maxWidth="max-w-3xl"
      >
        {detailModalLoading ? (
          <div className="py-16 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : selectedCustomerDetail ? (
          <div className="space-y-5 text-xs text-darkText">
            {/* Header Profile Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                  {selectedCustomerDetail.user?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-navy uppercase">
                    {selectedCustomerDetail.user?.name}
                  </h3>
                  <p className="text-slate-600 font-medium">
                    {selectedCustomerDetail.user?.companyName ? `${selectedCustomerDetail.user.companyName} • ` : ''}
                    {selectedCustomerDetail.user?.email}
                  </p>
                  <p className="text-primary font-mono font-bold mt-0.5">
                    {selectedCustomerDetail.user?.phone || 'No phone recorded'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Account Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${
                  selectedCustomerDetail.user?.isActive ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                  {selectedCustomerDetail.user?.isActive ? 'Active Client' : 'Deactivated'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Member Since: {formatDate(selectedCustomerDetail.user?.createdAt)}
                </span>
              </div>
            </div>

            {/* Organized Customer Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company & Billing Information */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-black text-navy uppercase tracking-wider block border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>Company & Tax Information</span>
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Company Name:</span>
                    <span className="font-bold text-navy">{selectedCustomerDetail.user?.companyName || 'Individual / Prop.'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GSTIN Number:</span>
                    <span className="font-mono font-bold text-navy">{selectedCustomerDetail.user?.gstin || 'Not Provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Industry / Trade:</span>
                    <span className="font-medium text-slate-700">{selectedCustomerDetail.user?.industry || 'Industrial Spares / Mills'}</span>
                  </div>
                </div>
              </div>

              {/* Delivery & Address Details */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-black text-navy uppercase tracking-wider block border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Delivery Address & Location</span>
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery City / Hub:</span>
                    <span className="font-bold text-navy">{selectedCustomerDetail.user?.address?.city || 'Madurai / Local Hub'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">State:</span>
                    <span className="font-bold text-navy">{selectedCustomerDetail.user?.address?.state || 'Tamil Nadu'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Street Address:</span>
                    <span className="font-medium text-slate-700 text-right max-w-[180px]">{selectedCustomerDetail.user?.address?.street || 'Factory premises'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Pricing Breakdown */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-amber-950 uppercase tracking-wide block">
                  Assigned Pricing Rates for this Customer:
                </span>
                <p className="text-amber-800 text-xs mt-0.5">
                  Classification: <strong>{selectedCustomerDetail.user?.isNewUser ? 'New User (Guest Offer)' : 'Existing User (Account Offer)'}</strong>
                  {selectedCustomerDetail.user?.customDiscountPercentage > 0 && ` • Custom Discount: ${selectedCustomerDetail.user.customDiscountPercentage}%`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenPricingRates(selectedCustomerDetail.user);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
              >
                Configure Pricing Rates
              </button>
            </div>

            {/* Order History */}
            <div className="space-y-2">
              <span className="font-black text-navy uppercase tracking-wider text-xs block">
                Booking / Order History ({selectedCustomerDetail.bookings?.length || 0})
              </span>
              {selectedCustomerDetail.bookings?.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedCustomerDetail.bookings.map((b) => (
                    <div key={b._id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={getProductImageUrl(b.serviceSnapshot)}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover border shrink-0"
                        />
                        <div>
                          <p className="font-mono font-bold text-primary">#{b.bookingNumber}</p>
                          <p className="text-darkText font-semibold line-clamp-1">{b.serviceSnapshot?.name || 'Wholesale Spares'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-navy">{formatCurrency(b.totalAmount)}</p>
                        <span className="text-[10px] font-bold uppercase">{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic py-2">No bookings placed yet.</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* MODAL 2: ASSIGNED PRICING RATES CONFIGURATION MODAL (Requirement 13) */}
      <Modal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        title={`ASSIGNED PRICING RATES: ${selectedPricingCustomer?.name?.toUpperCase()}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSavePricingRates} className="space-y-4 text-xs">
          {/* Customer Profile Summary */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-black text-navy text-sm">{selectedPricingCustomer?.name}</h4>
                <p className="text-slate-600 font-medium">{selectedPricingCustomer?.companyName || 'Individual Customer'} • {selectedPricingCustomer?.phone}</p>
              </div>
              <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                {selectedPricingCustomer?.email}
              </span>
            </div>
          </div>

          {/* Pricing Classification Selector */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Customer Wholesale Pricing Classification *
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold bg-white text-navy"
            >
              <option value="existing_standard">
                Existing User (Account Created — Standard Factory Rate, 0% Markup)
              </option>
              <option value="new_user">
                New User (Guest Rate — 5% New User Markup Applied)
              </option>
            </select>
          </div>

          {/* Markup % Configuration (if new user) */}
          {selectedTier === 'new_user' && (
            <div className="space-y-1 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <label className="block font-bold text-amber-950">
                New User Markup Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={customMarkup}
                onChange={(e) => setCustomMarkup(e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded-xl font-bold font-mono bg-white text-navy"
              />
              <p className="text-[10px] text-amber-800">
                Default for new unregistered users is 5%.
              </p>
            </div>
          )}

          {/* Custom Discount Override */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Custom Assigned Discount Percentage (%) <span className="font-normal text-slate-400">(Optional Override)</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(e.target.value)}
              placeholder="0 (uses default category wholesale rates)"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold font-mono bg-white text-navy"
            />
            <p className="text-[10px] text-slate-500">
              Set to 0 to use standard category percentage rates. Enter a specific value (e.g. 50) to give this client a uniform custom rate across all catalogs.
            </p>
          </div>

          {/* Live Category Rates Preview Table */}
          <div className="space-y-1.5 pt-1">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
              Assigned Category Discount Preview
            </span>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3">Product Category</th>
                    <th className="py-2 px-3 text-center">Category Default</th>
                    <th className="py-2 px-3 text-right">Assigned to this Customer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 font-medium">PIX Industrial V-Belts</td>
                    <td className="py-2 px-3 text-center font-mono">48% OFF</td>
                    <td className="py-2 px-3 text-right font-mono font-black text-emerald-700">
                      {customDiscount > 0 ? `${customDiscount}% OFF` : '48% OFF'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">NBC / Timken Bearings</td>
                    <td className="py-2 px-3 text-center font-mono">48% OFF</td>
                    <td className="py-2 px-3 text-right font-mono font-black text-emerald-700">
                      {customDiscount > 0 ? `${customDiscount}% OFF` : '48% OFF'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">SKF Explorer Bearings</td>
                    <td className="py-2 px-3 text-center font-mono">10% OFF</td>
                    <td className="py-2 px-3 text-right font-mono font-black text-emerald-700">
                      {customDiscount > 0 ? `${customDiscount}% OFF` : '10% OFF'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Fenner Pulleys & Bushes</td>
                    <td className="py-2 px-3 text-center font-mono">25% OFF</td>
                    <td className="py-2 px-3 text-right font-mono font-black text-emerald-700">
                      {customDiscount > 0 ? `${customDiscount}% OFF` : '25% OFF'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPricingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              isLoading={pricingSaving}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md"
            >
              Save Assigned Pricing Rate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
