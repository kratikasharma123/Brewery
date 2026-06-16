import Inventory from '../models/Inventory.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cleanString, isPersonName, requireFields, validateEnum, validateNumber } from '../utils/validators.js';

export const createOrder = asyncHandler(async (req, res) => {
  requireFields(req.body, ['items', 'paymentMethod', 'deliveryDetails']);
  validateEnum(req.body.paymentMethod, 'paymentMethod', ['COD']);

  if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
    res.status(400);
    throw new Error('Order must include at least one item');
  }

  const deliveryDetails = req.body.deliveryDetails || {};
  requireFields(deliveryDetails, ['fullName', 'phone', 'addressLine1', 'city', 'state', 'postalCode']);

  const cleanDeliveryDetails = {
    fullName: cleanString(deliveryDetails.fullName),
    phone: cleanString(deliveryDetails.phone),
    addressLine1: cleanString(deliveryDetails.addressLine1),
    addressLine2: cleanString(deliveryDetails.addressLine2),
    city: cleanString(deliveryDetails.city),
    state: cleanString(deliveryDetails.state),
    postalCode: cleanString(deliveryDetails.postalCode),
    notes: cleanString(deliveryDetails.notes),
  };

  if (!/^[0-9]{7,15}$/.test(cleanDeliveryDetails.phone)) {
    res.status(400);
    throw new Error('Please provide numbers only for delivery phone');
  }

  if (!/^[0-9]{4,10}$/.test(cleanDeliveryDetails.postalCode)) {
    res.status(400);
    throw new Error('Please provide numbers only for postal code');
  }

  if (!isPersonName(cleanDeliveryDetails.fullName)) {
    res.status(400);
    throw new Error('Full name can contain letters and spaces only');
  }

  const requestedItemMap = new Map();
  req.body.items.forEach((item) => {
    const inventoryItem = item.inventoryItem || item._id;
    const quantity = validateNumber(item.quantity ?? item.cartQty, 'quantity', { min: 1 });
    requestedItemMap.set(String(inventoryItem), (requestedItemMap.get(String(inventoryItem)) || 0) + quantity);
  });

  const requestedItems = Array.from(requestedItemMap, ([inventoryItem, quantity]) => ({
    inventoryItem,
    quantity,
  }));

  const inventoryIds = requestedItems.map((item) => item.inventoryItem);
  const inventoryItems = await Inventory.find({ _id: { $in: inventoryIds } });
  const inventoryById = new Map(inventoryItems.map((item) => [item._id.toString(), item]));

  const orderItems = [];
  for (const requestedItem of requestedItems) {
    const inventoryItem = inventoryById.get(String(requestedItem.inventoryItem));
    if (!inventoryItem) {
      res.status(404);
      throw new Error('One or more cart items are no longer available');
    }

    if (inventoryItem.status === 'Out of Stock' || inventoryItem.quantity < requestedItem.quantity) {
      res.status(400);
      throw new Error(`${inventoryItem.name} does not have enough stock`);
    }

    const lineTotal = Number((requestedItem.quantity * inventoryItem.price).toFixed(2));
    orderItems.push({
      inventoryItem: inventoryItem._id,
      name: inventoryItem.name,
      quantity: requestedItem.quantity,
      unit: inventoryItem.unit,
      imageUrl: inventoryItem.imageUrl,
      price: inventoryItem.price,
      lineTotal,
    });
  }

  const subtotal = Number(orderItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const order = await Order.create({
    customer: req.user._id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    items: orderItems,
    deliveryDetails: cleanDeliveryDetails,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'Placed',
    subtotal,
    total: subtotal,
  });

  for (const orderItem of orderItems) {
    const inventoryItem = inventoryById.get(orderItem.inventoryItem.toString());
    inventoryItem.quantity -= orderItem.quantity;
    inventoryItem.lastUpdatedBy = req.user._id;
    await inventoryItem.save();
  }

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const query = req.user.role === 'Customer' ? { customer: req.user._id } : {};
  const orders = await Order.find(query)
    .populate('customer', 'name email role')
    .sort({ createdAt: -1 });

  res.json(orders);
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isOwner = order.customer.toString() === req.user._id.toString();
  const canManageOrders = req.user.role === 'Admin' || req.user.role === 'Staff';

  if (!isOwner && !canManageOrders) {
    res.status(403);
    throw new Error('You are not allowed to cancel this order');
  }

  if (order.orderStatus === 'Cancelled') {
    res.status(400);
    throw new Error('Order is already cancelled');
  }

  if (order.orderStatus === 'Delivered') {
    res.status(400);
    throw new Error('Delivered orders cannot be cancelled');
  }

  for (const orderItem of order.items) {
    const inventoryItem = await Inventory.findById(orderItem.inventoryItem);
    if (inventoryItem) {
      inventoryItem.quantity += orderItem.quantity;
      inventoryItem.lastUpdatedBy = req.user._id;
      await inventoryItem.save();
    }
  }

  order.orderStatus = 'Cancelled';
  order.paymentStatus = order.paymentMethod === 'COD' ? 'Pending' : order.paymentStatus;
  await order.save();

  res.json(order);
});
