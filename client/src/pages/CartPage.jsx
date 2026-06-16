import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  BadgeIndianRupee,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  ShoppingCart,
  Trash2,
  User,
  Wallet,
} from 'lucide-react';
import { removeFromCart, updateCartQuantity, clearCart, placeCodOrder, resetCartStatus } from '../features/cart/cartSlice';
import { fetchInventory } from '../features/inventory/inventorySlice';
import { NAME_PATTERN, NAME_VALIDATION_MESSAGE, sanitizeNameInput } from '../utils/nameValidation';
import { DIGITS_PATTERN, DIGITS_VALIDATION_MESSAGE, sanitizeDigitsInput } from '../utils/numberValidation';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, isLoading, isError, isSuccess, message, lastOrder } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: user?.name || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
  });

  const formatCurrency = (amount) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`;

  const handleQuantityChange = (id, value) => {
    const qty = Number(value);
    if (!Number.isNaN(qty) && qty > 0) {
      dispatch(updateCartQuantity({ id, qty }));
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.cartQty * (item.price || 0), 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.cartQty, 0);

  const handleDeliveryChange = (e) => {
    const digitFields = ['phone', 'postalCode'];
    const value = e.target.name === 'fullName'
      ? sanitizeNameInput(e.target.value)
      : digitFields.includes(e.target.name)
        ? sanitizeDigitsInput(e.target.value)
        : e.target.value;
    setDeliveryDetails((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handlePlaceCodOrder = async (e) => {
    e.preventDefault();
    const result = await dispatch(placeCodOrder(deliveryDetails));
    if (placeCodOrder.fulfilled.match(result)) {
      dispatch(fetchInventory());
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-surface-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Your Cart
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review the items you have added to your cart.
          </p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-amber-300 text-sm font-semibold hover:bg-amber-500/10 transition-all"
        >
          Continue shopping
        </button>
      </div>

      {(isError || isSuccess) && (
        <div className={`rounded-2xl border p-4 text-sm flex items-start gap-3 ${
          isSuccess
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
            : 'border-red-500/20 bg-red-500/10 text-red-300'
        }`}>
          {isSuccess ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <ShoppingCart className="h-5 w-5 shrink-0" />}
          <div className="space-y-1">
            <p className="font-semibold">{message}</p>
            {lastOrder?._id && <p className="text-xs opacity-80">Order ID: {lastOrder._id}</p>}
          </div>
          <button
            onClick={() => dispatch(resetCartStatus())}
            className="ml-auto text-xs font-semibold opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="glass-panel animate-rise-in p-8 rounded-3xl border border-slate-800/60 text-center text-slate-400">
          <ShoppingCart className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <p className="text-xl font-semibold text-slate-100">{isSuccess ? 'Order placed.' : 'Your cart is empty.'}</p>
          <p className="mt-2">{isSuccess ? 'You can keep shopping while your COD order is prepared.' : 'Add items from the shop to get started.'}</p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="glass-panel animate-rise-in motion-delay-100 rounded-3xl border border-slate-800/60 p-6">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="interactive-lift flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                        ) : (
                          <ImageIcon className="h-7 w-7 text-slate-700" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-slate-100">{item.name}</h2>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mt-1">{item.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="inline h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{item.description || 'No description available.'}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                      <span className="rounded-2xl bg-slate-950 px-3 py-2 text-slate-100">{item.quantity} {item.unit}</span>
                      <span className="rounded-2xl bg-slate-950 px-3 py-2 text-slate-100">{item.status}</span>
                      <span className="rounded-2xl bg-slate-950 px-3 py-2 text-slate-100">{formatCurrency(item.price)}</span>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <div className="flex items-center gap-2">
                        <label className="text-xs uppercase tracking-wider text-slate-500">Qty</label>
                        <input
                          type="number"
                          value={item.cartQty}
                          min="1"
                          max={item.quantity}
                          onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                          className="w-20 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        Line total: <span className="font-semibold text-slate-100">{formatCurrency((item.price || 0) * item.cartQty)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handlePlaceCodOrder} className="glass-panel animate-rise-in motion-delay-200 rounded-3xl border border-slate-800/60 p-6 h-fit">
            <h2 className="text-xl font-bold text-slate-100">Checkout</h2>
            <p className="mt-2 text-sm text-slate-400">Add delivery details for your COD order.</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Products</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Total quantity</span>
                <span>{totalQuantity}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-100">{formatCurrency(subtotal)}</span>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-amber-300" />
                  <div>
                    <p className="text-sm font-bold text-amber-200">Cash on Delivery</p>
                    <p className="mt-1 text-xs text-amber-100/70">Pay when your order is delivered.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-amber-300" />
                  <div>
                    <p className="text-sm font-bold text-slate-100">Delivery details</p>
                    <p className="mt-1 text-xs text-slate-500">Required for Cash on Delivery.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      name="fullName"
                      value={deliveryDetails.fullName}
                      onChange={handleDeliveryChange}
                      required
                      pattern={NAME_PATTERN}
                      title={NAME_VALIDATION_MESSAGE}
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none focus:border-amber-500"
                      placeholder="Full name"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      name="phone"
                      type="text"
                      value={deliveryDetails.phone}
                      onChange={handleDeliveryChange}
                      required
                      pattern={DIGITS_PATTERN}
                      title={DIGITS_VALIDATION_MESSAGE}
                      inputMode="numeric"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none focus:border-amber-500"
                      placeholder="Phone number"
                    />
                  </div>
                  <input
                    name="addressLine1"
                    value={deliveryDetails.addressLine1}
                    onChange={handleDeliveryChange}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500"
                    placeholder="House / flat / street address"
                  />
                  <input
                    name="addressLine2"
                    value={deliveryDetails.addressLine2}
                    onChange={handleDeliveryChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500"
                    placeholder="Landmark / area (optional)"
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      name="city"
                      value={deliveryDetails.city}
                      onChange={handleDeliveryChange}
                      required
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500"
                      placeholder="City"
                    />
                    <input
                      name="state"
                      value={deliveryDetails.state}
                      onChange={handleDeliveryChange}
                      required
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500"
                      placeholder="State"
                    />
                  </div>
                  <input
                    name="postalCode"
                    value={deliveryDetails.postalCode}
                    onChange={handleDeliveryChange}
                    required
                    pattern={DIGITS_PATTERN}
                    title={DIGITS_VALIDATION_MESSAGE}
                    inputMode="numeric"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500"
                    placeholder="Postal code"
                  />
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <textarea
                      name="notes"
                      value={deliveryDetails.notes}
                      onChange={handleDeliveryChange}
                      rows="3"
                      className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none focus:border-amber-500"
                      placeholder="Delivery notes (optional)"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-base">
                <span className="font-bold text-slate-200">Total</span>
                <span className="font-extrabold text-amber-300 flex items-center gap-1">
                  <BadgeIndianRupee className="h-4 w-4" />
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-all disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              {isLoading ? 'Placing order...' : 'Place Order with COD'}
            </button>
            <button
              type="button"
              onClick={() => dispatch(clearCart())}
              className="mt-6 w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-300 hover:border-red-500/30 hover:text-red-300 transition-all"
            >
              Clear Cart
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CartPage;
