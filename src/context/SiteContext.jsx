import React, { createContext, useContext, useState, useEffect } from 'react';
import { contentService } from '../services/contentService';

const SiteContext = createContext(null);

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: 'BizZolution',
    tagLine: 'Your Comprehensive Business & Lifestyle Solutions Partner',
    contactEmail: 'contact@bizzolution.com',
    contactPhone: '+91 98765 43210',
    address: 'Tech Innovation Park, Bangalore - 560100',
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
