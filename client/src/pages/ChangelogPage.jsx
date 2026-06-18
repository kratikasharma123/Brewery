import { Link } from 'react-router-dom';
import { ArrowLeft, Beer, CheckCircle2, Clock } from 'lucide-react';

const updates = [
  {
    version: 'v1.3',
    date: 'June 18, 2026',
    title: 'Public website pages',
    changes: ['Added Home-only footer navigation', 'Added Contact page with form', 'Added Blog page route'],
  },
  {
    version: 'v1.2',
    date: 'June 12, 2026',
    title: 'Customer workflows',
    changes: ['Improved customer shopping flow', 'Updated order tracking experience', 'Added clearer dashboard access'],
  },
  {
    version: 'v1.1',
    date: 'June 4, 2026',
    title: 'Operations dashboard',
    changes: ['Inventory insights', 'Booking management updates', 'Staff and role-based navigation improvements'],
  },
];

const ChangelogPage = () => {
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
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-300">Changelog</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-50 sm:text-6xl">
            Product updates and improvements.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-400 sm:text-lg">
            Follow recent updates across inventory, bookings, orders, staff workflows, and public website pages.
          </p>
        </section>

        <section className="space-y-5">
          {updates.map((update) => (
            <article key={update.version} className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-300">
                    <Clock className="h-4 w-4" />
                    {update.version}
                  </p>
                  <h2 className="mt-5 text-2xl font-black text-slate-50">{update.title}</h2>
                </div>
                <p className="text-sm font-bold text-slate-500">{update.date}</p>
              </div>

              <ul className="mt-6 grid gap-3">
                {update.changes.map((change) => (
                  <li key={change} className="flex items-center gap-3 text-sm font-medium text-slate-400">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
                    {change}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

export default ChangelogPage;
