import { Link } from 'react-router-dom';
import { ArrowLeft, Beer, LockKeyhole } from 'lucide-react';

const sections = [
  ['Role-Based Access', 'Admins, staff, and customers receive different views and access levels based on their assigned role.'],
  ['Protected Routes', 'Dashboard, inventory, orders, bookings, staff, and profile pages require authenticated access.'],
  ['Account Safety', 'Users should use strong passwords, keep credentials private, and log out on shared devices.'],
  ['Reporting Issues', 'Security concerns should be reported to the support team with clear steps and affected account details.'],
];

const SecurityPage = () => {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Go to Brewery Inventory home">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-amber-500/20 bg-amber-500/10">
              <Beer className="h-6 w-6 text-amber-500" />
            </span>
            <span className="text-lg font-extrabold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">BREWERY</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-amber-500/40 hover:text-amber-300">
            <ArrowLeft className="h-4 w-4" /> Back Home
          </Link>
        </nav>

        <section className="py-20 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-300">Security</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black text-slate-50 sm:text-6xl">Security and access controls.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-400">Brewery Inventory uses account controls and role-based access to help protect operational data.</p>
        </section>

        <section className="space-y-5">
          {sections.map(([title, description]) => (
            <article key={title} className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
              <div className="flex gap-4">
                <LockKeyhole className="mt-1 h-6 w-6 shrink-0 text-amber-300" />
                <div>
                  <h2 className="text-xl font-black text-slate-50">{title}</h2>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

export default SecurityPage;
