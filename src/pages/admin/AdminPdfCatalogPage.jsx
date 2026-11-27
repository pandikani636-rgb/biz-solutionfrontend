import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Files,
  Power,
  Check,
  Percent,
  Tag,
  Edit3,
  Save,
} from 'lucide-react';
import api, { getAssetUrl } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from '../../utils/alerts';
import { extractPdfTextInBrowser } from '../../utils/pdfExtractor';

const FALLBACK_IMAGE = 'https://cobrel.co.za/wp-content/uploads/2019/10/Classical-V-Belts-copy3.png';

const FOURTEEN_BRANDS = [
  'PIX',
  'JK Fenner',
  'Diamond',
  'NBC',
  'FAG',
  'SKF',
  'Timken',
  'NTN',
  'Siemens',
  'Crompton',
  'ABB',
  'Bharat Bijlee',
  'Shanthi Gears',
  'Vignesh Gears',
];

export const AdminPdfCatalogPage = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [activeCatalog, setActiveCatalog] = useState(null);
  const [selectedCatalogFilter, setSelectedCatalogFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Multi-PDF upload state
  const [pdfFiles, setPdfFiles] = useState([]);
  const [catalogTitle, setCatalogTitle] = useState('');
  const [uploadBrand, setUploadBrand] = useState('');
  const [uploadDiscount, setUploadDiscount] = useState('48');
  const [editingCatalogId, setEditingCatalogId] = useState(null);
  const [editingDiscountValue, setEditingDiscountValue] = useState('');
  const [editingBrandValue, setEditingBrandValue] = useState('');
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [selectedUploadCategory, setSelectedUploadCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reprocessingId, setReprocessingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Search across extracted products
  const [search, setSearch] = useState('');
  const [previewPdfModal, setPreviewPdfModal] = useState(null);
  const fileInputRef = useRef(null);

  const fetchCatalogs = async (catalogIdFilter = selectedCatalogFilter) => {
    setLoading(true);
    try {
      const activeParams = catalogIdFilter && catalogIdFilter !== 'ALL' ? { catalogId: catalogIdFilter } : {};
      const [adminListRes, activeRes, catsRes] = await Promise.all([
        api.get('/pdf-catalog/admin'),
        api.get('/pdf-catalog', { params: activeParams }),
        api.get('/categories').catch(() => ({ data: { data: [] } })),
      ]);

      if (adminListRes.data?.success) {
        setCatalogs(adminListRes.data.data || []);
      }
      if (activeRes.data?.success) {
        setActiveCatalog(activeRes.data.data);
      }
      if (catsRes?.data?.data) {
        setAvailableCategories(catsRes.data.data);
      }
    } catch (err) {
      console.error('[PDF Catalog Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogs(selectedCatalogFilter);
  }, [selectedCatalogFilter]);

  const handleCatalogFilterChange = (filterId) => {
    setSelectedCatalogFilter(filterId);
  };

  // Add multiple files from file picker
  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    addFiles(selected);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length === 0) return;
    addFiles(droppedFiles);
  };

  const addFiles = (incomingFiles) => {
    const validPdfs = [];
    const nonPdfs = [];

    incomingFiles.forEach((file) => {
      if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
        validPdfs.push(file);
      } else {
        nonPdfs.push(file.name);
      }
    });

    if (nonPdfs.length > 0) {
      setUploadError(`Skipped non-PDF files: ${nonPdfs.join(', ')}`);
    } else {
      setUploadError('');
    }

    if (validPdfs.length > 0) {
      setPdfFiles((prev) => {
        const existingSignatures = new Set(prev.map((f) => `${f.name}-${f.size}`));
        const filtered = validPdfs.filter((f) => !existingSignatures.has(`${f.name}-${f.size}`));
        return [...prev, ...filtered];
      });

      if (!catalogTitle && validPdfs.length === 1 && pdfFiles.length === 0) {
        setCatalogTitle(validPdfs[0].name.replace(/\.pdf$/i, ''));
      }
    }
  };

  const removePdfFile = (index) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
    if (pdfFiles.length <= 1) {
      setCatalogTitle('');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (pdfFiles.length === 0) {
      setUploadError('Please select at least one PDF file to upload.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadProgressText('Preparing PDF files...');

    const catObj = selectedUploadCategory
      ? availableCategories.find((c) => c._id === selectedUploadCategory)
      : null;

    try {
      // Always attempt full FormData upload first so the authentic PDF file is preserved and stored on server disk
      const formData = new FormData();
      pdfFiles.forEach((file) => {
        formData.append('pdfs', file);
      });

      if (catalogTitle && pdfFiles.length === 1) {
        formData.append('title', catalogTitle);
      }

      if (catObj) {
        formData.append('categoryId', catObj._id);
        formData.append('categoryName', catObj.name);
      }

      if (uploadBrand) {
        formData.append('brand', uploadBrand);
      }
      if (uploadDiscount) {
        formData.append('discountPercentage', uploadDiscount);
      }

      setUploadProgressText('Uploading & Processing on Server...');

      const res = await api.post('/pdf-catalog/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        await showSuccessAlert(
          'PDF Catalogs Uploaded & Extracted!',
          res.data.message || 'All uploaded PDF documents have been categorized with internet product images and are now live on the Products page.'
        );
        setPdfFiles([]);
        setCatalogTitle('');
        setUploadBrand('');
        setUploadDiscount('48');
        setSelectedUploadCategory('');
        setSelectedCatalogFilter('ALL');
        fetchCatalogs('ALL');
        return;
      }
    } catch (err) {
      // If standard upload failed with Network Error (e.g. Vercel 413 dropped connection), auto-fallback to client extraction
      const isNetworkError = !err.response || err.message === 'Network Error' || err.code === 'ERR_NETWORK';

      if (isNetworkError) {
        try {
          setUploadProgressText('Retrying with browser-side text extraction...');
          const clientCatalogs = [];

          for (let i = 0; i < pdfFiles.length; i++) {
            const file = pdfFiles[i];
            const extracted = await extractPdfTextInBrowser(file, (percent) => {
              setUploadProgressText(`Reading PDF ${i + 1}/${pdfFiles.length} (${percent}%)...`);
            });

            clientCatalogs.push({
              title: catalogTitle && pdfFiles.length === 1 ? catalogTitle : file.name.replace(/\.pdf$/i, ''),
              fileName: file.name,
              fileSize: file.size,
              extractedText: extracted.text,
              categoryId: catObj?._id || null,
              categoryName: catObj?.name || '',
              brand: uploadBrand || undefined,
              discountPercentage: uploadDiscount ? Number(uploadDiscount) : 48,
            });
          }

          setUploadProgressText('Importing products to database...');
          const retryRes = await api.post('/pdf-catalog/upload', {
            catalogs: clientCatalogs,
            title: catalogTitle && pdfFiles.length === 1 ? catalogTitle : undefined,
            categoryId: catObj?._id,
            categoryName: catObj?.name,
            brand: uploadBrand || undefined,
            discountPercentage: uploadDiscount ? Number(uploadDiscount) : 48,
          });

          if (retryRes.data?.success) {
            await showSuccessAlert(
              'PDF Catalogs Uploaded & Extracted!',
              retryRes.data.message || 'All uploaded PDF documents have been categorized with internet product images and are now live on the Products page.'
            );
            setPdfFiles([]);
            setCatalogTitle('');
            setUploadBrand('');
            setUploadDiscount('48');
            setSelectedUploadCategory('');
            setSelectedCatalogFilter('ALL');
            fetchCatalogs('ALL');
            return;
          }
        } catch (retryErr) {
          const msg = retryErr.response?.data?.message || retryErr.message || 'PDF extraction failed';
          setUploadError(msg);
          showErrorAlert('Upload Error', msg);
          return;
        }
      }

      const msg = err.response?.data?.message || err.message || 'PDF extraction failed';
      setUploadError(msg);
      showErrorAlert('Upload Error', msg);
    } finally {
      setUploading(false);
      setUploadProgressText('');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      const res = await api.patch(`/pdf-catalog/admin/toggle-active/${id}`);
      if (res.data?.success) {
        showToast(res.data.message);
        fetchCatalogs();
      }
    } catch (err) {
      showErrorAlert('Error', err.response?.data?.message || err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveCatalogDiscount = async (id) => {
    setSavingDiscount(true);
    try {
      const res = await api.patch(`/pdf-catalog/admin/update-discount/${id}`, {
        discountPercentage: Number(editingDiscountValue),
        brand: editingBrandValue || undefined,
      });
      if (res.data?.success) {
        showToast(res.data.message || 'Discount updated and product prices recalculated!');
        setEditingCatalogId(null);
        fetchCatalogs();
      }
    } catch (err) {
      showErrorAlert('Update Failed', err.response?.data?.message || err.message);
    } finally {
      setSavingDiscount(false);
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

  const handleDelete = async (id, title) => {
    const confirmed = await showConfirmDialog(
      `Delete "${title}"?`,
      'This will remove this catalog and its extracted products from the system.'
    );
    if (!confirmed) return;

    try {
      await api.delete(`/pdf-catalog/admin/${id}`);
      showToast('Catalog deleted successfully');
      fetchCatalogs();
    } catch (err) {
      showErrorAlert('Error', err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalActiveCatalogsCount = catalogs.filter((c) => c.isActive).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <Files className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Multi-PDF Industrial Catalog Management
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy mt-1">
            Upload &amp; Manage Multiple Manufacturer PDF Catalogs
          </h2>
          <p className="text-xs text-secondaryText mt-1 max-w-3xl">
            Upload multiple PDF price lists at once (e.g. PIX, JK Fenner, SKF, NBC, Diamond). The system automatically parses all products, categories, part numbers, and MRPs, fetches genuine images from the web, and keeps all catalogs simultaneously active and clickable on the user Products page.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/services"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-navy text-accent font-bold text-xs hover:bg-navy-dark transition-smooth shadow-xs"
          >
            <span>View User Products Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Multiple PDF Upload Card with Drag & Drop */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-base font-black text-navy flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-accent" />
              <span>Upload One or Multiple PDF Catalogs</span>
            </h3>
            <p className="text-xs text-secondaryText">
              Select or drag &amp; drop multiple manufacturer catalogues simultaneously. All uploaded PDFs will be extracted and made available together.
            </p>
          </div>
          {pdfFiles.length > 0 && (
            <span className="text-xs font-bold bg-blue-50 text-primary px-3 py-1 rounded-xl border border-blue-200">
              {pdfFiles.length} PDF{pdfFiles.length > 1 ? 's' : ''} Selected
            </span>
          )}
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Optional Catalog Title */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Catalog Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. TIMKEN India Price List"
                value={catalogTitle}
                onChange={(e) => setCatalogTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-slate-50 focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Target Brand Assignment */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span>Assign Make / Brand</span>
              </label>
              <select
                value={uploadBrand}
                onChange={(e) => {
                  const b = e.target.value;
                  setUploadBrand(b);
                  if (b === 'SKF') setUploadDiscount('10');
                  else if (b === 'JK Fenner') setUploadDiscount('25');
                  else if (!uploadDiscount || uploadDiscount === '10' || uploadDiscount === '25') setUploadDiscount('48');
                }}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">Auto-Detect from File</option>
                {FOURTEEN_BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Wholesale Discount (% OFF MRP) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-600" />
                  <span>Discount (% OFF) *</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">Subtracted from MRP</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  required
                  value={uploadDiscount}
                  onChange={(e) => setUploadDiscount(e.target.value)}
                  placeholder="e.g. 46"
                  className="w-full px-3.5 py-2.5 pr-8 border border-slate-300 rounded-xl text-xs font-black bg-slate-50 focus:ring-2 focus:ring-primary focus:outline-none text-navy"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            {/* Target Category Assignment */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Assign Target Category (Optional)</label>
              <select
                value={selectedUploadCategory}
                onChange={(e) => setSelectedUploadCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">Auto-Detect / All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-blue-50/70 scale-[1.01]'
                : 'border-slate-300 hover:border-primary/60 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf,.pdf"
              onChange={handleFilesChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-primary">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">
                  Click to browse or Drag &amp; Drop multiple PDF files here
                </p>
                <p className="text-xs text-secondaryText mt-1">
                  Supports multiple PDF catalogs up to 35MB each (PIX, Fenner, SKF, NBC, Diamond, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Selected Files Preview List */}
          {pdfFiles.length > 0 && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 pb-1 border-b border-slate-200">
                <span>Selected PDF Files ({pdfFiles.length}):</span>
                <button
                  type="button"
                  onClick={() => setPdfFiles([])}
                  className="text-rose-600 hover:underline text-[11px]"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 max-h-56 overflow-y-auto">
                {pdfFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-darkText truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePdfFile(idx);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && uploadProgressText && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn shadow-2xs">
              <Spinner size="sm" />
              <span>{uploadProgressText}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
            <p className="text-[11px] text-slate-400">
              * Large PDFs are parsed securely in the browser to ensure instantaneous upload without payload limits.
            </p>
            <Button
              type="submit"
              variant="accent"
              size="md"
              disabled={uploading || pdfFiles.length === 0}
              isLoading={uploading}
              className="font-bold inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>
                {uploading
                  ? (uploadProgressText || `Extracting ${pdfFiles.length} PDF Catalog${pdfFiles.length > 1 ? 's' : ''}...`)
                  : `Extract & Upload ${pdfFiles.length > 0 ? `${pdfFiles.length} PDF${pdfFiles.length > 1 ? 's' : ''}` : 'PDFs'}`}
              </span>
            </Button>
          </div>
        </form>
      </div>

      {/* Extracted Categories & Subcategories Hierarchy View */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">Loading catalog data &amp; images...</p>
        </div>
      ) : activeCatalog?.categories?.length > 0 ? (
        <div className="space-y-6">
          {/* Header & Catalog Source Selector */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Live Active Catalog Hierarchy</span>
                </span>
                <h3 className="text-lg font-black text-navy mt-0.5">
                  {activeCatalog.title || 'Official Industrial Master Catalog'}
                </h3>
                <p className="text-xs text-secondaryText">
                  Showing {activeCatalog.totalCategories || activeCatalog.categories.length} Categories •{' '}
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

            {/* Catalog Selector Tabs if multiple catalogs exist */}
            {catalogs.length > 1 && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">Filter Source:</span>
                <button
                  type="button"
                  onClick={() => handleCatalogFilterChange('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                    selectedCatalogFilter === 'ALL'
                      ? 'bg-navy text-accent shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Catalogs Combined ({totalActiveCatalogsCount} Active)
                </button>
                {catalogs.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => handleCatalogFilterChange(c._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      selectedCatalogFilter === c._id
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{c.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                      {c.totalProducts}
                    </span>
                  </button>
                ))}
              </div>
            )}
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
                        (p.partNumber && p.partNumber.toLowerCase().includes(q)) ||
                        (p.name && p.name.toLowerCase().includes(q)) ||
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
                                  <td className="py-2.5 px-3 text-right font-bold text-navy font-mono">
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
                              + {matchingProducts.length - 15} more parts in this subcategory (viewable on User Products Page)
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
          No PDF catalogs uploaded yet. Upload one or more PDF files above to extract categories and products.
        </div>
      )}

      {/* Uploaded PDF Catalog Documents Archive */}
      {catalogs.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-navy uppercase tracking-wider flex items-center gap-2">
              <Files className="w-4 h-4 text-primary" />
              <span>Uploaded Catalog Documents Archive ({catalogs.length})</span>
            </h4>
            <span className="text-xs text-slate-500 font-semibold">
              {totalActiveCatalogsCount} active and live on Products page
            </span>
          </div>

          <div className="divide-y border rounded-2xl overflow-hidden">
            {catalogs.map((doc) => (
              <div
                key={doc._id}
                className={`p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-smooth ${
                  doc.isActive ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100/70 opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${doc.isActive ? 'bg-rose-50 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-darkText">{doc.title}</p>
                      {doc.isActive ? (
                        <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>Live on Products Page</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.2 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold border border-slate-300">
                          Hidden (Inactive)
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 text-[10px] font-black border border-blue-200">
                        Brand: {doc.brand || 'Auto-Detected'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-black border border-amber-200">
                        {doc.discountPercentage ?? 48}% OFF MRP (Deducted from Original Price)
                      </span>
                    </div>
                    <p className="text-[11px] text-secondaryText mt-0.5">
                      {doc.fileName} • {doc.totalCategories || 0} Categories • {doc.totalProducts || 0} Products • {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                  {/* Inline Discount & Brand Edit */}
                  {editingCatalogId === doc._id ? (
                    <div className="flex items-center gap-1.5 p-1.5 bg-amber-50 rounded-xl border border-amber-300 animate-fadeIn shadow-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-600">Discount:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editingDiscountValue}
                          onChange={(e) => setEditingDiscountValue(e.target.value)}
                          className="w-14 px-1.5 py-1 text-xs font-black border rounded bg-white text-navy focus:outline-none"
                          placeholder="%"
                        />
                        <span className="text-xs font-bold text-slate-500">%</span>
                      </div>
                      <select
                        value={editingBrandValue}
                        onChange={(e) => setEditingBrandValue(e.target.value)}
                        className="px-2 py-1 text-xs font-bold border rounded bg-white text-navy max-w-[110px] focus:outline-none"
                      >
                        <option value="">Auto Brand</option>
                        {FOURTEEN_BRANDS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleSaveCatalogDiscount(doc._id)}
                        disabled={savingDiscount}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-black shadow-xs cursor-pointer flex items-center gap-1"
                        title="Recalculate all products with this discount"
                      >
                        <Save className="w-3 h-3" />
                        <span>{savingDiscount ? 'Saving...' : 'Save'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCatalogId(null)}
                        className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatalogId(doc._id);
                        setEditingDiscountValue(doc.discountPercentage ?? 48);
                        setEditingBrandValue(doc.brand || '');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-smooth cursor-pointer"
                      title="Set / Edit Wholesale Discount for this catalog"
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Edit Discount ({doc.discountPercentage ?? 48}%)</span>
                    </button>
                  )}
                  {/* Toggle Active/Inactive */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(doc._id, doc.isActive)}
                    disabled={togglingId === doc._id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-smooth cursor-pointer ${
                      doc.isActive
                        ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                    title={doc.isActive ? 'Hide from Products Page' : 'Activate on Products Page'}
                  >
                    <Power className={`w-3.5 h-3.5 ${togglingId === doc._id ? 'animate-spin' : ''}`} />
                    <span>{doc.isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  {/* Reprocess */}
                  <button
                    type="button"
                    onClick={() => handleReprocess(doc._id)}
                    disabled={reprocessingId === doc._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-navy rounded-xl text-xs font-bold transition-smooth cursor-pointer"
                    title="Reprocess and refresh internet product images"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${reprocessingId === doc._id ? 'animate-spin' : ''}`} />
                    <span>Reprocess</span>
                  </button>

                  {/* View PDF in Modal (Admin View PDF) */}
                  {doc.fileUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewPdfModal({
                          url: doc.fileUrl,
                          title: doc.title,
                          fileName: doc.fileName,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary border border-blue-200 rounded-xl text-xs font-bold transition-smooth cursor-pointer"
                      title="View PDF directly in Admin Panel"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View PDF</span>
                    </button>
                  )}

                  {/* Download PDF */}
                  {doc.fileUrl && (
                    <a
                      href={getAssetUrl(doc.fileUrl)}
                      download={doc.fileName || 'catalog.pdf'}
                      className="p-2 text-slate-500 hover:text-navy hover:bg-slate-100 rounded-xl transition-smooth"
                      title="Download Original PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(doc._id, doc.title)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-smooth cursor-pointer"
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

      {/* PDF View Modal for Admin */}
      {previewPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">{previewPdfModal.title}</h3>
                  <p className="text-[11px] text-slate-400">{previewPdfModal.fileName || 'Product Catalog PDF'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getAssetUrl(previewPdfModal.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-smooth"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open in New Tab</span>
                </a>
                <a
                  href={getAssetUrl(previewPdfModal.url)}
                  download={previewPdfModal.fileName || 'catalog.pdf'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-smooth"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPdfModal(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-smooth ml-1 cursor-pointer"
                  title="Close PDF Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF iframe */}
            <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-hidden">
              <iframe
                src={getAssetUrl(previewPdfModal.url)}
                title={previewPdfModal.title}
                className="w-full h-full rounded-2xl border border-slate-300 bg-white shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
