import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Tag,
  ArrowRight,
  CreditCard,
  Sparkles,
  Truck,
  FileSpreadsheet,
  Globe2,
  Settings,
  HelpCircle,
  BadgePercent,
  X,
  Send,
  Search,
  Calculator,
  FileText,
  Layers,
  Eye,
  CheckCircle2,
  ExternalLink,
  Download,
  Maximize2,
  Columns,
  Package,
} from 'lucide-react';
import api, { getAssetUrl } from '../../services/api';
import { contentService } from '../../services/contentService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { PackageCard } from '../../components/cards/PackageCard';
import { DynamicFormRenderer } from '../../components/dynamic/DynamicFormRenderer';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Modal } from '../../components/common/Modal';
import { PaymentModal } from '../../components/common/PaymentModal';
import { formatCurrency } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';
import { getProductImageUrl } from '../../utils/productImages';

const brandColors = {
  PIX: 'bg-amber-100 text-amber-900 border-amber-300',
  NBC: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  HCH: 'bg-sky-100 text-sky-900 border-sky-300',
  Fenner: 'bg-rose-100 text-rose-900 border-rose-300',
  Timken: 'bg-orange-100 text-orange-900 border-orange-300',
  SKF: 'bg-blue-100 text-blue-900 border-blue-300',
  General: 'bg-slate-100 text-slate-800 border-slate-300',
};

const brandsList = [
  { name: 'PIX', discount: '45% - 48% OFF', discountNum: 46 },
  { name: 'JK Fenner', discount: '45% - 48% OFF', discountNum: 46 },
  { name: 'Diamond', discount: '45% - 48% OFF', discountNum: 46 },
  { name: 'NBC', discount: '45% - 48% OFF', discountNum: 46 },
  { name: 'SKF', discount: 'Flat 10% OFF', discountNum: 10 },
  { name: 'FAG', discount: '45% - 48% OFF', discountNum: 46 },
  { name: 'TMB Ken', discount: '45% - 48% OFF', discountNum: 46 },
  { name: 'NTN', discount: '45% - 48% OFF', discountNum: 46 },
  { name: 'Siemens', discount: '40% - 45% OFF', discountNum: 42 },
  { name: 'Crompton', discount: '40% - 45% OFF', discountNum: 42 },
  { name: 'ABB', discount: '40% - 45% OFF', discountNum: 42 },
  { name: 'Bharat Bijlee', discount: '40% - 45% OFF', discountNum: 42 },
  { name: 'Shanthi Gears', discount: '35% - 40% OFF', discountNum: 38 },
  { name: 'Vignesh Gears', discount: '35% - 40% OFF', discountNum: 38 },
];

