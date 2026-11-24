import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Save,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Eye,
  Percent,
  Receipt,
  Tag,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { adminService } from '../../services/adminService';
import { useSite } from '../../context/SiteContext';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';

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

export const AdminSettingsPage = () => {
  const { refreshSiteData } = useSite();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef(null);

  const [settings, setSettings] = useState({
    siteName: 'Balumuni and Associates',
    siteNameFirstPart: 'Balumuni',
    siteNameRemainingPart: 'and Associates',
    tagLine: 'Industrial Power Transmission & Bearings Solutions Partner',
    logo: '/bm-logo.png',
    contactEmail: 'balumuniandassociates@gmail.com',
    contactPhone: '+91 74184 23238',
    address: '45B/16 Noorullah Mall, Oothumalai Paradesimadam Street, Srivilliputtur, Virudhunagar Dist, Tamilnadu - 626125',
    googleMapsLocation: '45B/16 Noorullah Mall, Oothumalai Paradesimadam Street, Srivilliputtur, Virudhunagar Dist, Tamilnadu - 626125',
    googleMapsEmbedUrl: '',
    footerDescription: 'Authorized industrial distributor for world-class mechanical transmission belts, bearings, taper pulleys, and industrial equipment.',
    proprietorName: 'Karthick Kumar K',
    gstin: '33HONPK5547G2ZK',
    businessHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    currency: 'INR',
    currencySymbol: '₹',
    defaultTaxRate: 18,
    existingUserDiscountPercentage: 46,
    newUserDiscountPercentage: 40,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await contentService.getSettings();
        if (res.success && res.data) {
          setSettings((prev) => ({
            ...prev,
            ...res.data,
            siteNameFirstPart: res.data.siteNameFirstPart || 'Balumuni',
            siteNameRemainingPart: res.data.siteNameRemainingPart || 'and Associates',
            defaultTaxRate: res.data.defaultTaxRate ?? 18,
            existingUserDiscountPercentage: res.data.existingUserDiscountPercentage ?? 46,
            newUserDiscountPercentage: res.data.newUserDiscountPercentage ?? 40,
            googleMapsLocation:
              res.data.googleMapsLocation ||
              res.data.address ||
              '45B/16 Noorullah Mall, Oothumalai Paradesimadam Street, Srivilliputtur, Virudhunagar Dist, Tamilnadu - 626125',
            footerDescription:
              res.data.footerDescription ||
              'Authorized industrial distributor for world-class mechanical transmission belts, bearings, taper pulleys, and industrial equipment.',
            proprietorName: res.data.proprietorName || 'Karthick Kumar K',
            gstin: res.data.gstin || '33HONPK5547G2ZK',
          }));
        }
      } catch (err) {
        console.error('[Settings Error]', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingLogo(true);
    try {
      const res = await adminService.uploadImage(formData);
      if (res.data?.success || res.data?.url) {
        const newUrl = res.data.url;
        setSettings((prev) => ({ ...prev, logo: newUrl }));
        showToast('Logo uploaded successfully! Click Save to apply changes.');
      }
    } catch (err) {
      showErrorAlert('Upload Failed', err.response?.data?.message || err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Auto assemble full siteName from first & remaining part if needed
      const fullSiteName = `${settings.siteNameFirstPart || ''} ${settings.siteNameRemainingPart || ''}`.trim();
      const updatedPayload = {
        ...settings,
        siteName: fullSiteName || settings.siteName,
      };

      await adminService.updateSettings(updatedPayload);
      showSuccessAlert(
        'Settings Saved!',
        'Navigation bar branding, logo, company location, and footer content have been dynamically updated.'
      );
      refreshSiteData();
    } catch (err) {
      showErrorAlert('Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const mapQuery = settings.googleMapsLocation || settings.address || 'Srivilliputtur, Tamilnadu';
  const previewMapSrc =
    settings.googleMapsEmbedUrl ||
    `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-navy flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Platform Global Branding &amp; Footer Settings</span>
        </h2>
        <p className="text-xs text-secondaryText mt-1">
          Dynamically configure your Navigation Bar branding (logo, yellow/black company name), Footer content, and Google Maps location. All changes instantly reflect on the website without manual code changes.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs text-darkText">
        {/* 1. Navigation Bar & Brand Lockup */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-navy uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              <span>1. Navigation Bar Logo &amp; Branding</span>
            </h3>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Yellow + Black Branding Scheme
            </span>
          </div>

          {/* Logo Upload Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <label className="font-bold text-slate-800 block">
              Website Logo (Navigation Bar &amp; Footer)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Logo Preview Container */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-slate-300 p-2 flex items-center justify-center shadow-xs shrink-0">
                <img
                  src={settings.logo}
                  alt="Logo Preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = '/bm-logo.png';
                  }}
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={settings.logo}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  placeholder="Paste Logo Image URL or Upload New..."
                  className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-mono"
                />

                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    isLoading={uploadingLogo}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    <span>Upload New Logo File</span>
                  </Button>
                  <span className="text-[10px] text-slate-500">
                    Recommended: Transparent PNG or SVG (Minimum 120x120px)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Name Colour Scheme (First Part Yellow, Remaining Part Black) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-amber-700 flex items-center justify-between">
                <span>Company Name (First Part - Yellow Highlight) *</span>
                <span className="text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                  Displays in Yellow
                </span>
              </label>
              <input
                type="text"
                required
                value={settings.siteNameFirstPart}
                onChange={(e) =>
                  setSettings({ ...settings, siteNameFirstPart: e.target.value })
                }
                placeholder="e.g. Balumuni"
                className="w-full px-3.5 py-2.5 border border-amber-300 bg-amber-50/40 font-black rounded-xl text-amber-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 flex items-center justify-between">
                <span>Company Name (Remaining Part - Black Text) *</span>
                <span className="text-[10px] text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                  Displays in Black
                </span>
              </label>
              <input
                type="text"
                required
                value={settings.siteNameRemainingPart}
                onChange={(e) =>
                  setSettings({ ...settings, siteNameRemainingPart: e.target.value })
                }
                placeholder="e.g. and Associates"
                className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 font-black rounded-xl text-slate-950"
              />
            </div>
          </div>

          {/* Live Navigation Brand Bar Preview */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
              Live Navigation Brand Lockup Preview:
            </span>
            <div className="inline-flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center">
                <img
                  src={settings.logo}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="brand-name-gold text-xl font-extrabold tracking-wide">
                {settings.siteName || `${settings.siteNameFirstPart || 'Balumuni'} ${settings.siteNameRemainingPart || 'and Associates'}`}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Footer Section & Corporate Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b pb-3">
            <h3 className="font-extrabold text-sm text-navy uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span>2. Footer Content &amp; Support Contacts</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Manage the descriptions, proprietor details, and contact channels rendered across the website footer.
            </p>
          </div>

          {/* Footer About Text */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800">Footer About Description Content</label>
            <textarea
              rows={3}
              value={settings.footerDescription}
              onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl"
              placeholder="Brief company mission and authorized distribution credentials..."
            />
          </div>

          {/* Proprietor & GSTIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Proprietor Name</label>
              <input
                type="text"
                value={settings.proprietorName}
                onChange={(e) => setSettings({ ...settings, proprietorName: e.target.value })}
                placeholder="e.g. K. Karthick Kumar"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Official GSTIN Number</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                placeholder="e.g. 33HONPK5547G2ZK"
                className="w-full px-3 py-2 border rounded-xl font-mono uppercase font-bold"
              />
            </div>
          </div>

          {/* Contact Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Official Email</label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Contact Hotline Numbers</label>
              <input
                type="text"
                required
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Company Physical Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Business Operating Hours</label>
              <input
                type="text"
                value={settings.businessHours}
                onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* 3. Company Location & Google Maps Integration */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-navy uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>3. Company Location &amp; Google Maps Integration</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Map Auto-Generated
            </span>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 flex items-center justify-between">
              <span>Company Google Maps Search Location / Address Landmark *</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Once added, Google Maps automatically appears in the footer
              </span>
            </label>
            <input
              type="text"
              required
              value={settings.googleMapsLocation}
              onChange={(e) =>
                setSettings({ ...settings, googleMapsLocation: e.target.value })
              }
              placeholder="e.g. 45B/16 Noorullah Mall, Srivilliputtur, Virudhunagar Dist, Tamilnadu - 626125"
              className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800">
              Custom Google Maps Embed URL / Iframe Link (Optional Override)
            </label>
            <input
              type="text"
              value={settings.googleMapsEmbedUrl}
              onChange={(e) =>
                setSettings({ ...settings, googleMapsEmbedUrl: e.target.value })
              }
              placeholder="Leave blank to use automatic search location embed above"
              className="w-full px-3.5 py-2 border rounded-xl text-xs font-mono"
            />
          </div>

          {/* Live Google Maps Preview */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>Live Footer Google Map Preview:</span>
            </span>

            <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-300 shadow-sm bg-slate-900 relative">
              <iframe
                title="Google Map Preview"
                src={previewMapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                className="w-full h-full"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Query used for map: <code className="bg-slate-100 px-1 py-0.5 rounded">{mapQuery}</code>
            </p>
          </div>
        </div>

        {/* 4. Tax Assignment & Customer Wholesale Discount Policy */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-navy uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>4. Tax Assignment &amp; Customer Discount Policy</span>
            </h3>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Live Price Subtraction
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Tax Assignment */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-600" />
                <span>Tax Assignment (% GST Rate) *</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  value={settings.defaultTaxRate}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultTaxRate: Number(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2.5 pr-8 border border-slate-300 rounded-xl text-sm font-bold bg-white focus:ring-2 focus:ring-primary"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Default Goods &amp; Services Tax (GST) applied on quotations, proforma &amp; orders.
              </p>
            </div>

            {/* Existing User Discount */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <label className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-600" />
                <span>Existing User Discount (%) *</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  value={settings.existingUserDiscountPercentage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      existingUserDiscountPercentage: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 pr-8 border border-emerald-300 rounded-xl text-sm font-bold bg-white focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-600">%</span>
              </div>
              <p className="text-[10px] text-emerald-700">
                <strong>Registered Account Users:</strong> This discount is subtracted from MRP for existing users.
              </p>
            </div>

            {/* New User Discount */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <label className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-600" />
                <span>New User Discount (%) *</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  value={settings.newUserDiscountPercentage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      newUserDiscountPercentage: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 pr-8 border border-amber-300 rounded-xl text-sm font-bold bg-white focus:ring-2 focus:ring-amber-500 text-amber-900"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-amber-600">%</span>
              </div>
              <p className="text-[10px] text-amber-700">
                <strong>New / Guest Visitors:</strong> Applied to visitors without an account. Subtracted from MRP.
              </p>
            </div>
          </div>

          {/* Brand-Specific Wholesale Discount Matrix (All 14 Makes) */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-xs text-navy uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  <span>14 Authorized Industrial Makes &amp; Brands Discount Configuration</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Configure the discount percentage subtracted from original MRP prices for each brand on the website.
                </p>
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full shrink-0 self-start sm:self-auto">
                Subtracted from Original Price
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-1">
              {FOURTEEN_BRANDS.map((brandName) => {
                const currentDisc = settings.brandDiscounts?.[brandName] ?? (brandName === 'SKF' ? 10 : 46);
                return (
                  <div key={brandName} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="block font-black text-xs text-slate-800 truncate" title={brandName}>
                      {brandName}
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={currentDisc}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setSettings((prev) => ({
                            ...prev,
                            brandDiscounts: {
                              ...(prev.brandDiscounts || {}),
                              [brandName]: val,
                            },
                          }));
                        }}
                        className="w-full px-2 py-1 pr-6 border border-slate-300 rounded-lg text-xs font-bold bg-white text-navy focus:ring-1 focus:ring-primary"
                      />
                      <span className="absolute right-2 top-1 text-[11px] font-bold text-slate-400">%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time formula preview banner */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-black text-navy text-[11px] uppercase tracking-wider block">
                Live Formula Calculation Example (MRP: ₹1,000):
              </span>
              <p className="text-slate-600">
                • <strong>Existing User Price:</strong> ₹1,000 - {settings.existingUserDiscountPercentage}% = <span className="font-mono font-black text-emerald-700">₹{Math.round(1000 - (1000 * (settings.existingUserDiscountPercentage || 0)) / 100)}</span> (+ {settings.defaultTaxRate}% GST)
              </p>
              <p className="text-slate-600">
                • <strong>New User Price:</strong> ₹1,000 - {settings.newUserDiscountPercentage}% = <span className="font-mono font-black text-amber-700">₹{Math.round(1000 - (1000 * (settings.newUserDiscountPercentage || 0)) / 100)}</span> (+ {settings.defaultTaxRate}% GST)
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-primary font-black text-center shrink-0 self-start sm:self-auto">
              Tax: {settings.defaultTaxRate}% GST
            </span>
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" size="lg" isLoading={saving} className="font-extrabold px-8">
            <Save className="w-4 h-4 mr-2" />
            <span>Save All Settings Dynamically</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
