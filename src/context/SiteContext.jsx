import React, { createContext, useContext, useState, useEffect } from 'react';
import { contentService } from '../services/contentService';

const SiteContext = createContext(null);

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: 'Balumuni and Associates',
    siteNameFirstPart: 'Balumuni',
    siteNameRemainingPart: 'and Associates',
    tagLine: 'Authorized Industrial Power Transmission & Bearings Distributor',
    contactEmail: 'balumuniandassociates@gmail.com',
    contactPhone: '+91 74184 23238',
    address: 'Near Madurai Logistics Hub, Tamil Nadu, India',
    currency: 'INR',
    currencySymbol: '₹',
    defaultTaxRate: 18,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);

  const fetchSiteData = async () => {
    try {
      const [settingsRes, categoriesRes] = await Promise.all([
        contentService.getSettings(),
        contentService.getCategories(),
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
    } catch (err) {
      console.error('[SiteContext Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteData();
  }, []);

  return (
    <SiteContext.Provider
      value={{
        settings,
        categories,
        loading,
        showPreloader,
        setShowPreloader,
        refreshSiteData: fetchSiteData,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};
