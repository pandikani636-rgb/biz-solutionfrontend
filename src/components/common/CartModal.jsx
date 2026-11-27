import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { showToast, showErrorAlert } from '../../utils/alerts';
import { contentService } from '../../services/contentService';
import { BalumuniInvoice } from './BalumuniInvoice';
import { Spinner } from './Spinner';

export const CartModal = () => {
  const {
    cartItems,
    totalItemCount,
    cartSubtotal,
    cartTax,
    cartGrandTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    closeCart,
  } = useCart();
  const { user } = useAuth();

  // Quotation Submission States
  const [isQuotationFormOpen, setIsQuotationFormOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [generatedQuotation, setGeneratedQuotation] = useState(null);
  const [isInvoiceViewOpen, setIsInvoiceViewOpen] = useState(false);

  const [orderForm, setOrderForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    companyName: user?.companyName || '',
    deliveryLocation: user?.address?.city || '',
    gstin: user?.gstin || '',
    notes: '',
  });

  if (!isCartOpen) return null;

  // Submit and Generate Quotation
  const handleGenerateQuotationSubmit = async (e) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.phone) {
      showErrorAlert('Missing Information', 'Please provide your full name and phone number.');
      return;
    }

    if (cartItems.length === 0) {
      showErrorAlert('Empty Cart', 'Your cart is empty. Please add products first.');
      return;
    }

    setOrderSubmitting(true);
    try {
      const payload = {
        name: orderForm.name,
        phone: orderForm.phone,
        email: orderForm.email || `${orderForm.phone.replace(/[^0-9]/g, '')}@balumuni-client.com`,
        subject: `B2B Quotation Request: ${cartItems.map((it) => it.partNumber).join(', ')}`,
        message: `Official Quotation generated from Cart.\nItems: ${cartItems.length} line items.\nDestination: ${orderForm.deliveryLocation}\nNotes: ${orderForm.notes || 'None'}`,
        enquiryType: 'rfq',
        companyName: orderForm.companyName,
        deliveryLocation: orderForm.deliveryLocation,
        gstin: orderForm.gstin,
        brand: cartItems[0]?.brand || 'Industrial Spares',
        partNumber: cartItems.map((it) => it.partNumber).join(', '),
        quantity: totalItemCount,
        targetPrice: cartSubtotal,
        approvedPrice: cartGrandTotal,
        items: cartItems,
        subtotal: cartSubtotal,
        taxRate: 18,
        taxAmount: cartTax,
        totalAmount: cartGrandTotal,
        paymentTerms: '7 DAYS CREDIT',
        deliveryTerms: orderForm.deliveryLocation
          ? `DOORSTEP TO ${orderForm.deliveryLocation.toUpperCase()}`
          : 'SELF TO SRIVIL',
      };

      const res = await contentService.submitEnquiry(payload);
      if (res.success) {
        setIsQuotationFormOpen(false);
        setGeneratedQuotation(res.data);
        setIsInvoiceViewOpen(true);
        showToast(`Quotation #${res.data?.quotationNumber || 'Generated'} created successfully!`);
      }
    } catch (err) {
      showErrorAlert('Quotation Failed', err.response?.data?.message || err.message);
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Slide-Over Drawer Container */}
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden relative animate-slideInRight">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between border-b border-blue-500/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-amber-300 shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Your Quotation Cart</h2>
              <p className="text-xs text-blue-100">
                {totalItemCount} unit{totalItemCount !== 1 ? 's' : ''} across {cartItems.length} product{cartItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Your cart is empty</h3>
                <p className="text-xs text-secondaryText mt-1 max-w-xs mx-auto">
                  Browse products on the Products Page and click "Add to Quotation Cart" to calculate wholesale prices.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-black text-xs transition-colors shadow-sm cursor-pointer"
              >
                Explore Products Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500 pb-1 border-b border-slate-100">
                <span className="font-bold">Added Line Items ({cartItems.length}):</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-rose-600 hover:underline font-bold text-[11px]"
                >
                  Clear All
                </button>
              </div>

              {/* Items List */}
              {cartItems.map((item) => (
                <div
                  key={item.partNumber}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left: Thumbnail & Name */}
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={item.image || '/belts/pix-section-c.jpg'}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-navy">{item.partNumber}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                          {item.brand}
                        </span>
                      </div>
                      <p className="text-xs text-secondaryText truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Rate: {formatCurrency(item.rate)} / unit
                      </p>
                    </div>
                  </div>

                  {/* Right: Quantity increment/decrement + Line Amount (Multiplies in real-time) */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.partNumber, item.quantity - 1)}
                        className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-navy cursor-pointer transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-navy font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.partNumber, item.quantity + 1)}
                        className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-navy cursor-pointer transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Multiplied Total Price: rate * quantity */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-sm font-black text-navy block font-mono">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({item.quantity} × {item.rate})
                      </span>
                    </div>

                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.partNumber)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary & Generate Quotation Button */}
        {cartItems.length > 0 && (
          <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-4">
            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Net Wholesale Rate):</span>
                <span className="font-mono font-bold text-navy">{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (18% Input Tax Credit):</span>
                <span className="font-mono font-bold text-navy">{formatCurrency(cartTax)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm">
                <span className="font-black text-navy">Grand Total (incl. GST & Freight):</span>
                <span className="text-xl font-black text-primary font-mono">{formatCurrency(cartGrandTotal)}</span>
              </div>
            </div>

            {/* Action Buttons: Generate Quotation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsQuotationFormOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Generate Official Quotation</span>
              </button>

              <button
                type="button"
                onClick={closeCart}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue Browsing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Client Contact Form for Quotation */}
      {isQuotationFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-navy">Generate Official Quotation</h3>
                <p className="text-xs text-secondaryText">
                  Official GST B2B Quotation with 100% Genuine OEM Certification
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuotationFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateQuotationSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Company Name</label>
                  <input
                    type="text"
                    value={orderForm.companyName}
                    onChange={(e) => setOrderForm({ ...orderForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Balaji Mills Pvt Ltd"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Delivery City</label>
                  <input
                    type="text"
                    value={orderForm.deliveryLocation}
                    onChange={(e) => setOrderForm({ ...orderForm, deliveryLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Coimbatore, Tamil Nadu"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={orderForm.gstin}
                  onChange={(e) => setOrderForm({ ...orderForm, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="33AAACB1234F1Z5"
                />
              </div>

              {/* Summary */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-extrabold text-navy">
                  Total {totalItemCount} Unit{totalItemCount > 1 ? 's' : ''} • Grand Total: {formatCurrency(cartGrandTotal)}
                </span>
                <p className="text-[11px] text-slate-500">
                  Includes 18% GST and standard insured delivery dispatch.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuotationFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-blue-700 text-white font-black shadow flex items-center gap-2 disabled:opacity-50"
                >
                  {orderSubmitting ? <Spinner size="xs" /> : <Printer className="w-4 h-4" />}
                  <span>{orderSubmitting ? 'Generating...' : 'View Official Quotation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Balumuni Invoice / Quotation View */}
      {isInvoiceViewOpen && generatedQuotation && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-navy">Official B2B Quotation Generated</h3>
                <p className="text-xs text-secondaryText">Quotation #{generatedQuotation.quotationNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsInvoiceViewOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-navy cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <BalumuniInvoice quotation={generatedQuotation} />
          </div>
        </div>
      )}
    </div>
  );
};
