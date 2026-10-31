import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Building2,
  Truck,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  X,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { formatCurrency } from '../../utils/formatters';
import { bookingService } from '../../services/bookingService';
import { showSuccessAlert, showErrorAlert } from '../../utils/alerts';

/**
 * Load Razorpay Checkout SDK Script Dynamically
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const PaymentModal = ({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [testOrderId, setTestOrderId] = useState('');
  const [testAmount, setTestAmount] = useState(0);

  if (!booking) return null;

  const totalAmount = booking.totalAmount || 0;
  const bookingNumber = booking.bookingNumber || booking._id;

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Razorpay Secure Gateway',
      badge: 'Instant Confirmation',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      description: 'Debit/Credit Cards, UPI (GPay/PhonePe/Paytm), Net Banking & Wallets',
      icon: CreditCard,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'upi_direct',
      name: 'Direct UPI / QR Code',
      badge: 'Zero Convenience Fee',
      badgeColor: 'bg-amber-100 text-amber-800',
      description: 'Fast QR Scan payment via Google Pay, PhonePe, BHIM or Paytm',
      icon: QrCode,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      id: 'netbanking',
      name: 'Corporate Net Banking / NEFT / RTGS',
      badge: 'For High Value B2B',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      description: 'SBI, HDFC, ICICI, Axis and 50+ commercial banks with Tax Invoice copy',
      icon: Building2,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      id: 'pay_on_dispatch',
      name: 'Pay on Dispatch / B2B Credit (POD)',
      badge: 'Delhivery Handover',
      badgeColor: 'bg-slate-100 text-slate-800',
      description: 'Settle via Cash, Cheque or 15-day verified GST Credit upon delivery',
      icon: Truck,
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  // Primary payment initiator
  const handleProceedToPay = async () => {
    setLoading(true);
    try {
      // 1. Create payment order through backend
      const orderRes = await bookingService.createPaymentOrder(booking._id, selectedMethod === 'razorpay' ? 'razorpay' : selectedMethod);

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Unable to initiate payment transaction.');
      }

      const isLiveRazorpayKey = orderRes.key && 
        !orderRes.key.includes('dummy') && 
        !orderRes.key.includes('placeholder') &&
        !orderRes.isTestMode;

      // If live Razorpay key is active, open official Razorpay Checkout popup
      if (selectedMethod === 'razorpay' && isLiveRazorpayKey) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Failed to load Razorpay payment SDK. Please check your internet connection.');
        }

        const options = {
          key: orderRes.key,
          amount: orderRes.amount,
          currency: orderRes.currency || 'INR',
          name: 'Balumuni Industrial Solutions',
          description: `Payment for Order #${bookingNumber}`,
          image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=200&q=80',
          order_id: orderRes.orderId,
          handler: async (response) => {
            try {
              setLoading(true);
              const verifyRes = await bookingService.verifyPayment({
                bookingId: booking._id,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                provider: 'razorpay',
              });

              if (verifyRes.success) {
                await showSuccessAlert(
                  'Payment Successful!',
                  `Transaction ${response.razorpay_payment_id} verified. Delhivery shipment confirmed.`
                );
                onClose();
                if (onPaymentSuccess) onPaymentSuccess(verifyRes.data || verifyRes);
              } else {
                throw new Error(verifyRes.message || 'Payment verification failed');
              }
            } catch (err) {
              showErrorAlert('Verification Error', err.message);
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: booking.customer?.name || '',
            email: booking.customer?.email || '',
            contact: booking.customer?.phone || '',
          },
          notes: {
            bookingId: booking._id,
            bookingNumber: bookingNumber,
          },
          theme: {
            color: '#0F172A',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          showErrorAlert('Payment Failed', response.error.description || 'Transaction was declined.');
          setLoading(false);
        });
        rzp.open();
        setLoading(false);
        return;
      }

      // If test mode / dummy key or alternate method selected:
      // Open the interactive test modal so user can test and verify payment immediately!
      setTestOrderId(orderRes.orderId);
      setTestAmount(orderRes.amount || totalAmount * 100);
      setShowSimulator(true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      showErrorAlert('Payment Error', err.message || 'Failed to process payment');
    }
  };

  // Complete simulated test payment
  const handleSimulatePayment = async (status = 'success') => {
    setLoading(true);
    try {
      if (status === 'fail') {
        setShowSimulator(false);
        showErrorAlert('Transaction Cancelled', 'Simulated payment failure triggered. You can retry anytime.');
        setLoading(false);
        return;
      }

      const dummyPaymentId = `pay_rzp_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const verifyRes = await bookingService.verifyPayment({
        bookingId: booking._id,
        orderId: testOrderId,
        paymentId: dummyPaymentId,
        signature: 'dummy_test_signature',
        provider: selectedMethod === 'razorpay' ? 'razorpay' : selectedMethod,
      });

      if (verifyRes.success) {
        setShowSimulator(false);
        onClose();
        await showSuccessAlert(
          'Payment Verified!',
          `Order #${bookingNumber} paid successfully. Delhivery tracking & GST Tax Invoice generated.`
        );
        if (onPaymentSuccess) onPaymentSuccess(verifyRes.data || verifyRes);
      } else {
        throw new Error(verifyRes.message || 'Payment verification failed');
      }
    } catch (err) {
      showErrorAlert('Verification Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. Main Payment Method Selection Modal */}
      <Modal
        isOpen={isOpen && !showSimulator}
        onClose={onClose}
        title="Select Payment Method"
      >
        <div className="space-y-5">
          {/* Order Summary Strip */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Order Reference</p>
              <p className="text-sm font-black font-mono text-navy">#{bookingNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500 font-medium">Payable Amount (incl. 18% GST)</p>
              <p className="text-xl font-black text-navy">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          {/* Payment Method Cards */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Choose how you want to pay:
            </p>

            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;

              return (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 relative ${
                    isSelected
                      ? 'border-navy bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 ${method.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900">{method.name}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${method.badgeColor}`}>
                        {method.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {method.description}
                    </p>
                  </div>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-navy bg-navy text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px]">
              256-bit Bank Grade Encryption • Official GST Input Tax Credit • Instant Delhivery Dispatch
            </span>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1 justify-center"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              className="flex-1 justify-center font-bold inline-flex items-center gap-2 py-2.5 shadow-md shadow-accent/20"
              isLoading={loading}
              onClick={handleProceedToPay}
            >
              <Lock className="w-4 h-4" />
              <span>Proceed with {paymentMethods.find(m => m.id === selectedMethod)?.name.split(' ')[0]}</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. Interactive Razorpay Test Simulator Modal */}
      <Modal
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        title="Razorpay Gateway — Test Sandbox Mode"
      >
        <div className="space-y-5">
          {/* Razorpay Brand Header */}
          <div className="p-4 bg-gradient-to-r from-blue-900 via-navy to-slate-900 text-white rounded-2xl shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent" />
                Razorpay Test Sandbox
              </span>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black uppercase">
                Simulator
              </span>
            </div>
            <p className="text-lg font-black">{formatCurrency(totalAmount)}</p>
            <p className="text-[11px] text-slate-300">
              Order ID: <span className="font-mono">{testOrderId || 'order_sandbox'}</span>
            </p>
          </div>

          {/* Sandbox Info */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-navy space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Live-Ready Razorpay Architecture</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              This interactive test flow allows immediate testing of payment verification, automated Delhivery order confirmation, and GST Tax Invoice generation. 
              To activate real bank payments, simply set <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-blue-800 font-bold">RAZORPAY_KEY_ID</code> and <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-blue-800 font-bold">RAZORPAY_KEY_SECRET</code> in the backend <code className="font-mono">.env</code>.
            </p>
          </div>

          {/* Simulation Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Simulate Transaction Outcome:
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSimulatePayment('success')}
                className="p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 flex flex-col items-center justify-center gap-1.5 font-bold transition-all shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Simulate Success</span>
                <span className="text-[10px] font-normal text-emerald-700">Authorizes & generates invoice</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSimulatePayment('fail')}
                className="p-3.5 rounded-xl border-2 border-rose-300 bg-rose-50 hover:bg-rose-100/80 text-rose-950 flex flex-col items-center justify-center gap-1.5 font-bold transition-all shadow-sm"
              >
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span className="text-xs">Simulate Failure</span>
                <span className="text-[10px] font-normal text-rose-700">Declines transaction safely</span>
              </button>
            </div>
          </div>

          {/* Close Simulator */}
          <div className="pt-2">
            <Button
              variant="secondary"
              className="w-full justify-center text-xs"
              onClick={() => setShowSimulator(false)}
              disabled={loading}
            >
              Back to Payment Options
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
