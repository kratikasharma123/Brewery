import Booking from '../models/Booking.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cleanString, isEmail, isPersonName, requireFields, validateEnum, validateNumber } from '../utils/validators.js';
import { writeAuditLog } from '../utils/audit.js';

const TYPES = ['Tour', 'Tasting', 'Brewery Event'];
const STATUSES = ['Pending', 'Confirmed', 'Rejected', 'Cancelled'];
const TIME_SLOTS = ['12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'];
const DEFAULT_CAPACITY = 30;

const getDayRange = (date) => {
  const parsed = new Date(date);
  const start = new Date(parsed);
  start.setHours(0, 0, 0, 0);
  const end = new Date(parsed);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const validateBookingCapacity = async ({ date, timeSlot, guestsCount, capacity = DEFAULT_CAPACITY, excludeId }) => {
  const { start, end } = getDayRange(date);
  const query = {
    date: { $gte: start, $lte: end },
    timeSlot,
    status: { $in: ['Pending', 'Confirmed'] },
  };

  if (excludeId) query._id = { $ne: excludeId };

  const existing = await Booking.aggregate([
    { $match: query },
    { $group: { _id: null, guests: { $sum: '$guestsCount' } } },
  ]);

  const reservedGuests = existing[0]?.guests || 0;
  if (reservedGuests + guestsCount > capacity) {
    const error = new Error(`Capacity exceeded. ${Math.max(capacity - reservedGuests, 0)} seat(s) remain for this slot.`);
    error.statusCode = 409;
    throw error;
  }
};

// @desc    Get all bookings (with optional filters)
// @route   GET /api/bookings
// @access  Private
export const getBookings = asyncHandler(async (req, res) => {
    const { status, type, date, calendarMonth } = req.query;
    let query = {};

    // Filter by status
    if (status) {
      validateEnum(status, 'status', STATUSES);
      query.status = status;
    }

    // Filter by type
    if (type) {
      validateEnum(type, 'type', TYPES);
      query.type = type;
    }

    // Filter by specific date (year-month-day)
    if (date) {
      const { start, end } = getDayRange(date);
      query.date = { $gte: start, $lte: end };
    } else if (calendarMonth) {
      const [year, month] = calendarMonth.split('-').map(Number);
      query.date = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      };
    }

    // Customer role can only see their own bookings
    if (req.user && req.user.role === 'Customer') {
      query.bookedBy = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('bookedBy', 'name email')
      .sort({ date: 1, timeSlot: 1 });

    res.json(bookings);
});

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('bookedBy', 'name email');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Verify ownership for Customers
    if (
      req.user.role === 'Customer' &&
      booking.bookedBy &&
      booking.bookedBy._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to view this booking');
    }

    res.json(booking);
});

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
    requireFields(req.body, ['customerName', 'customerEmail', 'type', 'date', 'timeSlot', 'guestsCount']);
    const { customerName, customerEmail, type, date, timeSlot, notes } = req.body;
    validateEnum(type, 'type', TYPES);
    validateEnum(timeSlot, 'timeSlot', TIME_SLOTS);
    if (!isEmail(customerEmail)) {
      res.status(400);
      throw new Error('Please provide a valid customer email');
    }

    if (!isPersonName(customerName)) {
      res.status(400);
      throw new Error('Customer name can contain letters and spaces only');
    }

    const guestsCount = validateNumber(req.body.guestsCount, 'guestsCount', { min: 1, max: 60 });
    const capacity = validateNumber(req.body.capacity ?? DEFAULT_CAPACITY, 'capacity', { min: 1, max: 200 });
    await validateBookingCapacity({ date, timeSlot, guestsCount, capacity });

    const booking = new Booking({
      customerName: cleanString(customerName),
      customerEmail: cleanString(customerEmail).toLowerCase(),
      type,
      date,
      timeSlot,
      guestsCount,
      capacity,
      notes: cleanString(notes),
      bookedBy: req.user?._id, // Attach current user's ID if logged in
      notificationLog: [{ type: 'created', sentTo: cleanString(customerEmail).toLowerCase() }],
    });

    const createdBooking = await booking.save();
    await writeAuditLog({ req, action: 'booking.created', entity: 'Booking', entityId: createdBooking._id });
    res.status(201).json(createdBooking);
});

