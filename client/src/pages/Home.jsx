import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  BarChart3,
  Beer,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { getDashboardPath } from '../utils/authRoutes';
import heroImage from '../assets/brewery-home-hero.png';

const features = [
  {
    icon: PackageCheck,
    title: 'Live Inventory Control',
    description: 'Track stock, low-supply alerts, kegs, raw materials, and finished products from one clean workspace.',
  },
  {
    icon: CalendarCheck,
    title: 'Booking Management',
    description: 'Manage taproom reservations, tours, and customer bookings without losing sight of daily operations.',
  },
  {
    icon: BarChart3,
    title: 'Operational Insights',
    description: 'See orders, sales movement, staff activity, and customer demand with dashboard summaries built for action.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Give admins, staff, and customers the right view so each person can move quickly and confidently.',
  },
];

const plans = [
  {
    name: 'Starter',
    price: 'INR 2,499',
    description: 'For small breweries organizing inventory and bookings.',
    highlights: ['Inventory dashboard', 'Booking calendar', 'Customer accounts'],
  },
  {
    name: 'Operations',
    price: 'INR 6,499',
    description: 'For growing teams that need staff controls and deeper order tracking.',
    highlights: ['Staff management', 'Order workflows', 'Performance insights'],
    featured: true,
  },
  {
    name: 'Scale',
    price: 'INR 12,499',
    description: 'For multi-location teams coordinating a bigger operation.',
    highlights: ['Advanced permissions', 'Priority support', 'Custom reporting'],
  },
];

const starPoints = [
  ['8%', '14%', '2px'],
  ['14%', '5%', '3px'],
  ['21%', '22%', '2px'],
  ['28%', '9%', '2px'],
  ['36%', '18%', '3px'],
  ['43%', '7%', '2px'],
  ['51%', '25%', '2px'],
  ['59%', '11%', '3px'],
  ['68%', '20%', '2px'],
  ['77%', '8%', '2px'],
  ['88%', '16%', '3px'],
  ['96%', '6%', '2px'],
  ['5%', '56%', '2px'],
  ['13%', '78%', '3px'],
  ['24%', '65%', '2px'],
  ['32%', '84%', '2px'],
  ['41%', '58%', '3px'],
  ['49%', '74%', '2px'],
  ['57%', '91%', '2px'],
  ['66%', '63%', '3px'],
  ['74%', '82%', '2px'],
  ['83%', '69%', '2px'],
  ['92%', '87%', '3px'],
];

