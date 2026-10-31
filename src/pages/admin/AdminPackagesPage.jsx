import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, Star, CheckCircle, PlusCircle, MinusCircle } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from '../../utils/alerts';

export const AdminPackagesPage = () => {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const initialForm = {
    service: '',
    name: '',
    price: '',
    discountPrice: '',
    duration: 'Standard Duration',
    features: '',
    addOns: [],
    isPopular: false,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  // Fetch Services
  useEffect(() => {
    const fetchServicesList = async () => {
      try {
        const res = await contentService.getServices({ all: 'true', limit: 100 });
        if (res.success && res.data && res.data.length > 0) {
          setServices(res.data);
          setSelectedServiceId(res.data[0]._id);
        }
      } catch (err) {
        console.error('[Services Error]', err);
      }
    };
    fetchServicesList();
  }, []);

  // Fetch Packages for Selected Service
  const fetchPackages = async () => {
    if (!selectedServiceId) return;
    setLoading(true);
    try {
      const res = await contentService.getPackagesByService(selectedServiceId);
      if (res.success) {
        setPackages(res.data || []);
      }
    } catch (err) {
      console.error('[Packages Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [selectedServiceId]);

  const handleOpenCreate = () => {
    setEditingPkgId(null);
    setFormData({ ...initialForm, service: selectedServiceId });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPkgId(pkg._id);
    setFormData({
      service: pkg.service,
      name: pkg.name,
      price: pkg.price,
      discountPrice: pkg.discountPrice || '',
      duration: pkg.duration || '',
      features: (pkg.features || []).join('\n'),
      addOns: pkg.addOns || [],
      isPopular: Boolean(pkg.isPopular),
      isActive: Boolean(pkg.isActive),
    });
    setIsModalOpen(true);
  };

  // Add / Remove Add-ons
  const handleAddAddOn = () => {
    setFormData({
      ...formData,
      addOns: [...formData.addOns, { name: '', price: 0, description: '' }],
    });
  };

  const handleRemoveAddOn = (idx) => {
    const updated = [...formData.addOns];
    updated.splice(idx, 1);
    setFormData({ ...formData, addOns: updated });
  };

  const handleAddOnChange = (idx, key, val) => {
    const updated = [...formData.addOns];
    updated[idx][key] = key === 'price' ? Number(val) : val;
    setFormData({ ...formData, addOns: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    setModalLoading(true);
    try {
      const payload = {
        ...formData,
        service: selectedServiceId,
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice) || 0,
        features: formData.features.split('\n').map((f) => f.trim()).filter(Boolean),
      };

      if (editingPkgId) {
        await adminService.updatePackage(editingPkgId, payload);
        showSuccessAlert('Package Updated', `${formData.name} saved successfully.`);
      } else {
        await adminService.createPackage(payload);
        showSuccessAlert('Package Created', `${formData.name} added to service.`);
      }

      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      showErrorAlert('Error', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (pkgId, pkgName) => {
    const confirmed = await showConfirmDialog(`Delete Package "${pkgName}"?`, 'This will remove the package tier.');
    if (!confirmed) return;

    try {
      await adminService.deletePackage(pkgId);
      showSuccessAlert('Deleted', 'Package removed.');
      fetchPackages();
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <span>Package & Tier Management</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Configure pricing tiers, inclusions, and tailored optional add-ons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-navy focus:outline-none"
          >
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <Button variant="accent" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Package</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : packages.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-navy font-bold">
                <th className="py-3 px-4">Package Name</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Add-Ons</th>
                <th className="py-3 px-4 text-center">Popular</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packages.map((pkg) => (
                <tr key={pkg._id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-darkText">{pkg.name}</td>
                  <td className="py-3 px-4 font-black text-navy">
                    {formatCurrency(pkg.price)}
                    {pkg.discountPrice > 0 && (
                      <span className="block text-[10px] text-emerald-600 font-bold">
                        Promo: {formatCurrency(pkg.discountPrice)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-secondaryText">{pkg.duration}</td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {pkg.addOns?.length || 0} configured
                  </td>
                  <td className="py-3 px-4 text-center">
                    {pkg.isPopular ? (
                      <span className="text-yellow-700 font-bold bg-yellow-100 px-2 py-0.5 rounded-full text-[10px]">
                        Yes
                      </span>
                    ) : (
                      'No'
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        pkg.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(pkg)}
                        className="p-1.5 text-slate-500 hover:text-primary rounded-lg hover:bg-slate-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg._id, pkg.name)}
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
          <div className="py-16 text-center text-xs text-secondaryText">
            No packages added for this service yet. Click "Add Package" above.
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPkgId ? 'Edit Package' : 'Create Package'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-darkText">Package Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-darkText">Discount Price (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-darkText">Duration</label>
              <input
                type="text"
                placeholder="e.g. 5 Days / 4 Nights"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Included Features (1 per line)</label>
            <textarea
              rows={3}
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          {/* Add-ons Builder */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-navy uppercase text-[11px]">Optional Add-Ons</span>
              <button
                type="button"
                onClick={handleAddAddOn}
                className="text-primary font-bold hover:underline flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {formData.addOns.map((ao, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Add-on Name"
                    value={ao.name}
                    onChange={(e) => handleAddOnChange(idx, 'name', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={ao.price}
                    onChange={(e) => handleAddOnChange(idx, 'price', e.target.value)}
                    className="w-24 px-2.5 py-1.5 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAddOn(idx)}
                    className="text-danger p-1"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="rounded text-primary h-4 w-4"
              />
              <span>Mark as Most Popular</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-primary h-4 w-4"
              />
              <span>Active</span>
            </label>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalLoading}>
              Save Package
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
