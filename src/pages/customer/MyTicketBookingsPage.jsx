import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BusFront, CalendarDays, CheckCircle2, Clock3, CreditCard, Plane, ShieldCheck,
  TicketCheck, TrainFront, XCircle,
} from 'lucide-react';
import { ticketBookingService } from '../../services/ticketBookingService';
import { useAuth } from '../../context/AuthContext';
import { showConfirmDialog, showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import { Spinner } from '../../components/common/Spinner';

const loadRazorpay = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve();
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error('Could not load the secure payment gateway.'));
  document.body.appendChild(script);
});

const formatDateTime = (value) => new Date(value).toLocaleString('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const statusClass = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-800 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
  paid: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  refunded: 'bg-violet-50 text-violet-800 border-violet-200',
};

const canCancel = (travelAt) => new Date(travelAt).getTime() - Date.now() >= 48 * 60 * 60 * 1000;

const transportIcon = { bus: BusFront, train: TrainFront, flight: Plane };
const paymentOptions = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'netbanking', label: 'Net banking' },
  { value: 'wallet', label: 'Wallet' },
];

export const MyTicketBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePaymentId, setActivePaymentId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ticketBookingService.getMine();
      setBookings(response.data || []);
    } catch (error) {
      showErrorAlert('Unable to load ticket bookings', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const cancelBooking = async (booking) => {
    const confirmed = await showConfirmDialog(
      'Cancel ticket request?',
      'Cancellation is accepted only when departure is at least 48 hours away. Paid bookings will need an administrator to process the refund.'
    );
    if (!confirmed) return;
    try {
      const response = await ticketBookingService.cancel(booking._id, 'Cancellation requested by customer');
      await showSuccessAlert('Cancellation recorded', response.message || 'Your cancellation request was recorded.');
      await loadBookings();
    } catch (error) {
      showErrorAlert('Cancellation not permitted', error.message);
    }
  };

  const payForBooking = async (booking) => {
    setActivePaymentId(booking._id);
    try {
      const order = await ticketBookingService.createPaymentOrder(booking._id);
      if (!order.key || !order.orderId) throw new Error('The secure payment gateway returned an incomplete order.');
      await loadRazorpay();
      const methodLabels = Object.fromEntries(paymentOptions.map((option) => [option.value, option.label]));
      const checkout = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Balumuni and Associates',
        description: `Ticket booking ${booking.bookingNumber}`,
        order_id: order.orderId,
        prefill: {
          name: user?.name || '',
          email: booking.passengerContact?.email || user?.email || '',
          contact: booking.passengerContact?.phone || user?.phone || '',
        },
        notes: { bookingNumber: booking.bookingNumber },
        config: {
          display: {
            blocks: {
              preferred: {
                name: `Pay using ${methodLabels[paymentMethod] || 'your preferred method'}`,
                instruments: [{ method: paymentMethod }],
              },
            },
            sequence: ['block.preferred'],
            preferences: { show_default_blocks: false },
          },
        },
        theme: { color: '#0f172a' },
        handler: async (result) => {
          try {
            setActivePaymentId(booking._id);
            await ticketBookingService.verifyPayment(booking._id, {
              orderId: result.razorpay_order_id,
              paymentId: result.razorpay_payment_id,
              signature: result.razorpay_signature,
            });
            await showSuccessAlert('Payment verified', 'Your ticket payment was confirmed securely.');
            await loadBookings();
          } catch (error) {
            showErrorAlert('Payment verification failed', error.message);
          } finally {
            setActivePaymentId('');
          }
        },
        modal: { ondismiss: () => setActivePaymentId('') },
      });
      checkout.on('payment.failed', (event) => {
        setActivePaymentId('');
        showErrorAlert('Payment failed', event.error?.description || 'The payment could not be completed. You can try again.');
      });
      checkout.open();
    } catch (error) {
      setActivePaymentId('');
      showErrorAlert('Unable to start payment', error.message);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-slate-950 to-blue-950 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">Travel desk</p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">My ticket bookings</h1>
          <p className="mt-2 text-sm text-slate-300">Review trip details, availability updates, payments, and cancellations.</p>
        </div>
        <Link to="/ticket-booking" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-slate-900 hover:bg-blue-50">
          Book a trip <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {bookings.length ? bookings.map((booking) => {
        const Icon = transportIcon[booking.transportType] || TicketCheck;
        const eligible = canCancel(booking.travelAt);
        const isPaying = activePaymentId === booking._id;
        return (
          <article key={booking._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-7">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Icon className="h-6 w-6" /></span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-500">{booking.bookingNumber}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${statusClass[booking.status] || statusClass.pending}`}>{booking.status}</span>
                  </div>
                  <h2 className="mt-1 text-lg font-black text-slate-900">{booking.source} <span className="text-slate-400">→</span> {booking.destination}</h2>
                  <p className="mt-1 text-xs capitalize text-slate-500">{booking.transportType} · {booking.fareClass?.replaceAll('_', ' ')}</p>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Current fare</p>
                <p className="text-xl font-black text-slate-900">₹{Number(booking.totalAmount).toLocaleString('en-IN')}</p>
                <span className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${statusClass[booking.paymentStatus] || statusClass.pending}`}>Payment {booking.paymentStatus}</span>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:px-7 lg:grid-cols-4">
              <Detail label="Departure" value={formatDateTime(booking.travelAt)} icon={CalendarDays} />
              {booking.returnAt && <Detail label="Return" value={formatDateTime(booking.returnAt)} icon={CalendarDays} />}
              <Detail label="Passengers" value={booking.passengers?.map((passenger) => passenger.name).join(', ')} icon={TicketCheck} />
              <Detail label="Booking contact" value={`${booking.passengerContact?.email || ''} · ${booking.passengerContact?.phone || ''}`} icon={ShieldCheck} />
              {booking.ticketNumber && <Detail label="Ticket number" value={booking.ticketNumber} icon={TicketCheck} />}
              {booking.seatAssignments?.length > 0 && <Detail label="Assigned seats" value={booking.seatAssignments.join(', ')} icon={TicketCheck} />}
            </div>

            {booking.travelDetails && (
              <div className="mx-5 mb-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 sm:mx-7">
                <p className="mb-2 font-black uppercase tracking-wide text-slate-500">Travel details</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {Object.entries(booking.travelDetails).filter(([, value]) => value).map(([key, value]) => (
                    <span key={key}><strong className="capitalize text-slate-700">{key.replaceAll(/([A-Z])/g, ' $1').replaceAll('_', ' ')}:</strong> {String(value).replaceAll('_', ' ')}</span>
                  ))}
                </div>
              </div>
            )}

            {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
              <div className="mx-5 mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:mx-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-black text-emerald-950"><CheckCircle2 className="h-4 w-4" /> Availability confirmed</p>
                    <p className="mt-1 text-xs text-emerald-900/70">Complete payment through the secure Razorpay checkout to finish this booking.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {paymentOptions.map((option) => (
                        <button key={option.value} type="button" onClick={() => setPaymentMethod(option.value)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${paymentMethod === option.value ? 'border-emerald-800 bg-emerald-900 text-white' : 'border-emerald-200 bg-white text-emerald-900 hover:border-emerald-500'}`}>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button disabled={isPaying} onClick={() => payForBooking(booking)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-xs font-black text-white hover:bg-emerald-900 disabled:opacity-60">
                    <CreditCard className="h-4 w-4" /> {isPaying ? 'Opening checkout…' : `Pay ₹${Number(booking.totalAmount).toLocaleString('en-IN')}`}
                  </button>
                </div>
              </div>
            )}

            {booking.paymentStatus === 'paid' && (
              <div className="mx-5 mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs sm:mx-7">
                <span className="inline-flex items-center gap-2 font-black text-emerald-900"><ShieldCheck className="h-4 w-4" /> Paid securely via Razorpay</span>
                <span className="text-emerald-800">Payment ID: {booking.payment?.paymentId}</span>
                <span className="text-emerald-800">Method: {booking.payment?.method}</span>
                {booking.payment?.refundId && <span className="text-emerald-800">Refund: {booking.payment.refundStatus || booking.cancellationStatus}</span>}
              </div>
            )}

            {booking.status !== 'cancelled' && booking.status !== 'rejected' && (
              <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-7">
                <div className="flex items-start gap-2 text-xs">
                  {eligible ? <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />}
                  <p className={eligible ? 'text-amber-800' : 'text-rose-700'}>
                    {eligible ? 'Cancellation is available until 48 hours before departure.' : 'Cancellation is not permitted within 2 days (48 hours) of departure.'}
                    {booking.cancellationStatus === 'refund_pending' && ' Refund processing is pending with the administrator.'}
                  </p>
                </div>
                <button onClick={() => cancelBooking(booking)} disabled={!eligible} className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
                  Request cancellation
                </button>
              </div>
            )}
            {booking.cancellationStatus !== 'not_requested' && (
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-600 sm:px-7">
                Cancellation status: <strong className="capitalize">{booking.cancellationStatus.replaceAll('_', ' ')}</strong>
                {booking.cancellationReason && <span> · {booking.cancellationReason}</span>}
              </div>
            )}
            {booking.adminNotes && <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-600 sm:px-7">Admin update: {booking.adminNotes}</p>}
          </article>
        );
      }) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <TicketCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-black text-slate-900">No ticket bookings yet</h2>
          <p className="mt-2 text-sm text-slate-500">Your bus, train, and flight requests will appear here.</p>
          <Link to="/ticket-booking" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white">Explore travel options <ArrowRight className="h-4 w-4" /></Link>
        </div>
      )}
    </div>
  );
};

function Detail({ label, value, icon: Icon }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
      <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-xs font-semibold text-slate-700">{value || '—'}</p></div>
    </div>
  );
}

export default MyTicketBookingsPage;
