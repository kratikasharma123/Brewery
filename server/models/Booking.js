import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Please add a customer name'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Please add a customer email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    type: {
      type: String,
      required: [true, 'Please add a booking type'],
      enum: ['Tour', 'Tasting', 'Brewery Event'],
      default: 'Tasting',
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
      index: true,
    },
    timeSlot: {
      type: String,
      required: [true, 'Please add a time slot'],
      enum: ['12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'],
    },
    guestsCount: {
      type: Number,
      required: [true, 'Please add the number of guests'],
      min: [1, 'Must have at least 1 guest'],
      max: [60, 'A booking cannot exceed 60 guests'],
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1'],
      default: 30,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    internalNotes: {
      type: String,
      trim: true,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    notificationLog: [
      {
        type: {
          type: String,
          enum: ['created', 'approved', 'rejected', 'cancelled'],
          required: true,
        },
        sentTo: {
          type: String,
          required: true,
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ date: 1, timeSlot: 1, status: 1 });
bookingSchema.index({ customerEmail: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
