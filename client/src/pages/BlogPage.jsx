import { Link } from 'react-router-dom';
import { ArrowLeft, Beer, CalendarDays } from 'lucide-react';

const posts = [
  {
    title: 'How live inventory keeps brewery teams moving',
    date: 'June 18, 2026',
    excerpt: 'Track raw materials, finished stock, and low-supply alerts before they slow down daily operations.',
  },
  {
    title: 'Why booking workflows matter for taprooms',
    date: 'June 12, 2026',
    excerpt: 'A clean booking process helps staff manage tours, reservations, customer details, and order flow together.',
  },
  {
    title: 'Role-based dashboards for better staff handoffs',
    date: 'June 4, 2026',
    excerpt: 'Give admins, staff, and customers the right view so every team member can act faster with less confusion.',
  },
];

const BlogPage = () => {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
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
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-300">Blog</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-50 sm:text-6xl">
            Brewery operations insights.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-400 sm:text-lg">
            Practical notes on inventory, bookings, orders, staff workflows, and better brewery management.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
              <div className="inline-flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                <CalendarDays className="h-4 w-4" />
                {post.date}
              </div>
              <h2 className="mt-6 text-2xl font-black leading-tight text-slate-50">{post.title}</h2>
              <p className="mt-4 text-sm font-medium leading-7 text-slate-500">{post.excerpt}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

export default BlogPage;
