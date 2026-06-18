import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Beer, Mail, MapPin, Phone, Send } from 'lucide-react';

const contactOptions = [
  {
    icon: Mail,
    title: 'Email Support',
    value: 'support@breweryinventory.com',
    href: 'mailto:support@breweryinventory.com',
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: '+1 (307) 555-0148',
    href: 'tel:+13075550148',
  },
  {
    icon: MapPin,
    title: 'Visit Office',
    value: '1021 E Lincolnway #9869, Cheyenne, WY 82001, USA',
    href: 'https://www.google.com/maps/search/?api=1&query=1021%20E%20Lincolnway%20%239869%2C%20Cheyenne%2C%20WY%2082001%2C%20USA',
  },
];

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

const ContactPage = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const contactRequest = {
      ...formData,
      submittedAt: new Date().toISOString(),
    };
    const savedRequests = JSON.parse(localStorage.getItem('brewery_contact_requests') || '[]');
    localStorage.setItem('brewery_contact_requests', JSON.stringify([contactRequest, ...savedRequests]));

    setFormData(initialFormState);
    setSubmitted(true);
  };

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
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-300">Contact</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-50 sm:text-6xl">
            Talk to our brewery operations team.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-400 sm:text-lg">
            Need help with inventory, bookings, orders, staff access, or onboarding? Choose an option below or submit the form and we will help you move forward.
          </p>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-300">Send Message</p>
            <h2 className="mt-3 text-3xl font-black text-slate-50">Share your details</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-500">
              Your submission is saved locally so our team can process the request from this device.
            </p>
          </div>

          {submitted && (
            <div className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300">
              Thank you! Your contact details have been saved successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-300">
                Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-500/60"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-300">
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-500/60"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-bold text-slate-300">
              Phone
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-500/60"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-300">
              Message
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Write your message"
                className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-500/60"
              />
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-300 sm:w-fit"
            >
              Submit Details
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {contactOptions.map(({ icon: Icon, title, value, href }) => (
            <a
              key={title}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 text-left shadow-2xl shadow-slate-950/30 transition hover:border-amber-500/30"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-6 text-xl font-extrabold text-slate-50">{title}</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{value}</p>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
};

export default ContactPage;
