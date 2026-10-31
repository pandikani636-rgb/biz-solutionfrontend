import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Edit2, Trash2, Upload, ExternalLink } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';

export const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const initialForm = {
    title: '',
    subtitle: '',
    badgeText: 'Featured Solution',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Explore Services',
    ctaLink: '/services',
    secondaryCtaText: 'Contact Support',
    secondaryCtaLink: '/contact',
    displayOrder: 0,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllBanners();
      if (res.success) setBanners(res.data || []);
    } catch (err) {
      console.error('[Banners Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenCreate = () => {
    setEditingBannerId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBannerId(b._id);
    setFormData({
      title: b.title,
      subtitle: b.subtitle || '',
      badgeText: b.badgeText || '',
      image: b.image,
      ctaText: b.ctaText || 'Explore Services',
      ctaLink: b.ctaLink || '/services',
      secondaryCtaText: b.secondaryCtaText || '',
      secondaryCtaLink: b.secondaryCtaLink || '',
      displayOrder: b.displayOrder || 0,
      isActive: Boolean(b.isActive),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) return;

    setModalLoading(true);
    try {
      if (editingBannerId) {
        await adminService.updateBanner(editingBannerId, formData);
        showSuccessAlert('Banner Updated', 'Hero banner saved successfully.');
      } else {
        await adminService.createBanner(formData);
        showSuccessAlert('Banner Created', 'Hero banner published to homepage.');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      showErrorAlert('Error', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (bId, bTitle) => {
    const confirmed = await showConfirmDialog(`Delete Banner "${bTitle}"?`, 'It will be removed from the homepage slider.');
    if (!confirmed) return;

    try {
      await adminService.deleteBanner(bId);
      showSuccessAlert('Deleted', 'Banner removed.');
      fetchBanners();
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <span>Homepage Hero Banners</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Manage sliding hero banners, call-to-actions, and promotional graphics dynamically.
          </p>
        </div>

        <Button variant="accent" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Hero Banner</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Spinner />
          </div>
        ) : banners.length > 0 ? (
          banners.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-smooth flex flex-col justify-between"
            >
              <div className="relative h-44 bg-slate-100">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                <span
                  className={`absolute top-3 right-3 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    b.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-accent-hover uppercase tracking-wider">
                    {b.badgeText || 'Banner'} • Order: {b.displayOrder}
                  </span>
                  <h3 className="font-bold text-base text-darkText mt-1 leading-snug">{b.title}</h3>
                  <p className="text-xs text-secondaryText mt-1 line-clamp-2">{b.subtitle}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="font-semibold text-primary">{b.ctaText}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-slate-500 hover:text-navy rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id, b.title)}
                      className="p-1.5 text-slate-400 hover:text-danger rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-xs text-secondaryText">No banners created yet.</div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBannerId ? 'Edit Hero Banner' : 'Create Hero Banner'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-darkText">Banner Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Subtitle / Supporting Text</label>
            <textarea
              rows={2}
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Badge Text</label>
              <input
                type="text"
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
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

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Image URL *</label>
            <input
              type="text"
              required
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Primary CTA Button Label</label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Primary CTA Target Link</label>
              <input
                type="text"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="bannerActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-primary h-4 w-4"
            />
            <label htmlFor="bannerActive" className="font-semibold text-darkText cursor-pointer">
              Active in Homepage Carousel
            </label>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalLoading}>
              Save Banner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
