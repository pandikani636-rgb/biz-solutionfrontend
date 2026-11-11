import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BusFront, CalendarDays, Plane, ShieldCheck, TrainFront } from 'lucide-react';

const travelOptions = [
  {
    type: 'bus',
    title: 'Bus booking',
    description: 'Choose your boarding point, drop-off, coach type, and preferred seat.',
    route: '/ticket-booking/bus',
    icon: BusFront,
    accent: 'from-amber-500 to-orange-600',
    tag: 'Flexible stops',
  },
  {
    type: 'train',
    title: 'Train booking',
    description: 'Add your train and station details, travel quota, and berth preference.',
    route: '/ticket-booking/train',
    icon: TrainFront,
    accent: 'from-emerald-500 to-teal-700',
    tag: 'Berth preferences',
  },
  {
    type: 'flight',
    title: 'Flight booking',
    description: 'Plan a one-way or return flight with your preferred airline and cabin.',
    route: '/ticket-booking/flight',
    icon: Plane,
    accent: 'from-sky-500 to-blue-700',
    tag: 'Air travel',
  },
];

export const TicketBookingPage = () => (
  <div className="min-h-[70vh] bg-slate-50">
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100">
          <CalendarDays className="h-4 w-4" /> Travel desk
        </p>
        <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
          Your next trip starts with a better booking.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Pick a travel type, share your itinerary and passenger details, then track confirmation and payment in one place.
        </p>
        <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-amber-200">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Requests are confirmed by our admin team against availability. Displayed fares are estimates and are finalized before payment.
        </p>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Choose your journey</p>
        <h2 className="mt-2 text-2xl font-black text-slate-900">How would you like to travel?</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {travelOptions.map(({ type, title, description, route, icon: Icon, accent, tag }) => (
          <Link
            key={type}
            to={route}
            className="group flex min-h-72 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
              <Icon className="h-7 w-7" />
            </div>
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">{tag}</span>
            <h3 className="mt-4 text-xl font-black text-slate-900">{title}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700">
              Start booking <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  </div>
);

export default TicketBookingPage;
