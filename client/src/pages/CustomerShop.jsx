import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Info, Loader2, Image as ImageIcon } from 'lucide-react';
import { addToCart } from '../features/cart/cartSlice';

const CustomerShop = () => {
  const dispatch = useDispatch();
  const { items, isLoading, isError, message } = useSelector((state) => state.inventory);
  const cartItems = useSelector((state) => state.cart.items);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const categories = [...new Set(items.map((item) => item.category))];

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

  const isInCart = (itemId) => cartItems.some((cartItem) => cartItem._id === itemId);
  const visibleItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? item.category === category : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="animate-surface-in">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          Brewery Shop
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Browse available products and add them to your cart.
        </p>
      </div>

      <div className="glass-panel animate-rise-in motion-delay-100 p-6 rounded-2xl border border-slate-800/50">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-200"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-200"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex items-center rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3">
            <ShoppingCart className="h-5 w-5 text-amber-400 mr-3" />
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Products available</p>
              <p className="text-lg font-bold text-slate-100">{visibleItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-72 flex items-center justify-center text-slate-500 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p>Loading products...</p>
        </div>
      ) : isError ? (
        <div className="h-72 flex items-center justify-center text-red-400 gap-3">
          <Info className="h-8 w-8" />
          <p>{message || 'Unable to load shop items.'}</p>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-slate-500">
          <p>No products match your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <div key={item._id} className="glass-panel interactive-lift animate-rise-in motion-delay-200 rounded-3xl border border-slate-800/50 p-6 hover:border-amber-500/30 transition-all">
              {(() => {
                const alreadyInCart = isInCart(item._id);

                return (
                  <>
              <div className="mb-5 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-slate-700" />
                )}
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{item.name}</h2>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mt-1">{item.category}</p>
                </div>
                <span className={`px-3 py-1 text-[11px] font-semibold rounded-full ${item.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : item.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4 line-clamp-3">{item.description || 'No description available.'}</p>
              <div className="flex items-center justify-between text-sm text-slate-400 mb-6">
                <div>
                  <p>Qty: <span className="text-slate-100 font-semibold">{item.quantity} {item.unit}</span></p>
                  <p>Supplier: <span className="text-slate-100 font-semibold">{item.supplier || 'N/A'}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Reorder</p>
                  <p className="font-semibold text-slate-100">{item.reorderLevel} {item.unit}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.status === 'Out of Stock'}
                    className={`px-4 py-3 rounded-2xl text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 ${
                      alreadyInCart
                        ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    {alreadyInCart ? 'Add Again' : 'Add to Cart'}
                  </button>
                </div>
                <Link to="/bookings" className="text-xs text-amber-300 hover:text-amber-200">
                  Book tasting
                </Link>
              </div>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerShop;
