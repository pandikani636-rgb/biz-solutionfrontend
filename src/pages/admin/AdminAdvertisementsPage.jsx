import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  Eye,
  ExternalLink,
  Power,
  Image as ImageIcon,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';

export const AdminAdvertisementsPage = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const initialForm = {
    title: '',
    content: '',
    badgeText: 'Limited Period Deal',
    imageUrl: '/banners/img2.png',
    linkUrl: '/rfq',
    ctaText: 'Claim Offer Now',
    priority: 10,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  // Preview Modal state
  const [previewAd, setPreviewAd] = useState(null);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllAdvertisements();
      if (res.success) setAds(res.data || []);
    } catch (err) {
      console.error('[Advertisements Error]', err);
      showErrorAlert('Load Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ad) => {
    setEditingId(ad._id);
    setFormData({
      title: ad.title,
      content: ad.content || '',
      badgeText: ad.badgeText || 'Limited Period Deal',
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl || '/rfq',
      ctaText: ad.ctaText || 'Claim Offer Now',
      priority: ad.priority || 1,
      isActive: Boolean(ad.isActive),
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingImage(true);
    try {
      const res = await adminService.uploadImage(data);
      if (res.data?.success || res.data?.url) {
        const uploadedUrl = res.data.url;
        setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
        showToast('Advertisement image uploaded successfully!');
      }
    } catch (err) {
      showErrorAlert('Upload Failed', err.response?.data?.message || err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      showErrorAlert('Validation Error', 'Title and Advertisement Image are required.');
      return;
    }

    setModalLoading(true);
    try {
      if (editingId) {
        await adminService.updateAdvertisement(editingId, formData);
        showSuccessAlert('Advertisement Updated', 'Popup advertisement changes saved.');
      } else {
        await adminService.createAdvertisement(formData);
        showSuccessAlert('Advertisement Created', 'New popup advertisement added.');
      }
      setIsModalOpen(false);
      fetchAds();
    } catch (err) {
      showErrorAlert('Save Failed', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminService.toggleAdvertisement(id);
      showToast('Advertisement visibility toggled');
      fetchAds();
    } catch (err) {
      showErrorAlert('Toggle Failed', err.message);
    }
  };

  const handleDelete = async (id, title) => {
    const confirmed = await showConfirmDialog(
      'Delete Advertisement?',
      `Are you sure you want to permanently delete "${title}"?`
    );
    if (!confirmed) return;

    try {
      await adminService.deleteAdvertisement(id);
      showToast('Advertisement deleted');
      fetchAds();
    } catch (err) {
      showErrorAlert('Delete Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Advertisement Popup Manager</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Upload advertisement images, write promotional copy, and control the automatic homepage popup modal.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Advertisement</span>
        </Button>
      </div>

      {/* Ads List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-800">
            All Advertisements ({ads.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-semibold">
            The active advertisement with highest priority is displayed automatically on website launch
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : ads.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No advertisements configured. Click "New Advertisement" to create one.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {ads.map((ad) => (
              <div
                key={ad._id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:bg-slate-50/60 transition-colors"
              >
                {/* Left: Thumbnail & Content Info */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-24 h-18 sm:w-28 sm:h-20 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 shadow-xs relative">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/banners/img2.png';
                      }}
                    />
                    {ad.badgeText && (
                      <span className="absolute bottom-1 left-1 right-1 text-[8px] font-black uppercase text-center bg-amber-400 text-slate-950 px-1 py-0.5 rounded truncate">
                        {ad.badgeText}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">
                        {ad.title}
                      </h4>
                      {ad.isActive ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                          Live Active Popup
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 font-medium">
                      {ad.content || 'No description content provided.'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>CTA: <strong className="text-slate-800">{ad.ctaText || 'Claim Offer'}</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="text-primary">{ad.linkUrl || '/services'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewAd(ad)}
                    className="text-xs font-bold"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    <span>Test Popup</span>
                  </Button>

                  <Button
                    variant={ad.isActive ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleToggle(ad._id)}
                    className="text-xs font-bold"
                  >
                    <Power className="w-3.5 h-3.5 mr-1" />
                    <span>{ad.isActive ? 'Deactivate' : 'Activate'}</span>
                  </Button>

                  <button
                    onClick={() => handleOpenEdit(ad)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200"
                    title="Edit Advertisement"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(ad._id, ad.title)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                    title="Delete Advertisement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Advertisement' : 'Create New Advertisement'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs text-darkText">
          {/* Title & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Advertisement Title / Headline *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Special 48% Discount On Industrial Belts"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Badge Text</label>
              <input
                type="text"
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                placeholder="e.g. Limited Period"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          {/* Image File Upload & URL */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="font-bold text-slate-800 flex items-center justify-between">
              <span>Advertisement Image *</span>
              <span className="text-[10px] text-slate-500 font-normal">Upload PNG / JPEG / WEBP or paste URL</span>
            </label>

            <div className="flex items-center gap-3">
              <input
                type="text"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Image URL or upload file below..."
                className="flex-1 px-3 py-2 border rounded-xl bg-white text-xs"
              />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileUpload}
                accept="image/*"
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploadingImage}
                className="shrink-0"
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                <span>Upload File</span>
              </Button>
            </div>

            {formData.imageUrl && (
              <div className="mt-2 h-36 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-300 relative">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Description Content */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Advertisement Body Content / Offer Details</label>
            <textarea
              rows={3}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Explain the offer, coupon code, benefits, or terms..."
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          {/* Target Link & CTA Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Button CTA Text</label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="e.g. Claim Discount Now"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Target URL / Route</label>
              <input
                type="text"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="e.g. /rfq, /services, /mrp-pricing"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          {/* Priority & Active */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Display Priority (Highest appears)</label>
              <input
                type="number"
                min="1"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span>Active on Frontend Popup</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={modalLoading}>
              {editingId ? 'Update Advertisement' : 'Save & Publish'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Test Preview Popup Modal */}
      {previewAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="relative h-48 w-full bg-slate-900">
              <img
                src={previewAd.imageUrl}
                alt={previewAd.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                {previewAd.badgeText || 'Special Offer'}
              </span>
            </div>
            <div className="p-5 space-y-3">
              <h3 className="font-black text-lg text-slate-900">{previewAd.title}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{previewAd.content}</p>
              <div className="pt-2 flex items-center gap-2">
                <Button variant="primary" className="flex-1 font-bold text-xs">
                  {previewAd.ctaText || 'Claim Offer'}
                </Button>
                <Button variant="outline" onClick={() => setPreviewAd(null)} className="text-xs">
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdvertisementsPage;
