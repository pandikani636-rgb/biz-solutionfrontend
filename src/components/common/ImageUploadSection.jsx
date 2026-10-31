import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  FileImage,
  Sparkles,
  Info,
  ShieldCheck,
  Send,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';
import api from '../../services/api';

export const ImageUploadSection = () => {
  const { user, isAuthenticated } = useAuth();
  const { isTamil, t } = useLanguage();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, megapixels: 0 });
  const [validationError, setValidationError] = useState('');

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [city, setCity] = useState('');
  const [partNotes, setPartNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedRecord, setUploadedRecord] = useState(null);

  // Sync logged in user details
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');
      if (user.address?.city) setCity(user.address.city);
    }
  }, [user]);

  // Try auto-detecting city if empty
  useEffect(() => {
    if (!city) {
      // Fallback sensible default or browser timezone inference
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Calcutta') || tz.includes('Kolkata')) {
        setCity('Srivilliputtur / Tamil Nadu');
      }
    }
  }, [city]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError('');
    setUploadedRecord(null);

    // 1. Validate File Format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setValidationError(
        isTamil
          ? 'செல்லுபடியாகாத கோப்பு வடிவம்! JPEG, PNG அல்லது WEBP படங்களை மட்டுமே பதிவேற்றவும்.'
          : 'Invalid file format! Please upload JPEG, PNG, or WEBP image files only.'
      );
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    // 2. Validate Dimensions and Max 20 Megapixels Resolution
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      const totalPixels = width * height;
      const megapixels = Math.round((totalPixels / 1000000) * 10) / 10;

      if (totalPixels > 20000000) {
        setValidationError(
          isTamil
            ? `படம் அதிகபட்ச தெளிவுத்திறனான 20 மெகாபிக்சலை தாண்டியுள்ளது (${megapixels} MP, ${width}x${height}px). 20 MP-க்கு குறைவான படத்தை தேர்வு செய்யவும்.`
            : `Image exceeds maximum allowed resolution of 20 Megapixels (${megapixels} MP, ${width}x${height}px). Please select an image under 20 MP.`
        );
        URL.revokeObjectURL(objectUrl);
        setSelectedFile(null);
        setPreviewUrl('');
        setDimensions({ width: 0, height: 0, megapixels: 0 });
      } else {
        setDimensions({ width, height, megapixels });
        setSelectedFile(file);
        setPreviewUrl(objectUrl);
      }
    };

    img.onerror = () => {
      setValidationError('Failed to inspect image file dimensions.');
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const handleClearSelected = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl('');
    setDimensions({ width: 0, height: 0, megapixels: 0 });
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setValidationError(isTamil ? 'தயவுசெய்து ஒரு படத்தை தேர்ந்தெடுக்கவும்.' : 'Please select an image file to upload.');
      return;
    }

    if (!customerName || (!customerPhone && !customerEmail)) {
      setValidationError(
        isTamil
          ? 'தயவுசெய்து உங்கள் பெயர் மற்றும் தொலைபேசி எண்/மின்னஞ்சலை உள்ளிடவும்.'
          : 'Please provide your name and phone number or email address.'
      );
      return;
    }

    setLoading(true);
    setValidationError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('customerName', customerName);
      formData.append('customerEmail', customerEmail);
      formData.append('customerPhone', customerPhone);
      formData.append('city', city || 'Not specified');
      formData.append('partNotes', partNotes);
      formData.append('width', String(dimensions.width));
      formData.append('height', String(dimensions.height));

      const res = await api.post('/user-uploads/user-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setUploadedRecord(res.data.data);
        await showSuccessAlert(
          isTamil ? 'படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!' : 'Part Image Uploaded Successfully!',
          isTamil
            ? `உங்கள் படம் (${dimensions.megapixels} MP) மற்றும் தகவல்கள் எங்கள் பொறியியல் குழுவிடம் சமர்ப்பிக்கப்பட்டுள்ளது. நகரம்: ${city || 'Not specified'}.`
            : `Your high-resolution part photo (${dimensions.megapixels} MP) has been forwarded to our engineering team for specification matching from ${city || 'your location'}.`
        );
        handleClearSelected();
        setPartNotes('');
      } else {
        throw new Error(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      setValidationError(err.response?.data?.message || err.message || 'Image upload failed');
      showErrorAlert('Upload Error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/70 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lightBlue border border-blue-200 text-primary font-bold text-xs uppercase tracking-wider">
          <Camera className="w-3.5 h-3.5 text-primary" />
          <span>High-Resolution Spec Verification (Up to 20 MP)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
          {t('upload_section_title')}
        </h2>
        <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
          {t('upload_section_subtitle')}
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Dropzone and Preview */}
          <div className="lg:col-span-6 space-y-4">
            {!previewUrl ? (
              <label className="border-2 border-dashed border-slate-300 hover:border-primary bg-slate-50 hover:bg-lightBlue/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group min-h-[260px]">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary group-hover:scale-110 transition-smooth mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="font-extrabold text-sm text-navy group-hover:text-primary">
                  {isTamil ? 'படத்தை பதிவேற்ற இங்கே கிளிக் செய்யவும்' : 'Click to select or drag & drop part photo'}
                </p>
                <p className="text-xs text-secondaryText mt-1">
                  Supports JPEG, PNG, WEBP (Max resolution: <strong>20 Megapixels</strong>)
                </p>
                <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 bg-white/80 px-3 py-1 rounded-full border">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Automatic pixel resolution & dimension check</span>
                </div>
              </label>
            ) : (
              <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200 space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 flex justify-center items-center max-h-[300px]">
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="max-h-[300px] w-auto object-contain rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-smooth shadow-md"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Image Specs Verification Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-darkText truncate max-w-[180px]">
                        {selectedFile?.name}
                      </p>
                      <p className="text-[11px] text-secondaryText">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ {dimensions.megapixels} MP ({dimensions.width}×{dimensions.height}px)
                    </span>
                    <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                      Within 20 MP Limit
                    </p>
                  </div>
                </div>
              </div>
            )}

            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Right: User Information & City Tracking */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {isTamil ? 'உங்கள் பெயர்' : 'Full Name'} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {isTamil ? 'நகரம் / இருப்பிடம்' : 'Upload City / Location'} <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Srivilliputtur, Madurai, Coimbatore..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50 text-navy"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {isTamil ? 'தொலைபேசி எண்' : 'Contact Phone'} <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {isTamil ? 'மின்னஞ்சல்' : 'Email Address'}
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                {isTamil ? 'உதிரிபாக குறிப்பு / அளவு விவரங்கள்' : 'Part Notes / Inscription Markings (Optional)'}
              </label>
              <textarea
                rows={3}
                placeholder="Mention any markings visible on bearing shield, belt pitch length, machine type, or required quantity..."
                value={partNotes}
                onChange={(e) => setPartNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
              />
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full justify-center font-black inline-flex items-center gap-2 shadow-sm"
              disabled={loading || !selectedFile}
              isLoading={loading}
            >
              <Send className="w-4 h-4" />
              <span>{isTamil ? 'உதிரிபாக படத்தை சமர்ப்பிக்கவும்' : 'Submit Part Image for Verification'}</span>
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
};
