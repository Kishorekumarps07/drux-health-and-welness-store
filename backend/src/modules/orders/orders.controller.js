const ordersService = require('./orders.service');
const asyncHandler = require('../../lib/asyncHandler');

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

module.exports = { placeOrder, getMyOrders, getById, cancel };
