import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Search,
  Eye,
  Layers,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
  FolderTree,
  RotateCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';

const FALLBACK_IMAGE = 'https://cobrel.co.za/wp-content/uploads/2019/10/Classical-V-Belts-copy3.png';

export const AdminPdfCatalogPage = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [activeCatalog, setActiveCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [pdfFile, setPdfFile] = useState(null);
  const [catalogTitle, setCatalogTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [reprocessingId, setReprocessingId] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Search across extracted products
  const [search, setSearch] = useState('');

  const fetchCatalogs = async () => {
    setLoading(true);
    try {
      const [adminListRes, activeRes] = await Promise.all([
        api.get('/pdf-catalog/admin'),
        api.get('/pdf-catalog'),
      ]);

      if (adminListRes.data?.success) {
        setCatalogs(adminListRes.data.data || []);
      }
      if (activeRes.data?.success) {
        setActiveCatalog(activeRes.data.data);
      }
    } catch (err) {
      console.error('[PDF Catalog Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadError('Only valid PDF documents are supported.');
      setPdfFile(null);
      return;
    }

    setUploadError('');
    setPdfFile(file);
    if (!catalogTitle) {
      setCatalogTitle(file.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      setUploadError('Please select a PDF file.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('title', catalogTitle || pdfFile.name);

      const res = await api.post('/pdf-catalog/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        await showSuccessAlert(
          'PDF Extracted Successfully!',
          res.data.message || 'The PDF was parsed and organized into categories, subcategories, and products with internet images.'
        );
        setPdfFile(null);
        setCatalogTitle('');
        fetchCatalogs();
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'PDF extraction failed');
      showErrorAlert('Upload Error', err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleReprocess = async (id) => {
    setReprocessingId(id);
    try {
      const res = await api.post(`/pdf-catalog/admin/reprocess/${id}`);
      if (res.data?.success) {
        showToast('Catalog reprocessed with internet images');
        fetchCatalogs();
      }
    } catch (err) {
      showErrorAlert('Reprocess Error', err.response?.data?.message || err.message);
    } finally {
      setReprocessingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirmDialog('Delete PDF Catalog?', 'This will remove the catalog document.');
    if (!confirmed) return;

    try {
      await api.delete(`/pdf-catalog/admin/${id}`);
      showToast('Catalog deleted');
      fetchCatalogs();
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>PDF Catalog Upload & Automatic Categorization</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Upload manufacturer PDF price lists. The system automatically extracts data, fetches genuine product images from the internet, and organizes products under clean categories.
          </p>
        </div>

        <Link
          to="/price-list"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-navy text-accent font-bold text-xs hover:bg-navy-dark transition-smooth shadow-xs shrink-0"
        >
          <span>View Public User Catalog</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* PDF Upload Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-accent" />
              <span>Upload New PDF Document</span>
            </h3>
            <p className="text-xs text-secondaryText">
              Upload industrial catalogues (e.g. PIX, SKF, NBC, Fenner) to auto-extract products and fetch real internet photos.
            </p>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Catalog Title</label>
              <input
                type="text"
                placeholder="e.g. PIX Industrial Belts Price List"
                value={catalogTitle}
                onChange={(e) => setCatalogTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-slate-50 focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Select PDF File</label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-slate-50 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-navy file:text-white"
              />
            </div>
          </div>

          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <p className="text-[11px] text-slate-400">
              * Automatically parses parts, MRP, calculates wholesale price, and fetches relevant product images.
            </p>
            <Button
              type="submit"
              variant="accent"
              size="md"
              disabled={uploading || !pdfFile}
              isLoading={uploading}
              className="font-bold inline-flex items-center gap-2 shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Extract & Categorize PDF Data</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Extracted Categories & Subcategories Hierarchy View */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : activeCatalog?.categories?.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Live Active Catalog Hierarchy</span>
              </span>
              <h3 className="text-lg font-black text-navy mt-0.5">
                {activeCatalog.title || 'Official Industrial Master Catalog'}
              </h3>
              <p className="text-xs text-secondaryText">
                {activeCatalog.totalCategories || activeCatalog.categories.length} Categories •{' '}
                {activeCatalog.totalProducts} Extracted Products with Verified Images
              </p>
            </div>

            {/* Live Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search extracted parts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Categories Accordion / Display */}
          <div className="space-y-6">
            {activeCatalog.categories.map((cat, cIdx) => (
              <div key={cat._id || cIdx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-12 h-12 rounded-2xl object-contain bg-slate-50 border border-slate-200 p-1"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-lightBlue text-primary flex items-center justify-center font-bold">
                        <Layers className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-black text-base text-navy">{cat.name}</h4>
                      <p className="text-xs text-secondaryText">{cat.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                    {cat.subcategories?.length || 0} Subcategories
                  </span>
                </div>

                {/* Subcategories List */}
                <div className="space-y-6 pl-2 sm:pl-4">
                  {cat.subcategories?.map((sub, sIdx) => {
                    // Filter products if search is active
                    const matchingProducts = (sub.products || []).filter((p) => {
                      if (!search) return true;
                      const q = search.toLowerCase();
                      return (
                        p.partNumber.toLowerCase().includes(q) ||
                        p.name.toLowerCase().includes(q) ||
                        (p.brand && p.brand.toLowerCase().includes(q)) ||
                        (p.specifications && p.specifications.toLowerCase().includes(q))
                      );
                    });

                    if (search && matchingProducts.length === 0) return null;

                    return (
                      <div key={sub._id || sIdx} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold text-xs text-navy uppercase tracking-wider flex items-center gap-2">
                            {sub.image && (
                              <img
                                src={sub.image}
                                alt={sub.name}
                                className="w-6 h-6 rounded object-contain bg-white border border-slate-200 inline-block"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = FALLBACK_IMAGE;
                                }}
                              />
                            )}
                            <span>{sub.name}</span>
                          </h5>
                          <span className="text-[11px] font-semibold text-secondaryText">
                            {matchingProducts.length} Products
                          </span>
                        </div>

                        {/* Products Table under this Subcategory */}
                        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-xs">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px] border-b">
                              <tr>
                                <th className="py-2.5 px-3">Image</th>
                                <th className="py-2.5 px-3">Part #</th>
                                <th className="py-2.5 px-3">Product Name</th>
                                <th className="py-2.5 px-3">Brand</th>
                                <th className="py-2.5 px-3">Specs</th>
                                <th className="py-2.5 px-3 text-right">List MRP</th>
                                <th className="py-2.5 px-3 text-center">Discount</th>
                                <th className="py-2.5 px-3 text-right">Wholesale Rate</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {matchingProducts.slice(0, 15).map((p, pIdx) => (
                                <tr key={p._id || pIdx} className="hover:bg-slate-50">
                                  <td className="py-2 px-3">
                                    <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center">
                                      <img
                                        src={p.image || sub.image || FALLBACK_IMAGE}
                                        alt={p.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = FALLBACK_IMAGE;
                                        }}
                                      />
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-primary">
                                    {p.partNumber}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-darkText">
                                    {p.name}
                                  </td>
                                  <td className="py-2.5 px-3 font-bold text-navy">
                                    {p.brand}
                                  </td>
                                  <td className="py-2.5 px-3 text-secondaryText text-[11px]">
                                    {p.specifications || 'Standard IS/ISO'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-slate-400 line-through">
                                    {formatCurrency(p.mrp)}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded font-black text-[10px] bg-amber-100 text-amber-900">
                                      {p.discountPercentage}% OFF
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-black text-navy text-sm font-mono">
                                    {formatCurrency(p.wholesalePrice)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {matchingProducts.length > 15 && (
                            <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 border-t">
                              + {matchingProducts.length - 15} more parts in this subcategory (viewable on User Side)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-xs text-secondaryText bg-white rounded-3xl border border-slate-200">
          No PDF catalogs uploaded yet. Upload a PDF file above to extract categories and products.
        </div>
      )}

      {/* Uploaded PDF Catalog Documents Archive */}
      {catalogs.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-navy uppercase tracking-wider">
            Uploaded Catalog Documents Archive
          </h4>
          <div className="divide-y border rounded-2xl overflow-hidden">
            {catalogs.map((doc) => (
              <div key={doc._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white hover:bg-slate-50 transition-smooth">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-darkText">{doc.title}</p>
                      {doc.isActive && (
                        <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-secondaryText">
                      {doc.fileName} • {doc.totalCategories} Categories • {doc.totalProducts} Products • {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleReprocess(doc._id)}
                    disabled={reprocessingId === doc._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-navy rounded-xl text-xs font-bold transition-smooth"
                    title="Reprocess and refresh internet product images"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${reprocessingId === doc._id ? 'animate-spin' : ''}`} />
                    <span>Reprocess Images</span>
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-smooth"
                    title="Delete Catalog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
