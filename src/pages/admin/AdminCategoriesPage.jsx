import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { adminService } from '../../services/adminService';
import { useSite } from '../../context/SiteContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';

export const AdminCategoriesPage = () => {
  const { refreshSiteData } = useSite();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const initialForm = {
    name: '',
    description: '',
    icon: 'Briefcase',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    displayOrder: 0,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await contentService.getCategories({ all: 'true' });
      if (res.success) setCategories(res.data || []);
    } catch (err) {
      console.error('[Categories Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCatId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCatId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'Briefcase',
      image: cat.image || '',
      displayOrder: cat.displayOrder || 0,
      isActive: Boolean(cat.isActive),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    setModalLoading(true);
    try {
      if (editingCatId) {
        await adminService.updateCategory(editingCatId, formData);
        showSuccessAlert('Category Updated', `${formData.name} updated successfully.`);
      } else {
        await adminService.createCategory(formData);
        showSuccessAlert('Category Created', `${formData.name} created successfully.`);
      }
      setIsModalOpen(false);
      fetchCategories();
      refreshSiteData();
    } catch (err) {
      showErrorAlert('Error', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (catId, catName) => {
    const confirmed = await showConfirmDialog(
      `Delete Category "${catName}"?`,
      'This will be permanently deleted if no services are assigned to it.'
    );
    if (!confirmed) return;

    try {
      await adminService.deleteCategory(catId);
      showSuccessAlert('Deleted', 'Category removed successfully.');
      fetchCategories();
      refreshSiteData();
    } catch (err) {
      showErrorAlert('Deletion Prevented', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <span>Category Taxonomy Management</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Organize services into business categories for navigation and filtering.
          </p>
        </div>

        <Button variant="accent" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Category</span>
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : categories.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-navy font-bold">
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Icon Key</th>
                <th className="py-3 px-4 text-center">Order</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-darkText">{c.name}</td>
                  <td className="py-3 px-4 font-mono text-secondaryText">{c.slug}</td>
                  <td className="py-3 px-4 font-semibold text-primary">{c.icon}</td>
                  <td className="py-3 px-4 text-center font-bold">{c.displayOrder}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        c.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-500 hover:text-primary rounded-lg hover:bg-slate-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id, c.name)}
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
          <div className="py-12 text-center text-xs text-secondaryText">No categories created yet.</div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCatId ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-darkText">Category Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Short Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Icon Name</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value="Briefcase">Briefcase</option>
                <option value="Plane">Plane</option>
                <option value="CreditCard">CreditCard</option>
                <option value="ShieldCheck">ShieldCheck</option>
                <option value="Truck">Truck</option>
                <option value="GraduationCap">GraduationCap</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-darkText">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="catActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-primary h-4 w-4"
            />
            <label htmlFor="catActive" className="font-semibold text-darkText cursor-pointer">
              Active on Public Directory
            </label>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalLoading}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
