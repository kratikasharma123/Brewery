import { Link } from 'react-router-dom';
import { ArrowLeft, Beer, ShieldCheck } from 'lucide-react';

const sections = [
  ['Information We Collect', 'We collect account details, contact information, inventory records, booking details, order information, and staff data entered into the platform.'],
  ['How We Use Data', 'Your data is used to operate dashboards, manage inventory, process bookings, track orders, and improve brewery workflows.'],
  ['Data Protection', 'We use role-based access and account controls to help limit information to authorized users.'],
  ['User Control', 'Admins and users are responsible for keeping their information accurate and managing access within their team.'],
];

const PrivacyPolicyPage = () => {
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
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-300">Privacy Policy</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black text-slate-50 sm:text-6xl">How we handle your data.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-400">This policy explains how Brewery Inventory handles information entered into the platform.</p>
        </section>

        <section className="space-y-5">
          {sections.map(([title, description]) => (
            <article key={title} className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
              <div className="flex gap-4">
                <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-amber-300" />
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

export default PrivacyPolicyPage;
