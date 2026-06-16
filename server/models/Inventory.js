import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add the item name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['Raw Material', 'In-Progress', 'Packaged', 'Equipment', 'Merchandise'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please add the quantity'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Please add the unit of measurement (e.g., kg, Liters, Units)'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price for the item'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    barcode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Please add a reorder warning level'],
      min: [0, 'Reorder level cannot be negative'],
      default: 10,
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
      index: true,
    },
    supplier: {
      type: String,
      trim: true,
      default: 'General Supplier',
    },
    description: {
      type: String,
      trim: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ name: 'text', supplier: 'text', barcode: 'text' });
inventorySchema.index({ category: 1, status: 1 });

// Pre-save hook to calculate status based on quantity and reorderLevel
inventorySchema.pre('save', function () {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.reorderLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
});

// Also trigger on findOneAndUpdate
inventorySchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update.quantity !== undefined || update.reorderLevel !== undefined) {
    // Note: Recalculating status in the controller is standard, but if we do updates here, we can set status:
    const qty = update.quantity;
    const reorder = update.reorderLevel;
    if (qty !== undefined) {
      if (qty === 0) {
        update.status = 'Out of Stock';
      } else if (reorder !== undefined && qty <= reorder) {
        update.status = 'Low Stock';
      } else {
        update.status = 'In Stock';
      }
    }
  }
});

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
