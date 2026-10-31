import React, { useState, useEffect } from 'react';
import { Settings, Save, Building, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { adminService } from '../../services/adminService';
import { useSite } from '../../context/SiteContext';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { showSuccessAlert, showErrorAlert } from '../../utils/alerts';

export const AdminSettingsPage = () => {
  const { refreshSiteData } = useSite();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    siteName: 'BizZolution',
    tagLine: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    businessHours: '',
    currency: 'INR',
    currencySymbol: '₹',
    defaultTaxRate: 18,
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await contentService.getSettings();
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('[Settings Error]', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      showSuccessAlert('Settings Saved', 'Platform configurations have been updated.');
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

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-navy flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Platform Global Settings</span>
        </h2>
        <p className="text-xs text-secondaryText mt-1">
          Configure site branding, support contacts, tax calculations, and official addresses dynamically.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-xs text-darkText">
        {/* Brand Information */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-navy uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            <span>Brand Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Platform Name</label>
              <input
                type="text"
                required
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Tagline</label>
              <input
                type="text"
                value={settings.tagLine}
                onChange={(e) => setSettings({ ...settings, tagLine: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Contact Channels */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-bold text-sm text-navy uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <span>Support & Location</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Contact Email</label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Contact Phone</label>
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
              <label className="font-semibold text-darkText">Headquarters Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Business Operating Hours</label>
              <input
                type="text"
                value={settings.businessHours}
                onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Currency & Taxes */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-bold text-sm text-navy uppercase tracking-wider">
            Currency & Default Tax Configuration
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Currency Code</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Currency Symbol</label>
              <input
                type="text"
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-darkText">Default Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                value={settings.defaultTaxRate}
                onChange={(e) => setSettings({ ...settings, defaultTaxRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-6 border-t flex justify-end">
          <Button type="submit" variant="primary" size="lg" isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            <span>Save All Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
