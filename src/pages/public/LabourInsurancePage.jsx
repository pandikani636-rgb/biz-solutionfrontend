import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  IndianRupee,
  Phone,
  Mail,
  UserCheck,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  HardHat,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { showSuccessAlert, showErrorAlert } from '../../utils/alerts';
import { BackButton } from '../../components/common/BackButton';
import { Button } from '../../components/common/Button';

const COVERAGE_OPTIONS = ['₹1 Lakh', '₹3 Lakhs', '₹5 Lakhs', '₹10 Lakhs'];
const PERIOD_OPTIONS = ['3 Months', '6 Months', '12 Months'];

const BASE_RATES = {
  '₹1 Lakh': 450,
  '₹3 Lakhs': 850,
  '₹5 Lakhs': 1250,
  '₹10 Lakhs': 2100,
};

const PERIOD_FACTORS = {
  '3 Months': 0.35,
  '6 Months': 0.65,
  '12 Months': 1.0,
};

export const LabourInsurancePage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    gstNumber: '',
    officialEmail: '',
    contactPersonRole: '',
    officialContactNumber: '',
    numberOfLabours: 10,
    workingPeriod: '12 Months',
    insuranceCoverage: '₹5 Lakhs',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState(null);

  // Live estimated premium calculation
  const calculatePremium = () => {
    const base = BASE_RATES[formData.insuranceCoverage] || 1250;
    const factor = PERIOD_FACTORS[formData.workingPeriod] || 1.0;
    const labours = Math.max(1, Number(formData.numberOfLabours) || 1);
    return Math.round(labours * base * factor);
  };

  const estimatedTotal = calculatePremium();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Basic GST validation
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      const cleanedGst = formData.gstNumber.trim().toUpperCase();
      if (!gstRegex.test(cleanedGst)) {
        showErrorAlert(
          'Invalid GSTIN Format',
          'Please enter a valid 15-character GST Number (e.g., 33HONPK5547G2ZK).'
        );
        setSubmitting(false);
        return;
      }

      const res = await contentService.submitLabourInsurance({
        ...formData,
        gstNumber: cleanedGst,
        numberOfLabours: Number(formData.numberOfLabours),
      });

      if (res.success) {
        setSubmittedInquiry(res.data);
        await showSuccessAlert(
          'Application Submitted!',
          `Your Labour Insurance request (Ref: ${res.data.inquiryNumber}) has been registered. Our underwriting team will contact your official email & phone shortly.`
        );
        // Reset form
        setFormData({
          companyName: '',
          gstNumber: '',
          officialEmail: '',
          contactPersonRole: '',
          officialContactNumber: '',
          numberOfLabours: 10,
          workingPeriod: '12 Months',
          insuranceCoverage: '₹5 Lakhs',
          notes: '',
        });
      }
    } catch (err) {
      showErrorAlert('Submission Failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white py-16 sm:py-20">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <BackButton inline label="Back to Home" fallbackPath="/" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <HardHat className="w-4 h-4 text-amber-400" />
            <span>Industrial Compliance &amp; Social Security</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-amber-400 tracking-tight leading-tight max-w-3xl drop-shadow-md">
            Contractor &amp; Factory Labour Insurance
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Protect your workforce, comply with statutory state labour welfare norms, and insure against workplace accidents, hospitalization, and disability with instant policy quotes.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="w-4 h-4" /> 100% Tax Deductible Expense
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <CheckCircle2 className="w-4 h-4" /> Instant Quote Generation
            </span>
            <span className="flex items-center gap-1.5 text-blue-300">
              <CheckCircle2 className="w-4 h-4" /> Workmen's Compensation Compliant
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <span>Labour Insurance Application Form</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill in your company and labour headcount details to generate an official policy quote.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Company Name & GST */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Acme Industrial Works Pvt Ltd"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    GST Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FileCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="gstNumber"
                      required
                      maxLength={15}
                      value={formData.gstNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. 33HONPK5547G2ZK"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono uppercase focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Official Email & Contact Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Official Email ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      name="officialEmail"
                      required
                      value={formData.officialEmail}
                      onChange={handleChange}
                      placeholder="e.g. admin@company.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Official Contact Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      name="officialContactNumber"
                      required
                      value={formData.officialContactNumber}
                      onChange={handleChange}
                      placeholder="e.g. +91 74184 23238"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Contact Person Role & Headcount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Contact Person's Designation or Role <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="contactPersonRole"
                      required
                      value={formData.contactPersonRole}
                      onChange={handleChange}
                      placeholder="e.g. HR Manager / Plant Head"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Number of Labours <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="number"
                      name="numberOfLabours"
                      min="1"
                      max="10000"
                      required
                      value={formData.numberOfLabours}
                      onChange={handleChange}
                      placeholder="e.g. 25"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Working Period Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  Select Working Period <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PERIOD_OPTIONS.map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setFormData({ ...formData, workingPeriod: period })}
                      className={`py-3 px-3 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs sm:text-sm ${
                        formData.workingPeriod === period
                          ? 'border-primary bg-blue-50 text-primary shadow-xs ring-2 ring-primary/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <Calendar className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                      <span>{period}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Insurance Coverage Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  Select Insurance Coverage per Labour <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {COVERAGE_OPTIONS.map((cov) => (
                    <button
                      key={cov}
                      type="button"
                      onClick={() => setFormData({ ...formData, insuranceCoverage: cov })}
                      className={`py-3 px-3 rounded-2xl border text-center transition-all cursor-pointer font-extrabold text-xs sm:text-sm ${
                        formData.insuranceCoverage === cov
                          ? 'border-amber-500 bg-amber-50/80 text-amber-900 shadow-xs ring-2 ring-amber-400/30'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <IndianRupee className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                      <span>{cov}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  Special Project / Worksite Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. Civil construction project, high-altitude scaffolding, hazardous chemical manufacturing..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-primary"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={submitting}
                  className="w-full py-3.5 font-black text-sm bg-primary hover:bg-blue-700 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Submit Labour Insurance Application</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>
          </div>

          {/* Right Summary & Highlights: 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Premium Calculator Card - Transparent Frosted Glass Design */}
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-blue-200/80 shadow-2xl relative overflow-hidden text-slate-900 transition-all">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/90 border border-blue-200 px-3 py-1 rounded-full inline-block">
                Live Quotation Estimate
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-3">
                Estimated Policy Premium
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Calculated for {formData.numberOfLabours || 1} labours ({formData.workingPeriod}) with {formData.insuranceCoverage} coverage.
              </p>

              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-sky-50/80 to-white/90 border border-blue-200 shadow-sm backdrop-blur-md">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-700 font-bold">Total Estimated Premium:</span>
                  <span className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">
                    ₹{estimatedTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-blue-100 flex justify-between text-[11px] text-slate-600">
                  <span className="font-medium">Per Labour Rate:</span>
                  <span className="font-extrabold text-slate-900">
                    ~₹{Math.round(estimatedTotal / Math.max(1, Number(formData.numberOfLabours) || 1)).toLocaleString('en-IN')} / person
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-2.5 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Accidental Death &amp; Permanent Total Disability (PTD)</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Workplace Medical Hospitalization &amp; ICU Expenses</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Statutory Certificate for Tender / Factory Inspector</span>
                </div>
              </div>
            </div>

            {/* Statutory Compliance Benefits */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                <span>Mandatory Labour Compliance</span>
              </h4>

              <div className="space-y-3 text-xs text-slate-600">
                <p className="leading-relaxed">
                  Under the <strong>Contract Labour (Regulation &amp; Abolition) Act</strong> and <strong>Employees' Compensation Act</strong>, every contractor and manufacturing employer is statutorily mandated to maintain valid insurance coverage for on-site personnel.
                </p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-medium">
                  <strong>Need assistance with large industrial fleets?</strong>
                  <p className="text-[11px] mt-0.5">
                    Call our specialized underwriting desk at <a href="tel:+917418423238" className="font-bold underline">+91-74184 23238</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LabourInsurancePage;
