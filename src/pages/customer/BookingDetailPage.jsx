import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  User,
  CreditCard,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { formatCurrency, formatDateTime, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';

export const BookingDetailPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getBookingById(id);
        if (res.success && res.data) {
          setBooking(res.data);
        }
      } catch (err) {
        console.error('[Booking Detail Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Booking Not Found</h2>
        <Link to="/customer/bookings">
          <Button variant="primary">Back to My Bookings</Button>
        </Link>
      </div>
    );
  }

  const statusClass = getStatusBadgeClass(booking.status);

  return (
    <div className="space-y-8">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/customer/bookings"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-navy hover:bg-slate-50 transition-smooth"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-navy">
                Order #{booking.bookingNumber}
              </h2>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border ${statusClass}`}
              >
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-secondaryText mt-0.5">
              Placed on {formatDateTime(booking.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-darkText hover:bg-slate-50 transition-smooth"
          >
            🖨️ Print Order Summary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Timeline & Service Snapshot */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Workflow Milestones Timeline */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Real-Time Workflow Progress</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {booking.statusHistory?.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm" />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-sm text-darkText capitalize">
                        {step.status.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-secondaryText">
                        {formatDateTime(step.timestamp)}
                      </span>
                    </div>
                    {step.note && (
                      <p className="text-xs text-secondaryText mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {step.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Dynamic Form Data Snapshot */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Service Custom Specifications Submitted</span>
            </h3>

            {booking.dynamicFormData && Object.keys(booking.dynamicFormData).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(booking.dynamicFormData).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <p className="text-[11px] font-bold text-secondaryText uppercase tracking-wider">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </p>
                    <p className="text-sm font-semibold text-darkText mt-1">
                      {String(val) || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-secondaryText italic">No custom form fields were required.</p>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Immutable Snapshot */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-navy">Service & Package</h3>
              <div className="mt-3 flex items-start gap-3">
                <img
                  src={booking.serviceSnapshot?.mainImage || booking.service?.mainImage}
                  alt={booking.serviceSnapshot?.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-sm text-darkText leading-snug">
                    {booking.serviceSnapshot?.name}
                  </h4>
                  <p className="text-xs text-primary font-bold mt-1">
                    {booking.packageSnapshot?.name}
                  </p>
                  <p className="text-[11px] text-secondaryText">
                    {booking.packageSnapshot?.duration}
                  </p>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-secondaryText">Base Package Price:</span>
                <span className="font-bold text-darkText">{formatCurrency(booking.baseAmount)}</span>
              </div>

              {booking.selectedAddOns?.map((a) => (
                <div key={a.name} className="flex justify-between text-secondaryText pl-2">
                  <span>+ {a.name}</span>
                  <span className="font-semibold text-darkText">{formatCurrency(a.price)}</span>
                </div>
              ))}

              {booking.coupon?.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({booking.coupon.code}):</span>
                  <span>-{formatCurrency(booking.coupon.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-secondaryText">
                <span>GST / Tax ({booking.taxRate}%):</span>
                <span className="font-semibold text-darkText">{formatCurrency(booking.taxAmount)}</span>
              </div>

              <div className="h-px bg-slate-100 my-1" />

              <div className="flex justify-between text-sm font-black text-navy pt-1">
                <span>Total Amount:</span>
                <span>{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Record */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondaryText">Payment Status:</span>
                <span className="font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {booking.paymentStatus}
                </span>
              </div>
              {booking.payment && (
                <div className="text-[11px] text-secondaryText bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                  <p>Transaction ID: <span className="font-mono font-bold text-darkText">{booking.payment.transactionId}</span></p>
                  <p>Provider: <span className="uppercase font-semibold">{booking.payment.provider}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
