import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  CheckCircle,
  XCircle,
  Upload,
  Layers,
  Clock,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { adminService } from '../../services/adminService';
import { useSite } from '../../context/SiteContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';

export const AdminServicesPage = () => {
  const { categories } = useSite();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    category: '',
    serviceType: 'general',
    basePrice: '',
    discountPrice: '',
    taxRate: 18,
    processingTime: '24-48 Hours',
    shortDescription: '',
    fullDescription: '',
    mainImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
    isActive: true,
    requiredFormFields: [],
    features: '',
    terms: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await contentService.getServices({
        all: 'true', // fetch all including inactive
        search: search.trim() || undefined,
        category: selectedCat || undefined,
        limit: 50,
      });
      if (res.success) {
        setServices(res.data || []);
      }
    } catch (err) {
      console.error('[Admin Services Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedCat]);

  const handleOpenCreateModal = () => {
    setEditingServiceId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingServiceId(service._id);
    setFormData({
      name: service.name,
      category: service.category?._id || service.category,
      serviceType: service.serviceType || 'general',
      basePrice: service.basePrice,
      discountPrice: service.discountPrice || '',
      taxRate: service.taxRate || 18,
      processingTime: service.processingTime || '24-48 Hours',
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription,
      mainImage: service.mainImage,
      isFeatured: Boolean(service.isFeatured),
      isActive: Boolean(service.isActive),
      requiredFormFields: service.requiredFormFields || [],
      features: (service.features || []).join('\n'),
      terms: (service.terms || []).join('\n'),
    });
    setIsModalOpen(true);
  };

  // Dynamic Form Field Builder in Modal
  const handleAddField = () => {
    setFormData({
      ...formData,
      requiredFormFields: [
        ...formData.requiredFormFields,
        {
          fieldName: `field_${Date.now()}`,
          label: 'New Required Field',
          fieldType: 'text',
          required: true,
          placeholder: '',
          options: [],
        },
      ],
    });
  };

  const handleRemoveField = (idx) => {
    const updated = [...formData.requiredFormFields];
    updated.splice(idx, 1);
    setFormData({ ...formData, requiredFormFields: updated });
  };

  const handleFieldChange = (idx, key, val) => {
    const updated = [...formData.requiredFormFields];
    if (key === 'options') {
      updated[idx][key] = val.split(',').map((o) => o.trim()).filter(Boolean);
    } else {
      updated[idx][key] = val;
    }
    setFormData({ ...formData, requiredFormFields: updated });
  };

  // Image Upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      showToast('Uploading image...');
      const res = await adminService.uploadImage(data);
      if (res.success && res.url) {
        setFormData({ ...formData, mainImage: res.url });
        showToast('Image uploaded successfully');
      }
    } catch (err) {
      showErrorAlert('Upload Failed', err.message);
    }
  };

  // Save Service
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.basePrice) {
      showErrorAlert('Missing Information', 'Please provide service name, category, and base price.');
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        ...formData,
        basePrice: Number(formData.basePrice),
        discountPrice: Number(formData.discountPrice) || 0,
        taxRate: Number(formData.taxRate) || 18,
        features: formData.features.split('\n').map((f) => f.trim()).filter(Boolean),
        terms: formData.terms.split('\n').map((t) => t.trim()).filter(Boolean),
      };

      if (editingServiceId) {
        await adminService.updateService(editingServiceId, payload);
        showSuccessAlert('Service Updated', `${formData.name} was saved successfully.`);
      } else {
        await adminService.createService(payload);
        showSuccessAlert('Service Created', `${formData.name} has been published.`);
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      showErrorAlert('Save Failed', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Delete Service with Dependency Check
  const handleDeleteService = async (serviceId, serviceName) => {
    const confirmed = await showConfirmDialog(
      `Delete "${serviceName}"?`,
      'This action will permanently delete this service and its packages if no active bookings depend on it.'
    );
    if (!confirmed) return;

    try {
      await adminService.deleteService(serviceId);
      showSuccessAlert('Deleted', 'Service removed successfully.');
      fetchServices();
    } catch (err) {
      showErrorAlert('Delete Prevented', err.message);
    }
  };

  // Quick toggle active / featured
  const handleToggleActive = async (service) => {
    try {
      await adminService.updateService(service._id, { isActive: !service.isActive });
      fetchServices();
      showToast(`Service ${!service.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <span>Service Catalog Management</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Create and edit dynamic services, configure custom required customer fields, and manage availability.
          </p>
        </div>

        <Button variant="accent" onClick={handleOpenCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New Service</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search services by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchServices()}
            className="w-full text-xs font-medium focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-darkText focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button variant="secondary" size="sm" onClick={fetchServices}>
            Filter
          </Button>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-navy font-bold">
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4 text-center">Custom Fields</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 transition-smooth">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.mainImage}
                          alt={s.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {s.brand && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                                {s.brand}
                              </span>
                            )}
                            <p className="font-bold text-darkText leading-tight">{s.name}</p>
                          </div>
                          {s.partNumber && (
                            <p className="font-mono text-[11px] font-bold text-primary">{s.partNumber}</p>
                          )}
                          <p className="text-[10px] text-secondaryText capitalize">{s.serviceType}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-primary">
                      {s.category?.name || 'Unassigned'}
                    </td>

                    <td className="py-3 px-4 font-black text-navy">
                      {formatCurrency(s.basePrice)}
                      {s.discountPrice > 0 && (
                        <span className="block text-[10px] text-emerald-600 font-bold">
                          Promo: {formatCurrency(s.discountPrice)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {s.requiredFormFields?.length || 0} fields
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {s.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-yellow-600" /> Yes
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">No</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-smooth ${
                          s.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition-smooth"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(s._id, s.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-rose-50 transition-smooth"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-secondaryText">No services found.</div>
        )}
      </div>

      {/* Create / Edit Service Modal with Dynamic Field Builder */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingServiceId ? 'Edit Service & Form Fields' : 'Create New Service'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSaveService} className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Service Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-darkText">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Base Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
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
              <label className="font-semibold text-darkText">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-darkText">Processing Time</label>
              <input
                type="text"
                value={formData.processingTime}
                onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          {/* Image & Service Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Main Image URL or Upload *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.mainImage}
                  onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-xl"
                />
                <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer font-bold flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-darkText">Service Type (Behavioral Flag)</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value="general">General Service</option>
                <option value="travel">Travel & Holiday</option>
                <option value="recharge">FASTag / Toll Recharge</option>
                <option value="insurance">Insurance & Healthcare</option>
                <option value="logistics">Logistics & Freight</option>
                <option value="education">Education & Course</option>
                <option value="business">Business & Corporate Filing</option>
              </select>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Short Summary (Max 300 characters) *</label>
              <input
                type="text"
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-darkText">Full Detailed Description *</label>
              <textarea
                rows={3}
                required
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          {/* DYNAMIC FORM FIELDS BUILDER */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-xs text-navy uppercase tracking-wider">
                  Configurable Customer Form Fields
                </h4>
                <p className="text-[11px] text-secondaryText">
                  Specify what information the customer must provide during checkout for this service.
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddField}>
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Field
              </Button>
            </div>

            <div className="space-y-3">
              {formData.requiredFormFields.map((field, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Field Name (slug)"
                      value={field.fieldName}
                      onChange={(e) => handleFieldChange(idx, 'fieldName', e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Display Label"
                      value={field.label}
                      onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={field.fieldType}
                      onChange={(e) => handleFieldChange(idx, 'fieldType', e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Select Menu</option>
                      <option value="date">Date</option>
                      <option value="textarea">Textarea</option>
                      <option value="tel">Phone</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    {field.fieldType === 'select' ? (
                      <input
                        type="text"
                        placeholder="Option1, Option2, Option3"
                        value={(field.options || []).join(', ')}
                        onChange={(e) => handleFieldChange(idx, 'options', e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-[11px]"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Placeholder hint"
                        value={field.placeholder || ''}
                        onChange={(e) => handleFieldChange(idx, 'placeholder', e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-[11px]"
                      />
                    )}
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx)}
                      className="p-1 text-danger hover:bg-rose-50 rounded"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features and Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Features (1 per line)</label>
              <textarea
                rows={3}
                placeholder="Skip-the-line Pass&#10;5-Star Hotel Stay"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-darkText">Terms (1 per line)</label>
              <textarea
                rows={3}
                placeholder="Free cancellation within 48h&#10;Valid Government ID required"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-6 text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span>Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span>Active & Available for Booking</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalLoading}>
              Save Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
