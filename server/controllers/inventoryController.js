import Inventory from '../models/Inventory.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cleanString, requireFields, validateEnum, validateNumber } from '../utils/validators.js';
import { writeAuditLog } from '../utils/audit.js';

const CATEGORIES = ['Raw Material', 'In-Progress', 'Packaged', 'Equipment', 'Merchandise'];
const STATUSES = ['In Stock', 'Low Stock', 'Out of Stock'];

// @desc    Get all inventory items (with optional filters)
// @route   GET /api/inventory
// @access  Private
export const getInventory = asyncHandler(async (req, res) => {
    const { category, status, search, barcode } = req.query;
    let query = {};

    // Filter by category
    if (category) {
      validateEnum(category, 'category', CATEGORIES);
      query.category = category;
    }

    // Filter by status
    if (status) {
      validateEnum(status, 'status', STATUSES);
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    if (barcode) {
      query.barcode = cleanString(barcode);
    }


    const items = await Inventory.find(query)
      .populate('lastUpdatedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json(items);
});

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
export const getInventoryById = asyncHandler(async (req, res) => {
    const item = await Inventory.findById(req.params.id).populate('lastUpdatedBy', 'name email');

    if (!item) {
      res.status(404);
      throw new Error('Inventory item not found');
    }

    res.json(item);
});

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private (Admin & Staff)
export const createInventoryItem = asyncHandler(async (req, res) => {
    requireFields(req.body, ['name', 'category', 'quantity', 'unit', 'price']);
    const { name, category, supplier, description, imageUrl, barcode } = req.body;
    validateEnum(category, 'category', CATEGORIES);

    const item = new Inventory({
      name: cleanString(name),
      category,
      quantity: validateNumber(req.body.quantity, 'quantity', { min: 0 }),
      unit: cleanString(req.body.unit),
      price: validateNumber(req.body.price, 'price', { min: 0 }),
      reorderLevel: validateNumber(req.body.reorderLevel ?? 10, 'reorderLevel', { min: 0 }),
      supplier: cleanString(supplier) || 'General Supplier',
      description: cleanString(description),
      imageUrl: cleanString(imageUrl),
      barcode: cleanString(barcode) || undefined,
      lastUpdatedBy: req.user._id,
    });

    const createdItem = await item.save();
    await writeAuditLog({ req, action: 'inventory.created', entity: 'Inventory', entityId: createdItem._id });
    res.status(201).json(createdItem);
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Admin & Staff)
export const updateInventoryItem = asyncHandler(async (req, res) => {
    const { name, category, unit, supplier, description, imageUrl, barcode } = req.body;

    const item = await Inventory.findById(req.params.id);

    if (!item) {
      res.status(404);
      throw new Error('Inventory item not found');
    }

    // Update fields if provided
    if (name !== undefined) item.name = cleanString(name);
    if (category !== undefined) {
      validateEnum(category, 'category', CATEGORIES);
      item.category = category;
    }
    if (req.body.quantity !== undefined) item.quantity = validateNumber(req.body.quantity, 'quantity', { min: 0 });
    if (unit !== undefined) item.unit = cleanString(unit);
    if (req.body.price !== undefined) item.price = validateNumber(req.body.price, 'price', { min: 0 });
    if (req.body.reorderLevel !== undefined) item.reorderLevel = validateNumber(req.body.reorderLevel, 'reorderLevel', { min: 0 });
    if (supplier !== undefined) item.supplier = cleanString(supplier);
    if (description !== undefined) item.description = cleanString(description);
    if (imageUrl !== undefined) item.imageUrl = cleanString(imageUrl);
    if (barcode !== undefined) item.barcode = cleanString(barcode) || undefined;
    
    item.lastUpdatedBy = req.user._id;

    // Recalculating status in pre-save hook will trigger automatically on save()
    const updatedItem = await item.save();
    await writeAuditLog({ req, action: 'inventory.updated', entity: 'Inventory', entityId: updatedItem._id });
    res.json(updatedItem);
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin only)
export const deleteInventoryItem = asyncHandler(async (req, res) => {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      res.status(404);
      throw new Error('Inventory item not found');
    }

    await item.deleteOne();
    await writeAuditLog({ req, action: 'inventory.deleted', entity: 'Inventory', entityId: item._id });
    res.json({ message: 'Inventory item removed' });
});

export const getInventoryAnalytics = asyncHandler(async (req, res) => {
  const items = await Inventory.find({}).select('category quantity price status reorderLevel unit name');
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const lowStock = items.filter((item) => item.status === 'Low Stock' || item.status === 'Out of Stock');
  const categories = Object.values(items.reduce((acc, item) => {
    acc[item.category] ||= { category: item.category, count: 0, value: 0, quantity: 0 };
    acc[item.category].count += 1;
    acc[item.category].value += item.quantity * item.price;
    acc[item.category].quantity += item.quantity;
    return acc;
  }, {}));

  res.json({ totalValue, lowStockCount: lowStock.length, categories, lowStock });
});

export const exportInventoryCsv = asyncHandler(async (req, res) => {
  const items = await Inventory.find({}).sort({ name: 1 });
  const header = ['Name', 'Category', 'Quantity', 'Unit', 'Price', 'Value', 'Reorder Level', 'Status', 'Supplier', 'Barcode'];
  const rows = items.map((item) => [
    item.name,
    item.category,
    item.quantity,
    item.unit,
    item.price,
    item.quantity * item.price,
    item.reorderLevel,
    item.status,
    item.supplier,
    item.barcode || '',
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory-export.csv"');
  res.send(csv);
});
