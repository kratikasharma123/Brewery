import { Link } from 'react-router-dom';
import { ArrowLeft, Beer, Cookie } from 'lucide-react';

const sections = [
  ['What Cookies Do', 'Cookies and local storage help keep sessions active, remember preferences, and support dashboard functionality.'],
  ['Essential Storage', 'Some storage is required for login sessions, cart items, and basic application behavior.'],
  ['Analytics and Improvements', 'Usage information may help improve navigation, performance, and product workflows.'],
  ['Managing Cookies', 'You can control cookies and local storage through your browser settings, but some features may stop working correctly.'],
];

const CookiePolicyPage = () => {
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
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-300">Cookie Policy</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black text-slate-50 sm:text-6xl">Cookies and local storage.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-400">This policy explains how browser storage supports the Brewery Inventory experience.</p>
        </section>

        <section className="space-y-5">
          {sections.map(([title, description]) => (
            <article key={title} className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
              <div className="flex gap-4">
                <Cookie className="mt-1 h-6 w-6 shrink-0 text-amber-300" />
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

export default CookiePolicyPage;
