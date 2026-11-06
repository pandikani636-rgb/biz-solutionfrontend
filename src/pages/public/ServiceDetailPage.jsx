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
} from 'lucide-react';
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
              <Truck className="w-3.5 h-3.5" /> Free Delhivery Included
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
              <Truck className="w-4 h-4" /> Delhivery Shipping Included
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

      {/* 2. Packages Selection Grid */}
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Step 1: Choose Your Quantity Tier
            </span>
            <h2 className="text-2xl font-black text-navy mt-1">Available Order Packages</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Free Delhivery included on all tiers</span>
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
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Step 2: Delivery & B2B Billing Details
            </span>
            <h3 className="text-xl font-bold text-navy mt-1">Order Specifications</h3>
            <p className="text-xs text-secondaryText mt-1">
              Provide delivery pincode for Delhivery freight and optional GSTIN for 18% tax credit.
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

            <div className="flex justify-between items-center text-emerald-700 font-bold">
              <span>Delhivery Shipping & Handling</span>
              <span className="uppercase">Free (Included)</span>
            </div>

            <div className="flex justify-between items-center text-slate-500">
              <span>Applicable GST ({pricing.taxRate}%)</span>
              <span>{formatCurrency(pricing.tax)}</span>
            </div>

            <div className="h-px bg-slate-100 my-2" />

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-sm font-extrabold text-navy">Total Amount</span>
                <p className="text-[10px] text-slate-400">Includes GST & Free Delhivery</p>
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
              <span>Confirm & Dispatch via Delhivery</span>
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

      {/* Checkout & Payment Confirmation Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Confirm Order & Delhivery Dispatch"
      >
        <div className="space-y-6">
          <div className="p-4 bg-lightBlue rounded-xl border border-blue-200 text-xs text-navy space-y-1">
            <p className="font-black text-sm text-primary">{service.name}</p>
            <p>Part Code: <strong>{service.partNumber}</strong> | Make: <strong>{service.brand}</strong></p>
            <p>Package Tier: <strong>{selectedPackage?.name}</strong></p>
            <p>Delivery: <strong>Delhivery Free Freight Included</strong></p>
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
