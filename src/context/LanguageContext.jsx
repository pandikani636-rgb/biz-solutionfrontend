import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    nav_home: 'Home',
    nav_products: 'Products Catalog',
    nav_mrp_discounts: 'MRP Discounts',
    nav_rfq: 'Request RFQ',
    nav_about: 'About Us',
    nav_contact: 'Contact',
    nav_admin: 'Admin Control',
    nav_login: 'Log In',
    nav_register: 'Register',
    nav_my_orders: 'My Orders',
    nav_dashboard: 'User Dashboard',
    nav_profile: 'Company Profile',
    nav_logout: 'Log Out',
    nav_quick_quote: 'Quick Quote',
    nav_free_shipping: 'Free Delhivery Included on 45-48% Off Catalog',
    nav_genuine_mtc: '100% Genuine MTC Certified',

    // Hero & Home
    hero_badge: 'Official B2B Stockist & Wholesale Distributor',
    hero_title: 'Genuine Bearings, Belts & Power Transmission Components',
    hero_subtitle: 'Direct manufacturer distribution for PIX, NBC, HCH, Fenner, Timken, and SKF. Maximum wholesale discount tiers with free Delhivery freight.',
    hero_search_placeholder: 'Enter Part Number (e.g., 6204, SPC 2360, 7322, 2517)...',
    hero_search_btn: 'Search Part',
    hero_browse_btn: 'Browse All Products',
    hero_rfq_btn: 'Request Bulk RFQ',
    upload_section_title: 'Upload Part or Sample Image',
    upload_section_subtitle: 'Upload high-resolution component photos (up to 20 Megapixels) for instant engineering identification & quotation.',

    // Common Buttons & Actions
    btn_search: 'Search',
    btn_filter: 'Filter',
    btn_reset: 'Reset Filters',
    btn_submit: 'Submit',
    btn_submit_message: 'Submit Message',
    btn_upload: 'Upload Image',
    btn_download: 'Download',
    btn_print: 'Print Invoice',
    btn_confirm: 'Confirm Order',
    btn_approve: 'Approve Quotation',
    btn_reject: 'Reject',
    btn_view_details: 'View Details',
    btn_generate_report: 'Generate Dynamic Report',

    // Pricing & Terms
    standard_rate: 'Standard Rate (0% Surcharge)',
    new_user_rate: 'New User Onboarding Rate (+5%)',
    tamil_tagline: 'உங்கள் நம்பிக்கையில் எங்கள் பயணம்!',
    order_confirmed_msg: 'Your order has been confirmed!',
    quotation_approved_msg: 'Your quotation has been approved!',

    // Admin
    admin_dashboard: 'Dashboard Overview',
    admin_orders: 'Customer Bookings & Orders',
    admin_customers: 'Customer Directory & Pricing Rates',
    admin_user_uploads: 'User Uploaded Images',
    admin_pdf_catalog: 'PDF Catalog Import',
    admin_quotations: 'Quotations & RFQs',
    admin_reports: 'Reports & Export Center',
  },
  ta: {
    // Navigation
    nav_home: 'முகப்பு',
    nav_products: 'தயாரிப்புகள் பட்டியல்',
    nav_mrp_discounts: 'தள்ளுபடி விலைப்பட்டியல்',
    nav_rfq: 'விலைப்புள்ளி கோரிக்கை (RFQ)',
    nav_about: 'எங்களை பற்றி',
    nav_contact: 'தொடர்பு கொள்ள',
    nav_admin: 'நிர்வாக மையம்',
    nav_login: 'உள்நுழைக',
    nav_register: 'பதிவு செய்ய',
    nav_my_orders: 'என் ஆர்டர்கள்',
    nav_dashboard: 'வாடிக்கையாளர் டாஷ்போர்டு',
    nav_profile: 'நிறுவன விபரம்',
    nav_logout: 'வெளியேறு',
    nav_quick_quote: 'விரைவு விலைப்புள்ளி',
    nav_free_shipping: 'டெல்லிவரி (Delhivery) இலவச சரக்கு போக்குவரத்து உண்டு',
    nav_genuine_mtc: '100% அசல் சான்றளிக்கப்பட்ட பாகங்கள்',

    // Hero & Home
    hero_badge: 'அங்கீகரிக்கப்பட்ட மொத்த விநியோகஸ்தர்',
    hero_title: 'அசல் தொழில்துறை பேரிங்ஸ் & பவர் டிரான்ஸ்மிஷன் பெல்ட்கள்',
    hero_subtitle: 'PIX, NBC, HCH, Fenner, Timken மற்றும் SKF தொழிற்சாலை நேரடி விநியோகம். 45% - 48% அதிகபட்ச மொத்த தள்ளுபடி மற்றும் இலவச டெல்லிவரி போக்குவரத்து.',
    hero_search_placeholder: 'பகுதி எண் உள்ளிடவும் (எ.கா. 6204, SPC 2360, 7322, 2517)...',
    hero_search_btn: 'பாகத்தை தேடுக',
    hero_browse_btn: 'அனைத்து தயாரிப்புகளையும் காண்க',
    hero_rfq_btn: 'மொத்த விலைப்புள்ளி கோரிக்கை',
    upload_section_title: 'உதிரிபாகத்தின் புகைப்படத்தை பதிவேற்றுக',
    upload_section_subtitle: 'துல்லியமான பொறியியல் அடையாளம் மற்றும் உடனடி விலைக்கு 20 மெகாபிக்சல் வரையிலான உயர் தெளிவுத்திறன் படங்களை பதிவேற்றவும்.',

    // Common Buttons & Actions
    btn_search: 'தேடுக',
    btn_filter: 'வடிகட்டுக',
    btn_reset: 'வடிகட்டியை மீட்டமைக்க',
    btn_submit: 'சமர்ப்பிக்கவும்',
    btn_submit_message: 'செய்தியை சமர்ப்பிக்கவும்',
    btn_upload: 'படத்தை பதிவேற்று',
    btn_download: 'பதிவிறக்குக',
    btn_print: 'இன்வாய்ஸ் அச்சிடுக',
    btn_confirm: 'ஆர்டரை உறுதி செய்',
    btn_approve: 'விலைப்புள்ளியை அங்கீகரி',
    btn_reject: 'நிராகரி',
    btn_view_details: 'விபரங்களை காண்க',
    btn_generate_report: 'அறிக்கை உருவாக்குக',

    // Pricing & Terms
    standard_rate: 'நிலையான மொத்த விலை (0% கூடுதல் கட்டணம் இல்லை)',
    new_user_rate: 'புதிய வாடிக்கையாளர் விலை முறை (+5%)',
    tamil_tagline: 'உங்கள் நம்பிக்கையில் எங்கள் பயணம்!',
    order_confirmed_msg: 'உங்கள் ஆர்டர் உறுதி செய்யப்பட்டுள்ளது!',
    quotation_approved_msg: 'உங்கள் விலைப்புள்ளி அங்கீகரிக்கப்பட்டுள்ளது!',

    // Admin
    admin_dashboard: 'டாஷ்போர்டு மேலோட்டம்',
    admin_orders: 'வாடிக்கையாளர் ஆர்டர்கள்',
    admin_customers: 'வாடிக்கையாளர்கள் & கட்டண விகிதங்கள்',
    admin_user_uploads: 'பதிவேற்றிய படங்கள்',
    admin_pdf_catalog: 'PDF அட்டவணை இறக்குமதி',
    admin_quotations: 'விலைப்புள்ளிகள் & RFQ',
    admin_reports: 'அறிக்கைகள் மையம்',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('biz_lang') || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ta' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('biz_lang', nextLang);
  };

  const changeLanguage = (lang) => {
    if (['en', 'ta'].includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('biz_lang', lang);
    }
  };

  const t = (key, fallback = '') => {
    const langDict = translations[language] || translations.en;
    if (langDict[key]) return langDict[key];
    if (translations.en[key]) return translations.en[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isTamil: language === 'ta',
        toggleLanguage,
        changeLanguage,
        t,
        tagline: 'உங்கள் நம்பிக்கையில் எங்கள் பயணம்!',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
