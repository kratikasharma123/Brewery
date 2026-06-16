import Booking from '../models/Booking.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';
import StaffProfile from '../models/StaffProfile.js';
import asyncHandler from '../utils/asyncHandler.js';

const monthStart = new Date();
monthStart.setDate(1);
monthStart.setHours(0, 0, 0, 0);

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const [
    inventory,
    totalBookings,
    confirmedBookings,
    activeCustomers,
    activeStaff,
    bookingStatus,
    bookingTrends,
  ] = await Promise.all([
    Inventory.find({}).select('name category quantity price reorderLevel status unit'),
    Booking.countDocuments({}),
    Booking.find({ status: 'Confirmed' }).select('guestsCount type date'),
    User.countDocuments({ role: 'Customer', isActive: true }),
    StaffProfile.countDocuments({}),
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          bookings: { $sum: 1 },
          guests: { $sum: '$guestsCount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  const inventoryValue = inventory.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const lowStockProducts = inventory.filter((item) => item.status === 'Low Stock' || item.status === 'Out of Stock');
  const totalRevenue = confirmedBookings.reduce((sum, booking) => {
    const perGuest = booking.type === 'Tour' ? 499 : booking.type === 'Brewery Event' ? 999 : 699;
    return sum + booking.guestsCount * perGuest;
  }, 0);

  res.json({
    totals: {
      totalRevenue,
      totalBookings,
      inventoryValue,
      activeCustomers,
      activeStaff,
      lowStockProducts: lowStockProducts.length,
    },
    lowStockProducts: lowStockProducts.slice(0, 10),
    bookingStatus: bookingStatus.map((item) => ({ status: item._id, count: item.count })),
    bookingTrends: bookingTrends.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      bookings: item.bookings,
      guests: item.guests,
      revenue: item.guests * 699,
    })),
    inventoryCategories: Object.values(
      inventory.reduce((acc, item) => {
        acc[item.category] ||= { category: item.category, count: 0, value: 0 };
        acc[item.category].count += 1;
        acc[item.category].value += item.quantity * item.price;
        return acc;
      }, {})
    ),
  });
});
