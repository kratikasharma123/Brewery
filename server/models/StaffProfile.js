import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Leave'],
      default: 'Present',
    },
    checkIn: {
      type: String,
      trim: true,
      default: '',
    },
    checkOut: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

const staffProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      enum: ['Production', 'Taproom', 'Warehouse', 'Sales', 'Administration'],
      default: 'Taproom',
      index: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    shift: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'General'],
      default: 'General',
      index: true,
    },
    salary: {
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
      currency: {
        type: String,
        trim: true,
        uppercase: true,
        default: 'USD',
      },
      payCycle: {
        type: String,
        enum: ['Hourly', 'Weekly', 'Monthly'],
        default: 'Monthly',
      },
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        default: '',
      },
      phone: {
        type: String,
        trim: true,
        default: '',
      },
    },
    attendance: [attendanceSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  { timestamps: true }
);

staffProfileSchema.index({ employeeCode: 1, department: 1, shift: 1 });

const StaffProfile = mongoose.model('StaffProfile', staffProfileSchema);
export default StaffProfile;
