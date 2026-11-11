import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRightLeft, BusFront, Check, MapPin, Plane, ShieldCheck, TrainFront,
  UserRound, Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ticketBookingService } from '../../services/ticketBookingService';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';

const configs = {
  bus: {
    title: 'Bus journey',
    subtitle: 'A comfortable ride, arranged around your route.',
    icon: BusFront,
    theme: 'amber',
    classes: [
      ['seater', 'Standard seater', 499],
      ['sleeper', 'Sleeper', 799],
      ['ac_sleeper', 'AC sleeper', 1299],
    ],
    seats: ['Window seat', 'Aisle seat', 'Lower berth', 'Upper berth', 'Any available'],
  },
  train: {
    title: 'Train journey',
    subtitle: 'Share your station, quota, and berth requirements.',
    icon: TrainFront,
    theme: 'emerald',
    classes: [
      ['second_sitting', 'Second sitting (2S)', 250],
      ['sleeper', 'Sleeper (SL)', 500],
      ['ac_3_tier', 'AC 3-tier (3A)', 1100],
      ['ac_2_tier', 'AC 2-tier (2A)', 1800],
      ['ac_1_tier', 'AC first class (1A)', 3000],
    ],
    seats: ['Lower berth', 'Middle berth', 'Upper berth', 'Side lower', 'Side upper', 'No preference'],
  },
  flight: {
    title: 'Flight journey',
    subtitle: 'Set your airports, cabin, and return-trip preferences.',
    icon: Plane,
    theme: 'sky',
    classes: [
      ['economy', 'Economy', 4500],
      ['premium_economy', 'Premium economy', 7800],
      ['business', 'Business', 16000],
      ['first', 'First class', 32000],
    ],
    seats: ['Window', 'Aisle', 'Extra legroom', 'No preference'],
  },
};

const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100';
const labelClass = 'block text-xs font-bold text-slate-700';
const defaultPassenger = () => ({ name: '', age: '', gender: '' });

