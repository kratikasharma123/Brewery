import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock,
  Package,
  Image as ImageIcon,
  Plus,
  ShoppingBag,
  ShoppingCart,
  UserCheck,
} from 'lucide-react';
import { fetchInventory } from '../features/inventory/inventorySlice';
import { addToCart } from '../features/cart/cartSlice';

const CustomerDashboard = ({ user, bookings = [], items = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);

  useEffect(() => {
    if (!items?.length) {
      dispatch(fetchInventory());
    }
  }, [dispatch, items]);

  const upcomingBookings = bookings.filter((b) => b.status === 'Confirmed').slice(0, 5);
  const featuredItems = items.slice(0, 6);
  const productCount = items.length;
  const inStockCount = items.filter((item) => item.status === 'In Stock').length;
  const lowStockCount = items.filter((item) => item.status === 'Low Stock').length;
  const cartCount = cartItems.reduce((total, item) => total + (item.cartQty || 1), 0);

  const handleAddToCart = (item) => {
    dispatch(addToCart({
      _id: item._id,
      name: item.name,
      unit: item.unit,
      category: item.category,
      status: item.status,
      quantity: item.quantity,
      price: item.price || 0,
      supplier: item.supplier,
      description: item.description,
      imageUrl: item.imageUrl,
      cartQty: 1,
    }));
  };

  const handleBuyNow = (item) => {
    handleAddToCart(item);
    navigate('/cart');
  };

  const isInCart = (itemId) => cartItems.some((cartItem) => cartItem._id === itemId);

  const heroStats = [
    {
      label: 'Cart items',
      value: cartCount,
      icon: ShoppingCart,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    },
    {
      label: 'Confirmed visits',
      value: upcomingBookings.length,
      icon: UserCheck,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    },
    {
      label: 'Products live',
      value: productCount,
      icon: Package,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
    },
  ];

  return (
    <div className="space-y-7">
      <section className="animate-surface-in shine-hover relative overflow-hidden rounded-lg border border-amber-500/20 bg-slate-950 shadow-2xl shadow-slate-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.82))]" />
        <div className="relative grid gap-8 p-6 md:grid-cols-[1.35fr_0.65fr] md:p-8">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
                <ShoppingBag className="h-3.5 w-3.5" />
                Customer Dashboard
              </p>
              <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-slate-50 md:text-5xl">
                Welcome back, <span className="text-amber-300">{user?.name || 'guest'}</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Track confirmed tastings, browse fresh brewery stock, and keep your cart ready for a smooth checkout.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-4 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-950/30 transition-all hover:bg-amber-300"
              >
                <ShoppingCart className="h-4 w-4" />
                Shop Products
              </Link>
              <Link
                to="/bookings"
                className="inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm font-bold text-slate-100 transition-all hover:border-amber-400/50 hover:text-amber-200"
              >
                <CalendarDays className="h-4 w-4" />
                Reserve Tasting
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            {heroStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} className="interactive-lift rounded-lg border border-white/10 bg-white/[0.04] p-4">
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

      <section className="glass-panel animate-rise-in motion-delay-100 rounded-lg border border-slate-800/50 p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Your next visit</p>
            <h2 className="text-2xl font-extrabold text-slate-100">Tasting schedule</h2>
          </div>
          <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3">
            <UserCheck className="h-6 w-6 text-emerald-300" />
          </div>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {upcomingBookings.map((booking) => (
              <div key={booking._id} className="interactive-lift rounded-lg border border-slate-800/70 bg-slate-900/60 p-4 transition-all hover:border-emerald-500/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-100">{booking.type}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-950/60 px-2 py-1">
                        <CalendarDays className="h-3.5 w-3.5 text-emerald-300" />
                        {new Date(booking.date).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-950/60 px-2 py-1">
                        <Clock className="h-3.5 w-3.5 text-emerald-300" />
                        {booking.timeSlot}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs font-bold text-slate-200">
                    {booking.guestsCount} guests
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center text-slate-500">
            <CalendarDays className="mx-auto mb-3 h-9 w-9 text-slate-600" />
            <p className="font-semibold text-slate-300">No confirmed visits yet</p>
            <p className="mt-2 text-xs">Book a session to see it here.</p>
            <Link to="/bookings" className="mt-5 inline-flex items-center gap-2 rounded-md bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20">
              Start booking <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>

      <section className="glass-panel animate-rise-in motion-delay-200 rounded-lg border border-slate-800/50 p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Brewery shelf</p>
              <h2 className="text-2xl font-extrabold text-slate-100">Inventory at a glance</h2>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 self-start rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-300 transition-all hover:bg-amber-500/20 md:self-auto">
              Browse all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <Package className="mb-4 h-5 w-5 text-sky-300" />
              <p className="text-3xl font-extrabold text-slate-100">{productCount}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">Products</p>
            </div>
            <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-4">
              <CheckCircle className="mb-4 h-5 w-5 text-emerald-300" />
              <p className="text-3xl font-extrabold text-emerald-200">{inStockCount}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-emerald-400/80">In stock</p>
            </div>
            <div className="rounded-lg border border-amber-500/15 bg-amber-500/5 p-4">
              <AlertTriangle className="mb-4 h-5 w-5 text-amber-300" />
              <p className="text-3xl font-extrabold text-amber-200">{lowStockCount}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-amber-400/80">Low stock</p>
            </div>
          </div>

          {featuredItems.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredItems.map((item) => (
                <div key={item._id} className="group interactive-lift rounded-lg border border-slate-800/70 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20 transition-all hover:border-amber-500/30">
                  {(() => {
                    const alreadyInCart = isInCart(item._id);

                    return (
                      <>
                  <div className="mb-4 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <ImageIcon className="h-9 w-9 text-slate-700" />
                    )}
                  </div>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-amber-300/80">{item.category || 'Product'}</p>
                      <h3 className="truncate text-lg font-extrabold text-slate-100" title={item.name}>{item.name}</h3>
                    </div>
                    <span className={`shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase ${item.status === 'In Stock' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : item.status === 'Low Stock' ? 'border-amber-500/20 bg-amber-500/10 text-amber-300' : 'border-red-500/20 bg-red-500/10 text-red-300'}`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="mb-5 min-h-12 text-sm leading-6 text-slate-400 line-clamp-2">
                    {item.description || 'No description available.'}
                  </p>

                  <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-slate-950/50 p-3">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Quantity</p>
                      <p className="mt-1 font-bold text-slate-100">{item.quantity} {item.unit}</p>
                    </div>
                    <div className="rounded-md bg-slate-950/50 p-3">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Supplier</p>
                      <p className="mt-1 truncate font-bold text-slate-100" title={item.supplier || 'N/A'}>{item.supplier || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.status === 'Out of Stock'}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-xs font-extrabold transition-all disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 ${
                        alreadyInCart
                          ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {alreadyInCart ? 'Add Again' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => handleBuyNow(item)}
                      disabled={item.status === 'Out of Stock'}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-700 px-3 py-2.5 text-xs font-extrabold text-slate-200 transition-all hover:border-amber-400/50 hover:text-amber-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
                    >
                      Buy Now
                    </button>
                  </div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 text-center text-slate-500">
              <p>No products available yet. Visit the shop to browse more items.</p>
            </div>
          )}
      </section>

      <section className="glass-panel animate-rise-in motion-delay-300 rounded-lg border border-slate-800/50 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Plan your visit</p>
            <h2 className="text-lg font-bold text-slate-100">Reserve your next tasting</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Book tastings, tours, and special events from the bookings page, then track confirmed reservations here.
            </p>
          </div>
          <Link to="/bookings" className="inline-flex items-center justify-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-amber-300 transition-all hover:bg-amber-500/20">
            View Booking Form
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CustomerDashboard;
