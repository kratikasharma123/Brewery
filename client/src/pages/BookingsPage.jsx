import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchBookings, 
  createBooking, 
  updateBooking, 
  deleteBooking 
} from '../features/bookings/bookingSlice';
import { 
  CalendarDays, Plus, Filter, Clock, Users, User, Mail, 
  Check, X, Trash2, Calendar, Loader2, Info, RefreshCw
} from 'lucide-react';
import { EMAIL_PATTERN, EMAIL_VALIDATION_MESSAGE } from '../utils/emailValidation';
import { NAME_PATTERN, NAME_VALIDATION_MESSAGE, sanitizeNameInput } from '../utils/nameValidation';
import { sanitizeDigitsInput } from '../utils/numberValidation';

const BookingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { bookings, isLoading, isError, message } = useSelector(
    (state) => state.booking
  );

  // Filters State
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    date: '',
  });
  const [viewMode, setViewMode] = useState('cards');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    type: 'Tasting',
    date: '',
    timeSlot: '2:00 PM',
    guestsCount: 2,
    notes: '',
  });

  // Fetch bookings
  useEffect(() => {
    dispatch(fetchBookings(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      type: '',
      date: '',
    });
  };

  const handleOpenAddModal = () => {
    setFormData({
      customerName: user?.role === 'Customer' ? user.name : '',
      customerEmail: user?.role === 'Customer' ? user.email : '',
      type: 'Tasting',
      date: '',
      timeSlot: '2:00 PM',
      guestsCount: 2,
      notes: '',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleFormChange = (e) => {
    const value = e.target.name === 'customerName'
      ? sanitizeNameInput(e.target.value)
      : e.target.name === 'guestsCount'
        ? Number(sanitizeDigitsInput(e.target.value))
        : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(createBooking(formData));
    if (createBooking.fulfilled.match(resultAction)) {
      setModalOpen(false);
      setFormData({
        customerName: user?.role === 'Customer' ? user.name : '',
        customerEmail: user?.role === 'Customer' ? user.email : '',
        type: 'Tasting',
        date: '',
        timeSlot: '2:00 PM',
        guestsCount: 2,
        notes: '',
      });
    }
  };

  // Status updates (Confirm/Cancel) by Staff/Admin
  const handleUpdateStatus = (id, newStatus) => {
    dispatch(updateBooking({ id, bookingData: { status: newStatus } }));
  };

  const handleDeleteBooking = (id) => {
    if (window.confirm('Are you sure you want to remove this booking permanently?')) {
      dispatch(deleteBooking(id));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Pending':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Cancelled':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const isStaffOrAdmin = user?.role === 'Admin' || user?.role === 'Staff';
  const calendarDays = useMemo(() => {
    const base = filters.date ? new Date(filters.date) : new Date();
    const year = base.getFullYear();
    const month = base.getMonth();
    const first = new Date(year, month, 1);
    const days = [];
    for (let i = 0; i < first.getDay(); i += 1) days.push(null);
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day += 1) {
      const dateKey = new Date(year, month, day).toISOString().slice(0, 10);
      days.push({
        day,
        dateKey,
        bookings: bookings.filter((booking) => new Date(booking.date).toISOString().slice(0, 10) === dateKey),
      });
    }
    return days;
  }, [bookings, filters.date]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Brewery Bookings
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isStaffOrAdmin 
              ? 'Review and manage visitor tasting sessions, tours, and public events.' 
              : 'Book and manage your tasting reservations and tours.'}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-500/5 hover:shadow-amber-500/15"
        >
          <Plus className="h-5 w-5" />
          <span>Reserve a Session</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setViewMode('cards')} className={`rounded-lg px-3 py-2 text-xs font-bold ${viewMode === 'cards' ? 'bg-amber-500 text-slate-950' : 'border border-slate-800 text-slate-300'}`}>Cards</button>
        <button onClick={() => setViewMode('calendar')} className={`rounded-lg px-3 py-2 text-xs font-bold ${viewMode === 'calendar' ? 'bg-amber-500 text-slate-950' : 'border border-slate-800 text-slate-300'}`}>Calendar</button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/50 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-2">
          <Filter className="h-4.5 w-4.5 text-amber-500" />
          <h3 className="text-sm font-bold tracking-wider uppercase text-slate-300">Filter Reservations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Picker */}
          <div className="relative">
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-xs text-slate-200"
            />
          </div>

          {/* Type Filter */}
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="py-2.5 px-3 rounded-xl glass-input text-xs appearance-none"
          >
            <option value="">All Event Types</option>
            <option value="Tasting">Beer Tasting Sessions</option>
            <option value="Tour">Brewery Facility Tours</option>
            <option value="Brewery Event">Special Events</option>
          </select>

          {/* Status Filter */}
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="py-2.5 px-3 rounded-xl glass-input text-xs appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending Approvals</option>
            <option value="Confirmed">Confirmed Bookings</option>
            <option value="Cancelled">Cancelled Bookings</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={handleClearFilters}
            className="py-2.5 px-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80 text-slate-300 font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' && !isLoading && (
        <div className="glass-panel rounded-2xl border border-slate-800/50 p-4">
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="py-2">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div key={day?.dateKey || index} className="min-h-28 rounded-lg border border-slate-800 bg-slate-950/40 p-2 text-left">
                {day && (
                  <>
                    <p className="mb-2 text-xs font-bold text-slate-300">{day.day}</p>
                    <div className="space-y-1">
                      {day.bookings.slice(0, 3).map((booking) => (
                        <div key={booking._id} className={`truncate rounded px-2 py-1 text-[10px] font-semibold ${booking.status === 'Confirmed' ? 'bg-emerald-500/15 text-emerald-300' : booking.status === 'Pending' ? 'bg-blue-500/15 text-blue-300' : 'bg-red-500/15 text-red-300'}`}>
                          {booking.timeSlot} · {booking.customerName}
                        </div>
                      ))}
                      {day.bookings.length > 3 && <p className="text-[10px] text-slate-500">+{day.bookings.length - 3} more</p>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Card List */}
      {viewMode === 'cards' && (isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Fetching reservations...</p>
        </div>
      ) : isError ? (
        <div className="h-64 flex flex-col items-center justify-center text-red-400 gap-3">
          <Info className="h-8 w-8 text-red-400" />
          <p className="text-sm font-medium">{message || 'Unable to load reservations.'}</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div 
              key={booking._id} 
              className="glass-panel p-6 rounded-2xl border border-slate-850 hover:border-amber-500/20 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      {booking.type}
                    </span>
                    <h3 className="font-extrabold text-slate-100 text-base leading-tight">
                      {booking.customerName}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-0.5 rounded-full ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                {/* Details list */}
                <div className="space-y-2.5 text-xs text-slate-300 border-t border-b border-slate-850 py-3">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <span>{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>{booking.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-amber-500" />
                    <span>{booking.guestsCount} Guests registered</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-amber-500" />
                    <span className="truncate">{booking.customerEmail}</span>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-3 text-xs text-slate-400 italic">
                    <p className="font-semibold text-[10px] uppercase text-slate-500 not-italic tracking-wider mb-1">Customer notes:</p>
                    "{booking.notes}"
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-slate-850 flex items-center justify-between">
                <div>
                  {booking.bookedBy && booking.bookedBy.name && (
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      Booked by: {booking.bookedBy.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Approve/Confirm for Staff/Admin */}
                  {isStaffOrAdmin && booking.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                      title="Approve Booking"
                      className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}

                  {/* Cancel Booking (Both client and staff can do this if it's not already cancelled) */}
                  {booking.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                      title="Cancel Booking"
                      className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-450 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  {/* Delete (Admin can delete anything, Customer can cancel/delete theirs) */}
                  {(user?.role === 'Admin' || (user?.role === 'Customer' && booking.status === 'Cancelled')) && (
                    <button
                      onClick={() => handleDeleteBooking(booking._id)}
                      title="Remove Booking"
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 py-10">
          <CalendarDays className="h-12 w-12 text-slate-700 mb-2" />
          <p className="text-sm font-semibold">No bookings match filters</p>
          <p className="text-xs text-slate-650 mt-1">Schedule a session or change selection criteria.</p>
        </div>
      ))}

      {/* Reservation Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel rounded-2xl shadow-2xl overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/30">
              <h3 className="font-bold text-lg text-slate-200">
                Book a Brewery Session
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Contact Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleFormChange}
                      required
                      pattern={NAME_PATTERN}
                      title={NAME_VALIDATION_MESSAGE}
                      autoComplete="name"
                      disabled={user?.role === 'Customer'}
                      className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Enter contact name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleFormChange}
                      required
                      pattern={EMAIL_PATTERN}
                      title={EMAIL_VALIDATION_MESSAGE}
                      autoComplete="email"
                      disabled={user?.role === 'Customer'}
                      className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="e.g. name@host.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Reservation Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs appearance-none"
                  >
                    <option value="Tasting">Beer Tasting Session</option>
                    <option value="Tour">Brewery Facility Tour</option>
                    <option value="Brewery Event">Special Event</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Time Slot
                  </label>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs appearance-none"
                  >
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="6:00 PM">6:00 PM</option>
                    <option value="8:00 PM">8:00 PM</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Session Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Guests Count
                  </label>
                  <input
                    type="number"
                    name="guestsCount"
                    min="1"
                    value={formData.guestsCount}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Special Notes / Requests
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows="2.5"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                    placeholder="Dietary requests, accessibility, celebrations..."
                  ></textarea>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/30 text-slate-300 font-semibold text-xs tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 text-xs tracking-wider"
                >
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin text-slate-950" />}
                  <span>Book Reservation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
