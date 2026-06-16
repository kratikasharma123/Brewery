import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle,
  Clock,
  Flame,
  Image as ImageIcon,
  Package,
  ShoppingBag,
  UserCheck,
} from 'lucide-react';
import { fetchInventory } from '../features/inventory/inventorySlice';
import { fetchBookings, updateBooking } from '../features/bookings/bookingSlice';
import { fetchOrders } from '../features/orders/orderSlice';
import { getHighlyDemandedDrinks } from '../utils/orderInsights';

const StaffDashboard = ({ user, bookings = [], items = [], orders = [] }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchBookings());
    dispatch(fetchOrders());
  }, [dispatch]);

  const pending = bookings.filter((b) => b.status === 'Pending');
  const confirmed = bookings.filter((b) => b.status === 'Confirmed');
  const lowStock = items.filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock');
  const codPendingOrders = orders.filter((order) => order.paymentMethod === 'COD' && order.paymentStatus === 'Pending').length;
  const highlyDemandedDrinks = getHighlyDemandedDrinks(orders, 4);
  const maxDemandQuantity = Math.max(...highlyDemandedDrinks.map((drink) => drink.quantity), 1);
  const formatCurrency = (amount) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`;

  const handleConfirm = async (id) => {
    await dispatch(updateBooking({ id, bookingData: { status: 'Confirmed' } }));
    dispatch(fetchBookings());
  };

  const stats = [
    {
      label: 'Pending bookings',
      value: pending.length,
      icon: CalendarDays,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    },
    {
      label: 'Low stock alerts',
      value: lowStock.length,
      icon: AlertTriangle,
      tone: 'border-red-500/20 bg-red-500/10 text-red-300',
    },
    {
      label: 'Confirmed visits',
      value: confirmed.length,
      icon: UserCheck,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    },
    {
      label: 'COD pending',
      value: codPendingOrders,
      icon: ShoppingBag,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
    },
  ];

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-lg border border-amber-500/20 bg-slate-950 shadow-2xl shadow-slate-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_top_left,rgba(245,158,11,0.2),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.84))]" />
        <div className="relative grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] md:p-8">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
              <Package className="h-3.5 w-3.5" />
              Staff Operations
            </p>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-slate-50 md:text-5xl">
              Good shift, <span className="text-amber-300">{user?.name || 'team'}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Review new tasting requests, keep stock exceptions visible, and jump into the dedicated orders section when delivery follow-up is needed.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/bookings" className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-4 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-950/30 transition-all hover:bg-amber-300">
                <CalendarDays className="h-4 w-4" />
                Manage Bookings
              </Link>
              <Link to="/inventory" className="inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm font-bold text-slate-100 transition-all hover:border-emerald-400/50 hover:text-emerald-200">
                <Package className="h-4 w-4" />
                Check Inventory
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border ${stat.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-extrabold text-slate-50">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-lg border border-slate-800/50 p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-300">
              <Flame className="h-4 w-4" />
              Highly demanded drinks
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-100">Top customer picks</h2>
          </div>
          <Link to="/orders" className="inline-flex items-center gap-2 self-start rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-300 transition-all hover:bg-amber-500/20 md:self-auto">
            Orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {highlyDemandedDrinks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {highlyDemandedDrinks.map((drink, index) => (
              <div key={drink.name} className="rounded-lg border border-slate-800 bg-slate-950/45 p-4 transition-all hover:border-amber-500/30">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-800 bg-slate-900">
                    {drink.imageUrl ? (
                      <img src={drink.imageUrl} alt={drink.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-slate-700" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">#{index + 1}</p>
                    <h3 className="truncate text-sm font-extrabold text-slate-100">{drink.name}</h3>
                  </div>
                </div>
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400"
                    style={{ width: `${Math.max(8, (drink.quantity / maxDemandQuantity) * 100)}%` }}
                  />
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-amber-300">{drink.quantity} {drink.unit}</p>
                    <p className="text-[11px] text-slate-500">{drink.orders} order{drink.orders > 1 ? 's' : ''}</p>
                  </div>
                  <p className="text-right text-xs font-bold text-slate-300">{formatCurrency(drink.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/40 px-6 py-10 text-center">
            <Flame className="mx-auto mb-3 h-10 w-10 text-slate-700" />
            <p className="font-semibold text-slate-300">No demand data yet</p>
            <p className="mt-2 text-xs text-slate-500">Top drinks will appear when customers place orders.</p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="glass-panel rounded-lg border border-slate-800/50 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Pending approvals</p>
              <h2 className="text-2xl font-extrabold text-slate-100">{pending.length} requests</h2>
            </div>
            <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3">
              <Clock className="h-6 w-6 text-amber-300" />
            </div>
          </div>

          {pending.length > 0 ? (
            <div className="space-y-3">
              {pending.slice(0, 6).map((b) => (
                <div key={b._id} className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-4 transition-all hover:border-amber-500/30">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-bold text-slate-100">{b.customerName}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {b.type} / {new Date(b.date).toLocaleDateString()} / {b.timeSlot}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleConfirm(b._id)}
                        className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/20"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <Link to="/bookings" className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 transition-all hover:border-amber-500/30 hover:text-amber-200">
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center">
              <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-400/70" />
              <p className="font-semibold text-slate-300">No pending bookings</p>
              <p className="mt-2 text-xs text-slate-500">All requests are reviewed.</p>
            </div>
          )}
        </div>

        <div className="glass-panel rounded-lg border border-slate-800/50 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Stock exceptions</p>
              <h2 className="text-2xl font-extrabold text-slate-100">{lowStock.length} alerts</h2>
            </div>
            <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3">
              <AlertTriangle className="h-6 w-6 text-red-300" />
            </div>
          </div>

          {lowStock.length > 0 ? (
            <div className="space-y-3">
              {lowStock.slice(0, 6).map((i) => (
                <div key={i._id} className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-100">{i.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{i.category} / reorder at {i.reorderLevel} {i.unit}</p>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase ${i.status === 'Out of Stock' ? 'border-red-500/20 bg-red-500/10 text-red-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-300'}`}>
                        {i.status}
                      </span>
                      <p className="mt-2 text-xs font-bold text-slate-200">{i.quantity} {i.unit}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center">
              <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-400/70" />
              <p className="font-semibold text-slate-300">All stock levels are healthy</p>
              <p className="mt-2 text-xs text-slate-500">No reorder exceptions right now.</p>
            </div>
          )}
        </div>
      </section>

      <section className="glass-panel rounded-lg border border-slate-800/50 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Quick actions</p>
            <h2 className="text-lg font-bold text-slate-100">Manage inventory and bookings</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/inventory" className="inline-flex items-center gap-2 rounded-md bg-amber-500/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-amber-300 transition-all hover:bg-amber-500/20">
              Inventory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/bookings" className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 transition-all hover:border-amber-500/30 hover:text-amber-200">
              Bookings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/orders" className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 transition-all hover:border-amber-500/30 hover:text-amber-200">
              Orders <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StaffDashboard;