const toLocalDateTime = (date, time) => (date && time ? new Date(`${date}T${time}`).toISOString() : '');
const initialForm = (type, user) => {
  const saved = sessionStorage.getItem(`ticket-booking-draft-${type}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      sessionStorage.removeItem(`ticket-booking-draft-${type}`);
    }
  }
  return {
    source: '',
    destination: '',
    travelDate: '',
    travelTime: '09:00',
    returnDate: '',
    returnTime: '18:00',
    fareClass: configs[type]?.classes[0][0] || '',
    seatPreference: '',
    passengers: [defaultPassenger()],
    passengerContact: { email: user?.email || '', phone: user?.phone || '' },
    travelDetails: {
      tripType: 'one_way',
      operator: '',
      boardingPoint: '',
      droppingPoint: '',
      busType: '',
      trainNumber: '',
      trainName: '',
      boardingStation: '',
      quota: 'general',
      berthPreference: '',
      airline: '',
      cabinClass: 'economy',
      originCode: '',
      destinationCode: '',
    },
  };
};

const SectionHeading = ({ number, title, detail, icon: Icon }) => (
  <div className="mb-5 flex items-center gap-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white">{number}</span>
    <div className="min-w-0 flex-1">
      <h2 className="text-base font-black text-slate-900">{title}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
    </div>
    <Icon className="h-5 w-5 shrink-0 text-slate-400" />
  </div>
);

const Field = ({ label, children }) => (
  <label className={labelClass}>{label}{children}</label>
);

export const TransportBookingPage = () => {
  const { type } = useParams();
  const config = configs[type];
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(() => initialForm(type, user));
  const [submitting, setSubmitting] = useState(false);

  const Icon = config?.icon || BusFront;
  const selectedClass = useMemo(
    () => config?.classes.find(([value]) => value === form.fareClass),
    [config, form.fareClass]
  );
  const tripMultiplier = type === 'flight' && form.travelDetails.tripType === 'round_trip' ? 2 : 1;
  const estimatedTotal = (selectedClass?.[2] || 0) * form.passengers.length * tripMultiplier;

  if (!config) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-black">Travel type not found</h1>
        <Link className="mt-4 inline-flex text-blue-700 underline" to="/ticket-booking">Back to ticket booking</Link>
      </div>
    );
  }

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateTravelDetail = (key, value) =>
    setForm((current) => ({ ...current, travelDetails: { ...current.travelDetails, [key]: value } }));
  const updatePassenger = (index, key, value) =>
    setForm((current) => ({
      ...current,
      passengers: current.passengers.map((passenger, i) => i === index ? { ...passenger, [key]: value } : passenger),
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      sessionStorage.setItem(`ticket-booking-draft-${type}`, JSON.stringify(form));
      navigate('/login', { state: { from: location } });
      return;
    }
    if (form.source.trim().toLowerCase() === form.destination.trim().toLowerCase()) {
      showErrorAlert('Check your route', 'Source and destination must be different.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await ticketBookingService.create({
        transportType: type,
        source: form.source,
        destination: form.destination,
        travelAt: toLocalDateTime(form.travelDate, form.travelTime),
        returnAt: form.travelDetails.tripType === 'round_trip' ? toLocalDateTime(form.returnDate, form.returnTime) : undefined,
        travelDetails: form.travelDetails,
        passengers: form.passengers,
        passengerContact: form.passengerContact,
        fareClass: form.fareClass,
        seatPreference: form.seatPreference,
      });
      sessionStorage.removeItem(`ticket-booking-draft-${type}`);
      await showSuccessAlert('Request received', 'Your booking request is with our admin team. Payment will be available after availability and fare are confirmed.');
      navigate('/customer/ticket-bookings');
    } catch (error) {
      showErrorAlert('Booking could not be submitted', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const now = new Date();
  const minDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const theme = {
    bus: { hero: 'from-amber-950 via-orange-950 to-slate-950', accent: 'text-amber-700', light: 'bg-amber-50', badge: 'bg-amber-100 text-amber-900', border: 'border-amber-200' },
    train: { hero: 'from-emerald-950 via-teal-950 to-slate-950', accent: 'text-emerald-700', light: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-900', border: 'border-emerald-200' },
    flight: { hero: 'from-blue-950 via-sky-950 to-slate-950', accent: 'text-blue-700', light: 'bg-blue-50', badge: 'bg-blue-100 text-blue-900', border: 'border-blue-200' },
  }[type];

  return (
    <div className="min-h-screen bg-slate-50 pb-14">
      <div className={`bg-gradient-to-r ${theme.hero} text-white`}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link to="/ticket-booking" className="inline-flex items-center gap-2 text-xs font-bold text-white/75 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All travel options
          </Link>
          <div className="mt-6 flex items-end justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">
                <Icon className="h-4 w-4" /> {type.toUpperCase()} BOOKING
              </span>
              <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">{config.title}</h1>
              <p className="mt-2 max-w-xl text-sm text-white/75">{config.subtitle}</p>
            </div>
            <div className="hidden items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-semibold sm:flex">
              <ShieldCheck className="h-5 w-5 text-emerald-300" /> Admin-confirmed availability
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
        <div className={`mb-6 flex flex-col gap-3 rounded-2xl border ${theme.border} ${theme.light} p-4 text-xs leading-5 text-slate-700 sm:flex-row sm:items-center`}>
          <ShieldCheck className={`h-5 w-5 shrink-0 ${theme.accent}`} />
          <p>Fare shown below is an estimate based on travel class. Your booking stays pending until an administrator confirms availability and the final fare. No payment is taken at this step.</p>
        </div>

        {type === 'bus' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading number="01" title="Route and schedule" detail="Choose your trip endpoints and boarding time." icon={MapPin} />
                <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                  <Field label="Leaving from"><input required maxLength={120} className={inputClass} value={form.source} onChange={(e) => updateForm('source', e.target.value)} placeholder="City or bus stop" /></Field>
                  <div className="hidden h-12 items-center text-slate-400 sm:flex"><ArrowRightLeft className="h-5 w-5" /></div>
                  <Field label="Going to"><input required maxLength={120} className={inputClass} value={form.destination} onChange={(e) => updateForm('destination', e.target.value)} placeholder="City or bus stop" /></Field>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Departure date"><input required type="date" min={minDate} className={inputClass} value={form.travelDate} onChange={(e) => updateForm('travelDate', e.target.value)} /></Field>
                  <Field label="Preferred departure time"><input required type="time" className={inputClass} value={form.travelTime} onChange={(e) => updateForm('travelTime', e.target.value)} /></Field>
                  <Field label="Boarding point"><input required className={inputClass} value={form.travelDetails.boardingPoint} onChange={(e) => updateTravelDetail('boardingPoint', e.target.value)} placeholder="Pickup stop" /></Field>
                  <Field label="Drop-off point"><input required className={inputClass} value={form.travelDetails.droppingPoint} onChange={(e) => updateTravelDetail('droppingPoint', e.target.value)} placeholder="Drop-off stop" /></Field>
                </div>
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading number="02" title="Coach and seat" detail="Tell us what kind of bus seat works for you." icon={BusFront} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Coach type">
                    <select className={inputClass} value={form.fareClass} onChange={(e) => updateForm('fareClass', e.target.value)}>
                      {config.classes.map(([value, name, price]) => <option key={value} value={value}>{name} · from ₹{price.toLocaleString('en-IN')}</option>)}
                    </select>
                  </Field>
                  <Field label="Seat preference">
                    <select className={inputClass} value={form.seatPreference} onChange={(e) => updateForm('seatPreference', e.target.value)}>
                      <option value="">Select a preference</option>{config.seats.map((seat) => <option key={seat}>{seat}</option>)}
                    </select>
                  </Field>
                  <Field label="Preferred bus operator (optional)"><input className={inputClass} value={form.travelDetails.operator} onChange={(e) => updateTravelDetail('operator', e.target.value)} placeholder="Any operator" /></Field>
                  <Field label="Bus amenities or notes (optional)"><input className={inputClass} value={form.travelDetails.busType} onChange={(e) => updateTravelDetail('busType', e.target.value)} placeholder="e.g. AC, charging point" /></Field>
                </div>
              </section>
            </div>
            <aside className="space-y-5">
              <RouteSummary type={type} form={form} selectedClass={selectedClass} estimatedTotal={estimatedTotal} />
              <PassengerFields form={form} setForm={setForm} updatePassenger={updatePassenger} updateForm={updateForm} />
            </aside>
          </div>
        )}

        {type === 'train' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading number="01" title="Stations and train" detail="Use station names as they appear on your itinerary." icon={TrainFront} />
                <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  <Field label="From station"><input required className={inputClass} value={form.source} onChange={(e) => updateForm('source', e.target.value)} placeholder="Station name or code" /></Field>
                  <Field label="To station"><input required className={inputClass} value={form.destination} onChange={(e) => updateForm('destination', e.target.value)} placeholder="Station name or code" /></Field>
                  <Field label="Train number (optional)"><input inputMode="numeric" maxLength={10} className={inputClass} value={form.travelDetails.trainNumber} onChange={(e) => updateTravelDetail('trainNumber', e.target.value)} placeholder="e.g. 12625" /></Field>
                  <Field label="Train name (optional)"><input className={inputClass} value={form.travelDetails.trainName} onChange={(e) => updateTravelDetail('trainName', e.target.value)} placeholder="Preferred train" /></Field>
                  <Field label="Journey date"><input required type="date" min={minDate} className={inputClass} value={form.travelDate} onChange={(e) => updateForm('travelDate', e.target.value)} /></Field>
                  <Field label="Preferred departure time"><input required type="time" className={inputClass} value={form.travelTime} onChange={(e) => updateForm('travelTime', e.target.value)} /></Field>
                  <Field label="Boarding station"><input required className={inputClass} value={form.travelDetails.boardingStation} onChange={(e) => updateTravelDetail('boardingStation', e.target.value)} placeholder="Boarding station" /></Field>
                  <Field label="Booking quota">
                    <select className={inputClass} value={form.travelDetails.quota} onChange={(e) => updateTravelDetail('quota', e.target.value)}>
                      <option value="general">General</option><option value="ladies">Ladies</option><option value="tatkal">Tatkal</option><option value="senior_citizen">Senior citizen</option>
                    </select>
                  </Field>
                </div>
              </section>
              <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading number="02" title="Class and berth" detail="We will use these preferences when confirming availability." icon={TrainFront} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Travel class"><select className={inputClass} value={form.fareClass} onChange={(e) => updateForm('fareClass', e.target.value)}>{config.classes.map(([value, name, price]) => <option key={value} value={value}>{name} · est. ₹{price.toLocaleString('en-IN')}</option>)}</select></Field>
                  <Field label="Berth preference"><select className={inputClass} value={form.seatPreference} onChange={(e) => updateForm('seatPreference', e.target.value)}><option value="">No preference</option>{config.seats.map((seat) => <option key={seat}>{seat}</option>)}</select></Field>
                  <Field label="Preferred berth for booking (optional)"><select className={inputClass} value={form.travelDetails.berthPreference} onChange={(e) => updateTravelDetail('berthPreference', e.target.value)}><option value="">No preference</option>{config.seats.map((seat) => <option key={seat}>{seat}</option>)}</select></Field>
                </div>
              </section>
            </div>
            <aside className="space-y-5">
              <TrainRouteSummary form={form} />
              <RouteSummary type={type} form={form} selectedClass={selectedClass} estimatedTotal={estimatedTotal} />
              <PassengerFields form={form} setForm={setForm} updatePassenger={updatePassenger} updateForm={updateForm} />
            </aside>
          </div>
        )}

        {type === 'flight' && (
          <div className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 px-5 py-4 sm:px-7">
                <SectionHeading number="01" title="Flight itinerary" detail="Enter airport or city names and your preferred times." icon={Plane} />
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Field label="Flying from"><input required className={inputClass} value={form.source} onChange={(e) => updateForm('source', e.target.value)} placeholder="City or airport" /></Field>
                  <Field label="Origin airport code (optional)"><input maxLength={3} className={inputClass} value={form.travelDetails.originCode} onChange={(e) => updateTravelDetail('originCode', e.target.value.toUpperCase())} placeholder="e.g. MAA" /></Field>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Field label="Flying to"><input required className={inputClass} value={form.destination} onChange={(e) => updateForm('destination', e.target.value)} placeholder="City or airport" /></Field>
                  <Field label="Destination airport code (optional)"><input maxLength={3} className={inputClass} value={form.travelDetails.destinationCode} onChange={(e) => updateTravelDetail('destinationCode', e.target.value.toUpperCase())} placeholder="e.g. DEL" /></Field>
                </div>
                <Field label="Departure date"><input required type="date" min={minDate} className={inputClass} value={form.travelDate} onChange={(e) => updateForm('travelDate', e.target.value)} /></Field>
                <Field label="Preferred departure time"><input required type="time" className={inputClass} value={form.travelTime} onChange={(e) => updateForm('travelTime', e.target.value)} /></Field>
                <Field label="Trip type">
                  <select className={inputClass} value={form.travelDetails.tripType} onChange={(e) => updateTravelDetail('tripType', e.target.value)}>
                    <option value="one_way">One way</option><option value="round_trip">Round trip</option>
                  </select>
                </Field>
                <Field label="Preferred airline (optional)"><input className={inputClass} value={form.travelDetails.airline} onChange={(e) => updateTravelDetail('airline', e.target.value)} placeholder="Any airline" /></Field>
                {form.travelDetails.tripType === 'round_trip' && <>
                  <Field label="Return date"><input required type="date" min={form.travelDate || minDate} className={inputClass} value={form.returnDate} onChange={(e) => updateForm('returnDate', e.target.value)} /></Field>
                  <Field label="Preferred return time"><input required type="time" className={inputClass} value={form.returnTime} onChange={(e) => updateForm('returnTime', e.target.value)} /></Field>
                </>}
              </div>
            </section>
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading number="02" title="Cabin and seat" detail="Select your cabin and seating preference." icon={Plane} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Cabin class"><select className={inputClass} value={form.fareClass} onChange={(e) => { updateForm('fareClass', e.target.value); updateTravelDetail('cabinClass', e.target.value); }}>{config.classes.map(([value, name, price]) => <option key={value} value={value}>{name} · est. ₹{price.toLocaleString('en-IN')}</option>)}</select></Field>
                  <Field label="Seat preference"><select className={inputClass} value={form.seatPreference} onChange={(e) => updateForm('seatPreference', e.target.value)}><option value="">No preference</option>{config.seats.map((seat) => <option key={seat}>{seat}</option>)}</select></Field>
                </div>
              </section>
              <RouteSummary type={type} form={form} selectedClass={selectedClass} estimatedTotal={estimatedTotal} />
            </div>
            <PassengerFields form={form} setForm={setForm} updatePassenger={updatePassenger} updateForm={updateForm} />
          </div>
        )}

        <div className="mt-6 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:px-7">
          <p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Booking and passenger information is only shared with authorized administrators to confirm your request.</p>
          <button type="submit" disabled={submitting} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Sending request…' : 'Request booking'} <Check className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

function RouteSummary({ type, form, selectedClass, estimatedTotal }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-black text-slate-900"><MapPin className="h-4 w-4 text-blue-700" /> Trip snapshot</h2>
      <div className="mt-5 flex items-start gap-3">
        <div className="flex flex-col items-center pt-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /><span className="my-1 h-9 border-l-2 border-dashed border-slate-300" /><span className="h-2.5 w-2.5 rounded-full bg-slate-900" /></div>
        <div className="min-w-0 flex-1 space-y-5">
          <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">From</p><p className="truncate text-sm font-bold text-slate-800">{form.source || 'Your starting point'}</p></div>
          <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">To</p><p className="truncate text-sm font-bold text-slate-800">{form.destination || 'Your destination'}</p></div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3">
        <div><p className="text-[10px] font-bold uppercase text-slate-400">Date</p><p className="mt-1 text-xs font-bold text-slate-700">{form.travelDate || 'Not selected'}</p></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-400">Departure</p><p className="mt-1 text-xs font-bold text-slate-700">{form.travelTime || 'Not selected'}</p></div>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex justify-between gap-3 text-xs"><span className="text-slate-500">{selectedClass?.[1] || 'Travel class'} × {form.passengers.length}</span><span className="font-bold text-slate-700">₹{estimatedTotal.toLocaleString('en-IN')}</span></div>
        <p className="mt-1.5 text-[10px] text-slate-400">{type[0].toUpperCase() + type.slice(1)} fare estimate. Final fare is confirmed by the admin.</p>
      </div>
    </div>
  );
}

function TrainRouteSummary({ form }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-950 to-teal-900 p-5 text-white shadow-lg">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Your rail route</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="min-w-0 flex-1"><p className="truncate text-lg font-black">{form.source || 'From'}</p><p className="mt-1 text-xs text-emerald-100/70">{form.travelDate || 'Travel date'}</p></div>
        <span className="rounded-full border border-white/20 p-2"><ArrowRightLeft className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1 text-right"><p className="truncate text-lg font-black">{form.destination || 'To'}</p><p className="mt-1 text-xs text-emerald-100/70">{form.travelTime || 'Departure time'}</p></div>
      </div>
      {form.travelDetails.trainName && <p className="mt-4 border-t border-white/15 pt-3 text-xs text-emerald-100">{form.travelDetails.trainNumber} · {form.travelDetails.trainName}</p>}
    </div>
  );
}

function PassengerFields({ form, setForm, updatePassenger, updateForm }) {
  const addPassenger = () => {
    if (form.passengers.length < 9) setForm((current) => ({ ...current, passengers: [...current.passengers, defaultPassenger()] }));
  };
  const removePassenger = (index) => {
    if (form.passengers.length > 1) setForm((current) => ({ ...current, passengers: current.passengers.filter((_, i) => i !== index) }));
  };
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <SectionHeading number="03" title="Passengers and contact" detail="Add each traveler exactly as shown on their ID." icon={Users} />
      <div className="space-y-3">
        {form.passengers.map((passenger, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700"><UserRound className="h-4 w-4" /> Passenger {index + 1}</span>
              {form.passengers.length > 1 && <button type="button" onClick={() => removePassenger(index)} className="text-xs font-bold text-rose-600 hover:underline">Remove</button>}
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_80px_130px]">
              <Field label="Full name"><input required maxLength={100} autoComplete="name" className={inputClass} value={passenger.name} onChange={(e) => updatePassenger(index, 'name', e.target.value)} placeholder="As on government ID" /></Field>
              <Field label="Age"><input required type="number" min="0" max="120" className={inputClass} value={passenger.age} onChange={(e) => updatePassenger(index, 'age', e.target.value)} /></Field>
              <Field label="Gender"><select required className={inputClass} value={passenger.gender} onChange={(e) => updatePassenger(index, 'gender', e.target.value)}><option value="">Select</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></Field>
            </div>
          </div>
        ))}
      </div>
      {form.passengers.length < 9 && <button type="button" onClick={addPassenger} className="mt-3 text-xs font-black text-blue-700 hover:underline">+ Add another passenger</button>}
      <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <Field label="Booking contact email"><input required type="email" autoComplete="email" className={inputClass} value={form.passengerContact.email} onChange={(e) => updateForm('passengerContact', { ...form.passengerContact, email: e.target.value })} /></Field>
        <Field label="Booking contact phone"><input required type="tel" minLength="7" maxLength="20" autoComplete="tel" className={inputClass} value={form.passengerContact.phone} onChange={(e) => updateForm('passengerContact', { ...form.passengerContact, phone: e.target.value })} placeholder="Include country code if needed" /></Field>
      </div>
    </section>
  );
}

export default TransportBookingPage;
