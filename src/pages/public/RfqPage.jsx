import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  ArrowRight,
  Send,
  Building2,
  Phone,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { Button } from '../../components/common/Button';
import { showSuccessAlert, showErrorAlert } from '../../utils/alerts';

export const RfqPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    gstin: '',
    brand: 'All / Multiple Brands',
    partNumber: '',
    quantity: 25,
    targetPrice: '',
    deliveryLocation: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.partNumber) {
      showErrorAlert('Missing Details', 'Please fill in your name, email, and the required part numbers.');
      return;
    }

    setLoading(true);
    try {
      const fullMessage = `
RFQ Submission Details:
- Brand(s): ${formData.brand}
- Part Numbers / Specs: ${formData.partNumber}
- Quantity: ${formData.quantity}
- Target Unit Price: ₹${formData.targetPrice || 'Market Best'}
- Company: ${formData.companyName}
- GSTIN: ${formData.gstin}
- Delivery Location: ${formData.deliveryLocation}
- Additional Notes: ${formData.message}
      `.trim();

      const res = await contentService.submitEnquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        gstin: formData.gstin,
        subject: `Industrial RFQ: ${formData.partNumber.slice(0, 50)} (${formData.quantity} Units)`,
        message: fullMessage,
        enquiryType: 'rfq',
        brand: formData.brand,
        partNumber: formData.partNumber,
        quantity: Number(formData.quantity) || 1,
        targetPrice: Number(formData.targetPrice) || 0,
      });

      if (res.success) {
        setSubmitted(true);
        showSuccessAlert(
          'RFQ Submitted Successfully!',
          'Your RFQ has been logged with our industrial procurement team. We will review inventory and send your formal quote with GST invoice terms within 1 hour.'
        );
      }
    } catch (err) {
      showErrorAlert('Submission Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-xl border border-blue-400/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        {/* Authentic industrial equipment banner */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/banners/img1.jpg"
            alt="Industrial Machinery & Bearings"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-overlay"
            onError={(e) => {
              e.target.src = '/banners/img4.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-indigo-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
            <FileSpreadsheet className="w-3.5 h-3.5" /> B2B & Bulk Wholesale Desk
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Request for Quotation (RFQ)
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Direct factory procurement for industrial plants, textile mills, cement plants, and OEMs. Submit part numbers across PIX, NBC, HCH, Fenner, Timken (all types), and SKF.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-xs text-slate-200 space-y-2 max-w-xs shrink-0">
          <p className="font-bold text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-accent" /> 1-Hour Quote Turnaround
          </p>
          <p className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-400" /> Insured Tracked Shipping
          </p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" /> MTC & Mill Test Certified
          </p>
        </div>
      </div>

      {/* Main Grid: Form and Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: RFQ Form */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-navy">Submit Parts & Bill of Materials (BOM)</h2>
            <p className="text-xs text-secondaryText mt-1">
              Provide your required part numbers, preferred brands, and quantities below.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-emerald-900">RFQ Received by Engineering Desk</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Thank you! Our technical sales engineers are calculating your bulk volume tier discounts. An official PDF quotation will be sent to <strong>{formData.email}</strong> shortly.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    companyName: '',
                    gstin: '',
                    brand: 'All / Multiple Brands',
                    partNumber: '',
                    quantity: 25,
                    targetPrice: '',
                    deliveryLocation: '',
                    message: '',
                  });
                }}
              >
                Submit Another Part Inquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Brand and Part Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Brand / Make *
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-darkText focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="All / Multiple Brands">Multiple Brands (Mixed BOM)</option>
                    <option value="PIX">PIX Transmissions (Belts - 46% Off MRP)</option>
                    <option value="NBC">NBC Bearings (46% Off MRP)</option>
                    <option value="HCH">HCH Bearings (46% Off MRP)</option>
                    <option value="Fenner">Fenner (Pulleys & Belts - 46% Off MRP)</option>
                    <option value="Timken">Timken (All Bearing Types - 46% Off MRP)</option>
                    <option value="SKF">SKF Bearings (10% Off MRP - National & Intl.)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Estimated Total Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-black text-darkText focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              {/* Part Number / Line items input */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Part Numbers, Item Codes, or Sizes *
                </label>
                <textarea
                  rows="3"
                  required
                  name="partNumber"
                  value={formData.partNumber}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. 10 pcs 6204ZZ, 5 pcs 6313 open, 12 pcs PIX SPC 2360, 2 pcs Fenner Pulley 200 X 3C (2517 60mm)..."
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Purchasing Officer / Engineer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="procurement@mill.com"
                  />
                </div>
              </div>

              {/* Company & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="+91 98765 00000"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company / Mill / Plant Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Coimbatore Spinning Mills"
                  />
                </div>
              </div>

              {/* GSTIN and Target Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    GSTIN Number (For 18% Tax Credit)
                  </label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 uppercase font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="33AAAAA0000A1Z5"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Budget / Price (Optional ₹)
                  </label>
                  <input
                    type="number"
                    name="targetPrice"
                    value={formData.targetPrice}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Target total or unit ₹"
                  />
                </div>
              </div>

              {/* Delivery location and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Delivery Pincode / Destination City
                  </label>
                  <input
                    type="text"
                    name="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. 641018 / Coimbatore"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Required Dispatch Urgency
                  </label>
                  <select
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="Normal Dispatch (24-48 Hours)">Normal Dispatch (24-48 Hours)</option>
                    <option value="Urgent Plant Breakdown (Same Day Dispatch)">Urgent Plant Breakdown (Same Day Air Freight)</option>
                    <option value="Scheduled Maintenance Project (Next Week)">Scheduled Maintenance Project (Next Week)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full justify-center font-black py-3.5 shadow-md text-base"
                  isLoading={loading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Industrial RFQ for 1-Hour Quote
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Wholesale Terms & Support */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-lg text-navy">Our Commercial Supply Terms</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="font-extrabold text-amber-900">45% - 48% Discount Schedule</p>
                <p className="text-amber-800 mt-0.5">Applied on PIX, NBC, HCH, Fenner, and Timken official price lists.</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="font-extrabold text-blue-900">SKF Flat 10% Discount Policy</p>
                <p className="text-blue-800 mt-0.5">Strictly 10% discount from SKF MRP with National & International certificates.</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="font-extrabold text-emerald-900">Insured Dispatch</p>
                <p className="text-emerald-800 mt-0.5">Nationwide door-to-door insured logistics with factory packaging.</p>
              </div>
            </div>
          </div>

          <div className="bg-navy rounded-3xl p-6 text-white space-y-4 shadow-md">
            <h3 className="font-bold text-base text-accent">Prefer to Talk to Sales Directly?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our power transmission engineers can assist with belt pitch calculations, taper bush compatibility, or bearing cross-references.
            </p>
            <div className="space-y-2 text-xs pt-1">
              <p className="flex items-center gap-2 font-bold text-white">
                <Phone className="w-4 h-4 text-accent" /> +91 98765 43210
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-accent" /> balumuniandassociates@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