// @desc    Update a booking (status, date, details)
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = asyncHandler(async (req, res) => {
    const { customerName, customerEmail, type, date, timeSlot, status, notes, internalNotes } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Customers can only edit their own bookings and can't change booking status to Confirmed directly
    if (req.user.role === 'Customer') {
      if (booking.bookedBy && booking.bookedBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to edit this booking');
      }
      
      // Prevent customer from manually confirming their own booking
      if (status && ['Confirmed', 'Rejected'].includes(status) && booking.status !== status) {
        res.status(403);
        throw new Error('Customers cannot approve or reject bookings');
      }
    }

    if (type !== undefined) validateEnum(type, 'type', TYPES);
    if (timeSlot !== undefined) validateEnum(timeSlot, 'timeSlot', TIME_SLOTS);
    if (status !== undefined) validateEnum(status, 'status', STATUSES);
    if (customerEmail !== undefined && !isEmail(customerEmail)) {
      res.status(400);
      throw new Error('Please provide a valid customer email');
    }
    if (customerName !== undefined && !isPersonName(customerName)) {
      res.status(400);
      throw new Error('Customer name can contain letters and spaces only');
    }

    const nextDate = date ?? booking.date;
    const nextTimeSlot = timeSlot ?? booking.timeSlot;
    const nextGuestsCount = req.body.guestsCount !== undefined
      ? validateNumber(req.body.guestsCount, 'guestsCount', { min: 1, max: 60 })
      : booking.guestsCount;
    const nextCapacity = req.body.capacity !== undefined
      ? validateNumber(req.body.capacity, 'capacity', { min: 1, max: 200 })
      : booking.capacity;

    await validateBookingCapacity({
      date: nextDate,
      timeSlot: nextTimeSlot,
      guestsCount: nextGuestsCount,
      capacity: nextCapacity,
      excludeId: booking._id,
    });

    // Update details
    if (customerName !== undefined) booking.customerName = cleanString(customerName);
    if (customerEmail !== undefined) booking.customerEmail = cleanString(customerEmail).toLowerCase();
    if (type !== undefined) booking.type = type;
    if (date !== undefined) booking.date = date;
    if (timeSlot !== undefined) booking.timeSlot = timeSlot;
    if (req.body.guestsCount !== undefined) booking.guestsCount = nextGuestsCount;
    if (req.body.capacity !== undefined) booking.capacity = nextCapacity;
    if (status !== undefined) {
      booking.status = status;
      if (['Confirmed', 'Rejected'].includes(status)) {
        booking.approvedBy = req.user._id;
        booking.approvedAt = new Date();
        booking.notificationLog.push({
          type: status === 'Confirmed' ? 'approved' : 'rejected',
          sentTo: booking.customerEmail,
        });
      }
      if (status === 'Cancelled') {
        booking.notificationLog.push({ type: 'cancelled', sentTo: booking.customerEmail });
      }
    }
    if (notes !== undefined) booking.notes = cleanString(notes);
    if (internalNotes !== undefined && req.user.role !== 'Customer') booking.internalNotes = cleanString(internalNotes);

    const updatedBooking = await booking.save();
    await writeAuditLog({ req, action: 'booking.updated', entity: 'Booking', entityId: updatedBooking._id, metadata: { status } });
    res.json(updatedBooking);
});

// @desc    Cancel or delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
export const deleteBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Staff and Admin can delete. Customers can only delete (cancel) their own
    if (
      req.user.role === 'Customer' &&
      booking.bookedBy &&
      booking.bookedBy.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to remove this booking');
    }

    await booking.deleteOne();
    await writeAuditLog({ req, action: 'booking.deleted', entity: 'Booking', entityId: booking._id });
    res.json({ message: 'Booking removed successfully' });
});
