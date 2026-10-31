import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, Eye, ShieldAlert, Tag, Percent, Edit3 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';
import { getProductImageUrl } from '../../utils/productImages';

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Details Modal
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Rate Tier Edit Modal
  const [rateEditCustomer, setRateEditCustomer] = useState(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('new_user');
  const [customMarkup, setCustomMarkup] = useState(5);
  const [rateUpdating, setRateUpdating] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllCustomers({
        search: search.trim() || undefined,
        limit: 50,
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

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const handleOpenRateModal = (customer) => {
    setRateEditCustomer(customer);
    const isNew = Boolean(customer.isNewUser || customer.pricingTier === 'new_user');
    setSelectedTier(isNew ? 'new_user' : 'existing_standard');
    setCustomMarkup(isNew ? (customer.markupPercentage ?? 5) : 0);
    setIsRateModalOpen(true);
  };

  const handleSaveRate = async (e) => {
    e.preventDefault();
    setRateUpdating(true);
    try {
      const isNewUser = selectedTier === 'new_user';
      const markupPercentage = isNewUser ? Number(customMarkup) || 5 : 0;

      await api.patch(`/users/customers/${rateEditCustomer._id}/rate`, {
        isNewUser,
        pricingTier: selectedTier,
        markupPercentage,
      });

      showSuccessAlert(
        'Pricing Rate Updated',
        `Assigned ${isNewUser ? `New User Rate (+${markupPercentage}%)` : 'Existing Standard Wholesale (0% Surcharge)'} to ${rateEditCustomer.name}.`
      );
      setIsRateModalOpen(false);
      fetchCustomers();
    } catch (err) {
      showErrorAlert('Update Failed', err.message);
    } finally {
      setRateUpdating(false);
    }
  };

  const handleViewCustomer = async (id) => {
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const res = await adminService.getCustomerDetails(id);
      if (res.success) {
        setSelectedUserDetail(res.data);
      }
    } catch (err) {
      showErrorAlert('Error', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Customer Directory & Assigned Pricing Rates</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Display and manage applicable pricing rates assigned to each customer (Percentage-based rate for new users vs Standard 0% for existing clients).
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-72">
          <input
            type="text"
            placeholder="Search name, email, phone..."
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

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-navy font-bold">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">City / State</th>
                  <th className="py-3 px-4 text-center">Applicable Rate (Assigned)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const isNew = Boolean(c.isNewUser || c.pricingTier === 'new_user');
                  const markup = isNew ? (c.markupPercentage ?? 5) : 0;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/50 transition-smooth">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="w-9 h-9 rounded-full object-cover border"
                          />
                          <div>
                            <p className="font-bold text-darkText">{c.name}</p>
                            <p className="text-[11px] text-secondaryText">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-secondaryText font-mono">{c.phone || 'N/A'}</td>

                      <td className="py-3 px-4 text-secondaryText">
                        {c.address?.city ? `${c.address.city}, ${c.address.state || 'TN'}` : 'Not provided'}
                      </td>

                      {/* Applicable Rate Assigned to Customer (Requirement 1) */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${
                              isNew
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {isNew ? `New User Rate (+${markup}%)` : 'Existing Standard (0% Extra)'}
                          </span>
                          <button
                            onClick={() => handleOpenRateModal(c)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-navy transition-smooth"
                            title="Edit Customer Rate"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-smooth ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Deactivated'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-secondaryText">{formatDate(c.createdAt)}</td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleViewCustomer(c._id)}
                          className="p-1.5 text-slate-500 hover:text-navy rounded-lg hover:bg-slate-100"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Edit Customer Rate Modal */}
      <Modal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        title={`Assign Pricing Rate: ${rateEditCustomer?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveRate} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
            <p className="font-bold text-navy">{rateEditCustomer?.name}</p>
            <p className="text-secondaryText">{rateEditCustomer?.email}</p>
            <p className="text-[11px] text-slate-500">
              Select whether this client is charged the new user percentage surcharge or receives the existing standard wholesale rate (0% extra).
            </p>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Customer Rate Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
            >
              <option value="new_user">New User Rate (Apply Percentage Surcharge)</option>
              <option value="existing_standard">Existing Standard Client (0% Surcharge)</option>
            </select>
          </div>

          {selectedTier === 'new_user' && (
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Percentage Surcharge Rate (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={customMarkup}
                onChange={(e) => setCustomMarkup(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono bg-slate-50 text-navy"
              />
              <p className="text-[10px] text-secondaryText">
                Applied to base catalog price only for this user on checkout.
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              isLoading={rateUpdating}
            >
              Save Rate Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Full Profile & History Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Customer Profile & History"
        maxWidth="max-w-3xl"
      >
        {modalLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : selectedUserDetail ? (
          <div className="space-y-6 text-xs text-darkText">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border">
              <img
                src={selectedUserDetail.user?.avatar}
                alt={selectedUserDetail.user?.name}
                className="w-14 h-14 rounded-2xl object-cover border"
              />
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-navy">{selectedUserDetail.user?.name}</h3>
                <p className="text-secondaryText">{selectedUserDetail.user?.email}</p>
                <p className="text-secondaryText">{selectedUserDetail.user?.phone}</p>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 mt-1">
                  Rate Assigned: {selectedUserDetail.user?.isNewUser ? 'New User Rate' : 'Standard Wholesale'}
                </span>
              </div>
            </div>

            {/* Bookings */}
            <div className="space-y-2">
              <h4 className="font-bold text-navy uppercase text-[11px]">
                Order History ({selectedUserDetail.bookings?.length || 0})
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedUserDetail.bookings?.map((b) => (
                  <div key={b._id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getProductImageUrl(b.serviceSnapshot)}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover border shrink-0"
                      />
                      <div>
                        <p className="font-mono font-bold text-primary">#{b.bookingNumber}</p>
                        <p className="text-darkText font-semibold line-clamp-1">{b.serviceSnapshot?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-navy">{formatCurrency(b.totalAmount)}</p>
                      <span className="text-[10px] font-bold uppercase">{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