const aboutCards = [
  {
    quote:
      'From keg movement and batch lifecycle to booking workflows, every feature is designed to reduce operational friction and save team time.',
    title: 'What We Deliver',
    description: 'Inventory, bookings, analytics, and effective batch management systems',
    icon: Beer,
    tone: 'border-amber-500/25 bg-amber-500/10 text-amber-400 shadow-amber-500/5',
  },
  {
    quote:
      'Your staff can see low stock, pending orders, confirmed bookings, and customer activity without jumping between tools.',
    title: 'Operational Clarity',
    description: 'One dashboard for daily decisions, alerts, team handoffs, and customer flow',
    icon: ClipboardList,
    tone: 'border-sky-500/25 bg-sky-500/10 text-sky-300 shadow-sky-500/5',
  },
  {
    quote:
      'Role-based access keeps admin, staff, and customer experiences focused while the full brewery workflow stays connected.',
    title: 'Controlled Access',
    description: 'Secure views for admins, staff members, and customers across the same system',
    icon: ShieldCheck,
    tone: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300 shadow-emerald-500/5',
  },
];

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const dashboardPath = user ? getDashboardPath(user) : '/register';
  const [activeAboutCard, setActiveAboutCard] = useState(0);
  const currentAboutCard = aboutCards[activeAboutCard];
  const CurrentAboutIcon = currentAboutCard.icon;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveAboutCard((current) => (current + 1) % aboutCards.length);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Brewery dashboard home">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-amber-500/20 bg-amber-500/10 shadow-lg shadow-amber-500/5">
              <Beer className="h-6 w-6 text-amber-500" />
            </span>
            <span className="flex flex-col">
              <span className="text-lg font-extrabold leading-none tracking-wide bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                BREWERY
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Inventory & Booking
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 text-sm font-semibold text-slate-400 md:flex">
            <a href="#features" className="rounded-xl border border-transparent px-4 py-2 transition-all hover:border-amber-500/20 hover:bg-slate-900/60 hover:text-amber-300">Features</a>
            <a href="#pricing" className="rounded-xl border border-transparent px-4 py-2 transition-all hover:border-amber-500/20 hover:bg-slate-900/60 hover:text-amber-300">Pricing</a>
            <a href="#about" className="rounded-xl border border-transparent px-4 py-2 transition-all hover:border-amber-500/20 hover:bg-slate-900/60 hover:text-amber-300">About</a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl border border-transparent px-3 py-2 text-sm font-bold text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-900/60 hover:text-slate-100"
            >
              Sign In
            </Link>
            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-300"
            >
              {user ? 'Dashboard' : 'Get Started'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative min-h-[92vh] overflow-hidden pt-24">
        <img
          src={heroImage}
          alt="Modern brewery operations workspace with dashboard screens"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.25),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_32%),linear-gradient(90deg,rgba(2,6,23,0.98),rgba(2,6,23,0.83),rgba(2,6,23,0.42))]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/45" />

        <div className="relative z-10 mx-auto flex min-h-[calc(92vh-6rem)] max-w-7xl items-center px-5 py-14 sm:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
              <Sparkles className="h-4 w-4" />
              Inventory, bookings, orders, and staff in one system
            </div>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
              Brewery command center before sign in.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Run your brewery from a single dashboard built for stock control, customer orders, bookings, staff access,
              and the daily decisions that keep production moving.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-300"
              >
                Start Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-900/70 px-5 py-3 text-sm font-bold text-slate-100 backdrop-blur transition hover:border-amber-400/50 hover:text-amber-200"
              >
                View Features
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-950">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-8 sm:grid-cols-4 sm:px-8">
          {[
            ['24/7', 'Dashboard access'],
            ['3', 'User roles'],
            ['Fast', 'Order tracking'],
            ['Live', 'Stock visibility'],
          ].map(([value, label]) => (
            <div key={label} className="glass-panel rounded-lg border border-slate-800/50 px-3 py-5 text-center">
              <p className="text-3xl font-extrabold text-amber-300">{value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-slate-950 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-widest text-amber-300">Features</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-50 sm:text-5xl">
              Everything before and after the pour.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="glass-panel rounded-lg border border-slate-800/50 p-6 transition hover:border-amber-500/30"
              >
                <div className={`grid h-11 w-11 place-items-center rounded-md border ${
                  index === 0
                    ? 'border-sky-500/20 bg-sky-500/10 text-sky-300'
                    : index === 1
                      ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                      : index === 2
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                        : 'border-violet-500/20 bg-violet-500/10 text-violet-300'
                }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-extrabold text-slate-100">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-slate-800 bg-slate-900/40 px-5 py-20 text-slate-100 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-widest text-amber-300">Pricing</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-50 sm:text-5xl">Plans for every brew team.</h2>
            </div>
            <p className="max-w-md text-sm font-semibold leading-6 text-slate-400">
              Choose a practical starting point and scale when your production, staff, and customer flow grow.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-lg border p-7 shadow-2xl shadow-slate-950/30 ${
                  plan.featured
                    ? 'border-amber-500/25 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.17),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.92))] text-slate-50'
                    : 'border-slate-800/50 bg-slate-950/70 text-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-extrabold">{plan.name}</h3>
                    <p className={`mt-2 text-sm leading-6 ${plan.featured ? 'text-slate-300' : 'text-slate-400'}`}>
                      {plan.description}
                    </p>
                  </div>
                  {plan.featured && (
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-300">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-8 flex items-end gap-2">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className={`pb-1 text-sm font-bold ${plan.featured ? 'text-slate-300' : 'text-slate-500'}`}>
                    /month
                  </span>
                </p>
                <ul className="mt-8 space-y-4">
                  {plan.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-3 text-sm font-bold">
                      <CheckCircle2 className={`h-5 w-5 ${plan.featured ? 'text-amber-300' : 'text-emerald-300'}`} />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="relative overflow-hidden bg-slate-950 px-5 py-24 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(245,158,11,0.22),transparent_30%),radial-gradient(circle_at_84%_70%,rgba(59,130,246,0.16),transparent_34%),linear-gradient(135deg,rgba(2,6,23,1),rgba(15,23,42,0.96))]" />
        <div className="absolute inset-0 opacity-80">
          {starPoints.map(([left, top, size]) => (
            <span
              key={`${left}-${top}`}
              className="absolute rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.75)]"
              style={{ left, top, width: size, height: size }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <p className="inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.22em] text-amber-300">
            <span className="h-0.5 w-8 rounded-full bg-amber-500" />
            About Brewery Inventory
          </p>
          <h2 className="mx-auto mt-7 max-w-5xl text-4xl font-black leading-tight tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
            Built for breweries that need control and clarity
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-400 sm:text-lg">
            Brewery Inventory helps independent breweries and retailers run day-to-day operations with a practical,
            easy-to-use system.
          </p>

          <div className="mx-auto mt-20 max-w-3xl rounded-lg border border-amber-500/20 bg-slate-900/70 p-8 text-left shadow-2xl shadow-slate-950/60 backdrop-blur-md sm:p-10">
            <p key={currentAboutCard.quote} className="text-center text-xl font-extrabold italic leading-9 text-slate-300 sm:text-2xl">
              "{currentAboutCard.quote}"
            </p>

            <div className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-5 text-left">
              <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-xl border shadow-lg ${currentAboutCard.tone}`}>
                <CurrentAboutIcon className="h-9 w-9" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-200">{currentAboutCard.title}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {currentAboutCard.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {aboutCards.map((card, index) => (
              <button
                key={card.title}
                type="button"
                onClick={() => setActiveAboutCard(index)}
                className={`h-3 rounded-full transition-all ${
                  activeAboutCard === index ? 'w-10 bg-amber-500' : 'w-3 bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Show about card ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-900/70 text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.5fr_0.9fr_0.9fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
                <Beer className="h-6 w-6" />
              </span>
              <p className="text-2xl font-black text-slate-50">Brewery Inventory</p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-extrabold uppercase tracking-[0.22em]">
              <span className="inline-flex items-center gap-2 text-amber-300">
                <span className="h-4 w-4 rounded bg-amber-500/80" />
                Brewery
              </span>
              <span className="text-sky-300">Line.us</span>
              <span className="text-slate-500">Inventory & Booking Platform</span>
            </div>

            <p className="mt-8 max-w-sm text-base font-medium leading-8 text-slate-500">
              The all-in-one inventory and booking platform for craft breweries and small retailers. Built for local
              businesses, by operators who get it.
            </p>

            <div className="mt-8 flex gap-3">
              {['X', 'in', 'ig'].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="grid h-11 w-11 place-items-center rounded-lg border border-slate-700 bg-slate-800/70 text-slate-500 transition hover:border-amber-500/40 hover:text-amber-300"
                  aria-label={label}
                >
                  <span className="text-sm font-black uppercase">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {[
            ['Product', ['Features', 'Pricing', 'Reviews', 'Changelog', 'Integrations']],
            ['Company', ['About Us', 'Blog', 'Careers', 'Press', 'Contact']],
            ['Legal', ['Terms & Conditions', 'Privacy Policy', 'Refund Policy', 'Cookie Policy', 'Security']],
          ].map(([heading, items]) => (
            <div key={heading}>
              <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-slate-50">{heading}</p>
              <div className="mt-8 grid gap-6">
                {items.map((item) => (
                  <span key={item} className="text-base font-medium text-slate-500">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm font-medium text-slate-500 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <p>© 2026 Brewery Inventory. All Rights Reserved.</p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              1021 E Lincolnway #9869, Cheyenne, WY 82001, USA
            </p>
            <div className="flex gap-7">
              <span>Terms</span>
              <span>Privacy</span>
              <span>Refunds</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
