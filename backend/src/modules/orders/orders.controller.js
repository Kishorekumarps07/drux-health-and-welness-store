const ordersService = require('./orders.service');
const asyncHandler = require('../../lib/asyncHandler');
const prisma = require('../../lib/prisma');

const placeOrder  = asyncHandler(async (req, res) => {
  const order = await ordersService.placeOrder(req.user.id, req.body);
  res.status(201).json({ status: 'success', data: { order } });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const result = await ordersService.getMyOrders(req.user.id, req.query);
  res.json({ status: 'success', ...result });
});

const getById     = asyncHandler(async (req, res) => {
  const order = await ordersService.getById(req.user.id, req.params.id);
  res.json({ status: 'success', data: { order } });
});

const cancel      = asyncHandler(async (req, res) => {
  const order = await ordersService.cancel(req.user.id, req.params.id);
  res.json({ status: 'success', data: { order } });
});

const getVendorOrders = asyncHandler(async (req, res) => {
  // Find vendor profile for this user
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
  if (!vendor) return res.status(403).json({ status: 'error', message: 'Not a vendor' });

  const result = await ordersService.getVendorOrders(vendor.id, req.query);
  res.json({ status: 'success', ...result });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await ordersService.getAllOrders(req.query);
  res.json({ status: 'success', ...result });
});

const updateStatus = asyncHandler(async (req, res) => {
  const order = await ordersService.updateStatus(req.params.id, req.body);
  res.json({ status: 'success', data: { order } });
});

module.exports = { placeOrder, getMyOrders, getById, cancel, getVendorOrders, getAllOrders, updateStatus };
