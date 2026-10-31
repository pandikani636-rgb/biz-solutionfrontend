import React, { useState, useEffect } from 'react';
import { TicketPercent, Plus, Edit2, Trash2, Calendar, Tag } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from '../../utils/alerts';

export const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const initialForm = {
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minBookingAmount: 0,
    maxDiscount: 0,
    validUntil: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    usageLimit: 100,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCoupons();
      if (res.success) setCoupons(res.data || []);
    } catch (err) {
      console.error('[Coupons Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCouponId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCouponId(c._id);
    setFormData({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      minBookingAmount: c.minBookingAmount || 0,
      maxDiscount: c.maxDiscount || 0,
      validUntil: new Date(c.validUntil).toISOString().slice(0, 10),
      usageLimit: c.usageLimit || 100,
      isActive: Boolean(c.isActive),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) return;

    setModalLoading(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: Number(formData.discountValue),
        minBookingAmount: Number(formData.minBookingAmount) || 0,
        maxDiscount: Number(formData.maxDiscount) || 0,
        usageLimit: Number(formData.usageLimit) || 100,
      };

      if (editingCouponId) {
        await adminService.updateCoupon(editingCouponId, payload);
        showSuccessAlert('Coupon Updated', `${payload.code} updated.`);
      } else {
        await adminService.createCoupon(payload);
        showSuccessAlert('Coupon Created', `${payload.code} is now live.`);
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      showErrorAlert('Error', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (cId, cCode) => {
    const confirmed = await showConfirmDialog(`Delete Coupon "${cCode}"?`, 'This will deactivate the promo code.');
    if (!confirmed) return;

    try {
      await adminService.deleteCoupon(cId);
      showSuccessAlert('Deleted', 'Coupon removed.');
      fetchCoupons();
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <TicketPercent className="w-5 h-5 text-primary" />
            <span>Promotional Coupons & Discount Rules</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Configure promotional codes with server-validated rules, percentage/flat discounts, and redemption caps.
          </p>
        </div>

        <Button variant="accent" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Create Coupon</span>
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : coupons.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-navy font-bold">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min. Spend</th>
                <th className="py-3 px-4">Used / Limit</th>
                <th className="py-3 px-4">Expires On</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-primary bg-lightBlue px-2.5 py-1 rounded-lg">
                      {c.code}
                    </span>
                    <p className="text-[11px] text-secondaryText mt-1">{c.description}</p>
                  </td>

                  <td className="py-3 px-4 font-black text-navy">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% OFF`
                      : formatCurrency(c.discountValue) + ' FLAT'}
                    {c.maxDiscount > 0 && (
                      <span className="block text-[10px] text-secondaryText">Max ₹{c.maxDiscount}</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-secondaryText">{formatCurrency(c.minBookingAmount)}</td>

                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {c.usedCount} / {c.usageLimit}
                  </td>

                  <td className="py-3 px-4 text-secondaryText">{formatDate(c.validUntil)}</td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        c.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Expired'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-500 hover:text-navy rounded-lg hover:bg-slate-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id, c.code)}
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
          <div className="py-16 text-center text-xs text-secondaryText">No coupon codes created yet.</div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCouponId ? 'Edit Promo Coupon' : 'Create Promo Coupon'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-darkText">Coupon Code (Uppercase) *</label>
            <input
              type="text"
              required
              placeholder="e.g. FESTIVE20"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl font-mono uppercase font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-bold"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-darkText">Discount Value *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Min. Booking (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.minBookingAmount}
                onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-darkText">Max Discount Cap (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-darkText">Usage Limit</label>
              <input
                type="number"
                min="1"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Expiry Date *</label>
            <input
              type="date"
              required
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="couponActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-primary h-4 w-4"
            />
            <label htmlFor="couponActive" className="font-semibold text-darkText cursor-pointer">
              Active for Customer Checkout
            </label>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalLoading}>
              Save Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
