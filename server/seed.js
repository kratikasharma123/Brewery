import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Inventory from './models/Inventory.js';
import Booking from './models/Booking.js';
import connectDB from './config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing collection records
    await User.deleteMany({});
    await Inventory.deleteMany({});
    await Booking.deleteMany({});

    console.log('Database cleared.');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Brewery Manager',
        email: 'admin@brewery.com',
        password: 'admin123',
        role: 'Admin',
      },
      {
        name: 'Head Brewer',
        email: 'staff@brewery.com',
        password: 'staff123',
        role: 'Staff',
      },
      {
        name: 'Beer Lover',
        email: 'customer@brewery.com',
        password: 'customer123',
        role: 'Customer',
      },
    ]);

    console.log('Seed users created successfully.');
    const adminId = users[0]._id;
    const staffId = users[1]._id;
    const customerId = users[2]._id;

    // 2. Create Inventory Items
    const inventoryItems = [
      {
        name: 'Cascade Hops',
        category: 'Raw Material',
        quantity: 120,
        unit: 'kg',
        price: 8.5,
        reorderLevel: 25,
        supplier: 'Yakima Valley Hops',
        description: 'Popular dual-purpose hop with citrus and floral characteristics.',
        lastUpdatedBy: staffId,
      },
      {
        name: 'Pilsner Malt',
        category: 'Raw Material',
        quantity: 850,
        unit: 'kg',
        price: 1.8,
        reorderLevel: 200,
        supplier: 'Weyermann Malting',
        description: 'German pilsner base malt for light lagers and ales.',
        lastUpdatedBy: staffId,
      },
      {
        name: 'SafAle US-05 Yeast',
        category: 'Raw Material',
        quantity: 5,
        unit: 'Units',
        price: 12,
        reorderLevel: 10,
        supplier: 'Fermentis',
        description: 'Dry American ale yeast producing clean, well-balanced beers.',
        lastUpdatedBy: staffId, // This will trigger 'Low Stock' since quantity <= reorderLevel
      },
      {
        name: 'IPA Batch #42 (Fermenting)',
        category: 'In-Progress',
        quantity: 1200,
        unit: 'Liters',
        price: 4,
        reorderLevel: 0,
        supplier: 'Internal',
        description: 'West Coast IPA currently dry hopping in Fermenter #3.',
        lastUpdatedBy: staffId,
      },
      {
        name: 'Hazy IPA 16oz Cans',
        category: 'Packaged',
        quantity: 240,
        unit: 'Units',
        price: 15,
        reorderLevel: 50,
        supplier: 'Internal',
        description: 'Freshly canned Hazy IPA (4-packs). Ready for distribution.',
        lastUpdatedBy: adminId,
      },
      {
        name: 'Stainless Steel Kegs (1/2 bbl)',
        category: 'Equipment',
        quantity: 80,
        unit: 'Units',
        price: 120,
        reorderLevel: 15,
        supplier: 'Kegco',
        description: 'Standard 15.5 gallon empty sanitised kegs.',
        lastUpdatedBy: adminId,
      },
      {
        name: 'Chocolate Malt',
        category: 'Raw Material',
        quantity: 0,
        unit: 'kg',
        price: 3.2,
        reorderLevel: 15,
        supplier: 'Crisp Malting',
        description: 'Roasted malt for stouts and porters.',
        lastUpdatedBy: staffId, // This will trigger 'Out of Stock' status since quantity = 0
      },
    ];

    // We save each to trigger the pre-save status hook
    for (const item of inventoryItems) {
      await new Inventory(item).save();
    }
    console.log('Seed inventory items created successfully.');

    // 3. Create Bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const bookings = [
      {
        customerName: 'Alice Johnson',
        customerEmail: 'alice@gmail.com',
        type: 'Tour',
        date: tomorrow,
        timeSlot: '2:00 PM',
        guestsCount: 4,
        status: 'Confirmed',
        notes: 'Requested a wheelchair-accessible path.',
        bookedBy: customerId,
      },
      {
        customerName: 'Bob Smith',
        customerEmail: 'bob@yahoo.com',
        type: 'Tasting',
        date: tomorrow,
        timeSlot: '4:00 PM',
        guestsCount: 2,
        status: 'Pending',
        notes: 'Prefers sour beers and IPAs.',
      },
      {
        customerName: 'Charlie Brown',
        customerEmail: 'charlie@outlook.com',
        type: 'Brewery Event',
        date: dayAfter,
        timeSlot: '6:00 PM',
        guestsCount: 8,
        status: 'Confirmed',
        notes: 'Birthday celebration tasting party.',
      },
    ];

    await Booking.insertMany(bookings);
    console.log('Seed bookings created successfully.');

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error(`Error with database seeding:`, error);
    process.exit(1);
  }
};

seedData();
