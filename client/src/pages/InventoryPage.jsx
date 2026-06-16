import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInventory,
  createItem,
  updateItem,
  deleteItem,
  resetInventoryState,
} from '../features/inventory/inventorySlice';
import { sanitizeDigitsInput } from '../utils/numberValidation';
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Edit2,
  FileText,
  Filter,
  Image as ImageIcon,
  Layers,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';

const defaultFormData = {
  name: '',
  category: 'Raw Material',
  quantity: 0,
  unit: 'kg',
  price: 0,
  reorderLevel: 10,
  supplier: '',
  description: '',
  imageUrl: '',
};

const InventoryPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, isLoading } = useSelector((state) => state.inventory);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    dispatch(fetchInventory(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
    });
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedItemId(null);
    setFormData(defaultFormData);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setIsEditMode(true);
    setSelectedItemId(item._id);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price || 0,
      reorderLevel: item.reorderLevel,
      supplier: item.supplier || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setIsEditMode(false);
    setSelectedItemId(null);
  };

  const handleFormChange = (e) => {
    const integerFields = ['quantity', 'price', 'reorderLevel'];
    const value = integerFields.includes(e.target.name)
      ? Number(sanitizeDigitsInput(e.target.value))
        : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode && selectedItemId
      ? updateItem({ id: selectedItemId, itemData: formData })
      : createItem(formData);
    const result = await dispatch(action);

    if (!result.error) {
      handleCloseModal();
      dispatch(resetInventoryState());
    }
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      dispatch(deleteItem(id));
    }
  };

  const handleExportCsv = async () => {
    const response = await fetch('/api/inventory/export/csv', {
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory-export.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Stock':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
      case 'Low Stock':
        return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
      case 'Out of Stock':
        return 'border-red-500/20 bg-red-500/10 text-red-300';
      default:
        return 'border-slate-500/20 bg-slate-500/10 text-slate-400';
    }
  };

  const formatCurrency = (amount) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`;
  const canModify = user?.role === 'Admin' || user?.role === 'Staff';
  const canDelete = user?.role === 'Admin';
  const totalItems = items.length;
  const inStockCount = items.filter((item) => item.status === 'In Stock').length;
  const lowStockCount = items.filter((item) => item.status === 'Low Stock').length;
  const outOfStockCount = items.filter((item) => item.status === 'Out of Stock').length;
  const totalValue = items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const stats = [
    {
      label: 'Tracked SKUs',
      value: totalItems,
      icon: Package,
      tone: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
    },
    {
      label: 'In stock',
      value: inStockCount,
      icon: CheckCircle,
      tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    },
    {
      label: 'Low stock',
      value: lowStockCount,
      icon: AlertTriangle,
      tone: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    },
    {
      label: 'Out of stock',
      value: outOfStockCount,
      icon: AlertTriangle,
      tone: 'border-red-500/20 bg-red-500/10 text-red-300',
    },
  ];

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-lg border border-amber-500/20 bg-slate-950 shadow-2xl shadow-slate-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.2),transparent_31%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.97),rgba(2,6,23,0.84))]" />
        <div className="relative grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
              <Layers className="h-3.5 w-3.5" />
              Inventory Control
            </p>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-slate-50 md:text-5xl">
              Brewery stock registry
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Manage raw materials, packaged products, equipment, supplier details, and reorder risk from one focused inventory workspace.
            </p>

            {canModify && (
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-4 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-950/30 transition-all hover:bg-amber-300"
                >
                  <Plus className="h-4 w-4" />
                  Add Stock Item
                </button>
                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm font-bold text-slate-100 transition-all hover:border-emerald-400/50 hover:text-emerald-200"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={handlePrintPdf}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm font-bold text-slate-100 transition-all hover:border-sky-400/50 hover:text-sky-200"
                >
                  <FileText className="h-4 w-4" />
                  Print PDF
                </button>
              </div>
            )}
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

      <section className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="glass-panel rounded-lg border border-slate-800/50 p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Stock value</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-50">{formatCurrency(totalValue)}</p>
              <p className="mt-2 text-xs text-slate-500">Calculated from current filtered stock data.</p>
            </div>
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
              <Package className="h-6 w-6" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-xs uppercase tracking-widest text-slate-500">Visible rows</p>
              <p className="mt-1 text-xl font-extrabold text-slate-100">{items.length}</p>
            </div>
            <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-xs uppercase tracking-widest text-slate-500">Filters</p>
              <p className="mt-1 text-xl font-extrabold text-slate-100">{activeFilterCount}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-lg border border-slate-800/50 p-5">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-amber-300" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Filters and search</h2>
            </div>
            {activeFilterCount > 0 && (
              <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold uppercase text-amber-300">
                {activeFilterCount} active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="h-11 w-full rounded-md border border-slate-800 bg-slate-950/60 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
                placeholder="Search item name"
              />
            </div>

            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-200 outline-none transition-all focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
            >
              <option value="">All Categories</option>
              <option value="Raw Material">Raw Materials</option>
              <option value="In-Progress">In-Progress Batches</option>
              <option value="Packaged">Packaged Beers</option>
              <option value="Equipment">Brewery Equipment</option>
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-200 outline-none transition-all focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
            >
              <option value="">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 transition-all hover:border-amber-500/30 hover:text-amber-200"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      </section>

      <section className="glass-panel overflow-hidden rounded-lg border border-slate-800/50">
        <div className="flex flex-col gap-3 border-b border-slate-800/80 bg-slate-950/40 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Inventory registry</p>
            <h2 className="text-xl font-extrabold text-slate-100">Stock items</h2>
          </div>
          {isLoading && (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing inventory
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            <p className="text-sm font-medium">Fetching inventory registry...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/40 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-4">Item</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Quantity</th>
                  <th className="px-5 py-4 text-center">Unit Price</th>
                  <th className="px-5 py-4">Supplier</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {items.map((item) => (
                  <tr key={item._id} className="bg-slate-950/10 transition-colors hover:bg-slate-900/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-800 bg-slate-950">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-extrabold text-slate-100">{item.name}</p>
                          {item.description ? (
                            <p className="mt-1 line-clamp-1 max-w-xs text-xs text-slate-500">{item.description}</p>
                          ) : (
                            <p className="mt-1 text-xs text-slate-600">No description added</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-xs font-bold text-slate-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <p className="font-extrabold text-slate-100">{item.quantity}</p>
                      <p className="text-[10px] font-semibold uppercase text-slate-500">{item.unit}</p>
                    </td>
                    <td className="px-5 py-4 text-center font-semibold text-slate-200">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-[150px] truncate text-xs font-medium text-slate-400" title={item.supplier || 'N/A'}>
                        {item.supplier || 'N/A'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canModify ? (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit item"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 bg-slate-950 text-slate-400 transition-all hover:border-amber-500/30 hover:text-amber-300"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {canDelete ? (
                              <button
                                onClick={() => handleDeleteItem(item._id)}
                                title="Delete item"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 bg-slate-950 text-slate-400 transition-all hover:border-red-500/30 hover:text-red-300"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <button
                                disabled
                                title="Only admins can delete items"
                                className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-md border border-slate-900 bg-slate-950/70 text-slate-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                            Read Only
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center py-10 text-slate-500">
            <Package className="mb-3 h-12 w-12 text-slate-700" />
            <p className="text-sm font-semibold text-slate-300">No stock items match filters</p>
            <p className="mt-1 text-xs text-slate-500">Try clearing filters or changing your search terms.</p>
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="glass-panel max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-lg border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/50 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
                  {isEditMode ? 'Update SKU' : 'New SKU'}
                </p>
                <h3 className="text-xl font-extrabold text-slate-100">
                  {isEditMode ? 'Modify stock item' : 'Add inventory item'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-400 transition-colors hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="max-h-[calc(92vh-86px)] space-y-5 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="h-11 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
                    placeholder="e.g., Citra Hops"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="h-11 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 outline-none transition-all focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Packaged">Packaged</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Supplier
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleFormChange}
                    className="h-11 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
                    placeholder="Supplier name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Quantity
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    required
                    className="h-11 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 outline-none transition-all focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Measurement Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleFormChange}
                    required
                    className="h-11 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="liters">liters</option>
                    <option value="ml">ml</option>
                    <option value="units">units</option>
                    <option value="boxes">boxes</option>
                    <option value="bottles">bottles</option>
                    <option value="cans">cans</option>
                    <option value="kegs">kegs</option>
                    <option value="packs">packs</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Price
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                    className="h-11 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Reorder Warning Level
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleFormChange}
                    required
                    className="h-11 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 text-sm text-slate-100 outline-none transition-all focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Short Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full resize-none rounded-md border border-slate-800 bg-slate-950/60 px-3 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10"
                    placeholder="Storage notes, batch details, usage, or quality notes"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Upload Product Image
                  </label>
                  <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                    <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-md border border-slate-800 bg-slate-950">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt={formData.name || 'Product'} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-slate-700" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="h-11 w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 file:mr-3 file:rounded-md file:border-0 file:bg-amber-400 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-950"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800/80 pt-5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-md border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 transition-all hover:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-950 transition-all hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isEditMode ? 'Update Stock' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
