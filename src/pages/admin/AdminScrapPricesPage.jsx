import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';
import { ScrapPriceTable } from '../../components/common/ScrapPriceTable';

export const AdminScrapPricesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const initialForm = {
    name: '',
    quantityUnit: '1 KG',
    price: 0,
    displayOrder: 1,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllScrapPrices();
      if (res.success) setItems(res.data || []);
    } catch (err) {
      console.error('[Scrap Prices Error]', err);
      showErrorAlert('Load Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...initialForm,
      displayOrder: (items.length || 0) + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      quantityUnit: item.quantityUnit || '1 KG',
      price: item.price,
      displayOrder: item.displayOrder || 0,
      isActive: Boolean(item.isActive),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    setModalLoading(true);
    try {
      if (editingId) {
        await adminService.updateScrapPrice(editingId, formData);
        showSuccessAlert('Material Updated', `${formData.name} price has been updated.`);
      } else {
        await adminService.createScrapPrice(formData);
        showSuccessAlert('Material Created', `${formData.name} has been added to the scrap table.`);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      showErrorAlert('Save Failed', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await showConfirmDialog(
      'Delete Scrap Material?',
      `Are you sure you want to delete ${name}? It will no longer appear on the homepage table.`
    );
    if (!confirmed) return;

    try {
      await adminService.deleteScrapPrice(id);
      showToast('Scrap material deleted successfully');
      fetchItems();
    } catch (err) {
      showErrorAlert('Delete Failed', err.message);
    }
  };

  const handleRestoreDefaults = async () => {
    const confirmed = await showConfirmDialog(
      'Restore Default Materials?',
      'This will reset the scrap price table to the standard 8 categories: Paper, Cardboard, Plastic, Steel, Aluminium, Brass, GI Materials, and Oil.'
    );
    if (!confirmed) return;

    try {
      await adminService.resetDefaultScrapPrices();
      showSuccessAlert('Restored', 'Default scrap materials successfully reset.');
      fetchItems();
    } catch (err) {
      showErrorAlert('Reset Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Homepage Scrap Price Table Manager</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Manage material names, quantities (KG + Litres), and prices displayed live on the homepage 10-row banner table.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRestoreDefaults}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            <span>Reset 8 Standards</span>
          </Button>

          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add New Material</span>
          </Button>
        </div>
      </div>

      {/* Grid: Left Management Table (8 cols), Right Live Preview (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table List: 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800">
              Configured Scrap Materials ({items.length})
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              Displaying Top 10 on Homepage
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No scrap material items found. Click 'Reset 8 Standards' to seed default prices.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
                  <tr>
                    <th className="py-3 px-3 text-center">#</th>
                    <th className="py-3 px-4">Material Name</th>
                    <th className="py-3 px-3 text-center">Unit</th>
                    <th className="py-3 px-4 text-right">Price (₹)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                        {item.displayOrder || index + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px] font-semibold">
                          {item.quantityUnit || '1 KG'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-amber-600 text-sm">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Material"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Preview Card: 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span>Homepage Live Preview</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Here is how your scrap price card renders on top of the homepage hero banner:
            </p>
            <div className="bg-slate-900 p-2 rounded-2xl shadow-inner">
              <ScrapPriceTable />
            </div>
          </div>
        </div>
      </div>

      {/* Edit / Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Scrap Material' : 'Add New Scrap Material'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs text-darkText">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Material Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Copper Wire, Brass, Steel..."
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Quantity Unit (KG / Litres) *</label>
              <input
                type="text"
                required
                value={formData.quantityUnit}
                onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
                placeholder="e.g. 1 KG, 1 Litre, 10 KG"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Scrap Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl font-bold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Display Order</label>
              <input
                type="number"
                min="1"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span>Active on Homepage</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={modalLoading}>
              {editingId ? 'Save Changes' : 'Create Material'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminScrapPricesPage;
