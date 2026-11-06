import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  FileImage,
  Building2,
  User,
  Phone,
  Mail,
  FileText,
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
  const { user } = useAuth();
  const { isTamil, t } = useLanguage();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, megapixels: 0 });
  const [validationError, setValidationError] = useState('');

  // The 7 Required Form Fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emailId, setEmailId] = useState('');
  const [location, setLocation] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploadedRecord, setUploadedRecord] = useState(null);

  // Sync logged in user details if available
  useEffect(() => {
    if (user) {
      if (user.company) setCompanyName(user.company);
      if (user.name) setContactPerson(user.name);
      if (user.phone) setContactNumber(user.phone);
      if (user.email) setEmailId(user.email);
      if (user.address?.city) setLocation(user.address.city);
      if (user.gstin) setGstNumber(user.gstin);
    }
  }, [user]);

  // Fallback sensible default location
  useEffect(() => {
    if (!location) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Calcutta') || tz.includes('Kolkata')) {
        setLocation('Srivilliputtur / Tamil Nadu');
      }
    }
  }, [location]);

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

    if (!contactPerson.trim()) {
      setValidationError(
        isTamil ? 'தயவுசெய்து தொடர்பு கொள்ள வேண்டிய நபரின் பெயரை உள்ளிடவும்.' : 'Please enter contact person name.'
      );
      return;
    }

    if (!contactNumber.trim() && !emailId.trim()) {
      setValidationError(
        isTamil
          ? 'தயவுசெய்து தொலைபேசி எண் அல்லது மின்னஞ்சலை உள்ளிடவும்.'
          : 'Please enter contact phone number or email address.'
      );
      return;
    }

    setLoading(true);
    setValidationError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('companyName', companyName.trim());
      formData.append('contactPerson', contactPerson.trim());
      formData.append('customerName', contactPerson.trim());
      formData.append('contactNumber', contactNumber.trim());
      formData.append('customerPhone', contactNumber.trim());
      formData.append('emailId', emailId.trim());
      formData.append('customerEmail', emailId.trim());
      formData.append('location', location.trim() || 'Not specified');
      formData.append('city', location.trim() || 'Not specified');
      formData.append('gstNumber', gstNumber.trim());
      formData.append('notes', notes.trim());
      formData.append('partNotes', notes.trim());
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
            ? `உங்கள் படம் (${dimensions.megapixels} MP) மற்றும் விவரங்கள் சமர்ப்பிக்கப்பட்டுள்ளது.`
            : `Your part photo (${dimensions.megapixels} MP) and details have been submitted to our technical team.`
        );
        handleClearSelected();
        setNotes('');
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
    <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-md space-y-6 relative overflow-hidden">
      {/* Background ambient decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-50/70 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Header */}
      <div className="max-w-3xl space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lightBlue border border-blue-200 text-primary font-bold text-xs uppercase tracking-wider">
          <Camera className="w-3.5 h-3.5 text-primary" />
          <span>High-Resolution Spec Verification (Up to 20 MP)</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-navy tracking-tight">
          {t('upload_section_title') || 'Upload Industrial Component Photo'}
        </h2>
        <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
          {t('upload_section_subtitle') || 'Upload component photos for instant engineering identification and quotation.'}
        </p>
      </div>

      {/* Main Grid: Form on Left (7 cols), Image Upload Section on Right (5 cols) */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Input Fields (1. Company Name, 2. Contact Person Name, 3. Contact Number, 4. Email ID, 5. Location, 6. GST Number, 7. Notes) */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. Company Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Company Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Industrial Works"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>

              {/* 2. Contact Person Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Contact Person Name</span> <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 3. Contact Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>Contact Number</span> <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>

              {/* 4. Email ID */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>Email ID</span>
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 5. Location */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Srivilliputtur, Madurai..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>

              {/* 6. GST Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>GST Number</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
                />
              </div>
            </div>

            {/* 7. Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                <span>Notes</span>
              </label>
              <textarea
                rows={2}
                placeholder="Mention bearing markings, belt pitch length, machine type, quantity needed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-slate-50"
              />
            </div>

            {validationError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="accent"
              size="md"
              className="w-full justify-center font-bold inline-flex items-center gap-2 shadow-sm"
              disabled={loading || !selectedFile}
              isLoading={loading}
            >
              <Send className="w-4 h-4" />
              <span>Submit Part Image for Verification</span>
            </Button>
          </div>

          {/* Right: Moved Image Upload Section (Slightly Reduced Size) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="block text-xs font-bold text-slate-700">
              Upload Part Photo <span className="text-danger">*</span>
            </span>

            {!previewUrl ? (
              <label className="border-2 border-dashed border-slate-300 hover:border-primary bg-slate-50 hover:bg-lightBlue/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group min-h-[210px]">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-primary group-hover:scale-105 transition-smooth mb-2.5">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="font-bold text-xs text-navy group-hover:text-primary">
                  Click to select or drop part photo
                </p>
                <p className="text-[11px] text-secondaryText mt-0.5">
                  JPEG, PNG, WEBP (Max <strong>20 MP</strong>)
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Auto pixel & dimension verification</span>
                </div>
              </label>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2.5">
                <div className="relative rounded-xl overflow-hidden bg-slate-900 flex justify-center items-center max-h-[220px]">
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="max-h-[220px] w-auto object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-smooth shadow"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Verification spec badge */}
                <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileImage className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-bold text-darkText truncate text-[11px]">
                      {selectedFile?.name}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                    ✓ {dimensions.megapixels} MP
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </form>
    </section>
  );
};
