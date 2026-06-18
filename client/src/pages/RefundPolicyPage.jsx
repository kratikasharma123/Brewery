import { Link } from 'react-router-dom';
import { ArrowLeft, Beer, RefreshCcw } from 'lucide-react';

const sections = [
  ['Subscription Refunds', 'Refund requests are reviewed based on plan usage, billing date, and account status.'],
  ['Order Refunds', 'Product order refunds are handled by the brewery or retailer managing the order through the platform.'],
  ['Processing Time', 'Approved refunds may take several business days depending on the payment provider and banking process.'],
  ['Support Requests', 'For refund questions, contact support with your account email, order details, and reason for the request.'],
];

const RefundPolicyPage = () => {
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
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-300">Refund Policy</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black text-slate-50 sm:text-6xl">Refunds and billing support.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-400">This policy outlines how refund requests are reviewed and processed.</p>
        </section>

        <section className="space-y-5">
          {sections.map(([title, description]) => (
            <article key={title} className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
              <div className="flex gap-4">
                <RefreshCcw className="mt-1 h-6 w-6 shrink-0 text-amber-300" />
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

export default RefundPolicyPage;
