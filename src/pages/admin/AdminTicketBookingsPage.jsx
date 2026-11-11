import React, { useCallback, useEffect, useState } from 'react';
import { BusFront, CalendarDays, CheckCircle2, CreditCard, Plane, RefreshCw, Search, TicketCheck, TrainFront } from 'lucide-react';
import { ticketBookingService } from '../../services/ticketBookingService';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import { Spinner } from '../../components/common/Spinner';

const formatDateTime = (value) => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const icons = { bus: BusFront, train: TrainFront, flight: Plane };

export const AdminTicketBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [edits, setEdits] = useState({});

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ticketBookingService.getAll({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        transportType: typeFilter || undefined,
      });
      const items = response.data || [];
      setBookings(items);
      setEdits(Object.fromEntries(items.map((booking) => [booking._id, {
        status: booking.status,
        totalAmount: booking.totalAmount,
        ticketNumber: booking.ticketNumber || '',
        seatAssignments: (booking.seatAssignments || []).join(', '),
        cancellationStatus: booking.cancellationStatus,
        adminNotes: booking.adminNotes || '',
      }])));
    } catch (error) {
      showErrorAlert('Unable to load ticket bookings', error.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const updateEdit = (id, field, value) =>
    setEdits((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));

  const saveBooking = async (booking) => {
    const edit = edits[booking._id];
    setSavingId(booking._id);
    try {
      await ticketBookingService.update(booking._id, {
        ...edit,
        totalAmount: Number(edit.totalAmount),
        seatAssignments: edit.seatAssignments.split(',').map((seat) => seat.trim()).filter(Boolean),
      });
      await showSuccessAlert('Ticket booking updated', `${booking.bookingNumber} has been updated.`);
      await fetchBookings();
    } catch (error) {
      showErrorAlert('Unable to update ticket booking', error.message);
    } finally {
      setSavingId('');
    }
  };

  const refundBooking = async (booking) => {
    try {
      await ticketBookingService.refund(booking._id);
      await showSuccessAlert('Refund submitted', `The refund for ${booking.bookingNumber} was submitted to Razorpay.`);
      await fetchBookings();
    } catch (error) {
      showErrorAlert('Unable to process refund', error.message);
    }
  };

  const setField = (id, field, value) => updateEdit(id, field, value);

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-r from-slate-950 to-blue-950 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">Travel operations</p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-black text-white sm:text-3xl"><TicketCheck className="h-7 w-7 text-blue-200" /> Ticket bookings</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Review passenger and travel details, confirm availability and fare, assign ticket and seats, and manage cancellation and payment status.</p>
        </div>
        <button onClick={fetchBookings} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white hover:bg-white/15"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </header>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_180px_180px]">
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, route, customer…" className="h-11 w-full text-sm outline-none" />
        </label>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
          <option value="">All travel types</option><option value="bus">Bus</option><option value="train">Train</option><option value="flight">Flight</option>
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
          <option value="">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : bookings.length ? (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const Icon = icons[booking.transportType] || TicketCheck;
            const edit = edits[booking._id] || {};
            return (
              <article key={booking._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-7">
                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Icon className="h-6 w-6" /></span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black text-blue-800">{booking.bookingNumber}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-700">{booking.transportType} · {booking.status}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${booking.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>Payment {booking.paymentStatus}</span>
                      </div>
                      <h2 className="mt-1 text-lg font-black text-slate-900">{booking.source} <span className="text-slate-400">→</span> {booking.destination}</h2>
                      <p className="mt-1 text-xs text-slate-500">{booking.customerSnapshot?.name || booking.customer?.name} · {booking.customerSnapshot?.email || booking.customer?.email} · {booking.customerSnapshot?.phone || booking.customer?.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600"><CalendarDays className="h-4 w-4 text-blue-700" />{formatDateTime(booking.travelAt)}</div>
                </div>

                <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_1fr] lg:px-7">
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">Passenger details</h3>
                      <div className="space-y-2">
                        {(booking.passengers || []).map((passenger, index) => (
                          <div key={`${passenger.name}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs">
                            <span className="font-bold text-slate-800">{index + 1}. {passenger.name}</span>
                            <span className="capitalize text-slate-500">{passenger.age} yrs · {passenger.gender}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">Travel and booking information</h3>
                      <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-xs sm:grid-cols-2">
                        <Info label="Type and class" value={`${booking.transportType} · ${booking.fareClass?.replaceAll('_', ' ')}`} />
                        <Info label="Departure" value={formatDateTime(booking.travelAt)} />
                        {booking.returnAt && <Info label="Return" value={formatDateTime(booking.returnAt)} />}
                        <Info label="Seat preference" value={booking.seatPreference || 'No preference'} />
                        <Info label="Passenger contact" value={`${booking.passengerContact?.email} · ${booking.passengerContact?.phone}`} />
                        {Object.entries(booking.travelDetails || {}).filter(([, value]) => value).map(([key, value]) => <Info key={key} label={key.replaceAll(/([A-Z])/g, ' $1').replaceAll('_', ' ')} value={String(value).replaceAll('_', ' ')} />)}
                      </div>
                    </div>
                    {booking.paymentStatus !== 'pending' && (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-emerald-900"><CreditCard className="h-4 w-4" /> Payment details</h3>
                        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                          <Info label="Amount" value={`₹${Number(booking.payment?.amount || booking.totalAmount).toLocaleString('en-IN')}`} />
                          <Info label="Provider / method" value={`${booking.payment?.provider || 'Razorpay'} · ${booking.payment?.method || '—'}`} />
                          <Info label="Payment ID" value={booking.payment?.paymentId || '—'} />
                          <Info label="Paid at" value={booking.payment?.paidAt ? formatDateTime(booking.payment.paidAt) : '—'} />
                          {booking.payment?.refundId && <Info label="Refund ID / status" value={`${booking.payment.refundId} · ${booking.payment.refundStatus || booking.cancellationStatus}`} />}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                    <h3 className="mb-4 text-sm font-black text-slate-900">Manage ticket</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Booking status"><select value={edit.status || ''} onChange={(e) => setField(booking._id, 'status', e.target.value)} className={inputClass}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option></select></Field>
                      <Field label="Final fare (₹)"><input type="number" min="1" step="0.01" value={edit.totalAmount ?? ''} disabled={booking.paymentStatus === 'paid'} onChange={(e) => setField(booking._id, 'totalAmount', e.target.value)} className={inputClass} /></Field>
                      <Field label="Ticket / PNR number"><input maxLength={100} value={edit.ticketNumber || ''} onChange={(e) => setField(booking._id, 'ticketNumber', e.target.value)} className={inputClass} placeholder="Assigned after confirmation" /></Field>
                      <Field label="Assigned seat numbers"><input value={edit.seatAssignments || ''} onChange={(e) => setField(booking._id, 'seatAssignments', e.target.value)} className={inputClass} placeholder="e.g. 12A, 12B" /></Field>
                      <Field label="Cancellation status"><select value={edit.cancellationStatus || 'not_requested'} onChange={(e) => setField(booking._id, 'cancellationStatus', e.target.value)} className={inputClass}><option value="not_requested">Not requested</option><option value="requested">Requested</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="refund_pending">Refund pending</option><option value="refunded">Refunded (gateway only)</option></select></Field>
                      <Field label="Payment status"><span className="mt-1.5 block rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-bold capitalize text-slate-700">{booking.paymentStatus}</span></Field>
                    </div>
                    <label className={labelClass}>Admin notes<textarea rows="3" maxLength="1000" value={edit.adminNotes || ''} onChange={(e) => setField(booking._id, 'adminNotes', e.target.value)} className={`${inputClass} resize-y`} placeholder="Availability, fare, or cancellation update" /></label>
                    <button onClick={() => saveBooking(booking)} disabled={savingId === booking._id} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white hover:bg-blue-800 disabled:opacity-60">
                      {savingId === booking._id ? 'Saving…' : <><CheckCircle2 className="h-4 w-4" /> Save booking updates</>}
                    </button>
                    {booking.status === 'cancelled' && booking.cancellationStatus === 'refund_pending' && (booking.paymentStatus === 'paid' || booking.payment?.refundId) && (
                      <button onClick={() => refundBooking(booking)} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-900 hover:bg-emerald-100">
                        <CreditCard className="h-4 w-4" /> {booking.payment?.refundId ? 'Refresh Razorpay refund status' : 'Process full Razorpay refund'}
                      </button>
                    )}
                    {booking.cancellationReason && <p className="mt-3 text-xs text-slate-600"><strong>Cancellation reason:</strong> {booking.cancellationReason}</p>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center text-sm text-slate-500">No ticket bookings match these filters.</div>}
    </div>
  );
};

function Info({ label, value }) {
  return <div className="min-w-0"><p className="text-[10px] font-bold uppercase text-slate-400">{label}</p><p className="mt-0.5 break-words font-semibold text-slate-700">{value || '—'}</p></div>;
}

function Field({ label, children }) {
  return <label className={labelClass}>{label}{children}</label>;
}

const labelClass = 'block text-xs font-bold text-slate-700';
const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100';

export default AdminTicketBookingsPage;
