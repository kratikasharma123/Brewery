import { useSelector } from 'react-redux';
import { Mail } from 'lucide-react';

const CustomerProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const isCustomer = user?.role === 'Customer';
  const emailInitial = (user?.email || user?.name || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="animate-surface-in">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">Your profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          {isCustomer ? 'Manage your contact details and view bookings.' : 'Manage your account and contact details.'}
        </p>
      </div>

      <div className="glass-panel animate-rise-in motion-delay-100 interactive-lift p-6 rounded-2xl border border-slate-800/50 max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="animate-soft-pulse h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <span className="text-2xl font-extrabold text-amber-300">{emailInitial}</span>
          </div>
          <div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-amber-500" /> {user?.email}</p>
            <p className="text-[11px] mt-2 uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-slate-900/40 inline-block">{user?.role}</p>
          </div>
        </div>

        <div className="mt-6 text-sm text-slate-400">
          <p>If you'd like to change your name or email, visit the settings page or contact support.</p>
        </div>
      </div>

      <div className="flex gap-3">
        {isCustomer && (
          <a href="/bookings" className="rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-2 text-xs font-semibold hover:bg-amber-500/20">My Bookings</a>
        )}
        <a href="/dashboard" className="rounded-xl bg-slate-900/30 border border-slate-800 text-slate-300 px-4 py-2 text-xs font-semibold hover:bg-slate-900/60">Back to Dashboard</a>
      </div>
    </div>
  );
};

export default CustomerProfile;