export const ServiceDetailPage = () => {
  const { identifier } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [dynamicFormData, setDynamicFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // SKF Origin Switch State
  const [selectedOrigin, setSelectedOrigin] = useState('National (SKF India)');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Quick RFQ Modal State
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [rfqLoading, setRfqLoading] = useState(false);
  const [rfqData, setRfqData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: '',
    gstin: '',
    quantity: 10,
    targetPrice: '',
    message: '',
  });

  // Top Product Number Search State
  const [productNumberQuery, setProductNumberQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');

  // Relocated Savings Calculator State
  const [calcBrand, setCalcBrand] = useState('PIX');
  const [calcMrp, setCalcMrp] = useState(2000);

  // Dedicated In-Page PDF Viewer & Product Selection State
  const [pdfCatalog, setPdfCatalog] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedPdfCatIndex, setSelectedPdfCatIndex] = useState(0);
  const [selectedPdfItem, setSelectedPdfItem] = useState(null);
  const [pdfSearchQuery, setPdfSearchQuery] = useState('');
  const [pdfViewMode, setPdfViewMode] = useState('split'); // 'split' | 'pdf_only' | 'products_only'

  useEffect(() => {
    const fetchCatalog = async () => {
      setPdfLoading(true);
      try {
        const res = await api.get('/pdf-catalog');
        const catData = res?.data?.categories ? res.data : (res?.data?.data || res?.data);
        if (catData) {
          setPdfCatalog(catData);
          // Auto-select matching product or first product from catalog
          const allProds = catData.categories?.flatMap((c) => c.subcategories?.flatMap((s) => s.products || []) || []) || [];
          if (allProds.length > 0) {
            const match = allProds.find(
              (p) =>
                p.partNumber?.toLowerCase() === service?.partNumber?.toLowerCase() ||
                (service?.name && service.name.toLowerCase().includes(p.partNumber?.toLowerCase()))
            );
            setSelectedPdfItem(match || allProds[0]);
          }
        }
      } catch (err) {
        console.error('[Service Detail PDF Catalog]', err);
      } finally {
        setPdfLoading(false);
      }
    };
    fetchCatalog();
  }, [service]);

  // Handler when user orders a product directly from the PDF selection
  const handleOrderPdfProduct = (product) => {
    if (!product) return;
    setDynamicFormData((prev) => ({
      ...prev,
      orderedPartNumber: product.partNumber,
      orderedProductName: product.name,
      orderedBrand: product.brand || service?.brand || '',
      additionalNotes: `Selected from PDF Catalog: ${product.name} (${product.partNumber}) - Net: ₹${product.wholesalePrice}`,
    }));
    const orderSection = document.getElementById('order-specifications-section');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showToast(`Selected ${product.name} (${product.partNumber}) for ordering. Enter delivery details below.`);
  };

  const handleProductSearch = async (e) => {
    e.preventDefault();
    const query = productNumberQuery.trim();
    if (!query) return;

    setSearchLoading(true);
    setSearchMessage('');

    try {
      const res = await contentService.getServices({ search: query, limit: 10 });
      if (res.success && res.data && res.data.length > 0) {
        // Find matching product by partNumber or name
        const match = res.data.find(
          (s) => s.partNumber?.toLowerCase() === query.toLowerCase()
        ) || res.data[0];

        // Navigate to the matched product so only that product is displayed
        navigate(`/services/${match.slug || match._id}`);
        setSearchMessage('');
      } else {
        setSearchMessage(`No product found matching product number "${query}".`);
      }
    } catch (err) {
      setSearchMessage('Search request failed. Please check your connection and try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const fetchServiceData = async () => {
      setLoading(true);
      try {
        const res = await contentService.getServiceBySlugOrId(identifier);
        if (res.success && res.data) {
          setService(res.data);
          if (res.data.brand) {
            const match = brandsList.find((b) => b.name.toLowerCase() === res.data.brand.toLowerCase());
            if (match) setCalcBrand(match.name);
          }
          if (res.data.officialMrp > 0) {
            setCalcMrp(res.data.officialMrp);
          }
          setRelatedServices(res.related || []);

          // Fetch packages for this service
          const pkgRes = await contentService.getPackagesByService(res.data._id);
          if (pkgRes.success && pkgRes.data && pkgRes.data.length > 0) {
            setPackages(pkgRes.data);
            setSelectedPackage(pkgRes.data[0]); // default to first package
          }
        }
      } catch (err) {
        console.error('[Service Detail Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [identifier]);

  // Handle add-on selection
  const handleToggleAddOn = (addon) => {
    if (selectedAddOns.some((a) => a.name === addon.name)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  // Pricing calculations
  const calculatePricing = () => {
    if (!selectedPackage) return { base: 0, addOns: 0, discount: 0, taxRate: 18, tax: 0, total: 0 };
    const base = selectedPackage.discountPrice > 0 && selectedPackage.discountPrice < selectedPackage.price
      ? selectedPackage.discountPrice
      : selectedPackage.price;

    const addOnsTotal = selectedAddOns.reduce((s, a) => s + (Number(a.price) || 0), 0);
    const subtotal = base + addOnsTotal;

    let discount = 0;
    if (appliedCoupon) {
      discount = appliedCoupon.discountAmount || 0;
    }

    const taxable = Math.max(0, subtotal - discount);
    const taxRate = service?.taxRate || 18;
    const tax = Math.round(((taxable * taxRate) / 100) * 100) / 100;
    const total = Math.round((taxable + tax) * 100) / 100;

    return { base, addOns: addOnsTotal, discount, taxRate, tax, total };
  };

  const pricing = calculatePricing();

  // Validate coupon
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const res = await bookingService.validateCoupon(
        couponCode.trim(),
        pricing.base + pricing.addOns,
        service._id
      );
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        showToast(`Coupon ${res.data.code} applied! Saved ₹${res.data.discountAmount}`);
      }
    } catch (err) {
      showErrorAlert('Invalid Coupon', err.message);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Validate required form fields before checkout
  const validateForm = () => {
    const errors = {};
    if (service?.requiredFormFields) {
      service.requiredFormFields.forEach((field) => {
        if (field.required) {
          const val = dynamicFormData[field.fieldName];
          if (!val || String(val).trim() === '') {
            errors[field.fieldName] = `${field.label} is required`;
          }
        }
      });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCheckout = () => {
    if (!isAuthenticated) {
      showToast('Please log in or register to complete your order', 'warning');
      navigate(`/login?redirect=/services/${identifier}`);
      return;
    }

    if (!validateForm()) {
      showErrorAlert('Missing Information', 'Please fill in all required order & delivery details before proceeding.');
      return;
    }

    setIsCheckoutModalOpen(true);
  };

  // Proceed with Booking Order Creation and open Payment Modal
  const handleConfirmBookingAndPay = async () => {
    setBookingLoading(true);
    try {
      const finalFormData = {
        ...dynamicFormData,
        ...(service?.brand === 'SKF' ? { preferredOrigin: selectedOrigin } : {}),
      };

      // 1. Create booking in database
      const bookingRes = await bookingService.createBooking({
        serviceId: service._id,
        packageId: selectedPackage._id,
        selectedAddOns,
        dynamicFormData: finalFormData,
        couponCode: appliedCoupon?.code || undefined,
      });

      if (!bookingRes.success || !bookingRes.data) {
        throw new Error(bookingRes.message || 'Failed to create booking order');
      }

      const booking = bookingRes.data;
      setCreatedBooking(booking);
      setIsCheckoutModalOpen(false);
      setIsPaymentModalOpen(true);
    } catch (err) {
      showErrorAlert('Order Failed', err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  // Called when payment verification succeeds
  const handlePaymentCompleted = (paymentData) => {
    setIsPaymentModalOpen(false);
    if (createdBooking?._id) {
      navigate(`/customer/bookings/${createdBooking._id}`);
    } else {
      navigate('/customer/dashboard');
    }
  };

  // Submit Bulk RFQ
  const handleSubmitRfq = async (e) => {
    e.preventDefault();
    if (!rfqData.name || !rfqData.email || !rfqData.quantity) {
      showErrorAlert('Incomplete Details', 'Please provide contact name, email, and required quantity.');
      return;
    }

    setRfqLoading(true);
    try {
      const res = await contentService.submitEnquiry({
        name: rfqData.name,
        email: rfqData.email,
        phone: rfqData.phone,
        companyName: rfqData.companyName,
        gstin: rfqData.gstin,
        subject: `Bulk RFQ for ${service.name} (${service.partNumber})`,
        message: rfqData.message || `Requesting wholesale quote for ${rfqData.quantity} units of ${service.name} (${service.partNumber}).`,
        enquiryType: 'rfq',
        brand: service.brand,
        partNumber: service.partNumber,
        quantity: Number(rfqData.quantity),
        targetPrice: Number(rfqData.targetPrice) || 0,
      });

      if (res.success) {
        setIsRfqModalOpen(false);
        showSuccessAlert(
          'RFQ Submitted!',
          'Your RFQ has been sent to our sales engineering desk. We will email your official quote within 1 hour.'
        );
      }
    } catch (err) {
      showErrorAlert('RFQ Submission Failed', err.message);
    } finally {
      setRfqLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product or Part Not Found</h2>
        <Link to="/services">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const officialMrp = service.mrp > 0 ? service.mrp : Math.round(service.basePrice / (1 - (service.discountPercentage || 46) / 100));
  const discountLabel = service.discountPercentage ? `${service.discountPercentage}% OFF` : '46% OFF';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Search Bar for Specific Product Number */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <form onSubmit={handleProductSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product number / item code (e.g., 6204, SPC 2360, 7322, 2517)..."
              value={productNumberQuery}
              onChange={(e) => {
                setProductNumberQuery(e.target.value);
                if (searchMessage) setSearchMessage('');
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-navy transition-all"
            />
          </div>
          <Button
            type="submit"
            variant="accent"
            size="md"
            className="w-full sm:w-auto font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-xs"
            disabled={searchLoading}
            isLoading={searchLoading}
          >
            <Search className="w-4 h-4" />
            <span>Search Product</span>
          </Button>
        </form>

        {searchMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchMessage}</span>
          </div>
        )}
      </div>

      {/* 1. Header Banner & Main Media */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          {/* Brand & Part Number Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {service.brand && (
              <span
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border shadow-xs ${
                  brandColors[service.brand] || brandColors.General
                }`}
              >
                Make: {service.brand}
              </span>
            )}
            {service.section && (
              <span className="bg-navy text-accent text-xs font-bold px-3 py-1 rounded-lg">
                Section: {service.section}
              </span>
            )}
            <span className="bg-blue-100 text-blue-900 border border-blue-200 font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-700" /> B2B Wholesale Pricing
            </span>
            <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Express Dispatch
            </span>
          </div>

          {/* Part Number Banner */}
          {service.partNumber && (
            <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-800 border border-slate-300">
              Official Part Code: <span className="text-primary font-black text-sm">{service.partNumber}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy leading-tight">
            {service.name}
          </h1>

          <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
            {service.shortDescription}
          </p>

          {/* Pricing Highlight */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-baseline gap-4">
            <div>
              <span className="text-xs text-secondaryText font-medium">List MRP: </span>
              <span className="text-sm font-semibold text-slate-400 line-through">
                {formatCurrency(officialMrp)}
              </span>
            </div>
            <div>
              <span className="text-xs text-emerald-700 font-bold">Wholesale Net: </span>
              <span className="text-2xl sm:text-3xl font-black text-navy">
                {formatCurrency(service.discountPrice || service.basePrice)}
              </span>
              <span className="text-xs text-slate-500 font-medium ml-1">+ 18% GST</span>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-md ml-auto">
              You Save {formatCurrency(officialMrp - (service.discountPrice || service.basePrice))}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4" /> 100% Genuine MTC Certified
            </span>
            <span className="flex items-center gap-1.5 text-primary">
              <Truck className="w-4 h-4" /> Nationwide Dispatch
            </span>
            <span className="flex items-center gap-1.5 text-purple-700">
              <FileSpreadsheet className="w-4 h-4" /> B2B Input Tax Invoice
            </span>
          </div>

          {/* Quick RFQ Trigger */}
          <div className="pt-2">
            <button
              onClick={() => setIsRfqModalOpen(true)}
              className="text-xs font-bold text-primary hover:text-navy underline flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-accent-hover" />
              Need 20+ units or custom project pricing? Request Quotation →
            </button>
          </div>
        </div>

        {/* Media Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative rounded-2xl overflow-hidden shadow-md bg-slate-900 border border-slate-200">
            <img
              src={getProductImageUrl(service)}
              alt={service.name}
              className="w-full h-64 md:h-80 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80';
              }}
            />
            {service.brand && (
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase border shadow ${brandColors[service.brand] || brandColors.General}`}>
                  {service.brand} Genuine
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Special SKF Origin Selector (National vs International) */}
      {service.brand === 'SKF' && (
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-blue-700" />
            <h3 className="text-lg font-black text-blue-950">
              SKF Genuine Stock Origin Selection
            </h3>
          </div>
          <p className="text-xs text-blue-900 leading-relaxed max-w-3xl">
            As an authorized supplier of SKF bearings, we maintain stock in both <strong>National (SKF India)</strong> and <strong>International (Imported European / Global)</strong> batches. Both carry the official flat 10% discount from the SKF MRP list and 100% authenticity verification via the SKF Authenticate App.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => setSelectedOrigin('National (SKF India)')}
              className={`p-4 rounded-2xl border text-left transition-smooth flex items-start gap-3 ${
                selectedOrigin.includes('National')
                  ? 'bg-white border-blue-600 ring-2 ring-blue-500 shadow-md'
                  : 'bg-white/60 border-blue-200 hover:bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                selectedOrigin.includes('National') ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
              }`}>
                {selectedOrigin.includes('National') && <span className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <p className="font-extrabold text-sm text-navy">National Stock (SKF India)</p>
                <p className="text-xs text-slate-500 mt-1">Dispatched from domestic central warehouses in 24-48 hours. Full Indian GST tax invoice with domestic warranty.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOrigin('International (Imported European Stock)')}
              className={`p-4 rounded-2xl border text-left transition-smooth flex items-start gap-3 ${
                selectedOrigin.includes('International')
                  ? 'bg-white border-blue-600 ring-2 ring-blue-500 shadow-md'
                  : 'bg-white/60 border-blue-200 hover:bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                selectedOrigin.includes('International') ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
              }`}>
                {selectedOrigin.includes('International') && <span className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <p className="font-extrabold text-sm text-navy">International Stock (Imported)</p>
                <p className="text-xs text-slate-500 mt-1">Made in Sweden / Germany with original import customs Bill of Entry and Certificate of Origin (COO).</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Technical Specifications Table */}
      {service.specifications && Object.keys(service.specifications).length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-black text-navy">Technical & Dimensional Specifications</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {Object.entries(service.specifications).map(([key, val]) => (
              <div
                key={key}
                className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex flex-col justify-between"
              >
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{key}</span>
                <span className="text-sm font-black text-darkText mt-1 font-mono">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relocated Savings Calculator with Industrial Image - Exact Match to User Screenshot */}
      <section className="bg-gradient-to-br from-blue-50/95 via-sky-50/90 to-blue-100/70 rounded-3xl p-8 md:p-12 text-slate-900 shadow-xl relative overflow-hidden border border-blue-200/80 backdrop-blur-md">
        {/* Subtle rotating gear silhouette and glowing ambient light backdrop */}
        <div className="absolute -right-20 -top-20 w-80 h-80 border-2 border-dashed border-blue-400/20 rounded-full animate-spin-slow pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

        {/* Clean ambient gradient backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-r from-blue-50/95 via-sky-50/80 to-white/70" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Explainer */}
          <div className="lg:col-span-5 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-300/80 text-primary font-black text-xs shadow-xs">
              <Calculator className="w-3.5 h-3.5 text-primary animate-pulse" />
              Live Wholesale Pricing Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-navy leading-tight">
              Instant MRP Discount &amp; Savings Calculator
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              Test any official price list MRP across our brands. See your exact net B2B wholesale rate with our guaranteed 45% - 48% discount schedule (or flat 10% on SKF Genuine) and zero shipping fees.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-slate-700 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>PIX, NBC, HCH, Fenner &amp; Timken: <strong className="text-primary font-black">46% off MRP</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>SKF Bearings: <strong className="text-primary font-black">Flat 10% off MRP</strong> (National &amp; International Genuine Stock)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Factory Authentic <strong className="text-emerald-700 font-black">MTC &amp; Serial Traceability</strong></span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Widget */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md text-darkText rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-100/90 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. SELECT BRAND / MAKE
                </label>
                <select
                  value={calcBrand}
                  onChange={(e) => setCalcBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-bold text-darkText focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {brandsList.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} — {b.discount}
                    </option>
                  ))}
                </select>
              </div>

              {/* MRP Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. ENTER OFFICIAL LIST MRP (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={calcMrp}
                  onChange={(e) => setCalcMrp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-black text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. 2000"
                />
              </div>
            </div>

            {/* Live Price Calculation Display Cards */}
            {(() => {
              const activeBrandObj = brandsList.find((b) => b.name === calcBrand) || { name: calcBrand, discountNum: 46, discount: '45% - 48% OFF' };
              const activeDiscPct = activeBrandObj.discountNum;
              const parsedMrpVal = Math.max(0, Number(calcMrp) || 0);
              const discAmountVal = Math.round((parsedMrpVal * activeDiscPct) / 100);
              const netB2BVal = Math.max(0, parsedMrpVal - discAmountVal);
              const totalGstVal = Math.round((netB2BVal * 1.18) * 10) / 10;
              return (
                <div className="bg-blue-50/70 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-blue-100 grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center shadow-xs">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white/60 border border-slate-200/60 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight block">LIST MRP</span>
                    <p className="text-sm sm:text-base font-extrabold text-slate-500 line-through mt-0.5 whitespace-nowrap">
                      ₹{parsedMrpVal.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-tight block">DISCOUNT ({activeDiscPct}%)</span>
                    <p className="text-sm sm:text-base font-black text-amber-600 mt-0.5 whitespace-nowrap">
                      - ₹{discAmountVal.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-tight block">NET B2B RATE</span>
                    <p className="text-base sm:text-lg font-black text-emerald-700 mt-0.5 whitespace-nowrap">
                      ₹{netB2BVal.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded-xl bg-blue-100/80 border border-blue-300/80 shadow-2xs flex flex-col justify-center">
                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-tight block">TOTAL + 18% GST</span>
                    <p className="text-base sm:text-lg font-black text-blue-950 font-mono mt-0.5 whitespace-nowrap overflow-visible">
                      ₹{totalGstVal.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span><strong>Logistics:</strong> Nationwide Tracked Dispatch</span>
              </span>

              <Link to={`/services?brand=${encodeURIComponent(calcBrand)}`}>
                <Button variant="accent" size="sm" className="font-bold w-full sm:w-auto inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-400 shadow-sm hover:scale-[1.02] transition-smooth cursor-pointer">
                  <span>View {calcBrand} Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Packages Selection Grid */}
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Step 1: Choose Your Quantity Tier
            </span>
            <h2 className="text-2xl font-black text-navy mt-1">Available Order Packages</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Bulk wholesale rates on all tiers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg._id}
              pkg={pkg}
              isSelected={selectedPackage?._id === pkg._id}
              onSelect={(p) => setSelectedPackage(p)}
              selectedAddOns={selectedAddOns}
              onToggleAddOn={handleToggleAddOn}
            />
          ))}
        </div>
      </div>

      {/* 3. Dynamic Service Form & Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Dynamic Form Fields */}
        <div id="order-specifications-section" className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Step 2: Delivery & B2B Billing Details
            </span>
            <h3 className="text-xl font-bold text-navy mt-1">Order Specifications</h3>
            <p className="text-xs text-secondaryText mt-1">
              Provide delivery pincode and optional GSTIN for 18% tax credit.
            </p>
          </div>

          <DynamicFormRenderer
            fields={service.requiredFormFields}
            values={dynamicFormData}
            onChange={setDynamicFormData}
            errors={formErrors}
          />
        </div>

        {/* Right: Live Order Summary & Checkout Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-lg space-y-6 sticky top-28">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-navy">Order Summary</h3>
            <p className="text-xs text-secondaryText">Transparent wholesale net rate</p>
          </div>

          {/* Line items */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-darkText">
                {selectedPackage ? selectedPackage.name : 'Selected Package'}
              </span>
              <span className="font-bold text-navy">{formatCurrency(pricing.base)}</span>
            </div>

            {selectedAddOns.map((addon) => (
              <div key={addon.name} className="flex justify-between items-center text-slate-600 pl-2">
                <span>+ {addon.name}</span>
                <span className="font-semibold">{formatCurrency(addon.price)}</span>
              </div>
            ))}

            {pricing.discount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 font-bold">
                <span>Discount ({appliedCoupon?.code})</span>
                <span>-{formatCurrency(pricing.discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Shipping &amp; Handling</span>
              <span className="uppercase text-slate-700 font-bold">Standard</span>
            </div>

            <div className="flex justify-between items-center text-slate-500">
              <span>Applicable GST ({pricing.taxRate}%)</span>
              <span>{formatCurrency(pricing.tax)}</span>
            </div>

            <div className="h-px bg-slate-100 my-2" />

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-sm font-extrabold text-navy">Total Amount</span>
                <p className="text-[10px] text-slate-400">Includes 18% Statutory GST</p>
              </div>
              <span className="text-2xl font-black text-navy">{formatCurrency(pricing.total)}</span>
            </div>
          </div>

          {/* Coupon Input */}
          <form onSubmit={handleApplyCoupon} className="pt-2">
            <label className="block text-xs font-bold text-darkText mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-accent-hover" /> Have a Coupon?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. WELCOMEB2B"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                isLoading={couponLoading}
              >
                Apply
              </Button>
            </div>
          </form>

          {/* Book Now Button */}
          <div className="space-y-3">
            <Button
              variant="accent"
              size="lg"
              className="w-full justify-center shadow-md py-3.5 text-base font-black"
              onClick={handleOpenCheckout}
            >
              <span>Confirm Order &amp; Dispatch</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full justify-center font-bold text-xs"
              onClick={() => setIsRfqModalOpen(true)}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Request Quotation (Higher Quantities)
            </Button>
          </div>

          <p className="text-[11px] text-center text-secondaryText">
            🔒 256-Bit SSL Encrypted Sandbox & Gateway Checkout
          </p>
        </div>
      </div>

      {/* 4. Full Detailed Description, Features, and Terms */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-8">
        <div>
          <h3 className="text-xl font-bold text-navy mb-3">About This Component</h3>
          <p className="text-sm text-secondaryText leading-relaxed whitespace-pre-line">
            {service.fullDescription}
          </p>
        </div>

        {service.features && service.features.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-navy mb-4">Features & Engineering Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {service.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-darkText font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {service.terms && service.terms.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-darkText mb-2">Terms, Delivery & Return Policy</h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-secondaryText">
              {service.terms.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 5. In-Page PDF Viewer & Interactive Product Details Display */}
      {(() => {
        const activePdfUrl = service?.pdfUrl
          ? getAssetUrl(service.pdfUrl)
          : pdfCatalog?.fileUrl
          ? getAssetUrl(pdfCatalog.fileUrl)
          : '/sample-catalog.pdf';

        const currentCat =
          pdfCatalog?.categories && pdfCatalog.categories[selectedPdfCatIndex]
            ? pdfCatalog.categories[selectedPdfCatIndex]
            : pdfCatalog?.categories?.[0];

        const allCurrentProducts = currentCat?.subcategories
          ? currentCat.subcategories.flatMap((sub) => sub.products || [])
          : [];

        // Global search across all catalog products or current category
        const catalogAllProducts =
          pdfCatalog?.categories?.flatMap((c) =>
            c.subcategories?.flatMap((s) => s.products || []) || []
          ) || [];

        const filteredProducts = pdfSearchQuery.trim()
          ? catalogAllProducts.filter((p) => {
              const q = pdfSearchQuery.toLowerCase().trim();
              return (
                p.partNumber.toLowerCase().includes(q) ||
                p.name.toLowerCase().includes(q) ||
                (p.brand && p.brand.toLowerCase().includes(q)) ||
                (p.specifications && p.specifications.toLowerCase().includes(q))
              );
            })
          : allCurrentProducts;

        return (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-xl space-y-6">
            {/* Header & Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-primary text-xs font-black uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Official Manufacturer PDF Catalog</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Uploaded from Admin Panel</span>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-navy mt-1">
                  {pdfCatalog?.title || 'Technical PDF Document & Product Specifications'}
                </h3>
                <p className="text-xs text-slate-500">
                  View the official PDF catalog directly on this page. Click on any product from the catalog to display its full details, dimensions, and wholesale pricing.
                </p>
              </div>

              {/* View Switcher & Action Tools */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* View Mode Pills */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPdfViewMode('split')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      pdfViewMode === 'split'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Side-by-side: PDF Viewer & Product Selector"
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Split View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfViewMode('pdf_only')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      pdfViewMode === 'pdf_only'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Full Page PDF Document Viewer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>PDF Viewer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfViewMode('products_only')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      pdfViewMode === 'products_only'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Extracted Products Grid"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Products Grid</span>
                  </button>
                </div>

                {/* External Actions */}
                <a
                  href={activePdfUrl}
                  download={pdfCatalog?.fileName || 'Industrial-Catalog.pdf'}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-all border border-slate-200"
                  title="Download PDF"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                <a
                  href={activePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-navy text-accent hover:bg-navy-dark text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
                  title="Open Fullscreen PDF"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </a>
              </div>
            </div>

            {/* Main Interactive Container */}
            <div className={`grid gap-6 ${pdfViewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
              
              {/* Direct In-Page PDF Viewer */}
              {(pdfViewMode === 'split' || pdfViewMode === 'pdf_only') && (
                <div className={`${pdfViewMode === 'split' ? 'lg:col-span-6' : 'w-full'} space-y-3`}>
                  <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold flex items-center gap-1 text-slate-800">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>{pdfCatalog?.fileName || 'Official Catalog PDF'}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Scroll inside to browse pages</span>
                  </div>

                  <div className="w-full h-[580px] rounded-2xl border border-slate-300 bg-slate-100 overflow-hidden shadow-inner relative">
                    <iframe
                      src={`${activePdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                      title="Direct In-Page PDF Catalog Viewer"
                      className="w-full h-full rounded-2xl border-0"
                    />
                  </div>
                </div>
              )}

              {/* Products in this PDF & Selected Product Details Panel */}
              {(pdfViewMode === 'split' || pdfViewMode === 'products_only') && (
                <div className={`${pdfViewMode === 'split' ? 'lg:col-span-6' : 'w-full'} space-y-5 flex flex-col justify-between`}>
                  
                  {/* Category Pills & Search Bar */}
                  <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        <Package className="w-4 h-4 text-primary" />
                        <span>Products In This PDF Catalog</span>
                      </span>
                      <span className="text-[11px] font-bold text-primary">
                        {filteredProducts.length} items found
                      </span>
                    </div>

                    {/* Part Number Search within PDF */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search part # in this PDF (e.g. A 18, 6204, SPC 2360)..."
                        value={pdfSearchQuery}
                        onChange={(e) => setPdfSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary text-navy"
                      />
                      {pdfSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setPdfSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Category Selector Buttons */}
                    {!pdfSearchQuery && pdfCatalog?.categories && pdfCatalog.categories.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        {pdfCatalog.categories.map((cat, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedPdfCatIndex(idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                              selectedPdfCatIndex === idx
                                ? 'bg-primary text-white shadow-xs'
                                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Extracted Product Items Quick-Select Grid */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Click any product below to display full details:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-white shadow-inner">
                      {filteredProducts.slice(0, 36).map((prod, pIdx) => {
                        const isItemSelected = selectedPdfItem?.partNumber === prod.partNumber;
                        return (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setSelectedPdfItem(prod)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isItemSelected
                                ? 'bg-blue-50 border-primary ring-2 ring-primary/50 shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            <span className="font-mono text-[11px] font-black text-primary truncate block">
                              {prod.partNumber}
                            </span>
                            <p className="text-[11px] font-bold text-slate-900 truncate mt-0.5" title={prod.name}>
                              {prod.name}
                            </p>
                            <div className="mt-1 flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                              <span className="text-[10px] text-slate-400 line-through">₹{prod.mrp}</span>
                              <span className="text-[11px] font-black text-emerald-700">₹{prod.wholesalePrice}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PROMINENT SELECTED PRODUCT DETAILS DISPLAY ON THE SAME PAGE */}
                  {selectedPdfItem && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50/90 via-sky-50/60 to-white border-2 border-blue-300/80 shadow-md animate-fadeIn space-y-4">
                      
                      {/* Top Header of Selected Product */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-blue-200/80 pb-3">
                        <div className="flex items-start gap-3">
                          {selectedPdfItem.image && (
                            <div className="w-16 h-16 rounded-xl bg-white p-1 border border-blue-200 shrink-0 shadow-xs flex items-center justify-center">
                              <img
                                src={selectedPdfItem.image}
                                alt={selectedPdfItem.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://cobrel.co.za/wp-content/uploads/2019/10/Classical-V-Belts-copy3.png';
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-navy text-accent">
                                {selectedPdfItem.brand || service?.brand || 'Industrial'}
                              </span>
                              <span className="font-mono text-xs font-black text-primary px-2 py-0.5 rounded bg-blue-100 border border-blue-200">
                                Part: {selectedPdfItem.partNumber}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                                In Stock
                              </span>
                            </div>
                            <h4 className="text-base sm:text-lg font-black text-navy leading-tight">
                              {selectedPdfItem.name}
                            </h4>
                          </div>
                        </div>

                        {/* Price Tag Highlight */}
                        <div className="text-right shrink-0 bg-white px-3.5 py-2 rounded-xl border border-blue-200 shadow-2xs">
                          <span className="text-[10px] text-slate-400 line-through block">
                            MRP: {formatCurrency(selectedPdfItem.mrp)}
                          </span>
                          <span className="text-lg font-black text-navy block">
                            {formatCurrency(selectedPdfItem.wholesalePrice)}
                          </span>
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block">
                            Save {formatCurrency(selectedPdfItem.mrp - selectedPdfItem.wholesalePrice)} ({selectedPdfItem.discountPercentage || 46}% OFF)
                          </span>
                        </div>
                      </div>

                      {/* Technical Specs & Details Matrix */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="bg-white p-2 rounded-xl border border-blue-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                          <span className="font-bold text-slate-900 truncate block">
                            {selectedPdfItem.categoryName || currentCat?.name || 'Power Transmission'}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-blue-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Subcategory</span>
                          <span className="font-bold text-slate-900 truncate block">
                            {selectedPdfItem.subcategoryName || 'Standard Profile'}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-blue-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">GST Standard</span>
                          <span className="font-bold text-slate-900">+ 18% Statutory GST</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-blue-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Logistics</span>
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Express Dispatch
                          </span>
                        </div>
                      </div>

                      {selectedPdfItem.specifications && (
                        <div className="p-2.5 bg-white rounded-xl border border-blue-100 text-xs text-slate-700">
                          <strong className="text-navy font-bold">Technical Specifications: </strong>
                          <span>{selectedPdfItem.specifications}</span>
                        </div>
                      )}

                      {/* Action Buttons for Selected Product */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <Button
                          variant="accent"
                          size="sm"
                          className="font-black inline-flex items-center gap-1.5 shadow-sm bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-400 cursor-pointer"
                          onClick={() => handleOrderPdfProduct(selectedPdfItem)}
                        >
                          <CreditCard className="w-4 h-4 text-slate-950" />
                          <span>Order This Product Now ({formatCurrency(selectedPdfItem.wholesalePrice)})</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold text-xs inline-flex items-center gap-1 cursor-pointer bg-white"
                          onClick={() => {
                            setRfqData((prev) => ({
                              ...prev,
                              message: `Inquiry for catalog product: ${selectedPdfItem.name} (${selectedPdfItem.partNumber})`,
                              targetPrice: selectedPdfItem.wholesalePrice,
                            }));
                            setIsRfqModalOpen(true);
                          }}
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
                          <span>Request Bulk RFQ</span>
                        </Button>

                        <Link
                          to={`/services/${encodeURIComponent(selectedPdfItem.partNumber)}`}
                          className="text-xs font-bold text-primary hover:text-navy hover:underline inline-flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <span>Open Product Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* Checkout & Payment Confirmation Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Confirm Order &amp; Dispatch"
      >
        <div className="space-y-6">
          <div className="p-4 bg-lightBlue rounded-xl border border-blue-200 text-xs text-navy space-y-1">
            <p className="font-black text-sm text-primary">{service.name}</p>
            <p>Part Code: <strong>{service.partNumber}</strong> | Make: <strong>{service.brand}</strong></p>
            <p>Package Tier: <strong>{selectedPackage?.name}</strong></p>
            <p>Logistics: <strong>Tracked Factory Dispatch</strong></p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-darkText uppercase tracking-wider">Submitted Order Details:</h4>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              {Object.entries(dynamicFormData).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-secondaryText capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-semibold text-darkText">{String(v)}</span>
                </div>
              ))}
              {service.brand === 'SKF' && (
                <div className="flex justify-between text-blue-900 font-bold">
                  <span>Selected Origin:</span>
                  <span>{selectedOrigin}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-xs text-secondaryText">Final Total (incl. 18% GST)</p>
              <p className="text-2xl font-black text-navy">{formatCurrency(pricing.total)}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              MTC & Invoice Included
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1 inline-flex items-center justify-center gap-1.5"
              onClick={() => setIsCheckoutModalOpen(false)}
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </Button>
            <Button
              variant="accent"
              className="flex-1 justify-center font-bold inline-flex items-center gap-1.5"
              isLoading={bookingLoading}
              onClick={handleConfirmBookingAndPay}
            >
              <CreditCard className="w-4 h-4" />
              <span>Choose Payment Method ({formatCurrency(pricing.total)})</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Razorpay & Payment Options Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        booking={createdBooking}
        onPaymentSuccess={handlePaymentCompleted}
      />

      {/* Quick RFQ Modal */}
      <Modal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        title="Request Quotation"
      >
        <form onSubmit={handleSubmitRfq} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
            <p className="font-bold text-sm">Target Part: {service.name} ({service.partNumber})</p>
            <p className="text-[11px] mt-0.5">Submit your quantity requirements for factory-direct container or pallet pricing.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Name *</label>
              <input
                type="text"
                required
                value={rfqData.name}
                onChange={(e) => setRfqData({ ...rfqData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Work Email *</label>
              <input
                type="email"
                required
                value={rfqData.email}
                onChange={(e) => setRfqData({ ...rfqData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
                placeholder="purchasing@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={rfqData.phone}
                onChange={(e) => setRfqData({ ...rfqData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
                placeholder="+91 98765 00000"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Plant Name</label>
              <input
                type="text"
                value={rfqData.companyName}
                onChange={(e) => setRfqData({ ...rfqData, companyName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
                placeholder="e.g. Reliance / L&T / Local Mill"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Quantity Needed *</label>
              <input
                type="number"
                min="1"
                required
                value={rfqData.quantity}
                onChange={(e) => setRfqData({ ...rfqData, quantity: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Price / Unit (Optional)</label>
              <input
                type="number"
                value={rfqData.targetPrice}
                onChange={(e) => setRfqData({ ...rfqData, targetPrice: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
                placeholder="Target ₹"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Company GSTIN (For 18% Input Credit)</label>
            <input
              type="text"
              value={rfqData.gstin}
              onChange={(e) => setRfqData({ ...rfqData, gstin: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl uppercase font-mono"
              placeholder="e.g. 33AAAAA0000A1Z5"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Application / Delivery Notes</label>
            <textarea
              rows="2"
              value={rfqData.message}
              onChange={(e) => setRfqData({ ...rfqData, message: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
              placeholder="Delivery location, urgent dispatch dates, or alternative part numbers..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 inline-flex items-center justify-center gap-1.5"
              onClick={() => setIsRfqModalOpen(false)}
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </Button>
            <Button
              type="submit"
              variant="accent"
              className="flex-1 justify-center font-bold inline-flex items-center gap-1.5"
              isLoading={rfqLoading}
            >
              <Send className="w-4 h-4" />
              <span>Submit RFQ</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
