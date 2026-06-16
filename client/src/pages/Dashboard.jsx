import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeIndianRupee,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Flame,
  Image as ImageIcon,
  Layers,
  Package,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { fetchInventory } from '../features/inventory/inventorySlice';
import { fetchBookings } from '../features/bookings/bookingSlice';
import { fetchDashboardSummary } from '../features/dashboard/dashboardSlice';
import { fetchOrders } from '../features/orders/orderSlice';
import CustomerDashboard from './CustomerDashboard';
import StaffDashboard from './StaffDashboard';
import { getHighlyDemandedDrinks } from '../utils/orderInsights';

const chartTooltipStyle = {
  backgroundColor: '#0f172a',
  borderColor: '#1e293b',
  borderRadius: '8px',
  color: '#f8fafc',
};

const Dashboard = () => {
  const dispatch = useDispatch();

  const { items } = useSelector((state) => state.inventory);
  const { bookings } = useSelector((state) => state.booking);
  const { user } = useSelector((state) => state.auth);
  const { summary } = useSelector((state) => state.dashboard);
  const { orders } = useSelector((state) => state.orders);
  const role = user?.role?.toLowerCase();
  const isCustomer = role === 'customer';
  const isStaff = role === 'staff';

  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchBookings());

    if (user?.role === 'Admin' || user?.role === 'Staff') {
      dispatch(fetchDashboardSummary());
      dispatch(fetchOrders());
    }
  }, [dispatch, user?.role]);

  const totalItems = items.length;
  const lowStockItems = items.filter((item) => item.status === 'Low Stock' || item.status === 'Out of Stock');
  const lowStockCount = lowStockItems.length;

  const categoriesMap = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.keys(categoriesMap).map((key) => ({
    name: key,
    value: categoriesMap[key],
  }));

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending').length;
  const confirmedBookings = bookings.filter((booking) => booking.status === 'Confirmed').length;

  const typesMap = bookings.reduce((acc, booking) => {
    acc[booking.type] = (acc[booking.type] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.keys(typesMap).map((key) => ({
    name: key,
    count: typesMap[key],
  }));

  const upcomingBookings = bookings.filter((booking) => booking.status === 'Confirmed').slice(0, 5);
  const codPendingOrders = orders.filter((order) => order.paymentMethod === 'COD' && order.paymentStatus === 'Pending').length;
  const formatCurrency = (amount) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`;
  const inventoryValue = Math.round(summary?.totals?.inventoryValue ?? 0);
  const totalRevenue = summary?.totals?.totalRevenue ?? 0;
  const highlyDemandedDrinks = getHighlyDemandedDrinks(orders);
  const maxDemandQuantity = Math.max(...highlyDemandedDrinks.map((drink) => drink.quantity), 1);

  const COLORS = ['#d97706', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'];

  const primaryStats = [
    {
      name: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: BadgeIndianRupee,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
      description: 'Confirmed booking revenue',
    },
    {
      name: 'Inventory Value',
      value: formatCurrency(inventoryValue),
      icon: Package,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
      description: 'Stock value on hand',
    },
    {
      name: 'Active Customers',
      value: summary?.totals?.activeCustomers ?? 0,
      icon: Users,
      tone: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
      description: 'Registered customer accounts',
    },
    {
      name: 'COD Orders',
      value: codPendingOrders,
      icon: ShoppingBag,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
      description: 'Cash payments pending',
    },
  ];

  const operationsStats = [
    { label: 'Inventory SKUs', value: totalItems, icon: Package, color: 'text-sky-300' },
    { label: 'Low stock alerts', value: lowStockCount, icon: AlertTriangle, color: lowStockCount > 0 ? 'text-red-300' : 'text-slate-400' },
    { label: 'Pending bookings', value: pendingBookings, icon: CalendarDays, color: 'text-amber-300' },
    { label: 'Confirmed bookings', value: confirmedBookings, icon: CheckCircle, color: 'text-emerald-300' },
  ];

  if (isCustomer) {
    return <CustomerDashboard user={user} bookings={bookings} items={items} />;
  }

  if (isStaff) {
    return <StaffDashboard user={user} bookings={bookings} items={items} orders={orders} />;
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-lg border border-amber-500/20 bg-slate-950 shadow-2xl shadow-slate-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.2),transparent_31%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.97),rgba(2,6,23,0.84))]" />
        <div className="relative grid gap-8 p-6 lg:grid-cols-[1.18fr_0.82fr] md:p-8">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
              <Activity className="h-3.5 w-3.5" />
              Admin Overview
            </p>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-slate-50 md:text-5xl">
              Brewery command center
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Welcome back, <span className="font-semibold text-amber-300">{user?.name || 'admin'}</span>. Monitor revenue, inventory risk, bookings, and order totals from one polished workspace.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/inventory" className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-4 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-950/30 transition-all hover:bg-amber-300">
                <Package className="h-4 w-4" />
                Manage Inventory
              </Link>
              <Link to="/bookings" className="inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm font-bold text-slate-100 transition-all hover:border-amber-400/50 hover:text-amber-200">
                <CalendarDays className="h-4 w-4" />
                Review Bookings
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {operationsStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <Icon className={`mb-4 h-5 w-5 ${stat.color}`} />
                  <p className="text-3xl font-extrabold text-slate-50">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.name} className="glass-panel rounded-lg border border-slate-800/50 p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-md border ${stat.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-slate-600" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{stat.name}</p>
              <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-50">{stat.value}</p>
              <p className="mt-2 text-xs text-slate-500">{stat.description}</p>
            </div>
          );
        })}
      </section>

      <section className="glass-panel rounded-lg border border-slate-800/50 p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-300">
              <Flame className="h-4 w-4" />
              Highly demanded drinks
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-100">Top selling products</h2>
          </div>
          <Link to="/orders" className="inline-flex items-center gap-2 self-start rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-300 transition-all hover:bg-amber-500/20 md:self-auto">
            View orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {highlyDemandedDrinks.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="overflow-hidden rounded-lg border border-amber-500/20 bg-slate-950/60">
              <div className="flex items-center gap-4 p-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                  {highlyDemandedDrinks[0].imageUrl ? (
                    <img src={highlyDemandedDrinks[0].imageUrl} alt={highlyDemandedDrinks[0].name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-700" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">Most demanded</p>
                  <h3 className="mt-1 truncate text-2xl font-black text-slate-50">{highlyDemandedDrinks[0].name}</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {highlyDemandedDrinks[0].quantity} {highlyDemandedDrinks[0].unit} ordered across {highlyDemandedDrinks[0].orders} order{highlyDemandedDrinks[0].orders > 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-800 bg-amber-500/10 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Revenue from this drink</p>
                <p className="mt-1 text-2xl font-extrabold text-amber-300">{formatCurrency(highlyDemandedDrinks[0].revenue)}</p>
              </div>
            </div>

            <div className="space-y-3">
              {highlyDemandedDrinks.map((drink, index) => (
                <div key={drink.name} className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-100">#{index + 1} {drink.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{drink.orders} order{drink.orders > 1 ? 's' : ''} / {formatCurrency(drink.revenue)}</p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-amber-300">{drink.quantity} {drink.unit}</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400"
                      style={{ width: `${Math.max(8, (drink.quantity / maxDemandQuantity) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/40 px-6 py-10 text-center">
            <Flame className="mx-auto mb-3 h-10 w-10 text-slate-700" />
            <p className="font-semibold text-slate-300">Demand data will appear after orders</p>
            <p className="mt-2 text-xs text-slate-500">Customer orders will automatically rank top drinks here.</p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="glass-panel rounded-lg border border-slate-800/50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <BadgeIndianRupee className="h-5 w-5 text-emerald-300" />
            <h3 className="text-lg font-bold text-slate-200">Monthly Revenue</h3>
          </div>
          <div className="h-72 w-full">
            {summary?.bookingTrends?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.bookingTrends}>
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">Revenue appears after confirmed bookings.</div>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-lg border border-slate-800/50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-sky-300" />
            <h3 className="text-lg font-bold text-slate-200">Booking Trends</h3>
          </div>
          <div className="h-72 w-full">
            {summary?.bookingTrends?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.bookingTrends}>
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">Booking trend data will appear here.</div>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-lg border border-slate-800/50 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-300" />
              <h3 className="text-lg font-bold text-slate-200">Inventory Distribution</h3>
            </div>
            <Link to="/inventory" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200">
              View <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex h-72 w-full items-center justify-center">
            {totalItems > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`category-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend formatter={(value) => <span className="text-xs font-medium text-slate-400">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm italic text-slate-500">No items available. Set up inventory first.</p>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-lg border border-slate-800/50 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-amber-300" />
              <h3 className="text-lg font-bold text-slate-200">Bookings by Event Type</h3>
            </div>
            <Link to="/bookings" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200">
              Manage <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full">
            {totalBookings > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeChartData}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {typeChartData.map((entry, index) => (
                      <Cell key={`booking-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm italic text-slate-500">No bookings registered. Schedule one to populate chart.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="glass-panel flex h-96 flex-col rounded-lg border border-slate-800/50 p-6">
          <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-300" />
              <h3 className="text-lg font-bold text-slate-200">Stock Threshold Alerts</h3>
            </div>
            <Link to="/inventory" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200">
              Inventory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div key={item._id} className={`rounded-lg border p-4 ${item.status === 'Out of Stock' ? 'border-red-500/20 bg-red-500/10' : 'border-amber-500/15 bg-amber-500/5'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-100">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-400">Category: <span className="text-slate-300">{item.category}</span></p>
                      <p className="mt-1 text-[10px] text-slate-500">Supplier: {item.supplier || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase ${item.status === 'Out of Stock' ? 'border-red-500/30 bg-red-500/20 text-red-300' : 'border-amber-500/30 bg-amber-500/20 text-amber-300'}`}>
                        {item.status}
                      </span>
                      <p className="mt-2 text-xs font-semibold text-slate-200">{item.quantity} {item.unit}</p>
                      <p className="text-[10px] text-slate-400">Reorder at {item.reorderLevel} {item.unit}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center text-slate-500">
                <CheckCircle className="mb-2 h-10 w-10 text-emerald-400/70" />
                <p className="text-sm font-semibold text-slate-300">All stock normal</p>
                <p className="mt-1 text-xs text-slate-500">All quantities exceed reorder limits.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel flex h-96 flex-col rounded-lg border border-slate-800/50 p-6">
          <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-300" />
              <h3 className="text-lg font-bold text-slate-200">Upcoming Confirmed Bookings</h3>
            </div>
            <Link to="/bookings" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200">
              Bookings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <div key={booking._id} className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-4 transition-all hover:border-emerald-500/20">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-200">{booking.customerName}</p>
                      <p className="mt-1 text-xs text-slate-400">Event: <span className="font-semibold text-amber-300">{booking.type}</span></p>
                      <p className="mt-1 text-xs text-slate-400">Date: <span className="font-semibold text-slate-300">{new Date(booking.date).toLocaleDateString()}</span></p>
                    </div>
                    <div className="text-right">
                      <span className="mb-2 inline-block rounded-md border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-extrabold uppercase text-emerald-300">
                        {booking.timeSlot}
                      </span>
                      <p className="text-xs font-semibold text-slate-300">Guests: {booking.guestsCount}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center text-slate-500">
                <CalendarDays className="mb-2 h-10 w-10 text-slate-700" />
                <p className="text-sm font-semibold text-slate-300">No upcoming tastings</p>
                <p className="mt-1 text-xs text-slate-500">There are no confirmed bookings currently.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
