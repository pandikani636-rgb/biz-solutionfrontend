import React, { useState, useEffect, useRef } from 'react';
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
  FolderOpen,
  RotateCw,
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

  // Live Camera state & refs
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const mobileCameraRef = useRef(null);

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

  // Stream attachment to video element
  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((err) => console.warn('[Video Play Error]', err));
    }
  }, [isCameraOpen, cameraStream]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const processSelectedImage = (file) => {
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedImage(file);
    }
  };

  // Launch live camera view
  const startCamera = async () => {
    setValidationError('');
    setCameraLoading(true);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setCameraStream(stream);
    } catch (err) {
      console.warn('[Camera Access Failed, fallback to native camera file input]', err);
      stopCamera();
      // On mobile or unsupported browsers, fall back to native device camera input
      if (mobileCameraRef.current) {
        mobileCameraRef.current.click();
      } else {
        setValidationError(
          isTamil
            ? 'கேமரா அணுகல் கிடைக்கவில்லை. கோப்பு மேலாளரிலிருந்து படத்தை தேர்ந்தெடுக்கவும்.'
            : 'Camera access denied or unavailable. Please browse files to upload.'
        );
      }
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const capturedFile = new File([blob], `part-capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          processSelectedImage(capturedFile);
          stopCamera();
        },
        'image/jpeg',
        0.95
      );
    } catch (err) {
      console.error('[Capture Photo Error]', err);
      setValidationError('Failed to capture photo from video feed.');
    }
  };

  const handleClearSelected = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    stopCamera();
    setSelectedFile(null);
    setPreviewUrl('');
    setDimensions({ width: 0, height: 0, megapixels: 0 });
    setValidationError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mobileCameraRef.current) mobileCameraRef.current.value = '';
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

          {/* Right: Image Upload & Live Camera Capture Section */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-bold text-slate-700">
                Upload Part Photo <span className="text-danger">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                File or Live Camera
              </span>
            </div>

            {/* Hidden Input for Local File Selection */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Hidden Input for Native Mobile Camera Fallback */}
            <input
              ref={mobileCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* 1. Live Camera Mode */}
            {isCameraOpen ? (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shadow-xl flex flex-col items-center animate-fadeIn">
                <div className="relative w-full aspect-4/3 sm:aspect-16/10 bg-black flex items-center justify-center overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Framing Reticle */}
                  <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-amber-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-amber-300 font-bold bg-black/70 px-2.5 py-1 rounded-full shadow-xs">
                      Align Part Specification Inside Frame
                    </span>
                  </div>
                </div>

                {/* Viewfinder Controls */}
                <div className="w-full p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
                    <Camera className="w-4 h-4 text-slate-950" />
                    <span>Capture Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      mobileCameraRef.current?.click();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    title="Open Native Phone Camera"
                  >
                    Native App
                  </button>
                </div>
              </div>
            ) : !previewUrl ? (
              /* 2. Dual Selection Mode: Browse File or Take Photo */
              <div className="border-2 border-dashed border-slate-300 hover:border-primary/80 bg-slate-50/90 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all duration-200 min-h-[220px] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-primary">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-extrabold text-xs sm:text-sm text-navy">
                    Select Part Image or Take Live Photo
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    JPEG, PNG, WEBP (Supports High-Res up to <strong>20 MP</strong>)
                  </p>
                </div>

                {/* Dual Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary border border-blue-200 text-xs font-bold transition-all hover:shadow-xs active:scale-95 cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4 text-primary" />
                    <span>Browse Files</span>
                  </button>

                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={cameraLoading}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 text-xs font-black transition-all hover:shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-slate-950" />
                    <span>{cameraLoading ? 'Starting...' : 'Take Photo'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Auto pixel resolution &amp; format check</span>
                </div>
              </div>
            ) : (
              /* 3. Image Preview with Retake and Remove options */
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2.5 animate-fadeIn">
                <div className="relative rounded-xl overflow-hidden bg-slate-900 flex justify-center items-center max-h-[220px]">
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="max-h-[220px] w-auto object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-smooth shadow cursor-pointer"
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
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ {dimensions.megapixels} MP
                    </span>
                    <button
                      type="button"
                      onClick={handleClearSelected}
                      className="text-[11px] text-rose-600 font-bold hover:underline ml-1 cursor-pointer"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </form>
    </section>
  );
};
