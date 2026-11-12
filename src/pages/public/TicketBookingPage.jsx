import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Plane,
  ShieldCheck,
  TrainFront,
  Bus,
  Users,
  Compass,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const travelOptions = [
  {
    type: 'flight',
    title: 'Flight Booking',
    subtitle: 'Domestic & International Air Travel',
    description: 'Plan one-way or round-trip flights with preferred airlines, cabin class, extra baggage, and seat choice.',
    route: '/ticket-booking/flight',
    icon: Plane,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    fallbackImage: '/banners/img2.png',
    accent: 'from-blue-600 via-sky-600 to-indigo-700',
    borderHover: 'group-hover:border-blue-400',
    tag: 'Domestic & International',
    animationLabel: 'Take-off: Flying to Flight Booking...',
    features: ['Economy, Premium & Business', 'One-Way & Return Itinerary', 'Airport Code Mapping'],
  },
  {
    type: 'train',
    title: 'Train Ticket Booking',
    subtitle: 'Indian Railways (IRCTC) Rail Desk',
    description: 'Add your train and station details, quota (General, Ladies, Tatkal, Senior), class, and berth preference.',
    route: '/ticket-booking/train',
    icon: TrainFront,
    image: 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&w=800&q=80',
    fallbackImage: '/banners/img4.jpg',
    accent: 'from-emerald-600 via-teal-600 to-emerald-800',
    borderHover: 'group-hover:border-emerald-400',
    tag: 'Berth & Quota Preferences',
    animationLabel: 'Departing: Gliding to Train Booking...',
    features: ['1A, 2A, 3A & Sleeper Classes', 'Tatkal & Ladies Quota Support', 'Train Number Lookup'],
  },
  {
    type: 'bus',
    title: 'Bus Booking',
    subtitle: 'Intercity AC Sleeper & Luxury Coaches',
    description: 'Reserve comfortable 2+2 push-back seaters, single/double luxury sleepers, and multi-axle Volvo coaches.',
    route: '/ticket-booking/bus',
    icon: Bus,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    fallbackImage: '/banners/img3.jpg',
    accent: 'from-amber-600 via-orange-600 to-red-700',
    borderHover: 'group-hover:border-amber-400',
    tag: 'Luxury Sleeper & Seater',
    animationLabel: 'Cruising: Driving to Bus Booking...',
    features: ['AC Multi-Axle Volvo & Scania', 'Boarding & Drop-Off Points', 'Day & Overnight Schedules'],
  },
];

const bookingTypes = [
  {
    id: 'general',
    title: 'General Booking',
    badge: 'Standard Travel',
    desc: 'Ideal for individuals and families. Configured for up to 6 Adults and 2 Children (ages 1 to 4 years).',
    icon: CalendarDays,
    color: 'border-blue-200 bg-blue-50/50 text-blue-900',
  },
  {
    id: 'group',
    title: 'Group Bookings',
    badge: 'Bulk Travel Desk',
    desc: 'For corporate teams, family reunions, industrial delegations, and bulk travelers (10+ passengers).',
    icon: Users,
    color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
  },
  {
    id: 'tourism',
    title: 'Tourism Bookings',
    badge: 'Holiday & Sightseeing',
    desc: 'Tailored holiday and pilgrimage packages with hotel accommodation, sightseeing tours, and cab transfers.',
    icon: Compass,
    color: 'border-amber-200 bg-amber-50/50 text-amber-900',
  },
];

export const TicketBookingPage = () => {
  const navigate = useNavigate();
  const [animatingType, setAnimatingType] = useState(null);

  const handleCardClick = (type, route) => {
    if (animatingType) return;
    setAnimatingType(type);
    setTimeout(() => {
      navigate(route);
    }, 650);
  };

  return (
    <div className="min-h-[70vh] bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-32 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-400" /> Authorized Corporate &amp; Industrial Travel Desk
          </p>
          <h1 className="max-w-3xl text-3xl sm:text-5xl font-black leading-tight text-white">
            Flight, Train &amp; Bus Ticket Booking Services
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base font-medium">
            Book certified rail, air, and coach travel with personalized corporate assistance. Seamless transitions for <strong>General Booking</strong>, <strong>Group Bookings</strong>, or <strong>Tourism Bookings</strong>.
          </p>
          <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-emerald-300 max-w-2xl font-semibold">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Instant booking request confirmation with GST tax invoice support for business claims.</span>
          </p>
        </div>
      </section>

      {/* Section 1: 3 Booking Types Showcase */}
      <section className="mx-auto max-w-7xl px-4 -mt-8 relative z-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {bookingTypes.map((bt) => {
            const IconComp = bt.icon;
            return (
              <div
                key={bt.id}
                className={`rounded-3xl border ${bt.color} p-6 shadow-md backdrop-blur-md transition-all hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-xs">
                    <IconComp className="h-5 w-5 text-slate-800" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/90 px-2.5 py-1 rounded-full shadow-2xs">
                    {bt.badge}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">{bt.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-medium">{bt.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Choose Transport (Flight, Train & Bus with Animated Transitions) */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Select Travel Mode</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">How would you like to travel?</h2>
          <p className="text-xs text-slate-500 mt-1">Click on any travel category below to experience smooth animated navigation.</p>
        </div>

        <div className="grid gap-7 md:grid-cols-3">
          {travelOptions.map((opt) => {
            const Icon = opt.icon;
            const isAnimating = animatingType === opt.type;

            // Type-specific animation classes
            let animationClass = '';
            if (isAnimating) {
              if (opt.type === 'flight') {
                animationClass = 'translate-x-28 -translate-y-20 scale-125 rotate-[-12deg] opacity-0 transition-all duration-700 ease-in-out';
              } else if (opt.type === 'train') {
                animationClass = 'translate-x-full scale-105 opacity-0 transition-all duration-700 ease-in-out';
              } else if (opt.type === 'bus') {
                animationClass = 'translate-x-full scale-105 opacity-0 transition-all duration-700 ease-in-out';
              }
            }

            return (
              <div
                key={opt.type}
                onClick={() => handleCardClick(opt.type, opt.route)}
                className={`group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer relative overflow-hidden select-none ${opt.borderHover} ${
                  isAnimating ? 'ring-4 ring-primary/40' : ''
                }`}
              >
                {/* Top Attractive 3D / Realistic Media Container with Action Animation */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={opt.image}
                    alt={opt.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${animationClass}`}
                    onError={(e) => {
                      e.target.src = opt.fallbackImage;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Badge & Mode Icon */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/90 text-slate-900 shadow-md backdrop-blur-md">
                      {opt.tag}
                    </span>
                  </div>

                  {/* Animated Floating Transport Icon */}
                  <div className={`absolute bottom-3 right-3 w-12 h-12 rounded-2xl bg-gradient-to-br ${opt.accent} text-white flex items-center justify-center shadow-lg transition-all duration-500 ${animationClass}`}>
                    <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </div>

                  {/* Animation Overlay Message */}
                  {isAnimating && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-30 animate-fadeIn">
                      <span className="text-white text-xs font-black px-3 py-1.5 rounded-full bg-primary animate-pulse shadow-lg">
                        {opt.animationLabel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">
                      {opt.title}
                    </h3>
                    <p className="text-xs font-bold text-primary mt-0.5">{opt.subtitle}</p>
                    <p className="mt-2.5 text-xs text-slate-600 leading-relaxed font-medium">
                      {opt.description}
                    </p>

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                      {opt.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      Instant Booking
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-primary group-hover:text-blue-800 transition-colors"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default TicketBookingPage;
