import React, { useState, useEffect } from 'react';
import { HelpCircle, Star, Plus, Edit2, Trash2, MessageSquareQuote } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from '../../utils/alerts';

export const AdminContentPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // FAQ Modal
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General', displayOrder: 0 });

  // Testimonial Modal
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  const [testForm, setTestForm] = useState({
    customerName: '',
    customerRole: 'Verified Client',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    content: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [faqsRes, testRes] = await Promise.all([
        contentService.getFAQs(),
        contentService.getTestimonials(),
      ]);
      if (faqsRes.success) setFaqs(faqsRes.data || []);
      if (testRes.success) setTestimonials(testRes.data || []);
    } catch (err) {
      console.error('[Content Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save FAQ
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    try {
      if (editingFaqId) {
        await adminService.updateFAQ(editingFaqId, faqForm);
        showSuccessAlert('FAQ Updated', 'FAQ has been saved.');
      } else {
        await adminService.createFAQ(faqForm);
        showSuccessAlert('FAQ Created', 'New FAQ published.');
      }
      setIsFaqModalOpen(false);
      fetchData();
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  const handleDeleteFaq = async (id) => {
    const ok = await showConfirmDialog('Delete FAQ?', 'This will be removed from the public website.');
    if (!ok) return;
    try {
      await adminService.deleteFAQ(id);
      showSuccessAlert('Deleted', 'FAQ removed.');
      fetchData();
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  // Save Testimonial
  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    try {
      if (editingTestimonialId) {
        await adminService.updateTestimonial(editingTestimonialId, testForm);
        showSuccessAlert('Testimonial Updated', 'Testimonial saved.');
      } else {
        await adminService.createTestimonial(testForm);
        showSuccessAlert('Testimonial Created', 'New testimonial published.');
      }
      setIsTestimonialModalOpen(false);
      fetchData();
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    const ok = await showConfirmDialog('Delete Review?', 'This will be removed from the homepage.');
    if (!ok) return;
    try {
      await adminService.deleteTestimonial(id);
      showSuccessAlert('Deleted', 'Testimonial removed.');
      fetchData();
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. FAQs Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span>Frequently Asked Questions (FAQs)</span>
            </h2>
            <p className="text-xs text-secondaryText mt-1">
              Add and edit searchable questions shown on the customer portal.
            </p>
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              setEditingFaqId(null);
              setFaqForm({ question: '', answer: '', category: 'General', displayOrder: 0 });
              setIsFaqModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Add FAQ
          </Button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs divide-y divide-slate-100">
          {faqs.map((f) => (
            <div key={f._id} className="py-3 flex justify-between items-start gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-primary bg-lightBlue px-2 py-0.5 rounded">
                  {f.category}
                </span>
                <h4 className="font-bold text-sm text-darkText">{f.question}</h4>
                <p className="text-xs text-secondaryText leading-relaxed">{f.answer}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setEditingFaqId(f._id);
                    setFaqForm({
                      question: f.question,
                      answer: f.answer,
                      category: f.category,
                      displayOrder: f.displayOrder || 0,
                    });
                    setIsFaqModalOpen(true);
                  }}
                  className="p-1.5 text-slate-500 hover:text-navy rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteFaq(f._id)}
                  className="p-1.5 text-slate-400 hover:text-danger rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Testimonials Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-primary" />
              <span>Customer Reviews & Testimonials</span>
            </h2>
            <p className="text-xs text-secondaryText mt-1">
              Curate customer endorsements and reviews displayed on the homepage.
            </p>
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              setEditingTestimonialId(null);
              setTestForm({
                customerName: '',
                customerRole: 'Verified Client',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                rating: 5,
                content: '',
              });
              setIsTestimonialModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Testimonial
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-accent fill-accent" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTestimonialId(t._id);
                        setTestForm({
                          customerName: t.customerName,
                          customerRole: t.customerRole,
                          avatar: t.avatar,
                          rating: t.rating || 5,
                          content: t.content,
                        });
                        setIsTestimonialModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-navy"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(t._id)}
                      className="p-1 text-slate-400 hover:text-danger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-secondaryText italic mt-3 leading-relaxed">
                  "{t.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t">
                <img src={t.avatar} alt={t.customerName} className="w-9 h-9 rounded-full object-cover border" />
                <div>
                  <p className="font-bold text-xs text-darkText">{t.customerName}</p>
                  <p className="text-[11px] text-secondaryText">{t.customerRole}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Modal */}
      <Modal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
        title={editingFaqId ? 'Edit FAQ' : 'Add FAQ'}
      >
        <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-darkText">Question *</label>
            <input
              type="text"
              required
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Answer *</label>
            <textarea
              rows={3}
              required
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Category</label>
            <input
              type="text"
              value={faqForm.category}
              onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsFaqModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save FAQ
            </Button>
          </div>
        </form>
      </Modal>

      {/* Testimonial Modal */}
      <Modal
        isOpen={isTestimonialModalOpen}
        onClose={() => setIsTestimonialModalOpen(false)}
        title={editingTestimonialId ? 'Edit Testimonial' : 'Add Testimonial'}
      >
        <form onSubmit={handleSaveTestimonial} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Customer Name *</label>
              <input
                type="text"
                required
                value={testForm.customerName}
                onChange={(e) => setTestForm({ ...testForm, customerName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Role / Company</label>
              <input
                type="text"
                value={testForm.customerRole}
                onChange={(e) => setTestForm({ ...testForm, customerRole: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Avatar Image URL</label>
            <input
              type="text"
              value={testForm.avatar}
              onChange={(e) => setTestForm({ ...testForm, avatar: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Review Quote *</label>
            <textarea
              rows={3}
              required
              value={testForm.content}
              onChange={(e) => setTestForm({ ...testForm, content: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsTestimonialModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Testimonial
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
