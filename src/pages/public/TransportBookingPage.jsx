import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRightLeft,
  Check,
  MapPin,
  Plane,
  ShieldCheck,
  TrainFront,
  UserRound,
  Users,
  Compass,
  CalendarDays,
  Baby,
  Hotel,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ticketBookingService } from '../../services/ticketBookingService';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';

const configs = {
  train: {
    title: 'Train Ticket Booking',
    subtitle: 'Indian Railways (IRCTC) Rail Desk: Share your station, quota, and berth requirements.',
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
    title: 'Flight Ticket Booking',
    subtitle: 'Domestic & International Air Travel: Set your airports, cabin, and return-trip preferences.',
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

const inputClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100';
const labelClass = 'block text-xs font-bold text-slate-700';
const defaultPassenger = (type = 'adult', age = 30) => ({
  name: '',
  age: age,
  gender: '',
  isChild: type === 'child',
});

const toLocalDateTime = (date, time) =>
  date && time ? new Date(`${date}T${time}`).toISOString() : '';

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
    bookingType: 'general', // 'general' | 'group' | 'tourism'
    adultCount: 1, // Max 6 in General Booking
    childCount: 0, // Max 2 in General Booking
    childrenAges: [2], // 1 to 4 years
    groupDetails: {
      groupName: '',
      groupSize: 12,
      coordinatorName: user?.name || '',
      coordinatorPhone: user?.phone || '',
      specialRequests: '',
    },
    tourismDetails: {
      theme: 'Heritage & Sightseeing',
      duration: '4 Days / 3 Nights',
      hotelPreference: '3-Star Hotel',
      localCabRequired: true,
      destinationHighlights: '',
    },
    source: '',
    destination: '',
    travelDate: '',
    travelTime: '09:00',
    returnDate: '',
    returnTime: '18:00',
    fareClass: configs[type]?.classes[0][0] || '',
    seatPreference: '',
    passengers: [defaultPassenger('adult', 30)],
    passengerContact: { email: user?.email || '', phone: user?.phone || '' },
    travelDetails: {
      tripType: 'one_way',
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
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white">
      {number}
    </span>
    <div className="min-w-0 flex-1">
      <h2 className="text-base font-black text-slate-900">{title}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
    </div>
    <Icon className="h-5 w-5 shrink-0 text-slate-400" />
  </div>
);

const Field = ({ label, children }) => (
  <label className={labelClass}>
    {label}
    {children}
  </label>
);

export const TransportBookingPage = () => {
  const { type } = useParams();

  // Validate transport type (strictly train or flight; no bus)
  if (!configs[type] || (type !== 'train' && type !== 'flight')) {
    return <Navigate to="/ticket-booking" replace />;
  }

  const config = configs[type];
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(() => initialForm(type, user));
  const [submitting, setSubmitting] = useState(false);

  const Icon = config?.icon || TrainFront;
  const selectedClass = useMemo(
    () => config?.classes.find(([value]) => value === form.fareClass),
    [config, form.fareClass]
  );
  const tripMultiplier =
    type === 'flight' && form.travelDetails.tripType === 'round_trip' ? 2 : 1;

  // Passenger count is either form.passengers.length or groupSize for groups
  const effectivePassengerCount =
    form.bookingType === 'group'
      ? Math.max(1, Number(form.groupDetails?.groupSize) || 10)
      : form.passengers.length;

  const estimatedTotal =
    (selectedClass?.[2] || 0) * effectivePassengerCount * tripMultiplier;

  if (!config) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-black">Travel type not found</h1>
        <p className="mt-2 text-xs text-slate-500">
          Only Train Bookings and Flight Bookings are supported.
        </p>
        <Link className="mt-4 inline-flex text-blue-700 underline" to="/ticket-booking">
          Back to Ticket Booking
        </Link>
      </div>
    );
  }

  const updateForm = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const updateTravelDetail = (key, value) =>
    setForm((current) => ({
      ...current,
      travelDetails: { ...current.travelDetails, [key]: value },
    }));

  const updatePassenger = (index, key, value) =>
    setForm((current) => ({
      ...current,
      passengers: current.passengers.map((passenger, i) =>
        i === index ? { ...passenger, [key]: value } : passenger
      ),
    }));

  // Synchronize General Booking Passenger Fields with Adult & Child Counts
  const handleGeneralCountsChange = (adults, children, childAgesList) => {
    const totalAdults = Math.min(6, Math.max(1, Number(adults) || 1));
    const totalChildren = Math.min(2, Math.max(0, Number(children) || 0));

    const updatedPassengers = [];
    // Keep existing adult names if available
    for (let i = 0; i < totalAdults; i++) {
      const existing = form.passengers[i];
      updatedPassengers.push({
        name: existing && !existing.isChild ? existing.name : '',
        age: existing && !existing.isChild && existing.age ? existing.age : 30,
        gender: existing?.gender || '',
        isChild: false,
      });
    }

    // Children (ages 1 to 4)
    for (let i = 0; i < totalChildren; i++) {
      const childAge = childAgesList[i] || 2;
      updatedPassengers.push({
        name: '',
        age: childAge,
        gender: '',
        isChild: true,
      });
    }

    setForm((current) => ({
      ...current,
      adultCount: totalAdults,
      childCount: totalChildren,
      childrenAges: childAgesList,
      passengers: updatedPassengers,
    }));
  };

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
      await ticketBookingService.create({
        transportType: type,
        bookingType: form.bookingType,
        adultCount: form.adultCount,
        childCount: form.childCount,
        childrenAges: form.childrenAges,
        groupDetails: form.groupDetails,
        tourismDetails: form.tourismDetails,
        source: form.source,
        destination: form.destination,
        travelAt: toLocalDateTime(form.travelDate, form.travelTime),
        returnAt:
          form.travelDetails.tripType === 'round_trip'
            ? toLocalDateTime(form.returnDate, form.returnTime)
            : undefined,
        travelDetails: form.travelDetails,
        passengers: form.passengers,
        passengerContact: form.passengerContact,
        fareClass: form.fareClass,
        seatPreference: form.seatPreference,
      });
      sessionStorage.removeItem(`ticket-booking-draft-${type}`);
      await showSuccessAlert(
        'Request Received!',
        `Your ${form.bookingType.toUpperCase()} ${type.toUpperCase()} booking request has been submitted. Our ticketing team will confirm availability and send your itinerary.`
      );
      navigate('/customer/ticket-bookings');
    } catch (error) {
      showErrorAlert('Booking could not be submitted', error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const now = new Date();
  const minDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const theme = {
    train: {
      hero: 'from-emerald-950 via-teal-950 to-slate-950',
      accent: 'text-emerald-700',
      light: 'bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-900',
      border: 'border-emerald-200',
    },
    flight: {
      hero: 'from-blue-950 via-sky-950 to-slate-950',
      accent: 'text-blue-700',
      light: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-900',
      border: 'border-blue-200',
    },
  }[type] || {
    hero: 'from-slate-950 via-navy to-slate-950',
    accent: 'text-primary',
    light: 'bg-slate-50',
    badge: 'bg-slate-100 text-slate-900',
    border: 'border-slate-200',
  };

  return (
    <div className="relative min-h-screen bg-slate-50 pb-16 overflow-hidden">
      {/* Dynamic Semi-Transparent Watermark Background Image matching Train or Flight */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={
            type === 'train'
              ? 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&w=1920&q=80'
              : 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80'
          }
          alt={type === 'train' ? 'Indian Railways Train Background' : 'Commercial Flight Airplane Background'}
          className="w-full h-full object-cover opacity-20 filter contrast-125 select-none pointer-events-none"
          onError={(e) => {
            e.target.src = type === 'train' ? '/banners/img4.jpg' : '/banners/img2.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/70 via-white/80 to-slate-100/90 pointer-events-none" />
      </div>

      {/* Header Banner */}
      <div className={`relative z-10 bg-gradient-to-r ${theme.hero} text-white shadow-md`}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/ticket-booking"
            className="inline-flex items-center gap-2 text-xs font-bold text-white/75 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All travel options
          </Link>
          <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">
                  <Icon className="h-4 w-4" /> {type.toUpperCase()} BOOKING
                </span>
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                  Verified Ticketing Desk
                </span>
              </div>
              <h1 className="text-3xl font-black text-white sm:text-4xl">
                {config.title}
              </h1>
              <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-white/80">
                {config.subtitle}
              </p>
            </div>

            {/* Travel Mode Toggle (Flight vs Train) */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md p-1 rounded-2xl border border-white/25 shadow-md">
                <Link
                  to="/ticket-booking/flight"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    type === 'flight'
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Flight Booking</span>
                </Link>
                <Link
                  to="/ticket-booking/train"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    type === 'train'
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <TrainFront className="w-3.5 h-3.5" />
                  <span>Train Booking</span>
                </Link>
              </div>

              <div className="items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold flex">
                <ShieldCheck className="h-4 w-4 text-emerald-300" /> Authorized IRCTC &amp; IATA Desk
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:px-8 space-y-6">
        {/* Step 0: Choose Booking Type (General / Group / Tourism) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            number="01"
            title="Select Booking Type"
            detail="Choose your travel classification"
            icon={Users}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. General Booking */}
            <button
              type="button"
              onClick={() => updateForm('bookingType', 'general')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                form.bookingType === 'general'
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-slate-900">General Booking</span>
                <CalendarDays className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard travel: Up to <strong>6 Adults</strong> &amp; <strong>2 Children</strong> (Ages 1 to 4 years).
              </p>
            </button>

            {/* 2. Group Bookings */}
            <button
              type="button"
              onClick={() => updateForm('bookingType', 'group')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                form.bookingType === 'group'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-slate-900">Group Bookings</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bulk / corporate delegations, pilgrim groups, and family functions (10+ seats).
              </p>
            </button>

            {/* 3. Tourism Bookings */}
            <button
              type="button"
              onClick={() => updateForm('bookingType', 'tourism')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                form.bookingType === 'tourism'
                  ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-slate-900">Tourism Bookings</span>
                <Compass className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete holiday packages, sightseeing itineraries, and hotel reservations.
              </p>
            </button>
          </div>

          {/* General Booking Specific Headcount Controls */}
          {form.bookingType === 'general' && (
            <div className="mt-5 p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                  General Booking Passenger Configuration
                </span>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                  Max: 6 Adults + 2 Children (Ages 1 to 4)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Adults Count (1 to 6) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Adults (Ages 12+): <strong>{form.adultCount}</strong> (Max 6)
                  </label>
                  <select
                    className={inputClass}
                    value={form.adultCount}
                    onChange={(e) => {
                      const newAdults = Number(e.target.value);
                      handleGeneralCountsChange(newAdults, form.childCount, form.childrenAges);
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Adult' : 'Adults'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Children Count (0 to 2) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Children (Max 2): <strong>{form.childCount}</strong>
                  </label>
                  <select
                    className={inputClass}
                    value={form.childCount}
                    onChange={(e) => {
                      const newChildren = Number(e.target.value);
                      const newAges = form.childrenAges.slice(0, newChildren);
                      while (newAges.length < newChildren) newAges.push(2);
                      handleGeneralCountsChange(form.adultCount, newChildren, newAges);
                    }}
                  >
                    <option value={0}>0 Children</option>
                    <option value={1}>1 Child</option>
                    <option value={2}>2 Children</option>
                  </select>
                </div>

                {/* Child Age Range Selectors (1 to 4 Years) */}
                {form.childCount > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Child Age Selection (Range: 1 to 4 Years)
                    </label>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: form.childCount }).map((_, idx) => (
                        <div key={idx} className="flex-1">
                          <label className="text-[10px] text-slate-500 font-semibold block">
                            Child {idx + 1} Age
                          </label>
                          <select
                            className={inputClass}
                            value={form.childrenAges[idx] || 2}
                            onChange={(e) => {
                              const newAge = Number(e.target.value);
                              const updatedAges = [...form.childrenAges];
                              updatedAges[idx] = newAge;
                              handleGeneralCountsChange(form.adultCount, form.childCount, updatedAges);
                            }}
                          >
                            <option value={1}>1 Year Old</option>
                            <option value={2}>2 Years Old</option>
                            <option value={3}>3 Years Old</option>
                            <option value={4}>4 Years Old</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Group Booking Details */}
          {form.bookingType === 'group' && (
            <div className="mt-5 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block">
                Group Travel Coordination Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Group / Organization Name">
                  <input
                    required
                    className={inputClass}
                    value={form.groupDetails.groupName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        groupDetails: { ...form.groupDetails, groupName: e.target.value },
                      })
                    }
                    placeholder="e.g. Balumuni Delegation / Family Group"
                  />
                </Field>
                <Field label="Expected Group Size (Headcount)">
                  <input
                    type="number"
                    min="5"
                    max="500"
                    required
                    className={inputClass}
                    value={form.groupDetails.groupSize}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        groupDetails: {
                          ...form.groupDetails,
                          groupSize: Number(e.target.value) || 10,
                        },
                      })
                    }
                  />
                </Field>
                <Field label="Group Coordinator Contact Name">
                  <input
                    required
                    className={inputClass}
                    value={form.groupDetails.coordinatorName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        groupDetails: { ...form.groupDetails, coordinatorName: e.target.value },
                      })
                    }
                    placeholder="Contact Lead"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Tourism Booking Details */}
          {form.bookingType === 'tourism' && (
            <div className="mt-5 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                Tourism Package &amp; Accommodation Options
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Tourism Theme">
                  <select
                    className={inputClass}
                    value={form.tourismDetails.theme}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tourismDetails: { ...form.tourismDetails, theme: e.target.value },
                      })
                    }
                  >
                    <option value="Heritage & Sightseeing">Heritage &amp; Temple Sightseeing</option>
                    <option value="Hill Station & Nature">Hill Station &amp; Nature Retreat</option>
                    <option value="Pilgrimage Circuit">Pilgrimage Circuit</option>
                    <option value="Corporate Offsite & Leisure">Corporate Offsite &amp; Leisure</option>
                  </select>
                </Field>
                <Field label="Preferred Duration">
                  <select
                    className={inputClass}
                    value={form.tourismDetails.duration}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tourismDetails: { ...form.tourismDetails, duration: e.target.value },
                      })
                    }
                  >
                    <option value="3 Days / 2 Nights">3 Days / 2 Nights</option>
                    <option value="4 Days / 3 Nights">4 Days / 3 Nights</option>
                    <option value="6 Days / 5 Nights">6 Days / 5 Nights</option>
                    <option value="Custom Extended">Custom Extended Tour</option>
                  </select>
                </Field>
                <Field label="Hotel Accommodation Option">
                  <select
                    className={inputClass}
                    value={form.tourismDetails.hotelPreference}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tourismDetails: { ...form.tourismDetails, hotelPreference: e.target.value },
                      })
                    }
                  >
                    <option value="3-Star Hotel">3-Star Hotel Included</option>
                    <option value="4/5-Star Premium">4/5-Star Premium Resort</option>
                    <option value="Budget Stay">Budget Comfortable Stay</option>
                    <option value="Travel Only">Travel Only (No Hotel)</option>
                  </select>
                </Field>
              </div>
            </div>
          )}
        </section>

        {/* Step 2: Route & Journey Details */}
        {type === 'train' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading
                  number="02"
                  title="Stations and Train Route"
                  detail="Use station names as they appear on your itinerary."
                  icon={TrainFront}
                />
                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                  <Field label="From Station">
                    <input
                      required
                      className={inputClass}
                      value={form.source}
                      onChange={(e) => updateForm('source', e.target.value)}
                      placeholder="e.g. Chennai Central (MAS)"
                    />
                  </Field>
                  <Field label="To Station">
                    <input
                      required
                      className={inputClass}
                      value={form.destination}
                      onChange={(e) => updateForm('destination', e.target.value)}
                      placeholder="e.g. Madurai Jn (MDU)"
                    />
                  </Field>
                  <Field label="Train Number (Optional)">
                    <input
                      inputMode="numeric"
                      maxLength={10}
                      className={inputClass}
                      value={form.travelDetails.trainNumber}
                      onChange={(e) => updateTravelDetail('trainNumber', e.target.value)}
                      placeholder="e.g. 12635"
                    />
                  </Field>
                  <Field label="Train Name (Optional)">
                    <input
                      className={inputClass}
                      value={form.travelDetails.trainName}
                      onChange={(e) => updateTravelDetail('trainName', e.target.value)}
                      placeholder="e.g. Vaigai Superfast Express"
                    />
                  </Field>
                  <Field label="Journey Date">
                    <input
                      required
                      type="date"
                      min={minDate}
                      className={inputClass}
                      value={form.travelDate}
                      onChange={(e) => updateForm('travelDate', e.target.value)}
                    />
                  </Field>
                  <Field label="Preferred Departure Time">
                    <input
                      required
                      type="time"
                      className={inputClass}
                      value={form.travelTime}
                      onChange={(e) => updateForm('travelTime', e.target.value)}
                    />
                  </Field>
                  <Field label="Boarding Station">
                    <input
                      required
                      className={inputClass}
                      value={form.travelDetails.boardingStation}
                      onChange={(e) => updateTravelDetail('boardingStation', e.target.value)}
                      placeholder="Boarding station"
                    />
                  </Field>
                  <Field label="Booking Quota">
                    <select
                      className={inputClass}
                      value={form.travelDetails.quota}
                      onChange={(e) => updateTravelDetail('quota', e.target.value)}
                    >
                      <option value="general">General</option>
                      <option value="ladies">Ladies</option>
                      <option value="tatkal">Tatkal</option>
                      <option value="senior_citizen">Senior Citizen</option>
                    </select>
                  </Field>
                </div>
              </section>

              <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading
                  number="03"
                  title="Travel Class and Berth Choice"
                  detail="Preferences used when confirming availability."
                  icon={TrainFront}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Travel Class">
                    <select
                      className={inputClass}
                      value={form.fareClass}
                      onChange={(e) => updateForm('fareClass', e.target.value)}
                    >
                      {config.classes.map(([value, name, price]) => (
                        <option key={value} value={value}>
                          {name} · est. ₹{price.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Berth Preference">
                    <select
                      className={inputClass}
                      value={form.seatPreference}
                      onChange={(e) => updateForm('seatPreference', e.target.value)}
                    >
                      <option value="">No preference</option>
                      {config.seats.map((seat) => (
                        <option key={seat} value={seat}>
                          {seat}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <RouteSummary
                type={type}
                form={form}
                selectedClass={selectedClass}
                estimatedTotal={estimatedTotal}
                effectivePassengerCount={effectivePassengerCount}
              />
              <PassengerFields
                form={form}
                setForm={setForm}
                updatePassenger={updatePassenger}
                updateForm={updateForm}
              />
            </aside>
          </div>
        )}

        {/* Flight Booking View */}
        {type === 'flight' && (
          <div className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 px-5 py-4 sm:px-7">
                <SectionHeading
                  number="02"
                  title="Flight Route &amp; Schedule"
                  detail="Enter airport or city names and your preferred times."
                  icon={Plane}
                />
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Field label="Flying From">
                    <input
                      required
                      className={inputClass}
                      value={form.source}
                      onChange={(e) => updateForm('source', e.target.value)}
                      placeholder="City or Airport (e.g. Chennai / MAA)"
                    />
                  </Field>
                  <Field label="Origin Airport Code (Optional)">
                    <input
                      maxLength={3}
                      className={inputClass}
                      value={form.travelDetails.originCode}
                      onChange={(e) =>
                        updateTravelDetail('originCode', e.target.value.toUpperCase())
                      }
                      placeholder="e.g. MAA"
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Field label="Flying To">
                    <input
                      required
                      className={inputClass}
                      value={form.destination}
                      onChange={(e) => updateForm('destination', e.target.value)}
                      placeholder="City or Airport (e.g. Delhi / DEL)"
                    />
                  </Field>
                  <Field label="Destination Airport Code (Optional)">
                    <input
                      maxLength={3}
                      className={inputClass}
                      value={form.travelDetails.destinationCode}
                      onChange={(e) =>
                        updateTravelDetail('destinationCode', e.target.value.toUpperCase())
                      }
                      placeholder="e.g. DEL"
                    />
                  </Field>
                </div>

                <Field label="Departure Date">
                  <input
                    required
                    type="date"
                    min={minDate}
                    className={inputClass}
                    value={form.travelDate}
                    onChange={(e) => updateForm('travelDate', e.target.value)}
                  />
                </Field>
                <Field label="Preferred Departure Time">
                  <input
                    required
                    type="time"
                    className={inputClass}
                    value={form.travelTime}
                    onChange={(e) => updateForm('travelTime', e.target.value)}
                  />
                </Field>
                <Field label="Trip Type">
                  <select
                    className={inputClass}
                    value={form.travelDetails.tripType}
                    onChange={(e) => updateTravelDetail('tripType', e.target.value)}
                  >
                    <option value="one_way">One Way</option>
                    <option value="round_trip">Round Trip</option>
                  </select>
                </Field>
                <Field label="Preferred Airline (Optional)">
                  <input
                    className={inputClass}
                    value={form.travelDetails.airline}
                    onChange={(e) => updateTravelDetail('airline', e.target.value)}
                    placeholder="e.g. IndiGo, Air India, Any"
                  />
                </Field>
                {form.travelDetails.tripType === 'round_trip' && (
                  <>
                    <Field label="Return Date">
                      <input
                        required
                        type="date"
                        min={form.travelDate || minDate}
                        className={inputClass}
                        value={form.returnDate}
                        onChange={(e) => updateForm('returnDate', e.target.value)}
                      />
                    </Field>
                    <Field label="Preferred Return Time">
                      <input
                        required
                        type="time"
                        className={inputClass}
                        value={form.returnTime}
                        onChange={(e) => updateForm('returnTime', e.target.value)}
                      />
                    </Field>
                  </>
                )}
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading
                  number="03"
                  title="Cabin and Seating"
                  detail="Select your cabin and seating preference."
                  icon={Plane}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Cabin Class">
                    <select
                      className={inputClass}
                      value={form.fareClass}
                      onChange={(e) => {
                        updateForm('fareClass', e.target.value);
                        updateTravelDetail('cabinClass', e.target.value);
                      }}
                    >
                      {config.classes.map(([value, name, price]) => (
                        <option key={value} value={value}>
                          {name} · est. ₹{price.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Seat Preference">
                    <select
                      className={inputClass}
                      value={form.seatPreference}
                      onChange={(e) => updateForm('seatPreference', e.target.value)}
                    >
                      <option value="">No preference</option>
                      {config.seats.map((seat) => (
                        <option key={seat} value={seat}>
                          {seat}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </section>
              <RouteSummary
                type={type}
                form={form}
                selectedClass={selectedClass}
                estimatedTotal={estimatedTotal}
                effectivePassengerCount={effectivePassengerCount}
              />
            </div>

            <PassengerFields
              form={form}
              setForm={setForm}
              updatePassenger={updatePassenger}
              updateForm={updateForm}
            />
          </div>
        )}



        {/* Bottom Submission Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:px-7">
          <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              All booking requests are processed against verified carrier availability. Fare estimates are finalized before any payment is initiated.
            </span>
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-12 w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-7 py-3 text-sm font-black text-white transition hover:bg-blue-800 disabled:opacity-60 cursor-pointer shadow-lg"
          >
            {submitting ? 'Submitting Request...' : `Request ${form.bookingType.toUpperCase()} Booking`}
            <Check className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

function RouteSummary({ type, form, selectedClass, estimatedTotal, effectivePassengerCount }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-black text-slate-900">
        <MapPin className="h-4 w-4 text-blue-700" /> Trip Snapshot
      </h2>
      <div className="mt-4 flex items-start gap-3">
        <div className="flex flex-col items-center pt-1">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          <span className="my-1 h-8 border-l-2 border-dashed border-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">From</p>
            <p className="truncate text-xs sm:text-sm font-bold text-slate-800">
              {form.source || 'Starting point'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">To</p>
            <p className="truncate text-xs sm:text-sm font-bold text-slate-800">
              {form.destination || 'Destination'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 text-xs">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Booking Type</p>
          <p className="mt-0.5 font-bold text-blue-700 capitalize">{form.bookingType}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Travel Date</p>
          <p className="mt-0.5 font-bold text-slate-700">{form.travelDate || 'Not selected'}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="flex justify-between gap-3 text-xs">
          <span className="text-slate-500 font-semibold">
            {selectedClass?.[1] || 'Class'} × {effectivePassengerCount} passenger(s)
          </span>
          <span className="font-mono font-black text-slate-900 text-sm">
            ₹{estimatedTotal.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">
          Estimated fare. Final confirmed fare will be reviewed before checkout.
        </p>
      </div>
    </div>
  );
}

function PassengerFields({ form, setForm, updatePassenger, updateForm }) {
  const addPassenger = () => {
    if (form.passengers.length < 9) {
      setForm((current) => ({
        ...current,
        passengers: [...current.passengers, defaultPassenger()],
      }));
    }
  };

  const removePassenger = (index) => {
    if (form.passengers.length > 1) {
      setForm((current) => ({
        ...current,
        passengers: current.passengers.filter((_, i) => i !== index),
      }));
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 space-y-4">
      <SectionHeading
        number="04"
        title="Passenger &amp; Contact Details"
        detail="Add each traveler exactly as on government ID."
        icon={Users}
      />

      <div className="space-y-3">
        {form.passengers.map((passenger, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700">
                <UserRound className="h-3.5 w-3.5 text-slate-500" />
                {passenger.isChild ? `Child Passenger ${index + 1}` : `Adult Passenger ${index + 1}`}
              </span>
              {form.passengers.length > 1 && form.bookingType !== 'general' && (
                <button
                  type="button"
                  onClick={() => removePassenger(index)}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_90px_130px]">
              <Field label="Full Name">
                <input
                  required
                  maxLength={100}
                  className={inputClass}
                  value={passenger.name}
                  onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                  placeholder="As on Government ID"
                />
              </Field>
              <Field label="Age">
                <input
                  required
                  type="number"
                  min="0"
                  max="120"
                  className={inputClass}
                  value={passenger.age}
                  onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                />
              </Field>
              <Field label="Gender">
                <select
                  required
                  className={inputClass}
                  value={passenger.gender}
                  onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            </div>
          </div>
        ))}
      </div>

      {form.bookingType !== 'general' && form.passengers.length < 9 && (
        <button
          type="button"
          onClick={addPassenger}
          className="text-xs font-black text-blue-700 hover:underline cursor-pointer"
        >
          + Add Another Passenger
        </button>
      )}

      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <Field label="Booking Contact Email">
          <input
            required
            type="email"
            className={inputClass}
            value={form.passengerContact.email}
            onChange={(e) =>
              updateForm('passengerContact', {
                ...form.passengerContact,
                email: e.target.value,
              })
            }
          />
        </Field>
        <Field label="Booking Contact Phone">
          <input
            required
            type="tel"
            minLength="7"
            maxLength="20"
            className={inputClass}
            value={form.passengerContact.phone}
            onChange={(e) =>
              updateForm('passengerContact', {
                ...form.passengerContact,
                phone: e.target.value,
              })
            }
            placeholder="Official mobile number"
          />
        </Field>
      </div>
    </section>
  );
}

export default TransportBookingPage;
