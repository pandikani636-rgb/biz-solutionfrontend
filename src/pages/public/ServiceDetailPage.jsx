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
  Table as TableIcon,
} from 'lucide-react';
import api, { getAssetUrl } from '../../services/api';
import { contentService } from '../../services/contentService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { PackageCard } from '../../components/cards/PackageCard';
import { DynamicFormRenderer } from '../../components/dynamic/DynamicFormRenderer';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Modal } from '../../components/common/Modal';
import { PaymentModal } from '../../components/common/PaymentModal';
import { formatCurrency } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';
import { getProductImageUrl } from '../../utils/productImages';
import { BackButton } from '../../components/common/BackButton';
import pixBeltsData from '../../data/pixBeltsCatalogData.json';

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
  const { settings } = useSite();
  const navigate = useNavigate();

  const defaultTaxRate = Number(settings?.defaultTaxRate) || 18;
  const existingUserDiscount = Number(settings?.existingUserDiscountPercentage) || 46;
  const newUserDiscount = Number(settings?.newUserDiscountPercentage) || 40;

  const isExistingUser = Boolean(isAuthenticated && user && !user.isNewUser);
  const activeDiscountPercentage = isExistingUser
    ? (user?.customDiscountPercentage > 0 ? user.customDiscountPercentage : existingUserDiscount)
    : newUserDiscount;

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
  const [pdfViewMode, setPdfViewMode] = useState('sheet'); // 'sheet' | 'split' | 'pdf_only' | 'products_only'
  const [isPdfProductModalOpen, setIsPdfProductModalOpen] = useState(false);

  // Directly sets any clicked product from the PDF catalog as the main service displayed on page
  const handleSelectPdfProductAsMain = (prod, shouldScroll = true) => {
    if (!prod) return;
    setSelectedPdfItem(prod);

    const mrp = prod.mrp || prod.wholesalePrice || 0;
    const wholesalePrice = mrp;
    const discountPercentage = 0;

    const newService = {
      _id: prod._id || 'pdf-' + prod.partNumber,
      name: prod.name,
      partNumber: prod.partNumber,
      brand: prod.brand || service?.brand || 'Industrial',
      section: prod.section || 'Industrial Component',
      category: {
        name: prod.categoryName || 'Industrial Catalog',
        slug: (prod.categoryName || 'industrial-catalog').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
      categoryName: prod.categoryName,
      subcategoryName: prod.subcategoryName,
      mainPrice: mrp,
      basePrice: mrp,
      officialMrp: mrp,
      mrp,
      discountPercentage: 0,
      discountPrice: mrp,
      mainImage: prod.image || getProductImageUrl(prod),
      images: [prod.image || getProductImageUrl(prod)],
      shortDescription: prod.description || `${prod.brand || 'Genuine'} ${prod.name} (${prod.partNumber})`,
      fullDescription: prod.description || `Original OEM certified ${prod.brand || 'Industrial'} ${prod.name}. Technical part number ${prod.partNumber}. ${prod.specifications || ''}`,
      specifications: prod.specifications ? [{ name: 'Technical Specs', value: prod.specifications }] : [],
      inStock: prod.inStock !== false,
      isActive: true,
      isFromPdfCatalog: true,
      pdfUrl: pdfCatalog?.fileUrl || service?.pdfUrl || '/sample-catalog.pdf',
      packages: [
        {
          _id: 'standard-wholesale-pack',
          name: 'Standard Wholesale Pack',
          price: mrp,
          discountPrice: mrp,
          description: 'Factory-sealed OEM unit with 100% genuine warranty and tracked dispatch',
          features: ['100% Genuine Products', 'Factory Sealed', 'Pan-India Express Dispatch'],
          isActive: true,
        },
      ],
    };

    setService(newService);
    setSelectedPackage(newService.packages[0]);
    setCalcMrp(mrp);
    if (prod.brand) setCalcBrand(prod.brand);

    // Smoothly update browser URL without re-rendering or losing scroll state
    window.history.replaceState(null, '', `/services/${encodeURIComponent(prod.partNumber)}`);

    // Pre-populate dynamic form with this exact product
    setDynamicFormData((prev) => ({
      ...prev,
      orderedPartNumber: prod.partNumber,
      orderedProductName: prod.name,
      orderedBrand: prod.brand || '',
      additionalNotes: `Selected from PDF Catalog: ${prod.name} (${prod.partNumber}) - Net: ₹${wholesalePrice}`,
    }));

    showToast(`Displaying Product: ${prod.name} (${prod.partNumber})`);

    if (shouldScroll) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

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
        let loadedService = null;
        let relatedItems = [];

        try {
          const res = await contentService.getServiceBySlugOrId(identifier);
          if (res?.success && res?.data) {
            loadedService = res.data;
            relatedItems = res.related || [];
          }
        } catch (apiErr) {
          console.warn('[Service Detail Service Lookup Fallback]', apiErr.message);
        }

        // If not found in DB services, lookup directly from PDF catalogs and local verified data
        if (!loadedService) {
          const cleanId = decodeURIComponent(identifier).trim().toLowerCase();
          const cleanNoSpace = cleanId.replace(/[\s\-_.]+/g, '');
          let found = null;
          let foundCat = null;
          let foundSub = null;
          let pdfUrl = '/sample-catalog.pdf';

          // 1. Try server PDF catalog response
          try {
            const catRes = await contentService.getPdfCatalog();
            const catData = catRes?.data?.categories ? catRes.data : (catRes?.data?.data || catRes?.data);
            if (catData?.categories) {
              pdfUrl = catData.fileUrl || pdfUrl;
              for (const c of catData.categories) {
                for (const s of c.subcategories || []) {
                  for (const p of s.products || []) {
                    const pPart = (p.partNumber || '').trim().toLowerCase();
                    const pPartNoSpace = pPart.replace(/[\s\-_.]+/g, '');
                    const pName = (p.name || '').trim().toLowerCase();

                    if (
                      pPart === cleanId ||
                      pPartNoSpace === cleanNoSpace ||
                      pName === cleanId ||
                      pName.includes(cleanId)
                    ) {
                      found = p;
                      foundCat = c;
                      foundSub = s;
                      break;
                    }
                  }
                  if (found) break;
                }
                if (found) break;
              }
            }
          } catch (pdfLookupErr) {
            console.warn('[PDF Catalog Direct Fallback Error]', pdfLookupErr.message);
          }

          // 2. If not found, search in comprehensive pixBeltsData (1,290 real sizes)
          if (!found && pixBeltsData?.categories) {
            // 2a. Exact match first (case & whitespace insensitive)
            for (const c of pixBeltsData.categories) {
              for (const s of c.subcategories || []) {
                for (const p of s.products || []) {
                  const pPart = (p.partNumber || '').trim().toLowerCase();
                  const pPartNoSpace = pPart.replace(/[\s\-_.]+/g, '');
                  if (pPart === cleanId || pPartNoSpace === cleanNoSpace) {
                    found = p;
                    foundCat = c;
                    foundSub = s;
                    pdfUrl = '/sample-catalog.pdf';
                    break;
                  }
                }
                if (found) break;
              }
              if (found) break;
            }

            // 2b. Name or prefix match only if exact not found
            if (!found) {
              for (const c of pixBeltsData.categories) {
                for (const s of c.subcategories || []) {
                  for (const p of s.products || []) {
                    const pPart = (p.partNumber || '').trim().toLowerCase();
                    const pPartNoSpace = pPart.replace(/[\s\-_.]+/g, '');
                    const pName = (p.name || '').trim().toLowerCase();

                    if (
                      pName === cleanId ||
                      pName.includes(cleanId) ||
                      (cleanNoSpace.length > 2 && pPartNoSpace.startsWith(cleanNoSpace))
                    ) {
                      found = p;
                      foundCat = c;
                      foundSub = s;
                      pdfUrl = '/sample-catalog.pdf';
                      break;
                    }
                  }
                  if (found) break;
                }
                if (found) break;
              }
            }
          }

          // 3. If not found, check verified bearings and pulleys catalogue
          if (!found) {
            const standardHardcoded = [
              { partNumber: '6203', name: 'HCH 6203 Single Row Deep Groove Ball Bearing', brand: 'HCH', mrp: 320, discountPercentage: 46, section: 'Deep Groove Ball Bearings', categoryName: 'Industrial Bearings', image: '/bearings/img10.jpg', specifications: 'Electric Motor Quality (EMQ), Low Noise, High-RPM' },
              { partNumber: '6204', name: 'NBC 6204 Deep Groove Ball Bearing', brand: 'NBC', mrp: 240, discountPercentage: 46, section: 'Deep Groove Ball Bearings', categoryName: 'Industrial Bearings', image: '/bearings/img10.jpg', specifications: 'Precision Metric Radial Ball Bearing' },
              { partNumber: '6205', name: 'NBC 6205 Deep Groove Ball Bearing', brand: 'NBC', mrp: 310, discountPercentage: 46, section: 'Deep Groove Ball Bearings', categoryName: 'Industrial Bearings', image: '/bearings/img10.jpg', specifications: 'Standard Radial Motor Quality Bearing' },
              { partNumber: '6308', name: 'NBC 6308 Heavy Duty Radial Bearing', brand: 'NBC', mrp: 780, discountPercentage: 46, section: 'Deep Groove Ball Bearings', categoryName: 'Industrial Bearings', image: '/bearings/img10.jpg', specifications: 'C3 Internal Clearance, Heavy Radial Capacity' },
              { partNumber: '7322 2X', name: 'SKF 7322 2X High Precision Angular Contact Bearing', brand: 'SKF', mrp: 6500, discountPercentage: 10, section: 'Angular Contact Bearings', categoryName: 'Industrial Bearings', image: '/bearings/img1.jpg', specifications: 'High Thrust Load Matched Pair, 40° Contact' },
              { partNumber: '6313', name: 'Timken 6313 Open Type Deep Groove Bearing', brand: 'Timken', mrp: 2100, discountPercentage: 46, section: 'Heavy Series Bearings', categoryName: 'Industrial Bearings', image: '/bearings/img3.jpg', specifications: 'Heavy Industrial Shaft Quality, ISO Grade' },
              { partNumber: 'SPB 160-2', name: 'Fenner 2-Groove SPB Dynamic Taper Bush Pulley', brand: 'Fenner', mrp: 1850, discountPercentage: 46, section: 'Taper Lock Bush Pulleys', categoryName: 'Bush Pulleys & Taper Bushes', image: '/bannerImages/img4.jpg', specifications: 'Cast Iron GG25, Dynamically Balanced up to 30m/s' },
              { partNumber: 'SPC 250-3', name: 'Fenner 3-Groove SPC Heavy Transmission Pulley', brand: 'Fenner', mrp: 3450, discountPercentage: 46, section: 'Taper Lock Bush Pulleys', categoryName: 'Bush Pulleys & Taper Bushes', image: '/bannerImages/img4.jpg', specifications: 'Heavy Industrial 3-Groove Pulley for 2517/3020 Bushes' },
              { partNumber: '2517-45', name: 'Fenner 2517 Precision Taper Lock Bush (45mm)', brand: 'Fenner', mrp: 850, discountPercentage: 46, section: 'Taper Lock Bush Pulleys', categoryName: 'Bush Pulleys & Taper Bushes', image: '/bannerImages/img4.jpg', specifications: 'Finished Metric Bore 45mm with Keyway' },
            ];

            const matchH = standardHardcoded.find((p) => {
              const pPart = p.partNumber.toLowerCase().replace(/[\s\-_.]+/g, '');
              return pPart === cleanNoSpace || cleanId.includes(pPart) || p.name.toLowerCase().includes(cleanId);
            });

            if (matchH) {
              found = matchH;
              foundCat = { name: matchH.categoryName };
              foundSub = {
                name: matchH.section,
                products: standardHardcoded.filter((x) => x.categoryName === matchH.categoryName),
              };
            }
          }

          // 4. If still not found, create an authentic industrial part record for this custom part number
          if (!found) {
            found = {
              partNumber: identifier.toUpperCase(),
              name: `Industrial Component (${identifier.toUpperCase()})`,
              brand: 'Balumuni OEM Certified',
              section: 'Industrial Machinery Spares',
              categoryName: 'Industrial Power Transmission',
              subcategoryName: 'Standard & Special Profiles',
              description: `Authentic industrial part ${identifier.toUpperCase()} sourced directly from authorized manufacturers with genuine warranty and pan-India express dispatch.`,
              specifications: `Part Code: ${identifier.toUpperCase()} • Direct Factory Supply • GST Invoice`,
              mrp: 1200,
              wholesalePrice: 650,
              discountPercentage: 46,
              image: '/belts/PIX C 70 Classical V-Belt.jpg',
              inStock: true,
            };
            foundCat = { name: 'Industrial Power Transmission' };
            foundSub = { name: 'Industrial Spares', products: [] };
          }

          if (found) {
            const mrp = found.mrp || found.wholesalePrice || 0;
            const wholesalePrice = mrp;
            const discountPercentage = 0;

            loadedService = {
              _id: found._id || 'prod-' + found.partNumber,
              name: found.name,
              partNumber: found.partNumber,
              brand: found.brand || 'PIX',
              section: found.section || 'Industrial Component',
              category: {
                name: found.categoryName || foundCat?.name || 'Industrial Catalog',
                slug: (found.categoryName || foundCat?.name || 'industrial-catalog')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-'),
              },
              categoryName: found.categoryName || foundCat?.name,
              subcategoryName: found.subcategoryName || foundSub?.name,
              mainPrice: mrp,
              basePrice: mrp,
              officialMrp: mrp,
              mrp,
              discountPercentage: 0,
              discountPrice: mrp,
              mainImage:
                found.image ||
                '/belts/PIX C 70 Classical V-Belt.jpg',
              images: [
                found.image ||
                  '/belts/PIX C 70 Classical V-Belt.jpg',
              ],
              shortDescription: found.description || `${found.brand} ${found.name} (${found.partNumber})`,
              fullDescription:
                found.description ||
                `Original OEM certified ${found.brand} ${found.name}. Technical part number ${found.partNumber}. ${found.specifications || ''}`,
              specifications: found.specifications
                ? [{ name: 'Technical Specs', value: found.specifications }]
                : [],
              inStock: found.inStock !== false,
              isActive: true,
              isFromPdfCatalog: true,
              pdfUrl,
              packages: [
                {
                  _id: 'standard-wholesale-pack',
                  name: 'Standard Wholesale Pack',
                  price: mrp,
                  discountPrice: mrp,
                  description: 'Factory-sealed OEM unit with 100% genuine warranty and tracked dispatch',
                  features: ['100% Genuine Products', 'Factory Sealed', 'Pan-India Express Dispatch'],
                  isActive: true,
                },
              ],
            };

            relatedItems = (foundSub?.products || [])
              .filter((p) => p.partNumber !== found.partNumber)
              .slice(0, 4)
              .map((p) => ({
                _id: p._id || 'rel-' + p.partNumber,
                name: p.name,
                partNumber: p.partNumber,
                slug: p.partNumber,
                mainPrice: p.wholesalePrice,
                basePrice: p.wholesalePrice,
                discountPrice: p.wholesalePrice,
                mainImage: p.image || loadedService.mainImage,
                shortDescription: p.description,
              }));

            setSelectedPdfItem(found);
          }
        }

        if (loadedService) {
          setService(loadedService);
          if (loadedService.brand) {
            const match = brandsList.find((b) => b.name.toLowerCase() === loadedService.brand.toLowerCase());
            if (match) setCalcBrand(match.name);
          }
          if (loadedService.officialMrp > 0) {
            setCalcMrp(loadedService.officialMrp);
          }
          setRelatedServices(relatedItems);

          // Set packages
          if (loadedService.packages && loadedService.packages.length > 0) {
            setPackages(loadedService.packages);
            setSelectedPackage(loadedService.packages[0]);
          } else {
            // Fetch packages for this service
            try {
              const pkgRes = await contentService.getPackagesByService(loadedService._id);
              if (pkgRes?.success && pkgRes?.data && pkgRes.data.length > 0) {
                setPackages(pkgRes.data);
                setSelectedPackage(pkgRes.data[0]);
              }
            } catch (pErr) {
              // ignore
            }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton inline label="Back to Products" fallbackPath="/services" />
      </div>

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

          {/* Pricing Highlight - Pure Uncrossed MRP Rate */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600">Official Catalog MRP:</span>
              <span className="text-2xl sm:text-3xl font-black text-navy font-mono">
                {formatCurrency(officialMrp || service.mainPrice || service.basePrice)}
              </span>
              <span className="text-xs font-semibold text-slate-500 ml-1">+ 18% GST</span>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-lg">
              100% Genuine OEM Pricing
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4" /> 100% Genuine Products
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
          <div className="relative rounded-2xl overflow-hidden shadow-md bg-white border border-slate-200 flex items-center justify-center p-4">
            <img
              src={getProductImageUrl(service)}
              alt={service.name}
              className="w-full h-64 md:h-80 object-contain mx-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getProductImageUrl({
                  ...service,
                  mainImage: null,
                  image: null,
                });
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
                <span>Factory Authentic <strong className="text-emerald-700 font-black">100% Genuine Products &amp; Serial Traceability</strong></span>
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
                    <p className="text-sm sm:text-base font-extrabold text-navy mt-0.5 whitespace-nowrap">
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
        const activePdfUrl = selectedPdfItem?.pdfUrl
          ? getAssetUrl(selectedPdfItem.pdfUrl)
          : service?.pdfUrl
          ? getAssetUrl(service.pdfUrl)
          : pdfCatalog?.fileUrl
          ? getAssetUrl(pdfCatalog.fileUrl)
          : '/sample-catalog.pdf';

        const currentCat =
          selectedPdfCatIndex === -1
            ? null
            : pdfCatalog?.categories && pdfCatalog.categories[selectedPdfCatIndex]
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
                (p.partNumber && p.partNumber.toLowerCase().includes(q)) ||
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.brand && p.brand.toLowerCase().includes(q)) ||
                (p.specifications && p.specifications.toLowerCase().includes(q)) ||
                (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
                (p.subcategoryName && p.subcategoryName.toLowerCase().includes(q))
              );
            })
          : selectedPdfCatIndex === -1
          ? catalogAllProducts
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
                    onClick={() => setPdfViewMode('sheet')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      pdfViewMode === 'sheet'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Interactive Clickable PDF Sheet - All Data Clickable"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>⚡ Clickable PDF Sheet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfViewMode('split')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      pdfViewMode === 'split'
                        ? 'bg-primary text-white shadow-xs'
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
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Full Page PDF Document Viewer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Raw PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfViewMode('products_only')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      pdfViewMode === 'products_only'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Extracted Products Grid"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Cards Grid</span>
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
            <div>
              {/* 1. Full-Width Interactive Clickable PDF Specification Sheet (Default) */}
              {pdfViewMode === 'sheet' && (
                <div className="space-y-4">
                  {/* Category Pills & Search Bar */}
                  <div className="space-y-3 bg-gradient-to-r from-blue-50/80 via-sky-50/50 to-slate-50/60 p-4 rounded-2xl border border-blue-200">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-navy flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-primary" />
                        <span>Interactive PDF Specification Sheet • Click Any Product Row Below</span>
                      </span>
                      <span className="text-xs font-bold text-primary bg-white px-3 py-1 rounded-xl border border-blue-200 shadow-2xs">
                        {filteredProducts.length} Clickable Products Found
                      </span>
                    </div>

                    {/* Part Number Search */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search part # in this PDF catalog (e.g. A 18, 6204, SPC 2360, Fenner, 8V)..."
                        value={pdfSearchQuery}
                        onChange={(e) => setPdfSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary text-navy shadow-inner"
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
                        <button
                          type="button"
                          onClick={() => setSelectedPdfCatIndex(-1)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                            selectedPdfCatIndex === -1
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          All Categories ({catalogAllProducts.length})
                        </button>
                        {pdfCatalog.categories.map((cat, idx) => {
                          const catCount = cat.subcategories?.reduce((a, s) => a + (s.products?.length || 0), 0) || 0;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedPdfCatIndex(idx)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                                selectedPdfCatIndex === idx
                                  ? 'bg-primary text-white shadow-xs'
                                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                              }`}
                            >
                              {cat.name} ({catCount})
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* High-Contrast Interactive Clickable Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm max-h-[580px] scrollbar-thin">
                    <table className="w-full text-left text-xs bg-white">
                      <thead className="sticky top-0 z-10 bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider border-b border-slate-800 shadow-xs">
                        <tr>
                          <th className="py-3 px-3">Part Number</th>
                          <th className="py-3 px-3">Product Name &amp; Category</th>
                          <th className="py-3 px-3">Make</th>
                          <th className="py-3 px-4">Specifications &amp; Dimensions</th>
                          <th className="py-3 px-3 text-right">MRP Rate</th>
                          <th className="py-3 px-3 text-center">Clickable Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredProducts.map((prod, pIdx) => {
                          const isItemSelected = selectedPdfItem?.partNumber === prod.partNumber;
                          return (
                            <tr
                              key={prod._id || `${prod.partNumber}-${pIdx}`}
                              onClick={() => {
                                setSelectedPdfItem(prod);
                                setIsPdfProductModalOpen(true);
                              }}
                              className={`transition-all cursor-pointer group ${
                                isItemSelected
                                  ? 'bg-blue-50/90 font-bold border-l-4 border-l-primary'
                                  : 'hover:bg-blue-50/70'
                              }`}
                              title={`Click to Display ${prod.name} (${prod.partNumber})`}
                            >
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs font-black text-primary group-hover:underline">
                                    {prod.partNumber}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                    OEM
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-3 max-w-xs">
                                <p className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate" title={prod.name}>
                                  {prod.name}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {prod.categoryName || 'General'} {prod.subcategoryName ? `• ${prod.subcategoryName}` : ''}
                                </p>
                              </td>

                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-navy text-accent">
                                  {prod.brand || service?.brand || 'Industrial'}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-slate-600 font-mono text-[11px] max-w-sm truncate" title={prod.specifications || 'Standard OEM Specs'}>
                                {prod.specifications || 'Standard OEM Dimension & Tolerance'}
                              </td>

                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="flex flex-col items-end">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] line-through text-slate-400 font-mono">
                                      {formatCurrency(prod.mrp)}
                                    </span>
                                    <span className="px-1 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      -{activeDiscountPercentage}%
                                    </span>
                                  </div>
                                  <span className="font-mono font-black text-navy text-xs">
                                    {formatCurrency(Math.max(1, Math.round(prod.mrp - (prod.mrp * activeDiscountPercentage) / 100)))}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectPdfProductAsMain(prod, true);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-[11px] font-black transition-all shadow-xs group-hover:scale-105 cursor-pointer"
                                  title="Display as Main Product on Page"
                                >
                                  <span>Display Product</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>All rows and data inside this PDF are clickable. Click any product to view its complete specifications and wholesale pricing.</span>
                    </span>
                    <span className="font-bold text-primary">
                      {filteredProducts.length} items in catalog
                    </span>
                  </div>
                </div>
              )}

              {/* 2. Split View (Raw PDF and Interactive Clickable List) */}
              {pdfViewMode === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Raw PDF Viewer */}
                  <div className="lg:col-span-6 space-y-3">
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

                  {/* Right: Products In This PDF */}
                  <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                          <Package className="w-4 h-4 text-primary" />
                          <span>Click Any Product to Display ({filteredProducts.length})</span>
                        </span>
                      </div>

                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search part # in this PDF..."
                          value={pdfSearchQuery}
                          onChange={(e) => setPdfSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary text-navy"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[480px] overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-white shadow-inner">
                      {filteredProducts.map((prod, pIdx) => {
                        const isItemSelected = selectedPdfItem?.partNumber === prod.partNumber;
                        return (
                          <button
                            key={prod._id || `${prod.partNumber}-${pIdx}`}
                            type="button"
                            onClick={() => {
                              setSelectedPdfItem(prod);
                              setIsPdfProductModalOpen(true);
                            }}
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
                              <span className="text-[10px] text-slate-500 font-bold">MRP Rate:</span>
                              <span className="text-xs font-black text-navy font-mono">₹{prod.mrp}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Raw PDF Document Viewer */}
              {pdfViewMode === 'pdf_only' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold flex items-center gap-1.5 text-slate-800">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>{pdfCatalog?.fileName || 'Official Catalog PDF'}</span>
                    </span>
                    <span className="text-xs text-primary font-bold">
                      💡 Tip: Use "Clickable PDF Sheet" tab to click directly on table rows!
                    </span>
                  </div>

                  <div className="w-full h-[650px] rounded-2xl border border-slate-300 bg-slate-100 overflow-hidden shadow-inner relative">
                    <iframe
                      src={`${activePdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                      title="Direct In-Page PDF Catalog Viewer"
                      className="w-full h-full rounded-2xl border-0"
                    />
                  </div>
                </div>
              )}

              {/* 4. Products Cards Grid */}
              {pdfViewMode === 'products_only' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[580px] overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-white shadow-inner">
                    {filteredProducts.map((prod, pIdx) => (
                      <button
                        key={prod._id || `${prod.partNumber}-${pIdx}`}
                        type="button"
                        onClick={() => {
                          setSelectedPdfItem(prod);
                          setIsPdfProductModalOpen(true);
                        }}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:border-primary hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
                      >
                        <div>
                          <span className="font-mono text-xs font-black text-primary block group-hover:underline">
                            {prod.partNumber}
                          </span>
                          <h4 className="font-bold text-xs text-navy line-clamp-2 mt-1">
                            {prod.name}
                          </h4>
                          {prod.specifications && (
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {prod.specifications}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                          <span className="text-[10px] text-slate-500 font-bold">MRP Rate:</span>
                          <span className="text-xs font-black text-navy font-mono">₹{prod.mrp}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Interactive Product Display Modal for ANY Clicked PDF Product */}
      {selectedPdfItem && (
        <Modal
          isOpen={isPdfProductModalOpen}
          onClose={() => setIsPdfProductModalOpen(false)}
          title="Product Display"
        >
          <div className="space-y-5">
            {/* Top Product Header with Image and Badges */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200">
              <div className="w-28 h-28 rounded-2xl bg-white p-2 border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                <img
                  src={selectedPdfItem.image || service?.mainImage || 'https://cobrel.co.za/wp-content/uploads/2019/10/Classical-V-Belts-copy3.png'}
                  alt={selectedPdfItem.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://cobrel.co.za/wp-content/uploads/2019/10/Classical-V-Belts-copy3.png';
                  }}
                />
              </div>

              <div className="space-y-1.5 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-navy text-accent text-xs font-black">
                    {selectedPdfItem.brand || service?.brand || 'Industrial'}
                  </span>
                  <span className="font-mono text-xs font-black text-primary px-2.5 py-0.5 rounded-lg bg-blue-100 border border-blue-200">
                    {selectedPdfItem.partNumber}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified OEM Genuine
                  </span>
                </div>
                <h3 className="text-lg font-black text-navy leading-snug">
                  {selectedPdfItem.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedPdfItem.categoryName || 'Industrial Power Transmission & Bearings'} • {selectedPdfItem.subcategoryName || 'Standard OEM Part'}
                </p>
              </div>
            </div>

            {/* Price & Commercial Terms Card - Discount Subtracted from MRP */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>Official Catalog MRP:</span>
                <span className="line-through text-slate-400 font-mono text-sm">
                  {formatCurrency(selectedPdfItem.mrp)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span className="flex items-center gap-1.5">
                  <span>Your Wholesale Price:</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    -{activeDiscountPercentage}% OFF
                  </span>
                </span>
                <span className="font-black text-navy text-lg font-mono">
                  {formatCurrency(Math.max(1, Math.round(selectedPdfItem.mrp - (selectedPdfItem.mrp * activeDiscountPercentage) / 100)))}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-blue-100">
                <span>Statutory {defaultTaxRate}% GST Applicable</span>
                <span className="text-emerald-700 font-bold">100% Genuine OEM Certified</span>
              </div>
            </div>

            {/* Specifications Matrix */}
            {selectedPdfItem.specifications && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-slate-700">
                <strong className="text-navy font-bold block mb-1">Technical Specifications:</strong>
                <p className="font-mono text-slate-800">{selectedPdfItem.specifications}</p>
              </div>
            )}

            {/* Direct Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full py-3 font-black text-xs flex items-center justify-center gap-2 shadow-md bg-primary hover:bg-primary-dark cursor-pointer"
                onClick={() => {
                  setIsPdfProductModalOpen(false);
                  handleSelectPdfProductAsMain(selectedPdfItem, true);
                }}
              >
                <span>Display as Main Product on Page &amp; Purchase</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="accent"
                  size="sm"
                  className="w-full font-black text-xs flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-400 cursor-pointer"
                  onClick={() => {
                    setIsPdfProductModalOpen(false);
                    handleOrderPdfProduct(selectedPdfItem);
                  }}
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                  <span>Order Directly</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                  onClick={() => {
                    setIsPdfProductModalOpen(false);
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
              </div>
            </div>
          </div>
        </Modal>
      )}

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
              100% Genuine Products &amp; Invoice
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
