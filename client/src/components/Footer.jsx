import { Link } from 'react-router-dom';
import { Beer, MapPin } from 'lucide-react';

const footerGroups = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Changelog', to: '/changelog' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '#about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Refund Policy', to: '/refund' },
      { label: 'Cookie Policy', to: '/cookies' },
      { label: 'Security', to: '/security' },
    ],
  },
];

const socialLinks = ['X', 'in', 'ig'];

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/70 text-slate-400">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.5fr_0.9fr_0.9fr_0.9fr]">
        <div>
          <Link to="/" className="flex items-center gap-3" aria-label="Go to Brewery Inventory home">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
              <Beer className="h-6 w-6" />
            </span>
            <p className="text-2xl font-black text-slate-50">Brewery Inventory</p>
          </Link>

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
            {socialLinks.map((label) => (
              <span
                key={label}
                className="grid h-11 w-11 cursor-not-allowed place-items-center rounded-lg border border-slate-700 bg-slate-800/70 text-slate-600"
                aria-label={label}
              >
                <span className="text-sm font-black uppercase">{label}</span>
              </span>
            ))}
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.heading}>
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-slate-50">{group.heading}</p>
            <div className="mt-8 grid gap-6">
              {group.links.map((link) => (
                link.to ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-left text-base font-medium text-slate-500 transition hover:text-amber-300"
                  >
                    {link.label}
                  </Link>
                ) : link.href ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-left text-base font-medium text-slate-500 transition hover:text-amber-300"
                  >
                    {link.label}
                  </a>
                ) : (
                  <span key={link.label} className="cursor-not-allowed text-base font-medium text-slate-600">
                    {link.label}
                  </span>
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm font-medium text-slate-500 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 Brewery Inventory. All Rights Reserved.</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=1021%20E%20Lincolnway%20%239869%2C%20Cheyenne%2C%20WY%2082001%2C%20USA"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition hover:text-amber-300"
          >
            <MapPin className="h-4 w-4 text-amber-400" />
            1021 E Lincolnway #9869, Cheyenne, WY 82001, USA
          </a>
          <div className="flex gap-7">
            <Link to="/terms" className="transition hover:text-amber-300">
              Terms
            </Link>
            <Link to="/privacy" className="transition hover:text-amber-300">
              Privacy
            </Link>
            <Link to="/refund" className="transition hover:text-amber-300">
              Refunds
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
