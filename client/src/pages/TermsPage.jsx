import { Link } from 'react-router-dom';
import { ArrowLeft, Beer, CheckCircle2 } from 'lucide-react';

const terms = [
  {
    title: 'Use of Platform',
    description: 'Brewery Inventory is provided to help breweries manage inventory, bookings, orders, customers, and staff workflows. Users must provide accurate information and use the platform responsibly.',
  },
  {
    title: 'Account Responsibility',
    description: 'You are responsible for maintaining the confidentiality of your login credentials and for all activity that happens through your account.',
  },
  {
    title: 'Orders and Bookings',
    description: 'Orders, bookings, inventory records, and customer details should be entered carefully. The business owner or admin is responsible for reviewing and confirming operational data.',
  },
  {
    title: 'Data Accuracy',
    description: 'The platform displays information based on the data entered by admins, staff, and customers. Brewery Inventory is not responsible for incorrect business decisions caused by inaccurate user-entered data.',
  },
  {
    title: 'Service Updates',
    description: 'Features, pages, dashboards, and workflows may be updated to improve the system, fix issues, or support additional brewery management use cases.',
  },
];

const TermsPage = () => {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Go to Brewery Inventory home">
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

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-amber-500/40 hover:text-amber-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </Link>
        </nav>

        <section className="py-20 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-300">Terms & Conditions</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-50 sm:text-6xl">
            Terms for using Brewery Inventory.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-400 sm:text-lg">
            Please read these terms before using the platform for inventory, bookings, orders, customer workflows, or staff management.
          </p>
        </section>

        <section className="space-y-5">
          {terms.map((term) => (
            <article key={term.title} className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-black text-slate-50">{term.title}</h2>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{term.description}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

export default TermsPage;
