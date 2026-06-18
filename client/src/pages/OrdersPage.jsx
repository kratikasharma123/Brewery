import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BadgeDollarSign,
  Ban,
  CheckCircle,
  ClipboardList,
  CreditCard,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  Search,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { cancelOrder, fetchOrders } from '../features/orders/orderSlice';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, isLoading, isError, message } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const isCustomer = user?.role === 'Customer';

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const formatCurrency = (amount) => `$${Number(amount || 0).toLocaleString('en-US')}`;

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch = query
        ? [
            order.customerName,
            order.customerEmail,
            order.deliveryDetails?.phone,
            order.deliveryDetails?.city,
            order._id,
          ].some((value) => String(value || '').toLowerCase().includes(query))
        : true;
      const matchesPayment = paymentStatus ? order.paymentStatus === paymentStatus : true;
      const matchesOrderStatus = orderStatus ? order.orderStatus === orderStatus : true;

      return matchesSearch && matchesPayment && matchesOrderStatus;
    });
  }, [orders, orderStatus, paymentStatus, search]);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const codPending = orders.filter((order) => order.paymentMethod === 'COD' && order.paymentStatus === 'Pending').length;
  const placedOrders = orders.filter((order) => order.orderStatus === 'Placed').length;
  const totalProducts = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0),
    0
  );

  const stats = [
    {
      label: 'Total orders',
      value: orders.length,
      icon: ClipboardList,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    },
    {
      label: 'COD pending',
      value: codPending,
      icon: CreditCard,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
    },
    {
      label: 'Placed orders',
      value: placedOrders,
      icon: ShoppingBag,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    },
    {
      label: 'Items ordered',
      value: totalProducts,
      icon: Package,
      tone: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
    },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'Paid':
      case 'Delivered':
      case 'Confirmed':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
      case 'Pending':
      case 'Placed':
        return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
      case 'Cancelled':
        return 'border-red-500/20 bg-red-500/10 text-red-300';
      default:
        return 'border-slate-700 bg-slate-900 text-slate-300';
    }
  };

  const getTrackingSteps = (status) => {
    const steps = ['Placed', 'Confirmed', 'Delivered'];
    if (status === 'Cancelled') return ['Placed', 'Cancelled'];
    return steps;
  };

  const isStepActive = (orderStatusValue, step) => {
    if (orderStatusValue === 'Cancelled') return step === 'Placed' || step === 'Cancelled';
    const steps = ['Placed', 'Confirmed', 'Delivered'];
    return steps.indexOf(step) <= steps.indexOf(orderStatusValue);
  };

  const canCancelOrder = (order) => isCustomer && ['Placed', 'Confirmed'].includes(order.orderStatus);

  const getOrderAccent = (status) => {
    switch (status) {
      case 'Delivered':
        return 'from-emerald-400 via-teal-400 to-sky-400';
      case 'Confirmed':
        return 'from-sky-400 via-cyan-400 to-emerald-400';
      case 'Cancelled':
        return 'from-red-400 via-rose-400 to-orange-300';
      default:
        return 'from-amber-300 via-orange-400 to-rose-300';
    }
  };

  const getStepCopy = (step) => {
    switch (step) {
      case 'Placed':
        return 'Order received';
      case 'Confirmed':
        return 'Preparing';
      case 'Delivered':
        return 'Completed';
      case 'Cancelled':
        return 'Cancelled';
      default:
        return step;
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Cancel this order? Stock will be released back to inventory.')) {
      dispatch(cancelOrder(orderId));
    }
  };

  return (
    <div className="space-y-7">
      <section className="animate-surface-in shine-hover relative overflow-hidden rounded-lg border border-amber-500/20 bg-slate-950 shadow-2xl shadow-slate-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.2),transparent_31%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.97),rgba(2,6,23,0.84))]" />
        <div className="relative grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] md:p-8">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
              <ClipboardList className="h-3.5 w-3.5" />
              Order Desk
            </p>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-slate-50 md:text-5xl">
              {isCustomer ? 'Track your orders' : 'Total customer orders'}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              {isCustomer
                ? 'See what you ordered, follow order progress, review delivery details, and cancel before delivery.'
                : 'Track COD orders, delivery details, customer contacts, order totals, and payment status from one dedicated section.'}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <BadgeDollarSign className="mb-4 h-6 w-6 text-emerald-300" />
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Order value</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-50">{formatCurrency(totalRevenue)}</p>
            <p className="mt-2 text-xs text-slate-500">Total value from all customer product orders.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="glass-panel interactive-lift rounded-lg border border-slate-800/50 p-5">
              <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md border ${stat.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-extrabold text-slate-50">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </section>

      <section className="glass-panel animate-rise-in motion-delay-100 rounded-lg border border-slate-800/50 p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-md border border-slate-800 bg-slate-950/60 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
              placeholder={isCustomer ? 'Search city, phone, or order ID' : 'Search customer, phone, city, or order ID'}
            />
          </div>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-200 outline-none transition-all focus:border-amber-500/60"
          >
            <option value="">All payments</option>
            <option value="Pending">Payment pending</option>
            <option value="Paid">Paid</option>
          </select>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-200 outline-none transition-all focus:border-amber-500/60"
          >
            <option value="">All statuses</option>
            <option value="Placed">Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </section>

      <section className="glass-panel animate-rise-in motion-delay-200 overflow-hidden rounded-lg border border-slate-800/50">
        <div className="flex flex-col gap-3 border-b border-slate-800/80 bg-slate-950/40 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Order list</p>
            <h2 className="text-xl font-extrabold text-slate-100">{visibleOrders.length} visible orders</h2>
          </div>
          {isLoading && (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading orders
            </span>
          )}
        </div>

        {isError ? (
          <div className="py-12 text-center text-red-300">{message || 'Unable to load orders.'}</div>
        ) : isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            <p className="text-sm font-medium">Fetching customer orders...</p>
          </div>
        ) : visibleOrders.length > 0 ? (
          isCustomer ? (
            <div className="grid gap-6 bg-slate-950/30 p-4 md:p-6">
              {visibleOrders.map((order) => {
                const steps = getTrackingSteps(order.orderStatus);
                const visibleItems = order.items.slice(0, 3);
                const hiddenItemCount = Math.max(order.items.length - visibleItems.length, 0);

                return (
                  <article
                    key={order._id}
                    className="group interactive-lift overflow-hidden rounded-lg border border-slate-800/80 bg-slate-900/70 shadow-2xl shadow-slate-950/30 transition-all hover:border-amber-500/30"
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${getOrderAccent(order.orderStatus)}`} />

                    <div className="grid gap-6 p-5 lg:grid-cols-[1fr_340px] md:p-6">
                      <div className="min-w-0">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase ${getStatusClass(order.orderStatus)}`}>
                                {order.orderStatus === 'Delivered' ? <CheckCircle className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                                {order.orderStatus}
                              </span>
                              <span className={`rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase ${getStatusClass(order.paymentStatus)}`}>
                                {order.paymentMethod} / {order.paymentStatus}
                              </span>
                            </div>

                            <h2 className="mt-4 text-2xl font-extrabold text-slate-50">
                              Order #{order._id.slice(-6).toUpperCase()}
                            </h2>
                            <p className="mt-1 text-xs font-medium text-slate-500">
                              Placed on {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 md:text-right">
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300/80">Order total</p>
                            <p className="mt-1 text-2xl font-black text-amber-200">{formatCurrency(order.total)}</p>
                          </div>
                        </div>

                        <div className="mt-7 rounded-lg border border-slate-800 bg-slate-950/45 p-4">
                          <div className="mb-5 flex items-center justify-between gap-3">
                            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                              <Truck className="h-4 w-4 text-amber-300" />
                              Live tracking
                            </p>
                            <span className="text-[11px] font-semibold text-slate-500">{getStepCopy(order.orderStatus)}</span>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-3">
                            {steps.map((step, index) => {
                              const active = isStepActive(order.orderStatus, step);
                              const isLast = index === steps.length - 1;

                              return (
                                <div key={step} className="relative min-w-0">
                                  {!isLast && (
                                    <span
                                      className={`absolute left-10 right-[-1rem] top-5 hidden h-0.5 sm:block ${
                                        active ? 'bg-amber-400/70' : 'bg-slate-800'
                                      }`}
                                    />
                                  )}
                                  <div className="relative flex items-center gap-3 sm:block">
                                    <span
                                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-black shadow-lg ${
                                        active
                                          ? 'border-amber-400 bg-amber-400 text-slate-950 shadow-amber-950/30'
                                          : 'border-slate-700 bg-slate-900 text-slate-600'
                                      }`}
                                    >
                                      {active ? <CheckCircle className="h-5 w-5" /> : index + 1}
                                    </span>
                                    <div className="min-w-0 sm:mt-3">
                                      <p className={`text-sm font-extrabold ${active ? 'text-slate-100' : 'text-slate-500'}`}>
                                        {step}
                                      </p>
                                      <p className="mt-1 text-xs leading-5 text-slate-500">{getStepCopy(step)}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                          <div className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
                            <p className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                              <Package className="h-4 w-4 text-sky-300" />
                              Products
                            </p>
                            <div className="grid gap-3">
                              {visibleItems.map((item) => (
                                <div key={`${order._id}-${item.name}`} className="flex items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-900/80 p-3">
                                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-700 bg-slate-950">
                                    {item.imageUrl ? (
                                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    ) : (
                                      <ImageIcon className="h-6 w-6 text-slate-700" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-extrabold text-slate-100">{item.name}</p>
                                    <p className="mt-1 text-xs text-slate-500">Qty {item.quantity} {item.unit}</p>
                                  </div>
                                  <p className="shrink-0 text-sm font-black text-slate-100">{formatCurrency(item.lineTotal)}</p>
                                </div>
                              ))}
                              {hiddenItemCount > 0 && (
                                <p className="rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-center text-xs font-bold text-slate-400">
                                  +{hiddenItemCount} more item{hiddenItemCount > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>

                          {order.deliveryDetails && (
                            <div className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
                              <p className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                <MapPin className="h-4 w-4 text-emerald-300" />
                                Delivery
                              </p>
                              <p className="text-sm font-extrabold text-slate-100">{order.deliveryDetails.fullName}</p>
                              <p className="mt-2 text-sm leading-6 text-slate-300">
                                {order.deliveryDetails.addressLine1}
                                {order.deliveryDetails.addressLine2 ? `, ${order.deliveryDetails.addressLine2}` : ''}
                              </p>
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                {order.deliveryDetails.city}, {order.deliveryDetails.state} {order.deliveryDetails.postalCode}
                              </p>
                              <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
                                <Phone className="h-3.5 w-3.5" />
                                {order.deliveryDetails.phone}
                              </p>
                              {order.deliveryDetails.notes && (
                                <p className="mt-3 rounded-md bg-slate-900/80 px-3 py-2 text-xs italic text-slate-500">
                                  {order.deliveryDetails.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <aside className="rounded-lg border border-slate-800 bg-slate-950/55 p-5">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
                          <ReceiptText className="h-6 w-6 text-amber-300" />
                        </div>
                        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Payment summary</p>

                        <div className="mt-5 space-y-4 text-sm">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Subtotal</span>
                            <span className="font-bold text-slate-200">{formatCurrency(order.subtotal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Payment mode</span>
                            <span className="font-bold text-slate-200">{order.paymentMethod}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Status</span>
                            <span className={`rounded-md border px-2 py-1 text-[10px] font-extrabold uppercase ${getStatusClass(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                          <div className="flex items-end justify-between border-t border-slate-800 pt-4">
                            <span className="font-bold text-slate-200">Total</span>
                            <span className="text-2xl font-black text-amber-300">{formatCurrency(order.total)}</span>
                          </div>
                        </div>

                        {canCancelOrder(order) && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={isLoading}
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-950/30 transition-all hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Ban className="h-4 w-4" />
                            Cancel Order
                          </button>
                        )}
                        {order.orderStatus === 'Delivered' && (
                          <p className="mt-5 rounded-md border border-emerald-500/15 bg-emerald-500/10 px-3 py-2 text-center text-xs font-bold text-emerald-300">
                            This order has been delivered.
                          </p>
                        )}
                        {order.orderStatus === 'Cancelled' && (
                          <p className="mt-5 rounded-md border border-red-500/15 bg-red-500/10 px-3 py-2 text-center text-xs font-bold text-red-300">
                            This order has been cancelled.
                          </p>
                        )}
                      </aside>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
          <div className="divide-y divide-slate-800/70">
            {visibleOrders.map((order) => (
              <article key={order._id} className="grid gap-5 p-5 xl:grid-cols-[1.1fr_1fr_0.7fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold text-slate-100">{order.customerName}</p>
                    <span className={`rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase ${getStatusClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <span className={`rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase ${getStatusClass(order.paymentStatus)}`}>
                      {order.paymentMethod} / {order.paymentStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{order.customerEmail}</p>
                  <p className="mt-2 text-[11px] text-slate-500">Order ID: {order._id}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Tracking</p>
                    <div className="flex flex-wrap gap-2">
                      {getTrackingSteps(order.orderStatus).map((step) => (
                        <span
                          key={step}
                          className={`rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                            isStepActive(order.orderStatus, step)
                              ? getStatusClass(step)
                              : 'border-slate-800 bg-slate-950/60 text-slate-500'
                          }`}
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Items</p>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={`${order._id}-${item.name}`} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-2">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-800 bg-slate-950">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-slate-700" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-200">{item.name}</p>
                            <p className="text-xs text-slate-500">Qty {item.quantity} / {formatCurrency(item.lineTotal)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {order.deliveryDetails && (
                    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-amber-300" />
                        Delivery
                      </p>
                      <p className="text-sm text-slate-300">
                        {order.deliveryDetails.addressLine1}
                        {order.deliveryDetails.addressLine2 ? `, ${order.deliveryDetails.addressLine2}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {order.deliveryDetails.city}, {order.deliveryDetails.state} {order.deliveryDetails.postalCode}
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <Phone className="h-3.5 w-3.5 text-emerald-300" />
                        {order.deliveryDetails.phone}
                      </p>
                      {order.deliveryDetails.notes && (
                        <p className="mt-2 text-xs italic text-slate-500">{order.deliveryDetails.notes}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-left xl:text-right">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total</p>
                  <p className="mt-2 text-2xl font-extrabold text-amber-300">{formatCurrency(order.total)}</p>
                  <p className="mt-2 text-xs text-slate-500">Subtotal: {formatCurrency(order.subtotal)}</p>
                  {canCancelOrder(order) && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={isLoading}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Cancel Order
                    </button>
                  )}
                  {isCustomer && order.orderStatus === 'Delivered' && (
                    <p className="mt-5 text-xs font-semibold text-slate-500">Delivered orders cannot be cancelled.</p>
                  )}
                </div>
              </article>
            ))}
          </div>
          )
        ) : (
          <div className="flex h-64 flex-col items-center justify-center py-10 text-slate-500">
            <ClipboardList className="mb-3 h-12 w-12 text-slate-700" />
            <p className="text-sm font-semibold text-slate-300">No orders found</p>
            <p className="mt-1 text-xs text-slate-500">Try changing filters or search text.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default OrdersPage;
